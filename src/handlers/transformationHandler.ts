interface ITransformHandler {
    rotatePiece(piece: Piece, angle: number): void;
    translatePiece(piece: Piece, translation: p5.Vector): void;
}

class TransformHandler implements ITransformHandler {
    private puzzle: IPuzzle;
    private graph: IGraph;
    private selection: ISelectionHandler;
    private prevSpaceIsDown: boolean;
    private prevKeyRIsDown: boolean;
    private prevKeyCIsDown: boolean;

    constructor(puzzle: IPuzzle, graph: IGraph, selection: ISelectionHandler) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.selection = selection;
        this.prevSpaceIsDown = false;
        this.prevKeyRIsDown = false;
        this.prevKeyCIsDown = false;
    }

    private get selectedPieces(): Piece[] {
        return this.puzzle.pieces.filter(p => p.isSelected);
    }
    
    public update(scrollSensitivity: number, prevMouse: p5.Vector) {
        this.handlePieceRotation(scrollSensitivity);
        this.handlePieceTranslation(prevMouse);
        this.handlePieceExploding();
        this.setPreviousValues();
    }

    protected setPreviousValues() {
        this.prevSpaceIsDown = keyIsDown(SPACE);
        this.prevKeyRIsDown = keyIsDown(KEY_R);
        this.prevKeyCIsDown = keyIsDown(KEY_C);
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
        pieces.forEach(p => p.translation.add(translation));
    }

    private handlePieceTranslation(prevMouse: p5.Vector) {
        // Keyboard
        const translation = (2 * this.puzzle.pieceSize.mag()) / frameRate();
        if (keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A)) {
            this.translatePieces(-translation, 0);
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) {
            this.translatePieces(translation, 0);
        }
        if (keyIsDown(UP_ARROW) || keyIsDown(KEY_W)) {
            this.translatePieces(0, -translation);
        }
        if (keyIsDown(DOWN_ARROW) || keyIsDown(KEY_S)) {
            this.translatePieces(0, translation);
        }
        
        // Dragging with mouse
        if (mouseIsPressed && mouseButton === LEFT && !this.selection.isDragSelecting()) {
            const movedX = (mouseX - prevMouse.x) / this.graph.scale;
            const movedY = (mouseY - prevMouse.y) / this.graph.scale;
            this.translatePieces(movedX, movedY);
        }
    }

    private handlePieceRotation(scrollSensitivity: number) {
        // Keyboard rotation
        const rotation = 2 / frameRate();
        if (keyIsDown(COMMA) || keyIsDown(KEY_Q)) {
            this.rotatePieces(-rotation);
        }
        if (keyIsDown(DOT) || keyIsDown(KEY_E)) {
            this.rotatePieces(rotation);
        }

        // Scroll wheel rotation
        if (keyIsDown(ALT)) {
            const rotation = scrollDelta * 0.005 * scrollSensitivity;
            this.rotatePieces(rotation)
        }
    }

    private handlePieceExploding() {
        if (keyIsDown(KEY_C) && !this.prevKeyCIsDown) {
            this.explodePiecesCircular();
        }
        if (keyIsDown(KEY_R) && !this.prevKeyRIsDown) {
            this.explodePiecesRectangular();
        }
        if (keyIsDown(SPACE) && !this.prevSpaceIsDown) {
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
            piece.translation.add(x, y);
        }
    }
    
    private explodePiecesCircular() {
        const radius = this.puzzle.pieceSize.mag();
        const pieces = this.selectedPieces;
        if (pieces.length <= 1) return;

        for (let i = 0; i < pieces.length; i++) {
            const angle = (PI * 2 / pieces.length) * i;
            const offsetX = radius * cos(angle);
            const offsetY = radius * sin(angle);
            pieces[i].translation.x += offsetX;
            pieces[i].translation.y += offsetY;
        }
    }
    
    private explodePiecesRectangular() {
        // todo: explode pieces into a rectangular shape 
    }

    private stackPieces() {
        const pieces = this.selectedPieces;
        const centers = pieces.map(p => p.getTrueCenter());
        const groupCenter = getAverageCenter(centers);

        for (const piece of this.selectedPieces) {
            const pieceCenter = piece.getTrueCenter()
            const delta = p5.Vector.sub(groupCenter, pieceCenter);
            piece.translation.add(delta);
        }
    }
}