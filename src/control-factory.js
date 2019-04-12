import { svg } from 'hybrids';
import { List } from 'immutable';

import { Vector2 } from './vector2.js';

// const increment = (, ) => {last, elements}

const Utils = {
  clamp : (min, max, val) => Math.min(Math.max(val, min), max)
};

const SVGCoords = (host, event) => {
  const box = host.shadowRoot.querySelector('svg').getBoundingClientRect();
  return Vector2(
    Utils.clamp(box.left, box.right, event.clientX) - box.left, 
    Utils.clamp(box.top, box.bottom, event.clientY) - box.top
  );
}

const UpdatePath = (paths, path, di, ai, arg) => {
  const newpaths = paths.slice(0);
  const index = paths.indexOf(path);
  if (~index) {
    const args = newpaths[index].d[di].args.slice(0);
    args[ai] = arg;
    newpaths[index].d[di].args = args;
  }
  return newpaths;
}

/**
 * Control Factory
 * Returns a list of controls for the provided path
 * @param {Path} path 
 */
export const ControlFactory = (path, pi) => path.get('d').reduce((previous, c, di) => {
  
  const nextControl = (previous, pos, element) => { return {
    position: pos,
    elements: [...previous.elements, element]
  }};

  
  return c.get('args').reduce((previous, arg, ai) => {
    
    var abs;

    switch (c.get('command')) {

      /**
       * Move the current point to the coordinate x,y. Any subsequent
       * coordinate pair(s) are interpreted as parameter(s) for implicit
       * absolute LineTo (L) command(s)
       * 
       * Formula: Pn = {x, y}
       */
      case 'M': // (x, y)+            
        abs = Vector2(...arg.get(0).toArray());
        return nextControl(previous, abs, controlMoveTo(...abs.getValue(), {
          drag: (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List(pos.getValue()));
          }
        }));
        
      /**
       * Move the current point by shifting the last known position of the
       * path by dx along the x-axis and by dy along the y-axis. Any
       * subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit relative LineTo (l) command(s)
       * 
       * Formula: Pn = {xo + dx, yo + dy}
       */
      case 'm': // (dx, dy)+
        abs = Vector2(...arg.get(0).toArray()).add(previous.position);
        return nextControl(previous, abs, controlMoveTo(...abs.getValue(), {
          drag: (host, event) => {
            const pos = SVGCoords(host, event).subtract(previous.position);
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List(pos.getValue()));
          }
        }));

      /**
       * Draw a line from the current point to the end point specified by x,y.
       * Any subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit absolute LineTo (L) command(s).
       * 
       * Formula: Po' = Pn = {x, y}
       */
      case 'L': // (x, y)+
        abs = Vector2(...arg[0]);
        return {
          position: abs,
          elements: [...previous.elements, controlMoveTo(...abs.getValue(), {
            drag: (host, event) => {
              const pos = SVGCoords(host, event);
              host.paths = UpdatePath(host.paths, path, di, ai, [pos.getValue()]);
            }
          })]
        };

      /**
       * Draw a line from the current point to the end point, which is the
       * current point shifted by dx along the x-axis and dy along the y-axis.
       * Any subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit relative LineTo (l) command(s) 
       *
       * Formula: Po' = Pn = {xo + dx, yo + dy}
       */
      case 'l': // (dx, dy)+
        abs = Vector2(...arg[0]).add(previous.position)
        return {
          position: abs,
          elements: [...previous.elements, controlMoveTo(...abs.getValue(), {
            drag: (host, event) => {
              const pos = SVGCoords(host, event);
              host.paths = UpdatePath(host.paths, path, di, ai, [pos.getValue()]);
            }
          })]
        };

      /**
       * Draw a horizontal line from the current point to the end point, which
       * is specified by the x parameter and the current point's y coordinate.
       * Any subsequent value(s) are interpreted as parameter(s) for implicit
       * absolute horizontal LineTo (H) command(s).
       *
       * Formula: Po' = Pn = {x, yo}
       */
      case 'H': // x+
        abs = Vector2(...arg[0], previous.position.y);
        return {
          position: abs,
          elements: [...previous.elements, controlMoveTo(...abs.getValue(), {
            drag: (host, event) => {
              const pos = SVGCoords(host, event);
              host.paths = UpdatePath(host.paths, path, di, ai, [pos.x]);
            }
          })]
        };

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
        abs = Vector2(...arg.get(0).toArray(), 0).add(previous.position);
        return nextControl(previous, abs, controlMoveTo(...abs.getValue(), {
          drag: (host, event) => {
            const pos = SVGCoords(host, event).subtract(previous.position); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List([pos.x]));
          }
        }));

      /**
       * Draw a vertical line from the current point to the end point, which
       * is specified by the y parameter and the current point's x coordinate.
       * Any subsequent values are interpreted as parameters for  asdasd
       * implicit absolute vertical LineTo (V) command(s).
       *
       * Formula: Po' = Pn = {xo, y} z
       */
      case 'V': // y+
        abs = Vector2(previous.position.x, ...arg[0]);
        return {
          position: abs,
          elements: [...previous.elements, controlMoveTo(...abs.getValue(), {
            drag: (host, event) => {
              const pos = SVGCoords(host, event);
              host.paths = UpdatePath(host.paths, path, di, ai, [pos.y]);
            }
          })]
        };

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
        abs = Vector2(0, ...arg[0]).add(previous.position);
        return {
          position: abs,
          elements: [...previous.elements, controlMoveTo(...abs.getValue(), {
            drag: (host, event) => {
              const pos = SVGCoords(host, event).subtract(previous.position);
              host.paths = UpdatePath(host.paths, path, di, ai, [pos.y]);
            }
          })]
        };
      
      /**
       * Draw a smooth cubic Bézier curve from the current point to the end point specified by x,y. The end control point is specified by x2,y2. The start control point is a reflection of the end control point of the previous curve command. If the previous command wasn't a curve, the start control point is the same as the curve starting point (current point). Any subsequent pair(s) of coordinate pairs are interpreted as parameter(s) for implicit absolute smooth cubic Bézier curve (S) commands.
       * 
       */
      case 'S': // (x2,y2, x,y)+
        abs = Vector2(...arg.get(0).toArray());

        return nextControl(previous, abs, ControlCubic(previous.position, arg, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List(pos.getValue()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 1], List(pos.getValue()));
          }
        ]));

      /**
       * Draw a cubic Bézier curve from the current point to the end point specified by x,y. The start control point is specified by x1,y1 and the end control point is specified by x2,y2. Any subsequent triplet(s) of coordinate pairs are interpreted as parameter(s) for implicit absolute cubic Bézier curve (C) command(s). Formulae: Po' = Pn = {x, y} ; Pcs = {x1, y1} ; Pce = {x2, y2}
       */
      case 'C': // (x1,y1, x2,y2, x,y)+
        abs = Vector2(...arg.get(0).toArray());

        return nextControl(previous, abs, ControlCubic(previous.position, arg, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List(pos.getValue()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 1], List(pos.getValue()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 2], List(pos.getValue()));
          }
        ]));


      /**
       * Draw a smooth cubic Bézier curve from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. The end control point is the current point (starting point of the curve) shifted by dx2 along the x-axis and dy2 along the y-axis. The start control point is a reflection of the end control point of the previous curve command. If the previous command wasn't a curve, the start control point is the same as the curve starting point (current point). Any subsequent pair(s) of coordinate pairs are interpreted as parameter(s) for implicit relative smooth cubic Bézier curve (s) commands.
       */
      case 's': // (x2,y2, x,y)+
        abs = Vector2(...arg.get(0).toArray()).add(previous.position);

        return nextControl(previous, abs, ControlCubic(previous.position, arg, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List(pos.subtract(previous.position).getValue()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 1], List(pos.subtract(previous.position).getValue()));
          }
        ]));

      /**
       * Draw a cubic Bézier curve from the current point to the end point, which is the current point shifted by dx along the x-axis and dy along the y-axis. The start control point is the current point (starting point of the curve) shifted by dx1 along the x-axis and dy1 along the y-axis. The end control point is the current point (starting point of the curve) shifted by dx2 along the x-axis and dy2 along the y-axis. Any subsequent triplet(s) of coordinate pairs are interpreted as parameter(s) for implicit relative cubic Bézier curve (c) command(s). Formulae: Po' = Pn = {xo + dx, yo + dy} ; Pcs = {xo + dx1, yo + dy1} ; Pce = {xo + dx2, yo + dy2}
       */
      case 'c': // (dx1,dy1, dx2,dy2, dx,dy)+
        abs = Vector2(...arg.get(0).toArray()).add(previous.position);

        return nextControl(previous, abs, ControlCubic(previous.position, arg, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 0], List(pos.subtract(previous.position).getValue()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 1], List(pos.subtract(previous.position).getValue()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([pi, 'd', di, 'args', ai, 2], List(pos.subtract(previous.position).getValue()));
          }
        ]));

      case 'z':
      case 'Z':
        return previous;
    }
  }, previous)
}, {
  position: Vector2(0, 0),
  elements: []
}).elements;

// if (~'MmLlHhVv'.indexOf(command)) {
//   const x = args.map(arg => Point(Vector2(0, 0), arg, {
//     mousedown: (host, event) => host.selectedControl = event.target
//   }));
//   console.log(x);
//   return x;
// }

// onmousedown='${(host) => dispatch(host, 'drag', handler.drag )}'
const controlMoveTo = (x, y, handlers) => svg`
  <g class='handles'>
    <circle cx='${x}' cy='${y}' r='${5}'
      onmousedown='${host => host.drag = handlers.drag}'
    />
  </g>`;

// Control element for 
const ControlCubic = (pos, arg, handlers) => svg`
  <g class='handles'>${arg.map((a, i) => svg`
    <circle cx='${a.get(0)}' cy='${a.get(1)}' r='${5}'
      onmousedown='${host => host.drag = handlers[i]}'/>
      ${i === arg.size-2 && svg`
        <line x1='${a.get(0)}' y1='${a.get(1)}' x2='${arg.getIn([-1,0])}' y2='${arg.getIn([-1,1])}' />
      `}
    `).toArray()
    }
    ${arg.size === 3 && svg`
      <line x1='${arg.getIn([0,0])}' y1='${arg.getIn([0,1])}' x2='${pos.x}' y2='${pos.y}' />
    `}
  </g>`;

// const controlMoveToRelative = (x, y, offset, handlers) => svg`
//   <g class='handles'>
//     <circle cx='${offset.x + x}' cy='${offset.y + y}' r='${5}'
//       onmousedown='${host => host.drag = handlers.drag}'
//     />
//   </g>`;