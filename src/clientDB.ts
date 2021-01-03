type DBKey = 'puzzle' | 'graph' | 'pieces';

class ClientDB {
    private readonly dbName = 'application';
    private readonly storeName = 'main';
    private db?: IDBDatabase;

    private init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);
            request.onerror = reject;
            request.onsuccess = (e: any) => {
                this.db = e.target.result
                resolve();
            };
            request.onupgradeneeded = (e: any) => {
                const db = e.target.result;
                db.createObjectStore('main');
            }
        });
    }

    private loadFromStore<T>(key: DBKey): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();
            const trans = this.db!.transaction(this.storeName, 'readwrite');
            const store = trans.objectStore(this.storeName);
            const request = store.get(key);
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

    private saveToStore<T>(data: T, key: DBKey) {
        return new Promise<void>(async (resolve, reject) => {
            if (!this.db) await this.init();
            const trans = this.db!.transaction(this.storeName, 'readwrite');
            const store = trans.objectStore(this.storeName);
            const request = store.put(data, key);
            request.onsuccess = () => resolve();
            request.onerror = reject;
        })
    }

    public async loadPuzzle(): Promise<PuzzleData> {
        return await this.loadFromStore<PuzzleData>('puzzle');
    }

    public async loadGraph(): Promise<GraphData> {
        return await this.loadFromStore<GraphData>('graph');
    }

    public async loadPieces(): Promise<PieceData[]> {
        try {
            return await this.loadFromStore<PieceData[]>('pieces');
        } catch (error: unknown) {
            return [];
        }
    }

    public async savePuzzle(data: PuzzleData): Promise<void> {
        await this.saveToStore([], 'pieces');
        await this.saveToStore(data, 'puzzle');
    }

    public async saveGraph(data: GraphData): Promise<void> {
        await this.saveToStore(data, 'graph');
    }
    
    public async savePieces(data: PieceData[]): Promise<void> {
        // preserve old data
        const pieces = await this.loadPieces();
        for (const piece of pieces) {
            const oldData = !data.find(d => d.id === piece.id);
            if (oldData) {
                data.push(piece);
            }
        }
        await this.saveToStore(data, 'pieces');
    }
}