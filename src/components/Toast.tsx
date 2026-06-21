import { useAppStore } from '@/store/useAppStore';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const toast = useAppStore(s => s.toast);
  if (!toast) return null;
  const map = {
    success: { bg: 'bg-fresh-500', Icon: CheckCircle, ring: 'ring-fresh-200' },
    error: { bg: 'bg-red-500', Icon: AlertCircle, ring: 'ring-red-200' },
    info: { bg: 'bg-primary-500', Icon: Info, ring: 'ring-primary-200' },
  }[toast.type];
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl ring-4 ${map.ring} ${map.bg}`}>
        <map.Icon size={20} />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
