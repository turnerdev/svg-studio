// Project modules
import { fromJS } from 'immutable';
import { html, define, property } from 'hybrids';
// import "babel-polyfill"

// Local modules
import { ControlFactory } from './control-factory.js';
import { Label as t } from './i18n.js';
import { Path, SVGPath } from './path.js';
import { ButtonState } from './ui';
import * as Utils from './utils.js';

// Resources
import config from './config.json';
import styles from './app.scss';

/**
 * Hook callback for updates to configuration settings
 * @param {object} host AppMain
 * @param {string} key Setting name
 * @param {any} value New setting value
 */
const updateSetting = (host, key, value) => {
  host.config = host.config.setIn(['settings', key], JSON.parse(value) || value);
}

/**
 * Updates SVG path values at a given path
 * @param {object} host AppMain
 * @param {Array.<string>} query Query to path element
 * @param {any} value New path value
 */
const updatePath = (host, query, value) => {
  host.paths = host.paths.setIn(query, parseFloat(value));
}

/**
 * Document mousemove event
 * @param {object} host AppMain
 * @param {MouseEvent} event 
 */
const documentMousemove = (host, event) => {
  if (host.drag) {
    host.drag(host, event, host.config.getIn(['settings', 'snapToGrid']));
  }
};

/**
 * Document mouseup event
 * @param {object} host AppMain
 * @param {MouseEvent} event 
 */
const documentMouseup = (host) => {
  if (host.drag) {
    host.drag = null;
  }
}

/**
 * Mouse move event for dragging
 * @param {object} host AppMain
 * @param {MouseEvent} event 
 */
const canvasDragging = (host, event, offsetX, offsetY) => {
  const { scale } = host.svgProperties.toJS();

  host.svgProperties = host.svgProperties.merge({
    x: Math.round(event.clientX / scale - offsetX),
    y: Math.round(event.clientY / scale - offsetY)
  });
}

/**
 * Canvas drag event initiated
 * @param {object} host AppMain
 * @param {MouseEvent} event 
 */
const canvasDragInit = (host, event) => {
  const { scale, x, y } = host.svgProperties.toJS();
  const offsetX = event.clientX / scale - x;
  const offsetY = event.clientY / scale - y;

  host.drag = (host, event) => canvasDragging(host, event, offsetX, offsetY);
}

/**
 * Canvas zoom-in event, triggered by mousewheel
 * @param {object} host AppMain
 * @param {MouseEvent} event 
 */
const canvasZoom = (host, event) => {
  // Prevent zooming if the user is dragging. Still need to work out issues with
  // track offset where scale changes are drag start
  if (!host.drag) {
    const { zoomMax, zoomMin } = host.config.get('canvas').toJS();
    host.svgProperties = host.svgProperties.update('scale', scale => Math.min(Math.max(zoomMin, scale + (event.deltaY / -10)), zoomMax));
  }
  event.preventDefault();
}

/**
 * Application root component
 */
export const AppMain = {
  activePath: [],
  config: property(fromJS(config)),
  paths: property(fromJS(Object.values(Utils.objMap(config.defaults.paths, Path)))),
  drag: {
    set: (host, value) => { 
      if (value) {
        host.classList.add('dragging');
      } else {
        host.classList.remove('dragging');
      }
      return value;
    }
  },
  svgProperties: property(fromJS({x: 0, y: 0, scale: 1})),
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
  render: ({ activePath, config, paths, svgProperties }) => html`
    <style>
      svg.design {
        background-size: ${config.getIn(['settings','gridSize'])}px ${config.getIn(['settings','gridSize'])}px; 
        transform: scale(${svgProperties.get('scale')}) translate(${svgProperties.get('x')}px, ${svgProperties.get('y')}px);
      }
    </style>
    
    <ui-panel theme='${config.getIn(['sidebar','theme'])}' width='${config.getIn(['sidebar','width'])}' class='sidebar'>

      <div class='logo'>
        <span>svg</span>stud.io
      </div>

      <!-- Config panel -->
      <ui-panel theme='${config.getIn(['sidebar','theme'])}' title='Config' icon='settings' scrollable>
        ${config.get('settings').mapKeys((key, value) => html`
          <ui-control key='${key}' value='${value}' label='${t('settings', key)}'
            onupdate='${(host, event) => updateSetting(host, key, event.detail.value)}' />
        `).toArray().map(i => i[0])}
      </ui-panel>

      <!-- Layers panel -->
      <ui-panel theme='${config.getIn(['sidebar','theme'])}' title='Layers' icon='layers' scrollable>
        ${paths.map((path, i) => html`
          <ui-control active='${activePath[0] === i}' onclick='${host => host.activePath = [i]}'>
            <ui-button icon='eye' onclick='${(host, event) => {
              host.paths = paths.setIn([i, 'visible'], (event.detail === ButtonState.active));
            }}' state='${path.get('visible') ? ButtonState.active : ButtonState.idle}'></ui-button>
            <ui-button icon='link'></ui-button>
            <span>${path.get('name')}</span>
          </ui-control>
        `).toJS().flat()}
      </ui-panel>

      <!-- Path panel -->
      <ui-panel theme='${config.getIn(['sidebar','theme'])}' title='Path' icon='share-2' scrollable>
        ${paths.map((path, pi) => activePath[0] === pi && path.get('d').map((item, ai) => html`
          <ui-control
              id='path-arg-${ai}'
              onupdate='${(host, event) => updatePath(host, [pi, 'd', ai, 'args', ...event.detail.key], event.detail.value)}'
              value='${item.get('args')}']
              active='${activePath[2] === ai}'>
            <ui-option
                selected='${item.get('command')}'
                options='${config.get('commandOptions').toJS()}' />
          </ui-control>
        `)).toJS().flat()}
      </ui-panel>

    </ui-panel> 

    <ui-tabset>

      <ui-tab title='Design' active='${true}' icon='x'>
        <ui-canvas mode='design' onwheel='${canvasZoom}' onmousedown='${canvasDragInit}'>
          <svg class='design ${config.getIn(['settings','gridlines']) && 'gridlines'}'
               height='${config.getIn(['settings','canvasHeight'])}' 
               width='${config.getIn(['settings','canvasWidth'])}'>
            ${paths.filter(p => p.get('visible')).map(SVGPath).toArray()}
            ${paths.filter(p => p.get('visible')).map(ControlFactory).toArray().flat()}
          </svg>
        <ui-canvas>
      </ui-tab>

      <ui-tab title='Render' active='${false}' icon='x'>
        <ui-canvas mode='render'>
          <svg height='${config.getIn(['settings','canvasHeight'])}'
               width='${config.getIn(['settings','canvasWidth'])}'
               class='render'>
            ${paths.map(SVGPath).toArray()}
          </svg>
        <ui-canvas>
      </ui-tab>

      <ui-tab title='Markup' active='${false}' icon='x'>
        <pre>
          &lt;svg height="${config.getIn(['settings','canvasHeight'])}" width="${config.getIn(['settings','canvasWidth'])}" xmlns="http://www.w3.org/2000/svg"&gt;
          ${(() => { 
            return paths.map(SVGPath).toArray().map(x => {
              let fragment = document.createElement('svg');
              x({}, fragment);
              return fragment.innerHTML.trim();
            }).join('\n');
          })()}
          &lt;/svg&gt;
        </pre>
      </ui-tab>

    </ui-tabset>
  `.style(styles),
};

define('app-main', AppMain);