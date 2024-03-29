import p5 from 'p5';
import Piece from '../piece';
import type { IPuzzle } from '../puzzle';
import { Line, pointSideLocationOfLine, sum } from '../utils/general';
import { getConnectedPieces, sortPieces } from '../utils/pieces';
import { ISettingsMap, settings } from '../utils/settings';
import type { IGraph } from './graphHandler';

export interface ISelectionHandler {
  isDragSelecting: boolean;
  select(piece: Piece, value: boolean): void;
}

export default class SelectionHandler implements ISelectionHandler {
  private puzzle: IPuzzle;
  private graph: IGraph;
  private prevMouseIsPressed: boolean;
  private mouseIsPressed: boolean;
  private dragSelectionFill: p5.Color;
  private dragSelectionStroke: p5.Color;
  private timeSincePress: number;
  private dragSelectionOrigin?: p5.Vector;
  private settings: ISettingsMap;
  private pressDelay: number;

  constructor(puzzle: IPuzzle, graph: IGraph) {
    this.puzzle = puzzle;
    this.graph = graph;
    this.settings = settings;
    this.prevMouseIsPressed = false;
    this.mouseIsPressed = false;
    this.dragSelectionFill = puzzle.p.color('rgba(200,200,200,0.3)');
    this.dragSelectionStroke = puzzle.p.color('rgba(255,255,255,0.6)');
    this.timeSincePress = 0;
    this.pressDelay = 30;
  }

  public get isDragSelecting(): boolean {
    const { p } = this.puzzle;
    if (!this.dragSelectionOrigin) return false;
    const enoughTimePassed = this.timeSincePress > 200;
    const moved = p.createVector(p.mouseX, p.mouseY).dist(this.dragSelectionOrigin);
    const enoughDistMoved = moved > 10;
    return enoughTimePassed || enoughDistMoved;
  }

  public update() {
    const { p } = this.puzzle;
    this.mouseIsPressed = this.timeSincePress > this.pressDelay && p.mouseIsPressed;

    this.handlePieceSelection();
    this.handleDragSelection();

    if (p.mouseIsPressed) {
      this.timeSincePress += p.deltaTime;
    } else {
      delete this.dragSelectionOrigin;
      this.timeSincePress = 0;
    }

    this.prevMouseIsPressed = this.mouseIsPressed;
  }

  private handleDragSelection() {
    const { p } = this.puzzle;
    if (p.touches.length > 1) delete this.dragSelectionOrigin;

    const didPress = !this.prevMouseIsPressed && this.mouseIsPressed;

    if (didPress && (p.mouseButton === p.LEFT || p.touches.length)) {
      const mouseOverAnyPiece = this.isMouseOverAnyPiece(this.puzzle.pieces);
      if (!mouseOverAnyPiece || p.keyIsDown(this.settings['markera fler'])) {
        this.dragSelectionOrigin = p.createVector(p.mouseX, p.mouseY);
      }
    }
  }

  private handlePieceSelection() {
    const { p } = this.puzzle;
    const didPress = !this.prevMouseIsPressed && p.mouseIsPressed;
    if (p.touches.length > 1 || this.timeSincePress < this.pressDelay) return;

    // Select by clicking
    if (didPress && (p.mouseButton === p.LEFT || p.touches.length)) {
      // Deselection
      if (this.puzzle.selectedPieces.length) {
        const selectMore = p.keyIsDown(this.settings['markera fler']);
        const mouseOverSelectedPiece = this.isMouseOverAnyPiece(this.puzzle.selectedPieces);
        if (!mouseOverSelectedPiece && !selectMore) {
          this.deselectAllPieces();
        }
      }

      // Selection
      for (const piece of sortPieces(this.puzzle.pieces, true)) {
        if (this.isMouseOverPiece(piece)) {
          if (piece.isSelectedByOther) continue;
          if (p.keyIsDown(this.settings['markera fler'])) {
            this.select(piece, !piece.isSelected);
          } else {
            this.select(piece, true);
          }
          break;
        }
      }
    }

    // Select by dragging
    if (this.isDragSelecting) {
      const checkedPieces: Piece[] = [];
      for (const piece of this.puzzle.pieces) {
        if (checkedPieces.includes(piece)) continue;

        // Check all connected pieces at the same time!
        const connectedPieces = getConnectedPieces(piece, this.puzzle);
        let selectionIsOverAnyConnectedPiece = false;
        for (const cp of connectedPieces) {
          if (this.isDragSelectionOverPiece(cp)) {
            selectionIsOverAnyConnectedPiece = true;
            break;
          }
        }
        checkedPieces.push(...connectedPieces);

        if (p.keyIsDown(this.settings['markera fler'])) {
          this.select(piece, piece.isSelected || selectionIsOverAnyConnectedPiece);
        } else {
          this.select(piece, selectionIsOverAnyConnectedPiece);
        }
      }
    }

    // Deselect
    if (p.keyIsDown(p.ESCAPE)) {
      for (const piece of this.puzzle.selectedPieces) {
        this.select(piece, false);
      }
    }
  }

  private deselectAllPieces() {
    for (const piece of this.puzzle.selectedPieces) {
      piece.isSelected = false;
    }

    // Sync with React Store
    this.puzzle.dispatch({
      type: 'SET_PUZZLE_PIECE_ACTIONS',
      payload: false,
    });
  }

  /** Will select connected pieces recursively */
  public select(piece: Piece, value: boolean) {
    const { p } = this.puzzle;
    const maxElev = p.max(this.puzzle.pieces.map((p) => p.elevation));
    const pieces = getConnectedPieces(piece, this.puzzle);
    pieces.forEach((piece) => {
      piece.isSelected = value;
      if (piece.isSelected) {
        piece.elevation = maxElev + 1;
      }
    });

    // Sync with React Store
    const selectedPieces = this.puzzle.selectedPieces;
    this.puzzle.dispatch({
      type: 'SET_PUZZLE_PIECE_ACTIONS',
      payload: Boolean(selectedPieces.length),
    });
  }

  private isMouseOverAnyPiece(pieces: ReadonlyArray<Piece>) {
    let mouseOverPiece = false;
    for (const piece of pieces) {
      if (this.isMouseOverPiece(piece)) {
        mouseOverPiece = true;
        break;
      }
    }
    return mouseOverPiece;
  }

  private isMouseOverPiece(piece: Piece) {
    const { p } = this.puzzle;
    const { scale, translation } = this.graph;
    const mouse = p.createVector(p.mouseX, p.mouseY).div(scale).sub(translation);
    const corners = piece.getTrueCorners();
    return this.isPointInsideRect(mouse, corners);
  }

  private isDragSelectionOverPiece(piece: Piece): boolean {
    const { p } = this.puzzle;
    const { scale, translation } = this.graph;
    const dsOrigin = this.dragSelectionOrigin!.copy().div(scale).sub(translation);
    const mouse = p.createVector(p.mouseX, p.mouseY).div(scale).sub(translation);

    const dragSelectionCorners = [
      dsOrigin, // topLeft
      p.createVector(mouse.x, dsOrigin.y), // topRight
      mouse, // bottomRight
      p.createVector(dsOrigin.x, mouse.y), // bottomLeft
    ];
    const pieceCorners = piece.getTrueCorners();

    for (const corner of dragSelectionCorners) {
      if (this.isPointInsideRect(corner, pieceCorners)) {
        return true;
      }
    }
    for (const corner of pieceCorners) {
      if (this.isPointInsideRect(corner, dragSelectionCorners)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Premise: if a point lies on the same side of each of a rect sides, it is inside.
   * @param rect array of corners [topLeft, topRight, bottomRight, bottomLeft]
   */
  private isPointInsideRect(point: p5.Vector, rect: p5.Vector[]) {
    const locations = [];
    for (let i = 0; i < 4; i++) {
      const start = rect[i];
      const end = rect[(i + 1) % 4];

      const line: Line = { start, end };
      locations[i] = pointSideLocationOfLine(point, line);
    }

    const locationSum = sum(...locations);
    if (locationSum === -4 || locationSum === 4) {
      return true;
    }
    return false;
  }

  public draw() {
    if (!this.isDragSelecting) return;
    const { p } = this.puzzle;

    p.push();
    p.fill(this.dragSelectionFill);
    p.stroke(this.dragSelectionStroke);
    const { x, y } = this.dragSelectionOrigin!;
    p.rect(x, y, p.mouseX - x, p.mouseY - y);
    p.pop();
  }
}
