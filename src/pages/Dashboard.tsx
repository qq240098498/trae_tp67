import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney } from '@/lib/format';
import {
  Package, ShoppingCart, Boxes, Headphones, CalendarCheck,
  TrendingUp, Users, DollarSign, ShoppingBag, AlertTriangle, ArrowRight,
  PackagePlus, ScanLine, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const STAT_CARDS = [
  { key: 'ongoingGroups', label: '进行中团期', icon: PackagePlus, gradient: 'from-primary-500 to-primary-400', ring: 'ring-primary-200/60', link: '/products' },
  { key: 'pendingSorting', label: '待分拣订单', icon: Boxes, gradient: 'from-amber-500 to-amber-400', ring: 'ring-amber-200/60', link: '/sorting' },
  { key: 'pendingPickup', label: '待取货订单', icon: ScanLine, gradient: 'from-fresh-500 to-fresh-400', ring: 'ring-fresh-200/60', link: '/verification' },
  { key: 'pendingAftersale', label: '待处理售后', icon: Headphones, gradient: 'from-rose-500 to-rose-400', ring: 'ring-rose-200/60', link: '/aftersale' },
] as const;

const TODO_ICON: Record<string, any> = {
  aftersale: Headphones,
  sorting: Boxes,
  pickup: CalendarCheck,
  deadline: AlertTriangle,
  arrive: ShoppingBag,
  info: TrendingUp,
};

export default function Dashboard() {
  const dashboard = useAppStore(s => s.dashboard);
  const setDashboard = useAppStore(s => s.setDashboard);
  const showToast = useAppStore(s => s.showToast);

  const load = async () => {
    try {
      const d = await api.dashboard.stats();
      setDashboard(d);
    } catch (e: any) {
      showToast('error', e);
    }
  };
  useEffect(() => { load(); }, []);

  const d = dashboard;
  if (!d) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw size={20} className="animate-spin" /> 加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">早上好，王姐 ☀️</h1>
          <p className="text-sm text-gray-500 mt-1">今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}，一起看看团里的情况吧～</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={16} /> 刷新数据
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          const value = (d as any)[card.key] ?? 0;
          return (
            <a key={card.key} href={card.link} className="group">
              <div className={`stat-card bg-gradient-to-br ${card.gradient} ring-1 ${card.ring} transition-transform hover:scale-[1.02] hover:shadow-xl`}>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10"></div>
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5"></div>
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-white/80 text-sm font-medium">{card.label}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{value}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                    <Icon size={22} />
                  </div>
                </div>
                <div className="relative mt-4 flex items-center gap-1 text-white/80 text-xs font-medium">
                  查看详情 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Today Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">近7日订单趋势</h3>
              <p className="text-xs text-gray-400 mt-0.5">订单量与销售额一览</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-primary-500" /> 订单量</span>
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-fresh-500" /> 销售额</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.weekTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area yAxisId="left" type="monotone" dataKey="orders" name="订单" stroke="#FF6B35" strokeWidth={2.5} fill="url(#g1)" dot={{ r: 3, fill: '#FF6B35', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area yAxisId="right" type="monotone" dataKey="amount" name="销售额" stroke="#2E7D32" strokeWidth={2.5} fill="url(#g2)" dot={{ r: 3, fill: '#2E7D32', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今日概览</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary-50 to-transparent border border-primary-100/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white"><ShoppingCart size={18} /></div>
                <div>
                  <div className="text-xs text-gray-500">今日新增订单</div>
                  <div className="text-xl font-bold text-gray-800">{d.todayOrders}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-fresh-50 to-transparent border border-fresh-100/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fresh-500 flex items-center justify-center text-white"><DollarSign size={18} /></div>
                <div>
                  <div className="text-xs text-gray-500">今日销售额</div>
                  <div className="text-xl font-bold text-gray-800">{formatMoney(d.todayAmount)}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-transparent border border-amber-100/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white"><Users size={18} /></div>
                <div>
                  <div className="text-xs text-gray-500">活跃团员</div>
                  <div className="text-xl font-bold text-gray-800">86</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* To-do */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800">待办提醒</h3>
            <span className="badge bg-primary-500 text-white">{d.todos.length}</span>
          </div>
          <div className="space-y-3">
            {d.todos.map((t, i) => {
              const Icon = TODO_ICON[t.type] || AlertTriangle;
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100 hover:bg-primary-50/40 hover:border-primary-200 transition cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-primary-500 group-hover:scale-110 transition">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{t.content}</div>
                    {t.time && <div className="text-xs text-gray-400 mt-0.5">{t.time}</div>}
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷入口</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '发布团品', icon: PackagePlus, to: '/products/new', color: 'text-primary-500', bg: 'bg-primary-50' },
              { label: '供应链选品', icon: ShoppingBag, to: '/products/supply', color: 'text-fresh-500', bg: 'bg-fresh-50' },
              { label: '下单统计', icon: TrendingUp, to: '/orders', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: '分拣标签', icon: Boxes, to: '/sorting', color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: '核销台', icon: ScanLine, to: '/verification', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: '售后登记', icon: Headphones, to: '/aftersale/new', color: 'text-rose-500', bg: 'bg-rose-50' },
            ].map((item, i) => (
              <a key={i} href={item.to} className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition">
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition`}>
                  <item.icon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
