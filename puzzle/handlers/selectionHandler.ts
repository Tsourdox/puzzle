import p5 from 'p5';
import Piece from '../piece';
import type { IPuzzle } from '../puzzle';
import { ISettings } from '../settings';
import { isMouseOverCanvas, Line, pointSideLocationOfLine, sum } from '../utils/general';
import { getConnectedPieces, sortPieces } from '../utils/pieces';
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
  /** Where the current press started (screen coordinates) */
  private pressOrigin?: p5.Vector;
  private dragSelectionOrigin?: p5.Vector;
  private settings: ISettings;
  private pressDelay: number;
  private prevTouchCount: number;

  constructor(puzzle: IPuzzle, graph: IGraph, settings: ISettings) {
    this.puzzle = puzzle;
    this.graph = graph;
    this.settings = settings;
    this.prevMouseIsPressed = false;
    this.mouseIsPressed = false;
    this.dragSelectionFill = puzzle.p.color('rgba(200,200,200,0.3)');
    this.dragSelectionStroke = puzzle.p.color('rgba(255,255,255,0.6)');
    this.timeSincePress = 0;
    this.pressDelay = 30;
    this.prevTouchCount = 0;

    // Pieces are picked once the press delay has passed. By then a quick drag can have left
    // the piece (more so at low frame rates), so remember where the press started.
    // (p5 calls these for presses anywhere in the window, so only presses on the canvas count.)
    puzzle.p.mousePressed = puzzle.p.touchStarted = () => {
      const { p } = this.puzzle;
      this.pressOrigin = isMouseOverCanvas(p) ? p.createVector(p.mouseX, p.mouseY) : undefined;
    };
  }

  public get isDragSelecting(): boolean {
    const { p } = this.puzzle;
    if (!this.dragSelectionOrigin) return false;
    const enoughTimePassed = this.timeSincePress > this.pressDelay;
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
      delete this.pressOrigin;
      delete this.dragSelectionOrigin;
      this.timeSincePress = 0;
    }

    this.prevMouseIsPressed = this.mouseIsPressed;
    this.prevTouchCount = p.touches.length;
  }

  private handleDragSelection() {
    const { p } = this.puzzle;
    if (p.touches.length > 1) delete this.dragSelectionOrigin;

    const didPress = !this.prevMouseIsPressed && this.mouseIsPressed;

    if (didPress && (p.mouseButton === p.LEFT || p.touches.length)) {
      const pressedPiece = this.getPressedPiece();
      if (!pressedPiece || p.keyIsDown(this.settings.keybindings.selectMultiple)) {
        this.dragSelectionOrigin = this.getPressOrigin().copy();
      }
    }
  }

  private handlePieceSelection() {
    const { p } = this.puzzle;
    const touchCount = p.touches.length;

    // Multi-touch: ignore
    if (touchCount > 1) return;

    const didPress = !this.prevMouseIsPressed && p.mouseIsPressed;
    const delayPassed = this.timeSincePress > this.pressDelay;
    const wasQuickTap = !touchCount && this.prevTouchCount && !delayPassed;
    const leftClick = p.mouseButton === p.LEFT || touchCount;

    if (wasQuickTap || (didPress && leftClick && delayPassed)) {
      const piece = this.getPressedPiece();

      // Deselection
      if (this.puzzle.selectedPieces.length) {
        const selectMore = p.keyIsDown(this.settings.keybindings.selectMultiple);
        if (!piece?.isSelected && !selectMore) {
          this.deselectAllPieces();
        }
      }

      // Selection
      if (piece) {
        if (p.keyIsDown(this.settings.keybindings.selectMultiple)) {
          this.select(piece, !piece.isSelected);
        } else {
          this.select(piece, true);
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

        if (p.keyIsDown(this.settings.keybindings.selectMultiple)) {
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

  public deselectAllPieces() {
    for (const piece of this.puzzle.selectedPieces) {
      piece.isSelected = false;
    }

    // Sync with React Store
    this.puzzle.setShowPuzzlePieceControls(false);
  }

  /** Will select connected pieces recursively */
  public select(piece: Piece, value: boolean) {
    const { p } = this.puzzle;
    const maxElev = p.max(this.puzzle.pieces.map((p) => p.elevation));
    const pieces = getConnectedPieces(piece, this.puzzle);
    pieces.forEach((piece) => {
      piece.setSelectionColor(this.puzzle.getMyColor());
      piece.isSelected = value;
      if (piece.isSelected) {
        piece.elevation = maxElev + 1;
      }
    });

    const selectedPieces = this.puzzle.selectedPieces;
    this.puzzle.setShowPuzzlePieceControls(Boolean(selectedPieces.length));
  }

  private getPressOrigin(): p5.Vector {
    const { p } = this.puzzle;
    return this.pressOrigin ?? p.createVector(p.mouseX, p.mouseY);
  }

  /**
   * The piece the press is on: one we hold, which has followed the pointer since the press,
   * else the topmost piece where the press started.
   */
  private getPressedPiece(): Piece | undefined {
    const { p } = this.puzzle;
    const mouse = p.createVector(p.mouseX, p.mouseY);
    const pressOrigin = this.getPressOrigin();
    const sorted = sortPieces(this.puzzle.pieces, true);
    return (
      sorted.find((piece) => piece.isSelected && this.isPointOverPiece(mouse, piece)) ??
      sorted.find((piece) => this.isPointOverPiece(pressOrigin, piece))
    );
  }

  private isPointOverPiece(point: p5.Vector, piece: Piece) {
    const { scale, translation } = this.graph;
    const worldPoint = point.copy().div(scale).sub(translation);
    const corners = piece.getTrueCorners();
    return this.isPointInsideRect(worldPoint, corners);
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
