import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatMoney, aftersaleTypeText, statusText } from '@/lib/format';
import type { Aftersale } from '../../shared/types';
import {
  RefreshCw, Plus, Search, FileText, Package, AlertOctagon,
  CheckCircle2, Clock, XCircle, ArrowRight, Filter, ChevronDown
} from 'lucide-react';

type TypeFilter = 'all' | 'out_of_stock' | 'damaged' | 'quality';
type StatusFilter = 'all' | 'pending' | 'approved' | 'completed';

export default function AftersaleList() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [list, setList] = useState<Aftersale[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [keyword, setKeyword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (keyword.trim()) params.keyword = keyword.trim();
      const r = await api.aftersale.list(params);
      setList(r);
    } catch (e: any) { showToast('error', e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') load();
  };

  const handleUpdateStatus = async (id: string, status: Aftersale['status']) => {
    try {
      const r: any = await api.aftersale.updateStatus(id, status);
      if (r.code === 0) {
        showToast('success', r.message || '状态更新成功');
        load();
      }
    } catch (e: any) { showToast('error', e); }
  };

  const stats = {
    pending: list.filter(a => a.status === 'pending').length,
    approved: list.filter(a => a.status === 'approved').length,
    completed: list.filter(a => a.status === 'completed').length,
    totalAmount: list.filter(a => a.status === 'completed').reduce((s, a) => s + a.refundAmount, 0),
  };

  const typeTabs: { k: TypeFilter; l: string; icon: any; color: string }[] = [
    { k: 'all', l: '全部', icon: FileText, color: 'text-gray-600' },
    { k: 'out_of_stock', l: '缺货退款', icon: Package, color: 'text-primary-600' },
    { k: 'damaged', l: '破损退款', icon: AlertOctagon, color: 'text-red-600' },
    { k: 'quality', l: '质量问题', icon: XCircle, color: 'text-amber-600' },
  ];

  const statusTabs: { k: StatusFilter; l: string; icon: any; bg: string; text: string }[] = [
    { k: 'all', l: '全部状态', icon: FileText, bg: 'bg-gray-50', text: 'text-gray-600' },
    { k: 'pending', l: '待处理', icon: Clock, bg: 'bg-primary-50', text: 'text-primary-600' },
    { k: 'approved', l: '退款中', icon: RefreshCw, bg: 'bg-amber-50', text: 'text-amber-600' },
    { k: 'completed', l: '已完成', icon: CheckCircle2, bg: 'bg-fresh-50', text: 'text-fresh-600' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">售后登记</h1>
          <p className="text-sm text-gray-500 mt-1">处理团员退款申请，跟踪售后进度</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="btn-ghost flex items-center gap-1.5">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 刷新
          </button>
          <button onClick={() => navigate('/aftersale/new')} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> 登记售后
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500">待处理</div>
              <div className="text-2xl font-bold text-primary-700">{stats.pending}</div>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <RefreshCw size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500">退款中</div>
              <div className="text-2xl font-bold text-amber-700">{stats.approved}</div>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-fresh-50 to-white border-fresh-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-fresh-500 text-white flex items-center justify-center shadow-lg shadow-fresh-500/20">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500">已完成</div>
              <div className="text-2xl font-bold text-fresh-700">{stats.completed}</div>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-red-50 to-white border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-base font-bold">¥</span>
            </div>
            <div>
              <div className="text-xs text-gray-500">累计退款</div>
              <div className="text-2xl font-bold text-red-700">{formatMoney(stats.totalAmount).replace('¥', '')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {statusTabs.map(t => (
              <button
                key={t.k}
                onClick={() => setStatusFilter(t.k)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition border ${
                  statusFilter === t.k
                    ? `${t.bg} ${t.text} border-current shadow-sm`
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <t.icon size={13} /> {t.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-gray-400 shrink-0 w-5">类型</div>
          <div className="flex flex-wrap gap-1.5">
            {typeTabs.map(t => (
              <button
                key={t.k}
                onClick={() => setTypeFilter(t.k)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                  typeFilter === t.k
                    ? `bg-gray-800 text-white shadow-sm`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <t.icon size={11} className={typeFilter === t.k ? '' : t.color} /> {t.l}
              </button>
            ))}
          </div>
        </div>
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="搜索订单号 / 团员姓名"
            className="input pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card py-16 text-center text-gray-400">
            <RefreshCw size={24} className="mx-auto animate-spin mb-2" />
            加载中...
          </div>
        ) : list.length === 0 ? (
          <div className="card py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={32} className="text-gray-300" />
            </div>
            <div className="text-gray-500 mb-4">暂无售后记录</div>
            <button onClick={() => navigate('/aftersale/new')} className="btn-primary inline-flex items-center gap-1.5">
              <Plus size={14} /> 登记第一笔售后
            </button>
          </div>
        ) : (
          list.map(a => (
            <div key={a.id} className="card p-5 hover:shadow-md transition">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`tag ${aftersaleTypeText[a.type].className}`}>
                      {aftersaleTypeText[a.type].text}
                    </span>
                    <span className={`tag ${statusText[a.status].className}`}>
                      {statusText[a.status].text}
                    </span>
                    <span className="font-mono text-xs text-gray-400">单号 {a.orderNo}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
                    <span className="text-gray-800 font-medium">{a.memberName}</span>
                    {a.productName && (
                      <span className="text-gray-600 flex items-center gap-1">
                        <Package size={12} className="text-primary-400" />
                        {a.productName}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">{formatDate(a.createdAt)}</span>
                  </div>
                  {a.remark && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      💬 {a.remark}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-center lg:text-right lg:min-w-[120px]">
                  <div className="text-xs text-gray-400">退款金额</div>
                  <div className="text-2xl font-bold text-red-600">{formatMoney(a.refundAmount)}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  {a.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(a.id, 'approved')}
                      className="btn-secondary flex items-center gap-1 text-sm"
                    >
                      <RefreshCw size={13} /> 审核通过
                    </button>
                  )}
                  {a.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(a.id, 'completed')}
                      className="btn-primary flex items-center gap-1 text-sm"
                    >
                      <CheckCircle2 size={13} /> 确认退款
                    </button>
                  )}
                  {a.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-xs text-fresh-600 px-3 py-1.5 rounded-lg bg-fresh-50 border border-fresh-200">
                      <CheckCircle2 size={13} /> 已退款
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
