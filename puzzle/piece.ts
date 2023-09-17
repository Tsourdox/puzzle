import p5 from 'p5';
import { NETWORK_TIMEOUT } from './network/serializer';
import {
  IDeserializeOptions,
  IDeserializedPieceData,
  ISerializablePiece,
  ISerializedPieceData,
} from './network/types';
import {
  getAverageCenter,
  rotatePointAroundCenter,
  toPoint,
  toVector,
} from './utils/general';

export interface Sides {
  top: p5.Vector[];
  right: p5.Vector[];
  bottom: p5.Vector[];
  left: p5.Vector[];
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
  private image: p5.Image;
  private origin: p5.Vector;
  private size: p5.Vector;
  private sides: Sides;
  private center: p5.Vector;
  private offset: number;
  private _isSelected: boolean;
  private _isSelectedByOther: boolean;
  private graphicNeedsUpdating: boolean;
  private lerpTime: number;
  private LERP_DELAY = NETWORK_TIMEOUT * 3;

  constructor(
    p: p5,
    id: number,
    image: p5.Image,
    origin: p5.Vector,
    size: p5.Vector,
    sides: Sides,
    offset: number,
  ) {
    this.p = p;
    this.id = id;
    this.isModified = false;
    this.elevation = id;
    this._rotation = 0;
    this.nextRotation = 0;
    this._translation = p.createVector(0, 0);
    this.nextTranslation = p.createVector(0, 0);
    this.lerpTime = this.LERP_DELAY;
    this.image = image;
    this.origin = origin;
    this.size = size;
    this.sides = sides;
    this.offset = offset;
    this.center = getAverageCenter(this.p, this.getCorners());
    this._isSelected = false;
    this._isSelectedByOther = false;
    this._connectedSides = [];
    this.graphicNeedsUpdating = false;
    this.graphics = p.createGraphics(
      p.round(this.size.x + offset * 2),
      p.round(this.size.y + offset * 2),
    );
    this.image.mask(this.createClippingMask());
    this.updateGraphics();
  }

  public releaseCanvas() {
    this.graphics.width = 0;
    this.graphics.height = 0;
    this.graphics.clear(0, 0, 0, 0);
    this.graphics.remove();
    this.graphics = undefined as any;
  }

  public set rotation(value: number) {
    this._rotation = value;
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

  public set isSelected(value: boolean) {
    if (this._isSelected !== value && !this.isSelectedByOther) {
      this._isSelected = value;
      this.isModified = true;
      this.graphicNeedsUpdating = true;
    }
  }
  public get isSelected() {
    return this._isSelected;
  }
  public get isSelectedByOther() {
    return this._isSelectedByOther;
  }

  public getOrigin() {
    return this.origin.copy();
  }

  private updateGraphics() {
    this.graphicNeedsUpdating = false;
    if (this._isSelectedByOther) {
      this.graphics.tint(150, 240);
    } else {
      this.graphics.noTint();
    }

    this.graphics.clear(0, 0, 0, 0);
    this.graphics.image(this.image, 0, 0);

    if (this.isSelected || this._isSelectedByOther) {
      this.drawSelectionOutline();
    }
  }

  private createClippingMask() {
    const { p } = this;
    const { width, height } = this.graphics;
    const { top, right, bottom, left } = this.sides;
    const mask = p.createGraphics(width, height);
    mask.push();
    mask.clear(0, 0, 0, 0);
    mask.translate(this.offset, this.offset);
    mask.fill(0);
    mask.beginShape();
    this.drawOneSide(mask, top);
    this.drawOneSide(mask, right);
    this.drawOneSide(mask, bottom);
    this.drawOneSide(mask, left);
    mask.endShape(p.CLOSE);
    mask.pop();

    const image = p.createImage(width, height);
    image.copy(mask, 0, 0, width, height, 0, 0, width, height);
    mask.width = 0;
    mask.height = 0;
    mask.remove();

    return image;
  }

  private drawSelectionOutline() {
    const { top, right, bottom, left } = this.sides;
    this.graphics.push();
    this.graphics.translate(this.offset, this.offset);
    this.graphics.stroke(this._isSelectedByOther ? '#CCC' : '#FFF');
    this.graphics.strokeWeight(this.size.mag() / 80);
    this.graphics.noFill();
    if (!this.connectedSides.includes(Side.Top)) {
      this.graphics.beginShape();
      this.drawOneSide(this.graphics, top);
      this.graphics.endShape();
    }
    if (!this.connectedSides.includes(Side.Right)) {
      this.graphics.beginShape();
      this.drawOneSide(this.graphics, right);
      this.graphics.endShape();
    }
    if (!this.connectedSides.includes(Side.Bottom)) {
      this.graphics.beginShape();
      this.drawOneSide(this.graphics, bottom);
      this.graphics.endShape();
    }
    if (!this.connectedSides.includes(Side.Left)) {
      this.graphics.beginShape();
      this.drawOneSide(this.graphics, left);
      this.graphics.endShape();
    }
    this.graphics.pop();
  }

  private drawOneSide(graphics: p5.Graphics, side: p5.Vector[]) {
    const firstPoint = p5.Vector.sub(side[0], this.origin);

    graphics.vertex(firstPoint.x, firstPoint.y);
    for (let i = 1; i < side.length; i += 3) {
      const p2 = p5.Vector.sub(side[i], this.origin);
      const p3 = p5.Vector.sub(side[(i + 1) % side.length], this.origin);
      const p4 = p5.Vector.sub(side[(i + 2) % side.length], this.origin);
      graphics.bezierVertex(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    }
  }

  public getTrueCenter(): p5.Vector {
    return p5.Vector.add(this.center, this._translation);
  }

  private getCorners(): p5.Vector[] {
    return [
      this.sides.top[0],
      this.sides.right[0],
      this.sides.bottom[0],
      this.sides.left[0],
    ];
  }

  public getTrueCorners(): p5.Vector[] {
    return this.getCorners().map((corner) => {
      const trueCorner = rotatePointAroundCenter(
        corner,
        this.center,
        this.rotation,
      );
      trueCorner.add(this.translation);
      return trueCorner;
    });
  }

  public update() {
    if (this.lerpTime < this.LERP_DELAY) {
      this.lerpTime += deltaTime;
      const t = min(1, this.lerpTime / this.LERP_DELAY);
      this._translation.lerp(this.nextTranslation, t);
      this._rotation = lerp(this._rotation, this.nextRotation, t);
    }
    if (this.graphicNeedsUpdating) {
      this.updateGraphics();
    }
  }

  public draw() {
    this.p.push();
    this.applyTranslation();
    this.applyRotation();
    const { graphics, origin, offset } = this;
    this.p.image(graphics, origin.x - offset, origin.y - offset);
    this.p.pop();
  }

  private applyRotation() {
    this.p.translate(this.center.x, this.center.y);
    this.p.rotate(this.rotation);
    this.p.translate(-this.center.x, -this.center.y);
  }

  private applyTranslation() {
    this.p.translate(this.translation.x, this.translation.y);
  }

  public serialize(): ISerializedPieceData {
    this.isModified = false;
    return {
      id: this.id,
      rotation: this.rotation,
      translation: toPoint(this.translation),
      connectedSides: this.connectedSides,
      elevation: this.elevation,
      isSelected: this.isSelected,
    };
  }

  public async deserialize(
    piece: IDeserializedPieceData,
    options: IDeserializeOptions,
  ) {
    if (this._isSelectedByOther !== piece.isSelectedByOther) {
      this.graphicNeedsUpdating = true;
    }
    this._isSelectedByOther = piece.isSelectedByOther;
    this._connectedSides = piece.connectedSides || [];
    this.elevation = piece.elevation;

    if (options?.lerp) {
      this.nextRotation = piece.rotation;
      this.nextTranslation = toVector(piece.translation);
      this.lerpTime = 0;
      const deltaRotation = piece.rotation - this._rotation;
      if (abs(deltaRotation) > Math.PI * 2) {
        // If rotation is more than a full rotation it needs to be
        // normalized before lerp to make the rotation smooth
        const rotations = Math.round(deltaRotation / (PI * 2));
        this._rotation += Math.PI * 2 * rotations;
      }
    } else {
      this._rotation = piece.rotation;
      this._translation = toVector(piece.translation);
    }
  }
}
