/** Rotates a point around another center point, will return a new point */
function rotatePointAroundCenter(point: p5.Vector, center: p5.Vector, angle: number): p5.Vector {
    const angleToCenter = Math.atan2(point.y - center.y, point.x - center.x);
    const distToCenter = center.dist(point);
    return p5.Vector.fromAngle(angleToCenter + angle, distToCenter).add(center);
}

/** Sum all points and divide by count to get average center point */
function getAverageCenter(points: p5.Vector[]): p5.Vector {
    
    // avg: sum / length
    const sum = createVector(0, 0);
    for (const center of points) {
        sum.add(center);
    }
    return sum.div(points.length);
}