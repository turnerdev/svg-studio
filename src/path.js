/**
 * SVG path functions
 * @module path
 */

import { svg } from 'hybrids';

/**
 * Chunks an array into multiple arrays of size n
 * @todo Move to Util
 * @param {Array.<any>} a Array to chunk
 * @param {number} n Maximum size of each chunk
 * @return {Array.<Array.<any>>}
 */
const chunk = (a, n) => a.length === 0 ? []
  : [a.slice(0, n)].concat(chunk(a.slice(n), n));

/**
 * Convert an immutable path object to a 'd' value
 * @private
 * @param {Immutable} path Path object
 * @return {string} Path shape, or 'd' value
 */
const getShape = (path) => path.toJS().d.map(c => c.command + c.args.map(arg => arg.join(' '))).join(' ');

const argFn = {
  'HV': (data) => chunk(chunk(data, 1), 1),
  'MLT': (data) => chunk(chunk(data, 2), 1),
  'C': (data) => chunk(chunk(data, 2), 3),
  'SQ': (data) => chunk(chunk(data, 2), 2),
  'A': (data) => chunk(data, 7),
  'Z': () => []
}

const parseCommand = (command, parameters) => {
  return argFn[Object.keys(argFn).find(key => 
    ~key.indexOf(command.toUpperCase())
  )](parameters); 
}

/**
 * Return a Path object from the shape of the path
 * @constructor
 * @param {string} name Name of the path
 * @param {string} d Shape of the path
 */
export const Path = (name, d) => ({
  visible: true,
  name: name,
  d: d.match(/[a-zA-Z]([^a-zA-Z]*)/g).map(x => ({
    command: x[0],
    args: parseCommand(x[0], x.substr(1).split(/[\s,]+/).filter(e => e !==  '').map(Number))
  }))
});

/**
 * Create an SVG path from a Path object
 * @param {*} path Path object
 * @return {hybrids} SVG element
 */
export const SVGPath = (path) => svg`
  <path d='${getShape(path)}' fill='transparent' stroke='black' />
`;