import { atom } from 'jotai';
import { Size } from '@/utils/sizes';
import type { PuzzleActions } from './[lang]/room/[...slug]/usePuzzle';

// Puzzle selection modal state
export const showPuzzleSelectionAtom = atom(false);

// Store state (migrated from StoreProvider)
export const sizeAtom = atom<Size>('s');
export const showPuzzlePieceActionsAtom = atom(false);

// Puzzle actions (methods to control the puzzle)
export const puzzleActionsAtom = atom<PuzzleActions | null>(null);
