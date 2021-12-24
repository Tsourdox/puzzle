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

function angleBetween(v0: Point, v1: Point): number {
    const dx = v1.x - v0.x;
    const dy = v1.y - v0.y;
    return Math.atan2(dy, dx);
}

function pointBetween(v0: Point, v1: Point, amount?: number): p5.Vector {
    return createVector(
        lerp(v0.x, v1.x, amount || .5),
        lerp(v0.y, v1.y, amount || .5),
    );
}

function daysBetweenDates(date1: Date, date2: Date) {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const differenceMs = Math.abs(date1.getDate() - date2.getDate());
    return Math.round(differenceMs / ONE_DAY);
}

/* Will only check max 3 points */
function getMostDistantPoints(...[v0, v1, v2]: Point[]): [Point, Point] {
    if (v2) {
        const d01 = dist(v0.x, v0.y, v1.x, v1.y);
        const d02 = dist(v0.x, v0.y, v2.x, v2.y);
        const d12 = dist(v1.x, v1.y, v2.x, v2.y);
        const maxDist = max([d01, d02, d12]);
        if (d01 === maxDist) return [v0, v1];
        if (d02 === maxDist) return [v0, v2];
        else return [v1, v2];
    } else {
        return [v0, v1];
    }
}

function getRandomRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = "";

    for (let i = 0; i < 4; i++) {
        const randomCharIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomCharIndex);
    }
    return code;
}

function resizeImage(image: p5.Image, maxRes = 6000000) {
    let width = image.width;
    let height = image.height;
    const imageRes = width * height;
    const ratio = (maxRes / imageRes) + (1 - maxRes / imageRes) * .5;
    if (ratio < 1) {
        width *= ratio;
        image.resize(round(width), 0)
    }
}