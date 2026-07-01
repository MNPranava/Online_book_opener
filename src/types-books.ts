export type BookSourceType = 'pdf' | 'archive' | 'metadata';
export type ThemeMode = 'dark' | 'sepia' | 'light';
export type PageMode = 'single' | 'double';
export type RenderQuality = 'draft' | 'balanced' | 'sharp';

export interface BookmarkEntry {
  id: string;
  page: number;
  label: string;
  createdAt: number;
}

export interface PageNoteEntry {
  id: string;
  page: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReaderSessionBase {
  id: string;
  title: string;
  author: string;
  sourceType: BookSourceType;
  totalPages: number;
  currentPage: number;
  zoom: number;
  transparencyEnabled: boolean;
  transparencyLevel: number;
  theme: ThemeMode;
  pageMode: PageMode;
  renderQuality: RenderQuality;
  coverUrl?: string;
  createdAt: number;
  lastOpenedAt: number;
  bookmarks: BookmarkEntry[];
  notes: PageNoteEntry[];
}

export interface PdfBookSession extends ReaderSessionBase {
  sourceType: 'pdf';
  fileId: string;
  fileName: string;
  fingerprint: string;
}

export interface ArchiveBookSession extends ReaderSessionBase {
  sourceType: 'archive';
  sourceId: string;
  archiveId: string;
  embedUrl: string;
  availabilityLabel: string;
  firstPublishYear?: number;
}

export interface MetadataBookSession extends ReaderSessionBase {
  sourceType: 'metadata';
  sourceId: string;
  availabilityLabel: string;
  firstPublishYear?: number;
  description?: string;
  openLibraryKey?: string;
}

export type ReaderSession = PdfBookSession | ArchiveBookSession | MetadataBookSession;

export interface WorkspaceSnapshot {
  tabs: ReaderSession[];
  activeTabId: string | null;
}

export interface StoredPdfFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  fingerprint: string;
  title: string;
  totalPages: number;
  blob: Blob;
  createdAt: number;
}

export interface StoredPdfMeta {
  id: string;
  name: string;
  size: number;
  title: string;
  totalPages: number;
  createdAt: number;
}

export interface PersistentBookState {
  bookId: string;
  currentPage: number;
  zoom: number;
  transparencyEnabled: boolean;
  transparencyLevel: number;
  theme: ThemeMode;
  pageMode: PageMode;
  renderQuality: RenderQuality;
  bookmarks: BookmarkEntry[];
  notes: PageNoteEntry[];
  lastOpenedAt: number;
}

export interface RecentPdfLibraryItem {
  fileId: string;
  bookId: string;
  title: string;
  totalPages: number;
  createdAt: number;
  lastOpenedAt: number;
  currentPage: number;
  size: number;
}


export interface UiNotice {
  id: string;
  tone: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
}

export interface OpenLibraryResult {
  sourceId: string;
  title: string;
  author: string;
  coverUrl?: string;
  firstPublishYear?: number;
  readable: boolean;
  availabilityLabel: string;
  archiveId?: string;
  description?: string;
  openLibraryKey: string;
}
