import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, formatDate, statusText } from '@/lib/format';
import type { Order, ProductStats, MemberStats } from '../../shared/types';
import {
  BarChart3, Users, Package, ShoppingCart, DollarSign, Search, Filter,
  ChevronDown, ChevronRight, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, CartesianGrid } from 'recharts';

type Tab = 'product' | 'member' | 'orders';

const COLORS = ['#FF6B35', '#2E7D32', '#FFB74D', '#ED5220', '#81C784', '#FF8F00'];

export default function OrderStats() {
  const [tab, setTab] = useState<Tab>('product');
  const showToast = useAppStore(s => s.showToast);
  const [summary, setSummary] = useState<any>(null);
  const [byProduct, setByProduct] = useState<ProductStats[]>([]);
  const [byMember, setByMember] = useState<MemberStats[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const d = await api.orders.stats();
      setSummary(d.summary);
      setByProduct(d.byProduct.sort((a, b) => b.amount - a.amount));
      setByMember(d.byMember.sort((a, b) => b.amount - a.amount));
    } catch (e: any) { showToast('error', e); }
  };
  const loadOrders = async () => {
    try {
      const list = await api.orders.list({ keyword: keyword || undefined });
      setOrders(list);
    } catch (e: any) { showToast('error', e); }
  };
  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (tab === 'orders') loadOrders();
  }, [tab, keyword]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">团员下单统计</h1>
          <p className="text-sm text-gray-500 mt-1">按团品、团员维度查看下单明细</p>
        </div>
        <button className="btn-secondary"><Download size={16} /> 导出报表</button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: '总订单数', v: summary.totalOrders, icon: ShoppingCart, c: 'from-primary-500 to-primary-400' },
            { l: '团员人数', v: summary.totalMembers, icon: Users, c: 'from-fresh-500 to-fresh-400' },
            { l: '商品件数', v: summary.totalQuantity, icon: Package, c: 'from-amber-500 to-amber-400' },
            { l: '总销售额', v: formatMoney(summary.totalAmount), icon: DollarSign, c: 'from-indigo-500 to-indigo-400' },
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
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-500" /> 团品销售额排行 TOP 6
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProduct.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="productName" type="category" width={110} stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#374151' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(v: any) => [formatMoney(v), '销售额']} />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]} fill="#FF6B35" barSize={22}>
                  {byProduct.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-fresh-500" /> 销售占比
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byProduct.slice(0, 5)} dataKey="amount" nameKey="productName" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                  {byProduct.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(v: any) => [formatMoney(v), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {byProduct.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                <span className="flex-1 truncate">{p.productName}</span>
                <span className="font-semibold text-gray-700">{formatMoney(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex gap-1 -mb-px">
            {[{ k: 'product', l: '按团品统计', i: Package }, { k: 'member', l: '按团员统计', i: Users }, { k: 'orders', l: '全部订单', i: Filter }].map((t: any) => (
              <button key={t.k} onClick={() => setTab(t.k as Tab)} className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition ${tab === t.k ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <t.i size={16} /> {t.l}
              </button>
            ))}
          </div>
          {tab === 'orders' && (
            <div className="relative w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="订单号/团员..." className="input pl-9 h-9" />
            </div>
          )}
        </div>
        <div className="table-wrap">
          {tab === 'product' && (
            <table>
              <thead>
                <tr>
                  <th>团品名称</th>
                  <th className="text-center">团员数</th>
                  <th className="text-center">件数</th>
                  <th className="text-right">销售额</th>
                  <th className="text-right">占比</th>
                </tr>
              </thead>
              <tbody>
                {byProduct.map(p => {
                  const total = summary?.totalAmount || 1;
                  const rate = Math.round((p.amount / total) * 100);
                  return (
                    <tr key={p.productId}>
                      <td>
                        <div className="font-medium text-gray-800">{p.productName}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.spec}</div>
                      </td>
                      <td className="text-center font-semibold text-gray-700">{p.memberCount}</td>
                      <td className="text-center font-semibold text-gray-700">{p.quantity}</td>
                      <td className="text-right font-bold text-primary-600">{formatMoney(p.amount)}</td>
                      <td className="text-right" style={{ minWidth: 180 }}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-amber-500" style={{ width: rate + '%' }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-10 text-right">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {tab === 'member' && (
            <table>
              <thead>
                <tr>
                  <th>团员</th>
                  <th className="text-center">订单数</th>
                  <th className="text-center">件数</th>
                  <th className="text-right">消费金额</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {byMember.map((m, i) => {
                  const isEx = expanded === m.memberName + m.memberPhone;
                  const memberOrders = orders.filter(o => o.memberName === m.memberName && o.memberPhone === m.memberPhone);
                  return (
                    <>
                      <tr key={i} className="cursor-pointer" onClick={() => setExpanded(isEx ? null : m.memberName + m.memberPhone)}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-white text-sm font-semibold flex items-center justify-center">
                              {m.memberName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{m.memberName}</div>
                              <div className="text-xs text-gray-400">{m.memberPhone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center font-semibold text-gray-700">{m.orderCount}</td>
                        <td className="text-center font-semibold text-gray-700">{m.quantity}</td>
                        <td className="text-right font-bold text-primary-600">{formatMoney(m.amount)}</td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-1 text-xs text-gray-400">
                            {isEx ? <ChevronDown size={14} /> : <ChevronRight size={14} />} 查看明细
                          </div>
                        </td>
                      </tr>
                      {isEx && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50/60 p-0">
                            <div className="p-4 space-y-2">
                              {memberOrders.length > 0 ? memberOrders.map(o => (
                                <div key={o.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="text-xs font-mono text-primary-600">{o.orderNo}</div>
                                    <div className="flex-1 flex flex-wrap gap-2">
                                      {o.items.map((it, j) => (
                                        <span key={j} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                                          {it.productName} × {it.quantity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-right ml-4 shrink-0">
                                    <div className="font-semibold text-primary-600">{formatMoney(o.totalAmount)}</div>
                                    <div className={`tag mt-1 ${statusText[o.status].className}`}>{statusText[o.status].text}</div>
                                  </div>
                                </div>
                              )) : (
                                <div className="text-center py-4 text-sm text-gray-400">切换到"全部订单"Tab可加载更多明细</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
          {tab === 'orders' && (
            <table>
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>团员</th>
                  <th>商品明细</th>
                  <th className="text-center">取货码</th>
                  <th className="text-right">金额</th>
                  <th className="text-center">状态</th>
                  <th>下单时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs text-primary-600">{o.orderNo}</td>
                    <td>
                      <div className="font-medium text-gray-800">{o.memberName}</div>
                      <div className="text-xs text-gray-400">{o.memberPhone}</div>
                    </td>
                    <td className="max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {o.items.map((it, j) => (
                          <span key={j} className="text-xs px-2 py-1 bg-gray-50 rounded text-gray-600 border border-gray-100">
                            {it.productName} × {it.quantity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-mono font-semibold border border-amber-200">{o.pickupCode}</span>
                    </td>
                    <td className="text-right font-bold text-primary-600">{formatMoney(o.totalAmount)}</td>
                    <td className="text-center"><span className={`tag ${statusText[o.status].className}`}>{statusText[o.status].text}</span></td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
