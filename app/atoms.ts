import type { IPuzzleControls } from '@/puzzle/puzzle';
import { DEFAULT_SETTINGS, ISettings } from '@/puzzle/settings';
import { Size } from '@/utils/sizes';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Puzzle selection modal state
export const showPuzzleSelectionAtom = atom(false);

// Settings modal state
export const showSettingsAtom = atom(false);

// Sidebar state
export const sidebarOpenAtom = atom(false);

// Store state (migrated from StoreProvider)
export const sizeAtom = atom<Size>('s');
export const showPuzzlePieceControlsAtom = atom(false);

// Puzzle controls (public interface to control the puzzle)
// Stores the Puzzle instance typed as IPuzzleControls to hide internal methods
export const puzzleControlsAtom = atom<IPuzzleControls | null>(null);

// Settings state with localStorage persistence
// Using 'v2' key to ignore old settings structure
export const settingsAtom = atomWithStorage<ISettings>('puzzelin-settings-v5', DEFAULT_SETTINGS);

// Toast state
export type Toast = {
  id: string;
  message: string;
  type?: 'error' | 'success' | 'info';
};

export const toastsAtom = atom<Toast[]>([]);

export const addToastAtom = atom(null, (get, set, toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substring(7);
  const newToast = { ...toast, id };
  set(toastsAtom, [...get(toastsAtom), newToast]);

  setTimeout(() => {
    set(toastsAtom, (prev) => prev.filter((t) => t.id !== id));
  }, 5000);
});

export const removeToastAtom = atom(null, (get, set, id: string) => {
  set(
    toastsAtom,
    get(toastsAtom).filter((t) => t.id !== id),
  );
});
