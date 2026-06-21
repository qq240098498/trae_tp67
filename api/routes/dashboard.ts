import { Router, Request, Response } from 'express';
import store from '../data/store';

const router = Router();

router.get('/stats', (req: Request, res: Response) => {
  const products = store.products;
  const orders = store.orders;
  const sortingGroups = store.sortingGroups;
  const aftersales = store.aftersales;

  const today = new Date();
  const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const todayStr = ymd(today);

  const ongoingGroups = products.filter(p => p.status === 'ongoing').length;
  const pendingPickup = orders.filter(o => (o.status === 'sorted')).length;
  const pendingSorting = sortingGroups.filter(g => g.status !== 'done').reduce((s, g) => {
    const n = store.orders.filter(o => g.orderIds.includes(o.id) && o.status === 'pending').length;
    return s + n;
  }, 0);
  const pendingAftersale = aftersales.filter(a => a.status === 'pending').length;

  const todayOrders = orders.filter(o => ymd(new Date(o.createdAt)) === todayStr);
  const todayAmount = +todayOrders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2);

  const weekTrend: { date: string; orders: number; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = ymd(d);
    const list = orders.filter(o => ymd(new Date(o.createdAt)) === ds);
    weekTrend.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      orders: list.length,
      amount: +list.reduce((s, o) => s + o.totalAmount, 0).toFixed(2),
    });
  }

  const todos: { type: string; content: string; time?: string }[] = [];
  if (pendingAftersale > 0) todos.push({ type: 'aftersale', content: `有 ${pendingAftersale} 条售后待处理` });
  if (pendingSorting > 0) todos.push({ type: 'sorting', content: `有 ${pendingSorting} 个订单待分拣` });
  if (pendingPickup > 0) todos.push({ type: 'pickup', content: `有 ${pendingPickup} 个订单待取货` });
  const closingSoon = products.filter(p => p.status === 'ongoing').filter(p => {
    const diff = (new Date(p.deadline).getTime() - Date.now()) / 3600000;
    return diff > 0 && diff < 24;
  });
  if (closingSoon.length > 0) {
    todos.push({ type: 'deadline', content: `${closingSoon.length} 个团品将在24小时内截团` });
  }
  const arrived = sortingGroups.filter(g => {
    return new Date(g.arriveDate).getTime() <= Date.now() && g.status !== 'done';
  });
  if (arrived.length > 0) {
    todos.push({ type: 'arrive', content: `${arrived.length} 个团期已到货，请通知取货` });
  }
  if (todos.length === 0) todos.push({ type: 'info', content: '暂无待办事项，开团愉快！' });

  res.json({
    code: 0,
    data: {
      ongoingGroups,
      pendingPickup,
      pendingSorting,
      pendingAftersale,
      todayOrders: todayOrders.length,
      todayAmount,
      weekTrend,
      todos,
    },
  });
});

export default router;
