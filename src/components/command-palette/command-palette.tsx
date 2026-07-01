import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, BookmarkPlus, Settings2, Search, PanelTopOpen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useWorkspaceStore } from '../../store/workspace-store';
import { Input } from '../ui/input';
import type { ReaderSession } from '../../types-books';

interface CommandPaletteProps {
  onUpload: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: JSX.Element;
  action: () => void;
}

function buildCommands(
  tabs: ReaderSession[],
  activeTab: ReaderSession | null,
  onUpload: () => void,
  activateBook: (id: string) => void,
  setPage: (id: string, page: number) => void,
  addBookmark: (id: string) => void,
  toggleSettings: (id: string) => void,
): CommandItem[] {
  const commands: CommandItem[] = [
    {
      id: 'open-book',
      label: 'Open PDF book',
      description: 'Open system file picker',
      keywords: ['open', 'upload', 'pdf', 'book'],
      icon: <BookOpen className="h-4 w-4" />,
      action: onUpload,
    },
  ];

  tabs.forEach((tab) => {
    commands.push({
      id: `switch-${tab.id}`,
      label: `Switch to ${tab.title}`,
      description: tab.author,
      keywords: ['switch', 'tab', tab.title, tab.author],
      icon: <PanelTopOpen className="h-4 w-4" />,
      action: () => activateBook(tab.id),
    });
  });

  if (activeTab) {
    commands.push({
      id: `bookmark-${activeTab.id}`,
      label: 'Add bookmark on current page',
      description: `Book ${activeTab.title}`,
      keywords: ['bookmark', 'save page'],
      icon: <BookmarkPlus className="h-4 w-4" />,
      action: () => addBookmark(activeTab.id),
    });

    commands.push({
      id: `settings-${activeTab.id}`,
      label: 'Toggle reader settings',
      description: 'Open or close advanced settings',
      keywords: ['settings', 'preferences', 'theme', 'mode'],
      icon: <Settings2 className="h-4 w-4" />,
      action: () => toggleSettings(activeTab.id),
    });
  }

  return commands;
}

export function CommandPalette({ onUpload }: CommandPaletteProps) {
  const open = useWorkspaceStore((state) => state.commandPaletteOpen);
  const setOpen = useWorkspaceStore((state) => state.setCommandPaletteOpen);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const activateBook = useWorkspaceStore((state) => state.activateBook);
  const setPage = useWorkspaceStore((state) => state.setPage);
  const addBookmark = useWorkspaceStore((state) => state.addBookmark);
  const toggleSettings = useWorkspaceStore((state) => state.toggleSettings);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
  const [query, setQuery] = useState('');

  const commands = useMemo(
    () => buildCommands(tabs, activeTab, onUpload, activateBook, setPage, addBookmark, toggleSettings),
    [activeTab, activateBook, addBookmark, onUpload, setPage, tabs, toggleSettings],
  );

  const jumpCommand = useMemo(() => {
    if (!activeTab || activeTab.sourceType !== 'pdf') return null;
    const match = query.match(/(?:page|jump)?\s*(\d{1,5})$/i);
    if (!match) return null;
    const pageNumber = Number(match[1]);
    if (!pageNumber || pageNumber < 1 || pageNumber > activeTab.totalPages) return null;
    return {
      id: `jump-${pageNumber}`,
      label: `Jump to page ${pageNumber}`,
      description: activeTab.title,
      keywords: ['jump', 'page', String(pageNumber)],
      icon: <Search className="h-4 w-4" />,
      action: () => setPage(activeTab.id, pageNumber - 1),
    } satisfies CommandItem;
  }, [activeTab, query, setPage]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = jumpCommand ? [jumpCommand, ...commands] : commands;
    if (!normalized) return base;
    return base.filter((command) =>
      [command.label, command.description, ...command.keywords].join(' ').toLowerCase().includes(normalized),
    );
  }, [commands, jumpCommand, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/55 p-4 pt-20 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel w-full max-w-2xl rounded-[28px] border border-white/10 p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
              <Search className="h-4 w-4 text-muted" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands or type a page number..."
                className="h-auto border-0 bg-transparent px-0 py-0 focus:bg-transparent"
              />
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => {
                    command.action();
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-accent">{command.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{command.label}</p>
                    <p className="mt-1 text-xs text-muted">{command.description}</p>
                  </div>
                </button>
              ))}

              {filteredCommands.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted">
                  No matching command.
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
              <span>Ctrl + K</span>
              <span>Esc to close</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
