import { Router, Request, Response } from 'express';
import store from '../data/store';
import type { MemberSorting, SortingStatus } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query as { status?: SortingStatus };
  let list = [...store.sortingGroups];
  if (status) list = list.filter(g => g.status === status);
  list.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
  res.json({ code: 0, data: list });
});

const parseBuildingNum = (b: string) => {
  const m = b.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 999;
};
const parseRoomNum = (r: string) => {
  const n = parseInt(r, 10);
  return isNaN(n) ? 9999 : n;
};

router.get('/:id', (req: Request, res: Response) => {
  const g = store.sortingGroups.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ code: 1, message: '分拣单不存在' });
  const members: MemberSorting[] = store.orders
    .filter(o => g.orderIds.includes(o.id))
    .map(o => ({
      orderId: o.id,
      memberName: o.memberName,
      memberPhone: o.memberPhone,
      building: o.building,
      roomNumber: o.roomNumber,
      pickupCode: o.pickupCode,
      items: o.items,
      totalAmount: o.totalAmount,
      isSorted: o.status === 'sorted' || o.status === 'picked',
    }));
  members.sort((a, b) => {
    const bd = parseBuildingNum(a.building) - parseBuildingNum(b.building);
    if (bd !== 0) return bd;
    return parseRoomNum(a.roomNumber) - parseRoomNum(b.roomNumber);
  });

  const productAgg = new Map<string, { productName: string; spec: string; quantity: number }>();
  for (const m of members) {
    for (const i of m.items) {
      const key = i.productId;
      const e = productAgg.get(key) || { productName: i.productName, spec: i.spec, quantity: 0 };
      e.quantity += i.quantity;
      productAgg.set(key, e);
    }
  }

  res.json({
    code: 0,
    data: {
      group: g,
      members,
      productAgg: Array.from(productAgg.values()),
    },
  });
});

router.patch('/:id/mark', (req: Request, res: Response) => {
  const g = store.sortingGroups.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ code: 1, message: '分拣单不存在' });
  if (g.status === 'done') {
    return res.json({ code: 0, data: { group: g, remain: 0 }, message: '该分拣单已完成，无需重复操作' });
  }
  const { orderIds, all } = req.body as { orderIds?: string[]; all?: boolean };
  const targets = all ? g.orderIds : (orderIds || []);
  let changed = 0;
  for (const oid of targets) {
    const o = store.orders.find(x => x.id === oid);
    if (o && o.status === 'pending') {
      o.status = 'sorted';
      changed++;
    }
  }
  const remain = store.orders.filter(o => g.orderIds.includes(o.id) && o.status === 'pending').length;
  if (remain === 0) {
    g.status = g.status === 'pending' ? 'sorting' : g.status;
    if (all || remain === 0) g.status = 'done';
  } else {
    g.status = 'sorting';
  }
  res.json({
    code: 0,
    data: { group: g, remain },
    message: changed === 0 ? '没有需要更新的订单' : (g.status === 'done' ? '分拣已全部完成' : '标记成功'),
  });
});

export default router;
