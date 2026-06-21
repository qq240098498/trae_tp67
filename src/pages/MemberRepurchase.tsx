import { useEffect, useState, useMemo, Fragment } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, formatDate, formatDateShort, repurchaseLevelText, statusText } from '@/lib/format';
import type { MemberRepurchaseStats, RepurchaseSummary, Product, RecommendRecord } from '../../shared/types';
import {
  Users, TrendingUp, ShoppingBag, DollarSign, Activity, Star,
  Search, Filter, ChevronRight, ChevronDown, Send, Package,
  PieChart, Clock, CheckCircle, X, Megaphone
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

type FilterLevel = 'all' | 'high' | 'medium' | 'low' | 'new';
type Tab = 'list' | 'records';

const PIE_COLORS = ['#FF6B35', '#2E7D32', '#FFB74D', '#ED5220', '#81C784', '#FF8F00', '#5C6BC0', '#EC407A'];

export default function MemberRepurchase() {
  const showToast = useAppStore(s => s.showToast);
  const [tab, setTab] = useState<Tab>('list');
  const [summary, setSummary] = useState<RepurchaseSummary | null>(null);
  const [members, setMembers] = useState<MemberRepurchaseStats[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<RecommendRecord[]>([]);
  const [keyword, setKeyword] = useState('');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [recommendRemark, setRecommendRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, productsData, recordsData] = await Promise.all([
        api.memberRepurchase.stats(),
        api.memberRepurchase.products(),
        api.memberRepurchase.recommendRecords(),
      ]);
      setSummary(statsData.summary);
      setMembers(statsData.members);
      setProducts(productsData);
      setRecords(recordsData);
    } catch (e: any) {
      showToast('error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (filterLevel !== 'all') {
      list = list.filter(m => m.repurchaseLevel === filterLevel);
    }
    if (keyword) {
      list = list.filter(m =>
        m.memberName.includes(keyword) ||
        m.memberPhone.includes(keyword) ||
        m.building.includes(keyword)
      );
    }
    return list;
  }, [members, filterLevel, keyword]);

  const toggleMemberSelect = (key: string) => {
    const next = new Set(selectedMembers);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedMembers(next);
  };

  const toggleProductSelect = (id: string) => {
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProducts(next);
  };

  const selectAllFiltered = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.memberName + m.memberPhone)));
    }
  };

  const handleRecommend = async () => {
    if (selectedMembers.size === 0) {
      showToast('error', '请先选择要推荐的团员');
      return;
    }
    if (selectedProducts.size === 0) {
      showToast('error', '请选择要推荐的商品');
      return;
    }
    try {
      const memberList = members.filter(m => selectedMembers.has(m.memberName + m.memberPhone));
      const res = await api.memberRepurchase.recommend({
        memberNames: memberList.map(m => m.memberName),
        memberPhones: memberList.map(m => m.memberPhone),
        productIds: Array.from(selectedProducts),
        remark: recommendRemark || undefined,
      });
      showToast('success', res.message || '推荐成功');
      setShowRecommendModal(false);
      setSelectedMembers(new Set());
      setSelectedProducts(new Set());
      setRecommendRemark('');
      loadData();
      setTab('records');
    } catch (e: any) {
      showToast('error', e);
    }
  };

  const quickSelectHighActivity = () => {
    const highMembers = members.filter(m => m.repurchaseLevel === 'high');
    setSelectedMembers(new Set(highMembers.map(m => m.memberName + m.memberPhone)));
    setShowRecommendModal(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">团员复购分析</h1>
          <p className="text-sm text-gray-500 mt-1">分析团员消费行为，智能推荐新品提升复购</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={quickSelectHighActivity}>
            <Megaphone size={16} /> 向高活跃团员推荐
          </button>
          <button className="btn-primary" onClick={() => setShowRecommendModal(true)}>
            <Send size={16} /> 定向推荐新品
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-400 text-white p-5 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-white/80 text-xs">团员总数</div>
                <div className="text-2xl font-bold mt-1.5">{summary.totalMembers}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><Users size={18} /></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-fresh-500 to-fresh-400 text-white p-5 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-white/80 text-xs">高活跃团员</div>
                <div className="text-2xl font-bold mt-1.5">{summary.highActivityMembers}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><Star size={18} /></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-amber-500 to-amber-400 text-white p-5 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-white/80 text-xs">复购率</div>
                <div className="text-2xl font-bold mt-1.5">{summary.repurchaseRate}%</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><TrendingUp size={18} /></div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-400 text-white p-5 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-white/80 text-xs">平均客单价</div>
                <div className="text-2xl font-bold mt-1.5">{formatMoney(summary.avgOrderAmount)}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><DollarSign size={18} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Activity distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-primary-500" /> 活跃等级分布
          </h3>
          <div className="h-56">
            {summary && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: '高活跃', value: summary.highActivityMembers, color: '#2E7D32' },
                  { name: '中活跃', value: summary.mediumActivityMembers, color: '#FF6B35' },
                  { name: '低活跃', value: summary.lowActivityMembers, color: '#FFB74D' },
                  { name: '新团员', value: summary.newMembers, color: '#9CA3AF' },
                ]}>
                  <CartesianGrid horizontal={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                    {[0, 1, 2, 3].map((i) => (
                      <Cell key={i} fill={['#2E7D32', '#FF6B35', '#FFB74D', '#9CA3AF'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-fresh-500" /> 核心指标
          </h3>
          <div className="space-y-4">
            {summary && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">人均下单次数</span>
                  <span className="font-bold text-gray-800">{summary.avgOrderCount} 次</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-fresh-50 rounded-xl">
                  <span className="text-sm text-gray-600">中活跃团员</span>
                  <span className="font-bold text-fresh-600">{summary.mediumActivityMembers} 人</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm text-gray-600">低活跃团员</span>
                  <span className="font-bold text-amber-600">{summary.lowActivityMembers} 人</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">新团员</span>
                  <span className="font-bold text-gray-700">{summary.newMembers} 人</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex gap-1 -mb-px">
            {[{ k: 'list', l: '团员列表', i: Users }, { k: 'records', l: '推荐记录', i: Send }].map((t: any) => (
              <button key={t.k} onClick={() => setTab(t.k as Tab)} className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition ${tab === t.k ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <t.i size={16} /> {t.l}
                {t.k === 'records' && records.length > 0 && (
                  <span className="badge bg-primary-100 text-primary-600">{records.length}</span>
                )}
              </button>
            ))}
          </div>
          {tab === 'list' && (
            <div className="flex items-center gap-2 py-3 flex-wrap">
              <div className="relative w-52">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="团员姓名/手机/楼栋" className="input pl-9 h-9" />
              </div>
              <select value={filterLevel} onChange={e => setFilterLevel(e.target.value as FilterLevel)} className="input h-9 w-32">
                <option value="all">全部等级</option>
                <option value="high">高活跃</option>
                <option value="medium">中活跃</option>
                <option value="low">低活跃</option>
                <option value="new">新团员</option>
              </select>
              {selectedMembers.size > 0 && (
                <button className="btn-primary" onClick={() => setShowRecommendModal(true)}>
                  推荐给已选 ({selectedMembers.size})
                </button>
              )}
            </div>
          )}
        </div>

        {tab === 'list' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="w-10">
                    <input type="checkbox"
                      checked={filteredMembers.length > 0 && selectedMembers.size === filteredMembers.length}
                      onChange={selectAllFiltered}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                    />
                  </th>
                  <th>团员</th>
                  <th className="text-center">活跃等级</th>
                  <th className="text-center">消费频次</th>
                  <th className="text-right">累计消费</th>
                  <th className="text-right">客单价</th>
                  <th>偏好品类</th>
                  <th className="text-center">活跃分</th>
                  <th>最近下单</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, i) => {
                  const key = m.memberName + m.memberPhone;
                  const isExpanded = expandedMember === key;
                  const isSelected = selectedMembers.has(key);
                  return (
                    <Fragment key={i}>
                      <tr className="cursor-pointer" onClick={() => setExpandedMember(isExpanded ? null : key)}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected}
                            onChange={() => toggleMemberSelect(key)}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-white text-sm font-semibold flex items-center justify-center">
                              {m.memberName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{m.memberName}</div>
                              <div className="text-xs text-gray-400">{m.memberPhone} · {m.building}{m.roomNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`tag ${repurchaseLevelText[m.repurchaseLevel].className}`}>
                            {repurchaseLevelText[m.repurchaseLevel].text}
                          </span>
                        </td>
                        <td className="text-center font-semibold text-gray-700">{m.orderCount} 次</td>
                        <td className="text-right font-bold text-primary-600">{formatMoney(m.totalAmount)}</td>
                        <td className="text-right font-medium text-gray-700">{formatMoney(m.avgOrderAmount)}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {m.categories.slice(0, 3).map((c, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                {c.category}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-fresh-500 to-primary-500"
                                style={{ width: m.activityScore + '%' }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{m.activityScore}</span>
                          </div>
                        </td>
                        <td className="text-xs text-gray-500 whitespace-nowrap">{formatDateShort(m.lastOrderAt)}</td>
                        <td className="text-right" onClick={e => e.stopPropagation()}>
                          <button className="btn-ghost h-8 text-xs" onClick={(e) => {
                            e.stopPropagation();
                            toggleMemberSelect(key);
                            setShowRecommendModal(true);
                          }}>
                            <Send size={14} /> 推荐
                          </button>
                          <div className="inline-flex items-center gap-1 text-xs text-gray-400 ml-2">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="bg-gray-50/60 p-0">
                            <div className="p-5">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Category preference */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <PieChart size={16} className="text-primary-500" /> 消费品类偏好
                                  </h4>
                                  <div className="flex items-center gap-4">
                                    <div className="w-36 h-36 shrink-0">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPie>
                                          <Pie data={m.categories} dataKey="amount" nameKey="category"
                                            cx="50%" cy="50%" outerRadius={55} innerRadius={30} paddingAngle={2}>
                                            {m.categories.map((_, j) => (
                                              <Cell key={j} fill={PIE_COLORS[j % PIE_COLORS.length]} />
                                            ))}
                                          </Pie>
                                          <Tooltip formatter={(v: any) => [formatMoney(v), '']} />
                                        </RechartsPie>
                                      </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      {m.categories.map((c, j) => (
                                        <div key={j} className="flex items-center gap-2 text-xs">
                                          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[j % PIE_COLORS.length] }} />
                                          <span className="flex-1 text-gray-600">{c.category}</span>
                                          <span className="font-semibold text-gray-700">{c.percentage}%</span>
                                          <span className="text-gray-400">{formatMoney(c.amount)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Recent orders */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={16} className="text-fresh-500" /> 最近订单
                                  </h4>
                                  <div className="space-y-2 max-h-44 overflow-y-auto scrollbar-thin">
                                    {m.recentOrders.map(o => (
                                      <div key={o.orderId} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-mono text-primary-600">{o.orderNo}</span>
                                          <span className={`tag ${statusText[o.status].className}`}>{statusText[o.status].text}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-1.5">
                                          {o.items.map((it, j) => (
                                            <span key={j} className="text-xs px-1.5 py-0.5 bg-white rounded text-gray-600 border border-gray-100">
                                              {it.productName} × {it.quantity}
                                            </span>
                                          ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>{formatDate(o.createdAt)}</span>
                                          <span className="font-semibold text-primary-600">{formatMoney(o.totalAmount)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Recommend products hint */}
                              {m.recommendedProducts.length > 0 && (
                                <div className="mt-5 p-4 bg-primary-50 rounded-xl border border-primary-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Package size={16} className="text-primary-500" />
                                    <span className="text-sm font-semibold text-primary-700">智能推荐商品（基于偏好品类）</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {products.filter(p => m.recommendedProducts.includes(p.id)).map(p => (
                                      <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-primary-100">
                                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <div>
                                          <div className="text-sm font-medium text-gray-800">{p.name}</div>
                                          <div className="text-xs text-primary-600 font-semibold">{formatMoney(p.price)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {filteredMembers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-sm text-gray-400">暂无匹配的团员数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'records' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>推荐时间</th>
                  <th>团员</th>
                  <th>推荐商品</th>
                  <th>备注</th>
                  <th className="text-center">状态</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td>
                      <div className="font-medium text-gray-800">{r.memberName}</div>
                      <div className="text-xs text-gray-400">{r.memberPhone}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {r.productNames.map((n, j) => (
                          <span key={j} className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded border border-primary-100">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-sm text-gray-500">{r.remark || '-'}</td>
                    <td className="text-center">
                      <span className="tag bg-fresh-50 text-fresh-600 border-fresh-200">
                        <CheckCircle size={12} /> 已发送
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-gray-400">暂无推荐记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommend Modal */}
      {showRecommendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Megaphone size={20} className="text-primary-500" />
                定向推荐新品
              </h3>
              <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
                onClick={() => setShowRecommendModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              {/* Selected members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">已选团员 ({selectedMembers.size}人)</label>
                  <button className="text-xs text-primary-500 hover:text-primary-600"
                    onClick={() => { setShowRecommendModal(false); }}>
                    修改选择
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl min-h-[60px] max-h-28 overflow-y-auto scrollbar-thin">
                  {selectedMembers.size > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {members.filter(m => selectedMembers.has(m.memberName + m.memberPhone)).map(m => (
                        <span key={m.memberName + m.memberPhone} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-sm border border-gray-200">
                          {m.memberName}
                          <button onClick={() => toggleMemberSelect(m.memberName + m.memberPhone)}
                            className="text-gray-400 hover:text-red-500 ml-0.5">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">请先在团员列表中选择要推荐的团员</p>
                  )}
                </div>
              </div>

              {/* Product selection */}
              <div>
                <label className="label">选择推荐商品</label>
                <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto scrollbar-thin p-1">
                  {products.map(p => {
                    const checked = selectedProducts.has(p.id);
                    return (
                      <label key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          checked ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-primary-200 bg-white'
                        }`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleProductSelect(p.id)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                          <div className="text-xs text-gray-400 truncate">{p.spec} · {p.category}</div>
                          <div className="text-sm font-bold text-primary-600">{formatMoney(p.price)}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="label">推荐留言（可选）</label>
                <textarea value={recommendRemark} onChange={e => setRecommendRemark(e.target.value)}
                  rows={3} placeholder="填写推荐理由或优惠信息..."
                  className="input resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowRecommendModal(false)}>取消</button>
              <button className="btn-primary" onClick={handleRecommend}>
                <Send size={16} /> 发送推荐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
