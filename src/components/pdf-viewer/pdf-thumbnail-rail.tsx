import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useRef } from 'react';
import type { PdfBookSession } from '../../types-books';
import { PdfThumbnailItem } from './pdf-thumbnail-item';

interface PdfThumbnailRailProps {
  tab: PdfBookSession;
  pdfDocument: PDFDocumentProxy;
  onJump: (page: number) => void;
}

export function PdfThumbnailRail({ tab, pdfDocument, onJump }: PdfThumbnailRailProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const activePage = tab.currentPage + 1;

  useEffect(() => {
    const root = stripRef.current;
    const activeElement = root?.querySelector<HTMLButtonElement>(`[data-page="${activePage}"]`);
    activeElement?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activePage]);

  return (
    <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <div>Thumbnail navigation</div>
        <div>Hover for page number · Click to jump</div>
      </div>
      <div ref={stripRef} className="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: tab.totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <div key={`${tab.id}-thumb-${pageNumber}`} data-page={pageNumber}>
            <PdfThumbnailItem
              fileId={tab.fileId}
              pdfDocument={pdfDocument}
              pageNumber={pageNumber}
              quality={tab.renderQuality}
              active={pageNumber === activePage}
              onSelect={() => onJump(pageNumber - 1)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
