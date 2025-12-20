# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Puzzelin is an online multiplayer puzzle game where friends and family can collaborate in real-time to solve jigsaw puzzles. The app uses P5.js for canvas rendering and IndexedDB for local persistence, with a room-based collaboration system.

**Live app:** https://puzzelin.se

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Run production server
npm start

# Type checking (no emit)
npm run types

# Linting
npm run lint

# Format checking
npm run format
```

## Stack & Technologies

- **Framework:** Next.js 15 (App Router) with React 19
- **Language:** TypeScript with strict mode
- **Graphics:** P5.js for canvas-based puzzle rendering
- **Styling:** Tailwind CSS v4 with Zinc color scheme
- **Forms:** React Hook Form with Zod validation
- **Storage:** IndexedDB (client-side persistence)
- **Package Manager:** npm (Node.js 22 required)
- **Image Source:** Pexels API for puzzle images

## Architecture & Code Structure

### High-Level Architecture

The codebase follows a hybrid approach:
- **Frontend:** React components for UI (Next.js App Router)
- **Puzzle Engine:** OOP-based P5.js classes for game logic
- **State:** Simple reducer pattern (StoreProvider)
- **Persistence:** IndexedDB wrapper for local storage
- **i18n:** Custom translation system supporting 6 languages (en, sv, no, da, de, fi)

### Core Puzzle System (OOP)

The puzzle engine lives in `/puzzle` and uses classical OOP:

**Main Classes:**
- `Puzzle` (`puzzle/puzzle.ts`) - Main orchestrator that owns pieces, manages the canvas, handles input, and coordinates network sync
- `Piece` (`puzzle/piece.ts`) - Individual puzzle piece with graphics, transformations (rotation/translation), selection state, and network serialization
- `PiecesFactory` (`puzzle/piecesFactory.ts`) - Generates puzzle pieces with bezier curves for interlocking shapes
- `PieceConnector` (`puzzle/pieceConnector.ts`) - Detects and handles piece connections when they snap together
- `InputHandler` (`puzzle/handlers/inputHandler.ts`) - Delegates to selection and transformation handlers for user input
- `NetworkSerializer` (`puzzle/network/serializer.ts`) - Syncs puzzle state to/from IndexedDB with debouncing

**Key Concepts:**
- Pieces are rendered to P5.Graphics objects for performance
- Each piece maintains its own transformation matrix (rotation + translation)
- Connected pieces share sides (tracked in `connectedSides` array)
- Selection state distinguishes between local (`isSelected`) and remote (`isSelectedByOther`)
- All serializable classes implement `ISerializable*` interfaces from `network/types.ts`

### Next.js App Structure

Uses App Router with i18n routing via middleware:
- Routes: `/app/[lang]/` - Dynamic language-based routing
- Middleware: Auto-detects locale and redirects to `/[lang]/...`
- Pages are server components by default, P5 components must be client components

### State Management

Simple reducer pattern in `store/StoreProvider.tsx`:
- Global state: puzzle size, UI flags
- Dispatch pattern with typed actions
- Hooks: `useStoreState()`, `useStoreDispatch()`

### Internationalization

Translation system in `language.ts`:
- Supported languages: en (default), sv, no, da, de, fi
- `getTranslation(lang)` returns a function that maps English keys to translated strings
- Type-safe with `Translation` type derived from translations object

### IndexedDB Persistence

`ClientDB` class (`puzzle/network/clientDB.ts`):
- Database name: `puzzelin`
- Object stores are room-based (one store per room code)
- Stores three keys: `puzzle` (metadata), `graph` (viewport state), `pieces` (piece states)
- NetworkSerializer handles debounced saves (only modified pieces)

## Important Patterns

### Path Aliases
Use `@/*` to reference root-level imports:
```typescript
import { Size } from '@/utils/sizes';
import Puzzle from '@/puzzle/puzzle';
```

### P5.js Integration
- P5 instances are created in client components only
- Graphics are managed manually (call `.remove()` on cleanup)
- Transformations use P5's push/pop matrix stack
- Use `p5.Vector` for all 2D coordinates

### Room-Based Collaboration
- Each puzzle can have a room code for multiplayer
- Room state is synced via IndexedDB (local-first, no backend currently)
- Selection conflicts are avoided by showing `isSelectedByOther` state

### Performance Considerations
- Firefox has poor FPS performance (noted in README)
- Pieces cache their rendered graphics in `p5.Graphics`
- Only modified pieces are serialized during saves
- Graphics are only updated when `graphicNeedsUpdating` flag is set

## Common Gotchas

- P5.js components must use `'use client'` directive
- Always clean up P5 graphics/images to prevent memory leaks
- Network serialization uses lerping for smooth remote updates (NETWORK_TIMEOUT * 3)
- Image loading from Pexels uses `force-cache` policy
- Middleware redirects all routes without locale prefix
- Translation keys are English strings (not key identifiers)

## Browser Compatibility

- Chrome: Good FPS
- Safari: Good FPS
- iPad: Good FPS (occasional image loading issues)
- Mobile: Good FPS (small screen)
- Firefox: Poor FPS (known issue)
