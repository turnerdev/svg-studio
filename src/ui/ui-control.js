import { html, define, dispatch } from 'hybrids';
import { isImmutable } from 'immutable'

import styles from './ui-control.scss';

/**
 * Dispatch an event to invert a boolean value
 * @param {object} host UIControl
 */
const toggleValue = host => {
  dispatch(host, 'update', { detail: !host.value })
}

/**
 * Dispatch an event to indicate that control has been activated
 * @param {object} host UIControl
 */
const activate = (host) => {
  // Scroll on next tick to ensure DOM has updated
  setImmediate(() => {
    host.scrollIntoView({ behavior: 'smooth' });
  });
}

/**
 * Dispatch an event to update a value
 * @param {object} host UIControl
 * @param {Event} event 
 */
const setValue = (host, event) => {
  dispatch(host, 'update', { detail: event.target.value })
}

/**
 * Proof of concept for traits
 */
// const orderable = {
//   orderable: {
//     connect: host => {
//       const clickTest = (host, event) => {
//         console.log(host);
//         console.log(event);
//         alert('click test');
//       }
//       host.addEventListener('click', clickTest);
//       return () => {
//         host.removeEventListener('click', clickTest);
//       }
//     }
//   }
// }
// console.log(orderable);

export const UIControl = {
  // ...orderable,
  active: {
    set: (host, value, lastValue) => {
      if (value && lastValue === false) {
        activate(host);
      }
      // TODO: Investigate why attributes aren't bound to descriptors
      if (value) {
        host.setAttribute('active', 'active');
      } else {
        host.removeAttribute('active');
      }
      return value;
    },
    connect: (host) => {
      host.active = false;
      return () => {};
    }
  },
  key: undefined,
  label: undefined,
  value: undefined,
  update: undefined,
  render: ({ icon, label, value }) => html`
    ${icon && html`
      <div class='icon' data-icon='${icon}'>${icon}</div>
    `}
    ${typeof value === 'boolean' && html`
      <div class='checkbox' onclick='${toggleValue}'>
        <div class='toggle ${value}'></div>
        <span>${label}</span>
      </div>
    `}
    ${typeof value === 'number' && html`
      <div class='number'>
        <span>${label}</span>
        <input type='number' value='${value}'
            onload='${(host, event) => event.target.focus()}'
            oninput='${setValue}'>
      </div>
    `}
    <slot></slot>
    ${isImmutable(value) && immutableControl(value)}
  `.style(styles)
};

/**
 * Generates tree of controls from a deep Immutable List
 * @todo Refactor and inline
 * @param {Immutable} value 
 */
function immutableControl(value) {
  if (isImmutable(value)) {
    return html`<div class='group'>${value.map(immutableControl).toArray()}</div>`;
  }
  return getInput(value);
}

/**
 * Returns an appropriate HTML input element based on an input value
 * @param {*} value 
 */
function getInput(value) {
  if (typeof value === 'number') {
    return html`<input type='number' step='any' value='${value}' />`;
  }
  return html`<input type='text' value='${value}' />`;
}

define('ui-control', UIControl);