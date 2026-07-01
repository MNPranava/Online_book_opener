import { useEffect, useMemo, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useIndexedDbPdf } from './use-indexed-db';
import { acquirePdfDocument, releasePdfDocument } from '../services/pdf-service';

interface UsePdfReaderOptions {
  fileId?: string;
  currentPage: number;
  preloadRadius?: number;
}

export function usePdfReader({ fileId, currentPage, preloadRadius = 2 }: UsePdfReaderOptions) {
  const { blob, loading: blobLoading, error: blobError } = useIndexedDbPdf(fileId);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(Boolean(fileId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      if (!fileId) {
        setPdfDocument(null);
        setLoadingDocument(false);
        setError(blobError ?? null);
        return;
      }

      if (!blob) {
        setPdfDocument(null);
        setLoadingDocument(blobLoading);
        if (blobError) setError(blobError);
        return;
      }

      setLoadingDocument(true);
      setError(null);

      try {
        const document = await acquirePdfDocument(fileId, blob);
        if (!cancelled) {
          setPdfDocument(document);
        }
      } catch (err) {
        if (!cancelled) {
          setPdfDocument(null);
          setError(err instanceof Error ? err.message : 'Failed to open the PDF document.');
        }
      } finally {
        if (!cancelled) {
          setLoadingDocument(false);
        }
      }
    }

    void loadDocument();

    return () => {
      cancelled = true;
      if (fileId) {
        releasePdfDocument(fileId);
      }
      setPdfDocument(null);
    };
  }, [blob, blobError, blobLoading, fileId]);

  const nearbyPages = useMemo(() => {
    const totalPages = pdfDocument?.numPages ?? 0;
    if (!totalPages) return [] as number[];

    const start = Math.max(1, currentPage + 1 - preloadRadius);
    const end = Math.min(totalPages, currentPage + 1 + preloadRadius);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, pdfDocument?.numPages, preloadRadius]);

  useEffect(() => {
    if (!pdfDocument || nearbyPages.length === 0) return;

    let cancelled = false;
    const activeDocument = pdfDocument;

    async function preloadNearbyPages() {
      try {
        await Promise.all(nearbyPages.map((pageNumber) => activeDocument.getPage(pageNumber)));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to preload nearby PDF pages.');
        }
      }
    }

    void preloadNearbyPages();

    return () => {
      cancelled = true;
    };
  }, [nearbyPages, pdfDocument]);

  return {
    pdfDocument,
    totalPages: pdfDocument?.numPages ?? 0,
    nearbyPages,
    loading: blobLoading || loadingDocument,
    error: error || blobError,
  };
}
