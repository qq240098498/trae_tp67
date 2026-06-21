import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatDateShort, statusText } from '@/lib/format';
import type { SortingGroup } from '../../shared/types';
import { Boxes, Calendar, Users, Package, ArrowRight, Clock, CheckCircle2, Filter, Printer } from 'lucide-react';

export default function SortingList() {
  const sortingGroups = useAppStore(s => s.sortingGroups);
  const setSortingGroups = useAppStore(s => s.setSortingGroups);
  const showToast = useAppStore(s => s.showToast);

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
          <Link key={g.id} to={`/sorting/${g.id}`} className="group card p-5 hover:shadow-hover transition-all hover:-translate-y-0.5">
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

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Printer size={13} /> 可打印分拣标签
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                进入分拣 <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}

        {sortingGroups.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 card py-20 flex flex-col items-center gap-3 text-gray-400">
            <Boxes size={48} className="text-gray-200" />
            <div>暂无分拣单，有团期截团后会自动生成</div>
          </div>
        )}
      </div>
    </div>
  );
}
