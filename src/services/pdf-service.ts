import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedPdfMetadata {
  fingerprint: string;
  title: string;
  totalPages: number;
}

function normalizePdfTitle(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
}

const documentCache = new Map<
  string,
  {
    document?: PDFDocumentProxy;
    promise?: Promise<PDFDocumentProxy>;
    refCount: number;
    cleanupTimer?: number;
  }
>();

function loadPdfDocumentFromBlobInternal(blob: Blob): Promise<PDFDocumentProxy> {
  return blob
    .arrayBuffer()
    .then((buffer) => getDocument({ data: buffer }).promise);
}

export async function extractPdfMetadata(file: File): Promise<ExtractedPdfMetadata> {
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  const document = await loadingTask.promise;

  try {
    const metadata = await document.getMetadata().catch(() => null);
    const info = (metadata?.info ?? {}) as { Title?: string };
    const infoTitle = info.Title?.trim();
    const dcTitle = metadata?.metadata?.get?.('dc:title')?.trim();

    return {
      fingerprint: document.fingerprints[0] ?? crypto.randomUUID(),
      title: dcTitle || infoTitle || normalizePdfTitle(file.name) || 'Untitled PDF',
      totalPages: document.numPages,
    };
  } finally {
    document.cleanup();
    await document.destroy();
  }
}

export async function acquirePdfDocument(fileId: string, blob: Blob): Promise<PDFDocumentProxy> {
  let entry = documentCache.get(fileId);

  if (entry) {
    entry.refCount += 1;
    if (entry.cleanupTimer) {
      window.clearTimeout(entry.cleanupTimer);
      entry.cleanupTimer = undefined;
    }
    if (entry.document) return entry.document;
    if (entry.promise) return entry.promise;
  }

  const promise = loadPdfDocumentFromBlobInternal(blob);
  entry = { refCount: 1, promise };
  documentCache.set(fileId, entry);

  try {
    const document = await promise;
    const cached = documentCache.get(fileId);
    if (cached) {
      cached.document = document;
      cached.promise = undefined;
    }
    return document;
  } catch (error) {
    documentCache.delete(fileId);
    throw error;
  }
}

export function releasePdfDocument(fileId: string) {
  const entry = documentCache.get(fileId);
  if (!entry) return;

  entry.refCount = Math.max(0, entry.refCount - 1);
  if (entry.refCount > 0) return;

  entry.cleanupTimer = window.setTimeout(() => {
    const current = documentCache.get(fileId);
    if (!current || current.refCount > 0) return;
    void current.document?.destroy();
    documentCache.delete(fileId);
  }, 30000);
}

export function evictPdfDocument(fileId: string) {
  const entry = documentCache.get(fileId);
  if (!entry) return;
  if (entry.cleanupTimer) window.clearTimeout(entry.cleanupTimer);
  void entry.document?.destroy();
  documentCache.delete(fileId);
}
