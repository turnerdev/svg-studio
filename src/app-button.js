import { html, define } from 'hybrids';

import styles from './app-button.scss';

export const AppButton = {
  icon: '', 
  label: '',
  render: ({ icon, label }) => html`
    <app-icon glyph='${icon}' />
    ${label && html`
      <span>${label}</span>
    `}
  `.style(styles),
};

define('app-button', AppButton);