import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatMoney, aftersaleTypeText, statusText } from '@/lib/format';
import type { AftersaleType, Order } from '../../shared/types';
import {
  ArrowLeft, Search, Package, AlertOctagon, XCircle, Check,
  User, Phone, FileText, Send, ShoppingBag
} from 'lucide-react';

export default function AftersaleNew() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [aftersaleType, setAftersaleType] = useState<AftersaleType | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const typeOptions: { key: AftersaleType; label: string; desc: string; icon: any; gradient: string; border: string; ring: string }[] = [
    {
      key: 'out_of_stock',
      label: '缺货退款',
      desc: '商品库存不足，无法发货',
      icon: Package,
      gradient: 'from-primary-500 to-orange-400',
      border: 'border-primary-200',
      ring: 'ring-primary-500',
    },
    {
      key: 'damaged',
      label: '破损退款',
      desc: '商品在运输过程中损坏',
      icon: AlertOctagon,
      gradient: 'from-red-500 to-rose-400',
      border: 'border-red-200',
      ring: 'ring-red-500',
    },
    {
      key: 'quality',
      label: '质量问题',
      desc: '商品质量不符合预期',
      icon: XCircle,
      gradient: 'from-amber-500 to-yellow-400',
      border: 'border-amber-200',
      ring: 'ring-amber-500',
    },
  ];

  const searchOrder = async () => {
    const kw = keyword.trim();
    if (!kw) {
      showToast('info', '请输入订单号或取货码');
      return;
    }
    setSearching(true);
    try {
      const list = await api.orders.list({ keyword: kw });
      if (list.length > 0) {
        setOrder(list[0]);
        setAftersaleType(null);
        setRefundAmount(String(list[0].totalAmount));
        setRemark('');
        showToast('success', '找到关联订单');
      } else {
        setOrder(null);
        showToast('error', '未找到相关订单，请检查订单号或取货码');
      }
    } catch (e: any) {
      showToast('error', e);
    }
    setSearching(false);
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchOrder();
  };

  const submit = async () => {
    if (!order) { showToast('error', '请先选择关联订单'); return; }
    if (!aftersaleType) { showToast('error', '请选择售后类型'); return; }
    const amt = parseFloat(refundAmount);
    if (!amt || amt <= 0) { showToast('error', '请输入正确的退款金额'); return; }
    if (amt > order.totalAmount) { showToast('error', '退款金额不能超过订单金额'); return; }

    setSubmitting(true);
    try {
      const r: any = await api.aftersale.create({
        orderId: order.id,
        type: aftersaleType,
        refundAmount: amt,
        remark: remark.trim(),
      });
      if (r.code === 0) {
        showToast('success', r.message || '售后登记成功');
        setTimeout(() => navigate('/aftersale'), 800);
      }
    } catch (e: any) {
      showToast('error', e);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost w-10 h-10 p-0 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">登记售后</h1>
          <p className="text-sm text-gray-500 mt-1">填写订单信息和售后类型，快速发起退款流程</p>
        </div>
      </div>

      {/* Step 1: Search Order */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">1</div>
          <h2 className="text-lg font-semibold text-gray-800">选择关联订单</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="输入订单号 (如 T20240115001) 或 6位取货码"
              className="input pl-12 pr-4 py-3 text-base"
            />
          </div>
          <button onClick={searchOrder} disabled={searching || !keyword.trim()} className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50">
            <Search size={16} className={searching ? 'animate-spin' : ''} /> 查询
          </button>
        </div>

        {/* Order found */}
        {order && (
          <div className="mt-5 p-5 rounded-2xl border-2 border-fresh-200 bg-gradient-to-br from-fresh-50/60 to-white animate-slide-up">
            <div className="flex items-center gap-2 mb-4 text-fresh-700">
              <Check size={18} />
              <span className="font-semibold">已选择订单</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">订单号</div>
                <div className="font-mono text-sm text-primary-600 font-semibold">{order.orderNo}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">取货码</div>
                <div className="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold text-sm border border-amber-200">{order.pickupCode}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">订单状态</div>
                <span className={`tag ${statusText[order.status].className}`}>{statusText[order.status].text}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-amber-400 text-white font-semibold flex items-center justify-center">
                {order.memberName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  <User size={13} className="text-gray-400" /> {order.memberName}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {order.memberPhone}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">订单金额</div>
                <div className="text-xl font-bold text-primary-600">{formatMoney(order.totalAmount)}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs text-gray-400 mb-1.5">商品明细</div>
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingBag size={13} className="text-primary-400 shrink-0" />
                    <span className="text-gray-700 truncate">{it.productName}</span>
                    <span className="text-xs text-gray-400 shrink-0">({it.spec})</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500">×{it.quantity}</span>
                    <span className="font-semibold text-gray-700 w-20 text-right">{formatMoney(it.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Select Type */}
      <div className={`card p-6 ${!order ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">2</div>
          <h2 className="text-lg font-semibold text-gray-800">选择售后类型</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {typeOptions.map(opt => {
            const selected = aftersaleType === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setAftersaleType(opt.key)}
                className={`text-left p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${
                  selected
                    ? `${opt.border} bg-gradient-to-br ${opt.gradient} text-white shadow-xl ring-4 ${opt.ring}/20`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center transition ${
                  selected ? 'bg-white/20 text-white' : `bg-gradient-to-br ${opt.gradient} text-white`
                }`}>
                  <opt.icon size={22} />
                </div>
                <div className={`font-bold text-base mb-1 ${selected ? 'text-white' : 'text-gray-800'}`}>
                  {opt.label}
                </div>
                <div className={`text-xs ${selected ? 'text-white/80' : 'text-gray-500'}`}>
                  {opt.desc}
                </div>
                {selected && (
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/90">
                    <Check size={13} /> 已选择
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Amount & Remark */}
      <div className={`card p-6 space-y-5 ${!(order && aftersaleType) ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">3</div>
          <h2 className="text-lg font-semibold text-gray-800">填写退款信息</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            退款金额 <span className="text-red-500">*</span>
            {order && <span className="text-xs text-gray-400 font-normal ml-2">订单金额 {formatMoney(order.totalAmount)}</span>}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">¥</span>
            <input
              type="number"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input pl-10 pr-4 py-3 text-xl font-bold text-gray-800"
            />
          </div>
          {order && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {[0.5, 0.8, 1].map(pct => (
                <button
                  key={pct}
                  onClick={() => setRefundAmount((order.totalAmount * pct).toFixed(2))}
                  className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  {pct === 1 ? '全额退款' : `${pct * 100}%退款`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注说明 <span className="text-xs text-gray-400 font-normal">选填</span>
          </label>
          <textarea
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="请描述具体情况，如：商品外包装破损，内物有压痕..."
            rows={4}
            className="input resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        <Link to="/aftersale" className="btn-ghost">取消</Link>
        <button
          onClick={submit}
          disabled={submitting || !order || !aftersaleType || !refundAmount || parseFloat(refundAmount) <= 0}
          className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={16} className={submitting ? 'animate-spin' : ''} />
          {submitting ? '提交中...' : '提交售后申请'}
        </button>
      </div>
    </div>
  );
}
