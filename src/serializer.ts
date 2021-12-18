interface ISerializable<T> {
    isModified: boolean;
    serialize: () => T;
    deserialize: (object: T, done?: Function) => void;
}

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
    connectedSides: number[];
    isSelected: boolean;
    elevation: number;
}

interface GraphData {
    scale: number;
    translation: Point;
}

class NetworkSerializer {
    private readonly TIMEOUT = 100; //ms
    private puzzle: ISerializablePuzzle
    private graph: ISerializableGraph
    private sendTimeout: number;
    private clientDB: ClientDB;
    private _isLoading: boolean;
    public get isLoading() { return this._isLoading }

    constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.sendTimeout = this.TIMEOUT;
        this.clientDB = new ClientDB();
        this._isLoading = true;
        this.loadPuzzle();
    }

    public update() {
        if (this.puzzle.isModified) {
            this.sendInitialData();
            this.puzzle.isModified = false;
        }

        if (this.sendTimeout <= 0) {
            this.sendTimeout = this.TIMEOUT;
            if (this.graph.isModified) {
                this.sendGraphData();
            }
            this.sendIncrementalPuzzleData();
        }

        this.sendTimeout -= deltaTime;
    }
    
    private sendInitialData() {
        const puzzleData = this.puzzle.serialize();
        this.clientDB.savePuzzle(puzzleData);
        this.sendGraphData();
        // todo: send to server
    }

    private sendGraphData() {
        const graphData = this.graph.serialize();
        this.clientDB.saveGraph(graphData);
    }

    private sendIncrementalPuzzleData() {
        const { pieces } = this.puzzle;
        const piecesData = pieces.filter(p => p.isModified).map(p => p.serialize());
        this.clientDB.savePieces(piecesData);
        // todo: send to server
    }

    private async loadPuzzle() {
        try {
            await this.clientDB.init();
            const puzzleData = await this.clientDB.loadPuzzle();
            const graphData = await this.clientDB.loadGraph();
            const piecesData = await this.clientDB.loadPieces();
            
            this.puzzle.deserialize(puzzleData, () => {
                this.graph.deserialize(graphData);
                for (const pieceData of piecesData) {
                    this.puzzle.pieces[pieceData.id].deserialize(pieceData);
                }
            });
            
            this._isLoading = false;   
        } catch (error) {
            console.error(error);
            this._isLoading = false;
        }
    }
}