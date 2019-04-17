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
  dispatch(host, 'update', { detail: !host.value })
}

const setValue = (host, event) => {
  dispatch(host, 'update', { detail: event.target.value })
}

export const AppControl = {
  datatype: {
    get: (host) => typeof host.value
  },
  key: undefined,
  label: undefined,
  editing: false,
  value: undefined,
  update: undefined,
  render: ({ icon, label, value, datatype }) => html`
    ${icon && html`
      <div class='icon' data-icon='${icon}'>${icon}</div>
    `}
    ${datatype === 'boolean' && html`
      <div class='checkbox' onclick='${toggleValue}'>
        <div class='toggle ${value}'>
        </div>
        <span>${label}</span>
      </div>
    `}
    ${datatype === 'number' && html`
      <div class='number' onclick='${host => host.editing = true}'>
        <span>${label}</span>
        <input type='number' 
          onblur='${host => host.editing = false}'
          onload='${(host, event) => event.target.focus()}'
          onkeyup='${(host, event) => { setValue(host, event); event.KeyCode === 13 && (host.editing = false); }}'
          value='${value}'>
      </div>
    `}
    <slot></slot>
  `.style(styles)
};

define('app-control', AppControl);