import { IDeserializedPieceData, IGraphData, IPieceData, IPuzzleData } from './types';

type DBKey = 'puzzle' | 'graph' | 'pieces';

export default class ClientDB {
  private dbName: string;
  private storeName: string = 'data';
  private db?: IDBDatabase;
  private version: number = 0;

  constructor(roomCode: string = 'default') {
    this.dbName = `puzzelin_${roomCode}`;
  }

  public static async getAllRoomCodes(): Promise<string[]> {
    const roomsWithTimestamps = await this.getAllRoomCodesWithTimestamps();
    return roomsWithTimestamps.map((room) => room.code);
  }

  public static async getAllRoomCodesWithTimestamps(): Promise<
    Array<{ code: string; lastModified: number }>
  > {
    try {
      // Get all IndexedDB databases
      const databases = await indexedDB.databases();

      // Filter for puzzelin databases and extract room codes
      const roomCodes = databases
        .filter((db) => db.name?.startsWith('puzzelin_'))
        .map((db) => db.name!.replace('puzzelin_', ''))
        .filter((code) => code !== 'default'); // Exclude default database

      // Get lastModified timestamp for each room
      const roomsWithTimestamps = await Promise.all(
        roomCodes.map(async (code) => {
          try {
            const db = new ClientDB(code);
            await db.open();
            const puzzleData = await db.loadPuzzle();
            db.close();
            return {
              code,
              lastModified: puzzleData.lastModified || 0,
            };
          } catch {
            return { code, lastModified: 0 };
          }
        }),
      );

      // Sort by lastModified (most recent first)
      return roomsWithTimestamps.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error('Failed to get room codes:', error);
      return [];
    }
  }

  public close() {
    this.db?.close();
  }

  public initVersion(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onerror = reject;
      request.onsuccess = (e: Event) => {
        const db = (e.target as IDBOpenDBRequest).result;
        this.version = db.version;
        db.close();
        resolve();
      };
    });
  }

  public open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onerror = reject;
      request.onsuccess = (e: Event) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  public createObjectStore(_name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.version === 0) throw new Error('initVersion must be called before creating object store');

      // Check if object store already exists
      const checkRequest = indexedDB.open(this.dbName);
      checkRequest.onsuccess = (e: Event) => {
        const db = (e.target as IDBOpenDBRequest).result;
        const storeExists = db.objectStoreNames.contains(this.storeName);
        db.close();

        if (storeExists) {
          // Object store already exists, no need to create
          resolve();
          return;
        }

        // Create the object store
        const newVersion = this.version + 1;
        this.version = newVersion;
        const request = indexedDB.open(this.dbName, newVersion);
        request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
          const db = (e.target as IDBOpenDBRequest).result;
          db.createObjectStore(this.storeName, { autoIncrement: true });
        };

        request.onerror = reject;
        request.onsuccess = (e: Event) => {
          const db = (e.target as IDBOpenDBRequest).result;
          db.close();
          resolve();
        };
        request.onblocked = () => {
          reject(new Error('Client DB is blocked'));
        };
      };
      checkRequest.onerror = reject;
    });
  }

  public delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      const lookupVersionRequest = indexedDB.open(this.dbName);
      lookupVersionRequest.onerror = reject;
      lookupVersionRequest.onsuccess = (e: Event) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        const version = this.db.version;
        this.db.close();

        const request = indexedDB.open(this.dbName, version + 1);
        request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
          const db = (e.target as IDBOpenDBRequest).result;
          db.deleteObjectStore(this.storeName);
        };

        request.onerror = reject;
        request.onsuccess = (e: Event) => {
          const db = (e.target as IDBOpenDBRequest).result;
          db.close();
          resolve();
        };
      };
    });
  }

  private loadFromStore<T>(key: DBKey): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) throw new Error('Init must be called before loading data from the store');
        const trans = this.db.transaction(this.storeName, 'readwrite');
        const store = trans.objectStore(this.storeName);
        const request = store.get(key);
        request.onsuccess = (e: Event) => {
          const result = (e.target as IDBRequest).result;
          if (!result) {
            reject(new Error('No data to load from Client DB'));
          } else {
            resolve(result);
          }
        };
        request.onerror = reject;
      } catch (error) {
        reject(error);
      }
    });
  }

  private saveToStore<T>(data: T, key: DBKey) {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) throw new Error('Init must be called before saving data to the store');
      const trans = this.db.transaction(this.storeName, 'readwrite');
      const store = trans.objectStore(this.storeName);
      const request = store.put(data, key);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  public async loadPuzzle(): Promise<IPuzzleData> {
    return this.loadFromStore<IPuzzleData>('puzzle');
  }

  public async loadGraph(): Promise<IGraphData> {
    return this.loadFromStore<IGraphData>('graph');
  }

  public async loadPieces(): Promise<IDeserializedPieceData[]> {
    try {
      return await this.loadFromStore<IDeserializedPieceData[]>('pieces');
    } catch {
      return [];
    }
  }

  public async savePuzzle(data: IPuzzleData): Promise<void> {
    data.lastModified = Date.now();
    await this.saveToStore([], 'pieces');
    await this.saveToStore(data, 'puzzle');
  }

  public async saveGraph(data: IGraphData): Promise<void> {
    await this.saveToStore(data, 'graph');
    await this.updateLastModified();
  }

  public async savePieces(data: IPieceData[]): Promise<void> {
    // preserve old data
    const pieces = await this.loadPieces();
    for (const piece of pieces) {
      const oldData = !data.find((d) => d.id === piece.id);
      if (oldData) {
        data.push(piece);
      }
    }
    await this.saveToStore(data, 'pieces');
    await this.updateLastModified();
  }

  private async updateLastModified(): Promise<void> {
    try {
      const puzzleData = await this.loadPuzzle();
      puzzleData.lastModified = Date.now();
      await this.saveToStore(puzzleData, 'puzzle');
    } catch {
      // Puzzle data doesn't exist yet, ignore
    }
  }

  public async clearAll(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      try {
        const trans = this.db.transaction(this.storeName, 'readwrite');
        const store = trans.objectStore(this.storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = reject;
      } catch (error) {
        reject(error);
      }
    });
  }
}
