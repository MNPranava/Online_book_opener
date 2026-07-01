import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { RenderQuality } from '../types-books';

export interface CachedBitmapEntry {
  key: string;
  src: string;
  width: number;
  height: number;
  lastUsed: number;
  fileId: string;
}

interface RenderBitmapOptions {
  fileId: string;
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  targetWidth: number;
  quality: RenderQuality;
  kind: 'page' | 'thumb';
  signal?: AbortSignal;
}

const MAX_BITMAP_ENTRIES = 160;
const bitmapCache = new Map<string, CachedBitmapEntry>();
const inflightRenders = new Map<string, Promise<CachedBitmapEntry>>();

const qualityScale: Record<RenderQuality, number> = {
  draft: 0.85,
  balanced: 1,
  sharp: 1.3,
};

function cacheKey(options: RenderBitmapOptions) {
  const widthBucket = Math.round(options.targetWidth / 24) * 24;
  return [options.fileId, options.pageNumber, options.kind, widthBucket, options.zoom, options.quality].join(':');
}

function touch(entry: CachedBitmapEntry) {
  entry.lastUsed = Date.now();
  return entry;
}

function evictIfNeeded() {
  if (bitmapCache.size <= MAX_BITMAP_ENTRIES) return;
  const sortedEntries = [...bitmapCache.values()].sort((a, b) => a.lastUsed - b.lastUsed);
  while (bitmapCache.size > MAX_BITMAP_ENTRIES && sortedEntries.length > 0) {
    const oldest = sortedEntries.shift();
    if (!oldest) break;
    URL.revokeObjectURL(oldest.src);
    bitmapCache.delete(oldest.key);
  }
}

function storeBitmap(entry: CachedBitmapEntry) {
  bitmapCache.set(entry.key, entry);
  evictIfNeeded();
  return entry;
}

export function getCachedBitmap(key: string) {
  const cached = bitmapCache.get(key);
  if (!cached) return null;
  touch(cached);
  return cached;
}

async function blobFromCanvas(canvas: HTMLCanvasElement, kind: 'page' | 'thumb') {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to serialize rendered page.'));
      },
      'image/webp',
      kind === 'thumb' ? 0.78 : 0.92,
    );
  });
}

export async function renderPdfBitmap(options: RenderBitmapOptions): Promise<CachedBitmapEntry> {
  const key = cacheKey(options);
  const cached = getCachedBitmap(key);
  if (cached) return cached;

  const existingRender = inflightRenders.get(key);
  if (existingRender) return existingRender;

  const renderPromise = (async () => {
    const page = await options.pdfDocument.getPage(options.pageNumber);
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const dpr = window.devicePixelRatio || 1;
    const baseViewport = page.getViewport({ scale: 1 });
    const fitWidth = Math.max(56, options.targetWidth);
    const scale = (fitWidth / baseViewport.width) * (options.zoom / 100) * qualityScale[options.quality] * dpr;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable.');

    const renderTask = page.render({ canvasContext: context, viewport, canvas });
    const cancelRender = () => renderTask.cancel();
    options.signal?.addEventListener('abort', cancelRender, { once: true });

    try {
      await renderTask.promise;
      if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const blob = await blobFromCanvas(canvas, options.kind);
      const entry = storeBitmap({
        key,
        src: URL.createObjectURL(blob),
        width: canvas.width / dpr,
        height: canvas.height / dpr,
        lastUsed: Date.now(),
        fileId: options.fileId,
      });
      return entry;
    } finally {
      page.cleanup();
      options.signal?.removeEventListener('abort', cancelRender);
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    }
  })().finally(() => inflightRenders.delete(key));

  inflightRenders.set(key, renderPromise);
  return renderPromise;
}

export function purgeBitmapCacheForFile(fileId: string) {
  for (const [key, entry] of bitmapCache.entries()) {
    if (entry.fileId === fileId) {
      URL.revokeObjectURL(entry.src);
      bitmapCache.delete(key);
    }
  }
}

export function clearBitmapCache() {
  for (const entry of bitmapCache.values()) {
    URL.revokeObjectURL(entry.src);
  }
  bitmapCache.clear();
}
