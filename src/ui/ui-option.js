import { define, html } from 'hybrids';

import styles from './ui-option.scss';

/**
 * Option component
 */
export const UIOption = {
  selected: undefined,
  options: {},
  render: ({ selected, options }) => html`
    <div class='description'>${options[selected].name}</div>
    <ul>
      <li class='selected'>${selected}</li>
      ${Object.keys(options).map(key => html`
        <li>${key}</li>
      `)}
    </ul>
  `.style(styles)
};

define('ui-option', UIOption);