interface IPuzzle {
    pieces: Piece[];
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
    public scale: number;
    public translation: p5.Vector;
    private selectionHandler: SelectionHandler;
    private graphHandler: GraphHandler;
    private menu: Menu;
    private fps: FPS;
    
    private pieceSize!: p5.Vector;
    private piecesFactory!: PiecesFactory;
    private xPieceCount!: number;

    constructor() {
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.selectionHandler = new SelectionHandler(this);
        this.graphHandler = new GraphHandler(this);
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

                    let adjecentPiece!: Piece;
                    if (s === 0) adjecentPiece = this.pieces[i - x];
                    if (s === 1) adjecentPiece = this.pieces[i + 1];
                    if (s === 2) adjecentPiece = this.pieces[i + x];
                    if (s === 3) adjecentPiece = this.pieces[i - 1];
                    
                    const adjecentCorners = adjecentPiece.getTrueCorners();
                    const distA = pieceCorners[s].dist(adjecentCorners[(s+3)%4]);
                    const distB = pieceCorners[(s+1)%4].dist(adjecentCorners[(s+2)%4]);
                    if (distA + distB < limit) {
                        adjecentPiece.isConnected = true;
                        piece.isConnected = true;
                        piece.isSelected = false;
                        // todo: place correcly when rotated
                        piece.rotation = adjecentPiece.rotation;
                        piece.translation = adjecentPiece.translation.copy();
                    }
                }
            }
        }
    }

    public update() {
        this.graphHandler.update();
        this.selectionHandler.update(this.pieceSize);
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