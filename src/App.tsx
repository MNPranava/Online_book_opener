import { lazy, Suspense, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Database, GalleryHorizontalEnd, SearchCode } from 'lucide-react';
import { BookViewer } from './components/book-viewer';
import { SearchDrawer } from './components/search-drawer/search-drawer';
import { TabStrip } from './components/tab-strip';
import { UploadButton, type UploadButtonHandle } from './components/upload-button';
import { NoticeBanner } from './components/ui/notice-banner';
import { ErrorBoundary } from './components/ui/error-boundary';
import { useWorkspaceStore } from './store/workspace-store';

const CommandPalette = lazy(async () => {
  const module = await import('./components/command-palette/command-palette');
  return { default: module.CommandPalette };
});

export default function App() {
  const uploadRef = useRef<UploadButtonHandle | null>(null);
  const initializeWorkspace = useWorkspaceStore((state) => state.initializeWorkspace);
  const isHydrated = useWorkspaceStore((state) => state.isHydrated);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const uiNotice = useWorkspaceStore((state) => state.uiNotice);
  const clearNotice = useWorkspaceStore((state) => state.clearNotice);
  const commandPaletteOpen = useWorkspaceStore((state) => state.commandPaletteOpen);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  const closeBook = useWorkspaceStore((state) => state.closeBook);
  const cycleTabs = useWorkspaceStore((state) => state.cycleTabs);
  const adjustZoom = useWorkspaceStore((state) => state.adjustZoom);
  const setCommandPaletteOpen = useWorkspaceStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    void initializeWorkspace();
  }, [initializeWorkspace]);

  useEffect(() => {
    if (!uiNotice) return;
    const timer = window.setTimeout(() => clearNotice(), 6000);
    return () => window.clearTimeout(timer);
  }, [clearNotice, uiNotice]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeSessionId = useWorkspaceStore.getState().activeTabId;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        uploadRef.current?.open();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'Tab') {
        event.preventDefault();
        cycleTabs();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w') {
        if (!activeSessionId) return;
        event.preventDefault();
        closeBook(activeSessionId);
      }

      if (!activeSessionId) return;

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        adjustZoom(activeSessionId, 10);
      }

      if (event.key === '-') {
        event.preventDefault();
        adjustZoom(activeSessionId, -10);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [adjustZoom, closeBook, cycleTabs, setCommandPaletteOpen]);

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-reader-bg px-4 py-4 text-ink sm:px-5 lg:px-6">
        <div className="glass-panel mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1640px] items-center justify-center rounded-[32px] border border-white/10 shadow-glass">
          <div className="text-center">
            <p className="text-lg font-semibold text-ink">Restoring reading workspace…</p>
            <p className="mt-2 text-sm text-muted">Loading tabs, PDF metadata, and persistent reading state from IndexedDB.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-reader-bg px-4 py-4 text-ink sm:px-5 lg:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1640px] flex-col gap-4">
          <header className="glass-panel rounded-[30px] border border-white/10 px-4 py-5 shadow-glass sm:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">Online Book Opener</p>
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Professional digital reading workspace
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
                  Restore PDFs from your recent library, navigate with live thumbnails, keep bookmarks and notes per page, and use command-first controls for fast reading flows.
                </p>
              </div>
              <div className="flex flex-col gap-3 xl:items-end">
                <div className="flex flex-wrap items-center gap-3">
                  <UploadButton ref={uploadRef} />
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted">
                    <span className="font-medium text-ink">Ctrl + O</span> uploads PDFs · <span className="font-medium text-ink">Ctrl + K</span> opens commands
                  </div>
                </div>
                <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/[0.04] p-4 text-sm text-muted sm:grid-cols-2 xl:grid-cols-6">
                  <Shortcut label="Open PDF" value="Ctrl + O" />
                  <Shortcut label="Commands" value="Ctrl + K" />
                  <Shortcut label="Next tab" value="Ctrl + Tab" />
                  <Shortcut label="Close tab" value="Ctrl + W" />
                  <Shortcut label="Zoom in" value="+" />
                  <Shortcut label="Zoom out" value="-" />
                </div>
              </div>
            </div>
          </header>

          {uiNotice ? <NoticeBanner notice={uiNotice} onDismiss={clearNotice} /> : null}

          <TabStrip />

          <div className="flex flex-1 flex-col gap-4 xl:flex-row">
            <SearchDrawer />

            <div className="min-w-0 flex-1">
              <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoTile icon={Database} title="IndexedDB library" description="Recent PDFs reopen without selecting a file again." />
                <InfoTile icon={GalleryHorizontalEnd} title="Thumbnail rail" description="Click page previews for fast non-linear jumps." />
                <InfoTile icon={Bookmark} title="Bookmarks & notes" description="Persistent annotations stay tied to each book and page." />
                <InfoTile icon={SearchCode} title="Command palette" description="Use Ctrl + K for upload, tab switching, jumping, and settings." />
              </div>

              <AnimatePresence mode="wait">
                {activeTab ? (
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ErrorBoundary
                      title="Reader workspace error"
                      description="A rendering error occurred in the active book view. Try reopening the tab or re-uploading the PDF if the problem persists."
                    >
                      <BookViewer tab={activeTab} />
                    </ErrorBoundary>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel flex min-h-[700px] items-center justify-center rounded-[32px] border border-dashed border-white/12"
                  >
                    <div className="max-w-xl px-6 text-center">
                      <p className="text-xl font-semibold text-ink">No active book</p>
                      <p className="mt-3 leading-7 text-muted">
                        Upload a PDF with <strong className="text-ink">Ctrl + O</strong>, reopen one from the recent library, or search Open Library from the left drawer.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {commandPaletteOpen ? (
        <Suspense fallback={null}>
          <CommandPalette onUpload={() => uploadRef.current?.open()} />
        </Suspense>
      ) : null}
    </>
  );
}

function Shortcut({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Database;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel rounded-[24px] border border-white/10 px-4 py-4 shadow-glass">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
