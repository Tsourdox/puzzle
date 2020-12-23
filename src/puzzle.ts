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
        
        this.generateNewPuzzle(images.background, 1, 1);
    }

    public generateNewPuzzle(image: p5.Image, x: number, y: number) {
        this.pieceSize = createVector(image.width / x, image.height / y);
        this.piecesFactory = new PiecesFactory(x, y, image, this.pieceSize);
        this.pieces = this.piecesFactory.createAllPieces();
        this.shufflePieces();
    }

    private shufflePieces() {
        const locations = this.pieces.map(p => p.getOrigin());
        
        for (const piece of this.pieces) {
            // Translate
            const randomIndex = random(0, locations.length);
            const location = locations.splice(randomIndex, 1)[0];
            const delta = p5.Vector.sub(location, piece.getOrigin())
            piece.translation = delta;

            // Rotate
            piece.rotation = random(0, PI * 2);
        }
    }

    private matchPieces() {
        // todo...
    }

    public update() {
        this.inputHandler.update(this.pieces, this.pieceSize);
        this.fps.update();

        for (const piece of this.pieces) {
            piece.update();
        }

        this.matchPieces();
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
        const sortedPieces = this.pieces.sort((a, b) =>
            a.lastSelected - b.lastSelected
        )
        
        for (const piece of sortedPieces) {
            piece.draw();
        }
    }
}