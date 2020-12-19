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
    private sides: Sides;
    private center: p5.Vector;
    public rotation: number;
    public translation: p5.Vector;
    public isSelected: boolean;

    constructor(sides: Sides) {
        this.sides = sides
        this.center = this.getApproximatedCenter();
        this.rotation = 0;
        this.translation = createVector(0, 0);
        this.isSelected = false;
    }

    public getTruePosition(): p5.Vector {
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
    public isMouseOver(scale: number) {
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
            
            const point = createVector(mouseX / scale, mouseY / scale);
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

    public draw() {
        push();
        fill(`rgba(0,0,0,.7)`);
        this.isSelected ? stroke('red') : stroke('blue');
        strokeWeight(2);
        curveTightness(1);
        this.applyTranslation();
        this.applyRotation();

        beginShape();
        this.drawOneSide(this.sides.top);
        this.drawOneSide(this.sides.right);
        this.drawOneSide(this.sides.bottom);
        this.drawOneSide(this.sides.left);
        endShape(CLOSE);
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

    private drawOneSide(side: p5.Vector[]) {
        const firstPoint = side[0];
        const lastPoint = side[side.length -1];
        curveVertex(firstPoint.x, firstPoint.y);
        for (const point of side) {
            curveVertex(point.x, point.y);
        }
        curveVertex(lastPoint.x, lastPoint.y);
    }
}