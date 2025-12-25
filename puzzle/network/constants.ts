// Network timing constants for multiplayer sync (values in milliseconds)

/** How often to broadcast updates to other players (20Hz = 50ms) */
export const SYNC_RATE_MS = 50;

/** How long to animate (lerp) incoming remote updates to smooth things out */
export const LERP_DURATION_MS = 100;

/** How often to persist state to local IndexedDB, just for rejoining */
export const INDEXEDDB_SAVE_RATE_MS = 200;
