import type { Product, Order, SortingGroup, Aftersale, VerificationRecord, PickupReminder, RecommendRecord } from '../../shared/types';
import { seedProducts, seedOrders, seedSortingGroups, seedAftersales, seedPickupReminders } from './seed';

class MemoryStore {
  products: Product[] = [];
  orders: Order[] = [];
  sortingGroups: SortingGroup[] = [];
  aftersales: Aftersale[] = [];
  verifications: VerificationRecord[] = [];
  pickupReminders: PickupReminder[] = [];
  recommendRecords: RecommendRecord[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.products = seedProducts();
    this.orders = seedOrders();
    this.sortingGroups = seedSortingGroups(this.orders);
    this.aftersales = seedAftersales(this.orders);
    this.verifications = this.orders
      .filter(o => o.status === 'picked' && o.pickedAt)
      .map(o => ({
        id: 'vr_' + o.id,
        orderId: o.id,
        orderNo: o.orderNo,
        memberName: o.memberName,
        pickupCode: o.pickupCode,
        verifiedAt: o.pickedAt!,
      }));
    this.pickupReminders = seedPickupReminders(this.orders);
    this.recommendRecords = [];
  }

  genId(prefix: string) {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  genPickupCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  genOrderNo() {
    const d = new Date();
    const s = d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    return 'TG' + s + Math.floor(1000 + Math.random() * 9000);
  }
}

export const store = new MemoryStore();
export default store;
