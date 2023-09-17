import { IDeserializedPieceData, IGraphData, IPieceData, IPuzzleData } from './types';

type DBKey = 'puzzle' | 'graph' | 'pieces';

export default class ClientDB {
  private readonly dbName = 'puzzelin';
  private storeName: string;
  private db?: IDBDatabase;

  constructor(roomCode: string = 'default') {
    this.storeName = roomCode;
  }

  public get getStoredRoomNames() {
    if (!this.db) throw new Error('Init must be called before loading data from the store');
    return Object.values(this.db.objectStoreNames).filter(
      (name) => !['default', 'main'].includes(name),
    );
  }

  public close() {
    if (!this.db) throw new Error('Init must be called before closing the store');
    this.db.close();
  }

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const lookupVersionRequest = indexedDB.open(this.dbName);
      lookupVersionRequest.onerror = reject;
      lookupVersionRequest.onsuccess = (e: any) => {
        this.db = e.target.result as IDBDatabase;
        var version = this.db.version;
        if (this.db.objectStoreNames.contains(this.storeName)) {
          console.log('DB already initialized for room:', this.storeName);
          resolve();
          return;
        }
        this.db.close();

        const resuest = indexedDB.open(this.dbName, version + 1);
        resuest.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          console.log('Initialize DB for room:', this.storeName);
          db.createObjectStore(this.storeName, { autoIncrement: true });
        };

        resuest.onerror = reject;
        resuest.onsuccess = (e: any) => {
          this.db = e.target.result;
          resolve();
        };
      };
    });
  }

  public clear(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) throw new Error('Init must be called before loading data from the store');
      const trans = this.db.transaction(this.storeName, 'readwrite');
      const store = trans.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  private loadFromStore<T>(key: DBKey): Promise<T> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) throw new Error('Init must be called before loading data from the store');
      const trans = this.db.transaction(this.storeName, 'readwrite');
      const store = trans.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = (e: any) => {
        if (!e.target.result) {
          reject(new Error('No data to load from Client DB'));
        } else {
          resolve(e.target.result);
        }
      };
      request.onerror = reject;
    });
  }

  private saveToStore<T>(data: T, key: DBKey) {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.db) throw new Error('Init must be called before saving data to the store');
      const trans = this.db.transaction(this.storeName, 'readwrite');
      const store = trans.objectStore(this.storeName);
      const request = store.put(data, key);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  public async loadPuzzle(): Promise<IPuzzleData> {
    return await this.loadFromStore<IPuzzleData>('puzzle');
  }

  public async loadGraph(): Promise<IGraphData> {
    return await this.loadFromStore<IGraphData>('graph');
  }

  public async loadPieces(): Promise<IDeserializedPieceData[]> {
    try {
      return await this.loadFromStore<IDeserializedPieceData[]>('pieces');
    } catch (error: unknown) {
      return [];
    }
  }

  public async savePuzzle(data: IPuzzleData): Promise<void> {
    await this.saveToStore([], 'pieces');
    await this.saveToStore(data, 'puzzle');
  }

  public async saveGraph(data: IGraphData): Promise<void> {
    await this.saveToStore(data, 'graph');
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
  }
}
