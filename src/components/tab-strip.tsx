import { motion } from 'framer-motion';
import { BookMarked, FileText, Globe2, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspace-store';

function TabIcon({ sourceType }: { sourceType: 'pdf' | 'archive' | 'metadata' }) {
  if (sourceType === 'pdf') return <FileText className="h-4 w-4" />;
  if (sourceType === 'archive') return <Globe2 className="h-4 w-4" />;
  return <BookMarked className="h-4 w-4" />;
}

export function TabStrip() {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const activateBook = useWorkspaceStore((state) => state.activateBook);
  const closeBook = useWorkspaceStore((state) => state.closeBook);

  return (
    <div className="glass-panel flex min-h-[84px] items-center gap-3 overflow-x-auto rounded-[28px] border border-white/10 px-4 py-4 shadow-glass">
      <div className="flex min-w-max items-center gap-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <motion.div
              key={tab.id}
              layout
              className={`relative flex min-w-[220px] max-w-[300px] items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-250 ease-soft-out ${
                isActive
                  ? 'border-white/20 bg-white/[0.09] text-ink shadow-[0_10px_24px_rgba(124,156,255,0.16)]'
                  : 'border-white/8 bg-white/[0.04] text-muted hover:border-white/14 hover:bg-white/[0.06]'
              }`}
            >
              {isActive ? (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                />
              ) : null}

              <button
                onClick={() => activateBook(tab.id)}
                className="flex flex-1 items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="rounded-xl border border-white/10 bg-slate-900/70 p-2">
                  <TabIcon sourceType={tab.sourceType} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tab.title}</p>
                  <p className="truncate text-xs text-muted">
                    {tab.sourceType === 'pdf' ? `Page ${tab.currentPage + 1} / ${tab.totalPages}` : tab.sourceType}
                  </p>
                </div>
              </button>

              <button
                aria-label={`Close ${tab.title}`}
                onClick={() => closeBook(tab.id)}
                className="rounded-xl p-2 text-muted transition-colors hover:bg-white/10 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
