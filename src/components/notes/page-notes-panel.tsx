import { FileText, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReaderSession } from '../../types-books';
import { useWorkspaceStore } from '../../store/workspace-store';
import { Button } from '../ui/button';

export function PageNotesPanel({ tab }: { tab: ReaderSession }) {
  const savePageNote = useWorkspaceStore((state) => state.savePageNote);
  const deletePageNote = useWorkspaceStore((state) => state.deletePageNote);
  const [draft, setDraft] = useState('');

  const currentNote = useMemo(
    () => tab.notes.find((note) => note.page === tab.currentPage),
    [tab.currentPage, tab.notes],
  );

  useEffect(() => {
    setDraft(currentNote?.content ?? '');
  }, [currentNote?.content, tab.currentPage]);

  return (
    <section className="rounded-[26px] border border-white/10 bg-slate-950/45 p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-ink">Reading notes</p>
        <p className="mt-1 text-xs text-muted">Write page-specific notes for Page {tab.currentPage + 1}.</p>
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Add a thought, citation, or reading note..."
        className="min-h-[148px] w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="accent" size="sm" onClick={() => savePageNote(tab.id, tab.currentPage, draft)}>
          <Save className="h-4 w-4" />
          {currentNote ? 'Save changes' : 'Save note'}
        </Button>
        {currentNote ? (
          <Button variant="ghost" size="sm" onClick={() => deletePageNote(tab.id, currentNote.id)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted">
          <FileText className="h-4 w-4" />
          {tab.notes.length} total notes
        </div>
      </div>
    </section>
  );
}
