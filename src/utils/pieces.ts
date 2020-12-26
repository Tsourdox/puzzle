/** Sort based on last selected, will not mutate array */
function sortPieces(pieces: Piece[], reversed = false): Piece[] {
    return [...pieces].sort((a, b) =>
        (a.lastSelected - b.lastSelected) * (reversed ? -1 : 1));
}

/** Will get and return connected pieces recusivly */
function getConnectedPieces(
    piece: Piece,
    puzzle: IPuzzle,
    result: Piece[] = []
): Piece[] {
    if (result.includes(piece)) return result;
    
    result.push(piece)
    
    const { pieces, pieceCount } = puzzle;
    const { x } = pieceCount;
    const i = pieces.indexOf(piece)
    
    for (const s of piece.connectedSides) {
        let adjecentPiece!: Piece;
        if (s === Side.Top) adjecentPiece = pieces[i - x];
        if (s === Side.Right) adjecentPiece = pieces[i + 1];
        if (s === Side.Bottom) adjecentPiece = pieces[i + x];
        if (s === Side.Left) adjecentPiece = pieces[i - 1];

        getConnectedPieces(adjecentPiece, puzzle, result);
    }

    return result;
}