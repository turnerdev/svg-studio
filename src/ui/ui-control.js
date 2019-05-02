import { html, define, dispatch } from 'hybrids';
import { isImmutable } from 'immutable'

import styles from './ui-control.scss';

/**
 * Dispatch an event to invert a boolean value
 * @param {object} host UIControl
 */
const toggleValue = host => {
  dispatch(host, 'update', { detail: { value: !host.value }})
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
const setValue = (host, event, key) => {
  dispatch(host, 'update', { detail: { value: event.target.value, key: key }})
}

export const UIControl = {
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
    ${isImmutable(value) && immutableControl(value, [])}
  `.style(styles)
};

/**
 * Generates tree of controls from a deep Immutable List
 * @todo Refactor and inline
 * @param {Immutable} value 
 */
function immutableControl(value, key) {
  if (isImmutable(value)) {
    return html`<div class='group'>${value.map((v,i,) => immutableControl(v, [...key, i])).toArray()}</div>`;
  }
  return getInput(value, key);
}

/**
 * Returns an appropriate HTML input element based on an input value
 * @param {*} value 
 */
function getInput(value, key) {
  if (typeof value === 'number') {
    return html`<input type='number' step='any' value='${value}' oninput='${(host, event) => setValue(host, event, key)}'/>`;
  }
  return html`<input type='text' value='${value}' oninput='${(host, event) => setValue(host, event, key)}'/>`;
}

define('ui-control', UIControl); 