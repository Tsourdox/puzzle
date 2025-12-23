import { ISettingsMap, settings as defaultSettings } from '@/puzzle/utils/settings';
import { Size } from '@/utils/sizes';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { PuzzleActions } from './[lang]/room/[...slug]/usePuzzle';

// Puzzle selection modal state
export const showPuzzleSelectionAtom = atom(false);

// Settings modal state
export const showSettingsAtom = atom(false);

// Store state (migrated from StoreProvider)
export const sizeAtom = atom<Size>('s');
export const showPuzzlePieceActionsAtom = atom(false);

// Puzzle actions (methods to control the puzzle)
export const puzzleActionsAtom = atom<PuzzleActions | null>(null);

// Settings state with localStorage persistence (using Jotai's built-in storage atom)
export const settingsAtom = atomWithStorage<ISettingsMap>('puzzelin-settings', defaultSettings);
