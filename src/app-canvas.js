import { html, define } from 'hybrids';

import styles from './app-canvas.scss';

export const AppCanvas = {
  render: () => html`
    <slot></slot>
  `.style(styles),
};

define('app-canvas', AppCanvas);