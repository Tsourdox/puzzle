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
    public isModified: boolean;
    private graphics: p5.Graphics;
    private image: p5.Image;
    private origin: p5.Vector;
    private size: p5.Vector;
    private sides: Sides;
    private center: p5.Vector;
    public rotation: number;
    public translation: p5.Vector;
    private _isSelected: boolean;
    private prevIsSelected: boolean;
    private _lastSelected: number;
    public connectedSides: Side[];
    private prevIsConnected: Side[];

    constructor(image: p5.Image, origin: p5.Vector, size: p5.Vector, sides: Sides) {
        this.isModified = true; // always true for now!
        this.image = image;
        this.origin = origin;
        this.size = size;
        this.sides = sides;
        this.center = getAverageCenter(this.getCorners());
        this.rotation = 0;
        this.translation = createVector(0, 0);
        this._isSelected = false;
        this.prevIsSelected = false;
        this._lastSelected = 0;
        this.connectedSides = [];
        this.prevIsConnected = [];
        this.graphics = createGraphics(this.size.x, this.size.y);
        this.updateGraphics();
    }

    public set isSelected(value: boolean) {
        if (this._isSelected !== value) {
            this._isSelected = value;
            if (value) {
                this._lastSelected = frameCount;
            }
        }
    }

    public get isSelected() {
        return this._isSelected;
    }
    
    public get lastSelected() {
        return this._lastSelected;
    }

    public getOrigin() {
        return this.origin.copy();
    }
    
    private updateGraphics() {
        this.graphics.clear();
        this.graphics.image(this.image, 0, 0);
        if (!this.isSelected) return;

        // todo: create mask
        
        this.graphics.stroke('red');
        this.graphics.strokeWeight(this.size.mag() / 40);
        this.graphics.noFill();
        this.graphics.curveTightness(1);
        if (!this.connectedSides.includes(Side.Top)) {
            this.graphics.beginShape();
            this.drawOneSide(this.sides.top, false);
            this.graphics.endShape();
        }
        if (!this.connectedSides.includes(Side.Right)) {
            this.graphics.beginShape();
            this.drawOneSide(this.sides.right, true);
            this.graphics.endShape();
        }
        if (!this.connectedSides.includes(Side.Bottom)) {
            this.graphics.beginShape();
            this.drawOneSide(this.sides.bottom, false);
            this.graphics.endShape();
        }
        if (!this.connectedSides.includes(Side.Left)) {
            this.graphics.beginShape();
            this.drawOneSide(this.sides.left, true);
            this.graphics.endShape();
        }
    }

    private drawOneSide(side: p5.Vector[], isVertical: boolean) {
        const firstPoint = p5.Vector.sub(side[0], this.origin);
        const lastPoint = p5.Vector.sub(side[side.length -1], this.origin);
        if (isVertical) {
            firstPoint.sub(0.2, 0);
            lastPoint.sub(0.2, 0);
        } else {
            firstPoint.sub(0, 0.2);
            lastPoint.sub(0, 0.2);
        }

        this.graphics.curveVertex(firstPoint.x, firstPoint.y);
        for (const point of side) {
            const p = p5.Vector.sub(point, this.origin)
            isVertical ? p.sub(0.2, 0) : p.sub(0, 0.2);
            this.graphics.curveVertex(p.x, p.y);
        }
        this.graphics.curveVertex(lastPoint.x, lastPoint.y);
    }

    public getTrueCenter(): p5.Vector {
        return p5.Vector.add(this.center, this.translation);
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
        const selectionChanged = this.prevIsSelected !== this.isSelected;
        const connectionChanged = this.prevIsConnected.length !== this.connectedSides.length;
        if (selectionChanged || connectionChanged) {
            this.updateGraphics();
        }
        
        this.prevIsSelected = this.isSelected;
        this.prevIsConnected = [...this.connectedSides];
    }

    public draw() {
        push();
        this.applyTranslation();
        this.applyRotation();
        const { graphics, origin, size } = this;
        image(graphics, origin.x, origin.y, size.x, size.y);
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
        const { rotation, translation, connectedSides } = this;
        return {
            rotation,
            connectedSides,
            translation: { x: translation.x, y: translation.y },
        };
    }

    public deserialize(piece: PieceData) {
        this.rotation = piece.rotation;
        this.connectedSides = piece.connectedSides;
        const { x, y } = piece.translation;
        this.translation = createVector(x, y);
    }
}