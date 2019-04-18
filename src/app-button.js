import { html, define, dispatch } from 'hybrids';

import styles from './app-button.scss';

export const ButtonState = Object.freeze({idle: 0, active: 1, disabled: 2});

const toggleState = (host, event) => {
  if (host.toggle) {
    host.state = host.state === ButtonState.idle ? ButtonState.active : ButtonState.idle;
  }

  dispatch(host, 'click', { detail: host.state });
  event.stopPropagation();
}

export const AppButton = {
  icon: '', 
  label: '',
  toggle: true,
  state: ButtonState.idle,
  render: ({ icon, label, state }) => html`
    <button class='test ${state === ButtonState.active ? 'active' : ''}' onclick='${toggleState}' >
      <app-icon glyph='${icon}' />
      ${label && html`
        <span>${label}</span>
      `}
    </button>
  `.style(styles)
};

define('app-button', AppButton);