# QA Review — Online Book Opener

## Architectural strengths
- Clear separation of app shell, reader, search drawer, and PDF-specific components
- Zustand used for UI/workspace orchestration rather than large blob storage
- IndexedDB correctly used for persistent PDF blobs and reading state
- PDF.js isolated behind service and hook layers
- Recent library, bookmarks, notes, and settings are persisted per book

## Technical debt observed
- `workspace-store.ts` remains the largest file and can be split further into slices later
- No automated unit/integration test suite yet
- Open Library embedded/archive reading cannot provide deep in-app page sync
- Thumbnail rail still renders many button nodes for extremely large PDFs

## QA refinements completed
- Added better user-facing error notices
- Improved unsupported/corrupted PDF handling
- Added missing-file IndexedDB warnings
- Added reader error boundary
- Added lazy loading for heavy PDF and command-palette chunks
- Improved mobile stacking and responsive spacing
- Added cache cleanup improvements for rendered PDF pages

## Manual QA checklist
- Upload a valid PDF
- Reopen recent PDFs after refresh
- Delete PDFs from recent library
- Switch between multiple PDF tabs
- Jump using thumbnails
- Change zoom repeatedly
- Save bookmarks and notes
- Toggle settings and verify persistence
- Use `Ctrl + K` command palette

## Recommended next improvements
- Add automated Playwright smoke tests
- Add unit tests for storage and reducer-like store helpers
- Add thumbnail virtualization for very large PDFs
- Add analytics/profiling hooks for cache hit rates and render timings
