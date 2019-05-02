/**
 * Control Factory
 * Generates SVG control points and handles from Path objects
 * @todo Requires some refactoring
 * @module control-factory
 */

import { svg } from 'hybrids';
import { List } from 'immutable';

import { Vector2 } from './vector2.js';
import * as Utils from './utils.js';

/**
 * Returns coordinates relative to the SVG canvas from a MouseEvent
 * Screen Coordinates -> World Coordinates
 * @private
 * @param {hybrids} host 
 * @param {MouseEvent} event 
 */
const SVGCoords = (host, event) => {
  const { scale } = host.svgProperties.toJS();
  const { gridSize, snapToGrid } = host.config.get('settings').toJS();
  const step = snapToGrid ? gridSize : host.config.getIn(['defaults', 'gridSize']);
  const box = host.shadowRoot.querySelector('svg').getBoundingClientRect();

  return Vector2(
    Math.round(((Utils.clamp(box.left, box.right, event.clientX) - box.left) / scale) / step) * step, 
    Math.round(((Utils.clamp(box.top, box.bottom, event.clientY) - box.top) / scale) / step) * step
  ); 
}
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
 * Function for reducing path commands into a collection of control points
 * @private
 * @param {*} previous Previous reduction state
 * @param {object} arg Current arguements
 * @param {Array} base Arguements lookup position in its parent path
 * @param {object} options Optional parameters
 * @param {boolean} options.relative Arguement coordinates are relative
 * @param {boolean} options.vertical Vertical arguement
 */
function _refacA(previous, args, base, options) {
  const { vertical, relative } = Object.assign({}, options);
  const arg0 = args.get(-1).toArray();

  // Determine origin position form the first arguement, with consideration for
  // single-parameter arguements such as H(orizontal) and (V)ertical
  const baseline = relative ? [0, 0] : previous.position.toArray();
  const origin = vertical ? baseline.slice(arg0.length).concat(arg0)
                          : arg0.concat(baseline.slice(arg0.length));

  // Determine current position, with consideration for relative arguements
  const position = relative ? Vector2(...origin).add(previous.position)
                            : Vector2(...origin);

  // Control point drag handler
  const handler = (i) => (host, event) => {
    const nextPosition = relative ? SVGCoords(host, event).subtract(previous.position)
                                  : SVGCoords(host, event);

    const argValue = args.get(i).size === 1 ? List.of(vertical ? nextPosition.y : nextPosition.x)
                                           : List(nextPosition.toArray());

    host.paths = host.paths.setIn([...base, i], argValue);
  }

  // Convert arguements to absolute positions
  const vecs = args.map((arg) => {
    const scalar = arg.size === 1;
    const relpos = Vector2(
      scalar && vertical ? relative ? 0 : previous.position.x : arg.get(0),
      scalar ? vertical ? arg.get(0) : relative ? 0 : previous.position.y : arg.get(1)
    );
    return relative ? relpos.clone().add(previous.position) : relpos;
  });

  return {
    position: position,
    elements: [...previous.elements, svg`
      <g class='handles'>
        ${vecs.size === 3 && svg`
          <line x1='${vecs.get(0).x}' y1='${vecs.get(0).y}'
                x2='${previous.position.x}' y2='${previous.position.y}' />
        `}
        ${vecs.map((pos, i) => svg`
          ${i === vecs.size-2 && svg`
            <line x1='${pos.x}' y1='${pos.y}'
                  x2='${vecs.get(-1).x}' y2='${vecs.get(-1).y}' />
          `}
          <circle cx='${pos.x}' cy='${pos.y}' r='${3}'
                  onmousedown='${dragHook(handler(i), base)}'/>
        `).toArray()}
      </g>
    `]
  }
}

/**
 * Function for reducing elliptical arc curves into a collection of control points
 * @private
 * @todo Implement handlers for large arc and sweep flags
 * @param {*} previous Previous reduction state
 * @param {object} arg Current arguements
 * @param {Array} base Arguements lookup position in its parent path
 * @param {object} options Optional parameters
 * @param {boolean} options.relative Arguement coordinates are relative
 */
function _refacB(previous, args, base, options) {
  const { relative } = Object.assign({}, options);
  const arg0 = args.slice(-2).toArray()
  const position = relative ? Vector2(...arg0).add(previous.position)
                            : Vector2(...arg0);

  // Handler for the radius control(s) (_, _, rx, ry, _, _, _)
  const handlerRadius = (host, event) => {
    const next = SVGCoords(host, event).subtract(position);
    host.paths = host.paths.updateIn([...base], arg => List.of(Math.abs(next.x), Math.abs(next.y), ...arg.slice(2)));
  }
  
  // Handler for the angle control (_, _, degrees, _, _, _, _)
  const handleAngle = (host, event) => {
    const angle = (position.getAngle(SVGCoords(host, event)) + 450) % 360;
    host.paths = host.paths.setIn([...base, 2], angle);
  }

  // Handler for the endpoint control (_, _, _, _, _, x, y)
  const handlerEnd = (host, event) => {
    const nextPosition = relative ? SVGCoords(host, event).subtract(previous.position)
                                  : SVGCoords(host, event);
    host.paths = host.paths.setIn([...base, 5], nextPosition.x)
                           .setIn([...base, 6], nextPosition.y);
  }

  return {
    position: position,
    elements: [...previous.elements, svg`
      <g class='handles arc'>

        <!-- Radius-x, Radius-y -->
        <line x1='${position.x - args.get(0)}' y1='${position.y - args.get(1)}'
              x2='${position.x + args.get(0)}' y2='${position.y + args.get(1)}'
              class='radius'
              onmousedown='${dragHook(handlerRadius, base)}'/>  

        <line x1='${position.x - args.get(0)}' y1='${position.y + args.get(1)}'
              x2='${position.x + args.get(0)}' y2='${position.y - args.get(1)}'
              class='radius'
              onmousedown='${dragHook(handlerRadius, base)}'/>  
        
        <!-- Angle control -->
        <path d='${Utils.describeArc(position.x, position.y, 9, 11, 0, 359.99)}'
          class='outer' onmousedown='${dragHook(handleAngle, base)}' />  
          
        <path d='${Utils.describeArc(position.x, position.y, 10, 9, 0, args.get(2))}'
          class='inner' onmousedown='${dragHook(handleAngle, base)}' />      

        <!-- End point -->
        <circle cx='${position.x}' cy='${position.y}' r='${3}'
          onmousedown='${dragHook(handlerEnd, base)}'/>  

      </g>
    `]
  };
}

/**
 * Control Factory
 * Returns a list of controls for the provided path
 * @param {Path} path 
 */
export const ControlFactory = (path, pi) => path.get('d').reduce((previous, c, di) => {

  return c.get('args').reduce((current, arg, ai) => {

    // Base path to the argument tuple
    // Path idx > 'd' param > D command idx > 'args' param > arg idx
    const base = [pi, 'd', di, 'args', ai];

    
    const lcCommand = c.get('command').toLowerCase();
    const relative = c.get('command') === lcCommand;

    return lcCommand === 'a' ? _refacB(current, arg, base, {relative: relative})
                             : _refacA(current, arg, base, {relative: relative, vertical: lcCommand === 'v' })
 
  }, previous)
}, {
  position: Vector2(0, 0),
  elements: []
}).elements.reverse(); // Render last first; userful for underlaying control point guides