import { html, define, dispatch } from 'hybrids';

import styles from './ui-button.scss';

export const ButtonState = Object.freeze({idle: 0, active: 1, disabled: 2});

/**
 * Toggle active property of the button
 * @param {*} host 
 * @param {*} event 
 */
const toggleState = (host, event) => {
  if (host.toggle) {
    host.state = host.state === ButtonState.idle ? ButtonState.active : ButtonState.idle;
  }
  dispatch(host, 'click', { detail: host.state });
  event.stopPropagation();
}

/**
 * Button component
 */
export const UIButton = {
  icon: '', 
  label: '',
  toggle: true,
  state: ButtonState.idle,
  render: ({ icon, label, state }) => html`
    <button class='test ${state === ButtonState.active ? 'active' : ''}' onclick='${toggleState}' >
      <ui-icon glyph='${icon}' />
      ${label && html`
        <span>${label}</span>
      `}
    </button>
  `.style(styles)
};

define('ui-button', UIButton);