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
    public roomCode: string;

    constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.roomCode = "XY7G";
        this.sendTimeout = NETWORK_TIMEOUT;
        this.clientDB = new ClientDB();
        this.firebaseDB = new FirebaseDB();
        this._isLoading = false;
        this.initLocalStorage();
        this.listenToFirebaseDBChanges(this.roomCode);
        this.loadPuzzle(false);
    }

    private initLocalStorage() {
        const roomCode = localStorage.getItem('room-code');
        if (roomCode) this.roomCode = roomCode;
        window.addEventListener('storage', () => this.changeRoom());
    }

    private changeRoom() {
        const roomCode = localStorage.getItem('room-code');
        if (roomCode && roomCode !== this.roomCode) {
            this.roomCode = roomCode;
            this.loadPuzzle(true);
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
        this.clientDB.savePuzzle(puzzleData);
        this.saveGraphDataToClientDB();
        this.firebaseDB.savePuzzleData(this.roomCode, puzzleData);
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
            this.clientDB.savePieces(piecesData);
            this.firebaseDB.savePiecesData(this.roomCode, piecesData);
        }
    }

    private async loadPuzzle(roomWasChanged: boolean) {
        try {
            this._isLoading = true;
            await this.clientDB.init();
            const graphData = await this.clientDB.loadGraph();
            const roomData = await this.firebaseDB.getRoomData(this.roomCode);
            console.log(roomData);
            if (roomData) {
                await this.deserializeAll(roomData.puzzle, Object.values(roomData.pieces), graphData);
            } else if (!roomWasChanged) {
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
        this.graph.deserialize(graphData);
        await this.puzzle.deserialize(puzzleData)
        this.deserializePieces(piecesData);
        this._isLoading = false;   
    }

    private deserializePieces(piecesData: PieceData[]) {
        if (!this.puzzle.pieces.length) return;
        for (const pieceData of piecesData) {
            this.puzzle.pieces[pieceData.id].deserialize(pieceData, { lerp: false });
        }
    }
}