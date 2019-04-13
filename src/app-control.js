import { html, define } from 'hybrids';

import styles from './app-control.scss';

export const AppControl = {
  icon: '',
  args: [],
  render: ({ args, icon }) => html`
    ${icon && html`
      <div class='icon' data-icon='${icon}'>${icon}</div>
      <slot></slot>
      ${args.map(arg => arg && html`
        ${arg.map(val => html`
          <div class='arg'>
            ${val}
          </div>
        `)}
      `)}
    `}
  `.style(styles),
};

define('app-control', AppControl);