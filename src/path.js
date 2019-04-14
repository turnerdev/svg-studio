import { fromJS } from 'immutable';

const argsize = (command) => {
    if (~'MmVvLlHhTt'.indexOf(command)) {
        return 1;
    } else if (~'Cc'.indexOf(command)) {
        return 3;
    }  else if (~'SsQq'.indexOf(command)) {
        return 2;
    } else if (~'Aa'.indexOf(command)) {
        return 6;
    } else {
        return 0;
    }
}

/**
 * Chunks an array by a given size
 * @param {Array} a Arr
 * @param {number} n 
 */
function chunk(a, n) { 
    if (a.length === 0) { return []; }
    else { return [a.slice(0, n)].concat(chunk(a.slice(n), n)); }
}

/**
 * Return a Path object from the shape of the path
 * @constructor
 * @param {string} d Shape of the path
 */
export const Path = (x, y, d, name) => {
    return fromJS({
        x: x,
        y: y,
        visible: true,
        name: name,
        d: d.match(/[a-zA-Z]([^a-zA-Z]*)/g).map(x => ({
            command: x[0],

                  // String => [[String]]
                  // "1,2, 3,4 10,4 2,4" => [["1,2","3,4"], ["10,4","2,4"]]
            args: chunk(x.substr(1).split(' ').filter(e => e), argsize(x[0])) 

                  // [[String]] => [[[Number, Number]]]
                  // [["1,2","3,4"], ["10,4","2,4"]] => [[[1,2],[3,4]], [[10,4],[2,4]]
                  .map(buffer => buffer.map(tuple => tuple.split(',').map(Number))) 
        }))
    });
}

/**
 * Convert an immutable path object to a 'd' string
 * @param {Immutable} path Path
 * @return {string}
 */
export const getShape = (path) => {
    return path.toJS().d.map(c => c.command + c.args.map(arg => arg.join(','))).join(' ');
}
