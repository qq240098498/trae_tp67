import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, formatDate, formatDateShort, statusText } from '@/lib/format';
import type { SortingGroup, MemberSorting, OrderItem } from '../../shared/types';
import {
  ArrowLeft, Printer, Check, CheckCheck, Boxes, Users, Package, Phone,
  QrCode, RefreshCw, Download, MapPin
} from 'lucide-react';

type PrintMode = 'sorting' | 'pickup';

export default function SortingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [group, setGroup] = useState<SortingGroup | null>(null);
  const [members, setMembers] = useState<MemberSorting[]>([]);
  const [productAgg, setProductAgg] = useState<any[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [printMode, setPrintMode] = useState<PrintMode>('sorting');

  const load = async () => {
    if (!id) return;
    try {
      const d = await api.sorting.get(id);
      setGroup(d.group);
      setMembers(d.members);
      setProductAgg(d.productAgg);
      setChecked(new Set(d.members.filter(m => m.isSorted).map(m => m.orderId)));
    } catch (e: any) { showToast('error', e); }
  };
  useEffect(() => { load(); }, [id]);

  const toggle = (orderId: string) => {
    const next = new Set(checked);
    if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
    setChecked(next);
  };
  const markAll = () => setChecked(new Set(members.map(m => m.orderId)));

  const submitMark = async (all = false) => {
    if (!id || !group) return;
    if (group.status === 'done') {
      showToast('info', '该分拣单已完成，无需重复操作');
      return;
    }
    try {
      const orderIds = all ? members.map(m => m.orderId) : Array.from(checked);
      const r = await api.sorting.mark(id, { orderIds, all });
      showToast('success', r.message || '标记成功');
      load();
    } catch (e: any) { showToast('error', e); }
  };

  const doPrint = () => {
    window.print();
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw size={20} className="animate-spin" /> 加载中...
        </div>
      </div>
    );
  }

  const totalMembers = members.length;
  const sortedCount = checked.size;
  const progress = totalMembers ? Math.round((sortedCount / totalMembers) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between no-print flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{group.productName}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-4 flex-wrap">
              <span>团期 <span className="font-mono text-primary-600">{group.groupId.toUpperCase()}</span></span>
              <span>截团 {formatDate(group.deadline)}</span>
              <span>到货 {formatDateShort(group.arriveDate)}</span>
              <span className={`tag ${statusText[group.status].className}`}>{statusText[group.status].text}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setPrintMode('sorting')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${printMode === 'sorting' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              分拣签
            </button>
            <button
              onClick={() => setPrintMode('pickup')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${printMode === 'pickup' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              取货标签
            </button>
          </div>
          <button
            onClick={() => submitMark(false)}
            disabled={group.status === 'done' || checked.size === 0}
            className="btn-secondary"
          >
            <Check size={16} /> 标记已分拣 ({checked.size})
          </button>
          <button
            onClick={() => submitMark(true)}
            disabled={group.status === 'done'}
            className="btn-success"
          >
            <CheckCheck size={16} /> {group.status === 'done' ? '已完成' : '全部完成'}
          </button>
          <button onClick={doPrint} className="btn-primary">
            <Printer size={16} /> 打印{printMode === 'sorting' ? '分拣签' : '取货标签'}
          </button>
        </div>
      </div>

      {/* Progress & summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 no-print">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">分拣进度</h3>
            <button onClick={markAll} className="text-xs text-primary-600 hover:underline">全选</button>
          </div>
          <div className="flex items-center gap-5 mb-3">
            <div className="text-4xl font-bold text-primary-600">{sortedCount}<span className="text-lg text-gray-400 font-medium">/{totalMembers}</span></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary-500 via-amber-500 to-fresh-500 transition-all duration-500" style={{ width: progress + '%' }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-fresh-600">{progress}%</div>
          </div>
          <p className="text-xs text-gray-400">共 {totalMembers} 位团员，已分拣 {sortedCount} 位 · 按楼栋/门牌号排序</p>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-primary-500" /> 商品汇总
          </h3>
          <div className="space-y-3">
            {productAgg.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-800 line-clamp-1">{p.productName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.spec}</div>
                </div>
                <div className="text-xl font-bold text-primary-600">× {p.quantity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member list (screen) */}
      <div className="card no-print">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-fresh-500" /> 团员分拣列表
            <span className="text-xs font-normal text-gray-400">（按楼栋/门牌号排序）</span>
          </h3>
          <button className="btn-ghost text-xs"><Download size={14} /> 导出CSV</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {members.map((m, i) => {
            const isChecked = checked.has(m.orderId);
            return (
              <div key={m.orderId} onClick={() => toggle(m.orderId)} className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${isChecked ? 'border-fresh-500 bg-fresh-50/40' : 'border-gray-100 hover:border-primary-200 bg-white'}`}>
                <div className="absolute top-3 right-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isChecked ? 'bg-fresh-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    {isChecked && <Check size={14} />}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${isChecked ? 'bg-gradient-to-br from-fresh-500 to-fresh-400' : 'bg-gradient-to-br from-primary-500 to-amber-400'}`}>
                    {m.memberName[0]}
                  </div>
                  <div className="min-w-0 pr-8">
                    <div className="font-semibold text-gray-800">{m.memberName}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Phone size={11} /> {m.memberPhone}</span>
                    </div>
                    <div className="text-xs text-primary-600 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin size={11} /> {m.building} {m.roomNumber}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {m.items.map((it, j) => (
                    <div key={j} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/80">
                      <span className="text-gray-600 truncate pr-2">{it.productName}</span>
                      <span className="font-semibold text-gray-800 shrink-0">× {it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <QrCode size={12} /> <span className="text-xs font-mono font-bold">{m.pickupCode}</span>
                  </div>
                  <div className="text-sm font-bold text-primary-600">{formatMoney(m.totalAmount)}</div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-fresh-500 to-primary-500 opacity-0 transition-opacity" style={{ opacity: isChecked ? 1 : 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Print area - Sorting Labels */}
      {printMode === 'sorting' && (
        <div className="print-sorting-only">
          <div style={{ padding: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#111' }}>
              分拣签 · {group.productName} · 团期 {group.groupId.toUpperCase()}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {members.map((m) => <SortingLabel key={m.orderId} m={m} productName={group!.productName} />)}
            </div>
          </div>
        </div>
      )}

      {/* Print area - Pickup Labels (existing) */}
      {printMode === 'pickup' && (
        <>
          <div className="print-only">
            <div style={{ padding: 0 }}>
              {members.map((m) => <PickupLabel key={m.orderId} m={m} productName={group!.productName} />)}
            </div>
          </div>
          <div className="print-area">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map((m) => <PickupLabel key={m.orderId} m={m} productName={group!.productName} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortingLabel({ m, productName }: { m: MemberSorting; productName: string }) {
  return (
    <div className="break-inside-avoid bg-white border-2 border-gray-800 rounded-xl p-4" style={{ pageBreakInside: 'avoid' }}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-dashed border-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center text-white font-bold">
            {m.memberName[0]}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{m.memberName}</div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
              <MapPin size={10} /> {m.building} {m.roomNumber}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {m.items.map((it, j) => (
          <div key={j} className="flex items-center justify-between">
            <span className="text-sm text-gray-800 truncate pr-2 flex-1 leading-tight">{it.productName}</span>
            <span className="text-lg font-black text-primary-600 shrink-0 leading-none ml-2">×{it.quantity}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-dashed border-gray-300 flex items-center justify-between">
        <div className="text-[11px] text-gray-500">
          {m.building} <span className="font-semibold text-gray-700">{m.roomNumber}</span>
        </div>
        <div className="text-[10px] text-gray-400">
          {m.memberPhone}
        </div>
      </div>
    </div>
  );
}

function PickupLabel({ m, productName }: { m: MemberSorting; productName: string }) {
  return (
    <div className="print-label-page break-inside-avoid bg-white border-2 border-dashed border-gray-300 rounded-2xl p-5" style={{ pageBreakInside: 'avoid' }}>
      <div className="flex items-start justify-between mb-3 pb-3 border-b-2 border-dashed border-gray-200">
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">团长通 · 取货标签</div>
          <div className="text-base font-bold text-gray-800 mt-0.5 truncate max-w-[160px]">{productName}</div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center text-white font-bold text-lg">
          {m.memberName[0]}
        </div>
      </div>
      <div className="mb-2">
        <div className="text-xs text-gray-400">团员姓名</div>
        <div className="text-xl font-bold text-gray-800">{m.memberName}</div>
      </div>
      <div className="mb-2">
        <div className="text-xs text-gray-400">楼栋门牌</div>
        <div className="text-sm font-semibold text-primary-600 flex items-center gap-1">
          <MapPin size={12} /> {m.building} {m.roomNumber}
        </div>
      </div>
      <div className="mb-2">
        <div className="text-xs text-gray-400">联系电话</div>
        <div className="text-base font-semibold text-gray-700">{m.memberPhone}</div>
      </div>
      <div className="mb-3 p-3 rounded-xl bg-amber-50 border-2 border-amber-200 text-center">
        <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mb-1">取货码 Pickup Code</div>
        <div className="text-3xl font-black text-amber-700 tracking-widest font-mono">{m.pickupCode}</div>
      </div>
      <div className="border-t-2 border-dashed border-gray-200 pt-3 mb-2">
        <div className="text-[10px] text-gray-400 mb-1">商品明细</div>
        <div className="space-y-0.5">
          {m.items.map((it, j) => (
            <div key={j} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-gray-700 truncate pr-2 flex-1">{it.productName}</span>
              <span className="font-bold text-gray-800 shrink-0">×{it.quantity}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-gray-200">
        <span className="text-[10px] text-gray-400">合计</span>
        <span className="text-lg font-bold text-primary-600">{formatMoney(m.totalAmount)}</span>
      </div>
    </div>
  );
}
