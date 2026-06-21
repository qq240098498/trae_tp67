import { create } from 'zustand';
import type { Product, Order, SortingGroup, Aftersale, DashboardStats, VerificationRecord } from '../../shared/types';

interface AppState {
  toast: { show: boolean; type: 'success' | 'error' | 'info'; message: string } | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  hideToast: () => void;

  dashboard: DashboardStats | null;
  setDashboard: (d: DashboardStats | null) => void;

  products: Product[];
  setProducts: (p: Product[]) => void;

  orders: Order[];
  setOrders: (o: Order[]) => void;

  sortingGroups: SortingGroup[];
  setSortingGroups: (s: SortingGroup[]) => void;

  aftersales: Aftersale[];
  setAftersales: (a: Aftersale[]) => void;

  verifications: VerificationRecord[];
  setVerifications: (v: VerificationRecord[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  toast: null,
  showToast: (type, message) => {
    set({ toast: { show: true, type, message } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast: () => set({ toast: null }),

  dashboard: null,
  setDashboard: (d) => set({ dashboard: d }),

  products: [],
  setProducts: (p) => set({ products: p }),

  orders: [],
  setOrders: (o) => set({ orders: o }),

  sortingGroups: [],
  setSortingGroups: (s) => set({ sortingGroups: s }),

  aftersales: [],
  setAftersales: (a) => set({ aftersales: a }),

  verifications: [],
  setVerifications: (v) => set({ verifications: v }),
}));
