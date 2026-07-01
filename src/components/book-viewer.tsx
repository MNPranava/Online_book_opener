import { lazy, Suspense, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Info, Minus, Plus, Settings2, BookmarkPlus, LoaderCircle } from 'lucide-react';
import type {
  ArchiveBookSession,
  MetadataBookSession,
  PageMode,
  PdfBookSession,
  ReaderSession,
  RenderQuality,
  ThemeMode,
} from '../types-books';
import { useWorkspaceStore } from '../store/workspace-store';
import { Button } from './ui/button';

const PdfReadingWorkspace = lazy(async () => {
  const module = await import('./pdf-viewer/pdf-reading-workspace');
  return { default: module.PdfReadingWorkspace };
});

const themeOptions: ThemeMode[] = ['dark', 'sepia', 'light'];
const pageModeOptions: PageMode[] = ['single', 'double'];
const qualityOptions: RenderQuality[] = ['draft', 'balanced', 'sharp'];

function SegmentedButtons<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          variant={value === option ? 'accent' : 'outline'}
          size="sm"
          onClick={() => onChange(option)}
          className="capitalize"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

function ViewerSettings({ tab }: { tab: ReaderSession }) {
  const setTransparencyEnabled = useWorkspaceStore((state) => state.setTransparencyEnabled);
  const setTransparencyLevel = useWorkspaceStore((state) => state.setTransparencyLevel);
  const setTheme = useWorkspaceStore((state) => state.setTheme);
  const setPageMode = useWorkspaceStore((state) => state.setPageMode);
  const setRenderQuality = useWorkspaceStore((state) => state.setRenderQuality);

  return (
    <div className="absolute inset-x-4 top-16 z-30 rounded-3xl border border-white/10 bg-slate-950/92 p-4 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-4 sm:w-[360px]">
      <div className="mb-4">
        <p className="text-sm font-semibold text-ink">Reader settings</p>
        <p className="mt-1 text-xs leading-5 text-muted">Per-book settings for theme, page mode, transparency, and rendering quality.</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm text-ink">Theme</div>
          <SegmentedButtons options={themeOptions} value={tab.theme} onChange={(value) => setTheme(tab.id, value)} />
        </div>

        {tab.sourceType === 'pdf' ? (
          <div>
            <div className="mb-2 text-sm text-ink">Page mode</div>
            <SegmentedButtons options={pageModeOptions} value={tab.pageMode} onChange={(value) => setPageMode(tab.id, value)} />
          </div>
        ) : null}

        {tab.sourceType === 'pdf' ? (
          <div>
            <div className="mb-2 text-sm text-ink">Rendering quality</div>
            <SegmentedButtons
              options={qualityOptions}
              value={tab.renderQuality}
              onChange={(value) => setRenderQuality(tab.id, value)}
            />
          </div>
        ) : null}

        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-ink">
          <span>Enable transparency</span>
          <input
            type="checkbox"
            checked={tab.transparencyEnabled}
            onChange={(event) => setTransparencyEnabled(tab.id, event.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-ink">
            <span>Transparency level</span>
            <span className="text-muted">{tab.transparencyEnabled ? tab.transparencyLevel : 100}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={100}
            step={5}
            value={tab.transparencyLevel}
            disabled={!tab.transparencyEnabled}
            onChange={(event) => setTransparencyLevel(tab.id, Number(event.target.value))}
            className="page-rail disabled:cursor-not-allowed disabled:opacity-50"
            style={{ ['--filled' as string]: `${((tab.transparencyLevel - 15) / 85) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MetadataViewer({ tab, visualOpacity }: { tab: MetadataBookSession; visualOpacity: number }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <div
        className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#fffdf4] p-6 text-slate-700 shadow-[0_30px_60px_rgba(0,0,0,0.24)] sm:p-8"
        style={{ opacity: visualOpacity, transform: `scale(${tab.zoom / 100})`, transformOrigin: 'center top' }}
      >
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="h-36 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {tab.coverUrl ? (
              <img src={tab.coverUrl} alt={tab.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-slate-500">No cover</div>
            )}
          </div>
          <div>
            <p className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
              {tab.availabilityLabel}
            </p>
            <h3 className="text-2xl font-semibold sm:text-3xl">{tab.title}</h3>
            <p className="mt-2 text-base text-slate-600">{tab.author}</p>
            {tab.firstPublishYear ? <p className="mt-3 text-sm text-slate-500">First published {tab.firstPublishYear}</p> : null}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <div className="mb-2 flex items-center gap-2 font-medium text-slate-800">
            <Info className="h-4 w-4" />
            Preview unavailable
          </div>
          <p>
            Open Library returned metadata for this book, but the app did not detect a public embeddable source. This protects copyright restrictions while still letting you save and inspect the book record.
          </p>
          {tab.description ? <p className="mt-3">{tab.description}</p> : null}
        </div>
      </div>
    </div>
  );
}

function ArchiveViewer({ tab, visualOpacity }: { tab: ArchiveBookSession; visualOpacity: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-muted">
        <div>
          Availability <span className="text-ink">{tab.availabilityLabel}</span>
        </div>
        <a
          href={tab.embedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink/85 transition-colors hover:bg-white/[0.06]"
        >
          Open source
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40 p-3">
        <div
          className="overflow-auto rounded-[22px] bg-slate-950/50"
          style={{ opacity: visualOpacity, transform: `scale(${tab.zoom / 100})`, transformOrigin: 'top center' }}
        >
          <iframe
            src={tab.embedUrl}
            title={tab.title}
            className="min-h-[760px] w-full rounded-[22px] border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function PdfWorkspaceFallback() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-slate-950/40 text-muted">
      <LoaderCircle className="h-6 w-6 animate-spin text-accent" />
      <p>Loading the PDF workspace…</p>
    </div>
  );
}

export function BookViewer({ tab }: { tab: ReaderSession }) {
  const setPage = useWorkspaceStore((state) => state.setPage);
  const adjustZoom = useWorkspaceStore((state) => state.adjustZoom);
  const addBookmark = useWorkspaceStore((state) => state.addBookmark);
  const toggleSettings = useWorkspaceStore((state) => state.toggleSettings);
  const settingsOpen = useWorkspaceStore((state) => state.settingsOpenTabId === tab.id);

  const visualOpacity = tab.transparencyEnabled ? tab.transparencyLevel / 100 : 1;
  const step = tab.sourceType === 'pdf' && tab.pageMode === 'double' ? 2 : 1;
  const isPdf = tab.sourceType === 'pdf';
  const pdfTab = tab as PdfBookSession;

  const currentPageLabel = useMemo(() => {
    if (!isPdf) return 'Reader details';
    if (tab.pageMode === 'single') return `Page ${tab.currentPage + 1}`;
    return `Pages ${tab.currentPage + 1}${tab.currentPage + 2 <= tab.totalPages ? `–${tab.currentPage + 2}` : ''}`;
  }, [isPdf, tab.currentPage, tab.pageMode, tab.totalPages]);

  const hasCurrentBookmark = tab.bookmarks.some((bookmark) => bookmark.page === tab.currentPage);

  return (
    <section className="glass-panel relative flex h-full min-h-[700px] flex-col rounded-[32px] border border-white/10 p-4 shadow-glass sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Active reader</p>
          <h2 className="text-2xl font-semibold text-ink">{tab.title}</h2>
          <p className="mt-1 text-sm text-muted">{tab.author}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-muted">
            Zoom {tab.zoom}% · {isPdf ? `Page ${tab.currentPage + 1} / ${tab.totalPages}` : tab.sourceType}
          </div>
          {isPdf ? (
            <Button variant={hasCurrentBookmark ? 'outline' : 'accent'} size="sm" onClick={() => addBookmark(tab.id)}>
              <BookmarkPlus className="h-4 w-4" />
              {hasCurrentBookmark ? 'Bookmarked' : 'Bookmark page'}
            </Button>
          ) : null}
          <Button variant="outline" size="icon" onClick={() => toggleSettings(tab.id)} aria-label="Open settings">
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {settingsOpen ? <ViewerSettings tab={tab} /> : null}

      <div className="relative flex-1 overflow-hidden rounded-[30px] border border-white/8 bg-slate-950/40 px-2 py-4 sm:px-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent" />

        <div className="flex h-full flex-col gap-5">
          <div className="flex items-center justify-between px-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(tab.id, Math.max(0, tab.currentPage - step))}
              disabled={!isPdf || tab.currentPage === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center text-sm text-muted">{currentPageLabel}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(tab.id, Math.min(tab.totalPages - 1, tab.currentPage + step))}
              disabled={!isPdf || tab.currentPage >= tab.totalPages - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-auto px-2 py-3">
            {tab.sourceType === 'pdf' ? (
              <Suspense fallback={<PdfWorkspaceFallback />}>
                <PdfReadingWorkspace tab={pdfTab} visualOpacity={visualOpacity} />
              </Suspense>
            ) : null}
            {tab.sourceType === 'archive' ? <ArchiveViewer tab={tab as ArchiveBookSession} visualOpacity={visualOpacity} /> : null}
            {tab.sourceType === 'metadata' ? <MetadataViewer tab={tab as MetadataBookSession} visualOpacity={visualOpacity} /> : null}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/75 p-2 shadow-xl backdrop-blur-xl">
        <button
          onClick={() => adjustZoom(tab.id, -10)}
          className="pointer-events-auto rounded-xl border border-white/10 bg-white/[0.04] p-3 text-ink transition-colors hover:bg-white/[0.08]"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="min-w-[64px] text-center text-sm font-medium text-ink">{tab.zoom}%</div>
        <button
          onClick={() => adjustZoom(tab.id, 10)}
          className="pointer-events-auto rounded-xl border border-white/10 bg-white/[0.04] p-3 text-ink transition-colors hover:bg-white/[0.08]"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
