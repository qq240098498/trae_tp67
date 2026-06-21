import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney } from '@/lib/format';
import { ArrowLeft, Search, Plus, ShoppingBasket, Check, Tag } from 'lucide-react';

export default function ProductSupply() {
  const nav = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [list, setList] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());

  const load = async () => {
    try {
      const data = await api.products.supply({ keyword: keyword || undefined });
      setList(data);
    } catch (e: any) { showToast('error', e); }
  };
  useEffect(() => { load(); }, [keyword]);

  const addToMy = async (item: any) => {
    try {
      const now = new Date();
      const deadline = new Date(now.getTime() + 72 * 3600 * 1000);
      const arrive = new Date(now.getTime() + 96 * 3600 * 1000);
      await api.products.create({
        name: item.name, spec: item.spec, price: item.price, originPrice: item.originPrice,
        image: item.image, source: 'supply',
        deadline: deadline.toISOString(), arriveDate: arrive.toISOString(),
        stock: 200,
      });
      setAdded(new Set([...added, item.id]));
      showToast('success', '已上架到我的团品');
    } catch (e: any) { showToast('error', e); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">供应链选品</h1>
            <p className="text-sm text-gray-500 mt-1">从平台供应链中一键选品上架，省心省力</p>
          </div>
        </div>
        <Link to="/products" className="btn-secondary">
          <ShoppingBasket size={16} /> 返回我的团品
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索供应链商品..." className="input pl-9 h-11 bg-gray-50" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {['全部', '水果', '海鲜', '肉类', '饮品', '滋补', '零食'].map((c, i) => (
              <button key={i} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition border ${i === 0 ? 'bg-primary-50 text-primary-600 border-primary-200' : 'text-gray-500 border-gray-100 hover:border-gray-200 hover:text-gray-700'}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map(item => {
          const isAdded = added.has(item.id);
          return (
            <div key={item.id} className="card group cursor-pointer hover:shadow-hover hover:-translate-y-1 transition-all">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="tag bg-fresh-50 text-fresh-600 border-fresh-200 backdrop-blur">
                    <Tag size={11} /> {item.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary-600">
                  供应链优选
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-800 line-clamp-1">{item.name}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-1">{item.spec}</div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <span className="text-xl font-bold text-primary-600">{formatMoney(item.price)}</span>
                    {item.originPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{formatMoney(item.originPrice)}</span>}
                  </div>
                  <span className="text-[11px] text-fresh-600 font-medium bg-fresh-50 px-2 py-0.5 rounded-full">
                    利润 ¥{((item.originPrice || item.price * 1.4) - item.price).toFixed(1)}
                  </span>
                </div>
                <button
                  onClick={() => addToMy(item)}
                  disabled={isAdded}
                  className={`mt-4 w-full h-10 rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                    isAdded
                      ? 'bg-fresh-500 text-white'
                      : 'bg-gradient-to-r from-primary-500 to-primary-400 text-white hover:shadow-hover shadow-primary-500/30'
                  }`}
                >
                  {isAdded ? (<><Check size={16} /> 已上架</>) : (<><Plus size={16} /> 一键上架</>)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
