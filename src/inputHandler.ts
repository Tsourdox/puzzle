class InputHandler {
    private graph: IGraph;
    private selectedPieces: Piece[];
    private cellSize: p5.Vector;
    private prevMouseIsPressed: boolean;
    private prevSpaceIsPressed: boolean;
    private prevEnterIsPressed: boolean;
    private prevMouseX: number;
    private prevMouseY: number;
    private scrollSensitivity: number;


    constructor(graph: IGraph, cellSize: p5.Vector) {
        this.graph = graph;
        this.selectedPieces = [];
        this.cellSize = cellSize;
        this.prevMouseIsPressed = false;
        this.prevSpaceIsPressed = false;
        this.prevEnterIsPressed = false;
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
        this.scrollSensitivity = 1;
    }

    public update(pieces: ReadonlyArray<Piece>) {
        this.handleGraphScaleAndTranslation();
        this.handlePieceSelection(pieces);
        this.handlePieceRotation();
        this.handlePieceTranslation();
        this.handlePieceExploding();

        // Set previous values last in update!
        this.setPreviousValues();
    }

    private handleGraphScaleAndTranslation() {
        if (!keyIsDown(ALT) && scrollDelta !== 0) {
            this.graph.scale *= 1 + scrollDelta * 0.005 * this.scrollSensitivity
        }
    }

    private setPreviousValues() {
        this.prevMouseIsPressed = mouseIsPressed;
        this.prevSpaceIsPressed = keyIsDown(SPACE);
        this.prevEnterIsPressed = keyIsDown(ENTER);
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
        if (mouseIsPressed) {
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

    private handlePieceSelection(pieces: ReadonlyArray<Piece>) {
        // Select
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        if (didPress) {
            for (const piece of pieces) {
                const isMouseOver = piece.isMouseOver(this.graph.scale);
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
        
        // Deselect
        if (keyIsDown(ESCAPE)) { 
            for (const piece of this.selectedPieces) {
                piece.isSelected = false;
            }
        }
    }

    private handlePieceExploding() {
        if (keyIsDown(SPACE) && !this.prevSpaceIsPressed) {
            this.explodePieces();
        }
        if (keyIsDown(ENTER) && !this.prevEnterIsPressed) {
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
    
    private explodePieces() {
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

    private stackPieces() {
        const group = this.getPiecesCenter();

        for (const piece of this.selectedPieces) {
            const center = piece.getTruePosition();
            const deltaX = (group.x - center.x ) / 1;
            const deltaY = (group.y - center.y ) / 1;
            piece.translation.x += deltaX;
            piece.translation.y += deltaY;
        }
    }

    private getPiecesCenter() {
        const pieces = this.selectedPieces
        var x = pieces.map(p => p.getTruePosition().x);
        var y = pieces.map(p => p.getTruePosition().y);
        
        // avg: sum / length
        var centerX = x.reduce((a,b) => (a+b), 0) / x.length;
        var centerY = y.reduce((a,b) => (a+b), 0) / y.length;
        return { x: centerX, y: centerY };
    }
}