// Network timing constants for multiplayer sync (values in milliseconds)

/** How often to broadcast updates to other players (20Hz = 50ms) */
export const SYNC_RATE_MS = 50;

/** How long to animate (lerp) incoming remote updates to smooth things out */
export const LERP_DURATION_MS = 100;

/** How often to persist state to local IndexedDB, just for rejoining */
export const INDEXEDDB_SAVE_RATE_MS = 200;

/** How often to broadcast cursor position to other players (10Hz = 100ms) */
export const CURSOR_UPDATE_RATE_MS = 100;

/** How long to animate cursor movement */
export const CURSOR_LERP_DURATION_MS = 200;

/** How long before a remote cursor fades out due to inactivity (5 seconds) */
export const CURSOR_INACTIVE_TIMEOUT_MS = 5000;
