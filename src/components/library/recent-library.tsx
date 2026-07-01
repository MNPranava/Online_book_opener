import { BookOpen, FileText, LoaderCircle, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRecentPdfLibrary } from '../../hooks/use-recent-pdf-library';
import { useWorkspaceStore } from '../../store/workspace-store';
import { Button } from '../ui/button';
import type { RecentPdfLibraryItem } from '../../types-books';

const sortOptions = {
  recent: 'Last opened',
  title: 'Title',
  page: 'Current page',
} as const;

type SortMode = keyof typeof sortOptions;

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}

function sortItems(items: RecentPdfLibraryItem[], mode: SortMode) {
  const copy = [...items];
  if (mode === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title));
  if (mode === 'page') return copy.sort((a, b) => b.currentPage - a.currentPage);
  return copy.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

export function RecentLibrary() {
  const libraryRefreshToken = useWorkspaceStore((state) => state.libraryRefreshToken);
  const openStoredPdf = useWorkspaceStore((state) => state.openStoredPdf);
  const deleteStoredPdf = useWorkspaceStore((state) => state.deleteStoredPdf);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const { items, loading, error } = useRecentPdfLibrary(libraryRefreshToken);

  const sortedItems = useMemo(() => sortItems(items, sortMode), [items, sortMode]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Recent library</p>
          <p className="mt-1 text-sm text-ink">Previously uploaded PDFs</p>
        </div>
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-ink outline-none"
        >
          {Object.entries(sortOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm text-muted">
            <div className="flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading recent library…
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        {!loading && !error && sortedItems.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-muted">
            No uploaded PDFs yet. Use <span className="text-ink">Upload PDF</span> or press <span className="text-ink">Ctrl + O</span>.
          </div>
        ) : null}

        {sortedItems.map((item) => (
          <div key={item.fileId} className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex gap-3">
              <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-muted">Last opened {formatDate(item.lastOpenedAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                  <span className="rounded-full border border-white/10 px-2.5 py-1">Page {item.currentPage + 1}</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1">{item.totalPages} pages</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="accent" size="sm" onClick={() => void openStoredPdf(item.fileId)}>
                <BookOpen className="h-4 w-4" />
                Open
              </Button>
              <Button variant="ghost" size="sm" onClick={() => void deleteStoredPdf(item.fileId)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
