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
    private transformationHandler: TransformationHandler;
    private menu: Menu;
    private fps: FPS;
    
    private piecesFactory!: PiecesFactory;

    constructor() {
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.graphHandler = new GraphHandler(this);
        this.selectionHandler = new SelectionHandler(this);
        this.transformationHandler = new TransformationHandler(this, this.selectionHandler);
        this.menu = new Menu(this);
        this.fps = new FPS();
        
        this.generateNewPuzzle(images.background, 2, 2);
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

    private checkForConnectedPieces() {
        const limit = this.pieceSize.mag() / 10;
        const { x } = this.pieceCount;
        const length = this.pieces.length;
        
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            // Only check selected pieces
            if (piece.isSelected) {
                const pieceCorners = piece.getTrueCorners();
                
                // Check each side [top, right, bottom, left]
                for (let s = 0; s < 4; s++) {
                    // Dont check connected pieces
                    if (piece.isConnected.includes(s)) return;

                    // Dont check outside of puzzle
                    if (s === Side.Top && i < x) continue;
                    if (s === Side.Right && i % x === x - 1) continue;
                    if (s === Side.Bottom && length - i <= x) continue;
                    if (s === Side.Left && (length - i) % x === 0) continue;

                    // Select adjecentPiece
                    let adjecentPiece!: Piece;
                    if (s === Side.Top) adjecentPiece = this.pieces[i - x];
                    if (s === Side.Right) adjecentPiece = this.pieces[i + 1];
                    if (s === Side.Bottom) adjecentPiece = this.pieces[i + x];
                    if (s === Side.Left) adjecentPiece = this.pieces[i - 1];
                    
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
                        const oppositeSide = (s+2)%4;
                        adjecentPiece.isConnected.push(oppositeSide);
                        piece.isConnected.push(s);
                        
                        // First matching side found
                        if (piece.isSelected) {
                            piece.rotation = adjecentPiece.rotation;
                            const ucA = piece.getTrueCorners()[s];
                            const delta = p5.Vector.sub(acA, ucA);
                            piece.translation.add(delta);
                            const index = floor(random(0, sounds.snaps.length));
                            sounds.snaps[index].play();
                        }
                        
                        // Remove selection and reset loop
                        // so all sides are properly checked
                        this.selectionHandler.select(piece, false);
                        s=0;
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
        for (const piece of sortPieces(this.pieces)) {
            piece.draw();
        }
    }
}