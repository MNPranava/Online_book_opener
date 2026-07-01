import type { PDFDocumentProxy } from 'pdfjs-dist';
import { motion } from 'framer-motion';
import { FileWarning, LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';
import type { PdfBookSession } from '../../types-books';
import { PdfPageCanvas } from './pdf-page-canvas';

interface PdfBookViewerProps {
  tab: PdfBookSession;
  pdfDocument: PDFDocumentProxy | null;
  loading: boolean;
  error: string | null;
  visualOpacity: number;
}

export function PdfBookViewer({ tab, pdfDocument, loading, error, visualOpacity }: PdfBookViewerProps) {
  const visiblePages = useMemo(() => {
    const totalPages = pdfDocument?.numPages ?? tab.totalPages;
    if (!totalPages) return [] as number[];

    if (tab.pageMode === 'single') {
      return [tab.currentPage + 1];
    }

    const leftPage = tab.currentPage + 1;
    const rightPage = leftPage + 1 <= totalPages ? leftPage + 1 : undefined;
    return [leftPage, rightPage].filter(Boolean) as number[];
  }, [pdfDocument?.numPages, tab.currentPage, tab.pageMode, tab.totalPages]);

  if (loading) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-slate-950/40 text-muted">
        <LoaderCircle className="h-6 w-6 animate-spin text-accent" />
        <p>Loading PDF document…</p>
      </div>
    );
  }

  if (error || !pdfDocument) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 rounded-[28px] border border-rose-400/20 bg-rose-500/10 px-6 text-center text-rose-100">
        <FileWarning className="h-6 w-6" />
        <div>
          <p className="text-base font-medium">Unable to open this PDF</p>
          <p className="mt-2 text-sm text-rose-100/80">{error ?? 'The document could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-muted">
        <div>
          Current page <span className="text-ink">{tab.currentPage + 1}</span> of <span className="text-ink">{tab.totalPages}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-ink/85">PDF.js</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">{tab.pageMode === 'double' ? 'Two-page mode' : 'Single-page mode'}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">{tab.renderQuality}</span>
        </div>
      </div>

      <motion.div
        key={`${tab.id}-${tab.currentPage}-${tab.zoom}-${tab.pageMode}-${tab.theme}-${tab.renderQuality}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className={`grid w-full max-w-6xl gap-4 ${visiblePages.length > 1 ? 'lg:grid-cols-2' : 'max-w-3xl'}`}
        style={{ opacity: visualOpacity }}
      >
        {visiblePages.map((pageNumber) => (
          <PdfPageCanvas
            key={`${tab.id}-page-${pageNumber}-${tab.zoom}-${tab.renderQuality}`}
            fileId={tab.fileId}
            pdfDocument={pdfDocument}
            pageNumber={pageNumber}
            zoom={tab.zoom}
            quality={tab.renderQuality}
            theme={tab.theme}
          />
        ))}
      </motion.div>
    </div>
  );
}
