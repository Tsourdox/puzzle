interface ISelectionHandler {
    isDragSelecting: boolean;
    select(piece: Piece, value: boolean): void;
}

class SelectionHandler implements ISelectionHandler {
    private puzzle: IPuzzle;
    private graph: IGraph;
    private prevMouseIsPressed: boolean;
    private dragSelectionFill: p5.Color;
    private dragSelectionStroke: p5.Color;
    private timeSincePress: number;
    private dragSelectionOrigin?: p5.Vector;

    constructor(puzzle: IPuzzle, graph: IGraph) {
        this.puzzle = puzzle;
        this.graph = graph;
        this.prevMouseIsPressed = false;
        this.dragSelectionFill = color('rgba(200,200,200,0.3)');
        this.dragSelectionStroke = color('rgba(255,255,255,0.6)');
        this.timeSincePress = 0;
    }

    public get isDragSelecting(): boolean {
        if (!this.dragSelectionOrigin) return false;
        const enoughTimePassed = this.timeSincePress > 200;
        const moved = createVector(mouseX, mouseY).dist(this.dragSelectionOrigin);
        const enoughDistMoved = moved > 10;
        return enoughTimePassed || enoughDistMoved;
    }

    private get selectedPieces(): Piece[] {
        return this.puzzle.pieces.filter(p => p.isSelected);
    }

    public update() {
        this.handlePieceSelection();
        this.handleDragSelection();
        this.prevMouseIsPressed = mouseIsPressed;
    }

    private handleDragSelection() {
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        const didRelease = this.prevMouseIsPressed && !mouseIsPressed;
        
        if (didPress && mouseButton === LEFT) {
            const mouseOverAnyPiece = this.isMouseOverAnyPiece(this.puzzle.pieces);
            if (!mouseOverAnyPiece || keyIsDown(SHIFT)) {
                this.dragSelectionOrigin = createVector(mouseX, mouseY);
            }
        }

        if (didRelease) {
            this.timeSincePress = 0;
            delete this.dragSelectionOrigin;
        }

        if (this.dragSelectionOrigin) {
            this.timeSincePress += deltaTime;
        }
    }

    private handlePieceSelection() {
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        
        // Select by clicking
        if (didPress && mouseButton === LEFT) {
            const mouseOverSelectedPiece = this.isMouseOverAnyPiece(this.selectedPieces);
            
            for (const piece of sortPieces(this.puzzle.pieces, true)) {
                if (this.isMouseOverPiece(piece)) {
                    if (keyIsDown(SHIFT)) {
                        this.select(piece, !piece.isSelected);
                    } else {
                        this.select(piece, true);
                    }
                    break;
                }
                if (mouseOverSelectedPiece || keyIsDown(SHIFT)) {
                    continue;
                }
                this.select(piece, false);
            }
        }

        // Select by dragging
        if (this.isDragSelecting) {
            const chekedPieces: Piece[] = []
            for (const piece of this.puzzle.pieces) {
                if (chekedPieces.includes(piece)) continue;
                
                // Check all connected pieces at the same time!
                const connectedPieces = getConnectedPieces(piece, this.puzzle);
                let selectionIsOverAnyConnectedPiece = false;
                for (const cp of connectedPieces) {
                    if (this.isDragSelectionOverPiece(cp)) {
                        selectionIsOverAnyConnectedPiece = true;
                        break;
                    }
                }
                chekedPieces.push(...connectedPieces);
                
                if (keyIsDown(SHIFT)) {
                    this.select(piece, piece.isSelected || selectionIsOverAnyConnectedPiece);
                } else {
                    this.select(piece, selectionIsOverAnyConnectedPiece);
                }
            }
        }
        
        // Deselect
        if (keyIsDown(ESCAPE)) { 
            for (const piece of this.selectedPieces) {
                this.select(piece, false);
            }
        }
    }

    /** Will select connected pieces recursively */
    public select(piece: Piece, value: boolean) {
        const maxElev = max(this.puzzle.pieces.map(p => p.elevation))
        const pieces = getConnectedPieces(piece, this.puzzle);
        pieces.forEach(piece => {
            piece.isSelected = value;
            if (value) {
                piece.elevation = maxElev + 1;
            }
        });
    }

    private isMouseOverAnyPiece(pieces: ReadonlyArray<Piece>) {
        let mouseOverPiece = false;
        for (const piece of pieces) {
            if (this.isMouseOverPiece(piece)) {
                mouseOverPiece = true;
                break;
            }
        }
        return mouseOverPiece;
    }

    private isMouseOverPiece(piece: Piece) {
        const { scale, translation } = this.graph;
        const mouse = createVector(mouseX, mouseY).div(scale).sub(translation);
        const corners = piece.getTrueCorners();
        return this.isPointInsideRect(mouse, corners)
    }

    private isDragSelectionOverPiece(piece: Piece): boolean {
        const { scale, translation } = this.graph;
        const dsOrigin = p5.Vector.div(this.dragSelectionOrigin!, scale).sub(translation);
        const mouse = createVector(mouseX, mouseY).div(scale).sub(translation);

        const dragSelectionCorners = [
            dsOrigin, // topLeft
            createVector(mouse.x, dsOrigin.y), // topRight
            mouse, // bottomRight
            createVector(dsOrigin.x, mouse.y) // bottomLeft
        ]
        const pieceCorners = piece.getTrueCorners();
        
        for (const corner of dragSelectionCorners) {
            if (this.isPointInsideRect(corner, pieceCorners)) {
                return true;
            }
        }
        for (const corner of pieceCorners) {
            if (this.isPointInsideRect(corner, dragSelectionCorners)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Premise: if a point lies on the same side of each of a rect sides, it is inside.
     * @param rect array of corners [topLeft, topRight, bottomRight, bottomLeft]
     */
    private isPointInsideRect(point: p5.Vector, rect: p5.Vector[]) {
        const locations = [];
        for (let i = 0; i < 4; i++) {
            const start = rect[i];
            const end = rect[(i + 1) % 4];
            
            const line: Line = { start, end };
            locations[i] = pointSideLocationOfLine(point, line);
        }

        const locationSum = sum(...locations);
        if (locationSum === -4 || locationSum === 4 ) {
            return true;
        }
        return false;
    }

    public draw() {
        if (!this.isDragSelecting) return;
        
        push();
        fill(this.dragSelectionFill);
        stroke(this.dragSelectionStroke);
        const { x, y } = this.dragSelectionOrigin!;
        rect(x, y, mouseX - x, mouseY - y);
        pop();
    }
}