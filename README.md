# Foxed

**Foxed** is a polished web-based book opener and reader for TXT, EPUB, PDF, and direct book links. It gives local files a real reading-app feel: a remembered shelf, paged reading, animated page turns, themes, search, backup/restore, and responsive layouts for desktop, tablet, and mobile.

> Foxed is web-based. It is not currently packaged as an offline/PWA app.

---

## Features

### Book opening

- Open books from your device:
  - `.txt`
  - `.epub`
  - `.pdf`
- Open books from direct links:
  - TXT links
  - EPUB links
  - PDF links
  - Basic readable HTML pages
- Drag and drop file upload.
- Click-to-select file upload.
- URL fetch input with validation.
- File/link size limits to protect browser performance.

### Local shelf

- Recently opened books appear on a visual shelf.
- Books have colored spines.
- Continue reading cards show recent books.
- Reading progress is remembered.
- Duplicate detection prevents adding the same book repeatedly.
- Hold/long-press a book to reveal delete options.
- Delete confirmation modal prevents accidental removal.

### Reader modes

- One-page reading mode.
- Two-page spread mode.
- On small screens, the reader automatically falls back to a device-friendly single-page layout.
- Works across desktop, tablet, and mobile-sized screens.

### Page turning

- Animated page movement.
- Adaptive animation selection:
  - 3D flip on capable desktop devices.
  - Lightweight slide animation on compact/touch/low-power devices.
  - Reduced/no animation for users with reduced-motion preferences.
- In two-page mode, only the correct page flips:
  - Next turns the right page.
  - Previous turns the left page.
- Page content is prepared and timed during the animation to reduce visible snapping.
- Page counter updates as navigation starts.

### Zoom and navigation

- Previous/Next buttons.
- Keyboard navigation:
  - `←` previous page
  - `→` next page
- Swipe navigation on touch devices:
  - Swipe left for next page.
  - Swipe right for previous page.
- Per-page zoom controls.
- Drag-to-pan when zoomed.
- Zoom resets safely during page navigation.

### Reading settings

Use the `Aa` button in the reader to customize:

- Text size
- Line spacing
- Page margins
- Reading theme

Available themes:

- Paper
- Sepia
- Warm
- Dark
- Black
- Contrast

Settings are saved automatically.

### In-book search

Use the search button or `Ctrl/Cmd + F` while reading.

Search features:

- TXT/EPUB text search.
- PDF text search using PDF.js text extraction.
- Result count.
- Previous/Next result navigation.
- Search result snippets.
- Click a result to jump to its page/screen.
- TXT/EPUB matches are highlighted in the text.
- Search results are capped for performance.

### Library backup and restore

- Export the local library to a JSON backup file.
- Import a Foxed backup file later.
- Import skips duplicate books.
- Imported HTML content is sanitized before being saved.

### Keyboard shortcuts help

The `?` button opens a shortcut reference.

Included shortcuts:

- `←` previous page
- `→` next page
- `Del` delete focused shelf book
- `Esc` close popovers and dialogs
- Swipe gestures on touch devices

### Privacy and storage

Foxed is designed for local reading:

- Uploaded file content is processed in the browser.
- Book metadata and content are saved locally where supported.
- Storage priority:
  1. Host-provided `window.storage`, if available.
  2. IndexedDB.
  3. localStorage fallback for smaller data.
- Direct link fetching requires the browser to request that URL.
- Some websites may block direct fetches because of CORS restrictions.

---

## How to use

### Open a local book

1. Open `foxed_updated.html` in a browser or hosted page.
2. Choose **Upload a file**.
3. Drop a `.txt`, `.epub`, or `.pdf` file into the upload area, or click to select one.
4. The book opens in the reader.

### Open a book from a link

1. Select the **From a link** tab.
2. Paste a direct link to a TXT, EPUB, or PDF file.
3. Click **Fetch book**.

If the link fails, the website may be blocking cross-origin browser requests. Download the file and upload it manually instead.

### Change reading theme

1. Open a book.
2. Click **Aa** in the reader toolbar.
3. Pick a theme:
   - Paper
   - Sepia
   - Warm
   - Dark
   - Black
   - Contrast

### Search inside a book

1. Open a book.
2. Click the search icon `⌕`, or press `Ctrl/Cmd + F`.
3. Type at least two characters.
4. Use Previous/Next or click a result.

### Delete a book

1. On the shelf or continue-reading card, hold/long-press the book.
2. Choose **Delete book**.
3. Confirm removal.

Keyboard option:

1. Focus a shelf book.
2. Press `Delete` or `Backspace`.
3. Confirm removal.

### Export your library

1. Use the sidebar **Export** button.
2. Save the generated JSON backup somewhere safe.

### Import a library backup

1. Use the sidebar **Import** button.
2. Choose a Foxed backup JSON file.
3. Foxed imports new books and skips duplicates.

---

## Supported formats

| Format | Support |
|---|---|
| TXT | Reflowed paged reading |
| EPUB | Basic spine/content extraction with sanitized HTML and inline images |
| PDF | Canvas-based paged rendering using PDF.js |
| Direct links | Works best with direct TXT, EPUB, or PDF URLs |
| HTML links | Basic readable-body extraction, sanitized before rendering |

---

## Current limitations

- Not a PWA/offline app yet.
- CDN/network access is needed for external libraries and fonts when used as-is.
- EPUB support is intentionally simplified:
  - No DRM support.
  - Limited EPUB styling.
  - Complex layouts may not preserve publisher formatting exactly.
- PDF search depends on extractable text. Scanned image-only PDFs may not return useful results.
- Large books may be limited by browser memory and storage quota.
- Some direct links fail due to CORS restrictions.

---

## Security notes

Foxed includes several browser-side hardening measures:

- Sanitizes EPUB/HTML content before inserting it into the reader.
- Removes scripts, event handlers, forms, iframes, SVG/math/object/embed content, and unsafe attributes.
- Blocks unsafe/remote images from fetched HTML.
- Uses PDF.js with `isEvalSupported: false`.
- Applies file/link size limits.
- Uses Subresource Integrity for JSZip CDN loading.

For a production deployment, recommended next hardening steps:

- Self-host or bundle dependencies.
- Add a strict Content Security Policy.
- Add automated malicious EPUB/PDF fixtures for regression testing.
- Consider stronger sanitization with a dedicated sanitizer library if the project grows.

---

## Project file

Main app file:

```text
foxed_updated.html
```

Reference report:

```text
foxed_audit_report.md
```

---

## Recommended browser support

Foxed is intended for modern browsers with support for:

- ES modules / dynamic import
- IndexedDB
- CSS transforms
- Pointer events
- Canvas
- File API

Recommended browsers:

- Chrome / Edge
- Firefox
- Safari
- Mobile Safari / Chrome Android

---

## Future ideas

Potential future improvements:

- Table of contents drawer.
- Bookmarks and notes.
- Shelf sorting/filtering.
- PDF page pre-render cache.
- Better EPUB navigation parsing.
- Import progress for large backups.
- More typography controls.

---

## License

This project is licensed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
