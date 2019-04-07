import { svg } from 'hybrids';

import { Vector2 } from './vector2.js';

// const increment = (, ) => {last, elements}

/**
 * Control Factory
 * Returns a list of controls for the provided path
 * @param {Path} path 
 */
export const ControlFactory = (path) => path.d.reduce((previous, { command, args }) => {
  
  return args.reduce((previous, arg) => {
    console.log(path);
    console.log('COMMAND ' + command)
    switch (command) {

      /**
       * Move the current point to the coordinate x,y. Any subsequent
       * coordinate pair(s) are interpreted as parameter(s) for implicit
       * absolute LineTo (L) command(s)
       * 
       * Formula: Pn = {x, y}
       */
      case 'M': // (x, y)+            
        return {
          position: Vector2(...arg),
          elements: previous.elements.concat(
            controlMoveTo(...arg, {
              drag: (host, event) => { console.log(123); console.log(host); console.log(event); }
            })
          )
        };

        
      /**
       * Move the current point by shifting the last known position of the
       * path by dx along the x-axis and by dy along the y-axis. Any
       * subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit relative LineTo (l) command(s)
       * 
       * Formula: Pn = {xo + dx, yo + dy}
       */
      case 'm': // (dx, dy)+
        return {
          position: Vector2(...arg).add(previous.position),
          elements: [...previous.elements, controlMoveToRelative(...arg, previous.position, {
              mousedown: (host, event) => host.selectedControl = event.target
          })]
        };

      /**
       * Draw a line from the current point to the end point specified by x,y.
       * Any subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit absolute LineTo (L) command(s).
       * 
       * Formula: Po' = Pn = {x, y}
       */
      case 'L': // (x, y)+
        return;

      /**
       * Draw a line from the current point to the end point, which is the
       * current point shifted by dx along the x-axis and dy along the y-axis.
       * Any subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit relative LineTo (l) command(s) 
       *
       * Formula: Po' = Pn = {xo + dx, yo + dy}
       */
      case 'l': // (dx, dy)+
        return;

      /**
       * Draw a horizontal line from the current point to the end point, which
       * is specified by the x parameter and the current point's y coordinate.
       * Any subsequent value(s) are interpreted as parameter(s) for implicit
       * absolute horizontal LineTo (H) command(s).
       *
       * Formula: Po' = Pn = {x, yo}
       */
      case 'H': // x+
        return;

      /**
       * Draw a horizontal line from the current point to the end point, which
       * is specified by the current point shifted by dx along the x-axis and
       * the current point's y coordinate. Any subsequent value(s) are
       * interpreted as parameter(s) for implicit relative horizontal LineTo
       * (h) command(s).
       *
       * Formula: Po' = Pn = {xo + dx, yo}
       */
      case 'h': // dx+
        return previous;

      /**
       * Draw a vertical line from the current point to the end point, which
       * is specified by the y parameter and the current point's x coordinate.
       * Any subsequent values are interpreted as parameters for  asdasd
       * implicit absolute vertical LineTo (V) command(s).
       *
       * Formula: Po' = Pn = {xo, y} z
       */
      case 'V': // y+
        return;

      /**
       * Draw a vertical line from the current point to the end point, which
       * is specified by the current point shifted by dy along the y-axis and
       * the current point's x coordinate. Any subsequent value(s) are
       * interpreted as parameter(s) for implicit relative vertical LineTo (v)
       * command(s).
       * 
       * Formula: Po' = Pn = {xo, yo + dy}
       */
      case 'v': // dy+
        return previous;

      case 'z':
      case 'Z':
        return previous;
    }
  }, previous)
}, {
  position: Vector2(0, 0),
  elements: []
});

// if (~'MmLlHhVv'.indexOf(command)) {
//   const x = args.map(arg => Point(Vector2(0, 0), arg, {
//     mousedown: (host, event) => host.selectedControl = event.target
//   }));
//   console.log(x);
//   return x;
// }

// onmousedown='${(host) => dispatch(host, 'drag', handler.drag )}'
const controlMoveTo = (x, y, { detail: handler }) => svg`
  <circle cx='${x}' cy='${y}' r='${5}'
    onmousedown='${(host) => host.drag = handler.drag}'
  />`;

const controlMoveToRelative = (x, y, offset, handlers) => svg`
  <circle cx='${offset.x + x}' cy='${offset.y + y}' r='${5}'
    onmousedown='${handlers.mousedown}'
  />`;