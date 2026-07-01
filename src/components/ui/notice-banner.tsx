import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import type { UiNotice } from '../../types-books';
import { Button } from './button';

const noticeStyles = {
  info: {
    icon: Info,
    className: 'border-sky-400/20 bg-sky-500/10 text-sky-100',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
  },
  error: {
    icon: AlertCircle,
    className: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
  },
} as const;

export function NoticeBanner({ notice, onDismiss }: { notice: UiNotice; onDismiss: () => void }) {
  const style = noticeStyles[notice.tone];
  const Icon = style.icon;

  return (
    <div className={`glass-panel rounded-[24px] border px-4 py-3 shadow-glass ${style.className}`} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{notice.title}</p>
          <p className="mt-1 text-sm/6 opacity-90">{notice.description}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDismiss} className="h-9 w-9 rounded-xl text-current hover:bg-white/10">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
