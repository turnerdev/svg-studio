import { Vector2 } from './vector2.js';

/**
 * Return a Path object from the shape of the path
 * @param {string} d Shape of the path
 */
export const Path = function(d, name) {
    if (!this) {
      return new Path(d, name);
    }
    this.visible = true;
    this.name = name;

    // Define 'd' value as {command: String, args: Number[][]}
    this.d = d.match(/[a-zA-Z]([^a-zA-Z]*)/g)
              .map(x => ({
                command: x[0],
                args: x.substr(1)      // Taje 
                       .split(',')     // Split pairs
                       .map(pair => pair.split(' ')      // Split on whitespace
                                        .map(Number)     // Parse to Numbers
                                        .filter(e => e)) // Strip NaNs
              }));

    return this;
}

/**
 * Convert a Path to the shape the shape of a path from a Path object
 * @param {Path} path Path
 */
Path.prototype.getShape = function() {
    // return this.d.map(c => c.command + (c.args.map(arg => arg.join(' '))).join(',')).join(' ');
    return this.d.map(c => c.command + c.args.map(arg => arg.join(' ')).join(',')).join(' ')
}

// Get last element
const last = function(a) {
    return a[a.length-1].clone();
}

Path.prototype.getPoints = function() {
    return this.d.reduce((a, c) => {
        switch (c.command) {
            // Move the current point to the coordinate x,y.
            // Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit
            // absolute LineTo (L) command(s) (see below). Formula: Pn = {x, y}
            case 'M': return a.concat(c.args.map(arg => {
                if (a.length === 0) {
                    return Vector2(...arg);
                } else {
                    return last(a).add(Vector2(...arg));
                }
            }));
            case 'h': return a.concat(last(a).add(Vector2(c.args[0][0], 0)));
            case 'v': return a.concat(last(a).add(Vector2(0, c.args[0][0])));
            case 'Z': return a;
        }
    }, []);
}