class TransformationHandler extends InputHandler {
    private puzzle: IPuzzle & IGraph;
    private selection: ISelection;
    private prevSpaceIsDown: boolean;
    private prevKeyRIsDown: boolean;
    private prevKeyCIsDown: boolean;

    constructor(puzzle: IPuzzle & IGraph, selection: ISelection) {
        super();
        this.puzzle = puzzle;
        this.selection = selection;
        this.prevSpaceIsDown = false;
        this.prevKeyRIsDown = false;
        this.prevKeyCIsDown = false;
    }

    private get selectedPieces(): Piece[] {
        return this.puzzle.pieces.filter(p => p.isSelected);
    }
    
    public update() {
        this.handlePieceRotation();
        this.handlePieceTranslation();
        this.handlePieceExploding();
        this.setPreviousValues();
    }

    protected setPreviousValues() {
        super.setPreviousValues();
        this.prevSpaceIsDown = keyIsDown(SPACE);
        this.prevKeyRIsDown = keyIsDown(KEY_R);
        this.prevKeyCIsDown = keyIsDown(KEY_C);
    }

    private handlePieceTranslation() {
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
            const movedX = (mouseX - this.prevMouseX) / this.puzzle.scale;
            const movedY = (mouseY - this.prevMouseY) / this.puzzle.scale;
            this.translatePieces(movedX, movedY);
        }
    }

    private handlePieceRotation() {
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
            const rotation = scrollDelta * 0.005 * this.scrollSensitivity;
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
        // todo: rotate pieces as group instead of individually
        for (const piece of this.selectedPieces) {
            piece.rotation += angle;
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
        const groupCenter = this.getAverageCenter(pieces);

        for (const piece of this.selectedPieces) {
            const pieceCenter = piece.getTrueCenter()
            const delta = p5.Vector.sub(groupCenter, pieceCenter);
            piece.translation.add(delta);
        }
    }

    private getAverageCenter(pieces: Piece[]) {
        var x = pieces.map(p => p.getTrueCenter().x);
        var y = pieces.map(p => p.getTrueCenter().y);
        
        // avg: sum / length
        var centerX = x.reduce((a,b) => (a+b), 0) / x.length;
        var centerY = y.reduce((a,b) => (a+b), 0) / y.length;
        return createVector(centerX,centerY);
    }
}