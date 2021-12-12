interface ITransformHandler {
    rotatePiece(piece: Piece, angle: number): void;
    translatePiece(piece: Piece, translation: p5.Vector): void;
}

class TransformHandler implements ITransformHandler {
    private puzzle: IPuzzle;
    private graph: IGraph;
    private selection: ISelectionHandler;
    private stackKeyPrevDown: boolean;
    private explodeKeyPrevDown: boolean;
    private settings: IReadableSettings;

    constructor(puzzle: IPuzzle, graph: IGraph, selection: ISelectionHandler, settings: IReadableSettings) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.selection = selection;
        this.settings = settings;
        this.stackKeyPrevDown = false;
        this.explodeKeyPrevDown = false;
    }

    private get selectedPieces(): Piece[] {
        return this.puzzle.pieces.filter(p => p.isSelected);
    }
    
    public update(prevMouse: p5.Vector, prevTouches: Touches) {
        this.handlePieceRotation(prevTouches);
        this.handlePieceTranslation(prevMouse, prevTouches);
        this.handlePieceExploding();
        this.setPreviousValues();
    }

    protected setPreviousValues() {
        this.stackKeyPrevDown = keyIsDown(this.settings.getValue('stapla bitar'));
        this.explodeKeyPrevDown = keyIsDown(this.settings.getValue('sprid bitar'));
    }

    /** Will also rotate connected pieces */
    public rotatePiece(piece: Piece, angle: number) {
        const pieces = getConnectedPieces(piece, this.puzzle);
        const centeres = pieces.map(p => p.getTrueCenter());
        const averageCenter = getAverageCenter(centeres);
        
        for (const piece of pieces) {
            rotateAroundCenter(piece, averageCenter, angle);
        }
    }

    /** Will also translate connected pieces */
    public translatePiece(piece: Piece, translation: p5.Vector) {
        const pieces = getConnectedPieces(piece, this.puzzle);
        pieces.forEach(p => p.translation = p5.Vector.add(p.translation, translation));
    }

    private handlePieceTranslation(prevMouse: p5.Vector, prevTouches: Touches) {
        // Wait to next frame when input is touch
        if (touches.length && !prevTouches.length) return;
        // Dont move pieces when using multi touch gestures
        if (touches.length > 1) return;
        
        // Dragging with mouse or touch
        const isMassSelecting = keyIsDown(this.settings.getValue('markera fler'));
        if ((mouseIsPressed && mouseButton === LEFT || touches.length) && !this.selection.isDragSelecting && !isMassSelecting) {
            if (touches.length !== prevTouches.length) return;
            
            const movedX = (mouseX - prevMouse.x) / this.graph.scale;
            const movedY = (mouseY - prevMouse.y) / this.graph.scale;
            this.translatePieces(movedX, movedY);
        }
    }

    private handlePieceRotation(prevTouches: Touches) {
        // Keyboard
        const userSpeed = this.settings.getValue('rotationshastighet');
        const rotation = 2 / frameRate() * userSpeed;
        if (keyIsDown(this.settings.getValue('rotera vänster'))) {
            this.rotatePieces(-rotation);
        }
        if (keyIsDown(this.settings.getValue('rotera höger'))) {
            this.rotatePieces(rotation);
        }
        // Touch (3 finger drag)
        if (touches.length === 3 && prevTouches.length === 3) {
            const [t1, t2, t3] = touches as Touches;
            const [p1, p2, p3] = prevTouches;
            const delta = (t1.x + t2.x + t3.x) - (p1.x + p2.x + p3.x);
            this.rotatePieces(rotation * delta * .2 * userSpeed);
        }

        // Scroll
        if (this.puzzle.selectedPieces) {
            const rotation = scrollDelta * 0.005 * userSpeed;
            this.rotatePieces(rotation)
        }
    }

    private handlePieceExploding() {
        if (keyIsDown(this.settings.getValue('sprid bitar')) && !this.explodeKeyPrevDown) {
            this.explodePieces();
        }
        if (keyIsDown(this.settings.getValue('stapla bitar')) && !this.stackKeyPrevDown) {
            this.stackPieces();
        }
    }

    private rotatePieces(angle: number) {
        const centeres = this.selectedPieces.map(p => p.getTrueCenter());
        const averageCenter = getAverageCenter(centeres);
        
        for (const piece of this.selectedPieces) {
            rotateAroundCenter(piece, averageCenter, angle);
        }
    }
    
    private translatePieces(x: number, y: number) {
        for (const piece of this.selectedPieces) {
            piece.translation = createVector(x, y).add(piece.translation);
        }
    }
    
    private explodePieces() {
        const radius = this.puzzle.pieceSize.mag();
        const pieces = this.selectedPieces;
        if (pieces.length <= 1) return;

        // todo: explodera bättre, animerat?
        for (let i = 0; i < pieces.length; i++) {
            const angle = (PI * 2 / pieces.length) * i;
            const x = radius * cos(angle);
            const y = radius * sin(angle);
            this.translatePiece(pieces[i], createVector(x, y));
        }
    }

    private stackPieces() {
        const pieces = this.selectedPieces;
        const centers = pieces.map(p => p.getTrueCenter());
        const groupCenter = getAverageCenter(centers);

        for (const piece of this.selectedPieces) {
            const pieceCenter = piece.getTrueCenter()
            const delta = p5.Vector.sub(groupCenter, pieceCenter);
            this.translatePiece(piece, delta);
        }
    }
}