import { Router, Request, Response } from 'express';
import store from '../data/store';

const router = Router();

router.post('/verify', (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  if (!code) return res.status(400).json({ code: 1, message: '请输入取货码或订单号' });
  const trimmed = code.trim();
  const order = store.orders.find(o =>
    o.pickupCode === trimmed || o.orderNo.toLowerCase() === trimmed.toLowerCase()
  );
  if (!order) return res.status(404).json({ code: 1, message: '未找到该订单，请检查取货码' });
  if (order.status === 'picked') {
    return res.json({ code: 2, data: order, message: `该订单已于 ${new Date(order.pickedAt!).toLocaleString('zh-CN')} 核销完成，请勿重复取货` });
  }
  if (order.status === 'pending' || order.status === 'sorted') {
    order.status = 'picked';
    order.pickedAt = new Date().toISOString();
    store.verifications.unshift({
      id: store.genId('vr'),
      orderId: order.id,
      orderNo: order.orderNo,
      memberName: order.memberName,
      pickupCode: order.pickupCode,
      verifiedAt: order.pickedAt,
    });
    return res.json({ code: 0, data: order, message: '核销成功，团员已取货' });
  }
  if (order.status === 'refunded') {
    return res.status(400).json({ code: 1, message: '该订单已退款，无法核销' });
  }
  return res.status(400).json({ code: 1, message: '订单状态异常' });
});

router.get('/records', (req: Request, res: Response) => {
  const { date } = req.query as { date?: string };
  let list = [...store.verifications];
  if (date) {
    list = list.filter(v => {
      const d = new Date(v.verifiedAt);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return ymd === date;
    });
  }
  list.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
  res.json({ code: 0, data: list });
});

export default router;
