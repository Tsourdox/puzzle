interface Point { x: number, y: number };

interface ISerializable<T> {
    isModified: boolean;
    serialize: () => T;
    deserialize: (object: T, done?: Function) => void;
}

interface ISerializablePuzzle extends ISerializable<PuzzleData> {
    pieces: ReadonlyArray<ISerializablePiece>;
}

interface ISerializablePiece extends ISerializable<PieceData> {}

type PuzzleData = {
    image: string;
    pieceCount: Point;
    seed: number;
};

type PieceData = {
    rotation: number;
    translation: Point;
    connectedSides: number[];
};

class NetworkSerializer {
    private puzzle: ISerializablePuzzle
    private sendTimeout: number;

    constructor(puzzle: ISerializablePuzzle) {
        this.puzzle = puzzle;
        this.sendTimeout = 10000;
    }

    public update() {
        if (this.puzzle.isModified) {
            this.sendInitialData();
            this.puzzle.isModified = false;
        }
        
        if (this.sendTimeout <= 0) {
            this.sendTimeout = 5000;
            this.sendIncrementalData();
        }

        this.sendTimeout -= deltaTime;
    }
    
    private sendInitialData() {
        const puzzleData = this.puzzle.serialize();
        const stringifiedData = JSON.stringify(puzzleData);
        localStorage.clear();
        localStorage.setItem('puzzle', stringifiedData);
        // todo: send to server
    }

    private sendIncrementalData() {
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
        const stringifiedData = localStorage.getItem('puzzle');
        if (!stringifiedData) return;

        const data: PuzzleData = JSON.parse(stringifiedData);
        
        this.puzzle.deserialize(data, () => {
            for (let i = 0; i < this.puzzle.pieces.length; i++) {
                const stringifiedData = localStorage.getItem(`piece-${i}`);
                if (!stringifiedData) continue;
                
                this.puzzle.pieces[i].deserialize(JSON.parse(stringifiedData));
            }
        });   
    }
}