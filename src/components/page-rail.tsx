import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';

interface PageRailProps {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
}

export function PageRail({ totalPages, currentPage, onChange }: PageRailProps) {
  const [hoverState, setHoverState] = useState<{ page: number; percent: number } | null>(null);

  const filled = useMemo(() => {
    if (totalPages <= 1) return '0%';
    return `${(currentPage / (totalPages - 1)) * 100}%`;
  }, [currentPage, totalPages]);

  const handleHover = (event: MouseEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const page = Math.round(percent * Math.max(0, totalPages - 1));
    setHoverState({ page, percent: percent * 100 });
  };

  return (
    <div className="relative">
      {hoverState ? (
        <div
          className="pointer-events-none absolute -top-11 z-10 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/95 px-3 py-1.5 text-xs font-medium text-ink shadow-lg"
          style={{ left: `${hoverState.percent}%` }}
        >
          Page {hoverState.page + 1}
        </div>
      ) : null}

      <input
        type="range"
        min={0}
        max={Math.max(0, totalPages - 1)}
        step={1}
        value={currentPage}
        onChange={(event) => onChange(Number(event.target.value))}
        onMouseMove={handleHover}
        onMouseLeave={() => setHoverState(null)}
        className="page-rail"
        style={{ ['--filled' as string]: filled }}
        aria-label="Page navigation rail"
      />

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>Page {currentPage + 1}</span>
        <span>{totalPages} total</span>
      </div>
    </div>
  );
}
