# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Puzzelin is an online multiplayer puzzle game where friends and family can collaborate in real-time to solve jigsaw puzzles. The puzzle is drawn with P5.js, kept in IndexedDB so it works offline and survives reloads, and synced between players in a room over WebSockets.

**Live app:** https://puzzelin.se (Docker on the game server behind the shared Caddy in the `edge` repo)

## Development Commands

```bash
bun install      # Install dependencies
bun dev          # Server on http://localhost:3000; rebuilds the client on every page load
bun run build    # Bundle the client into dist/ (what production serves)
bun start        # Run the server (builds the client first if dist/ is missing)
bun run types    # Type checking
bun run lint     # Linting
bun run format   # Format checking
```

`PEXELS_API_KEY` must be set (Bun loads `.env.local`). Dev data (SQLite + uploads) goes to `server/data/`.

## Stack

- **Runtime / server:** Bun (`Bun.serve`, `bun:sqlite`, WebSockets), no framework
- **UI:** React 19, server-rendered with `renderToString` and hydrated in the browser
- **Graphics:** P5.js for the puzzle canvas (lazy-loaded, browser only)
- **Styling:** Tailwind CSS v4 via `bun-plugin-tailwind`
- **State:** Jotai atoms (`app/atoms.ts`)
- **Images:** Pexels API (server-side, cached in SQLite), plus uploaded images stored on disk

## Architecture

### Server (`server/`)

- `index.ts` - One Bun server for everything: pages, static files, `/api/*` and the `/api/ws` WebSocket
- `render.tsx` - The HTML document: meta tags for SEO, server-rendered `<App>`, and `window.__PAGE__` for hydration
- `store.ts` - SQLite: `rooms` (puzzle metadata), `pieces` (one row per piece, JSON), `cache` (Pexels answers)
- `pexels.ts` - Pexels client with SQLite cache, stale-while-revalidate, a concurrency limit and a pause after 429s (their limit is 200 requests/hour)
- `gallery.ts` - The image rows on the home page and in the "new puzzle" modal (seasonal rows by month)

Rooms live in memory while someone is connected; moved pieces are flushed to SQLite every second and on shutdown. Uploaded images are JPEGs in `DATA_DIR/images`, served at `/api/images/<id>.jpg`.

### Pages (`app/`)

- Routes: `/` redirects to `/<lang>` (Accept-Language); `/<lang>` home; `/<lang>/room/<code>/<imageId>?size=` room; `/<lang>/room/<code>` redirects to the room's current image (invite links)
- `server/index.ts` `loadPage()` loads each page's data into a `Page` (`app/pages.ts`); `app/App.tsx` renders it on both sides; `app/client.tsx` hydrates
- No client-side router: moving between pages is a plain page load (`navigate()` in `app/navigation.tsx`), which also tears the canvas down cleanly. Use `usePathname()` from there, not `window.location`, during render
- Code that touches `window`/`document` must run in effects or handlers, since every component also renders on the server

### Core Puzzle System (`puzzle/`)

- `Puzzle` (`puzzle/puzzle.ts`) - Owns pieces, the canvas and input; `load()` builds the puzzle from the room, local save or scratch
- `Piece` (`puzzle/piece.ts`) - Graphics, rotation/translation, selection state, serialization; remote updates lerp
- `PiecesFactory`, `PieceConnector`, `InputHandler` - Piece shapes, snapping, input
- `NetworkHandler` (`puzzle/network/networkHandler.ts`) - The room WebSocket: sends moves (20Hz), selection, cursor; reconnects with backoff
- `NetworkSerializer` (`puzzle/network/serializer.ts`) - Saves to IndexedDB every 200ms
- `ClientDB` (`puzzle/network/clientDB.ts`) - One IndexedDB database per room (`puzzelin_<code>`), keys `puzzle`, `graph`, `pieces`, `unsynced`

### Sync rules (`shared/protocol.ts` has the messages)

- Load order: open IndexedDB, connect (3s timeout), then build from the room's puzzle if it's the same image, else the local save, else a new puzzle. Saved pieces apply when it's the same `puzzleKey` (image + seed + piece count)
- Moves made offline are recorded in `unsynced` and sent on reconnect; they (and pieces you're holding) win over the room's copy. Everything else takes the room's state
- On first contact the URL's image wins (someone starting a new puzzle replaces the room's); afterwards a different image in the room means someone else started one, and the client navigates to it
- The server drops `pieces` messages whose `key` isn't the room's current puzzle

## Important Patterns

- Use `@/*` for root-level imports (`@/utils/sizes`, `@/puzzle/puzzle`)
- P5: graphics are managed manually (call `.remove()` on cleanup); use `p5.Vector` for 2D coordinates
- Translation keys are English strings (`getTranslation(lang)` in `language.ts`; en, sv, no, da, de, fi)
- Pieces cache their rendered graphics; they only redraw when `graphicNeedsUpdating` is set

## Browser Compatibility

- Chrome: Good FPS
- Safari: Good FPS
- iPad: Good FPS (occasional image loading issues)
- Mobile: Good FPS (small screen)
- Firefox: Poor FPS (known issue)
