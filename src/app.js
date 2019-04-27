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
 * Document mousemove event
 * 
 * @param {MouseEvent} event host.item
 */
const documentMousemove = (host, event) => {
  if (host.drag) {
    host.classList.add('dragging');
    host.drag(host, event, host.config.getIn(['settings', 'snapToGrid']));
  }
};

/**
 * Document mouseup event
 * 
 * @param {MouseEvent} event 
 */
const documentMouseup = (host) => {
  if (host.drag) {
    host.classList.remove('dragging');
    host.drag = null;
  }
}

/**
 * Hook callback for updates to configuration settings
 * 
 * @param {*} host 
 * @param {*} key 
 * @param {*} value 
 */
const updateSetting = (host, key, value) => {
  host.config = host.config.setIn(['settings', key], JSON.parse(value) || value);
}

/**
 * 
 * @param {*} host 
 * @param {*} event 
 */
const canvasZoom = (host, event) => {
  const { zoomMax, zoomMin } = host.config.get('canvas').toJS();
  const el = host.shadowRoot.querySelector('svg');
  let scale = (parseFloat(el.dataset.scale) || 1) + (event.deltaY / -10);
  scale = Math.min(Math.max(zoomMin, scale), zoomMax);
  el.style.transform = `scale(${scale})`;
  el.dataset.scale = scale;
  event.preventDefault();
}

/**
 * 
 * @param {*} host 
 * @param {*} event 
 */
const canvasDrag = (host) => {
  host.drag = (host, event) => {
    console.log(event);
  }
}

export const AppMain = {
  activePath: [],
  config: property(fromJS(config)),
  paths: property(fromJS(Object.values(Utils.objMap(config.defaults.paths, Path)))),
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
  render: ({ activePath, config, paths }) => html`
    <style>
      svg { background-size: ${config.getIn(['settings','gridSize'])}px ${config.getIn(['settings','gridSize'])}px; }
    </style>
    
    <ui-panel theme='${config.getIn(['sidebar','theme'])}' width='${config.getIn(['sidebar','width'])}' class='sidebar'>

      <div class='logo'>
        <span>svg</span>stud.io<br>
      </div>

      <!-- Config panel -->
      <ui-panel theme='${config.getIn(['sidebar','theme'])}' title='Config' icon='settings' scrollable>
        ${config.get('settings').mapKeys((key, value) => html`
          <ui-control key='${key}' value='${value}' label='${t('settings', key)}'
            onupdate='${(host, event) => updateSetting(host, key, event.detail)}' />
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
              value='${item.get('args')}'
              active='${activePath[2] === ai}'>
            <ui-option
                selected='${item.get('command')}'
                options='${config.get('commandOptions').toJS()}' />${activePath[2] === ai}
          </ui-control>
        `)).toJS().flat()}
      </ui-panel>

    </ui-panel> 

    <ui-tabset>

      <ui-tab title='Design' active='${true}' icon='x'>
        <ui-canvas mode='design' onwheel='${canvasZoom}' onmousedown='${canvasDrag}'>
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
          <svg width='${config.getIn(['settings','canvasWidth'])}'
               height='${config.getIn(['settings','canvasHeight'])}'
               class='render'>
            ${paths.map(SVGPath).toArray()}
          </svg>
        <ui-canvas>
      </ui-tab>

      <ui-tab title='Markup' active='${false}' icon='x'>
        <pre>
          ${(() => { 
            return paths.map(SVGPath).toArray().map(x => {
              let fragment = document.createElement('svg');
              x({}, fragment);
              return fragment.outerHTML;
            }).join('\n');
          })()}
        </pre>
      </ui-tab>

    </ui-tabset>
  `.style(styles),
};

define('app-main', AppMain);