import { DEFAULT_SETTINGS, ISettings } from '@/puzzle/settings';
import { Size } from '@/utils/sizes';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { PuzzleActions } from './[lang]/room/[...slug]/usePuzzle';

// Puzzle selection modal state
export const showPuzzleSelectionAtom = atom(false);

// Settings modal state
export const showSettingsAtom = atom(false);

// Sidebar state
export const sidebarOpenAtom = atom(false);

// Store state (migrated from StoreProvider)
export const sizeAtom = atom<Size>('s');
export const showPuzzlePieceActionsAtom = atom(false);

// Puzzle actions (methods to control the puzzle)
export const puzzleActionsAtom = atom<PuzzleActions | null>(null);

// Settings state with localStorage persistence
// Using 'v2' key to ignore old settings structure
export const settingsAtom = atomWithStorage<ISettings>('puzzelin-settings-v4', DEFAULT_SETTINGS);
