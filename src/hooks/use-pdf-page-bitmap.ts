import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useEffect, useState } from 'react';
import { renderPdfBitmap, type CachedBitmapEntry } from '../services/pdf-render-cache';
import type { RenderQuality } from '../types-books';

interface UsePdfPageBitmapOptions {
  fileId: string;
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  targetWidth: number;
  quality: RenderQuality;
  kind: 'page' | 'thumb';
  enabled?: boolean;
}

export function usePdfPageBitmap({
  fileId,
  pdfDocument,
  pageNumber,
  zoom,
  targetWidth,
  quality,
  kind,
  enabled = true,
}: UsePdfPageBitmapOptions) {
  const [bitmap, setBitmap] = useState<CachedBitmapEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    async function loadBitmap() {
      try {
        setLoading(true);
        setError(null);
        const nextBitmap = await renderPdfBitmap({
          fileId,
          pdfDocument,
          pageNumber,
          zoom,
          targetWidth,
          quality,
          kind,
          signal: controller.signal,
        });

        if (mounted) {
          setBitmap(nextBitmap);
        }
      } catch (err) {
        if (!mounted || controller.signal.aborted) return;
        setBitmap(null);
        setError(err instanceof Error ? err.message : 'Failed to render page bitmap.');
      } finally {
        if (mounted && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadBitmap();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [enabled, fileId, kind, pageNumber, pdfDocument, quality, targetWidth, zoom]);

  return { bitmap, loading, error };
}
