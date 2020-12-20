class InputHandler {
    private graph: IGraph;
    private selectedPieces: Piece[];
    private cellSize: p5.Vector;
    private prevMouseIsPressed: boolean;
    private prevSpaceIsDown: boolean;
    private prevKeyRIsDown: boolean;
    private prevKeyCIsDown: boolean;
    private prevMouseX: number;
    private prevMouseY: number;
    private scrollSensitivity: number;
    private dragRectColor: p5.Color;
    private dragSelectionOrigin?: p5.Vector;

    constructor(graph: IGraph, cellSize: p5.Vector) {
        this.graph = graph;
        this.selectedPieces = [];
        this.cellSize = cellSize;
        this.prevMouseIsPressed = false;
        this.prevSpaceIsDown = false;
        this.prevKeyRIsDown = false;
        this.prevKeyCIsDown = false;
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
        this.scrollSensitivity = 1;
        this.dragRectColor = color('rgba(100,100,100,0.3)')
    }

    public update(pieces: ReadonlyArray<Piece>) {
        this.handleGraphScaleAndTranslation();
        this.handlePieceSelection(pieces);
        this.handleDragSelection();
        this.handlePieceRotation();
        this.handlePieceTranslation();
        this.handlePieceExploding();

        // Set previous values last in update!
        this.setPreviousValues();
    }

    private handleGraphScaleAndTranslation() {
        if (mouseIsPressed && mouseButton === CENTER) {
            // Translate
            const movedX = (mouseX - this.prevMouseX) / this.graph.scale;
            const movedY = (mouseY - this.prevMouseY) / this.graph.scale;
            this.graph.translation.add(movedX, movedY);
        } else {
            // Scale
            if (!keyIsDown(ALT) && scrollDelta !== 0) {
                this.graph.scale *= 1 + scrollDelta * 0.002 * this.scrollSensitivity;
                this.graph.scale = constrain(this.graph.scale, 0.01, 100); 
            }
            if (keyIsDown(KEY_HALF)) this.graph.scale = 0.5;
            if (keyIsDown(KEY_1)) this.graph.scale = 1;
            if (keyIsDown(KEY_2)) this.graph.scale = 2;
            if (keyIsDown(KEY_3)) this.graph.scale = 4;
        }
    }

    private setPreviousValues() {
        this.prevMouseIsPressed = mouseIsPressed;
        this.prevSpaceIsDown = keyIsDown(SPACE);
        this.prevKeyRIsDown = keyIsDown(KEY_R);
        this.prevKeyCIsDown = keyIsDown(KEY_C);
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }

    private handlePieceTranslation() {
        // Keyboard
        const translation = (2 * this.cellSize.mag()) / frameRate();
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
            const movedX = (mouseX - this.prevMouseX) / this.graph.scale;
            const movedY = (mouseY - this.prevMouseY) / this.graph.scale;
            this.translatePieces(movedX, movedY);
        }
    }

    private handlePieceRotation() {
        // Keyboard rotation
        const rotation = 5 / frameRate();
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
        
        if (
            (didPress && mouseButton === LEFT) &&
            (!this.selectedPieces.length || keyIsDown(SHIFT))
        ) {
            this.dragSelectionOrigin = createVector(mouseX, mouseY);
        } else if (didRelease) {
            delete this.dragSelectionOrigin;
        }
    }

    private handlePieceSelection(pieces: ReadonlyArray<Piece>) {
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        
        // Select by clicking
        if (didPress && mouseButton === LEFT) {
            for (const piece of pieces) {
                const isMouseOver = piece.isMouseOver(this.graph);
                if (keyIsDown(SHIFT)) {
                    if (isMouseOver) {
                        piece.isSelected = true;
                    }
                } else {
                    piece.isSelected = isMouseOver;
                }
            }
            this.selectedPieces = pieces.filter(p => p.isSelected);
        }

        // Select by dragging
        if (this.dragSelectionOrigin) {
            for (const piece of pieces) {
                let isOneCornerInside = false;
                for (const corner of piece.getCorners()) {
                    const trueCorner = p5.Vector.add(corner, piece.translation);
                    if (this.isPointInsideDragSelection(trueCorner)) {
                        isOneCornerInside = true;
                    }
                }
                if (keyIsDown(SHIFT)) {
                    piece.isSelected = piece.isSelected || isOneCornerInside;
                } else {
                    piece.isSelected = isOneCornerInside;
                }
            }
            this.selectedPieces = pieces.filter(p => p.isSelected);
        }
        
        // Deselect
        if (keyIsDown(ESCAPE)) { 
            for (const piece of this.selectedPieces) {
                piece.isSelected = false;
            }
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
        const radius = this.cellSize.mag();
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
        const groupCenter = this.getPiecesCenter();

        for (const piece of this.selectedPieces) {
            const pieceCenter = piece.getTruePosition()
            const delta = p5.Vector.sub(groupCenter, pieceCenter);
            piece.translation.add(delta);
        }
    }

    private getPiecesCenter() {
        const pieces = this.selectedPieces
        var x = pieces.map(p => p.getTruePosition().x);
        var y = pieces.map(p => p.getTruePosition().y);
        
        // avg: sum / length
        var centerX = x.reduce((a,b) => (a+b), 0) / x.length;
        var centerY = y.reduce((a,b) => (a+b), 0) / y.length;
        return createVector(centerX,centerY);
    }

    private isPointInsideDragSelection(point: p5.Vector): boolean {
        if (!this.dragSelectionOrigin) return false;

        const { scale, translation } = this.graph;
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
        fill(this.dragRectColor);
        noStroke();
        const { x, y } = this.dragSelectionOrigin;
        rect(x, y, mouseX - x, mouseY - y);
        pop();
    }
}