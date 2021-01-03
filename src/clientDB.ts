enum StoreNames {
    puzzle = 'puzzle',
    graph = 'graph',
    pieces = 'pieces'
}
type StoreName = keyof typeof StoreNames;

class ClientDB {
    private db?: IDBDatabase;

    private init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('application');
            request.onerror = reject;
            request.onsuccess = (e: any) => {
                this.db = e.target.result
                resolve();
            };
            request.onupgradeneeded = (e: any) => {
                const db = e.target.result;
                db.createObjectStore(StoreNames.puzzle);
                db.createObjectStore(StoreNames.graph);
                db.createObjectStore(StoreNames.pieces);
            }
        });
    }

    private clearStore(storeName: StoreName): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();
            const trans = this.db!.transaction([storeName], 'readwrite');
            const store = trans.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = reject;
        });
    }

    private loadFromStore<T>(storeName: StoreName, key?: string|number): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();
            const trans = this.db!.transaction(storeName, 'readwrite');
            const store = trans.objectStore(storeName);
            const request = typeof key === 'undefined' ? store.getAll() : store.get(key);
            request.onsuccess = (e: any) => {
                if (!e.target.result) {
                    reject(new Error('No data'));
                } else {
                    resolve(e.target.result);
                }
            };
            request.onerror = reject;
        });
    }

    private saveToStore<T>(storeName: StoreName, data: T, key: string|number) {
        return new Promise<void>(async (resolve, reject) => {
            if (!this.db) await this.init();
            const trans = this.db!.transaction(storeName, 'readwrite');
            const store = trans.objectStore(storeName);
            const request = store.put(data, key);
            request.onsuccess = () => resolve();
            request.onerror = reject;
        })
    }

    public async loadPuzzle(): Promise<PuzzleData> {
        return await this.loadFromStore<PuzzleData>('puzzle', 0);
    }

    public async loadGraph(): Promise<GraphData> {
        return await this.loadFromStore<GraphData>('graph', 0);
    }

    public async loadPieces(): Promise<PieceData[]> {
        return await this.loadFromStore<PieceData[]>('pieces');
    }

    public async savePuzzle(data: PuzzleData): Promise<void> {
        await this.clearStore('pieces');
        await this.saveToStore('puzzle', data, 0);
    }

    public async saveGraph(data: GraphData): Promise<void> {
        await this.saveToStore('graph', data, 0);
    }
    
    public async savePieces(data: PieceData[]): Promise<void> {
        await Promise.all(data.map((d) => this.saveToStore('pieces', d, d.id)));
    }
}