import { useMemo } from 'react';
import type { PdfBookSession } from '../../types-books';
import { useWorkspaceStore } from '../../store/workspace-store';
import { usePdfReader } from '../../hooks/use-pdf-reader';
import { PdfBookViewer } from './pdf-book-viewer';
import { PdfThumbnailRail } from './pdf-thumbnail-rail';
import { BookmarksPanel } from '../bookmarks/bookmarks-panel';
import { PageNotesPanel } from '../notes/page-notes-panel';

export function PdfReadingWorkspace({ tab, visualOpacity }: { tab: PdfBookSession; visualOpacity: number }) {
  const setPage = useWorkspaceStore((state) => state.setPage);
  const pdfReader = usePdfReader({
    fileId: tab.fileId,
    currentPage: tab.currentPage,
    preloadRadius: tab.pageMode === 'double' ? 3 : 2,
  });

  const summaryText = useMemo(() => {
    if (pdfReader.loading) {
      return 'Preparing PDF previews and navigation…';
    }
    if (pdfReader.error) {
      return 'The PDF could not be rendered. Try re-uploading the file.';
    }
    return 'Use thumbnails, bookmarks, and notes to move through the document quickly.';
  }, [pdfReader.error, pdfReader.loading]);

  return (
    <>
      <PdfBookViewer
        tab={tab}
        pdfDocument={pdfReader.pdfDocument}
        loading={pdfReader.loading}
        error={pdfReader.error}
        visualOpacity={visualOpacity}
      />

      {pdfReader.pdfDocument ? (
        <>
          <PdfThumbnailRail tab={tab} pdfDocument={pdfReader.pdfDocument} onJump={(page) => setPage(tab.id, page)} />
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <BookmarksPanel tab={tab} />
            <PageNotesPanel tab={tab} />
          </div>
        </>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-muted">
          {summaryText}
        </div>
      )}
    </>
  );
}
