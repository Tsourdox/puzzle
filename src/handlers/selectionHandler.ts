class SelectionHandler extends InputHandler {
    private puzzle: IPuzzle & IGraph;
    private prevMouseIsPressed: boolean;
    private prevSpaceIsDown: boolean;
    private prevKeyRIsDown: boolean;
    private prevKeyCIsDown: boolean;
    private dragSelectionColor: p5.Color;
    private dragSelectionOrigin?: p5.Vector;

    constructor(puzzle: IPuzzle & IGraph) {
        super();
        this.puzzle = puzzle;
        this.prevMouseIsPressed = false;
        this.prevSpaceIsDown = false;
        this.prevKeyRIsDown = false;
        this.prevKeyCIsDown = false;
        this.dragSelectionColor = color('rgba(100,100,100,0.3)')
    }

    private get selectedPieces(): Piece[] {
        return this.puzzle.pieces.filter(p => p.isSelected);
    }

    public update(pieceSize: p5.Vector) {
        this.handlePieceSelection();
        this.handleDragSelection();
        this.handlePieceRotation();
        this.handlePieceTranslation(pieceSize);
        this.handlePieceExploding(pieceSize);

        // Set previous values last in update!
        this.setPreviousValues();
    }

    private setPreviousValues() {
        this.prevMouseIsPressed = mouseIsPressed;
        this.prevSpaceIsDown = keyIsDown(SPACE);
        this.prevKeyRIsDown = keyIsDown(KEY_R);
        this.prevKeyCIsDown = keyIsDown(KEY_C);
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }

    private handlePieceTranslation(pieceSize: p5.Vector) {
        // Keyboard
        const translation = (2 * pieceSize.mag()) / frameRate();
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
        if (mouseIsPressed && mouseButton === LEFT && !this.dragSelectionOrigin) {
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

    private handleDragSelection() {
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        const didRelease = this.prevMouseIsPressed && !mouseIsPressed;
        
        
        if (didPress && mouseButton === LEFT) {
            const mouseOverPiece = this.isMouseOverPiece(this.puzzle.pieces);
            if (!this.selectedPieces.length || (keyIsDown(SHIFT) && !mouseOverPiece)) {
                this.dragSelectionOrigin = createVector(mouseX, mouseY);
            }
        }
        if (didRelease) {
            delete this.dragSelectionOrigin;
        }
    }

    private isMouseOverPiece(pieces: ReadonlyArray<Piece>) {
        let mouseOverPiece = false;
        for (const piece of pieces) {
            if (piece.isMouseOver(this.puzzle)) {
                mouseOverPiece = true;
                break;
            }
        }
        return mouseOverPiece;
    }

    private handlePieceSelection() {
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        
        // Select by clicking
        if (didPress && mouseButton === LEFT) {
            const mouseOverPiece = this.isMouseOverPiece(this.selectedPieces);
            
            for (const piece of this.puzzle.pieces) {
                const isMouseOver = piece.isMouseOver(this.puzzle);
                if (keyIsDown(SHIFT)) {
                    if (isMouseOver) {
                        piece.isSelected = true;
                    }
                } else if (mouseOverPiece) {
                    piece.isSelected = piece.isSelected || isMouseOver;
                } else {
                    piece.isSelected = isMouseOver;
                }
            }
        }

        // Select by dragging
        if (this.dragSelectionOrigin) {
            for (const piece of this.puzzle.pieces) {
                let isOneCornerInside = false;
                for (const corner of piece.getTrueCorners()) {
                    if (this.isPointInsideDragSelection(corner)) {
                        isOneCornerInside = true;
                    }
                }
                if (keyIsDown(SHIFT)) {
                    piece.isSelected = piece.isSelected || isOneCornerInside;
                } else {
                    piece.isSelected = isOneCornerInside;
                }
            }
        }
        
        // Deselect
        if (keyIsDown(ESCAPE)) { 
            for (const piece of this.selectedPieces) {
                piece.isSelected = false;
            }
        }
    }

    private handlePieceExploding(pieceSize: p5.Vector) {
        if (keyIsDown(KEY_C) && !this.prevKeyCIsDown) {
            this.explodePiecesCircular(pieceSize);
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
    
    private explodePiecesCircular(pieceSize: p5.Vector) {
        const radius = pieceSize.mag();
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
            const pieceCenter = piece.getTruePosition()
            const delta = p5.Vector.sub(groupCenter, pieceCenter);
            piece.translation.add(delta);
        }
    }

    private getAverageCenter(pieces: Piece[]) {
        var x = pieces.map(p => p.getTruePosition().x);
        var y = pieces.map(p => p.getTruePosition().y);
        
        // avg: sum / length
        var centerX = x.reduce((a,b) => (a+b), 0) / x.length;
        var centerY = y.reduce((a,b) => (a+b), 0) / y.length;
        return createVector(centerX,centerY);
    }

    private isPointInsideDragSelection(point: p5.Vector): boolean {
        if (!this.dragSelectionOrigin) return false;

        const { scale, translation } = this.puzzle;
        const { x, y } = p5.Vector.div(this.dragSelectionOrigin, scale).sub(translation);
        const mouse = createVector(mouseX, mouseY).div(scale).sub(translation); 
        
        // todo: works but can probably by simplified!
        return (
            (point.x > x && point.x < mouse.x && point.y > y && point.y < mouse.y) ||
            (point.x < x && point.x > mouse.x && point.y < y && point.y > mouse.y) ||
            (point.x > x && point.x < mouse.x && point.y < y && point.y > mouse.y) ||
            (point.x < x && point.x > mouse.x && point.y > y && point.y < mouse.y)
        );
    }

    public draw() {
        if (!this.dragSelectionOrigin) return;
        
        push();
        fill(this.dragSelectionColor);
        noStroke();
        const { x, y } = this.dragSelectionOrigin;
        rect(x, y, mouseX - x, mouseY - y);
        pop();
    }
}