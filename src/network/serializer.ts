interface ISerializable<T> {
    isModified: boolean;
    serialize: () => T;
    deserialize: (object: T, options?: DeserializeOptions) => Promise<void>;
}

type DeserializeOptions = {
    lerp?: boolean;
} | undefined;

interface ISerializablePuzzle extends ISerializable<PuzzleData> {
    pieces: ReadonlyArray<ISerializablePiece>;
}

interface ISerializablePiece extends ISerializable<PieceData> {}
interface ISerializableGraph extends ISerializable<GraphData> {}

interface PuzzleData {
    image: string;
    pieceCount: Point;
    seed: number;
}

interface PieceData {
    id: number;
    rotation: number;
    translation: Point;
    connectedSides?: number[];
    elevation: number;
}

interface GraphData {
    scale: number;
    translation: Point;
}

interface RoomData {
    puzzle: PuzzleData;
    pieces: Record<string, PieceData>;
}

const NETWORK_TIMEOUT = 50; //ms
class NetworkSerializer {
    private puzzle: ISerializablePuzzle
    private graph: ISerializableGraph
    private sendTimeout: number;
    private clientDB: ClientDB;
    private firebaseDB: FirebaseDB;
    private _isLoading: boolean;
    public get isLoading() { return this._isLoading }
    private _roomCode: string;

    constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph) {
        this.puzzle = puzzle;
        this.graph = graph;
        this._roomCode = getRandomRoomCode();
        this.sendTimeout = NETWORK_TIMEOUT;
        this.clientDB = new ClientDB();
        this.firebaseDB = new FirebaseDB();
        this._isLoading = false;
        this.initLocalStorage();
        this.listenToFirebaseDBChanges(this._roomCode);
        this.loadPuzzle(false);
    }

    public get roomCode() {
        if (!this.firebaseDB.isOnline) return 'OFFLINE';
        return this._roomCode;
    }

    private initLocalStorage() {
        const roomCode = localStorage.getItem('room-code');
        if (roomCode) {
            this._roomCode = roomCode;
        } else {
            localStorage.setItem('room-code', this._roomCode);
        }
        window.addEventListener('storage', () => this.changeRoom());
    }

    private async changeRoom() {
        const roomCode = localStorage.getItem('room-code');
        if (roomCode && roomCode !== this._roomCode) {
            this._roomCode = roomCode;
            this.listenToFirebaseDBChanges(this._roomCode);
            await this.loadPuzzle(true);
        }
    }

    public update() {
        if (this.puzzle.isModified) {
            this.saveInitialData();
            this.puzzle.isModified = false;
        }

        if (this.sendTimeout <= 0) {
            this.sendTimeout = NETWORK_TIMEOUT;
            if (this.graph.isModified) {
                this.saveGraphDataToClientDB();
            }
            this.sendIncrementalPuzzleData();
        }

        this.sendTimeout -= deltaTime;
    }
    
    private saveInitialData() {
        const puzzleData = this.puzzle.serialize();
        if (this.firebaseDB.isOnline) {
            this.firebaseDB.savePuzzleData(this._roomCode, puzzleData);
        } else {
            this.clientDB.savePuzzle(puzzleData);
        }
        this.saveGraphDataToClientDB();
    }
    
    private listenToFirebaseDBChanges(roomCode: string) {
        this.firebaseDB.listenToPuzzleUpdates(roomCode, async (puzzle) => {
            if (!this.isLoading) {
                await this.puzzle.deserialize(puzzle)
            }
        });
        this.firebaseDB.listenToPiecesUpdates(roomCode, (pieceData) => {
            this.puzzle.pieces[pieceData.id].deserialize(pieceData, { lerp: true });
        });
    }

    private saveGraphDataToClientDB() {
        const graphData = this.graph.serialize();
        this.clientDB.saveGraph(graphData);
    }

    private sendIncrementalPuzzleData() {
        const { pieces } = this.puzzle;
        const piecesData = pieces.filter(p => p.isModified).map(p => p.serialize());
        if (piecesData.length) {
            if (this.firebaseDB.isOnline) {
                this.firebaseDB.savePiecesData(this._roomCode, piecesData);
            } else {
                this.clientDB.savePieces(piecesData);
            }
        }
    }

    private async loadPuzzle(roomWasChanged: boolean) {
        try {
            this._isLoading = true;
            if (roomWasChanged) {
                this.puzzle.deserialize(undefined as any);
            }

            // Wait for connections to DB's to be established
            await this.clientDB.init();
            await this.firebaseDB.init();

            const graphData = await this.clientDB.loadGraph();
            
            if (this.firebaseDB.isOnline) {
                const roomData = await this.firebaseDB.getRoomData(this._roomCode);
                if (roomData) {
                    await this.deserializeAll(roomData.puzzle, Object.values(roomData.pieces), graphData);
                }
            } else {
                const puzzleData = await this.clientDB.loadPuzzle();
                const piecesData = await this.clientDB.loadPieces();
                await this.deserializeAll(puzzleData, piecesData, graphData);
            }
        } catch (error) {
            console.error(error);
        }
        this._isLoading = false;
    }

    private async deserializeAll(puzzleData: PuzzleData, piecesData: PieceData[], graphData: GraphData) {
        await this.graph.deserialize(graphData);
        await this.puzzle.deserialize(puzzleData)
        if (!this.puzzle.pieces.length) return;
        for (const pieceData of piecesData) {
            await this.puzzle.pieces[pieceData.id].deserialize(pieceData, { lerp: false });
        }
        this._isLoading = false;   
    }
}