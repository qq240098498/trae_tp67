import { Router, Request, Response } from 'express';
import store from '../data/store';
import type { Order, PickupReminder, PickupDisposeType } from '../../shared/types';

const router = Router();

const getArriveDate = (order: Order): string | null => {
  const group = store.sortingGroups.find(g => g.orderIds.includes(order.id));
  return group ? group.arriveDate : null;
};

const getHoursSinceArrive = (order: Order): number => {
  const arriveDate = getArriveDate(order);
  if (!arriveDate) return 0;
  const diff = Date.now() - new Date(arriveDate).getTime();
  return diff / (1000 * 60 * 60);
};

router.get('/stats', (req: Request, res: Response) => {
  const orders = store.orders;
  const sortedOrders = orders.filter(o => o.status === 'sorted');
  
  let level1 = 0;
  let level2 = 0;
  let stored = 0;
  let returned = 0;
  
  for (const o of sortedOrders) {
    if (o.disposeType === 'stored') {
      stored++;
    } else if (o.disposeType === 'returned') {
      returned++;
    } else if (o.disposeType === 'normal') {
      const hours = getHoursSinceArrive(o);
      if (hours >= 48) {
        level2++;
      } else if (hours >= 24) {
        level1++;
      }
    }
  }
  
  res.json({
    code: 0,
    data: {
      total: level1 + level2 + stored + returned,
      level1,
      level2,
      stored,
      returned,
    },
  });
});

router.get('/orders', (req: Request, res: Response) => {
  const { type, keyword } = req.query as { type?: string; keyword?: string };
  
  let orders = store.orders.filter(o => o.status === 'sorted');
  
  if (type === 'overdue') {
    orders = orders.filter(o => o.disposeType === 'normal' && getHoursSinceArrive(o) >= 24);
  } else if (type === 'stored') {
    orders = orders.filter(o => o.disposeType === 'stored');
  } else if (type === 'returned') {
    orders = orders.filter(o => o.disposeType === 'returned');
  } else if (type === 'level1') {
    orders = orders.filter(o => {
      const hours = getHoursSinceArrive(o);
      return o.disposeType === 'normal' && hours >= 24 && hours < 48;
    });
  } else if (type === 'level2') {
    orders = orders.filter(o => {
      const hours = getHoursSinceArrive(o);
      return o.disposeType === 'normal' && hours >= 48;
    });
  }
  
  if (keyword) {
    const kw = keyword.toLowerCase();
    orders = orders.filter(o => 
      o.memberName.toLowerCase().includes(kw) ||
      o.orderNo.toLowerCase().includes(kw) ||
      o.memberPhone.includes(kw) ||
      o.pickupCode.includes(kw)
    );
  }
  
  const result = orders.map(o => {
    const group = store.sortingGroups.find(g => g.orderIds.includes(o.id));
    const hoursSinceArrive = getHoursSinceArrive(o);
    return {
      ...o,
      productName: group?.productName || '',
      arriveDate: group?.arriveDate || '',
      hoursSinceArrive: Math.floor(hoursSinceArrive),
      overdue: o.disposeType === 'normal' && hoursSinceArrive >= 24,
    };
  });
  
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({ code: 0, data: result });
});

router.post('/remind/:orderId', (req: Request, res: Response) => {
  const order = store.orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ code: 1, message: '订单不存在' });
  if (order.status !== 'sorted') {
    return res.status(400).json({ code: 1, message: '订单状态不支持发送提醒' });
  }
  if (order.disposeType !== 'normal') {
    return res.status(400).json({ code: 1, message: '该订单已处理，无需提醒' });
  }
  
  const nextLevel = Math.min(order.reminderLevel + 1, 2) as 0 | 1 | 2;
  if (nextLevel === order.reminderLevel) {
    return res.json({ code: 0, data: order, message: '已达到最大提醒次数' });
  }
  
  const now = new Date().toISOString();
  order.reminderLevel = nextLevel;
  order.lastRemindedAt = now;
  
  const content = nextLevel === 1
    ? `您订购的商品已到货24小时，请尽快到团长处取货，取货码：${order.pickupCode}`
    : `温馨提醒：您的订单已到货48小时仍未取货，请尽快取货或联系团长处理，取货码：${order.pickupCode}`;
  
  const reminder: PickupReminder = {
    id: store.genId('pr'),
    orderId: order.id,
    orderNo: order.orderNo,
    memberName: order.memberName,
    memberPhone: order.memberPhone,
    level: nextLevel,
    content,
    createdAt: now,
  };
  store.pickupReminders.unshift(reminder);
  
  res.json({
    code: 0,
    data: { order, reminder },
    message: `已发送第${nextLevel}次提醒`,
  });
});

router.post('/remind/batch', (req: Request, res: Response) => {
  const { orderIds } = req.body as { orderIds?: string[] };
  if (!orderIds || orderIds.length === 0) {
    return res.status(400).json({ code: 1, message: '请选择要提醒的订单' });
  }
  
  let success = 0;
  let failed = 0;
  
  for (const oid of orderIds) {
    const order = store.orders.find(o => o.id === oid);
    if (!order || order.status !== 'sorted' || order.disposeType !== 'normal') {
      failed++;
      continue;
    }
    if (order.reminderLevel >= 2) {
      failed++;
      continue;
    }
    
    const nextLevel = (order.reminderLevel + 1) as 0 | 1 | 2;
    const now = new Date().toISOString();
    order.reminderLevel = nextLevel;
    order.lastRemindedAt = now;
    
    const content = nextLevel === 1
      ? `您订购的商品已到货24小时，请尽快到团长处取货，取货码：${order.pickupCode}`
      : `温馨提醒：您的订单已到货48小时仍未取货，请尽快取货或联系团长处理，取货码：${order.pickupCode}`;
    
    store.pickupReminders.unshift({
      id: store.genId('pr'),
      orderId: order.id,
      orderNo: order.orderNo,
      memberName: order.memberName,
      memberPhone: order.memberPhone,
      level: nextLevel,
      content,
      createdAt: now,
    });
    success++;
  }
  
  res.json({
    code: 0,
    data: { success, failed },
    message: `批量提醒完成：成功${success}条，失败${failed}条`,
  });
});

router.post('/dispose/:orderId', (req: Request, res: Response) => {
  const { type, remark } = req.body as { type: PickupDisposeType; remark?: string };
  const order = store.orders.find(o => o.id === req.params.orderId);
  
  if (!order) return res.status(404).json({ code: 1, message: '订单不存在' });
  if (order.status !== 'sorted') {
    return res.status(400).json({ code: 1, message: '订单状态不支持此操作' });
  }
  if (type !== 'stored' && type !== 'returned' && type !== 'normal') {
    return res.status(400).json({ code: 1, message: '无效的处理类型' });
  }
  
  order.disposeType = type;
  order.disposedAt = new Date().toISOString();
  order.disposeRemark = remark;
  
  const typeText = type === 'stored' ? '代存' : type === 'returned' ? '退货' : '正常';
  res.json({
    code: 0,
    data: order,
    message: `已标记为${typeText}`,
  });
});

router.get('/reminders', (req: Request, res: Response) => {
  const { orderId } = req.query as { orderId?: string };
  let list = [...store.pickupReminders];
  if (orderId) list = list.filter(r => r.orderId === orderId);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ code: 0, data: list });
});

export default router;
