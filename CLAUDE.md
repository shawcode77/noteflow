# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev        # Start dev server at http://localhost:3000
                   # Note: path alias basePath="/noteflow" only applies in production build

# Production build (static export → out/)
npm run build

# Lint
npm run lint

# Run dev server directly (if npm scripts fail due to path issues on Windows)
node node_modules/next/dist/bin/next dev
node node_modules/next/dist/bin/next build
```

> On Windows with special characters in the path (e.g. `&`), use `node node_modules/next/dist/bin/next` directly instead of `npx next` or `.bin/next`.

## Architecture

### Three-Panel Layout

```
Sidebar (260px) | NoteList (300px) | TiptapEditor (flex)
```

All panels are rendered in [src/app/page.tsx](src/app/page.tsx). The sidebar can be collapsed via `useAppStore.sidebarOpen`.

### State Management (Zustand + localStorage)

Four stores in [src/stores/](src/stores/), each persisted to a separate localStorage key:

| Store | Key | Persists |
|-------|-----|---------|
| `useNoteStore` | `noteflow-notes` | All notes |
| `useFolderStore` | `noteflow-folders` | All folders |
| `useTagStore` | `noteflow-tags` | All tags |
| `useAppStore` | `noteflow-app` | `sidebarOpen`, `sidebarWidth`, `editorMode` only (via `partialize`) |

**Critical pattern**: Never call store methods that return derived arrays (e.g. `getRootFolders()`) directly inside a Zustand selector — this creates a new array reference on every render and causes infinite loops. Instead, select the raw `folders` array and derive in the component:

```ts
// Wrong — infinite loop
const folders = useFolderStore(s => s.getRootFolders())

// Correct
const folders = useFolderStore(s => s.folders)
const rootFolders = folders.filter(f => f.parentId === null)
```

### Editor

[src/components/editor/tiptap-editor.tsx](src/components/editor/tiptap-editor.tsx) uses Tiptap v3 with `immediatelyRender: false` (required to avoid SSR hydration mismatch in Next.js).

- Content is stored as JSON (`note.content`) and plain text (`note.contentText`) separately — plain text is used for full-text search.
- Auto-save debounces 1000ms after content changes.
- `isUpdatingRef` prevents save loops when loading a note into the editor.
- `@tiptap/extension-text-style` and `@tiptap/extension-table` use **named exports**, not default exports:

```ts
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
```

### Note Lifecycle

- Deletion is soft: `isDeleted: true` + `deletedAt` timestamp. Notes in trash are excluded from all views except `sidebarView === 'trash'`.
- `NoteList` derives its display list in a `useMemo` based on `sidebarView`, `activeFolderId`, `activeTagId`, and search state.

### Deployment

- Static export: `output: "export"`, `basePath: "/noteflow"` in [next.config.ts](next.config.ts)
- GitHub Actions workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) uses `npm install --ignore-scripts` (not `npm ci`) to avoid version parsing issues on the CI runner.
- Deployed to: `https://shawcode77.github.io/noteflow/`
