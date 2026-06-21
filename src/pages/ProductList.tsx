import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatMoney, statusText, sourceText } from '@/lib/format';
import type { Product, ProductSource, ProductStatus } from '../../shared/types';
import { Plus, Search, Filter, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight, ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';

const TABS: { key: ProductStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '进行中' },
  { key: 'closed', label: '已截团' },
  { key: 'finished', label: '已完成' },
];
const SOURCES: { key: ProductSource | 'all'; label: string }[] = [
  { key: 'all', label: '全部来源' },
  { key: 'custom', label: '自定义' },
  { key: 'supply', label: '供应链' },
];

export default function ProductList() {
  const products = useAppStore(s => s.products);
  const setProducts = useAppStore(s => s.setProducts);
  const showToast = useAppStore(s => s.showToast);

  const [tab, setTab] = useState<ProductStatus | 'all'>('all');
  const [source, setSource] = useState<ProductSource | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const load = async () => {
    try {
      const list = await api.products.list({
        status: tab === 'all' ? undefined : tab,
        source: source === 'all' ? undefined : source,
        keyword: keyword || undefined,
      });
      setProducts(list);
    } catch (e: any) { showToast('error', e); }
  };
  useEffect(() => { load(); }, [tab, source, keyword]);

  const toggleStatus = async (p: Product) => {
    try {
      const next: ProductStatus = p.status === 'ongoing' ? 'closed' : p.status === 'closed' ? 'finished' : 'ongoing';
      await api.products.updateStatus(p.id, next);
      showToast('success', `已切换为"${statusText[next].text}"`);
      setMenuOpen(null);
      load();
    } catch (e: any) { showToast('error', e); }
  };

  const soldRate = (p: Product) => Math.min(100, Math.round((p.sold / (p.stock + p.sold)) * 100));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">团品管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理你的开团商品，支持自定义发布与供应链选品</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/products/supply" className="btn-secondary"><ShoppingBasket size={16} /> 供应链选品</Link>
          <Link to="/products/new" className="btn-primary"><Plus size={16} /> 发布自定义团品</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-1">
            {SOURCES.map(s => (
              <button key={s.key} onClick={() => setSource(s.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${source === s.key ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-500 hover:bg-gray-50 border border-transparent'}`}>{s.label}</button>
            ))}
          </div>
          <div className="ml-auto relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索团品名称/规格..." className="input pl-9 h-10 bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>团品信息</th>
                <th>团购价</th>
                <th>销售进度</th>
                <th>截团时间</th>
                <th>到货日</th>
                <th>来源</th>
                <th>状态</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 ring-1 ring-gray-100" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate max-w-[260px]">{p.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.spec}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-primary-600">{formatMoney(p.price)}</div>
                    {p.originPrice && <div className="text-xs text-gray-400 line-through">{formatMoney(p.originPrice)}</div>}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>已售 <span className="font-semibold text-gray-700">{p.sold}</span> 件</span>
                      <span>{soldRate(p)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-amber-500 transition-all" style={{ width: soldRate(p) + '%' }} />
                    </div>
                  </td>
                  <td className="text-xs whitespace-nowrap text-gray-600">{formatDate(p.deadline)}</td>
                  <td className="text-xs whitespace-nowrap text-gray-600">{formatDate(p.arriveDate, false)}</td>
                  <td>
                    <span className={`tag ${sourceText[p.source].className}`}>{sourceText[p.source].text}</span>
                  </td>
                  <td>
                    <span className={`tag ${statusText[p.status].className}`}>{statusText[p.status].text}</span>
                  </td>
                  <td className="text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <MoreVertical size={18} />
                      </button>
                      {menuOpen === p.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 py-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-20 animate-fade-in">
                          <button onClick={() => toggleStatus(p)} className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {p.status !== 'finished' ? <ToggleRight size={16} className="text-fresh-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                            切换状态
                          </button>
                          <button className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil size={16} className="text-primary-500" /> 编辑
                          </button>
                          <div className="my-1 h-px bg-gray-100" />
                          <button className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50">
                            <Trash2 size={16} /> 下架
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={32} className="text-gray-300" />
                      <div>暂无符合条件的团品</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
