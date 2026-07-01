import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { RenderQuality } from '../../types-books';
import { usePdfPageBitmap } from '../../hooks/use-pdf-page-bitmap';

interface PdfThumbnailItemProps {
  fileId: string;
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  quality: RenderQuality;
  active: boolean;
  onSelect: () => void;
}

export function PdfThumbnailItem({ fileId, pdfDocument, pageNumber, quality, active, onSelect }: PdfThumbnailItemProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);
  const { bitmap, loading } = usePdfPageBitmap({
    fileId,
    pdfDocument,
    pageNumber,
    zoom: 100,
    targetWidth: 88,
    quality,
    kind: 'thumb',
    enabled: visible,
  });

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '180px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onSelect}
      title={`Page ${pageNumber}`}
      className={`group relative flex w-[96px] shrink-0 flex-col items-center rounded-2xl border p-2 transition-all duration-200 ${
        active
          ? 'border-accent/40 bg-accent/10 shadow-[0_0_0_1px_rgba(124,156,255,0.14)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      <div className="relative flex h-[124px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-slate-950/50">
        {!visible || loading || !bitmap ? (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <img src={bitmap.src} alt={`Page ${pageNumber}`} className="h-full w-full rounded-xl object-cover" loading="lazy" />
        )}
      </div>
      <span className={`mt-2 text-xs ${active ? 'text-ink' : 'text-muted'}`}>{pageNumber}</span>
      {active ? <div className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" /> : null}
    </button>
  );
}
