interface IPuzzle {
    pieces: Piece[];
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
    public pieceSize!: p5.Vector;
    public scale: number;
    public translation: p5.Vector;
    private graphHandler: GraphHandler;
    private selectionHandler: SelectionHandler;
    private transformationHandler: TransformationHandler;
    private menu: Menu;
    private fps: FPS;
    
    private piecesFactory!: PiecesFactory;
    private xPieceCount!: number;

    constructor() {
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.graphHandler = new GraphHandler(this);
        this.selectionHandler = new SelectionHandler(this);
        this.transformationHandler = new TransformationHandler(this, this.selectionHandler);
        this.menu = new Menu(this);
        this.fps = new FPS();
        
        this.generateNewPuzzle(images.background, 3, 3);
    }

    public generateNewPuzzle(image: p5.Image, x: number, y: number) {
        this.pieceSize = createVector(image.width / x, image.height / y);
        this.piecesFactory = new PiecesFactory(x, y, image, this.pieceSize);
        this.pieces = this.piecesFactory.createAllPieces();
        this.xPieceCount = x;
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

    private checkForConnectedPieces() {
        const limit = this.pieceSize.mag() / 10;
        const x = this.xPieceCount;
        const length = this.pieces.length;
        
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            // Only check selected pieces
            if (piece.isSelected) {
                const pieceCorners = piece.getTrueCorners();
                
                // Check each side [top, right, bottom, left]
                for (let s = 0; s < 4; s++) {
                    // Dont check outside of puzzle
                    if (s === 0 && i < x) continue;
                    if (s === 1 && i % x === x - 1) continue;
                    if (s === 2 && length - i <= x) continue;
                    if (s === 3 && (length - i) % x === 0) continue;

                    // Select adjecentPiece
                    let adjecentPiece!: Piece;
                    if (s === 0) adjecentPiece = this.pieces[i - x];
                    if (s === 1) adjecentPiece = this.pieces[i + 1];
                    if (s === 2) adjecentPiece = this.pieces[i + x];
                    if (s === 3) adjecentPiece = this.pieces[i - 1];
                    
                    // Select matching edges
                    const adjecentCorners = adjecentPiece.getTrueCorners();
                    const pcA = pieceCorners[s];
                    const acA = adjecentCorners[(s+3)%4];
                    const pcB = pieceCorners[(s+1)%4];
                    const acB = adjecentCorners[(s+2)%4];

                    // Check distance between matching edges
                    const distA = pcA.dist(acA);
                    const distB = pcB.dist(acB);
                    if (distA + distB < limit) {
                        adjecentPiece.isConnected = true;
                        piece.isConnected = true;
                        piece.isSelected = false;
                        piece.rotation = adjecentPiece.rotation;
                        const ucA = piece.getTrueCorners()[s];
                        const delta = p5.Vector.sub(acA, ucA);
                        piece.translation.add(delta);
                        const index = floor(random(0, sounds.snaps.length));
                        sounds.snaps[index].play();
                    }
                }
            }
        }
    }

    public update() {
        this.graphHandler.update();
        this.selectionHandler.update();
        this.transformationHandler.update();
        this.fps.update();

        for (const piece of this.pieces) {
            piece.update();
        }

        this.checkForConnectedPieces();
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
        // Create new array before sorting so it's not mutated
        const sortedPieces = [...this.pieces].sort((a, b) =>
            a.lastSelected - b.lastSelected
        )
        
        for (const piece of sortedPieces) {
            piece.draw();
        }
    }
}