import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Upload, Calendar, Clock, Package, DollarSign, Tag, Image, Sparkles } from 'lucide-react';
import { formatMoney } from '@/lib/format';

const PRICE_MAX = 9999999.99;

const SAMPLE_IMGS = [
  'https://images.unsplash.com/photo-1610832958506-aa16e062fc59?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&h=400&fit=crop',
];

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ProductNew() {
  const nav = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const now = new Date();
  const defDeadline = new Date(now.getTime() + 48 * 3600 * 1000);
  const defArrive = new Date(now.getTime() + 72 * 3600 * 1000);

  const [form, setForm] = useState({
    name: '',
    spec: '',
    price: '',
    originPrice: '',
    image: SAMPLE_IMGS[0],
    deadline: toLocalInput(defDeadline.toISOString()),
    arriveDate: toLocalInput(defArrive.toISOString()).slice(0, 10),
    stock: '100',
    source: 'custom' as 'custom' | 'supply',
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return showToast('error', '请输入团品名称');
    if (!form.spec.trim()) return showToast('error', '请输入规格');
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) return showToast('error', '请输入有效团购价');
    if (priceNum > PRICE_MAX) return showToast('error', `团购价不能超过 ${formatMoney(PRICE_MAX)} 元`);
    if (form.originPrice) {
      const originNum = Number(form.originPrice);
      if (isNaN(originNum) || originNum <= 0) return showToast('error', '原价需为有效正数');
      if (originNum > PRICE_MAX) return showToast('error', `原价不能超过 ${formatMoney(PRICE_MAX)} 元`);
    }
    if (!form.deadline) return showToast('error', '请选择截团时间');
    if (!form.arriveDate) return showToast('error', '请选择预计到货日');
    try {
      setLoading(true);
      await api.products.create({
        name: form.name,
        spec: form.spec,
        price: Number(form.price),
        originPrice: form.originPrice ? Number(form.originPrice) : undefined,
        image: form.image,
        deadline: new Date(form.deadline).toISOString(),
        arriveDate: new Date(form.arriveDate + 'T12:00:00').toISOString(),
        stock: Number(form.stock || 0),
        source: form.source,
      });
      showToast('success', '团品发布成功！');
      setTimeout(() => nav('/products'), 600);
    } catch (e: any) { showToast('error', e); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">发布自定义团品</h1>
          <p className="text-sm text-gray-500 mt-1">填写团品信息，快速开启新团期</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full" /> 基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label"><Tag size={14} className="inline mr-1.5 -mt-0.5" /> 团品名称 *</label>
                <input className="input h-11" placeholder="例如：云南高山沃柑 5斤装" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="label"><Package size={14} className="inline mr-1.5 -mt-0.5" /> 规格描述 *</label>
                <input className="input h-11" placeholder="例如：5斤/箱，约20-25颗，单果65mm+" value={form.spec} onChange={e => set('spec', e.target.value)} />
              </div>
              <div>
                <label className="label"><DollarSign size={14} className="inline mr-1.5 -mt-0.5 text-primary-500" /> 团购价 (元) *</label>
                <input type="number" step="0.01" min="0" max={PRICE_MAX} className="input h-11 text-lg font-semibold text-primary-600" placeholder="29.90" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className="label">原价/建议零售价 (元)</label>
                <input type="number" step="0.01" min="0" max={PRICE_MAX} className="input h-11 text-gray-500" placeholder="49.90" value={form.originPrice} onChange={e => set('originPrice', e.target.value)} />
              </div>
              <div>
                <label className="label">库存数量</label>
                <input type="number" min="0" className="input h-11" placeholder="100" value={form.stock} onChange={e => set('stock', e.target.value)} />
              </div>
              <div>
                <label className="label">团品来源</label>
                <div className="flex gap-2">
                  {[{ k: 'custom', l: '自定义' }, { k: 'supply', l: '供应链' }].map(o => (
                    <button key={o.k} onClick={() => set('source', o.k as any)} className={`flex-1 h-11 rounded-lg border text-sm font-medium transition ${form.source === o.k ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-500 rounded-full" /> 时间设置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label"><Clock size={14} className="inline mr-1.5 -mt-0.5 text-amber-500" /> 截团时间 *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="datetime-local" className="input h-11 pl-10" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">到达此时间后团品自动截团，不再接受下单</p>
              </div>
              <div>
                <label className="label"><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-fresh-500" /> 预计到货日 *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" className="input h-11 pl-10" value={form.arriveDate} onChange={e => set('arriveDate', e.target.value)} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">到货后可生成分拣单并通知团员取货</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Image size={16} /> 商品图片
            </h3>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-100 relative mb-4">
              <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => (e.target as HTMLImageElement).style.visibility = 'hidden'} />
              <button className="absolute inset-0 flex items-center justify-center gap-2 text-white text-sm font-medium bg-black/40 opacity-0 hover:opacity-100 transition">
                <Upload size={16} /> 更换图片
              </button>
            </div>
            <div className="text-xs font-medium text-gray-500 mb-2">快速选择</div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMGS.map((u, i) => (
                <button key={i} onClick={() => set('image', u)} className={`aspect-square rounded-lg overflow-hidden ring-2 transition ${form.image === u ? 'ring-primary-500' : 'ring-transparent hover:ring-gray-200'}`}>
                  <img src={u} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 border-primary-100 bg-gradient-to-br from-primary-50/50 to-white">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-primary-500" /> 预览卡片
            </h3>
            <div className="rounded-xl overflow-hidden bg-white shadow-card">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-800 line-clamp-1">{form.name || '团品名称示例'}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-1">{form.spec || '规格描述'}</div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <span className="text-xl font-bold text-primary-600">{formatMoney(Number(form.price) || 0)}</span>
                    {form.originPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{formatMoney(Number(form.originPrice))}</span>}
                  </div>
                  <span className="tag bg-fresh-50 text-fresh-600 border-fresh-200">
                    {form.source === 'supply' ? '供应链' : '自定义'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => nav(-1)} className="flex-1 btn-secondary">取消</button>
            <button onClick={submit} disabled={loading} className="flex-1 btn-primary">
              {loading ? '发布中...' : '立即发布'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
