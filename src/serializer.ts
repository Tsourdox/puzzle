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
    rotation: number;
    translation: Point;
    connectedSides: number[];
    lastSelected: number;
    isSelected: boolean;
}

interface GraphData {
    scale: number;
    translation: Point;
}

class NetworkSerializer {
    private readonly TIMEOUT = 1000;
    private puzzle: ISerializablePuzzle
    private graph: ISerializableGraph
    private sendTimeout: number;

    constructor(puzzle: ISerializablePuzzle, graph: ISerializableGraph) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.sendTimeout = this.TIMEOUT;
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
        const stringifiedData = JSON.stringify(puzzleData);
        localStorage.clear();
        localStorage.setItem('puzzle', stringifiedData);
        this.sendGraphData();
        // todo: send to server
    }

    private sendGraphData() {
        const graphData = this.graph.serialize();
        const stringifiedData = JSON.stringify(graphData);
        localStorage.setItem('graph', stringifiedData);
    }

    private sendIncrementalPuzzleData() {
        const { pieces } = this.puzzle;
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].isModified) {
                const stringifiedData = JSON.stringify(pieces[i].serialize());
                localStorage.setItem(`piece-${i}`, stringifiedData);
            }
        }
        // todo: send to server
    }

    public loadPuzzle() {
        const stringifiedPuzzleData = localStorage.getItem('puzzle');
        const stringifiedGraphData = localStorage.getItem('graph');
        if (!stringifiedPuzzleData || !stringifiedGraphData) return;

        const puzzleData: PuzzleData = JSON.parse(stringifiedPuzzleData);
        const graphData: GraphData = JSON.parse(stringifiedGraphData);
        
        this.graph.deserialize(graphData);
        this.puzzle.deserialize(puzzleData, () => {
            for (let i = 0; i < this.puzzle.pieces.length; i++) {
                const stringifiedData = localStorage.getItem(`piece-${i}`);
                if (!stringifiedData) continue;
                
                this.puzzle.pieces[i].deserialize(JSON.parse(stringifiedData));
            }
        });   
    }
}