import p5 from 'p5';
import Piece from '../piece';
import type { IPuzzle } from '../puzzle';
import { angleBetween, getAverageCenter, getMostDistantPoints } from '../utils/general';
import { getConnectedPieces, rotateAroundCenter } from '../utils/pieces';
import { ISettingsMap, settings } from '../utils/settings';
import type { IGraph } from './graphHandler';
import type { Touches } from './inputHandler';
import type { ISelectionHandler } from './selectionHandler';

export interface ITransformHandler {
  rotatePiece(piece: Piece, angle: number): void;
  translatePiece(piece: Piece, translation: p5.Vector): void;
}

export default class TransformHandler implements ITransformHandler {
  private puzzle: IPuzzle;
  private graph: IGraph;
  private selection: ISelectionHandler;
  private stackKeyPrevDown: boolean;
  private explodeKeyPrevDown: boolean;
  private settings: ISettingsMap;

  constructor(puzzle: IPuzzle, graph: IGraph, selection: ISelectionHandler) {
    this.puzzle = puzzle;
    this.graph = graph;
    this.selection = selection;
    this.settings = settings;
    this.stackKeyPrevDown = false;
    this.explodeKeyPrevDown = false;
  }

  private get selectedPieces(): Piece[] {
    return this.puzzle.pieces.filter((p) => p.isSelected);
  }

  public update(prevMouse: p5.Vector, prevTouches: Touches, scrollDelta: number) {
    this.handlePieceRotation(prevTouches, scrollDelta);
    this.handlePieceTranslation(prevMouse, prevTouches);
    this.handlePieceExploding();
    this.setPreviousValues();
  }

  protected setPreviousValues() {
    const { p } = this.puzzle;
    this.stackKeyPrevDown = p.keyIsDown(this.settings['stapla bitar']);
    this.explodeKeyPrevDown = p.keyIsDown(this.settings['sprid bitar']);
  }

  /** Will also rotate connected pieces */
  public rotatePiece(piece: Piece, angle: number) {
    const pieces = getConnectedPieces(piece, this.puzzle);
    const centeres = pieces.map((p) => p.getTrueCenter());
    const averageCenter = getAverageCenter(this.puzzle.p, centeres);

    for (const piece of pieces) {
      rotateAroundCenter(piece, averageCenter, angle);
    }
  }

  /** Will also translate connected pieces */
  public translatePiece(piece: Piece, translation: p5.Vector) {
    const pieces = getConnectedPieces(piece, this.puzzle);
    pieces.forEach((p) => (p.translation = p5.Vector.add(p.translation, translation)));
  }

  private handlePieceTranslation(prevMouse: p5.Vector, prevTouches: Touches) {
    const { p } = this.puzzle;
    // Wait to next frame when input is touch
    if (p.touches.length && !prevTouches.length) return;
    // Dont move pieces when using multi touch gestures
    if (p.touches.length > 1) return;

    // Dragging with mouse or touch
    const isMassSelecting = p.keyIsDown(this.settings['markera fler']);
    if (
      ((p.mouseIsPressed && p.mouseButton === p.LEFT) || p.touches.length) &&
      !this.selection.isDragSelecting &&
      !isMassSelecting
    ) {
      if (p.touches.length !== prevTouches.length) return;

      const movedX = (p.mouseX - prevMouse.x) / this.graph.scale;
      const movedY = (p.mouseY - prevMouse.y) / this.graph.scale;
      this.translatePieces(movedX, movedY);
    }
  }

  private handlePieceRotation(prevTouches: Touches, scrollDelta: number) {
    const { p } = this.puzzle;
    // Keyboard
    const userSpeed = this.settings['rotationshastighet'];
    const rotation = (2 / p.frameRate()) * userSpeed;
    if (p.keyIsDown(this.settings['rotera vänster'])) {
      this.rotatePieces(-rotation);
    }
    if (p.keyIsDown(this.settings['rotera höger'])) {
      this.rotatePieces(rotation);
    }

    // Touch
    if (prevTouches.length === 2 && p.touches.length === 2) {
      const [t1, t2] = getMostDistantPoints(p, ...(p.touches as Touches));
      const [p1, p2] = getMostDistantPoints(p, ...prevTouches);
      const angle = angleBetween(t1, t2);
      const prevAngle = angleBetween(p1, p2);
      this.rotatePieces((angle - prevAngle) * 3 * userSpeed);
    }

    // Scroll
    if (this.puzzle.selectedPieces && scrollDelta) {
      const normalizedScrollDelta = p.min(20, p.max(-20, scrollDelta));
      const rotation = normalizedScrollDelta * 0.01 * userSpeed;
      this.rotatePieces(rotation);
    }
  }

  private handlePieceExploding() {
    const { p } = this.puzzle;
    if (p.keyIsDown(this.settings['sprid bitar']) && !this.explodeKeyPrevDown) {
      this.explodePieces();
    }
    if (p.keyIsDown(this.settings['stapla bitar']) && !this.stackKeyPrevDown) {
      this.stackPieces();
    }
  }

  private rotatePieces(angle: number) {
    const centeres = this.selectedPieces.map((p) => p.getTrueCenter());
    const averageCenter = getAverageCenter(this.puzzle.p, centeres);

    for (const piece of this.selectedPieces) {
      rotateAroundCenter(piece, averageCenter, angle);
    }
  }

  private translatePieces(x: number, y: number) {
    const { p } = this.puzzle;
    for (const piece of this.selectedPieces) {
      piece.translation = p.createVector(x, y).add(piece.translation);
    }
  }

  private explodePieces() {
    const { p } = this.puzzle;
    const pieces = this.selectedPieces;
    if (pieces.length <= 1) return;

    // Calculate center of selected pieces
    const centers = pieces.map((piece) => piece.getTrueCenter());
    const groupCenter = getAverageCenter(p, centers);
    const pieceSize = this.puzzle.pieceSize.mag();

    // Check if pieces are stacked (all at approximately same position)
    const maxDistance = Math.max(...centers.map((c) => p5.Vector.dist(c, groupCenter)));
    const areStacked = maxDistance < pieceSize * 0.1; // If all pieces within 10% of piece size

    if (areStacked) {
      // Sort by elevation (which was randomized during stacking)
      // This creates consistent grid arrangement across multiple explode operations
      const sorted = [...pieces].sort((a, b) => a.elevation - b.elevation);

      // Arrange pieces in a grid pattern around the center
      const gridSize = Math.ceil(Math.sqrt(sorted.length));
      const spacing = pieceSize * 0.8; // 80% of piece size - pieces overlap slightly

      for (let i = 0; i < sorted.length; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const offsetX = (col - (gridSize - 1) / 2) * spacing;
        const offsetY = (row - (gridSize - 1) / 2) * spacing;
        const targetPos = p5.Vector.add(groupCenter, p.createVector(offsetX, offsetY));
        const currentPos = sorted[i].getTrueCenter();
        const delta = p5.Vector.sub(targetPos, currentPos);
        this.translatePiece(sorted[i], delta);
      }
    } else {
      // Spread pieces outward from group center, maintaining relative positions
      const explosionFactor = 0.2; // 20% spread outward - gradual expansion
      for (const piece of pieces) {
        const pieceCenter = piece.getTrueCenter();
        const offset = p5.Vector.sub(pieceCenter, groupCenter);
        const explosion = offset.copy().mult(explosionFactor);
        this.translatePiece(piece, explosion);
      }
    }
  }

  private stackPieces() {
    const pieces = this.selectedPieces;
    const centers = pieces.map((p) => p.getTrueCenter());
    const groupCenter = getAverageCenter(this.puzzle.p, centers);

    // Shuffle pieces and assign random elevations (z-order)
    // This prevents revealing the solution when later exploding
    const shuffled = [...pieces].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      const piece = shuffled[i];
      const pieceCenter = piece.getTrueCenter();
      const delta = p5.Vector.sub(groupCenter, pieceCenter);
      this.translatePiece(piece, delta);

      // Assign elevation based on shuffled order
      piece.elevation = i;
    }
  }
}
