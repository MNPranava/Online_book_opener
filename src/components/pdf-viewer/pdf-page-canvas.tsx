import type { PDFDocumentProxy } from 'pdfjs-dist';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePdfPageBitmap } from '../../hooks/use-pdf-page-bitmap';
import type { RenderQuality, ThemeMode } from '../../types-books';

interface PdfPageCanvasProps {
  fileId: string;
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  quality: RenderQuality;
  theme: ThemeMode;
}

function getThemeStyles(theme: ThemeMode) {
  if (theme === 'sepia') {
    return {
      frameClass: 'bg-[#f5ecd9] border-amber-900/10',
      filter: 'sepia(0.55) saturate(0.82) brightness(0.98) hue-rotate(-7deg)',
    };
  }

  if (theme === 'light') {
    return {
      frameClass: 'bg-white border-slate-200/60',
      filter: 'none',
    };
  }

  return {
    frameClass: 'bg-[#fffdf4] border-black/5',
    filter: 'none',
  };
}

export function PdfPageCanvas({ fileId, pdfDocument, pageNumber, zoom, quality, theme }: PdfPageCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(420);
  const { bitmap, loading, error } = usePdfPageBitmap({
    fileId,
    pdfDocument,
    pageNumber,
    zoom,
    targetWidth: Math.max(280, containerWidth - 32),
    quality,
    kind: 'page',
  });

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;
      if (nextWidth) setContainerWidth(nextWidth);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const themeStyles = getThemeStyles(theme);

  return (
    <div
      ref={wrapperRef}
      className={`relative flex min-h-[420px] items-start justify-center rounded-[28px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${themeStyles.frameClass}`}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-inherit/60 text-slate-500 backdrop-blur-[1px]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
        </div>
      ) : null}

      {error ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
          <TriangleAlert className="h-5 w-5 text-amber-500" />
          <p>{error}</p>
        </div>
      ) : bitmap ? (
        <img
          src={bitmap.src}
          alt={`Page ${pageNumber}`}
          className="max-w-full rounded-2xl shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
          style={{ width: `${bitmap.width}px`, height: `${bitmap.height}px`, filter: themeStyles.filter }}
          loading="lazy"
        />
      ) : null}
    </div>
  );
}
