interface ISelection {
    isDragSelecting: () => boolean;
}

class SelectionHandler extends InputHandler implements ISelection {
    private puzzle: IPuzzle & IGraph;
    private prevMouseIsPressed: boolean;
    private dragSelectionColor: p5.Color;
    private dragSelectionOrigin?: p5.Vector;

    constructor(puzzle: IPuzzle & IGraph) {
        super();
        this.puzzle = puzzle;
        this.prevMouseIsPressed = false;
        this.dragSelectionColor = color('rgba(100,100,100,0.3)')
    }

    public isDragSelecting = () => !!this.dragSelectionOrigin;

    private get selectedPieces(): Piece[] {
        return this.puzzle.pieces.filter(p => p.isSelected);
    }

    public update() {
        this.handlePieceSelection();
        this.handleDragSelection();

        this.setPreviousValues();
    }

    protected setPreviousValues() {
        super.setPreviousValues();
        this.prevMouseIsPressed = mouseIsPressed;
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