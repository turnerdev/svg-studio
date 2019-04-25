/**
 * SVG path functions
 * @module path
 */

import { fromJS } from 'immutable';

/**
 * @private
 * @type {object}
 */
const argSize = {
  'MVLHT': 1,
  'C': 3,
  'SQ': 2,
  'A': 6
}

/**
 * Returns the number of parameters for the specified command
 * @private
 * @param {string} command SVG path command 
 * @return {number} Number of parameters per arguement
 */
const getArgSize = (command) => argSize[Object.keys(argSize).find(key => 
  ~key.indexOf(command.toUpperCase())
)];

/**
 * Chunks an array into multiple arrays of size n
 * @param {Array.<any>} a
 * @param {number} n 
 * @return {Array.<Array.<any>>}
 */
const chunk = (a, n) => a.length === 0 ? []
  : [a.slice(0, n)].concat(chunk(a.slice(n), n));

/**
 * Return a Path object from the shape of the path
 * @constructor
 * @param {string} d Shape of the path
 */
export const Path = (x, y, d, name) => fromJS({
  x: x,
  y: y,
  visible: true,
  name: name,
  d: d.match(/[a-zA-Z]([^a-zA-Z]*)/g).map(x => ({
    command: x[0],

          // String => [[String]]
          // "1,2, 3,4 10,4 2,4" => [["1,2","3,4"], ["10,4","2,4"]]
    args: chunk(x.substr(1).split(' ').filter(e => e), getArgSize(x[0])) 

          // [[String]] => [[[Number, Number]]]
          // [["1,2","3,4"], ["10,4","2,4"]] => [[[1,2],[3,4]], [[10,4],[2,4]]
          .map(buffer => buffer.map(tuple => tuple.split(',').map(Number))) 
  }))
});

/**
 * Convert an immutable path object to a 'd' value
 * @param {Immutable} path Path object
 * @return {string} Path shape, or 'd' value
 */
export const getShape = (path) => path.toJS().d.map(c => c.command + c.args.map(arg => arg.join(','))).join(' ');
