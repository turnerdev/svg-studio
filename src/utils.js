/**
 * Clamp a numeric value between some minimum and maximum range
 * @param {number} min 
 * @param {number} max 
 * @param {number} val 
 */
export function clamp(min, max, val) {
    return Math.min(Math.max(val, min), max);
}

/**
 * Construct a partial circle from an arc
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * @param {number} spread 
 * @param {number} startAngle 
 * @param {number} endAngle 
 */
export function describeArc(x, y, radius, spread, startAngle, endAngle) {
    const innerStart = polarToCartesian(x, y, radius, endAngle);
    const innerEnd = polarToCartesian(x, y, radius, startAngle);
    const outerStart = polarToCartesian(x, y, radius + spread, endAngle);
    const outerEnd = polarToCartesian(x, y, radius + spread, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return [
        'M', outerStart.x, outerStart.y,
        'A', radius + spread, radius + spread, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
        'L', innerEnd.x, innerEnd.y, 
        'A', radius, radius, 0, largeArcFlag, 1, innerStart.x, innerStart.y, 
        'L', outerStart.x, outerStart.y, "Z"
    ].join(' ');
}

/**
 * Convert polar coordinates to cartesian coordinates
 * @param {number} centerX 
 * @param {number} centerY 
 * @param {number} radius 
 * @param {number} angleInDegrees 
 */
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    }
}