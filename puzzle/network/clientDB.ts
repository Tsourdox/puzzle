import { IDeserializedPieceData, IGraphData, IPieceData, IPuzzleData } from './types';

type DBKey = 'puzzle' | 'graph' | 'pieces' | 'unsynced';

const PREFIX = 'puzzelin_';
const STORE = 'data';

/** Everything saved for one room */
export interface ILocalPuzzle {
  puzzle: IPuzzleData;
  pieces: IDeserializedPieceData[];
  graph?: IGraphData;
  /** Pieces moved while offline, not yet sent to the server */
  unsynced: number[];
}

const request = <T>(req: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/** One IndexedDB database per room, so the puzzle works (and is kept) offline */
export default class ClientDB {
  private dbName: string;
  private db?: IDBDatabase;

  constructor(roomCode: string = 'default') {
    this.dbName = `${PREFIX}${roomCode}`;
  }

  public static async getAllRoomCodes(): Promise<string[]> {
    const roomsWithTimestamps = await this.getAllRoomCodesWithTimestamps();
    return roomsWithTimestamps.map((room) => room.code);
  }

  public static async getAllRoomCodesWithTimestamps(): Promise<
    Array<{ code: string; lastModified: number }>
  > {
    try {
      const databases = await indexedDB.databases();

      const roomCodes = databases
        .filter((db) => db.name?.startsWith(PREFIX))
        .map((db) => db.name!.replace(PREFIX, ''))
        .filter((code) => code !== 'default');

      const roomsWithTimestamps = await Promise.all(
        roomCodes.map(async (code) => {
          const db = new ClientDB(code);
          try {
            await db.open();
            const puzzleData = await db.loadPuzzle();
            return { code, lastModified: puzzleData.lastModified || 0 };
          } catch {
            return null;
          } finally {
            db.close();
          }
        }),
      );

      return roomsWithTimestamps
        .filter((room) => room !== null)
        .sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error('Failed to get room codes:', error);
      return [];
    }
  }

  /** Opens the database, creating its object store the first time */
  public async open(): Promise<void> {
    let db = await request(indexedDB.open(this.dbName));
    if (!db.objectStoreNames.contains(STORE)) {
      const version = db.version + 1;
      db.close();
      const upgrade = indexedDB.open(this.dbName, version);
      upgrade.onupgradeneeded = () => upgrade.result.createObjectStore(STORE);
      db = await request(upgrade);
    }
    // Let another tab upgrade or delete the database instead of blocking it
    db.onversionchange = () => db.close();
    this.db = db;
  }

  public close() {
    this.db?.close();
    this.db = undefined;
  }

  public async delete(): Promise<void> {
    this.close();
    await request(indexedDB.deleteDatabase(this.dbName));
  }

  private transaction(mode: IDBTransactionMode) {
    if (!this.db) throw new Error('Client DB must be opened first');
    const transaction = this.db.transaction(STORE, mode);
    const done = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return { store: transaction.objectStore(STORE), done };
  }

  public async loadPuzzle(): Promise<IPuzzleData> {
    const puzzle = await request(this.transaction('readonly').store.get('puzzle' satisfies DBKey));
    if (!puzzle) throw new Error('No puzzle saved in Client DB');
    return puzzle;
  }

  /** The saved puzzle, or null if this room has none */
  public async loadAll(): Promise<ILocalPuzzle | null> {
    const { store } = this.transaction('readonly');
    const get = (key: DBKey) => request(store.get(key));
    const [puzzle, pieces, graph, unsynced] = await Promise.all([
      get('puzzle'),
      get('pieces'),
      get('graph'),
      get('unsynced'),
    ]);
    if (!puzzle) return null;
    return { puzzle, pieces: pieces ?? [], graph, unsynced: unsynced ?? [] };
  }

  /** Replaces everything saved for the room */
  public saveAll(puzzle: IPuzzleData, pieces: IPieceData[], unsynced: number[]) {
    const { store, done } = this.transaction('readwrite');
    store.put({ ...puzzle, lastModified: Date.now() }, 'puzzle' satisfies DBKey);
    store.put(pieces, 'pieces' satisfies DBKey);
    store.put(unsynced, 'unsynced' satisfies DBKey);
    return done;
  }

  public saveGraph(graph: IGraphData) {
    const { store, done } = this.transaction('readwrite');
    store.put(graph, 'graph' satisfies DBKey);
    return done;
  }

  /** Updates the given pieces (and the unsynced list) in a single transaction */
  public savePieces(updates: IPieceData[], unsynced?: number[]) {
    const { store, done } = this.transaction('readwrite');

    const piecesRequest = store.get('pieces' satisfies DBKey);
    piecesRequest.onsuccess = () => {
      const pieces = new Map<number, IPieceData>(
        (piecesRequest.result ?? []).map((piece: IPieceData) => [piece.id, piece]),
      );
      for (const piece of updates) pieces.set(piece.id, piece);
      store.put([...pieces.values()], 'pieces' satisfies DBKey);
    };

    const puzzleRequest = store.get('puzzle' satisfies DBKey);
    puzzleRequest.onsuccess = () => {
      if (puzzleRequest.result) {
        store.put({ ...puzzleRequest.result, lastModified: Date.now() }, 'puzzle' satisfies DBKey);
      }
    };

    if (unsynced) store.put(unsynced, 'unsynced' satisfies DBKey);
    return done;
  }
}
