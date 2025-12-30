import { KEY_C, KEY_R, KEY_X, KEY_Z, SHIFT, SPACE } from './utils/keys';

export interface ISettings {
  ui: {
    hidePuzzleButtons: boolean;
  };
  puzzle: {
    invertZoom: boolean;
    rotationSpeed: number;
    fpsMode: 'low' | 'normal' | 'performance';
    snapTolerance: number;
  };
  keybindings: {
    rotateLeft: number;
    rotateRight: number;
    stackPieces: number;
    explodePieces: number;
    selectMultiple: number;
    reconnectPieces: number;
  };
  network: {
    hideMultiplayerCursors: boolean;
  };
}

export type KeybindingKey = keyof ISettings['keybindings'];

export const DEFAULT_SETTINGS: ISettings = {
  ui: {
    hidePuzzleButtons: false,
  },
  puzzle: {
    invertZoom: false,
    rotationSpeed: 1,
    fpsMode: 'normal',
    snapTolerance: 1,
  },
  keybindings: {
    rotateLeft: KEY_Z,
    rotateRight: KEY_X,
    stackPieces: SPACE,
    explodePieces: KEY_C,
    selectMultiple: SHIFT,
    reconnectPieces: KEY_R,
  },
  network: {
    hideMultiplayerCursors: false,
  },
};

export const settings: ISettings = { ...DEFAULT_SETTINGS };
