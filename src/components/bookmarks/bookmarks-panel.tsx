import { Bookmark, BookmarkPlus, CornerDownRight, Trash2 } from 'lucide-react';
import type { ReaderSession } from '../../types-books';
import { useWorkspaceStore } from '../../store/workspace-store';
import { Button } from '../ui/button';

export function BookmarksPanel({ tab }: { tab: ReaderSession }) {
  const addBookmark = useWorkspaceStore((state) => state.addBookmark);
  const removeBookmark = useWorkspaceStore((state) => state.removeBookmark);
  const setPage = useWorkspaceStore((state) => state.setPage);

  const hasCurrentPageBookmark = tab.bookmarks.some((bookmark) => bookmark.page === tab.currentPage);

  return (
    <section className="rounded-[26px] border border-white/10 bg-slate-950/45 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Bookmarks</p>
          <p className="mt-1 text-xs text-muted">Saved positions for this book.</p>
        </div>
        <Button variant={hasCurrentPageBookmark ? 'outline' : 'accent'} size="sm" onClick={() => addBookmark(tab.id)}>
          <BookmarkPlus className="h-4 w-4" />
          {hasCurrentPageBookmark ? 'Saved' : 'Add'}
        </Button>
      </div>

      <div className="space-y-2">
        {tab.bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-muted">
            No bookmarks yet. Save the current page to jump back later.
          </div>
        ) : (
          tab.bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm ${
                bookmark.page === tab.currentPage
                  ? 'border-accent/30 bg-accent/10 text-ink'
                  : 'border-white/10 bg-white/[0.03] text-muted'
              }`}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium text-ink">
                  <Bookmark className="h-4 w-4" />
                  {bookmark.label}
                </p>
                <p className="mt-1 text-xs text-muted">Page {bookmark.page + 1}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(tab.id, bookmark.page)}>
                  <CornerDownRight className="h-4 w-4" />
                  Jump
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeBookmark(tab.id, bookmark.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
