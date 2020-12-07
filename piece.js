/**
 * All four sides of a puzzle piece,
 * represented as a series of points.
 * @typedef {{
 *      top: Point[];
 *      right: Point[];
 *      bottom: Point[];
 *      left: Point[];
 * }} Sides
 */

/**
 * A 2-dementional point represented as x & y.
 * @typedef {{ x: number; y: number }} Point
 */

class Piece {
    constructor(sides) {
        this.sides = sides
        this.origin = sides.top[0];
        this.center = this.approximatedCenter();
        this.rotation = 0;
        this.translation = { x: 0, y: 0 };
        this.isSelected = false;
    }

    getTruePosition() {
        return {
            x: this.center.x + this.translation.x,
            y: this.center.y + this.translation.y
        };
    }

    approximatedCenter() {
        const corners = [
            this.sides.top[0],
            this.sides.right[0],
            this.sides.bottom[0],
            this.sides.left[0],
        ];

        const xValues = corners.map(c => c.x);
        const yValues = corners.map(c => c.y);

        const center = {
            x: (min(xValues) + max(xValues)) / 2,
            y: (min(yValues) + max(yValues)) / 2,
        }
        return center;
    }

    isMouseOver() {
        const center = this.getTruePosition();
        const dx1 = center.x - mouseX;
        const dy1 = center.y - mouseY;

        const distanceToPoint = Math.hypot(dx1, dy1);
        // approximate with circle math for now
        // todo: test "is point inside curve"
        const { x: x1, y: y1 } = this.center;
        const { x: x2, y: y2 } = this.origin;
        const maxDistance = Math.hypot(x1 - x2, y1 - y2) * 0.7;
        return distanceToPoint < maxDistance
    }

    draw() {
        push();
        fill(`rgba(0,0,0,.7)`);
        this.isSelected ? stroke('red') : noStroke();
        strokeWeight(2);
        curveTightness(1);
        this.applyTranslation();
        this.applyRotation();

        const listOfSides = Object.values(this.sides);
        beginShape();
        for (const side of listOfSides) {
            this.drawOneSide(side);
        }
        endShape(CLOSE);
        pop();
    }

    applyRotation() {
        translate(this.center.x, this.center.y)
        rotate(this.rotation);
        translate(-this.center.x, -this.center.y)
    }

    applyTranslation() {
        translate(this.translation.x, this.translation.y)
    }

    drawOneSide(side) {
        const firstPoint = side[0];
        const lastPoint = side[side.length -1];
        curveVertex(firstPoint.x, firstPoint.y);
        for (const point of side) {
            curveVertex(point.x, point.y);
        }
        curveVertex(lastPoint.x, lastPoint.y);
    }
}