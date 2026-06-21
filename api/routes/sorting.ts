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

router.get('/:id', (req: Request, res: Response) => {
  const g = store.sortingGroups.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ code: 1, message: '分拣单不存在' });
  const members: MemberSorting[] = store.orders
    .filter(o => g.orderIds.includes(o.id))
    .map(o => ({
      orderId: o.id,
      memberName: o.memberName,
      memberPhone: o.memberPhone,
      pickupCode: o.pickupCode,
      items: o.items,
      totalAmount: o.totalAmount,
      isSorted: o.status === 'sorted' || o.status === 'picked',
    }));
  members.sort((a, b) => a.memberName.localeCompare(b.memberName, 'zh-CN'));

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
  const { orderIds, all } = req.body as { orderIds?: string[]; all?: boolean };
  const targets = all ? g.orderIds : (orderIds || []);
  for (const oid of targets) {
    const o = store.orders.find(x => x.id === oid);
    if (o && o.status === 'pending') o.status = 'sorted';
  }
  const remain = store.orders.filter(o => g.orderIds.includes(o.id) && o.status === 'pending').length;
  if (remain === 0) {
    g.status = g.status === 'pending' ? 'sorting' : g.status;
    if (all) g.status = 'done';
  } else {
    g.status = 'sorting';
  }
  res.json({ code: 0, data: { group: g, remain }, message: '标记成功' });
});

export default router;
