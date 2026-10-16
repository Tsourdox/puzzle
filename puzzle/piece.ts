import p5 from 'p5';
import { LERP_DURATION_MS } from './network/constants';
import {
  IDeserializeOptions,
  IDeserializedPieceData,
  ISerializablePiece,
  ISerializedPieceData,
} from './network/types';
import { ISettings } from './settings';
import { getAverageCenter, rotatePointAroundCenter, toPoint, toVector } from './utils/general';

export interface Sides {
  top: p5.Vector[];
  right: p5.Vector[];
  bottom: p5.Vector[];
  left: p5.Vector[];
}

let hitTestContext: CanvasRenderingContext2D | undefined;

/** A context without transforms, so points are tested against paths as they are */
function getHitTestContext() {
  hitTestContext ??= document.createElement('canvas').getContext('2d')!;
  return hitTestContext;
}

/** Continues the path along a side, from its first point (a line or bezier curves) */
function traceSide(path: Path2D, side: p5.Vector[]) {
  if (side.length === 2) {
    path.lineTo(side[1].x, side[1].y);
    return;
  }
  for (let i = 1; i < side.length; i += 3) {
    const [c1, c2, end] = [side[i], side[i + 1], side[i + 2]];
    path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
  }
}

export enum Side {
  Top,
  Right,
  Bottom,
  Left,
}

export default class Piece implements ISerializablePiece {
  public id: number;
  public isModified: boolean;
  public elevation: number;
  private p: p5;
  private _rotation: number;
  private nextRotation: number;
  private _translation: p5.Vector;
  private nextTranslation: p5.Vector;
  private _connectedSides: Side[];
  private graphics: p5.Graphics;
  /** The whole puzzle image, shared by all pieces */
  private image: p5.Image;
  private origin: p5.Vector;
  private size: p5.Vector;
  private sides: Sides;
  private center: p5.Vector;
  private offset: number;
  private _isSelected: boolean;
  private _isSelectedByOther: boolean;
  private selectionColor: string;
  private graphicNeedsUpdating: boolean;
  private lerpTime: number;
  private settings: ISettings;
  /** The piece's outline in the solved image, for clipping and hit testing */
  private outline: Path2D;
  /** Each side on its own, to stroke the ones that aren't connected */
  private sidePaths: Path2D[];
  /** Distance from the center that the graphics reach, whatever the rotation */
  private radius: number;

  constructor(
    p: p5,
    id: number,
    image: p5.Image,
    origin: p5.Vector,
    size: p5.Vector,
    sides: Sides,
    offset: number,
    settings: ISettings,
  ) {
    this.p = p;
    this.id = id;
    this.isModified = false;
    this.elevation = id;
    this._rotation = 0;
    this.nextRotation = 0;
    this._translation = p.createVector(0, 0);
    this.nextTranslation = p.createVector(0, 0);
    this.lerpTime = LERP_DURATION_MS;
    this.image = image;
    this.origin = origin;
    this.size = size;
    this.sides = sides;
    this.offset = offset;
    this.center = getAverageCenter(this.p, this.getCorners());
    this._isSelected = false;
    this._isSelectedByOther = false;
    this.selectionColor = '#fff';
    this._connectedSides = [];
    this.graphicNeedsUpdating = false;
    this.settings = settings;
    this.sidePaths = this.createSidePaths();
    this.outline = this.createOutline();
    this.graphics = p.createGraphics(
      p.round(this.size.x + offset * 2),
      p.round(this.size.y + offset * 2),
    );
    this.radius = this.getGraphicsCorners().reduce(
      (max, corner) => Math.max(max, corner.dist(this.center)),
      0,
    );
    this.updateGraphics();
  }

  public releaseCanvas() {
    this.graphics.width = 0;
    this.graphics.height = 0;
    this.graphics.clear(0, 0, 0, 0);
    this.graphics.remove();
    this.graphics = undefined as never;
  }

  public set rotation(value: number) {
    let nextRotation = value % (Math.PI * 2);
    if (nextRotation < 0) {
      nextRotation += Math.PI * 2;
    }
    this._rotation = nextRotation;
    this.isModified = true;
  }
  public get rotation() {
    return this._rotation;
  }

  public set translation(value: p5.Vector) {
    if (!this.translation.equals(value)) {
      this._translation = value;
      this.isModified = true;
    }
  }
  public get translation() {
    return this._translation;
  }

  public set connectedSides(value: number[]) {
    this._connectedSides = value;
    this.isModified = true;
    this.graphicNeedsUpdating = true;
  }
  public get connectedSides() {
    return this._connectedSides;
  }

  /** For a side the adjacent piece says is connected; derived, so not a move of ours to send */
  public addConnectedSide(side: Side) {
    if (this._connectedSides.includes(side)) return;
    this._connectedSides = [...this._connectedSides, side];
    this.graphicNeedsUpdating = true;
  }

  /**
   * Puts this piece exactly where it belongs next to `anchor` in the solved image: same
   * rotation, and its center offset from the anchor's by that offset in the image, rotated.
   * Derived from the anchor, so it's not a move of ours to send.
   */
  public alignTo(anchor: Piece) {
    const rotation = anchor._rotation;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const dx = this.center.x - anchor.center.x;
    const dy = this.center.y - anchor.center.y;
    const x = anchor._translation.x + dx * cos - dy * sin - dx;
    const y = anchor._translation.y + dx * sin + dy * cos - dy;
    this._rotation = rotation;
    if (this._translation.x !== x || this._translation.y !== y) {
      this._translation = this.p.createVector(x, y);
    }
  }

  public set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      this.isModified = true;
      this.graphicNeedsUpdating = true;
      // When you select a piece, clear the "selected by other" flag (you're taking it over)
      if (value && this._isSelectedByOther) {
        this._isSelectedByOther = false;
      }
    }
  }
  public get isSelected() {
    return this._isSelected;
  }
  public get isSelectedByOther() {
    return this._isSelectedByOther;
  }

  public setSelectedByOther(value: boolean) {
    if (this._isSelectedByOther !== value) {
      this._isSelectedByOther = value;
      this.graphicNeedsUpdating = true;
    }
  }

  public getOrigin() {
    return this.origin.copy();
  }

  public forceGraphicsUpdate() {
    this.graphicNeedsUpdating = true;
  }

  public setSelectionColor(color: string): void {
    if (this.selectionColor !== color) {
      this.selectionColor = color;
      this.graphicNeedsUpdating = true;
    }
  }

  /**
   * Clips the puzzle image with the outline, then strokes the sides that aren't connected.
   * As paths, so the edges are smooth at the screen's density, not cut at the image's pixels.
   */
  private updateGraphics() {
    this.graphicNeedsUpdating = false;
    const { graphics, image, origin, offset, size } = this;
    const ctx = graphics.drawingContext as CanvasRenderingContext2D;
    graphics.clear(0, 0, 0, 0);
    ctx.save();
    // Draw in the solved image's coordinates
    ctx.translate(offset - origin.x, offset - origin.y);

    ctx.save();
    ctx.clip(this.outline);
    // Only the part of the image under the piece (Safari draws nothing when outside the image)
    const x0 = Math.max(0, origin.x - offset);
    const y0 = Math.max(0, origin.y - offset);
    const x1 = Math.min(image.width, origin.x - offset + graphics.width);
    const y1 = Math.min(image.height, origin.y - offset + graphics.height);
    graphics.image(image, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    ctx.restore();

    const selected =
      this._isSelected || (this._isSelectedByOther && this.settings.network.showSelectedPieces);
    ctx.strokeStyle = selected ? this.selectionColor : '#000';
    ctx.lineWidth = size.mag() / (selected ? 60 : 80);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.sidePaths.forEach((path, side) => {
      if (!this._connectedSides.includes(side)) ctx.stroke(path);
    });
    ctx.restore();
  }

  private createSidePaths() {
    const { top, right, bottom, left } = this.sides;
    return [top, right, bottom, left].map((side) => {
      const path = new Path2D();
      path.moveTo(side[0].x, side[0].y);
      traceSide(path, side);
      return path;
    });
  }

  private createOutline() {
    const path = new Path2D();
    const { top, right, bottom, left } = this.sides;
    path.moveTo(top[0].x, top[0].y);
    for (const side of [top, right, bottom, left]) {
      traceSide(path, side);
    }
    path.closePath();
    return path;
  }

  /** Whether a point in the world is on the piece, tabs included and the bays between them not */
  public containsPoint(point: p5.Vector): boolean {
    const trueCenter = this.getTrueCenter();
    if (point.dist(trueCenter) > this.radius) return false;
    // Back to where the point would be on the piece in the solved image
    const local = rotatePointAroundCenter(point, trueCenter, -this._rotation).sub(
      this._translation,
    );
    return getHitTestContext().isPointInPath(this.outline, local.x, local.y);
  }

  /** Whether any of the piece can be inside the rect (in world coordinates) */
  public isInView(x: number, y: number, width: number, height: number): boolean {
    const { x: cx, y: cy } = this.getTrueCenter();
    const r = this.radius;
    return cx + r >= x && cx - r <= x + width && cy + r >= y && cy - r <= y + height;
  }

  private getGraphicsCorners(): p5.Vector[] {
    const { p, origin, offset } = this;
    const { width, height } = this.graphics;
    const x = origin.x - offset;
    const y = origin.y - offset;
    return [
      p.createVector(x, y),
      p.createVector(x + width, y),
      p.createVector(x + width, y + height),
      p.createVector(x, y + height),
    ];
  }

  public getTrueCenter(): p5.Vector {
    return p5.Vector.add(this.center, this._translation);
  }

  private getCorners(): p5.Vector[] {
    const { top, right, bottom, left } = this.sides;
    return [top[0], right[0], bottom[0], left[0]];
  }

  public getTrueCorners(): p5.Vector[] {
    return this.getCorners().map((corner) => {
      const trueCorner = rotatePointAroundCenter(corner, this.center, this.rotation);
      trueCorner.add(this.translation);
      return trueCorner;
    });
  }

  public update() {
    const { p } = this;
    if (this.lerpTime < LERP_DURATION_MS) {
      this.lerpTime += p.deltaTime;
      const t = p.min(1, this.lerpTime / LERP_DURATION_MS);
      this._translation.lerp(this.nextTranslation, t);
      this._rotation = p.lerp(this._rotation, this.nextRotation, t);
    }
    if (this.graphicNeedsUpdating) {
      this.updateGraphics();
    }
  }

  public draw() {
    const { p, graphics, origin, offset, center, _translation } = this;
    // Rotate around the center: move there, rotate, and draw the graphics relative to it
    p.push();
    p.translate(_translation.x + center.x, _translation.y + center.y);
    p.rotate(this._rotation);
    p.image(graphics, origin.x - offset - center.x, origin.y - offset - center.y);
    p.pop();
  }

  public serialize(): ISerializedPieceData {
    // Don't clear isModified here - let the network handler clear it after successful sync
    return {
      id: this.id,
      rotation: this.rotation,
      translation: toPoint(this.translation),
      connectedSides: this.connectedSides,
      elevation: this.elevation,
      isSelected: this.isSelected,
    };
  }

  public async deserialize(piece: IDeserializedPieceData, options: IDeserializeOptions) {
    if (this._isSelectedByOther !== piece.isSelectedByOther) {
      this.graphicNeedsUpdating = true;
    }
    this._isSelectedByOther = piece.isSelectedByOther;
    this._connectedSides = piece.connectedSides || [];
    this.graphicNeedsUpdating = true;
    this.elevation = piece.elevation;

    if (options?.lerp) {
      this.nextRotation = piece.rotation;
      this.nextTranslation = toVector(piece.translation);
      this.lerpTime = 0;
      const deltaRotation = piece.rotation - this._rotation;
      if (this.p.abs(deltaRotation) > Math.PI * 2) {
        const rotations = Math.round(deltaRotation / (Math.PI * 2));
        this._rotation += Math.PI * 2 * rotations;
      }
    } else {
      this._rotation = piece.rotation;
      this._translation = toVector(piece.translation);
    }
  }
}
