import p5 from 'p5';
import Piece, { Side } from '../piece';
import { IPuzzle } from '../puzzle';
import { rotatePointAroundCenter } from './general';

/** Sort based on last selected, will not mutate array */
export function sortPieces(pieces: ReadonlyArray<Piece>, reversed = false): Piece[] {
  return [...pieces].sort((a, b) => (a.elevation - b.elevation) * (reversed ? -1 : 1));
}

/** The piece and every piece connected to it, directly or through others */
export function getConnectedPieces(piece: Piece, puzzle: IPuzzle): Piece[] {
  const result = new Set([piece]);
  // A Set's loop also visits what's added during it
  for (const current of result) {
    for (const side of current.connectedSides) {
      const adjacentPiece = getAdjacentPiece(current, side, puzzle);
      if (adjacentPiece) result.add(adjacentPiece);
    }
  }
  return [...result];
}

/** The piece next to `side` in the solved image, if it's not the puzzle's edge */
export function getAdjacentPiece(piece: Piece, side: Side, puzzle: IPuzzle): Piece | undefined {
  const { pieces, pieceCount } = puzzle;
  const { x } = pieceCount;
  // Pieces are kept in grid order, so the id is the index
  const i = piece.id;
  const column = i % x;

  if (side === Side.Top) return pieces[i - x];
  if (side === Side.Right) return column < x - 1 ? pieces[i + 1] : undefined;
  if (side === Side.Bottom) return pieces[i + x];
  if (side === Side.Left) return column > 0 ? pieces[i - 1] : undefined;
  return undefined;
}

/**
 * A connected group is rigid: every piece in it is placed from the group's first piece,
 * at its spot in the solved image. So however updates arrive (rounded, lerping, racing),
 * connected pieces can't drift apart or lock in a wrong spot, and every player derives
 * the same positions from the same pieces.
 */
export function alignGroups(puzzle: IPuzzle) {
  // An edge is connected when either piece says so; an update may carry only one of them
  for (const piece of puzzle.pieces) {
    for (const side of piece.connectedSides) {
      getAdjacentPiece(piece, side, puzzle)?.addConnectedSide((side + 2) % 4);
    }
  }

  const aligned = new Set<Piece>();
  for (const anchor of puzzle.pieces) {
    if (aligned.has(anchor) || !anchor.connectedSides.length) continue;
    for (const piece of getConnectedPieces(anchor, puzzle)) {
      aligned.add(piece);
      piece.alignTo(anchor);
    }
  }
}

/** Rotate a piece around a center point by applying translation */
export function rotateAroundCenter(piece: Piece, rotationCenter: p5.Vector, angle: number) {
  const pieceCenter = piece.getTrueCenter();
  const centerA = rotatePointAroundCenter(pieceCenter, rotationCenter, angle);
  const centerB = rotatePointAroundCenter(pieceCenter, pieceCenter, angle);

  const deltaCenter = p5.Vector.sub(centerB, centerA);
  piece.translation = p5.Vector.sub(piece.translation, deltaCenter);
  piece.rotation = piece.rotation + angle;
}
