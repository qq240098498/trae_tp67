import axios from 'axios';
import type {
  Product, Order, SortingGroup, MemberSorting, Aftersale,
  DashboardStats, ProductStats, MemberStats, VerificationRecord,
  PickupReminder, OverduePickupStats
} from '../../shared/types';

const http = axios.create({ baseURL: '/api', timeout: 10000 });

http.interceptors.response.use(
  res => res.data?.code === 0 || res.status === 200 ? res.data : Promise.reject(res.data?.message || '请求失败'),
  err => Promise.reject(err.response?.data?.message || err.message || '网络错误')
);

export const api = {
  dashboard: {
    stats: () => http.get<any, { code: number; data: DashboardStats }>('/dashboard/stats').then(r => r.data),
  },
  products: {
    list: (params?: { source?: string; status?: string; keyword?: string }) =>
      http.get<any, { code: number; data: Product[] }>('/products', { params }).then(r => r.data),
    get: (id: string) => http.get<any, { code: number; data: Product }>(`/products/${id}`).then(r => r.data),
    create: (data: Partial<Product>) => http.post<any, { code: number; data: Product; message?: string }>('/products', data).then(r => r),
    update: (id: string, data: Partial<Product>) => http.put<any, { code: number; data: Product }>(`/products/${id}`, data).then(r => r),
    updateStatus: (id: string, status: Product['status']) =>
      http.patch<any, { code: number; data: Product }>(`/products/${id}/status`, { status }).then(r => r),
    supply: (params?: { keyword?: string }) =>
      http.get<any, { code: number; data: any[] }>('/products/supply/list', { params }).then(r => r.data),
  },
  orders: {
    list: (params?: { productId?: string; groupId?: string; status?: string; keyword?: string }) =>
      http.get<any, { code: number; data: Order[] }>('/orders', { params }).then(r => r.data),
    stats: () => http.get<any, {
      code: number; data: {
        summary: { totalOrders: number; totalMembers: number; totalQuantity: number; totalAmount: number };
        byProduct: ProductStats[]; byMember: MemberStats[];
      }
    }>('/orders/stats').then(r => r.data),
    get: (id: string) => http.get<any, { code: number; data: Order }>(`/orders/${id}`).then(r => r.data),
  },
  sorting: {
    list: (params?: { status?: string }) =>
      http.get<any, { code: number; data: SortingGroup[] }>('/sorting', { params }).then(r => r.data),
    get: (id: string) => http.get<any, {
      code: number; data: { group: SortingGroup; members: MemberSorting[]; productAgg: any[] };
    }>(`/sorting/${id}`).then(r => r.data),
    mark: (id: string, data: { orderIds?: string[]; all?: boolean }) =>
      http.patch<any, { code: number; data: any; message?: string }>(`/sorting/${id}/mark`, data).then(r => r),
  },
  verification: {
    verify: (code: string) => http.post<any, { code: number; data?: Order; message?: string }>('/verification/verify', { code }).then(r => r),
    records: (params?: { date?: string }) =>
      http.get<any, { code: number; data: VerificationRecord[] }>('/verification/records', { params }).then(r => r.data),
  },
  aftersale: {
    list: (params?: { type?: string; status?: string; keyword?: string }) =>
      http.get<any, { code: number; data: Aftersale[] }>('/aftersale', { params }).then(r => r.data),
    create: (data: any) => http.post<any, { code: number; data: Aftersale; message?: string }>('/aftersale', data).then(r => r),
    get: (id: string) => http.get<any, { code: number; data: { aftersale: Aftersale; order: Order } }>(`/aftersale/${id}`).then(r => r.data),
    updateStatus: (id: string, status: Aftersale['status']) =>
      http.patch<any, { code: number; data: Aftersale }>(`/aftersale/${id}/status`, { status }).then(r => r),
  },
  pickupReminder: {
    stats: () => http.get<any, { code: number; data: OverduePickupStats }>('/pickup-reminder/stats').then(r => r.data),
    orders: (params?: { type?: string; keyword?: string }) =>
      http.get<any, { code: number; data: any[] }>('/pickup-reminder/orders', { params }).then(r => r.data),
    remind: (orderId: string) =>
      http.post<any, { code: number; data: any; message?: string }>(`/pickup-reminder/remind/${orderId}`).then(r => r),
    remindBatch: (orderIds: string[]) =>
      http.post<any, { code: number; data: { success: number; failed: number }; message?: string }>('/pickup-reminder/remind/batch', { orderIds }).then(r => r),
    dispose: (orderId: string, type: 'stored' | 'returned' | 'normal', remark?: string) =>
      http.post<any, { code: number; data: Order; message?: string }>(`/pickup-reminder/dispose/${orderId}`, { type, remark }).then(r => r),
    reminders: (params?: { orderId?: string }) =>
      http.get<any, { code: number; data: PickupReminder[] }>('/pickup-reminder/reminders', { params }).then(r => r.data),
  },
};

export default api;
