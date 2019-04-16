import { html, define, dispatch } from 'hybrids';

import styles from './app-control.scss';

/**
 * Coerce potential string data to appropriate JS datatype
 * @param {*} data 
 */
// const coerce = (data) => {
//   if (typeof data === 'string') {
//     try {
//       return JSON.parse(data) || data;
//     } catch(e) { e }
//   }
//   return data;
// }

const toggleValue = host => {
  // console.log(host);
  dispatch(host, 'update', { detail: !host.value })
}

export const AppControl = {
  key: undefined,
  value: undefined,
  datatype: {
    get: (host) => typeof host.value
  },
  update: undefined,
  render: ({ icon, value, datatype }) => html`
    ${icon && html`
      <div class='icon' data-icon='${icon}'>${icon}</div>
    `}
    ${datatype === 'boolean' && html`
      <div class='toggle' onclick='${toggleValue}'>
        <div class='switch'>
        </div>
        <span>Toggle: ${value}</span>
      </div>
    `}
    <slot></slot>
  `.style(styles),
};

define('app-control', AppControl);