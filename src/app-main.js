import { fromJS } from 'immutable';
import { html, define, property, svg } from 'hybrids';
// import "babel-polyfill"

import './app-panel.js';
import './app-control.js';
import './app-canvas.js';
import './app-tabset.js';

import config from './config.js';

import styles from './app-main.scss';

import { ControlFactory } from './control-factory.js';
import { Path, getShape } from './path.js';

//   <g transform="translate(${path.get('x')}, ${path.get('y')})")>  </g>
const SVGPath = (path) => svg`
  <path d='${getShape(path)}' fill='transparent' stroke='black' />
`;

/**
 * Document mousemove event
 * @param {MouseEvent} event host.item
 */
const documentMousemove = (host, event) => {
  if (host.drag) {
    host.drag(host, event);
  }
};

/**
 * Document mouseup event
 * @param {MouseEvent} event 
 */
const documentMouseup = (host) => {
  if (host.drag) {
    host.drag = null;
  }
}

export const AppMain = {
  config: config,
  paths: property(fromJS([
    // Path(250, 250, 'M1,1 50,90 100,100 Z', 'Demo path'),
    // Path(250, 250, 'M 10,10 h 10 m  0,10 h 10 m  0,10 h 10 M 40,20 h 10 m  0,10 h 10 m  0,10 h 10 m  0,10 h 10 M 50,50 h 10 m-20,10 h 10 m-20,10 h 10 m-20,10 h 10', 'Relative M'),
    // Path(0, 0, 'M 10,90 C 30,90 25,10 50,10 S 70,90 90,90', 'Cubic Bézier Curve'),
    // Path(0, 0, 'M 110,90 c 20,0 15,-80 40,-80 s 20,80 40,80', 'Relative Cubic Bézier Curve'),
    // Path(0, 0, 'M 10,50 Q 25,25 40,50 T 70,50 100,50 130,50 160,50 190,50', 'Quadratic Bézier Curve'),
    // Path(0, 0, 'M 250,50 q 15,25 30,0 t 30,0 30,0 30,0 30,0 30,0', 'R. Quadratic Bézier Curve'),
    // Path(0, 0, 'M 6,10 A 6 4 10 1 0 14,10', 'Elliptical Arc Curve') 
    Path(0, 0, 'M 300,300 A 6 4 10 1 0 100,100 6 4 10 1 0 400,400', 'R. Elliptical Arc Curve') 
    // TODO relative cubi
    // Path('M1,1 50,90 100,100 v 50 h 50 V 350 H450 Z', 'Test path')
    // Cubic Bézier curve with absolute coordinates
    // Path('M 10,90 C 30,90 25,10 50,10 S 70,90 90,90', 'Beizier path')
  ])),
  drag: undefined,
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
  render: ({ config, paths }) => html`
    <app-panel theme='${config.sidebar.theme}' width='${config.sidebar.width}'>

      <!-- Config panel -->
      <app-panel theme='${config.sidebar.theme}' title='Config' icon='settings'>
        ${Object.keys(config.settings).map(key => html`
          <app-control icon='S'>${key}</app-control>
        `)}
      </app-panel>

      <!-- Layers panel -->
      <app-panel theme='${config.sidebar.theme}' title='Layers' icon='layers'>
        ${paths.map((path, i) => html`
          <app-control icon='${i+1}'>
            <span>${path.get('name')}</span>
          </app-control>
        `).toJS().flat()}
      </app-panel>

      <!-- Path panel -->
      <app-panel theme='${config.sidebar.theme}' title='Path' icon='share-2'>
        ${paths.map(path => path.get('d').map(item => html`
          <app-control icon='${item.get('command')}' args='${item.get('args').toJS()}'/>
        `)).toJS().flat()}
      </app-panel>

    </app-panel> 

    <app-tabset>

      <app-tab title='Design' active='${true}' icon='x'>
        <app-canvas>
          <svg width='${config.canvas.width}' height='${config.canvas.height}'>
            ${paths.map(SVGPath).toArray()}
            ${paths.map(ControlFactory).toArray().flat()}
          </svg>
        <app-canvas>
      </app-tab>

      <app-tab title='Render' active='${false}' icon='x'>
      
      </app-tab>

      <app-tab title='Markup' active='${false}' icon='x'>
        <pre>
          ${(() => { 
            return paths.map(SVGPath).toArray().map(x => {
              let fragment = document.createElement('svg');
              x({}, fragment);
              return fragment.outerHTML;
            }).join('\n');
          })()}
        </pre>white
      </app-tab>

    </app-tabset>
  `.style(styles),
};

define('app-main', AppMain);