import { html, define, svg } from 'hybrids';
// import "babel-polyfill"

import './app-panel.js';
import './app-control.js';
import './app-canvas.js';

import config from './config.js';

import styles from './app-main.scss';

import { Vector2 } from './vector2.js';

/**
 * Return a Path object from the shape of the path
 * @param {string} d Shape of the path
 */
const Path = function(d) {
  if (!this) {
    return new Path(d);
  }
  this.d = d.match(/[a-zA-Z]([^a-zA-Z]*)/g)
            .map(x => ({
              op: x[0],
              args: x.substr(1).split(' ').map(Number).filter(e => e)
            }));
  return this;
}

/**
 * Convert a Path to the shape the shape of a path from a Path object
 * @param {Path} path Path
 */
Path.prototype.getShape = function() {
  return this.d.map(c => c.op + c.args.join(' ')).join(' ');
}

// function path(d) {
//   return svg`<path d='${d}' />`
// }

// function* genPoints(d) {
//   // let last = [0, 0];
//   d.forEach(p => {
//     // last = 
//     yield last;
//   });
// }
// function getPoints() {
//   let res = [];
//   for (var p of genPoints()) {
//     res.push(p);
//   }
//   return res;
// }

const SVGPath = (path) => svg`
  <path d='${path.getShape()}' fill='transparent' stroke='black' />
`;
const SVGElement = SVGPath;

// // Is this a relative operation
// const isRelative = op => op == op.toLowerCase();

const SVGHandles = path => path.d.reduce((a, c) => {
  // current position
  const current = a[a.length-1];

  switch (c.op) {
    // Move the current point to the coordinate x,y.
    // Any subsequent coordinate pair(s) are interpreted as parameter(s) for implicit
    // absolute LineTo (L) command(s) (see below). Formula: Pn = {x, y}
    case 'M': return a.concat(Vector2(c.args[0], c.args[1]));

    case 'v': return a.concat(current && current.clone().add(Vector2(0, c.args[0])));
    case 'h': return a.concat(current && current.clone().add(Vector2(c.args[0], 0)));
    case 'Z': return a;
  }
}, []);


/**
 * 
 * @param {hybrids} host 
 * @param {MouseEvent} event 
 */
const onMousedown = (host, event) => {
  host.selectedPoint = event.target.dataset.key;
}

const Point = (key, x, y) => svg`
  <circle
    class='ad-Point'
    data-key='${key}'
    onmousedown='${onMousedown}'
    fill='transparent'
    stroke='black'
    stroke-width='4'
    cx='${x}'
    cy='${y}' 
    r='${5}' />`.key(key);

/**
 * Document mousemove event
 * @param {MouseEvent} event host.item
 */
const documentMousemove = (host, event) => {
  if (host.selectedPoint >= 0) {
    host.items = [host.items.map((item, i) => {
      if (i === host.selectedPoint) {
        return {
          op: item.op,
          args: [event.layerX, event.layerY]
        };
      }
      return item;
    })];
  }
};

/**
 * Document mouseup event
 * @param {MouseEvent} event 
 */
const documentMouseup = (host) => {
  if (host.selectedPoint >=0 ) {
    host.selectedPoint = -1;
  }
}


const testpath = Path('M 1 1,20 20 v 350 h 200 Z');

export const AppMain = {
  config: config,
  items: [testpath],
  points: {
    get: (host) => host.items.map(SVGHandles)
  },
  selectedPoint: -1,
  init: {
    connect: host => {
      // Add document-level event listeners
      document.addEventListener('mousemove', documentMousemove.bind(undefined, host));
      document.addEventListener('mouseup', documentMouseup.bind(undefined, host));
      return () => {
        // Remove document-level event listeners
        document.removeEventListener('mousemove', documentMousemove.bind(undefined, host));
        document.removeEventListener('mouseup', documentMouseup.bind(undefined, host));
      }
    }
  },
  render: ({ config, items, points }) => html`
    <app-panel theme='${config.sidebar.theme}' width='${config.sidebar.width}'>

      <app-panel theme='${config.sidebar.theme}' title='Config' icon='settings'>
        ${items.map(path => path.d.map(item => html`<app-control icon='${item.op}' args='${item.args}'>${item.args.join(' ')}</app-control>`))}
      </app-panel>

      <app-panel theme='${config.sidebar.theme}' title='Layers' icon='layers'>
        ${items.map(path => path.d.map(item => html`<app-control icon='${item.op}' args='${item.args}'>${item.args.join(' ')}</app-control>`))}
      </app-panel>

      <app-panel theme='${config.sidebar.theme}' title='Path' icon='share-2'>
        ${items.map(path => path.d.map(item => html`<app-control icon='${item.op}'>${item.args.join(' ')}</app-control>`))}
      </app-panel>
 
    </app-panel> 
  
    <app-panel>
      <app-canvas>
        <svg width='${config.canvas.width}' height='${config.canvas.height}'>
          ${items.map(SVGElement)}
          ${points.map((p, i) => Point(i, p.x, p.y))}
        </svg>
      <app-canvas>
    </app-panel>
  `.style(styles),
};

define('app-main', AppMain);