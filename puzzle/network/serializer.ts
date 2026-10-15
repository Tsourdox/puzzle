import ClientDB, { ILocalPuzzle } from './clientDB';
import { INDEXEDDB_SAVE_RATE_MS } from './constants';
import { IPieceData, ISerializableGraph, ISerializablePiece, ISerializablePuzzle } from './types';

export const toPieceData = (piece: ISerializablePiece): IPieceData => {
  const { id, rotation, translation, connectedSides, elevation } = piece.serialize();
  return { id, rotation, translation, connectedSides, elevation };
};

/** Keeps the room's puzzle in IndexedDB, so progress survives reloads and works offline */
export default class NetworkSerializer {
  private puzzle: ISerializablePuzzle;
  private graph: ISerializableGraph;
  private clientDB: ClientDB;
  private saveTimeout: number;
  private isOpen = false;
  /** Pieces moved here since the last save */
  private movedIds = new Set<number>();
  /** Where other players' pieces are headed; they animate there, so their current spot isn't it */
  private remotePieces = new Map<number, IPieceData>();
  /** Pieces moved while offline, sent to the server once we're back */
  private unsynced = new Set<number>();
  private unsyncedChanged = false;

  constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph, roomCode: string) {
    this.puzzle = puzzle;
    this.graph = graph;
    this.saveTimeout = INDEXEDDB_SAVE_RATE_MS;
    this.clientDB = new ClientDB(roomCode);
  }

  /** Opens the room's database and returns what was saved there, if anything */
  public async open(): Promise<ILocalPuzzle | null> {
    try {
      await this.clientDB.open();
      this.isOpen = true;
      const local = await this.clientDB.loadAll();
      this.unsynced = new Set(local?.unsynced);
      return local;
    } catch (error) {
      // Private browsing and the like: play on without saving
      console.error('Failed to open local storage:', error);
      return null;
    }
  }

  public get unsyncedIds(): ReadonlySet<number> {
    return this.unsynced;
  }

  public markUnsynced(ids: number[]) {
    ids.forEach((id) => this.unsynced.add(id));
    this.unsyncedChanged = true;
  }

  public clearUnsynced() {
    this.unsynced.clear();
    this.unsyncedChanged = true;
  }

  public queueMoved(ids: number[]) {
    ids.forEach((id) => this.movedIds.add(id));
  }

  public queueRemote(pieces: IPieceData[]) {
    pieces.forEach((piece) => this.remotePieces.set(piece.id, piece));
  }

  /** Replaces everything saved with the puzzle as it is now */
  public async saveAll() {
    this.movedIds.clear();
    this.remotePieces.clear();
    this.unsyncedChanged = false;
    if (!this.isOpen) return;
    const pieces = this.puzzle.pieces.map(toPieceData);
    await this.clientDB.saveAll(this.puzzle.serialize(), pieces, [...this.unsynced]);
    await this.clientDB.saveGraph(this.graph.serialize());
  }

  public update(deltaTime: number) {
    this.saveTimeout -= deltaTime;
    if (this.saveTimeout > 0) return;
    this.saveTimeout = INDEXEDDB_SAVE_RATE_MS;
    this.save();
  }

  private save() {
    if (!this.isOpen) return;

    if (this.graph.isModified) {
      this.graph.isModified = false;
      this.clientDB.saveGraph(this.graph.serialize()).catch(logError);
    }

    const pieces = new Map(this.remotePieces);
    for (const id of this.movedIds) {
      const piece = this.puzzle.pieces[id];
      if (piece) pieces.set(id, toPieceData(piece));
    }
    this.movedIds.clear();
    this.remotePieces.clear();

    if (pieces.size || this.unsyncedChanged) {
      const unsynced = this.unsyncedChanged ? [...this.unsynced] : undefined;
      this.unsyncedChanged = false;
      this.clientDB.savePieces([...pieces.values()], unsynced).catch(logError);
    }
  }

  public cleanup() {
    this.save();
    // Waits for the save above to finish
    this.clientDB.close();
    this.isOpen = false;
  }
}

const logError = (error: unknown) => console.error('Failed to save puzzle locally:', error);
