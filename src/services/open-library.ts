import type { OpenLibraryResult } from '../types-books';

interface OpenLibraryDoc {
  key: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  ia?: string[] | string;
  public_scan_b?: boolean;
  has_fulltext?: boolean;
  availability?: {
    is_readable?: boolean;
    is_previewable?: boolean;
    status?: string;
  };
  editions?: {
    docs?: Array<{
      ebook_access?: string;
    }>;
  };
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
}

const SEARCH_FIELDS = [
  'key',
  'title',
  'author_name',
  'cover_i',
  'first_publish_year',
  'ia',
  'public_scan_b',
  'has_fulltext',
  'availability',
  'editions',
  'editions.ebook_access',
].join(',');

function getCoverUrl(coverId?: number) {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined;
}

function getArchiveId(value?: string[] | string) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function buildArchiveEmbedUrl(archiveId: string) {
  return `https://archive.org/embed/${archiveId}`;
}

function normalizeAvailability(doc: OpenLibraryDoc) {
  const readableEdition = doc.editions?.docs?.some((edition) => edition.ebook_access === 'public');
  const readable = Boolean(doc.availability?.is_readable || doc.public_scan_b || readableEdition);

  if (readable) {
    return { readable: true, label: 'Readable online' };
  }

  if (doc.has_fulltext || doc.availability?.is_previewable) {
    return { readable: false, label: 'Preview unavailable' };
  }

  return { readable: false, label: 'Preview unavailable' };
}

export async function searchOpenLibraryBooks(query: string, signal?: AbortSignal): Promise<OpenLibraryResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: '10',
    fields: SEARCH_FIELDS,
  });

  const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error('Open Library search failed.');
  }

  const data = (await response.json()) as OpenLibraryResponse;
  return data.docs.map((doc) => {
    const availability = normalizeAvailability(doc);
    return {
      sourceId: doc.key.replace('/works/', ''),
      title: doc.title?.trim() || 'Untitled',
      author: doc.author_name?.[0]?.trim() || 'Unknown author',
      coverUrl: getCoverUrl(doc.cover_i),
      firstPublishYear: doc.first_publish_year,
      readable: availability.readable,
      availabilityLabel: availability.label,
      archiveId: availability.readable ? getArchiveId(doc.ia) : undefined,
      openLibraryKey: doc.key,
      description: availability.readable
        ? 'Publicly readable from Open Library / Internet Archive.'
        : 'Metadata available, but an embeddable public preview was not detected.',
    } satisfies OpenLibraryResult;
  });
}
