import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { UploadButton } from '../upload-button';
import { searchOpenLibraryBooks } from '../../services/open-library';
import type { OpenLibraryResult } from '../../types-books';
import { useWorkspaceStore } from '../../store/workspace-store';
import { RecentLibrary } from '../library/recent-library';

export function SearchDrawer() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenLibraryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1280px)').matches);
  const openSearchResult = useWorkspaceStore((state) => state.openSearchResult);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isDesktop && collapsed) {
      setCollapsed(false);
    }
  }, [collapsed, isDesktop]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setSearching(true);
        setError(null);
        const nextResults = await searchOpenLibraryBooks(query, controller.signal);
        setResults(nextResults);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const resultCount = useMemo(() => `${results.length} result${results.length === 1 ? '' : 's'}`, [results.length]);

  return (
    <motion.aside
      animate={{ width: isDesktop ? (collapsed ? 96 : 400) : '100%' }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel flex min-h-[240px] w-full shrink-0 flex-col rounded-[28px] border border-white/10 p-4 shadow-glass xl:max-w-[400px]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        {!collapsed ? (
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.26em] text-muted">Discovery</p>
            <h2 className="text-lg font-semibold text-ink">Library & search</h2>
          </div>
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-accent">
            <BookOpenText className="h-5 w-5" />
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)} className={!isDesktop ? 'hidden' : undefined}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-3 pt-4">
          <UploadButton compact className="w-full justify-center" />
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-slate-950/30 p-3 text-center text-xs text-muted">
            <Search className="h-4 w-4 text-accent" />
            Expand to search Open Library
          </div>
        </div>
      ) : (
        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto pr-1">
          <div className="space-y-3">
            <UploadButton className="w-full justify-center" />
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search books..."
                className="pl-11"
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-xs leading-6 text-muted">
              Search Open Library by title or author. Readable public-domain books open in-app; others open as metadata cards.
            </div>
          </div>

          <RecentLibrary />

          <section className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
              <span>Open Library</span>
              <span>{searching ? 'Searching...' : resultCount}</span>
            </div>

            <AnimatePresence mode="popLayout">
              {results.map((result) => (
                <motion.button
                  layout
                  key={result.sourceId}
                  onClick={() => void openSearchResult(result)}
                  className="group flex w-full items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-3 text-left transition-all duration-300 ease-soft-out hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div className="h-24 w-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                    {result.coverUrl ? (
                      <img src={result.coverUrl} alt={result.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-muted">
                        No cover
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-ink">{result.title}</p>
                    <p className="mt-1 text-xs text-muted">{result.author}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                      {result.firstPublishYear ? <span>{result.firstPublishYear}</span> : null}
                      <span
                        className={`rounded-full border px-2.5 py-1 ${
                          result.readable
                            ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                            : 'border-white/10 bg-white/[0.04] text-muted'
                        }`}
                      >
                        {result.availabilityLabel}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>

            {!query && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-muted">
                <div className="mb-2 flex items-center gap-2 text-ink">
                  <Sparkles className="h-4 w-4 text-accentWarm" />
                  Search ideas
                </div>
                Try: <span className="text-ink">The Hobbit</span>, <span className="text-ink">Pride and Prejudice</span>, or{' '}
                <span className="text-ink">Sherlock Holmes</span>.
              </div>
            )}

            {searching && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm text-muted">
                Searching Open Library…
              </div>
            )}

            {!searching && query && results.length === 0 && !error && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm text-muted">
                No results found for “{query}”.
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            )}
          </section>
        </div>
      )}
    </motion.aside>
  );
}
