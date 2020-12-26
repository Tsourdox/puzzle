interface IPuzzle {
    pieces: Piece[];
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

class Puzzle implements IPuzzle, IGeneratePuzzle {
    public pieces!: Piece[];
    public pieceCount!: p5.Vector;
    public pieceSize!: p5.Vector;
    public scale: number;
    public translation: p5.Vector;
    private graphHandler: GraphHandler;
    private selectionHandler: SelectionHandler;
    private transformHandler: TransformHandler;
    private pieceConnetor: PieceConnector;
    private menu: Menu;
    private fps: FPS;
    
    private piecesFactory!: PiecesFactory;

    constructor() {
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.graphHandler = new GraphHandler(this);
        this.selectionHandler = new SelectionHandler(this);
        this.transformHandler = new TransformHandler(this, this.selectionHandler);
        this.pieceConnetor = new PieceConnector(this, this.selectionHandler, this.transformHandler);
        this.menu = new Menu(this);
        this.fps = new FPS();
        
        this.generateNewPuzzle(images.background, 4, 4);
    }

    public generateNewPuzzle(image: p5.Image, x: number, y: number) {
        this.pieceCount = createVector(x, y);
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

    public update() {
        this.graphHandler.update();
        this.selectionHandler.update();
        this.transformHandler.update();
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
        this.piecesFactory.draw();
        this.drawPieces();
        pop();
        
        this.menu.draw();
        this.selectionHandler.draw();
        this.fps.draw();
    }

    private drawPieces() {
        for (const piece of sortPieces(this.pieces)) {
            piece.draw();
        }
    }
}