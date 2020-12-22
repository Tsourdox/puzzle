interface Sides {
    top: p5.Vector[];
    right: p5.Vector[];
    bottom: p5.Vector[];
    left: p5.Vector[];
}

interface Line {
    start: p5.Vector;
    end: p5.Vector;
}

class Piece {
    private graphics: p5.Graphics;
    private image: p5.Image;
    private origin: p5.Vector;
    private size: p5.Vector;
    private sides: Sides;
    private center: p5.Vector;
    public rotation: number;
    public translation: p5.Vector;
    public isSelected: boolean;
    private prevIsSelected: boolean;

    constructor(image: p5.Image, origin: p5.Vector, size: p5.Vector, sides: Sides, ) {
        this.image = image;
        this.origin = origin;
        this.size = size;
        this.sides = sides;
        this.center = this.getApproximatedCenter();
        this.rotation = 0;
        this.translation = createVector(0, 0);
        this.isSelected = false;
        this.prevIsSelected = false;
        this.graphics = createGraphics(this.size.x, this.size.y);
        this.updateGraphics();
    }

    public getOrigin() {
        return this.origin.copy();
    }
    
    private updateGraphics() {
        this.graphics.image(this.image, 0, 0);
        this.isSelected ? this.graphics.stroke('blue') : this.graphics.stroke(250);
        this.isSelected ? this.graphics.strokeWeight(2) : this.graphics.strokeWeight(1);
        
        this.graphics.noFill();
        this.graphics.curveTightness(1);
        this.graphics.beginShape();
        this.drawOneSide(this.sides.top, false);
        this.drawOneSide(this.sides.right, true);
        this.drawOneSide(this.sides.bottom, false);
        this.drawOneSide(this.sides.left, true);
        this.graphics.endShape(CLOSE);
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

    public getTruePosition(): p5.Vector {
        return p5.Vector.add(this.center, this.translation);
    }

    public getCorners(): p5.Vector[] {
        return [
            this.sides.top[0],
            this.sides.right[0],
            this.sides.bottom[0],
            this.sides.left[0],
        ];
    }

    private getApproximatedCenter(): p5.Vector {
        const corners = this.getCorners();
        const xValues = corners.map(c => c.x);
        const yValues = corners.map(c => c.y);

        const center = createVector(
            (min(xValues) + max(xValues)) / 2,
            (min(yValues) + max(yValues)) / 2,
        )
        return center;
    }

    /**
     * Premise: if point is on the same side
     * of the piece sides, is has to be inside.
     */
    public isMouseOver(graph: IGraph) {
        let corners = this.getCorners();
        // Always 4 corners!
        
        const positions = [];
        for (let i = 0; i < 4; i++) {
            const start = corners[i].copy();
            const end = corners[(i + 1) % 4].copy();

            // add translation...
            start.x += this.translation.x;
            start.y += this.translation.y;
            end.x += this.translation.x;
            end.y += this.translation.y;
            
            const point = createVector(
                mouseX / graph.scale - graph.translation.x,
                mouseY / graph.scale - graph.translation.y
            );
            const line: Line = { start, end };
            positions[i] = this.pointPositionFromLine(point, line);
        }

        const sum = positions.reduce((a, b) => a + b, 0);
        if (sum === -4 || sum === 4 ) {
            return true;
        }
        return false;
    }

    /**
     * Will return which side of a curve that a point lies.
     * Return value is -1, 0 or 1. It is 0 on the line, +1
     * on one side and -1 on the other side. 
     * https://stackoverflow.com/a/1560510
     **/
    private pointPositionFromLine(point: p5.Vector, line: Line) {
        const { start, end } = line;
        return Math.sign(
            (end.x - start.x) *
            (point.y - start.y) -
            (end.y - start.y) *
            (point.x - start.x)
        )
    }

    public update() {
        if (this.prevIsSelected !== this.isSelected) {
            this.updateGraphics();
        }
        
        this.prevIsSelected = this.isSelected;
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
}