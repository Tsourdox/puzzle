import { atom } from 'jotai';
import { Size } from '@/utils/sizes';

// Puzzle selection modal state
export const showPuzzleSelectionAtom = atom(false);

// Store state (migrated from StoreProvider)
export const sizeAtom = atom<Size>('s');
export const showPuzzlePieceActionsAtom = atom(false);
