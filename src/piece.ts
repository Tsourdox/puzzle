interface Sides {
    top: p5.Vector[];
    right: p5.Vector[];
    bottom: p5.Vector[];
    left: p5.Vector[];
}

enum Side {
    Top,
    Right,
    Bottom,
    Left,
}

class Piece implements ISerializablePiece {
    public id: number;
    public isModified: boolean;
    public elevation: number;
    private _rotation: number;
    private _translation: p5.Vector;
    private _connectedSides: Side[];
    private graphics: p5.Graphics;
    private mask: p5.Graphics;
    private image: p5.Image;
    private origin: p5.Vector;
    private size: p5.Vector;
    private sides: Sides;
    private center: p5.Vector;
    private offset: number;
    private _isSelected: boolean;
    private graphicNeedsUpdating: boolean;

    constructor(id: number, image: p5.Image, origin: p5.Vector, size: p5.Vector, sides: Sides, offset: number) {
        this.id = id;
        this.isModified = false;
        this.elevation = id;
        this._rotation = 0;
        this._translation = createVector(0, 0);
        this.image = image;
        this.origin = origin;
        this.size = size;
        this.sides = sides;
        this.offset = offset;
        this.center = getAverageCenter(this.getCorners());
        this._isSelected = false;
        this._connectedSides = [];
        this.graphicNeedsUpdating = false;
        this.graphics = createGraphics(
            this.size.x + offset * 2,
            this.size.y + offset * 2
        );
        this.mask = createGraphics(this.graphics.width, this.graphics.height);
        this.updateGraphics();
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
        if (this._isSelected !== value) {
            this._isSelected = value;
            this.isModified = true;
            this.graphicNeedsUpdating = true;
        }
    }
    public get isSelected() {
        return this._isSelected;
    }

    public getOrigin() {
        return this.origin.copy();
    }
    
    private updateGraphics() {
        this.graphicNeedsUpdating = false;
        this.updateClippingMask();

        this.image.mask(this.mask as unknown as p5.Image);
        this.graphics.clear();
        this.graphics.image(this.image, 0, 0);
        
        if (this.isSelected) {
            this.updateSelectionOutline();
        }
    }

    private updateClippingMask() {
        const { top, right, bottom, left } = this.sides;
        this.mask.push();
        this.mask.clear();
        this.mask.translate(this.offset, this.offset)
        this.mask.fill(0);
        this.mask.curveTightness(1);
        this.mask.beginShape();
        this.drawOneSide(this.mask, top);
        this.drawOneSide(this.mask, right);
        this.drawOneSide(this.mask, bottom);
        this.drawOneSide(this.mask, left);
        this.mask.endShape(CLOSE);
        this.mask.pop();
    }

    private updateSelectionOutline() {
        const { top, right, bottom, left } = this.sides;
        this.graphics.push();
        this.graphics.translate(this.offset, this.offset)
        this.graphics.stroke('red');
        this.graphics.strokeWeight(this.size.mag() / 60);
        this.graphics.noFill();
        this.graphics.curveTightness(1);
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
        const lastPoint = p5.Vector.sub(side[side.length -1], this.origin);

        graphics.curveVertex(firstPoint.x, firstPoint.y);
        for (const point of side) {
            const p = p5.Vector.sub(point, this.origin)
            graphics.curveVertex(p.x, p.y);
        }
        graphics.curveVertex(lastPoint.x, lastPoint.y);
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
        return this.getCorners().map(corner => {
            const trueCorner = rotatePointAroundCenter(corner, this.center, this.rotation);
            trueCorner.add(this.translation);
            return trueCorner;
        });
    }

    public update() {
        if (this.graphicNeedsUpdating) {
            this.updateGraphics();
        }
    }

    public draw() {
        push();
        this.applyTranslation();
        this.applyRotation();
        const { graphics, origin, offset } = this;
        image(graphics, origin.x - offset, origin.y - offset);
        pop();
    }

    private applyRotation() {
        translate(this.center.x, this.center.y)
        rotate(this.rotation);
        translate(-this.center.x, -this.center.y)
    }

    private applyTranslation() {
        translate(this.translation.x, this.translation.y)
    }

    public serialize(): PieceData {
        this.isModified = false;
        // console.log('sending piece', this.id);
        return {
            id: this.id,
            rotation: this.rotation,
            translation: toPoint(this.translation),
            connectedSides: this.connectedSides,
            isSelected: this.isSelected,
            elevation: this.elevation
        };
    }

    public deserialize(piece: PieceData) {
        this._rotation = piece.rotation;
        this._connectedSides = piece.connectedSides;
        this._translation = toVector(piece.translation);
        this._isSelected = piece.isSelected;
        this.elevation = piece.elevation;

        if (piece.isSelected) {
            this.graphicNeedsUpdating = true;
        }
    }
}