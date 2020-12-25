/** Rotates a point around another center point, will return a new point */
function rotatePointAroundCenter(point: p5.Vector, center: p5.Vector, angle: number): p5.Vector {
    const angleToCenter = Math.atan2(point.y - center.y, point.x - center.x);
    const distToCenter = center.dist(point);
    return p5.Vector.fromAngle(angleToCenter + angle, distToCenter).add(center);
}