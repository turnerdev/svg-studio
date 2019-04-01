/**
 * Vector 2
 * Forked from http://pryme8.com/Vector2-js-vector-library/
 */
export const Vector2 = function(x, y) {
    if (!this) {
        return new Vector2(x, y);
    }
	this.x = x || 0;
	this.y = y || 0;
	return this;
};

/**
 * Clone the vector, returning same instance
 * @return {Vector2}
 */
Vector2.prototype.copy = function(vector) {
	this.x = vector.x;
	this.y = vector.y;
    return this;
};

/**
 * Copy the vector, returning a new instance
 * @return {Vector2}
 */
Vector2.prototype.clone = function () {
    return Vector2(this.x, this.y);
};

/**
 * Get the perpendicular angle
 * @return {Vector2}
 */
Vector2.prototype.perp = function() {
    var x = this.x;
	var y = this.y;
    this.x = y;
    this.y = -x;
    return this;
};

/**
 * Rotate by an angle in radians.
 * @param {Number} angle Angle in radians
 * @return {Vector2}
 */
Vector2.prototype.rotate = function (angle) {
    var x = this.x;
    var y = this.y;
    this.x = x * Math.cos(angle) - y * Math.sin(angle);
    this.y = x * Math.sin(angle) + y * Math.cos(angle);
    return this;
};

/**
 * Reverse
 * @return {Vector2}
 */
Vector2.prototype.reverse = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
};

/**
 * Normalize
 * @return {Vector2} A unit vector
 */
Vector2.prototype.normalize = function() {
    const d = this.len();
    if (d > 0) {
      this.x = this.x / d;
      this.y = this.y / d;
    }
    return this;
};

/**
 * Add another Vector2
 * @param {Vector2} vector Vector to add
 * @return {Vector2}
 */
Vector2.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
};

/**
 * Subtract another Vector2
 * @param {Vector2} vector Vector to subtract
 * @return {Vector2}
 */
Vector2.prototype.subtract = function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
};

/**
 * Scale
 * @param {Number} x Scaling factor on the X axis
 * @param {Number} x Scaling factor on the Y axis
 * @return {Vector2}
 */
Vector2.prototype.scale = function(x, y) {
    this.x *= x;
    this.y *= y || x;
    return this; 
};

/**
 * Dot product
 * @param {Number} x Scaling factor on the X axis
 * @param {Number} x Scaling factor on the Y axis
 * @return {Vector2}
 */
Vector2.prototype.dot = function(vector) {
    return (this.x * vector.x + this.y * vector.y);
};

/**
 * Returns the value as a float tuple
 * @return {float[]}
 */
Vector2.prototype.getValue = function(v) {
    if (v === 'x' || v === 0) {
        return parseFloat(this.x);
    } else if (v === 'y' || v === 1) {
        return parseFloat(this.y);
    } else {
        return [this.x, this.y];
    }
}
