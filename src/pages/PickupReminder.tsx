import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, formatDate, disposeTypeText, reminderLevelText } from '@/lib/format';
import type { PickupReminder as PickupReminderType } from '../../shared/types';
import {
  Clock, AlertTriangle, PackageX, Archive,
  Search, Bell, RefreshCw, Check, Phone, MapPin, QrCode,
  X, MessageSquare, History
} from 'lucide-react';

const REMIND_COOLDOWN_MINUTES = 5;

type TabType = 'overdue' | 'stored' | 'returned';

export default function PickupReminder() {
  const showToast = useAppStore(s => s.showToast);
  const [tab, setTab] = useState<TabType>('overdue');
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [disposeModal, setDisposeModal] = useState<{ order: any; type: 'stored' | 'returned' } | null>(null);
  const [disposeRemark, setDisposeRemark] = useState('');
  const [reminderModal, setReminderModal] = useState<any>(null);
  const [reminderList, setReminderList] = useState<PickupReminderType[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    try {
      const s = await api.pickupReminder.stats();
      setStats(s);
    } catch (e: any) { showToast('error', e); }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const list = await api.pickupReminder.orders({ 
        type: tab === 'overdue' ? 'overdue' : tab,
        keyword: keyword.trim() || undefined
      });
      setOrders(list);
      setSelected(new Set());
    } catch (e: any) { showToast('error', e); }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [tab]);

  const handleSearch = () => {
    loadOrders();
  };

  const toggleSelect = (orderId: string) => {
    const next = new Set(selected);
    if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map(o => o.id)));
    }
  };

  const handleRemind = async (orderId: string) => {
    try {
      const r = await api.pickupReminder.remind(orderId);
      showToast('success', r.message || '提醒发送成功');
      loadOrders();
      loadStats();
    } catch (e: any) { showToast('error', e); }
  };

  const handleBatchRemind = async () => {
    if (selected.size === 0) {
      showToast('info', '请选择要提醒的订单');
      return;
    }
    try {
      const r = await api.pickupReminder.remindBatch(Array.from(selected));
      showToast('success', r.message || '批量提醒完成');
      loadOrders();
      loadStats();
    } catch (e: any) { showToast('error', e); }
  };

  const openDisposeModal = (order: any, type: 'stored' | 'returned') => {
    setDisposeModal({ order, type });
    setDisposeRemark('');
  };

  const handleDispose = async () => {
    if (!disposeModal) return;
    try {
      const r = await api.pickupReminder.dispose(
        disposeModal.order.id, 
        disposeModal.type, 
        disposeRemark || undefined
      );
      showToast('success', r.message || '操作成功');
      setDisposeModal(null);
      loadOrders();
      loadStats();
    } catch (e: any) { showToast('error', e); }
  };

  const openReminderHistory = async (order: any) => {
    try {
      const list = await api.pickupReminder.reminders({ orderId: order.id });
      setReminderList(list);
      setReminderModal(order);
    } catch (e: any) { showToast('error', e); }
  };

  const getCooldownSeconds = (order: any): number => {
    if (!order.lastRemindedAt) return 0;
    const diff = now - new Date(order.lastRemindedAt).getTime();
    const remain = REMIND_COOLDOWN_MINUTES * 60 * 1000 - diff;
    return remain > 0 ? Math.ceil(remain / 1000) : 0;
  };

  const formatCooldown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s.toString().padStart(2, '0')}秒`;
  };

  const canRemind = (order: any): boolean => {
    if (order.reminderLevel >= 2) return false;
    return getCooldownSeconds(order) === 0;
  };

  const TABS = [
    { key: 'overdue', label: '超时未取', icon: AlertTriangle, count: stats ? stats.level1 + stats.level2 : 0, color: 'text-amber-600' },
    { key: 'stored', label: '已代存', icon: Archive, count: stats?.stored || 0, color: 'text-primary-600' },
    { key: 'returned', label: '已退货', icon: PackageX, count: stats?.returned || 0, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">取货超时催收</h1>
          <p className="text-sm text-gray-500 mt-1">到货后超时未取的订单管理，支持提醒、代存和退货处理</p>
        </div>
        <button onClick={() => { loadStats(); loadOrders(); }} className="btn-secondary">
          <RefreshCw size={16} /> 刷新数据
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5 bg-gradient-to-br from-amber-50 to-white border border-amber-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-amber-600 font-medium">超时24小时</div>
                <div className="text-3xl font-bold text-amber-600 mt-1.5">{stats.level1}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
            </div>
          </div>
          <div className="card p-5 bg-gradient-to-br from-red-50 to-white border border-red-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-red-600 font-medium">超时48小时</div>
                <div className="text-3xl font-bold text-red-600 mt-1.5">{stats.level2}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>
          <div className="card p-5 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-primary-600 font-medium">代存</div>
                <div className="text-3xl font-bold text-primary-600 mt-1.5">{stats.stored}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                <Archive size={20} />
              </div>
            </div>
          </div>
          <div className="card p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-600 font-medium">已退货</div>
                <div className="text-3xl font-bold text-gray-600 mt-1.5">{stats.returned}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <PackageX size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & search */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} className={active ? t.color : ''} />
                  {t.label}
                  {t.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      active ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索团员/订单号/取货码..."
                className="input pl-9 h-9 w-64 bg-gray-50"
              />
            </div>
            {tab === 'overdue' && (
              <>
                <button
                  onClick={handleBatchRemind}
                  disabled={selected.size === 0 || orders.filter(o => selected.has(o.id)).some(o => !canRemind(o))}
                  className="btn-primary"
                  title={
                    orders.some(o => selected.has(o.id) && !canRemind(o) && o.reminderLevel < 2)
                      ? '部分选中订单处于冷却中或已达最大提醒次数'
                      : ''
                  }
                >
                  <Bell size={16} /> 批量提醒 ({selected.size})
                </button>
                <button
                  onClick={selectAll}
                  className="btn-ghost text-xs"
                >
                  {selected.size === orders.length ? '取消全选' : '全选'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Order list */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw size={20} className="animate-spin mr-3" /> 加载中...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Clock size={48} className="mx-auto mb-3 text-gray-200" />
              <div>暂无{
                tab === 'overdue' ? '超时未取' : tab === 'stored' ? '代存' : '退货'
              }订单</div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    tab === 'overdue'
                      ? selected.has(order.id)
                        ? 'border-primary-500 bg-primary-50/40'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {tab === 'overdue' && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleSelect(order.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                            selected.has(order.id)
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {selected.has(order.id) && <Check size={14} />}
                        </button>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            order.reminderLevel >= 2
                              ? 'bg-gradient-to-br from-red-500 to-red-400'
                              : order.reminderLevel >= 1
                                ? 'bg-gradient-to-br from-amber-500 to-amber-400'
                                : 'bg-gradient-to-br from-primary-500 to-primary-400'
                          }`}>
                            {order.memberName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-800 truncate">{order.memberName}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-mono text-primary-600">{order.orderNo}</span>
                              <span className="flex items-center gap-1"><Phone size={11} /> {order.memberPhone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {order.reminderLevel > 0 && (
                            <span className={`tag ${reminderLevelText[order.reminderLevel].className}`}>
                              {reminderLevelText[order.reminderLevel].text}
                            </span>
                          )}
                          <span className={`tag ${disposeTypeText[order.disposeType].className}`}>
                            {disposeTypeText[order.disposeType].text}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-primary-500" />
                          {order.building} {order.roomNumber}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <QrCode size={14} className="text-amber-500" />
                          <span className="font-mono font-bold text-amber-600">{order.pickupCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          到货 {formatDate(order.arriveDate)}
                        </div>
                        {order.hoursSinceArrive !== undefined && order.disposeType === 'normal' && (
                          <div className={`flex items-center gap-1.5 font-medium ${
                            order.hoursSinceArrive >= 48 ? 'text-red-500' : 'text-amber-500'
                          }`}>
                            <AlertTriangle size={14} />
                            超时 {order.hoursSinceArrive} 小时
                          </div>
                        )}
                        {order.disposedAt && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Check size={14} className="text-fresh-500" />
                            {order.disposeType === 'stored' ? '代存' : '退货'}于 {formatDate(order.disposedAt)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">商品：</span>
                          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {order.productName}
                          </span>
                          <span className="text-sm text-gray-500">× {order.totalQuantity}</span>
                        </div>
                        <div className="text-lg font-bold text-primary-600">{formatMoney(order.totalAmount)}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => openReminderHistory(order)}
                          className="btn-ghost text-xs"
                        >
                          <History size={14} /> 提醒记录
                        </button>
                        {tab === 'overdue' && (
                          <>
                            {order.reminderLevel < 2 && getCooldownSeconds(order) > 0 ? (
                              <span className="text-xs text-gray-400 flex items-center gap-1 px-2">
                                <Clock size={12} className="animate-pulse" />
                                冷却中 {formatCooldown(getCooldownSeconds(order))}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRemind(order.id)}
                                disabled={order.reminderLevel >= 2}
                                className="btn-secondary text-xs"
                              >
                                <Bell size={14} /> 发送提醒
                              </button>
                            )}
                            <button
                              onClick={() => openDisposeModal(order, 'stored')}
                              className="btn-secondary text-xs"
                            >
                              <Archive size={14} /> 代存
                            </button>
                            <button
                              onClick={() => openDisposeModal(order, 'returned')}
                              className="btn-danger text-xs"
                            >
                              <PackageX size={14} /> 退货
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dispose modal */}
      {disposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDisposeModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {disposeModal.type === 'stored' ? '代存确认' : '退货确认'}
              </h3>
              <button
                onClick={() => setDisposeModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{disposeModal.order.memberName}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="font-mono text-primary-600">{disposeModal.order.orderNo}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {disposeModal.order.productName} × {disposeModal.order.totalQuantity}
                </div>
                <div className="text-lg font-bold text-primary-600 mt-2">
                  {formatMoney(disposeModal.order.totalAmount)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">备注（可选）</label>
                <textarea
                  value={disposeRemark}
                  onChange={e => setDisposeRemark(e.target.value)}
                  placeholder={
                    disposeModal.type === 'stored'
                      ? '请输入代存备注，如存放位置、注意事项等...'
                      : '请输入退货原因...'
                  }
                  className="input h-24 resize-none"
                  rows={3}
                />
              </div>
              {disposeModal.type === 'stored' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      代存后订单将从"超时未取"移至"已代存"，请妥善保管商品并告知团员。
                    </div>
                  </div>
                </div>
              )}
              {disposeModal.type === 'returned' && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-700">
                      退货后订单将从"超时未取"移至"已退货"，请及时处理商品退款事宜。
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setDisposeModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDispose}
                className={disposeModal.type === 'stored' ? 'btn-primary' : 'btn-danger'}
              >
                {disposeModal.type === 'stored' ? '确认代存' : '确认退货'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder history modal */}
      {reminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReminderModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-800">提醒记录</h3>
              <button
                onClick={() => setReminderModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 shrink-0">
              <div className="text-sm font-medium text-gray-800">{reminderModal.memberName}</div>
              <div className="text-xs text-gray-500 mt-0.5 font-mono">{reminderModal.orderNo}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {reminderList.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
                  <div>暂无提醒记录</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminderList.map((r, i) => (
                    <div key={r.id} className="relative pl-6 pb-4">
                      {i < reminderList.length - 1 && (
                        <div className="absolute left-[7px] top-3 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                        r.level === 2 ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'
                      }`}>
                        <Bell size={8} className={`absolute inset-0 m-auto ${
                          r.level === 2 ? 'text-red-500' : 'text-amber-500'
                        }`} />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`tag text-xs ${
                            r.level === 2
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            第{r.level}次提醒
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
