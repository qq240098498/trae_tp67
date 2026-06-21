import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, BarChart3, Boxes, ScanLine, Headphones, Plus, ShoppingBasket,
  Bell, Search, User, ChevronRight, Clock
} from 'lucide-react';
import { useMemo, ReactNode } from 'react';

interface LayoutProps { children?: ReactNode; }

const NAV = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/products', label: '团品管理', icon: Package },
  { to: '/orders', label: '下单统计', icon: BarChart3 },
  { to: '/sorting', label: '到货分拣', icon: Boxes },
  { to: '/verification', label: '取货核销', icon: ScanLine },
  { to: '/pickup-reminder', label: '超时催收', icon: Clock },
  { to: '/aftersale', label: '售后登记', icon: Headphones },
];

const BREAD_CRUMB: Record<string, string[]> = {
  '/': ['仪表盘'],
  '/products': ['团品管理', '团品列表'],
  '/products/new': ['团品管理', '发布团品'],
  '/products/supply': ['团品管理', '供应链选品'],
  '/orders': ['下单统计'],
  '/sorting': ['到货分拣', '分拣单列表'],
  '/verification': ['取货核销'],
  '/pickup-reminder': ['超时催收'],
  '/aftersale': ['售后登记', '售后列表'],
  '/aftersale/new': ['售后登记', '新建售后'],
};

export default function Layout({ children }: LayoutProps) {
  const loc = useLocation();
  const crumbs = useMemo(() => {
    const key = Object.keys(BREAD_CRUMB).find(k =>
      k === loc.pathname || (k !== '/' && loc.pathname.startsWith(k))
    );
    if (loc.pathname.startsWith('/sorting/')) return ['到货分拣', '分拣详情'];
    return BREAD_CRUMB[key || '/'] || ['首页'];
  }, [loc.pathname]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col no-print">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ShoppingBasket size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-[15px] leading-tight">团长通</div>
            <div className="text-[11px] text-gray-400 mt-0.5">社区团购管理系统</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <div className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">工作台</div>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-50">
          <NavLink to="/products/new" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 text-white text-sm font-medium shadow-hover shadow-primary-500/30 transition-transform hover:scale-[1.02]">
            <Plus size={18} /> 发布新团品
          </NavLink>
        </div>

        <div className="p-3 border-t border-gray-50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fresh-400 to-fresh-600 flex items-center justify-center text-white font-semibold">
            团
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">阳光小区团</div>
            <div className="text-[11px] text-gray-400">团长 · 王姐</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 shrink-0 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6 no-print">
          <div className="flex items-center gap-2 text-sm">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
                <span className={i === crumbs.length - 1 ? 'text-gray-800 font-medium' : 'text-gray-400'}>{c}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-72 hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="搜索团品/订单/团员..." className="input pl-9 h-9 bg-gray-50" />
            </div>
            <button className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-fresh-400 to-fresh-600 flex items-center justify-center text-white">
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">
          <div className="max-w-[1440px] mx-auto">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}
