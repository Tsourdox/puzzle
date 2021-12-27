class PieceConnector {
    private puzzle: IPuzzle;
    private selectionHandler: ISelectionHandler;
    private transformHandler: ITransformHandler;

    constructor(
        puzzle: IPuzzle,
        selectionHandler: ISelectionHandler,
        transformHandler: ITransformHandler
    ) {
        this.puzzle = puzzle;
        this.selectionHandler = selectionHandler;
        this.transformHandler = transformHandler;
    }

    public update() {
        this.checkForConnectedPieces();
    }

    private checkForConnectedPieces() {
        for (const piece of this.puzzle.pieces) {
            if (piece.isSelected) {
                this.checkPieceConnection(piece);
            }
        }
    }

    private checkPieceConnection(piece: Piece) {
        const limit = this.puzzle.pieceSize.mag() / 8;
        const length = this.puzzle.pieces.length;
        const { x } = this.puzzle.pieceCount;
        
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
                this.connectPieces(piece, adjecentPiece, side);
            }
        }
    }

    private connectPieces(piece: Piece, adjecentPiece: Piece, side: Side) {
        let wasSelected = piece.isSelected;
        // First matching side found
        if (piece.isSelected) {
            // Remove selection & play click sound
            this.selectionHandler.select(piece, false);
            const index = floor(random(0, sounds.snaps.length));
            sounds.snaps[index].play();
            
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

        // Check all connected pieces
        if (wasSelected) {
            const connectedPieces = getConnectedPieces(piece, this.puzzle);
            connectedPieces.forEach(p => this.checkPieceConnection(p));
        }
    }
}