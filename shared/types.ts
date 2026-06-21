export type ProductSource = 'custom' | 'supply';
export type ProductStatus = 'ongoing' | 'closed' | 'finished';
export type OrderStatus = 'pending' | 'sorted' | 'picked' | 'refunded';
export type SortingStatus = 'pending' | 'sorting' | 'done';
export type AftersaleType = 'out_of_stock' | 'damaged' | 'quality';
export type AftersaleStatus = 'pending' | 'approved' | 'completed';
export type PickupReminderLevel = 0 | 1 | 2;
export type PickupDisposeType = 'normal' | 'stored' | 'returned';

export interface Product {
  id: string;
  name: string;
  spec: string;
  price: number;
  originPrice?: number;
  image: string;
  deadline: string;
  arriveDate: string;
  source: ProductSource;
  status: ProductStatus;
  stock: number;
  sold: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  spec: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNo: string;
  memberName: string;
  memberPhone: string;
  building: string;
  roomNumber: string;
  pickupCode: string;
  items: OrderItem[];
  totalAmount: number;
  totalQuantity: number;
  productId?: string;
  groupId: string;
  status: OrderStatus;
  createdAt: string;
  pickedAt?: string;
  reminderLevel: PickupReminderLevel;
  lastRemindedAt?: string;
  disposeType: PickupDisposeType;
  disposedAt?: string;
  disposeRemark?: string;
}

export interface SortingGroup {
  id: string;
  groupId: string;
  productName: string;
  deadline: string;
  arriveDate: string;
  totalMembers: number;
  totalQuantity: number;
  status: SortingStatus;
  orderIds: string[];
}

export interface MemberSorting {
  orderId: string;
  memberName: string;
  memberPhone: string;
  building: string;
  roomNumber: string;
  pickupCode: string;
  items: OrderItem[];
  totalAmount: number;
  isSorted: boolean;
}

export interface Aftersale {
  id: string;
  orderId: string;
  orderNo: string;
  memberName: string;
  type: AftersaleType;
  refundAmount: number;
  remark: string;
  productName?: string;
  status: AftersaleStatus;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  orderId: string;
  orderNo: string;
  memberName: string;
  pickupCode: string;
  verifiedAt: string;
}

export interface PickupReminder {
  id: string;
  orderId: string;
  orderNo: string;
  memberName: string;
  memberPhone: string;
  level: PickupReminderLevel;
  content: string;
  createdAt: string;
}

export interface OverduePickupStats {
  total: number;
  level1: number;
  level2: number;
  stored: number;
  returned: number;
}

export interface DashboardStats {
  ongoingGroups: number;
  pendingPickup: number;
  pendingSorting: number;
  pendingAftersale: number;
  todayOrders: number;
  todayAmount: number;
  weekTrend: { date: string; orders: number; amount: number }[];
  todos: { type: string; content: string; time?: string }[];
  overduePickup: OverduePickupStats;
}

export interface ProductStats {
  productId: string;
  productName: string;
  spec: string;
  memberCount: number;
  quantity: number;
  amount: number;
}

export interface MemberStats {
  memberName: string;
  memberPhone: string;
  orderCount: number;
  quantity: number;
  amount: number;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}
