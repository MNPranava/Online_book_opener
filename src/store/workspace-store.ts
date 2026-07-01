import { create } from 'zustand';
import type {
  BookmarkEntry,
  OpenLibraryResult,
  PageMode,
  PageNoteEntry,
  PdfBookSession,
  PersistentBookState,
  ReaderSession,
  RenderQuality,
  ThemeMode,
  UiNotice,
  WorkspaceSnapshot,
} from '../types-books';
import {
  deleteBookState,
  deletePdfFile,
  getBookState,
  getPdfFile,
  loadWorkspaceSnapshot,
  saveBookState,
  savePdfFile,
  saveWorkspaceSnapshot,
} from '../storage/indexed-db';
import { buildArchiveEmbedUrl } from '../services/open-library';

interface WorkspaceState {
  tabs: ReaderSession[];
  activeTabId: string | null;
  isHydrated: boolean;
  isImportingPdf: boolean;
  settingsOpenTabId: string | null;
  commandPaletteOpen: boolean;
  libraryRefreshToken: number;
  uiNotice: UiNotice | null;
  initializeWorkspace: () => Promise<void>;
  openPdfFile: (file: File) => Promise<void>;
  openStoredPdf: (fileId: string) => Promise<void>;
  deleteStoredPdf: (fileId: string) => Promise<void>;
  openSearchResult: (result: OpenLibraryResult) => Promise<void>;
  closeBook: (sessionId: string) => void;
  activateBook: (sessionId: string) => void;
  cycleTabs: () => void;
  setPage: (sessionId: string, page: number) => void;
  setZoom: (sessionId: string, nextZoom: number) => void;
  adjustZoom: (sessionId: string, delta: number) => void;
  setTransparencyEnabled: (sessionId: string, enabled: boolean) => void;
  setTransparencyLevel: (sessionId: string, value: number) => void;
  setTheme: (sessionId: string, theme: ThemeMode) => void;
  setPageMode: (sessionId: string, mode: PageMode) => void;
  setRenderQuality: (sessionId: string, quality: RenderQuality) => void;
  addBookmark: (sessionId: string, page?: number) => void;
  removeBookmark: (sessionId: string, bookmarkId: string) => void;
  savePageNote: (sessionId: string, page: number, content: string) => void;
  deletePageNote: (sessionId: string, noteId: string) => void;
  toggleSettings: (sessionId: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  showNotice: (notice: Omit<UiNotice, 'id'>) => void;
  clearNotice: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const DEFAULT_BOOK_STATE: Omit<PersistentBookState, 'bookId' | 'lastOpenedAt'> = {
  currentPage: 0,
  zoom: 100,
  transparencyEnabled: true,
  transparencyLevel: 50,
  theme: 'dark',
  pageMode: 'double',
  renderQuality: 'balanced',
  bookmarks: [],
  notes: [],
};

function createNotice(notice: Omit<UiNotice, 'id'>): UiNotice {
  return { id: crypto.randomUUID(), ...notice };
}

function createBaseSession(
  overrides: Partial<ReaderSession> & Pick<ReaderSession, 'id' | 'title' | 'author' | 'sourceType' | 'totalPages'>,
): ReaderSession {
  const now = Date.now();
  return {
    ...DEFAULT_BOOK_STATE,
    createdAt: now,
    lastOpenedAt: now,
    ...overrides,
  } as ReaderSession;
}

function createPdfSession(params: {
  title: string;
  fileId: string;
  fileName: string;
  fingerprint: string;
  totalPages: number;
}) {
  return createBaseSession({
    id: `pdf:${params.fingerprint}`,
    sourceType: 'pdf',
    title: params.title,
    author: 'Local PDF',
    totalPages: params.totalPages,
    fileId: params.fileId,
    fileName: params.fileName,
    fingerprint: params.fingerprint,
  }) as PdfBookSession;
}

function createPersistentStateFromTab(tab: ReaderSession): PersistentBookState {
  return {
    bookId: tab.id,
    currentPage: tab.currentPage,
    zoom: tab.zoom,
    transparencyEnabled: tab.transparencyEnabled,
    transparencyLevel: tab.transparencyLevel,
    theme: tab.theme,
    pageMode: tab.pageMode,
    renderQuality: tab.renderQuality,
    bookmarks: tab.bookmarks,
    notes: tab.notes,
    lastOpenedAt: tab.lastOpenedAt,
  };
}

async function mergePersistedState<T extends ReaderSession>(tab: T): Promise<T> {
  const persisted = await getBookState(tab.id);
  if (!persisted) return tab;

  return {
    ...tab,
    currentPage: persisted.currentPage,
    zoom: persisted.zoom,
    transparencyEnabled: persisted.transparencyEnabled,
    transparencyLevel: persisted.transparencyLevel,
    theme: persisted.theme,
    pageMode: persisted.pageMode,
    renderQuality: persisted.renderQuality,
    bookmarks: persisted.bookmarks,
    notes: persisted.notes,
    lastOpenedAt: persisted.lastOpenedAt,
  } as T;
}

function persistSnapshot(snapshot: WorkspaceSnapshot) {
  void saveWorkspaceSnapshot(snapshot);
}

function persistTab(tab: ReaderSession) {
  void saveBookState(createPersistentStateFromTab(tab));
}

function touchTab<T extends ReaderSession>(tab: T): T {
  return { ...tab, lastOpenedAt: Date.now() };
}

function sanitizeSnapshot(snapshot?: WorkspaceSnapshot): WorkspaceSnapshot {
  const tabs = snapshot?.tabs ?? [];
  const activeExists = tabs.some((tab) => tab.id === snapshot?.activeTabId);
  return {
    tabs,
    activeTabId: activeExists ? snapshot?.activeTabId ?? null : tabs[0]?.id ?? null,
  };
}

function bumpLibrary(libraryRefreshToken: number) {
  return libraryRefreshToken + 1;
}

function updateTabCollection(
  tabs: ReaderSession[],
  sessionId: string,
  updater: (tab: ReaderSession) => ReaderSession,
) {
  let updatedTab: ReaderSession | null = null;
  const nextTabs = tabs.map((tab) => {
    if (tab.id !== sessionId) return tab;
    updatedTab = updater(tab);
    return updatedTab;
  });
  return { nextTabs, updatedTab };
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  tabs: [],
  activeTabId: null,
  isHydrated: false,
  isImportingPdf: false,
  settingsOpenTabId: null,
  commandPaletteOpen: false,
  libraryRefreshToken: 0,
  uiNotice: null,
  showNotice: (notice) => set({ uiNotice: createNotice(notice) }),
  clearNotice: () => set({ uiNotice: null }),
  initializeWorkspace: async () => {
    if (get().isHydrated) return;
    try {
      const snapshot = sanitizeSnapshot(await loadWorkspaceSnapshot());
      set({ tabs: snapshot.tabs, activeTabId: snapshot.activeTabId, isHydrated: true });
    } catch (error) {
      console.error(error);
      set({
        tabs: [],
        activeTabId: null,
        isHydrated: true,
        uiNotice: createNotice({
          tone: 'warning',
          title: 'Workspace restored partially',
          description: 'IndexedDB could not be read, so the app started with an empty workspace.',
        }),
      });
    }
  },
  openPdfFile: async (file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      set({
        uiNotice: createNotice({
          tone: 'warning',
          title: 'Unsupported file',
          description: 'Please select a valid PDF document.',
        }),
      });
      return;
    }

    set({ isImportingPdf: true });
    try {
      const { extractPdfMetadata } = await import('../services/pdf-service');
      const metadata = await extractPdfMetadata(file);
      const tabId = `pdf:${metadata.fingerprint}`;
      const existing = get().tabs.find((tab) => tab.id === tabId);

      if (existing) {
        const touched = touchTab(existing);
        set((state) => {
          const tabs = state.tabs.map((tab) => (tab.id === tabId ? touched : tab));
          persistSnapshot({ tabs, activeTabId: tabId });
          persistTab(touched);
          return {
            tabs,
            activeTabId: tabId,
            isImportingPdf: false,
            libraryRefreshToken: bumpLibrary(state.libraryRefreshToken),
            uiNotice: createNotice({
              tone: 'info',
              title: 'Book already open',
              description: 'The selected PDF was already in your workspace, so the existing tab was focused.',
            }),
          };
        });
        return;
      }

      await savePdfFile({
        id: metadata.fingerprint,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        fingerprint: metadata.fingerprint,
        title: metadata.title,
        totalPages: metadata.totalPages,
        blob: file,
        createdAt: Date.now(),
      });

      const mergedTab = await mergePersistedState(
        createPdfSession({
          title: metadata.title,
          fileId: metadata.fingerprint,
          fileName: file.name,
          fingerprint: metadata.fingerprint,
          totalPages: metadata.totalPages,
        }),
      );
      const nextTab = touchTab(mergedTab);

      set((state) => {
        const tabs = [...state.tabs, nextTab];
        persistSnapshot({ tabs, activeTabId: nextTab.id });
        persistTab(nextTab);
        return {
          tabs,
          activeTabId: nextTab.id,
          isImportingPdf: false,
          libraryRefreshToken: bumpLibrary(state.libraryRefreshToken),
          uiNotice: createNotice({
            tone: 'success',
            title: 'PDF opened',
            description: `${nextTab.title} is now available in the workspace and recent library.`,
          }),
        };
      });
    } catch (error) {
      console.error(error);
      set({
        isImportingPdf: false,
        uiNotice: createNotice({
          tone: 'error',
          title: 'Failed to open PDF',
          description:
            error instanceof Error
              ? error.message
              : 'The selected file could not be parsed. Please try another PDF.',
        }),
      });
    }
  },
  openStoredPdf: async (fileId) => {
    const tabId = `pdf:${fileId}`;
    const existing = get().tabs.find((tab) => tab.id === tabId);
    if (existing) {
      get().activateBook(tabId);
      return;
    }

    try {
      const stored = await getPdfFile(fileId);
      if (!stored) {
        set({
          uiNotice: createNotice({
            tone: 'warning',
            title: 'Missing PDF file',
            description: 'This recent library entry no longer has a stored PDF blob. Upload the file again.',
          }),
        });
        return;
      }

      const mergedTab = await mergePersistedState(
        createPdfSession({
          title: stored.title,
          fileId: stored.id,
          fileName: stored.name,
          fingerprint: stored.fingerprint,
          totalPages: stored.totalPages,
        }),
      );
      const nextTab = touchTab(mergedTab);

      set((state) => {
        const tabs = [...state.tabs, nextTab];
        persistSnapshot({ tabs, activeTabId: nextTab.id });
        persistTab(nextTab);
        return {
          tabs,
          activeTabId: nextTab.id,
          libraryRefreshToken: bumpLibrary(state.libraryRefreshToken),
        };
      });
    } catch (error) {
      console.error(error);
      set({
        uiNotice: createNotice({
          tone: 'error',
          title: 'Could not reopen recent PDF',
          description: 'IndexedDB failed while loading the stored document.',
        }),
      });
    }
  },
  deleteStoredPdf: async (fileId) => {
    const bookId = `pdf:${fileId}`;
    try {
      await Promise.all([deletePdfFile(fileId), deleteBookState(bookId)]);
      const [{ purgeBitmapCacheForFile }, { evictPdfDocument }] = await Promise.all([
        import('../services/pdf-render-cache'),
        import('../services/pdf-service'),
      ]);
      purgeBitmapCacheForFile(fileId);
      evictPdfDocument(fileId);

      set((state) => {
        const tabs = state.tabs.filter((tab) => !(tab.sourceType === 'pdf' && tab.fileId === fileId));
        const activeTabId = tabs.some((tab) => tab.id === state.activeTabId) ? state.activeTabId : tabs[0]?.id ?? null;
        persistSnapshot({ tabs, activeTabId });
        return {
          tabs,
          activeTabId,
          libraryRefreshToken: bumpLibrary(state.libraryRefreshToken),
          uiNotice: createNotice({
            tone: 'success',
            title: 'PDF deleted',
            description: 'The PDF was removed from IndexedDB, recent library, and any open tabs.',
          }),
        };
      });
    } catch (error) {
      console.error(error);
      set({
        uiNotice: createNotice({
          tone: 'error',
          title: 'Delete failed',
          description: 'The PDF could not be deleted from IndexedDB. Please retry.',
        }),
      });
    }
  },
  openSearchResult: async (result) => {
    const type = result.readable && result.archiveId ? 'archive' : 'metadata';
    const id = `${type}:${result.sourceId}`;
    const existing = get().tabs.find((tab) => tab.id === id);

    if (existing) {
      get().activateBook(id);
      return;
    }

    const rawTab: ReaderSession =
      result.readable && result.archiveId
        ? createBaseSession({
            id,
            sourceType: 'archive',
            title: result.title,
            author: result.author,
            totalPages: 1,
            sourceId: result.sourceId,
            archiveId: result.archiveId,
            embedUrl: buildArchiveEmbedUrl(result.archiveId),
            availabilityLabel: result.availabilityLabel,
            coverUrl: result.coverUrl,
            firstPublishYear: result.firstPublishYear,
          })
        : createBaseSession({
            id,
            sourceType: 'metadata',
            title: result.title,
            author: result.author,
            totalPages: 1,
            sourceId: result.sourceId,
            availabilityLabel: result.availabilityLabel,
            coverUrl: result.coverUrl,
            firstPublishYear: result.firstPublishYear,
            description: result.description,
            openLibraryKey: result.openLibraryKey,
          });

    const nextTab = touchTab(await mergePersistedState(rawTab));

    set((state) => {
      const tabs = [...state.tabs, nextTab];
      persistSnapshot({ tabs, activeTabId: nextTab.id });
      persistTab(nextTab);
      return { tabs, activeTabId: nextTab.id };
    });
  },
  closeBook: (sessionId) =>
    set((state) => {
      const tabs = state.tabs.filter((tab) => tab.id !== sessionId);
      const activeTabId = state.activeTabId === sessionId ? tabs[0]?.id ?? null : state.activeTabId;
      persistSnapshot({ tabs, activeTabId });
      return {
        tabs,
        activeTabId,
        settingsOpenTabId: state.settingsOpenTabId === sessionId ? null : state.settingsOpenTabId,
      };
    }),
  activateBook: (sessionId) => {
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) => touchTab(tab));
      persistSnapshot({ tabs: nextTabs, activeTabId: sessionId });
      if (updatedTab) persistTab(updatedTab);
      return {
        tabs: nextTabs,
        activeTabId: sessionId,
        libraryRefreshToken: bumpLibrary(state.libraryRefreshToken),
      };
    });
  },
  cycleTabs: () =>
    set((state) => {
      if (state.tabs.length <= 1 || !state.activeTabId) return state;
      const currentIndex = state.tabs.findIndex((tab) => tab.id === state.activeTabId);
      const nextIndex = (currentIndex + 1) % state.tabs.length;
      const activeTabId = state.tabs[nextIndex].id;
      persistSnapshot({ tabs: state.tabs, activeTabId });
      return { activeTabId };
    }),
  setPage: (sessionId, page) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({
          ...tab,
          currentPage: clamp(page, 0, Math.max(0, tab.totalPages - 1)),
        }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  setZoom: (sessionId, nextZoom) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({ ...tab, zoom: clamp(nextZoom, 60, 220) }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  adjustZoom: (sessionId, delta) => {
    const tab = get().tabs.find((item) => item.id === sessionId);
    if (!tab) return;
    get().setZoom(sessionId, tab.zoom + delta);
  },
  setTransparencyEnabled: (sessionId, enabled) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({ ...tab, transparencyEnabled: enabled }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  setTransparencyLevel: (sessionId, value) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({ ...tab, transparencyLevel: clamp(value, 15, 100) }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  setTheme: (sessionId, theme) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) => touchTab({ ...tab, theme }));
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  setPageMode: (sessionId, mode) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) => touchTab({ ...tab, pageMode: mode }));
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  setRenderQuality: (sessionId, quality) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({ ...tab, renderQuality: quality }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  addBookmark: (sessionId, page) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) => {
        const targetPage = page ?? tab.currentPage;
        const existing = tab.bookmarks.find((bookmark) => bookmark.page === targetPage);
        if (existing) return touchTab(tab);
        const nextBookmark: BookmarkEntry = {
          id: crypto.randomUUID(),
          page: targetPage,
          label: `Page ${targetPage + 1}`,
          createdAt: Date.now(),
        };
        return touchTab({
          ...tab,
          bookmarks: [...tab.bookmarks, nextBookmark].sort((a, b) => a.page - b.page),
        });
      });
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  removeBookmark: (sessionId, bookmarkId) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({
          ...tab,
          bookmarks: tab.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
        }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  savePageNote: (sessionId, page, content) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) => {
        const trimmed = content.trim();
        const existing = tab.notes.find((note) => note.page === page);
        let notes = tab.notes;

        if (!trimmed) {
          notes = notes.filter((note) => note.page !== page);
        } else if (existing) {
          notes = notes.map((note) =>
            note.id === existing.id ? { ...note, content: trimmed, updatedAt: Date.now() } : note,
          );
        } else {
          const nextNote: PageNoteEntry = {
            id: crypto.randomUUID(),
            page,
            content: trimmed,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          notes = [...notes, nextNote].sort((a, b) => a.page - b.page);
        }

        return touchTab({ ...tab, notes });
      });
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  deletePageNote: (sessionId, noteId) =>
    set((state) => {
      const { nextTabs, updatedTab } = updateTabCollection(state.tabs, sessionId, (tab) =>
        touchTab({
          ...tab,
          notes: tab.notes.filter((note) => note.id !== noteId),
        }),
      );
      persistSnapshot({ tabs: nextTabs, activeTabId: state.activeTabId });
      if (updatedTab) persistTab(updatedTab);
      return { tabs: nextTabs, libraryRefreshToken: bumpLibrary(state.libraryRefreshToken) };
    }),
  toggleSettings: (sessionId) =>
    set((state) => ({ settingsOpenTabId: state.settingsOpenTabId === sessionId ? null : sessionId })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
