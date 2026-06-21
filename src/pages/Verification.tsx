import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatMoney, statusText } from '@/lib/format';
import type { Order, VerificationRecord } from '../../shared/types';
import {
  ScanLine, QrCode, Search, CheckCircle2, AlertTriangle, XCircle, Phone, User, Package,
  History, RefreshCw, ChevronRight
} from 'lucide-react';

type Tab = 'verify' | 'records';

export default function Verification() {
  const [tab, setTab] = useState<Tab>('verify');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'warning' | 'error' | null; order?: Order; message?: string }>({ type: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const showToast = useAppStore(s => s.showToast);
  const [records, setRecords] = useState<VerificationRecord[]>([]);

  const loadRecords = async () => {
    try {
      const r = await api.verification.records();
      setRecords(r);
    } catch (e: any) { showToast('error', e); }
  };
  useEffect(() => {
    if (tab === 'records') loadRecords();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [tab]);

  const submit = async () => {
    if (!code.trim()) return;
    try {
      const r: any = await api.verification.verify(code.trim());
      if (r.code === 0) {
        setResult({ type: 'success', order: r.data, message: r.message });
        showToast('success', r.message);
      } else if (r.code === 2) {
        setResult({ type: 'warning', order: r.data, message: r.message });
        showToast('info', r.message);
      }
    } catch (e: any) {
      setResult({ type: 'error', message: e });
      showToast('error', e);
    }
    setCode('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const todayCount = records.filter(r => {
    const d1 = new Date(r.verifiedAt);
    const d2 = new Date();
    return d1.toDateString() === d2.toDateString();
  }).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">取货核销</h1>
          <p className="text-sm text-gray-500 mt-1">输入取货码或扫码，快速核销团员取货</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[{ k: 'verify', l: '核销台', i: ScanLine }, { k: 'records', l: '核销记录', i: History }].map((t: any) => (
          <button key={t.k} onClick={() => setTab(t.k as Tab)} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${tab === t.k ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.i size={16} /> {t.l}
          </button>
        ))}
      </div>

      {tab === 'verify' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Scanner area */}
          <div className="lg:col-span-3 card p-8 bg-gradient-to-br from-white via-white to-primary-50/30">
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center text-white shadow-xl shadow-primary-500/30">
                  <ScanLine size={36} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">输入取货码或扫码</h2>
                <p className="text-sm text-gray-500 mt-1">6位数字取货码，或完整订单号</p>
              </div>

              <div className="relative mb-5">
                <QrCode size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  ref={inputRef}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="请输入取货码 (如 852369)"
                  className="w-full h-16 pl-14 pr-32 rounded-2xl border-2 border-primary-200 bg-white text-2xl font-mono font-bold tracking-wider text-gray-800 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition"
                  maxLength={20}
                />
                <button onClick={submit} disabled={!code.trim()} className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 text-white font-semibold shadow-lg shadow-primary-500/30 disabled:opacity-50 hover:scale-[1.02] transition">
                  核销
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1"><RefreshCw size={12} /> 支持连续扫码</span>
                <span className="flex items-center gap-1">Enter 键快速提交</span>
              </div>

              {/* Result */}
              {result.type && (
                <div className={`mt-8 p-5 rounded-2xl border-2 animate-slide-up ${
                  result.type === 'success' ? 'bg-fresh-50 border-fresh-200'
                  : result.type === 'warning' ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      result.type === 'success' ? 'bg-fresh-500 text-white'
                      : result.type === 'warning' ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                    }`}>
                      {result.type === 'success' && <CheckCircle2 size={26} />}
                      {result.type === 'warning' && <AlertTriangle size={26} />}
                      {result.type === 'error' && <XCircle size={26} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-lg ${
                        result.type === 'success' ? 'text-fresh-700'
                        : result.type === 'warning' ? 'text-amber-700'
                        : 'text-red-600'
                      }`}>
                        {result.type === 'success' && '✅ 核销成功'}
                        {result.type === 'warning' && '⚠️ 已核销提醒'}
                        {result.type === 'error' && '❌ 核销失败'}
                      </div>
                      <p className="text-sm mt-1 text-gray-600">{result.message}</p>

                      {result.order && (
                        <div className="mt-4 p-4 rounded-xl bg-white border border-gray-100 space-y-2">
                          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-white text-sm font-semibold flex items-center justify-center">
                              {result.order.memberName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800 flex items-center gap-2">
                                {result.order.memberName}
                                <span className="tag bg-amber-50 text-amber-700 border-amber-200 font-mono">{result.order.pickupCode}</span>
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={11} /> {result.order.memberPhone}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">{formatMoney(result.order.totalAmount)}</div>
                              <div className={`tag mt-0.5 ${statusText[result.order.status].className}`}>{statusText[result.order.status].text}</div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {result.order.items.map((it, i) => (
                              <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-gray-50">
                                <span className="text-gray-600 flex items-center gap-1.5"><Package size={11} className="text-primary-400" /> {it.productName} <span className="text-gray-400">({it.spec})</span></span>
                                <span className="font-semibold text-gray-800">× {it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">核销概况</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-fresh-50 to-white border border-fresh-100">
                  <div className="text-xs text-fresh-600 font-medium">今日核销</div>
                  <div className="text-3xl font-bold text-fresh-700 mt-1">{todayCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100">
                  <div className="text-xs text-primary-600 font-medium">累计核销</div>
                  <div className="text-3xl font-bold text-primary-700 mt-1">{records.length}</div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center justify-between">
                最新核销记录
                <button onClick={() => setTab('records')} className="text-xs text-primary-600 flex items-center gap-0.5 hover:underline">
                  全部 <ChevronRight size={12} />
                </button>
              </h3>
              <div className="space-y-2">
                {records.slice(0, 6).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-white text-xs font-semibold flex items-center justify-center">
                      {r.memberName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{r.memberName}</div>
                      <div className="text-[10px] text-gray-400">{formatDate(r.verifiedAt)}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono border border-amber-200">{r.pickupCode}</span>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-400">暂无核销记录</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-wrap overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>核销时间</th>
                  <th>订单号</th>
                  <th>团员</th>
                  <th className="text-center">取货码</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="text-sm whitespace-nowrap text-gray-600">{formatDate(r.verifiedAt)}</td>
                    <td className="font-mono text-xs text-primary-600">{r.orderNo}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-white text-xs font-semibold flex items-center justify-center">{r.memberName[0]}</div>
                        <span className="font-medium text-gray-800">{r.memberName}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-mono font-semibold text-sm border border-amber-200">{r.pickupCode}</span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <History size={32} className="text-gray-200" />
                        <div>暂无核销记录</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
