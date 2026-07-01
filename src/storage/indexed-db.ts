import { openDB, type DBSchema } from 'idb';
import type { PersistentBookState, RecentPdfLibraryItem, StoredPdfFile, StoredPdfMeta, WorkspaceSnapshot } from '../types-books';

const DB_NAME = 'online-book-opener-db';
const DB_VERSION = 2;
const WORKSPACE_KEY = 'workspace-snapshot';

interface ReaderDbSchema extends DBSchema {
  pdfFiles: {
    key: string;
    value: StoredPdfFile;
  };
  workspace: {
    key: string;
    value: WorkspaceSnapshot;
  };
  readingState: {
    key: string;
    value: PersistentBookState;
  };
}

const dbPromise = openDB<ReaderDbSchema>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('pdfFiles')) {
      db.createObjectStore('pdfFiles', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('workspace')) {
      db.createObjectStore('workspace');
    }

    if (!db.objectStoreNames.contains('readingState')) {
      db.createObjectStore('readingState', { keyPath: 'bookId' });
    }
  },
});

export async function savePdfFile(file: StoredPdfFile) {
  const db = await dbPromise;
  await db.put('pdfFiles', file);
}

export async function getPdfFile(fileId: string) {
  const db = await dbPromise;
  return db.get('pdfFiles', fileId);
}

export async function deletePdfFile(fileId: string) {
  const db = await dbPromise;
  await db.delete('pdfFiles', fileId);
}

export async function listStoredPdfMeta(): Promise<StoredPdfMeta[]> {
  const db = await dbPromise;
  const files = await db.getAll('pdfFiles');
  return files
    .map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      title: file.title,
      totalPages: file.totalPages,
      createdAt: file.createdAt,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveWorkspaceSnapshot(snapshot: WorkspaceSnapshot) {
  const db = await dbPromise;
  await db.put('workspace', snapshot, WORKSPACE_KEY);
}

export async function loadWorkspaceSnapshot(): Promise<WorkspaceSnapshot | undefined> {
  const db = await dbPromise;
  return db.get('workspace', WORKSPACE_KEY);
}

export async function saveBookState(state: PersistentBookState) {
  const db = await dbPromise;
  await db.put('readingState', state);
}

export async function getBookState(bookId: string) {
  const db = await dbPromise;
  return db.get('readingState', bookId);
}

export async function deleteBookState(bookId: string) {
  const db = await dbPromise;
  await db.delete('readingState', bookId);
}

export async function listBookStates() {
  const db = await dbPromise;
  return db.getAll('readingState');
}

export async function listRecentPdfLibraryItems(): Promise<RecentPdfLibraryItem[]> {
  const [pdfFiles, readingStates] = await Promise.all([listStoredPdfMeta(), listBookStates()]);
  const stateMap = new Map(readingStates.map((entry) => [entry.bookId, entry]));

  return pdfFiles.map((file) => {
    const bookId = `pdf:${file.id}`;
    const state = stateMap.get(bookId);
    return {
      fileId: file.id,
      bookId,
      title: file.title,
      totalPages: file.totalPages,
      createdAt: file.createdAt,
      lastOpenedAt: state?.lastOpenedAt ?? file.createdAt,
      currentPage: state?.currentPage ?? 0,
      size: file.size,
    } satisfies RecentPdfLibraryItem;
  });
}
