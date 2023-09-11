import p5 from 'p5';
import Piece, { Side } from '../piece';
import { IPuzzle } from '../puzzle';
import { rotatePointAroundCenter } from './general';

/** Sort based on last selected, will not mutate array */
export function sortPieces(
  pieces: ReadonlyArray<Piece>,
  reversed = false,
): Piece[] {
  return [...pieces].sort(
    (a, b) => (a.elevation - b.elevation) * (reversed ? -1 : 1),
  );
}

/** Will get and return connected pieces recusivly */
export function getConnectedPieces(
  piece: Piece,
  puzzle: IPuzzle,
  result: Piece[] = [],
): Piece[] {
  if (result.includes(piece)) return result;

  result.push(piece);
  for (const side of piece.connectedSides) {
    const adjecentPiece = getAdjecentPiece(piece, side, puzzle);
    getConnectedPieces(adjecentPiece, puzzle, result);
  }
  return result;
}

export function getAdjecentPiece(
  piece: Piece,
  side: Side,
  puzzle: IPuzzle,
): Piece {
  const { pieces, pieceCount } = puzzle;
  const { x } = pieceCount;
  const i = pieces.indexOf(piece);

  let adjecentPiece!: Piece;
  if (side === Side.Top) adjecentPiece = pieces[i - x];
  if (side === Side.Right) adjecentPiece = pieces[i + 1];
  if (side === Side.Bottom) adjecentPiece = pieces[i + x];
  if (side === Side.Left) adjecentPiece = pieces[i - 1];

  return adjecentPiece;
}

/** Rotate a piece around a center point by applying translation */
export function rotateAroundCenter(
  piece: Piece,
  rotationCenter: p5.Vector,
  angle: number,
) {
  const pieceCenter = piece.getTrueCenter();
  const centerA = rotatePointAroundCenter(pieceCenter, rotationCenter, angle);
  const centerB = rotatePointAroundCenter(pieceCenter, pieceCenter, angle);

  const deltaCenter = p5.Vector.sub(centerB, centerA);
  piece.translation = p5.Vector.sub(piece.translation, deltaCenter);
  piece.rotation = piece.rotation + angle;
}
