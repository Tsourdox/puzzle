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
    private image: p5.Image;
    private origin: p5.Vector;
    private size: p5.Vector;
    private sides: Sides;
    private center: p5.Vector;
    private offset: number;
    private _isSelected: boolean;
    private graphicNeedsUpdating: boolean;
    private clippingMask: p5.Image;

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
            round(this.size.x + offset * 2),
            round(this.size.y + offset * 2)
        );
        this.clippingMask = this.createClippingMask();
        this.updateGraphics();
    }

    public cleanup() {
        this.graphics.width = 0;
        this.graphics.height = 0;
        this.graphics.remove();
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

        this.image.mask(this.clippingMask);
        this.graphics.clear();
        this.graphics.image(this.image, 0, 0);
        
        if (this.isSelected) {
            this.updateSelectionOutline();
        }
    }

    private createClippingMask() {
        const { width, height } = this.graphics;
        const { top, right, bottom, left } = this.sides;
        const mask = createGraphics(width, height);
        mask.push();
        mask.clear();
        mask.translate(this.offset, this.offset)
        mask.fill(0);
        mask.beginShape();
        this.drawOneSide(mask, top);
        this.drawOneSide(mask, right);
        this.drawOneSide(mask, bottom);
        this.drawOneSide(mask, left);
        mask.endShape(CLOSE);
        mask.pop();

        const image = createImage(width, height);
        image.copy(mask, 0, 0, width, height, 0, 0, width, height);
        mask.width = 0;
        mask.height = 0;
        mask.remove();

        return image;
    }

    private updateSelectionOutline() {
        const { top, right, bottom, left } = this.sides;
        this.graphics.push();
        this.graphics.translate(this.offset, this.offset)
        this.graphics.stroke(theme.primary);
        this.graphics.strokeWeight(this.size.mag() / 60);
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