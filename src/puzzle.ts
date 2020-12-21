interface IGraph {
    scale: number;
    translation: p5.Vector;
}

interface IGeneratePuzzle {
    generateNewPuzzle(image: p5.Image, x: number, y: number): void;
}

class Puzzle implements IGraph, IGeneratePuzzle {
    public scale: number;
    public translation: p5.Vector;
    private inputHandler: InputHandler;
    private menu: Menu;
    private fps: FPS;
    
    private pieceSize!: p5.Vector;
    private pieces!: Piece[];
    private piecesFactory!: PiecesFactory;

    constructor() {
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.inputHandler = new InputHandler(this);
        this.menu = new Menu(this);
        this.fps = new FPS();
        
        this.generateNewPuzzle(images.background, 10, 10);
    }

    public generateNewPuzzle(image: p5.Image, x: number, y: number) {
        this.pieceSize = createVector(image.width / x, image.height / y);
        this.piecesFactory = new PiecesFactory(x, y, image, this.pieceSize);
        this.pieces = this.piecesFactory.createAllPieces();
    }

    public update() {
        this.inputHandler.update(this.pieces, this.pieceSize);
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
        this.piecesFactory.draw();
        this.drawPieces();
        pop();
        
        this.menu.draw();
        this.inputHandler.draw();
        this.fps.draw();
    }

    private drawPieces() {
        const selectedPieces: Piece[] = [];
        for (const piece of this.pieces) {
            if (piece.isSelected) {
                selectedPieces.push(piece);
            } else {
                piece.draw();
            }
        }
        for (const piece of selectedPieces) {
            piece.draw();
        }
    }
}