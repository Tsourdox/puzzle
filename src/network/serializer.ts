interface ISerializable<T> {
    isModified: boolean;
    serialize: () => T;
    deserialize: (object: T, done?: Function) => void;
}

interface ISerializablePuzzle extends ISerializable<PuzzleData> {
    pieces: ReadonlyArray<ISerializablePiece>;
    roomCode: string;
}

interface ISerializablePiece extends ISerializable<PieceData> {}
interface ISerializableGraph extends ISerializable<GraphData> {}

interface PuzzleData {
    image: string;
    pieceCount: Point;
    seed: number;
    roomCode: string;
}

interface PieceData {
    id: number;
    rotation: number;
    translation: Point;
    connectedSides?: number[];
    isSelected: boolean;
    elevation: number;
}

interface GraphData {
    scale: number;
    translation: Point;
}

interface RoomData {
    puzzle: PuzzleData;
    pieces: PieceData[];
}

class NetworkSerializer {
    private readonly TIMEOUT = 100; //ms
    private puzzle: ISerializablePuzzle
    private graph: ISerializableGraph
    private sendTimeout: number;
    private clientDB: ClientDB;
    private firebaseDB: FirebaseDB;
    private _isLoading: boolean;
    public get isLoading() { return this._isLoading }

    constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.sendTimeout = this.TIMEOUT;
        this.clientDB = new ClientDB();
        this.firebaseDB = new FirebaseDB();
        this._isLoading = false;
        this.loadPuzzle();
        this.listenToFirebaseDBChanges(puzzle.roomCode);
    }

    public update() {
        if (this.puzzle.isModified) {
            this.saveInitialData();
            this.puzzle.isModified = false;
        }

        if (this.sendTimeout <= 0) {
            this.sendTimeout = this.TIMEOUT;
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
        this.firebaseDB.savePuzzleData(puzzleData.roomCode, puzzleData);
    }
    
    private listenToFirebaseDBChanges(roomCode: string) {
        this.firebaseDB.listenToPuzzleUpdates(roomCode, (puzzle) => {
            this.puzzle.deserialize(puzzle, () => this._isLoading = false);
        });
        this.firebaseDB.listenToPiecesUpdates(roomCode, (piecesData) => {
            this.deserializePieces(piecesData);
        });
    }

    private saveGraphDataToClientDB() {
        const graphData = this.graph.serialize();
        this.clientDB.saveGraph(graphData);
    }

    private sendIncrementalPuzzleData() {
        const { pieces, roomCode } = this.puzzle;
        const piecesData = pieces.filter(p => p.isModified).map(p => p.serialize());
        this.clientDB.savePieces(piecesData);
        
        // todo...
        const allPiecesData = pieces.map(p => p.serialize());
        this.firebaseDB.savePiecesData(roomCode, allPiecesData);
    }

    private async loadPuzzle() {
        try {
            this._isLoading = true;
            await this.clientDB.init();
            const graphData = await this.clientDB.loadGraph();
            const roomData = await this.firebaseDB.getRoomData(this.puzzle.roomCode);
            if (roomData) {
                this.deserializeAll(roomData.puzzle, roomData.pieces, graphData);
            } else {
                const puzzleData = await this.clientDB.loadPuzzle();
                const piecesData = await this.clientDB.loadPieces();
                this.deserializeAll(puzzleData, piecesData, graphData);
            }
        } catch (error) {
            console.error(error);
            this._isLoading = false;
        }
    }

    private deserializeAll(puzzleData: PuzzleData, piecesData: PieceData[], graphData: GraphData) {
        this.graph.deserialize(graphData);
        this.puzzle.deserialize(puzzleData, () => {
            this.deserializePieces(piecesData);
            this._isLoading = false;   
        });
    }

    private deserializePieces(piecesData?: PieceData[]) {
        if (!this.puzzle.pieces.length) return;
        for (const pieceData of piecesData || []) {
            if (piecesData) {
                this.puzzle.pieces[pieceData.id].deserialize(pieceData);
            }
        }
    }
}