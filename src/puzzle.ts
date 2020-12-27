interface IPuzzle {
    pieces: ReadonlyArray<Piece>;
    pieceCount: p5.Vector;
    pieceSize: p5.Vector;
}

interface IGraph {
    scale: number;
    translation: p5.Vector;
}

interface IGeneratePuzzle {
    generateNewPuzzle(image: p5.Image, x: number, y: number): void;
}

class Puzzle implements IPuzzle, IGraph, IGeneratePuzzle, ISerializablePuzzle {
    public pieces: ReadonlyArray<Piece>;
    public pieceCount: p5.Vector;
    public pieceSize: p5.Vector;
    public isModified: boolean;
    public scale: number;
    public translation: p5.Vector;
    private networkSerializer: NetworkSerializer;
    private inputHandler: InputHandler;
    private pieceConnetor: PieceConnector;
    private menu: Menu;
    private fps: FPS;
    private image?: p5.Image;
    private piecesFactory?: PiecesFactory;

    constructor() {
        this.pieces = [];
        this.pieceCount = createVector(0, 0);
        this.pieceSize = createVector(0, 0);
        this.isModified = false;
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.networkSerializer = new NetworkSerializer(this);
        this.inputHandler = new InputHandler(this);
        const { selectionHandler, transformHandler } = this.inputHandler;
        this.pieceConnetor = new PieceConnector(this, selectionHandler, transformHandler);
        this.menu = new Menu(this);
        this.fps = new FPS();
        
        // this.generateNewPuzzle(images.scull, 2, 2);
        this.loadPuzzle();
    }

    private loadPuzzle() {
        this.networkSerializer.loadPuzzle();
    }

    public generateNewPuzzle(image: p5.Image, x: number, y: number) {
        this.isModified = true;
        this.image = image;
        this.pieceCount = createVector(x, y);
        this.pieceSize = createVector(image.width / x, image.height / y);
        this.piecesFactory = new PiecesFactory(x, y, image);
        this.pieces = this.piecesFactory.createAllPieces();
    }

    public update() {
        this.networkSerializer.update();
        this.inputHandler.update();
        this.pieceConnetor.update();
        this.fps.update();

        for (const piece of this.pieces) {
            piece.update();
        }
    }

    public draw() {
        push();
        background(50);
        scale(this.scale);
        translate(this.translation);
        this.piecesFactory?.draw();
        this.drawPieces();
        pop();
        
        this.menu.draw();
        this.inputHandler.draw();
        this.fps.draw();
    }

    private drawPieces() {
        for (const piece of sortPieces(this.pieces)) {
            piece.draw();
        }
    }

    public serialize(): PuzzleData {
        const { x, y } = this.pieceCount;
        return {
            pieceCount: { x, y },
            seed: this.piecesFactory?.seed || 0,
            image: (this.image as any)?.canvas.toDataURL() || 'no-image'
        };
    }

    public deserialize(puzzle: PuzzleData, done?: Function) {
        loadImage(puzzle.image, (image) => {
            const { x, y } = puzzle.pieceCount;
            this.image = image;
            this.pieceCount = createVector(x, y);
            this.pieceSize = createVector(image.width / x, image.height / y);
            this.piecesFactory = new PiecesFactory(x, y, image, puzzle.seed);
            this.pieces = this.piecesFactory.createAllPieces();
            done!();
        });
    }
}