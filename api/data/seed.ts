import type { Product, Order, OrderItem, SortingGroup, Aftersale } from '../../shared/types';

const daysFromNow = (n: number, h = 12, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const daysAgo = (n: number, h = 12, m = 0) => daysFromNow(-n, h, m);

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1610832958506-aa16e062fc59?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622205312192-9b5c845c5331?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=400&h=400&fit=crop',
];

export function seedProducts(): Product[] {
  const arr: Product[] = [
    { id: 'p1', name: '云南沃柑', spec: '5斤装/箱', price: 29.9, originPrice: 49.9, image: PRODUCT_IMAGES[0], deadline: daysFromNow(2, 20, 0), arriveDate: daysFromNow(4), source: 'custom', status: 'ongoing', stock: 200, sold: 86, createdAt: daysAgo(1) },
    { id: 'p2', name: '山东烟台红富士苹果', spec: '8斤装 80mm+', price: 39.9, originPrice: 59.9, image: PRODUCT_IMAGES[1], deadline: daysFromNow(1, 22, 0), arriveDate: daysFromNow(3), source: 'custom', status: 'ongoing', stock: 150, sold: 112, createdAt: daysAgo(2) },
    { id: 'p3', name: '海南金钻凤梨', spec: '2个装 约4斤', price: 35.8, originPrice: 58, image: PRODUCT_IMAGES[2], deadline: daysFromNow(3, 18, 0), arriveDate: daysFromNow(5), source: 'supply', status: 'ongoing', stock: 300, sold: 48, createdAt: daysAgo(1, 10) },
    { id: 'p4', name: '内蒙古羔羊肉卷', spec: '500g/盒×2', price: 89.9, originPrice: 128, image: PRODUCT_IMAGES[3], deadline: daysAgo(1, 20), arriveDate: daysFromNow(1), source: 'custom', status: 'closed', stock: 100, sold: 64, createdAt: daysAgo(4) },
    { id: 'p5', name: '东北五常大米', spec: '10斤装 新米', price: 59.9, originPrice: 89, image: PRODUCT_IMAGES[4], deadline: daysAgo(2, 20), arriveDate: daysAgo(0), source: 'supply', status: 'closed', stock: 200, sold: 138, createdAt: daysAgo(6) },
    { id: 'p6', name: '湛江生蚝', spec: 'M号 5斤约30只', price: 68, originPrice: 98, image: PRODUCT_IMAGES[5], deadline: daysAgo(4, 20), arriveDate: daysAgo(2), source: 'custom', status: 'finished', stock: 80, sold: 52, createdAt: daysAgo(8) },
    { id: 'p7', name: '四川不知火丑橘', spec: '5斤精品装', price: 36.8, originPrice: 58, image: PRODUCT_IMAGES[6], deadline: daysFromNow(4, 20), arriveDate: daysFromNow(6), source: 'supply', status: 'ongoing', stock: 250, sold: 35, createdAt: daysAgo(0, 9) },
    { id: 'p8', name: '阳澄湖大闸蟹礼券', spec: '4对装 公4两母3两', price: 299, originPrice: 499, image: PRODUCT_IMAGES[7], deadline: daysAgo(6, 20), arriveDate: daysAgo(4), source: 'supply', status: 'finished', stock: 60, sold: 28, createdAt: daysAgo(12) },
    { id: 'p9', name: '云南高山蓝莓', spec: '125g×4盒', price: 59.9, originPrice: 79.9, image: PRODUCT_IMAGES[8], deadline: daysFromNow(5, 20), arriveDate: daysFromNow(7), source: 'custom', status: 'ongoing', stock: 180, sold: 22, createdAt: daysAgo(0, 15) },
    { id: 'p10', name: '广西砂糖橘', spec: '10斤装 皮薄多汁', price: 45.8, originPrice: 68, image: PRODUCT_IMAGES[9], deadline: daysAgo(8, 20), arriveDate: daysAgo(6), source: 'supply', status: 'finished', stock: 500, sold: 412, createdAt: daysAgo(15) },
  ];
  return arr;
}

const MEMBERS = [
  { name: '张丽华', phone: '138****1234', building: '1栋', roomNumber: '302' },
  { name: '李明强', phone: '139****5678', building: '2栋', roomNumber: '1501' },
  { name: '王晓丽', phone: '136****9012', building: '1栋', roomNumber: '805' },
  { name: '赵文博', phone: '137****3456', building: '3栋', roomNumber: '602' },
  { name: '陈美玲', phone: '135****7890', building: '2栋', roomNumber: '403' },
  { name: '刘建国', phone: '138****2345', building: '5栋', roomNumber: '1102' },
  { name: '周小红', phone: '139****6789', building: '1栋', roomNumber: '1201' },
  { name: '吴海涛', phone: '136****0123', building: '4栋', roomNumber: '708' },
  { name: '孙雪梅', phone: '137****4567', building: '3栋', roomNumber: '2203' },
  { name: '郑志强', phone: '135****8901', building: '5栋', roomNumber: '901' },
  { name: '黄丽娟', phone: '137****1122', building: '2栋', roomNumber: '1806' },
  { name: '杨伟东', phone: '136****3344', building: '4栋', roomNumber: '305' },
  { name: '林小芳', phone: '138****5566', building: '1栋', roomNumber: '509' },
  { name: '何志远', phone: '139****7788', building: '3栋', roomNumber: '1402' },
  { name: '徐美玲', phone: '135****9900', building: '5栋', roomNumber: '606' },
];

function pickMember() {
  return MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
}
function rand(a: number, b: number) {
  return Math.floor(a + Math.random() * (b - a + 1));
}
function pc() { return rand(100000, 999999).toString(); }

const GROUPS = [
  { id: 'g1', productId: 'p4', status: 'pending' as const, closedAt: daysAgo(1, 20), arriveAt: daysFromNow(1) },
  { id: 'g2', productId: 'p5', status: 'sorting' as const, closedAt: daysAgo(2, 20), arriveAt: daysAgo(0) },
  { id: 'g3', productId: 'p6', status: 'done' as const, closedAt: daysAgo(4, 20), arriveAt: daysAgo(2) },
  { id: 'g4', productId: 'p10', status: 'done' as const, closedAt: daysAgo(8, 20), arriveAt: daysAgo(6) },
  { id: 'g5', productId: 'p8', status: 'done' as const, closedAt: daysAgo(6, 20), arriveAt: daysAgo(4) },
];

export function seedOrders(): Order[] {
  const orders: Order[] = [];
  const products = seedProducts();
  const pmap = Object.fromEntries(products.map(p => [p.id, p]));

  let idx = 1;
  const add = (groupId: string, productIds: string[], status: Order['status'], createdAt: string) => {
    const member = pickMember();
    const items: OrderItem[] = productIds.map(pid => {
      const p = pmap[pid]!;
      const q = rand(1, 3);
      return { productId: pid, productName: p.name, spec: p.spec, price: p.price, quantity: q, subtotal: +(p.price * q).toFixed(2) };
    });
    const total = +items.reduce((s, i) => s + i.subtotal, 0).toFixed(2);
    const qty = items.reduce((s, i) => s + i.quantity, 0);
    const d = new Date(createdAt);
    const s1 = d.getFullYear().toString() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
    orders.push({
      id: 'o' + idx,
      orderNo: 'TG' + s1 + String(1000 + idx).padStart(4, '0'),
      memberName: member.name,
      memberPhone: member.phone,
      building: member.building,
      roomNumber: member.roomNumber,
      pickupCode: pc(),
      items,
      totalAmount: total,
      totalQuantity: qty,
      productId: items[0].productId,
      groupId,
      status,
      createdAt,
      pickedAt: status === 'picked' ? new Date(new Date(createdAt).getTime() + rand(3600, 86400) * 1000).toISOString() : undefined,
    });
    idx++;
  };

  // Group g1 (p4 羊肉卷) - pending, 14 orders
  for (let i = 0; i < 14; i++) {
    const extras = Math.random() > 0.7 && products[0] ? [products[0].id] : [];
    add('g1', ['p4', ...extras], 'pending', GROUPS[0].closedAt);
  }
  // Group g2 (p5 五常大米) - sorting, 16 orders (part picked)
  for (let i = 0; i < 16; i++) {
    const s: Order['status'] = i < 6 ? 'picked' : 'sorted';
    add('g2', ['p5'], s, GROUPS[1].closedAt);
  }
  // Group g3 (p6 生蚝) - done, 12 orders all picked
  for (let i = 0; i < 12; i++) {
    add('g3', ['p6'], 'picked', GROUPS[2].closedAt);
  }
  // Group g4 (p10 砂糖橘) - done, 20 orders
  for (let i = 0; i < 20; i++) {
    add('g4', ['p10'], 'picked', GROUPS[3].closedAt);
  }
  // Group g5 (p8 大闸蟹) - done, 8 orders
  for (let i = 0; i < 8; i++) {
    add('g5', ['p8'], 'picked', GROUPS[4].closedAt);
  }

  return orders;
}

export function seedSortingGroups(orders: Order[]): SortingGroup[] {
  return GROUPS.map(g => {
    const gorders = orders.filter(o => o.groupId === g.id);
    const prod = seedProducts().find(p => p.id === g.productId)!;
    return {
      id: 'sg_' + g.id,
      groupId: g.id,
      productName: prod ? prod.name : '团品',
      deadline: g.closedAt,
      arriveDate: g.arriveAt,
      totalMembers: gorders.length,
      totalQuantity: gorders.reduce((s, o) => s + o.totalQuantity, 0),
      status: g.status,
      orderIds: gorders.map(o => o.id),
    };
  });
}

export function seedAftersales(orders: Order[]): Aftersale[] {
  const picked = orders.filter(o => o.status === 'picked');
  const list: Aftersale[] = [
    { id: 'as1', orderId: picked[0].id, orderNo: picked[0].orderNo, memberName: picked[0].memberName, type: 'out_of_stock', refundAmount: 29.9, remark: '1件沃柑未到货，团员要求退款', productName: '云南沃柑', status: 'pending', createdAt: daysAgo(0, 14) },
    { id: 'as2', orderId: picked[3].id, orderNo: picked[3].orderNo, memberName: picked[3].memberName, type: 'damaged', refundAmount: 35, remark: '快递箱破损，苹果有压伤3个', productName: '山东烟台红富士苹果', status: 'approved', createdAt: daysAgo(1, 10) },
    { id: 'as3', orderId: picked[5].id, orderNo: picked[5].orderNo, memberName: picked[5].memberName, type: 'quality', refundAmount: 68, remark: '生蚝不新鲜，有异味，全额退款', productName: '湛江生蚝', status: 'completed', createdAt: daysAgo(2, 16) },
    { id: 'as4', orderId: picked[7].id, orderNo: picked[7].orderNo, memberName: picked[7].memberName, type: 'quality', refundAmount: 45.8, remark: '砂糖橘口感偏酸，团员不满意', productName: '广西砂糖橘', status: 'completed', createdAt: daysAgo(5, 11) },
    { id: 'as5', orderId: picked[9].id, orderNo: picked[9].orderNo, memberName: picked[9].memberName, type: 'damaged', refundAmount: 59.9, remark: '大米包装破漏，撒出约1斤', productName: '东北五常大米', status: 'pending', createdAt: daysAgo(0, 9) },
    { id: 'as6', orderId: picked[11].id, orderNo: picked[11].orderNo, memberName: picked[11].memberName, type: 'out_of_stock', refundAmount: 89.9, remark: '羊肉卷断货，尚未到货，先退款', productName: '内蒙古羔羊肉卷', status: 'approved', createdAt: daysAgo(1, 17) },
  ];
  return list;
}
