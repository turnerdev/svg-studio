import { html, define } from 'hybrids';

import styles from './ui-canvas.scss';

export const UICanvas = {
  render: () => html`
    <div class='wrapper'>
      <slot></slot>
    </div>
  `.style(styles),
};

define('ui-canvas', UICanvas);