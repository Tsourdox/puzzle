interface IPuzzle {
    pieces: ReadonlyArray<Piece>;
    pieceCount: p5.Vector;
    pieceSize: p5.Vector;
}

interface IGeneratePuzzle {
    generateNewPuzzle(image: p5.Image, x: number, y: number): void;
}

class Puzzle implements IPuzzle, IGeneratePuzzle, ISerializablePuzzle {
    public pieces: ReadonlyArray<Piece>;
    public pieceCount: p5.Vector;
    public pieceSize: p5.Vector;
    public isModified: boolean;
    private inputHandler: InputHandler;
    private networkSerializer: NetworkSerializer;
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
        this.inputHandler = new InputHandler(this);
        this.networkSerializer = new NetworkSerializer(this, this.inputHandler.graphHandler);
        const { selectionHandler, transformHandler } = this.inputHandler;
        this.pieceConnetor = new PieceConnector(this, selectionHandler, transformHandler);
        this.menu = new Menu(this);
        this.fps = new FPS();
        this.loadPuzzle();
    }

    private loadPuzzle() {
        const loadStateFound = this.networkSerializer.loadPuzzle();
        if (!loadStateFound) {
            this.generateNewPuzzle(images.face, 5, 5);
        }
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
        const { graphHandler } = this.inputHandler;
        push();
        background(50);
        scale(graphHandler.scale);
        translate(graphHandler.translation);
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
        return {
            pieceCount: toPoint(this.pieceCount),
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