class InputHandler {
    private selectedPieces: Piece[];
    private cellSize: p5.Vector;
    private prevMouseIsPressed: boolean;
    private prevSpaceIsPressed: boolean;
    private prevEnterIsPressed: boolean;

    constructor(cellSize: p5.Vector) {
        this.selectedPieces = [];
        this.cellSize = cellSize;
        this.prevMouseIsPressed = false;
        this.prevSpaceIsPressed = false;
        this.prevEnterIsPressed = false;
    }

    public update(pieces: Piece[]) {
        this.handleMouseInput(pieces);
        this.handleKeyobardInput();

        // todo: rotate pieces as group instead of individually

        for (const piece of this.selectedPieces) {
            if (piece.isSelected) {
                piece.rotation += scrollDelta * 0.01;
            }
            if (mouseIsPressed) {
                piece.translation.x += movedX;
                piece.translation.y += movedY;
            }
        }

        // Set current values last in update!
        this.prevMouseIsPressed = mouseIsPressed;
        this.prevSpaceIsPressed = keyIsDown(SPACE);
        this.prevEnterIsPressed = keyIsDown(ENTER);
    }

    private handleMouseInput(pieces: Piece[]) {
        const didPress = !this.prevMouseIsPressed && mouseIsPressed;
        if (didPress) {
            for (const piece of pieces) {
                const isMouseOver = piece.isMouseOver();
                if (keyIsDown(ALT)) {
                    if (isMouseOver) {
                        piece.isSelected = true;
                    }
                } else {
                    piece.isSelected = isMouseOver;
                }
            }
            this.selectedPieces = pieces.filter(p => p.isSelected);
        }
    }

    private handleKeyobardInput() {
        // Selection
        if (keyIsDown(BACKSPACE)) { 
            for (const piece of this.selectedPieces) {
                piece.isSelected = false;
            }
        }
        if (keyIsDown(SPACE) && !this.prevSpaceIsPressed) {
            this.explodePieces();
        }
        if (keyIsDown(ENTER) && !this.prevEnterIsPressed) {
            this.stackPieces();
        }
        
        // Rotation
        if (keyIsDown(COMMA)) {
            this.rotatePieces(-0.05);
        }
        if (keyIsDown(DOT)) {
            this.rotatePieces(0.05);
        }
        // Translation
        if (keyIsDown(LEFT_ARROW)) {
            this.translatePieces(-5, 0);
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.translatePieces(5, 0);
        }
        if (keyIsDown(UP_ARROW)) {
            this.translatePieces(0, -5);
        }
        if (keyIsDown(DOWN_ARROW)) {
            this.translatePieces(0, 5);
        }
    }

    private rotatePieces(angle: number) {
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