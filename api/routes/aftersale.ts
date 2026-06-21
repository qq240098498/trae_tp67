import { Router, Request, Response } from 'express';
import store from '../data/store';
import type { Aftersale, AftersaleType, AftersaleStatus } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { type, status, keyword } = req.query as { type?: AftersaleType; status?: AftersaleStatus; keyword?: string };
  let list = [...store.aftersales];
  if (type) list = list.filter(a => a.type === type);
  if (status) list = list.filter(a => a.status === status);
  if (keyword) list = list.filter(a => a.memberName.includes(keyword) || a.orderNo.includes(keyword) || (a.productName || '').includes(keyword));
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ code: 0, data: list });
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Aftersale> & { orderId: string; type: AftersaleType; refundAmount: number; remark: string };
  if (!body.orderId || !body.type || !body.refundAmount) {
    return res.status(400).json({ code: 1, message: '请填写完整售后信息' });
  }
  const order = store.orders.find(o => o.id === body.orderId);
  if (!order) return res.status(404).json({ code: 1, message: '关联订单不存在' });
  const as: Aftersale = {
    id: store.genId('as'),
    orderId: body.orderId,
    orderNo: order.orderNo,
    memberName: order.memberName,
    type: body.type,
    refundAmount: Number(body.refundAmount),
    remark: body.remark || '',
    productName: body.productName || order.items[0]?.productName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  store.aftersales.unshift(as);
  res.json({ code: 0, data: as, message: '售后已登记' });
});

router.get('/:id', (req: Request, res: Response) => {
  const a = store.aftersales.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ code: 1, message: '售后单不存在' });
  const order = store.orders.find(o => o.id === a.orderId);
  res.json({ code: 0, data: { aftersale: a, order } });
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const idx = store.aftersales.findIndex(x => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ code: 1, message: '售后单不存在' });
  const { status } = req.body as { status: AftersaleStatus };
  if (status) {
    store.aftersales[idx].status = status;
    if (status === 'completed') {
      const order = store.orders.find(o => o.id === store.aftersales[idx].orderId);
      if (order && order.status !== 'refunded') order.status = 'refunded';
    }
  }
  res.json({ code: 0, data: store.aftersales[idx], message: '状态已更新' });
});

export default router;
