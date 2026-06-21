export const formatMoney = (n: number | null | undefined) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '¥0.00';
  const num = Number(n);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const cents = Math.round(abs * 100);
  const intPart = Math.floor(cents / 100);
  const decPart = cents % 100;
  let intStr: string;
  if (intPart > 1e15) {
    intStr = intPart.toLocaleString('en-US');
  } else {
    intStr = intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  const decStr = String(decPart).padStart(2, '0');
  return '¥' + sign + intStr + '.' + decStr;
};

export const formatDate = (iso?: string, withTime = true) => {
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${day}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

export const formatDateShort = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

export const statusText: Record<string, { text: string; className: string }> = {
  ongoing: { text: '进行中', className: 'bg-fresh-50 text-fresh-600 border-fresh-200' },
  closed: { text: '已截团', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  finished: { text: '已完成', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  pending: { text: '待分拣', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  sorting: { text: '分拣中', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  done: { text: '分拣完成', className: 'bg-fresh-50 text-fresh-600 border-fresh-200' },
  sorted: { text: '已分拣', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  picked: { text: '已取货', className: 'bg-fresh-50 text-fresh-600 border-fresh-200' },
  refunded: { text: '已退款', className: 'bg-red-50 text-red-600 border-red-200' },
  approved: { text: '退款中', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  completed: { text: '已完成', className: 'bg-fresh-50 text-fresh-600 border-fresh-200' },
};

export const disposeTypeText: Record<string, { text: string; className: string }> = {
  normal: { text: '待取货', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  stored: { text: '代存', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  returned: { text: '退货', className: 'bg-red-50 text-red-600 border-red-200' },
};

export const reminderLevelText: Record<number, { text: string; className: string }> = {
  0: { text: '未提醒', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  1: { text: '已提醒1次', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  2: { text: '已提醒2次', className: 'bg-red-50 text-red-600 border-red-200' },
};

export const aftersaleTypeText: Record<string, { text: string; className: string }> = {
  out_of_stock: { text: '缺货退款', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  damaged: { text: '破损退款', className: 'bg-red-50 text-red-600 border-red-200' },
  quality: { text: '质量问题', className: 'bg-amber-50 text-amber-600 border-amber-200' },
};

export const sourceText: Record<string, { text: string; className: string }> = {
  custom: { text: '自定义', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  supply: { text: '供应链', className: 'bg-fresh-50 text-fresh-600 border-fresh-200' },
};
