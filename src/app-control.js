import { html, define } from 'hybrids';

import styles from './app-control.scss';

export const AppControl = {
  icon: '',
  args: [],
  render: ({ args, icon }) => html`
    ${icon && html`
      <div class='icon' data-icon='${icon}'>${icon}</div>
      ${args.map(arg => html`
        <div class='arg'>
          ${arg}
        </div>
      `)}
    `}
  `.style(styles),
};

define('app-control', AppControl);