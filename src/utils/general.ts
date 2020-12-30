interface Point { x: number, y: number };

interface Line {
    start: p5.Vector;
    end: p5.Vector;
}

function sum(...values: number[]): number {
    return values.reduce((a, b) => a + b, 0);
}

/** Rotates a point around another center point, will return a new point */
function rotatePointAroundCenter(point: p5.Vector, center: p5.Vector, angle: number): p5.Vector {
    const angleToCenter = Math.atan2(point.y - center.y, point.x - center.x);
    const distToCenter = center.dist(point);
    return p5.Vector.fromAngle(angleToCenter + angle, distToCenter).add(center);
}

/** Sum all points and divide by count to get average center point */
function getAverageCenter(points: p5.Vector[]): p5.Vector {
    const sum = createVector(0, 0);
    if (!points.length) return sum;

    for (const center of points) {
        sum.add(center);
    }
    return sum.div(points.length);
}

/**
 * Will return which side of a line that a point lies.
 * Return value is -1, 0 or 1. It is 0 on the line, +1
 * on one side and -1 on the other side. 
 * https://stackoverflow.com/a/1560510
 **/
function pointSideLocationOfLine(point: p5.Vector, line: Line): 1 | 0 | -1 {
    const { start, end } = line;
    return Math.sign(
        (end.x - start.x) *
        (point.y - start.y) -
        (end.y - start.y) *
        (point.x - start.x)
    ) as 1 | 0 | -1
}

function toPoint(vector: p5.Vector): Point {
    return { x: vector.x, y: vector.y };
} 

function toVector(point: Point): p5.Vector {
    return createVector(point.x, point.y);
} 