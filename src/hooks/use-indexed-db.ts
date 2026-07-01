import { useEffect, useState } from 'react';
import { getPdfFile } from '../storage/indexed-db';

export function useIndexedDbPdf(fileId?: string) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(Boolean(fileId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPdfBlob() {
      if (!fileId) {
        setBlob(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const stored = await getPdfFile(fileId);
        if (!stored) {
          throw new Error('This PDF is no longer available in IndexedDB. Please upload it again.');
        }

        if (!cancelled) {
          setBlob(stored.blob);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF from IndexedDB.');
          setBlob(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPdfBlob();

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  return { blob, loading, error };
}
