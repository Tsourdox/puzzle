import Piece, { Sides } from './piece';
import { angleBetween } from './utils/general';

export default class PiecesFactory {
  private p: p5;
  private puzzleSize: p5.Vector;
  private cellSize: p5.Vector;
  private grid: p5.Vector[][];
  private image: p5.Image;
  private offset: number;
  public seed: number;

  constructor(p: p5, x: number, y: number, image: p5.Image, seed?: number) {
    this.p = p;
    this.puzzleSize = this.p.createVector(x, y);
    this.cellSize = this.p.createVector(image.width / x, image.height / y);
    this.grid = [];
    this.image = image;
    this.offset = this.cellSize.mag() / 12;
    this.seed = seed || this.p.floor(this.p.random(0, 100));
    this.p.randomSeed(this.seed);

    this.createGrid();
    this.offsetPoints();
  }

  public createAllPieces(preventModifyFlag?: boolean): Piece[] {
    try {
      const p = this.p;
      const pieces: Piece[] = [];
      const offset = this.offset * 4;

      const w = this.image.width;
      const h = this.image.height;

      // Create offset around image before croping piece-images,
      // because Safari makes edge pieces transparent.
      // For some reason offset * 2 is not enough, why?
      const imageWithOffset = p.createImage(
        p.round(w + offset * 3),
        p.round(h + offset * 3),
      );
      imageWithOffset.copy(
        this.image,
        0,
        0,
        w,
        h,
        p.round(offset),
        p.round(offset),
        w,
        h,
      );

      for (const sides of this.generatePiecesOutlines()) {
        const origin = sides.top[0];
        const pieceX = p.round(origin.x);
        const pieceY = p.round(origin.y);
        const pieceW = p.round(this.cellSize.x + offset * 2);
        const pieceH = p.round(this.cellSize.y + offset * 2);

        const image = imageWithOffset.get(pieceX, pieceY, pieceW, pieceH);
        const id = pieces.length; // array index
        const piece = new Piece(
          id,
          image,
          origin,
          this.cellSize,
          sides,
          offset,
        );
        pieces.push(piece);
      }

      this.shufflePieces(pieces);
      if (preventModifyFlag) {
        pieces.forEach((p) => (p.isModified = false));
      }

      return pieces;
    } catch (error) {
      console.error('Could not create all pieces', error);
      return [];
    }
  }

  private generatePiecesOutlines() {
    const sidesList: Sides[] = [];

    for (let y = 0; y < this.puzzleSize.y; y++) {
      for (let x = 0; x < this.puzzleSize.x; x++) {
        // All corners
        const origin = this.grid[x][y];
        const right = this.grid[x + 1][y];
        const bottom = this.grid[x][y + 1];
        const diagonal = this.grid[x + 1][y + 1];

        // Create sides based on the corners
        // todo: we need more points!! (ok for now)
        const sides = {
          top: [origin, right],
          right: [right, diagonal],
          bottom: [diagonal, bottom],
          left: [bottom, origin],
        };

        // todo: adding a few more points, still need more...
        this.generateSidePoints(sides.top, 'top', x, y, sidesList);
        this.generateSidePoints(sides.right, 'right', x, y, sidesList);
        this.generateSidePoints(sides.bottom, 'bottom', x, y, sidesList);
        this.generateSidePoints(sides.left, 'left', x, y, sidesList);

        sidesList.push(sides);
      }
    }

    return sidesList;
  }

  private generateSidePoints(
    side: p5.Vector[],
    edge: 'top' | 'right' | 'bottom' | 'left',
    x: number,
    y: number,
    sides: Sides[],
  ) {
    const abovePieceIndex = (y - 1) * this.puzzleSize.x + x;
    const leftPieceIndex = y * this.puzzleSize.x + (x - 1);

    if (edge === 'bottom' && y === this.puzzleSize.y - 1) return;
    if (edge === 'right' && x === this.puzzleSize.x - 1) return;

    if (edge === 'top') {
      if (y === 0) return;
      // Clone bottom side from above piece to match it.
      const newSide = sides[abovePieceIndex].bottom.map((vector) =>
        vector.copy(),
      );
      newSide.reverse();
      side.splice(0, 2, ...newSide);
      return;
    }
    if (edge === 'left') {
      if (x === 0) return;
      // Clone right side from piece on the left to match it.
      const newSide = sides[leftPieceIndex].right.map((vector) =>
        vector.copy(),
      );
      newSide.reverse();
      side.splice(0, 2, ...newSide);
      return;
    }
    const newSide = this.createCurve(side[0], side[1]);
    side.splice(0, 2, ...newSide);
  }

  /**
   * Creates the curve by adding 2 control points to each end (v0, v1) and 3 bezier points
   * (a pair of 1 origin and 2 control points) in the middle of the array.
   * The direction or in other words - bay or headland for a puzzle piece, is randomed.
   * Each point has some slight randomness to it's position to make
   * the whole curve a bit random.
   *
   * @returns a curve as a series of points.
   */
  private createCurve(v0: p5.Vector, v1: p5.Vector): p5.Vector[] {
    const p = this.p;
    const distance = this.cellSize.mag() * 0.6;
    const angle = angleBetween(v0, v1);
    const distVariation = p.random(-distance * 0.05, distance * 0.05);

    const mid = p.createVector(
      p.lerp(v0.x, v1.x, 0.5 + p.random(-0.07, 0.07)),
      p.lerp(v0.y, v1.y, 0.5 + p.random(-0.07, 0.07)),
    );

    // Bay or headland?
    const direction = p.random() > 0.5 ? 1 : -1;

    const farAngle = angle - Math.PI * 0.5 * direction + p.random(-0.1, 0.1);
    const far = p.createVector(
      mid.x + Math.cos(farAngle) * distance * 0.3 + distVariation,
      mid.y + Math.sin(farAngle) * distance * 0.3 + distVariation,
    );
    const farBezier = this.createBezierPoint(
      far,
      angle + Math.PI + p.random(-0.4, 0.4),
      distance * 0.15 * p.random(1, 2),
    );

    const b1Angle = farAngle - Math.PI * 0.4 * direction + p.random(-0.1, 0.1);
    const b1 = p.createVector(
      mid.x + Math.cos(b1Angle) * distance * 0.1 + distVariation,
      mid.y + Math.sin(b1Angle) * distance * 0.1 + distVariation,
    );
    const bezier1 = this.createBezierPoint(
      b1,
      angle + Math.PI * 0.3 * direction + p.random(-0.2, 0.2),
      distance * 0.5 * p.random(0.1, 0.2),
    );

    const b2Angle = farAngle + Math.PI * 0.4 * direction + p.random(-0.1, 0.1);
    const b2 = p.createVector(
      mid.x + Math.cos(b2Angle) * distance * 0.1 + distVariation,
      mid.y + Math.sin(b2Angle) * distance * 0.1 + distVariation,
    );
    const bezier2 = this.createBezierPoint(
      b2,
      angle - Math.PI * 0.3 * direction + p.random(-0.2, 0.2),
      distance * 0.5 * p.random(0.1, 0.2),
    );

    const c0 = p.createVector(p.lerp(v0.x, v1.x, 0.2), p.lerp(v0.y, v1.y, 0.2));
    const c1 = p.createVector(p.lerp(v0.x, v1.x, 0.8), p.lerp(v0.y, v1.y, 0.8));

    return [v0, c0, ...bezier1, ...farBezier, ...bezier2, c1, v1];
  }

  private createBezierPoint(
    origin: p5.Vector,
    rotation: number,
    magnitude: number,
  ) {
    const p = this.p;
    const c1 = p.createVector(
      origin.x + magnitude * Math.cos(rotation),
      origin.y + magnitude * Math.sin(rotation),
    );
    const c2 = p.createVector(
      origin.x - magnitude * Math.cos(rotation),
      origin.y - magnitude * Math.sin(rotation),
    );
    return [c1, origin, c2];
  }

  private shufflePieces(pieces: Piece[]) {
    const p = this.p;
    const locations = pieces.map((p) => p.getOrigin());

    for (const piece of pieces) {
      // Translate
      const randomIndex = p.random(0, locations.length);
      const location = locations.splice(randomIndex, 1)[0];
      const delta = p5.Vector.sub(location, piece.getOrigin());
      piece.translation = delta;

      // Rotate
      piece.rotation = p.random(0, PI * 2);
    }
  }

  private createGrid() {
    for (let x = 0; x <= this.puzzleSize.x; x++) {
      // create an array for y values
      this.grid[x] = [];

      for (let y = 0; y <= this.puzzleSize.y; y++) {
        this.grid[x][y] = this.p.createVector(
          this.cellSize.x * x,
          this.cellSize.y * y,
        );
      }
    }
  }

  private offsetPoints() {
    for (let x = 0; x <= this.puzzleSize.x; x++) {
      for (let y = 0; y <= this.puzzleSize.y; y++) {
        const gridPoint = this.grid[x][y];
        if (x !== 0 && x !== this.puzzleSize.x) {
          gridPoint.x += this.p.random(-this.offset, this.offset);
        }
        if (y !== 0 && y !== this.puzzleSize.y) {
          gridPoint.y += this.p.random(-this.offset, this.offset);
        }
      }
    }
  }
}
