import { Router, Request, Response } from 'express';
import store from '../data/store';
import type { MemberRepurchaseStats, RepurchaseSummary, CategoryPreference, RecommendRecord } from '../../shared/types';

const router = Router();

function calcRepurchaseLevel(orderCount: number): MemberRepurchaseStats['repurchaseLevel'] {
  if (orderCount >= 5) return 'high';
  if (orderCount >= 3) return 'medium';
  if (orderCount >= 2) return 'low';
  return 'new';
}

function calcActivityScore(orderCount: number, totalAmount: number, daysSinceLastOrder: number): number {
  const orderScore = Math.min(orderCount * 15, 40);
  const amountScore = Math.min(Math.floor(totalAmount / 10), 30);
  const recencyScore = Math.max(0, 30 - daysSinceLastOrder * 2);
  return Math.min(100, orderScore + amountScore + recencyScore);
}

router.get('/stats', (req: Request, res: Response) => {
  const orders = store.orders;
  const products = store.products;
  const productMap = new Map(products.map(p => [p.id, p]));

  const memberMap = new Map<string, {
    memberName: string;
    memberPhone: string;
    building: string;
    roomNumber: string;
    orders: typeof orders;
  }>();

  for (const o of orders) {
    const key = o.memberName + o.memberPhone;
    if (!memberMap.has(key)) {
      memberMap.set(key, {
        memberName: o.memberName,
        memberPhone: o.memberPhone,
        building: o.building,
        roomNumber: o.roomNumber,
        orders: [],
      });
    }
    memberMap.get(key)!.orders.push(o);
  }

  const now = Date.now();
  const memberStats: MemberRepurchaseStats[] = [];

  for (const [, m] of memberMap) {
    const sortedOrders = m.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const firstOrderAt = sortedOrders[sortedOrders.length - 1].createdAt;
    const lastOrderAt = sortedOrders[0].createdAt;
    const daysSinceLastOrder = Math.floor((now - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24));
    
    const totalAmount = +m.orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2);
    const totalQuantity = m.orders.reduce((s, o) => s + o.totalQuantity, 0);
    const orderCount = m.orders.length;
    const avgOrderAmount = +(totalAmount / orderCount).toFixed(2);

    const categoryMap = new Map<string, { count: number; amount: number }>();
    for (const o of m.orders) {
      for (const item of o.items) {
        const p = productMap.get(item.productId);
        const category = p?.category || '其他';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { count: 0, amount: 0 });
        }
        const cat = categoryMap.get(category)!;
        cat.count += item.quantity;
        cat.amount = +(cat.amount + item.subtotal).toFixed(2);
      }
    }

    const totalCategoryAmount = Array.from(categoryMap.values()).reduce((s, c) => s + c.amount, 0);
    const categories: CategoryPreference[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        amount: data.amount,
        percentage: +((data.amount / (totalCategoryAmount || 1)) * 100).toFixed(1),
      }))
      .sort((a, b) => b.amount - a.amount);

    const preferredCategories = categories.slice(0, 3).map(c => c.category);
    const recommendedProducts = products
      .filter(p => p.status === 'ongoing' && preferredCategories.includes(p.category))
      .slice(0, 3)
      .map(p => p.id);

    const recentOrders = sortedOrders.slice(0, 5).map(o => ({
      orderId: o.id,
      orderNo: o.orderNo,
      items: o.items,
      totalAmount: o.totalAmount,
      totalQuantity: o.totalQuantity,
      status: o.status,
      createdAt: o.createdAt,
    }));

    memberStats.push({
      memberName: m.memberName,
      memberPhone: m.memberPhone,
      building: m.building,
      roomNumber: m.roomNumber,
      orderCount,
      totalAmount,
      totalQuantity,
      avgOrderAmount,
      firstOrderAt,
      lastOrderAt,
      repurchaseLevel: calcRepurchaseLevel(orderCount),
      activityScore: calcActivityScore(orderCount, totalAmount, daysSinceLastOrder),
      categories,
      recentOrders,
      recommendedProducts,
    });
  }

  memberStats.sort((a, b) => b.activityScore - a.activityScore);

  const totalMembers = memberStats.length;
  const highActivityMembers = memberStats.filter(m => m.repurchaseLevel === 'high').length;
  const mediumActivityMembers = memberStats.filter(m => m.repurchaseLevel === 'medium').length;
  const lowActivityMembers = memberStats.filter(m => m.repurchaseLevel === 'low').length;
  const newMembers = memberStats.filter(m => m.repurchaseLevel === 'new').length;
  const repurchaseRate = +(((totalMembers - newMembers) / (totalMembers || 1)) * 100).toFixed(1);
  const avgOrderCount = +(memberStats.reduce((s, m) => s + m.orderCount, 0) / (totalMembers || 1)).toFixed(1);
  const avgOrderAmount = +(memberStats.reduce((s, m) => s + m.avgOrderAmount, 0) / (totalMembers || 1)).toFixed(2);

  const summary: RepurchaseSummary = {
    totalMembers,
    highActivityMembers,
    mediumActivityMembers,
    lowActivityMembers,
    newMembers,
    repurchaseRate,
    avgOrderCount,
    avgOrderAmount,
  };

  res.json({
    code: 0,
    data: {
      summary,
      members: memberStats,
    },
  });
});

router.get('/products', (req: Request, res: Response) => {
  const products = store.products.filter(p => p.status === 'ongoing');
  res.json({ code: 0, data: products });
});

router.get('/recommend-records', (req: Request, res: Response) => {
  const records = [...store.recommendRecords].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ code: 0, data: records });
});

router.post('/recommend', (req: Request, res: Response) => {
  const { memberNames, memberPhones, productIds, remark } = req.body as {
    memberNames: string[];
    memberPhones: string[];
    productIds: string[];
    remark?: string;
  };

  if (!memberNames?.length || !productIds?.length) {
    return res.status(400).json({ code: 1, message: '请选择团员和推荐商品' });
  }

  const products = store.products.filter(p => productIds.includes(p.id));
  const productNames = products.map(p => p.name);

  const records: RecommendRecord[] = [];
  for (let i = 0; i < memberNames.length; i++) {
    const record: RecommendRecord = {
      id: store.genId('rec'),
      memberName: memberNames[i],
      memberPhone: memberPhones[i] || '',
      productIds,
      productNames,
      createdAt: new Date().toISOString(),
      remark,
    };
    store.recommendRecords.push(record);
    records.push(record);
  }

  res.json({
    code: 0,
    data: { success: records.length, records },
    message: `已成功向 ${records.length} 位团员发送推荐`,
  });
});

export default router;
