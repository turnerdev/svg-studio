/**
 * Control Factory
 * Generates
 * @module control-factory
 */

import { svg } from 'hybrids';
import { List } from 'immutable';

import { Vector2 } from './vector2.js';
import * as Utils from './utils.js';

/**
 * Returns coordinates relative to the SVG canvas from a mouse event
 * @param {hybrids} host 
 * @param {MouseEvent} event 
 */
const SVGCoords = (host, event) => {
  const { scale } = host.svgProperties.toJS();
  const { gridSize, snapToGrid } = host.config.get('settings').toJS();

  const defaultGridSize = host.config.getIn(['defaults', 'gridSize']);
  const step = snapToGrid ? gridSize : defaultGridSize;
  
  const box = host.shadowRoot.querySelector('svg').getBoundingClientRect();

  // console.log(`scale: ${scale}, x: ${x}, y: ${y}`);
  // console.log(`clientX: ${event.clientX}, clientY: ${event.clientY}, boxTop: ${box.top}`);
  // console.log(`xx: ${xx}, yy: ${yy}`);
  // console.log(`box: {t: ${box.top}, r: ${box.right}, l: ${box.left} ,b: ${box.bottom}}`)
  // console.log(`svgx: ${xx-box.left}, svgy: ${yy-box.top}`);

  return Vector2(
    Math.round(((Utils.clamp(box.left, box.right, event.clientX) - box.left) / scale) / step) * step, 
    Math.round(((Utils.clamp(box.top, box.bottom, event.clientY) - box.top) / scale) / step) * step
  ); 
}

/**
 * Control Factory
 * Returns a list of controls for the provided path
 * @param {Path} path 
 */
export const ControlFactory = (path, pi) => path.get('d').reduce((previous, c, di) => {
  
  const nextControl = (current, nextPosition, element) => { return {
    position: nextPosition,
    elements: [...current.elements, element]
  }};
  
  return c.get('args').reduce((current, arg, ai) => {
    let position;
    let absArg;

    // Base path to the argument tuple
    // Path idx > 'd' param > D command idx > 'args' param > arg idx
    const base = [pi, 'd', di, 'args', ai];

    switch (c.get('command')) {

      /**
       * Move the current point to the coordinate x,y. Any subsequent
       * coordinate pair(s) are interpreted as parameter(s) for implicit
       * absolute LineTo (L) command(s)
       * 
       * Formula: Pn = {x, y}
       */
      case 'M': // (x, y)+
        position = Vector2(...arg.get(0).toArray());
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event);
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          }
        ]));
        
      /**
       * Move the current point by shifting the last known position of the
       * path by dx along the x-axis and by dy along the y-axis. Any
       * subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit relative LineTo (l) command(s)
       * 
       * Formula: Pn = {xo + dx, yo + dy}
       */
      case 'm': // (dx, dy)+
        position = Vector2(...arg.get(0).toArray()).add(current.position);
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event).subtract(current.position);
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          }
        ]));

      /**
       * Draw a line from the current point to the end point specified by x,y.
       * Any subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit absolute LineTo (L) command(s).
       * 
       * Formula: Po' = Pn = {x, y}
       */
      case 'L': // (x, y)+
        position = Vector2(...arg.get(0).toArray());
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event);
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          }
        ]));

      /**
       * Draw a line from the current point to the end point, which is the
       * current point shifted by dx along the x-axis and dy along the y-axis.
       * Any subsequent coordinate pair(s) are interpreted as parameter(s) for
       * implicit relative LineTo (l) command(s) 
       *
       * Formula: Po' = Pn = {xo + dx, yo + dy}
       */
      case 'l': // (dx, dy)+
        position = Vector2(...arg.get(0).toArray()).add(current.position);
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event).subtract(current.position);
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          }
        ]));

      /**
       * Draw a horizontal line from the current point to the end point, which
       * is specified by the x parameter and the current point's y coordinate.
       * Any subsequent value(s) are interpreted as parameter(s) for implicit
       * absolute horizontal LineTo (H) command(s).
       *
       * Formula: Po' = Pn = {x, yo}
       */
      case 'H': // x+
        position = Vector2(...arg.get(0).toArray(), current.position.y);
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event);
            host.paths = host.paths.setIn([...base, 0], pos.x);
          }
        ]));

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
        position = Vector2(...arg.get(0).toArray(), 0).add(current.position);
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event).subtract(current.position); 
            host.paths = host.paths.setIn([...base, 0], List([pos.x]));
          }
        ]));

      /**
       * Draw a vertical line from the current point to the end point, which
       * is specified by the y parameter and the current point's x coordinate.
       * Any subsequent values are interpreted as parameters for  asdasd
       * implicit absolute vertical LineTo (V) command(s).
       *
       * Formula: Po' = Pn = {xo, y} z
       */
      case 'V': // y+
        position = Vector2(current.position.y, ...arg.get(0).toArray());
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event);
            host.paths = host.paths.setIn([...base, 0], pos.y);
          }
        ]));

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
        position = Vector2(current.position.x, ...arg.get(0).toArray());
        return nextControl(current, position, StandardControls(position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event).subtract(current.position);
            host.paths = host.paths.setIn([...base, 0], pos.y);
          }
        ]));
      
      /**
       * Draw a smooth cubic Bézier curve from the current point to the end
       * point specified by x,y. The end control point is specified by x2,y2.
       * The start control point is a reflection of the end control point of the
       * previous curve command. If the previous command wasn't a curve, the
       * start control point is the same as the curve starting point (current
       * point). Any subsequent pair(s) of coordinate pairs are interpreted as
       * parameter(s) for implicit absolute smooth cubic Bézier curve (S)
       * commands.
       */
      case 'S': // (x2,y2, x,y)+
        position = Vector2(...arg.get(0).toArray());

        return nextControl(current, position, StandardControls(current.position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 1], List(pos.toArray()));
          }
        ]));

      /**
       * Draw a smooth cubic Bézier curve from the current point to the end
       * point, which is the current point shifted by dx along the x-axis and dy
       * along the y-axis. The end control point is the current point (starting
       * point of the curve) shifted by dx2 along the x-axis and dy2 along the
       * y-axis. The start control point is a reflection of the end control
       * point of the previous curve command. If the previous command wasn't a
       * curve, the start control point is the same as the curve starting point
       * (current point). Any subsequent pair(s) of coordinate pairs are
       * interpreted as parameter(s) for implicit relative smooth cubic Bézier
       * curve (s) commands.
       */
      case 's': // (x2,y2, x,y)+
        position = Vector2(...arg.get(0).toArray()).add(current.position);
        absArg = arg.map(a => List.of(a.get(0) + current.position.x, a.get(1) + current.position.y))

        return nextControl(current, position, StandardControls(current.position, absArg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.subtract(current.position).toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 1], List(pos.subtract(current.position).toArray()));
          }
        ]));

      /**
       * Draw a cubic Bézier curve from the current point to the end point
       * specified by x,y. The start control point is specified by x1,y1 and the
       * end control point is specified by x2,y2. Any subsequent triplet(s) of
       * coordinate pairs are interpreted as parameter(s) for implicit absolute
       * cubic Bézier curve (C) command(s). Formulae: Po' = Pn = {x, y} ; Pcs =
       * {x1, y1} ; Pce = {x2, y2}
       */
      case 'C': // (x1,y1, x2,y2, x,y)+
        position = Vector2(...arg.get(-1).toArray());

        return nextControl(current, position, StandardControls(current.position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 1], List(pos.toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 2], List(pos.toArray()));
          }
        ]));

      /**
       * Draw a cubic Bézier curve from the current point to the end point,
       * which is the current point shifted by dx along the x-axis and dy along
       * the y-axis. The start control point is the current point (starting
       * point of the curve) shifted by dx1 along the x-axis and dy1 along the
       * y-axis. The end control point is the current point (starting point of
       * the curve) shifted by dx2 along the x-axis and dy2 along the y-axis.
       * Any subsequent triplet(s) of coordinate pairs are interpreted as
       * parameter(s) for implicit relative cubic Bézier curve (c) command(s).
       * Formulae: Po' = Pn = {xo + dx, yo + dy} ; Pcs = {xo + dx1, yo + dy1} ;
       * Pce = {xo + dx2, yo + dy2}
       */
      case 'c': // (dx1,dy1, dx2,dy2, dx,dy)+
        position = Vector2(...arg.get(-1).toArray()).add(current.position);
        absArg = arg.map(a => List.of(a.get(0) + current.position.x, a.get(1) + current.position.y))

        return nextControl(current, position, StandardControls(current.position, absArg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.subtract(current.position).toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 1], List(pos.subtract(current.position).toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 2], List(pos.subtract(current.position).toArray()));
          }
        ]));

      case 'Q':
        position = Vector2(...arg.get(-1).toArray());

        return nextControl(current, position, StandardControls(current.position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 1], List(pos.toArray()));
          }
        ]));

      case 'q':
        position = Vector2(...arg.get(-1).toArray()).add(current.position);
        absArg = arg.map(a => List.of(a.get(0) + current.position.x, a.get(1) + current.position.y));

        return nextControl(current, position, StandardControls(current.position, absArg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.subtract(current.position).toArray()));
          },
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 1], List(pos.subtract(current.position).toArray()));
          }
        ]));

      case 'T':
        position = Vector2(...arg.get(-1).toArray());

        return nextControl(current, position, StandardControls(current.position, arg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.toArray()));
          }
        ]));

      case 't':
        position = Vector2(...arg.get(-1).toArray()).add(current.position);
        absArg = arg.map(a => List.of(a.get(0) + current.position.x, a.get(1) + current.position.y))

        return nextControl(current, position, StandardControls(current.position, absArg, base, [
          (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 0], List(pos.subtract(current.position).toArray()));
          }
        ]));
      
      case 'A':
        position = Vector2(...arg.get(-1).toArray());

        return nextControl(current, position, ArcControls(current.position, arg, {
          rxry: (host, event) => {
            const pos = SVGCoords(host, event).subtract(current.position); 
            host.paths = host.paths.setIn([...base, 0, 0], pos.x) ;
            host.paths = host.paths.setIn([...base, 1, 0], pos.y);
          },
          angle: (host, event) => {
            const angle = (current.position.getAngle(SVGCoords(host, event))+450)%360;
            host.paths = host.paths.setIn([...base, 2, 0], angle);
          },
          largeArc: (host) => {
            host.paths = host.paths.updateIn([...base, 3, 0], b => b^1);
          },
          sweep: (host) => {
            host.paths = host.paths.updateIn([...base, 4, 0], b => b^1);
          },
          end: (host, event) => {
            const pos = SVGCoords(host, event); 
            host.paths = host.paths.setIn([...base, 5], List(pos.toArray()));
          }
        }));
        
      case 'a':
        return current;

      case 'z':
      case 'Z':
        return current;
    }
  }, previous)
}, {
  position: Vector2(0, 0),
  elements: []
}).elements;

/**
 * Hook for initation of drag event
 * @param {*} handler 
 * @param {*} pathLookup 
 */
const dragHook = (handler, pathLookup) => (host, event) => {
  host.activePath = pathLookup;
  host.drag = handler;
  event.stopPropagation();
};

/**
 * Constructor for standard path controls, suitable for most Path command control points
 * @param {Vector2} pos 
 * @param {List} arg 
 * @param {function[]} handlers 
 */
const StandardControls = (pos, arg, pathLookup, handlers) => svg`
  <g class='handles'>
    ${arg.size === 3 && svg`
      <line x1='${arg.getIn([0,0])}' y1='${arg.getIn([0,1])}' x2='${pos.x}' y2='${pos.y}' />
    `}
    ${arg.map((a, i) => svg`
      <circle cx='${a.get(0)}' cy='${a.get(1)}' r='${3}'
        onmousedown='${dragHook(handlers[i], pathLookup)}'/>
        ${i === arg.size-2 && svg`
          <line x1='${a.get(0)}' y1='${a.get(1)}' x2='${arg.getIn([-1,0])}' y2='${arg.getIn([-1,1])}' />
        `}
      `).toArray()
    }
  </g>`;

/**
 * Constructor for Arc-command path controls
 * @param {Vector2} pos 
 * @param {List} arg 
 * @param {object} handlers 
 */
const ArcControls = (pos, arg, handlers) => svg`
  <g class='handles'>  
    
    <!-- Angle control -->
    <path d='${Utils.describeArc(pos.x, pos.y, 13, 14, 0, 359.99)}'
      class='outer' onmousedown='${dragHook(handlers.angle)}' />  
    <path d='${Utils.describeArc(pos.x, pos.y, 15, 10, 0, arg.getIn([2,0]))}'
      class='inner' onmousedown='${dragHook(handlers.angle)}' />              
    
    <!-- Radius-X, radius-Y controls -->
    <circle cx='${arg.getIn([0,0])+pos.x}' cy='${arg.getIn([1,0])+pos.y}' r='${3}'
      onmousedown='${dragHook(handlers.rxry)}'/>
    <line x1='${arg.getIn([0,0])+pos.x}' y1='${arg.getIn([1,0])+pos.y}'
      x2='${pos.x}' y2='${pos.y}' />
    
    <!-- Boolean Flags: Large arc and sweep -->
    <circle cx='${pos.x+15}' cy='${pos.y}' r='${3}'
      onclick='${handlers.largeArc}' class="${arg.getIn([3,0]) ? 'active' : 'a'}"/>
    <circle cx='${pos.x+30}' cy='${pos.y}' r='${3}'
      onclick='${handlers.sweep}' class="${arg.getIn([4,0]) ? 'active' : 'a'}"/>

    <!-- End point -->
    <circle cx='${arg.getIn([5,0])}' cy='${arg.getIn([5,1])}' r='${3}'
      onmousedown='${dragHook(handlers.end)}'/>  
  
  </g>`;