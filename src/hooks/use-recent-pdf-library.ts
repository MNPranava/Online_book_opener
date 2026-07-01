import { useEffect, useState } from 'react';
import { listRecentPdfLibraryItems } from '../storage/indexed-db';
import type { RecentPdfLibraryItem } from '../types-books';

export function useRecentPdfLibrary(refreshToken: number) {
  const [items, setItems] = useState<RecentPdfLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLibrary() {
      setLoading(true);
      setError(null);
      try {
        const nextItems = await listRecentPdfLibraryItems();
        if (mounted) setItems(nextItems);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load library.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadLibrary();
    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  return { items, loading, error };
}
