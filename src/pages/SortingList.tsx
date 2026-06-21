import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatDateShort, statusText } from '@/lib/format';
import type { SortingGroup, MemberSorting } from '../../shared/types';
import { Boxes, Calendar, Users, Package, ArrowRight, Clock, CheckCircle2, Filter, Printer, X, MapPin } from 'lucide-react';

export default function SortingList() {
  const sortingGroups = useAppStore(s => s.sortingGroups);
  const setSortingGroups = useAppStore(s => s.setSortingGroups);
  const showToast = useAppStore(s => s.showToast);

  const [printGroup, setPrintGroup] = useState<SortingGroup | null>(null);
  const [printMembers, setPrintMembers] = useState<MemberSorting[]>([]);
  const [printLoading, setPrintLoading] = useState(false);

  const load = async () => {
    try {
      const list = await api.sorting.list();
      setSortingGroups(list);
    } catch (e: any) { showToast('error', e); }
  };
  useEffect(() => { load(); }, []);

  const stats = {
    total: sortingGroups.length,
    pending: sortingGroups.filter(g => g.status === 'pending').length,
    sorting: sortingGroups.filter(g => g.status === 'sorting').length,
    done: sortingGroups.filter(g => g.status === 'done').length,
  };

  const openPrint = async (g: SortingGroup) => {
    setPrintGroup(g);
    setPrintLoading(true);
    setPrintMembers([]);
    try {
      const d = await api.sorting.get(g.id);
      setPrintMembers(d.members);
    } catch (e: any) { showToast('error', e); }
    setPrintLoading(false);
  };

  const closePrint = () => {
    setPrintGroup(null);
    setPrintMembers([]);
  };

  const doPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">到货分拣</h1>
          <p className="text-sm text-gray-500 mt-1">按团期查看分拣单，打印标签完成分拣</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary"><Filter size={16} /> 筛选</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: '总分拣单', v: stats.total, icon: Boxes, c: 'from-indigo-500 to-indigo-400' },
          { l: '待分拣', v: stats.pending, icon: Clock, c: 'from-primary-500 to-primary-400' },
          { l: '分拣中', v: stats.sorting, icon: Package, c: 'from-amber-500 to-amber-400' },
          { l: '已完成', v: stats.done, icon: CheckCircle2, c: 'from-fresh-500 to-fresh-400' },
        ].map((c, i) => {
          const I = c.icon as any;
          return (
            <div key={i} className={`card bg-gradient-to-br ${c.c} text-white p-5 relative overflow-hidden`}>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-white/80 text-xs">{c.l}</div>
                  <div className="text-2xl font-bold mt-1.5">{c.v}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><I size={18} /></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortingGroups.map(g => (
          <div key={g.id} className="group card p-5 hover:shadow-hover transition-all hover:-translate-y-0.5">
            <Link to={`/sorting/${g.id}`} className="block">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                    g.status === 'done' ? 'bg-gradient-to-br from-fresh-500 to-fresh-400'
                    : g.status === 'sorting' ? 'bg-gradient-to-br from-amber-500 to-amber-400'
                    : 'bg-gradient-to-br from-primary-500 to-primary-400'
                  }`}>
                    <Boxes size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]">{g.productName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">团期 {g.groupId.toUpperCase()}</div>
                  </div>
                </div>
                <span className={`tag ${statusText[g.status].className}`}>{statusText[g.status].text}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50/70 rounded-xl">
                <div className="text-center">
                  <div className="text-xs text-gray-400">团员数</div>
                  <div className="text-lg font-bold text-gray-800 mt-0.5">{g.totalMembers}</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-xs text-gray-400">总件数</div>
                  <div className="text-lg font-bold text-primary-600 mt-0.5">{g.totalQuantity}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">订单数</div>
                  <div className="text-lg font-bold text-gray-800 mt-0.5">{g.orderIds.length}</div>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={13} className="text-primary-500 shrink-0" />
                  <span>截团: {formatDate(g.deadline)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users size={13} className="text-fresh-500 shrink-0" />
                  <span>到货: {formatDateShort(g.arriveDate)}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPrint(g); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 hover:bg-primary-100 transition"
              >
                <Printer size={13} /> 一键打印分拣签
              </button>
              <Link to={`/sorting/${g.id}`} className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                进入分拣 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}

        {sortingGroups.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 card py-20 flex flex-col items-center gap-3 text-gray-400">
            <Boxes size={48} className="text-gray-200" />
            <div>暂无分拣单，有团期截团后会自动生成</div>
          </div>
        )}
      </div>

      {printGroup && (
        <div className="fixed inset-0 z-50 no-print">
          <div className="absolute inset-0 bg-black/50" onClick={closePrint} />
          <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">分拣签预览 - {printGroup.productName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">共 {printMembers.length} 位团员 · 按楼栋/门牌号排序</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={doPrint} disabled={printLoading || printMembers.length === 0} className="btn-primary">
                  <Printer size={16} /> 立即打印
                </button>
                <button onClick={closePrint} className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
              {printLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    加载团员数据中...
                  </div>
                </div>
              ) : (
                <div className="print-sorting-area grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {printMembers.map((m) => <SortingLabel key={m.orderId} m={m} productName={printGroup!.productName} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="print-sorting-only">
        {printGroup && printMembers.length > 0 && (
          <div style={{ padding: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#111' }}>
              分拣签 · {printGroup.productName} · 团期 {printGroup.groupId.toUpperCase()}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" style={{ pageBreakInside: 'auto' }}>
              {printMembers.map((m) => <SortingLabel key={m.orderId} m={m} productName={printGroup.productName} />)}
            </div>
          </div>
        )}
      </div>
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
