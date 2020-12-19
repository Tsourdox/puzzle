
class Puzzle {
    private cellSize: p5.Vector;
    private pieces: Piece[];
    private inputHandler: InputHandler;
    private piecesFactory: PiecesFactory;

    constructor(x: number, y: number, image: p5.Image) {
        this.cellSize = createVector(width / x, height / y)
        this.inputHandler = new InputHandler(this.cellSize);
        this.piecesFactory = new PiecesFactory(x, y, image, this.cellSize);
        this.pieces = this.piecesFactory.createAllPieces();
    }

    public update() {
        this.inputHandler.update(this.pieces);
    }

    public draw() {
        background(0);
        this.piecesFactory.draw();
        this.drawPieces();
    }

    private drawPieces() {
        for (const piece of this.pieces) {
            piece.draw();
        }
    }
}