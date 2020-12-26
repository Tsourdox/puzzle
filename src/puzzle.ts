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
    private menu: Menu;
    private fps: FPS;
    
    private piecesFactory!: PiecesFactory;

    constructor() {
        this.scale = 1;
        this.translation = createVector(0, 0);
        this.graphHandler = new GraphHandler(this);
        this.selectionHandler = new SelectionHandler(this);
        this.transformHandler = new TransformHandler(this, this.selectionHandler);
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
        for (const piece of this.pieces) {
            if (piece.isSelected) {
                this.checkPieceConnection(piece, limit);
            }
        }
    }

    private checkPieceConnection(piece: Piece, limit: number) {
        const length = this.pieces.length;
        const { x } = this.pieceCount;
        
        // Check each side [top, right, bottom, left]
        for (let side = 0; side < 4; side++) {
            // Dont check connected pieces
            if (piece.connectedSides.includes(side)) continue;

            // Dont check outside of puzzle
            const i = this.pieces.indexOf(piece)
            if (side === Side.Top && i < x) continue;
            if (side === Side.Right && i % x === x - 1) continue;
            if (side === Side.Bottom && length - i <= x) continue;
            if (side === Side.Left && (length - i) % x === 0) continue;

            // Select adjecentPiece
            const adjecentPiece = getAdjecentPiece(piece, side, this);
            
            // Select matching edges
            const pieceCorners = piece.getTrueCorners();
            const adjecentCorners = adjecentPiece.getTrueCorners();
            const pcA = pieceCorners[side];
            const acA = adjecentCorners[(side+3)%4];
            const pcB = pieceCorners[(side+1)%4];
            const acB = adjecentCorners[(side+2)%4];

            // Check distance between matching edges
            const distA = pcA.dist(acA);
            const distB = pcB.dist(acB);
            if (distA + distB < limit) {
                this.connectPieces(piece, adjecentPiece, side)
                // Remove selection and reset loop
                // so all sides are properly checked
                this.selectionHandler.select(piece, false);
                side = -1;
            }
        }
    }

    private connectPieces(piece: Piece, adjecentPiece: Piece, side: Side) {
        // First matching side found
        if (piece.isSelected) {
            // Play click sound
            const index = floor(random(0, sounds.snaps.length));
            sounds.snaps[index].play();
            
            // Rotate and translate selected piece|s
            const deltaRotation = adjecentPiece.rotation - piece.rotation;
            this.transformHandler.rotatePiece(piece, deltaRotation);
            
            const acA = adjecentPiece.getTrueCorners()[(side+3)%4];
            const ucA = piece.getTrueCorners()[side];
            const deltaTranslation = p5.Vector.sub(acA, ucA);
            this.transformHandler.translatePiece(piece, deltaTranslation);
        }

        // Add to connected side list
        const oppositeSide = (side+2)%4;
        adjecentPiece.connectedSides.push(oppositeSide);
        piece.connectedSides.push(side);
    }

    public update() {
        this.graphHandler.update();
        this.selectionHandler.update();
        this.transformHandler.update();
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