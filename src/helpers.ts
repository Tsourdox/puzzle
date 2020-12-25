/** Rotates a point around another center point, will return a new point */
function rotatePointAroundCenter(point: p5.Vector, center: p5.Vector, angle: number): p5.Vector {
    const angleToCenter = Math.atan2(point.y - center.y, point.x - center.x);
    const distToCenter = center.dist(point);
    return p5.Vector.fromAngle(angleToCenter + angle, distToCenter).add(center);
}

/** Sum all centers and divide by all to get average center point */
function getAverageCenter(pieces: Piece[]): p5.Vector {
    const centers = pieces.map(p => p.getTrueCenter());
    
    // avg: sum / length
    const sum = createVector(0, 0);
    for (const center of centers) {
        sum.add(center);
    }
    return sum.div(centers.length);
}