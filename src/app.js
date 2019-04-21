import { fromJS } from 'immutable';
import { html, define, property, svg } from 'hybrids';
// import "babel-polyfill"

import { ButtonState } from './ui';

import { ControlFactory } from './control-factory.js';
import { Path, getShape } from './path.js';
import { Label } from './label.js';
import config from './config.js';

import styles from './app.scss';

const SVGPath = (path) => svg`
  <path d='${getShape(path)}' fill='transparent' stroke='black' />
`;

/**
 * Document mousemove event
 * 
 * @param {MouseEvent} event host.item
 */
const documentMousemove = (host, event) => {
  if (host.drag) {
    host.drag(host, event);
  }
};

/**
 * Document mouseup event
 * 
 * @param {MouseEvent} event 
 */
const documentMouseup = (host) => {
  if (host.drag) {
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

export const AppMain = {
  activePath: {
    set: (host, value) => {
      return value;
    },
    connect: (host) => {
      host.activePath = [];
      return () => {};
    }
  },
  config: property(fromJS(config)),
  paths: property(fromJS([
    // Path(250, 250, 'M1,1 50,90 100,100 Z', 'Demo path'),
    // Path(250, 250, 'M 10,10 h 10 m  0,10 h 10 m  0,10 h 10 M 40,20 h 10 m  0,10 h 10 m  0,10 h 10 m  0,10 h 10 M 50,50 h 10 m-20,10 h 10 m-20,10 h 10 m-20,10 h 10', 'Relative M'),
    // Path(0, 0, 'M 10,90 C 30,90 25,10 50,10 S 70,90 90,90', 'Cubic Bézier Curve'),
    // Path(0, 0, 'M 110,90 c 20,0 15,-80 40,-80 s 20,80 40,80', 'Relative Cubic Bézier Curve'),
    Path(0, 0, 'M 10,50 Q 25,25 40,50 T 70,50 100,50 130,50 160,50 190,50', 'Quadratic Bézier Curve'),
    Path(0, 0, 'M 250,50 q 15,25 30,0 t 30,0 30,0 30,0 30,0 30,0 30,0 30,0 30,0', 'R. Quadratic Bézier Curve'),
    // Path(0,0,'M167.887711,154.795867 L167.887711,190.100803 C167.887711,194.500728 164.422663,198.067571 160.148308,198.067571 C158.91011,198.067571 157.739826,197.768259 156.702011,197.236091 C156.539564,197.17871 156.377866,197.115427 156.217152,197.046142 L52.2799517,152.238101 C50.1074648,152.2046 48.0237997,151.224996 46.5780596,149.531955 C44.6866607,148.079483 43.46193,145.7581 43.46193,143.142261 L43.46193,51.7966137 C43.2255762,51.4875017 43.0080703,51.1589498 42.8118804,50.812036 L37.8784007,48.7590602 L15.4810125,39.4388042 L15.4810125,257.48227 L43.46193,269.126007 L43.46193,195.845497 C43.46193,195.7315 43.4642559,195.618063 43.4688616,195.505232 C43.41507,194.357499 43.6027576,193.179728 44.0626959,192.049245 C45.7138536,187.990861 50.2484576,186.078742 54.1910181,187.778406 L158.657195,232.81747 L160.677348,233.753264 C164.704954,234.033143 167.887711,237.484821 167.887711,241.701711 L167.887711,257.48227 L195.599295,269.01393 L195.868629,269.126008 L195.868629,142.061974 L167.887711,154.795867 Z M152.408906,158.540402 L95.9641445,134.206677 L73.189736,143.977998 L152.408906,178.129927 L152.408906,158.540402 Z M58.9407354,207.100496 L58.9407354,270.33837 L86.9216527,258.694631 L86.9216527,219.163262 L58.9407354,207.100496 Z M51.3565123,290.832313 C51.304908,290.833358 51.2531799,290.833883 51.2013326,290.833883 C49.1299214,290.833883 47.2485763,289.996206 45.859552,288.631991 L37.8784007,285.310784 L6.45098039,272.232848 C2.79097139,271.600405 0.00220722986,268.323625 0.00220722986,264.376358 L0.00220722986,263.957453 C-0.000729055599,263.826549 -0.000742421639,263.69533 0.00220722986,263.56389 L0.00220722986,27.4057268 C-0.000495457963,27.2852391 -0.0007217962,27.1644824 0.00155948373,27.0435324 C-0.0007217962,26.9225823 -0.000495457963,26.8018256 0.00220722986,26.6813379 L0.00220722986,26.5958188 C0.00220722986,24.1686765 1.05661685,21.9950396 2.71964016,20.5338006 C3.43115611,19.8657922 4.26805464,19.3143242 5.21317771,18.9210289 L48.0405786,1.09920354 C50.202964,-0.147703047 52.8810413,-0.393239574 55.3436985,0.670325098 L95.5305918,18.0261155 C95.6370978,18.0216407 95.7441588,18.0193814 95.8517325,18.0193814 C100.126086,18.0193814 103.591135,21.586225 103.591135,25.9861493 L103.591135,27.0204571 C103.594017,27.1501623 103.594029,27.2801679 103.591135,27.4103786 L103.591135,79.2032217 L152.408906,58.9628634 L152.408906,27.405723 C152.406203,27.2852366 152.405976,27.164481 152.408258,27.0435324 C152.405976,26.9225837 152.406203,26.8018282 152.408906,26.6813418 L152.408906,25.9861493 C152.408906,21.7191014 155.667828,18.2355764 159.763343,18.0290653 L200.447278,1.09920299 C202.609664,-0.147703118 205.28774,-0.393239417 207.750398,0.670325098 L249.616386,18.751278 C253.243214,19.4120397 255.997834,22.6727908 255.997834,26.5958188 L255.997834,27.020437 C256.000715,27.150157 256.000728,27.2801752 255.997834,27.4103987 L255.997834,264.376358 C255.997834,267.315043 254.452135,269.882104 252.151981,271.263055 C251.425318,271.961492 250.564107,272.536933 249.587293,272.943416 L207.92248,290.281453 C205.213141,291.408894 202.265792,290.965475 200.033183,289.367268 L189.351753,284.92239 L157.619877,271.71776 C155.122047,270.678335 153.380134,268.534117 152.710872,266.053624 C152.53213,265.415404 152.428815,264.744274 152.411507,264.051123 C152.406145,263.889175 152.405253,263.726704 152.408906,263.563893 L152.408906,247.395625 L152.305129,247.347551 L152.408906,247.110166 L152.408906,247.395266 L102.400458,225.836281 L102.400458,264.311026 C102.400458,264.548188 102.39039,264.782928 102.370672,265.014821 C102.359676,268.397811 100.3926,271.597206 97.1575405,272.943416 L55.515781,290.271859 C54.1491571,290.840554 52.7219761,291.009573 51.3565123,290.832313 Z M211.347434,270.347963 L240.519028,258.208747 L240.519028,39.8845916 L211.347434,52.023807 L211.347434,78.6542637 C211.347434,81.1685985 210.215907,83.4108873 208.448439,84.8709833 C207.660825,85.8936087 206.617592,86.731 205.364535,87.2686216 L116.047094,125.590121 L155.966757,142.799761 L199.736457,122.880521 C203.645798,121.10141 208.216041,122.921407 209.944376,126.945596 C209.98571,127.041838 210.025046,127.138469 210.062399,127.23544 C210.874444,128.495744 211.347434,130.007637 211.347434,131.63325 L211.347434,270.347963 Z M195.868629,51.7966137 C195.632275,51.4875017 195.414769,51.1589498 195.21858,50.812036 L190.285099,48.7590602 L167.887711,39.4388042 L167.887711,57.9349445 L195.868629,69.5786821 L195.868629,51.7966137 Z M58.9407354,132.829339 L88.1123298,120.313315 L88.1123298,39.8845911 L58.9407354,52.023807 L58.9407354,132.829339 Z M103.591135,96.3806519 L103.591135,113.672159 L179.296667,81.190827 L160.001231,73.1613906 C159.934119,73.1334631 159.867554,73.1047381 159.801539,73.0752308 L103.591135,96.3806519 Z M182.577751,27.0435324 L196.53264,32.8506002 L204.739003,36.2655247 L226.304277,27.2915372 L204.554508,17.8983143 L182.577751,27.0435324 Z M30.171052,27.0435324 L44.1259424,32.8506002 L52.3323038,36.2655247 L73.8975785,27.2915371 L52.1478087,17.8983142 L30.171052,27.0435324 Z', 'test')
    // Path(0, 0, 'M 6,10 A 6 4 10 1 0 14,10', 'Elliptical Arc Curve'),
    Path(0, 0, 'M 300,300 A 6 4 10 1 0 100,100 6 4 10 1 0 400,400', 'R. Elliptical Arc Curve') 
    // Path(0, 0, 'M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z', 'Not Working')
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
  render: ({ activePath, config, paths }) => html`
    <style>
      svg { background-size: ${config.getIn(['settings','gridSize'])}px ${config.getIn(['settings','gridSize'])}px; }
    </style>
    
    <ui-panel theme='${config.getIn(['sidebar','theme'])}' width='${config.getIn(['sidebar','width'])}' class='sidebar'>

      <div class='logo'>
        <span>svg</span>stud.io<br>${JSON.stringify(activePath)}
      </div>

      <!-- Config panel -->
      <ui-panel theme='${config.getIn(['sidebar','theme'])}' title='Config' icon='settings' scrollable>
        ${config.get('settings').mapKeys((key, value) => html`
          <ui-control key='${key}' value='${value}' label='${Label('settings', key)}'
            onupdate='${(host, event) => updateSetting(host, key, event.detail)}' />
        `).toArray().map(i => i[0])}
      </ui-panel>

      <!-- Layers panel -->
      <ui-panel theme='${config.getIn(['sidebar','theme'])}' title='Layers' icon='layers' scrollable>
        ${paths.map((path, i) => html`
          <ui-control active='${activePath[0] === i}'>
            <ui-button icon='eye' onclick='${(host, event) => {
              console.log(event.detail);
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
          <ui-control value='${item.get('args')}' active='${activePath[2] === ai}'>
            <ui-option selected='${item.get('command')}' options='${config.get('commandOptions').toJS()}' />
          </ui-control>
        `)).toJS().flat()}
      </ui-panel>

    </ui-panel> 

    <ui-tabset>

      <ui-tab title='Design' active='${true}' icon='x'>
        <ui-canvas mode='design'>
          <svg width='${config.getIn(['canvas','width'])}' height='${config.getIn(['canvas','height'])}'
               class='design ${config.getIn(['settings','gridlines']) && 'gridlines'}'>
            ${paths.filter(p => p.get('visible')).map(SVGPath).toArray()}
            ${paths.filter(p => p.get('visible')).map(ControlFactory).toArray().flat()}
          </svg>
        <ui-canvas>
      </ui-tab>

      <ui-tab title='Render' active='${false}' icon='x'>
        <ui-canvas mode='render'>
          <svg width='${config.getIn(['canvas','width'])}' height='${config.getIn(['canvas','height'])}' class='render'>
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