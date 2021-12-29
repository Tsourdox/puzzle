class PieceConnector {
    private puzzle: IPuzzle;
    private selectionHandler: ISelectionHandler;
    private transformHandler: ITransformHandler;
    private settings: IReadableSettings;

    constructor(
        puzzle: IPuzzle,
        selectionHandler: ISelectionHandler,
        transformHandler: ITransformHandler,
        settings: IReadableSettings
    ) {
        this.puzzle = puzzle;
        this.selectionHandler = selectionHandler;
        this.transformHandler = transformHandler;
        this.settings = settings;
    }

    public update() {
        this.resetConnectionForSelectedPieces();
        this.checkForConnectedPieces();
    }

    /** Sometimes pieces connects incorrectly, this resets the connections */
    private resetConnectionForSelectedPieces() {
        if (keyIsPressed && keyCode === this.settings.getValue('koppla om bitar')) {
            for (const piece of this.puzzle.selectedPieces) {
                piece.connectedSides = [];
            }
        }
    }

    private checkForConnectedPieces() {
        for (const piece of this.puzzle.pieces) {
            if (piece.isSelected) {
                this.checkPieceConnection(piece, true);
            }
        }
    }

    private checkPieceConnection(piece: Piece, playSound: boolean) {
        const limit = this.puzzle.pieceSize.mag() / 8;
        const length = this.puzzle.pieces.length;
        const { x } = this.puzzle.pieceCount;
        let wasConnected = false;
        
        // Check each side [top, right, bottom, left]
        for (let side = 0; side < 4; side++) {
            // Dont check connected pieces
            if (piece.connectedSides.includes(side)) continue;

            // Dont check outside of puzzle
            const i = this.puzzle.pieces.indexOf(piece)
            if (side === Side.Top && i < x) continue;
            if (side === Side.Right && i % x === x - 1) continue;
            if (side === Side.Bottom && length - i <= x) continue;
            if (side === Side.Left && (length - i) % x === 0) continue;

            // Find adjecentPiece
            const adjecentPiece = getAdjecentPiece(piece, side, this.puzzle);
            
            // Dont check pieces selected by others
            if (adjecentPiece.isSelectedByOther) continue;
            
            // Find matching edges
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
                this.connectPiece(piece, adjecentPiece, side, playSound && !wasConnected);
                wasConnected = true;
            }
        }

        // Check all connected pieces
        if (wasConnected && piece.isSelected) {
            const connectedPieces = getConnectedPieces(piece, this.puzzle);
            connectedPieces.forEach(p => this.checkPieceConnection(p, false));
            this.selectionHandler.select(piece, false);
        }
    }

    private connectPiece(piece: Piece, adjecentPiece: Piece, side: Side, playSound: boolean) {
        // First matching side found
        if (piece.isSelected) {
            // Play click sound
            if (playSound) {
                const index = floor(random(0, sounds.snaps.length));
                sounds.snaps[index].play();
            }
            
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
        adjecentPiece.connectedSides = [...adjecentPiece.connectedSides, oppositeSide];
        piece.connectedSides = [...piece.connectedSides, side];
    }
}