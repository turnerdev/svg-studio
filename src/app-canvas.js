import { html, define } from 'hybrids';

import styles from './app-canvas.scss';

export const AppCanvas = {
  render: () => html`
    <div class='wrapper'>
      <slot></slot>
    </div>
  `.style(styles),
};

define('app-canvas', AppCanvas);