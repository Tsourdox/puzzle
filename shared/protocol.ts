// Messages between the puzzle client and the Bun server (server/index.ts) over /api/ws.
// Type-only imports, so the server container doesn't need the client code at runtime.
import type { IPieceData, IPuzzleData } from '../puzzle/network/types';

export type { IPieceData, IPuzzleData };

export interface RoomSnapshot {
  /** null when nobody has started a puzzle in this room yet */
  puzzle: IPuzzleData | null;
  pieces: IPieceData[];
}

export interface Peer {
  id: string;
  color: string;
  /** Pieces this peer is holding */
  pieceIds: number[];
}

export type ClientMessage =
  /** Start (or replace) the room's puzzle with ours */
  | { type: 'create'; puzzle: IPuzzleData; pieces: IPieceData[] }
  /** `key` is the puzzleKey we moved them in; the server drops pieces for a puzzle it has replaced */
  | { type: 'pieces'; key: string; pieces: IPieceData[] }
  /** Pieces we hold. Not a lock: the last one to take a piece gets it, others let go */
  | { type: 'select'; pieceIds: number[] }
  | { type: 'cursor'; x: number; y: number }
  /** Pieces snapped together; everyone lets go of them */
  | { type: 'connect'; pieceIds: number[] };

export type ServerMessage =
  /** First message on every connection */
  | { type: 'welcome'; id: string; color: string; peers: Peer[]; room: RoomSnapshot }
  /** Someone started a new puzzle in the room */
  | { type: 'room'; room: RoomSnapshot }
  /** Everyone else in the room, sent when someone joins or leaves */
  | { type: 'peers'; peers: Peer[] }
  | { type: 'pieces'; from: string; pieces: IPieceData[] }
  | { type: 'select'; from: string; pieceIds: number[] }
  | { type: 'cursor'; from: string; x: number; y: number }
  | { type: 'connect'; from: string; pieceIds: number[] };

/** Identifies one cut of one image; pieces from different cuts don't mix */
export const puzzleKey = (puzzle: Pick<IPuzzleData, 'imageData' | 'seed' | 'pieceCount'>) =>
  `${puzzle.imageData.id}:${puzzle.seed}:${puzzle.pieceCount.x}x${puzzle.pieceCount.y}`;
