import { Router, Request, Response } from 'express';
import store from '../data/store';
import type { OrderStatus, ProductStats, MemberStats, Order } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { productId, groupId, status, keyword } = req.query as { productId?: string; groupId?: string; status?: OrderStatus; keyword?: string };
  let list = [...store.orders];
  if (productId) list = list.filter(o => o.items.some(i => i.productId === productId));
  if (groupId) list = list.filter(o => o.groupId === groupId);
  if (status) list = list.filter(o => o.status === status);
  if (keyword) list = list.filter(o => o.memberName.includes(keyword) || o.orderNo.includes(keyword) || o.memberPhone.includes(keyword));
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ code: 0, data: list });
});

router.get('/stats', (req: Request, res: Response) => {
  const orders = store.orders;
  const byProductMap = new Map<string, any>();
  const byMemberMap = new Map<string, any>();

  for (const o of orders) {
    for (const item of o.items) {
      const existing = byProductMap.get(item.productId) || {
        productId: item.productId,
        productName: item.productName,
        spec: item.spec,
        memberCount: 0,
        quantity: 0,
        amount: 0,
        _members: new Set<string>(),
      } as any;
      existing._members.add(o.memberName + o.memberPhone);
      existing.memberCount = existing._members.size;
      existing.quantity += item.quantity;
      existing.amount = +(existing.amount + item.subtotal).toFixed(2);
      byProductMap.set(item.productId, existing);
    }
    const key = o.memberName + o.memberPhone;
    const m = byMemberMap.get(key) || {
      memberName: o.memberName,
      memberPhone: o.memberPhone,
      orderCount: 0,
      quantity: 0,
      amount: 0,
    };
    m.orderCount += 1;
    m.quantity += o.totalQuantity;
    m.amount = +(m.amount + o.totalAmount).toFixed(2);
    byMemberMap.set(key, m);
  }

  const byProduct = Array.from(byProductMap.values()).map(({ _members, ...rest }) => rest) as ProductStats[];
  const byMember = Array.from(byMemberMap.values());
  const totalAmount = +byProduct.reduce((s, p) => s + p.amount, 0).toFixed(2);
  const totalQuantity = byProduct.reduce((s, p) => s + p.quantity, 0);
  const totalMembers = byMember.length;
  const totalOrders = orders.length;

  res.json({
    code: 0,
    data: {
      summary: { totalOrders, totalMembers, totalQuantity, totalAmount },
      byProduct,
      byMember,
    },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const o = store.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ code: 1, message: '订单不存在' });
  res.json({ code: 0, data: o });
});

export default router;
