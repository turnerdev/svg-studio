import { html, define } from 'hybrids';

import './app-icon';

import styles from './app-panel.scss';

/**
 * Toggle the collapsed state of the component
 * @param {Boolean} host 
 */
function toggleState(host) {
  host.collapsed = !host.collapsed;
}

export const AppPanel = {
  active: false, // boolean
  collapsed: false,
  icon: '',
  name: '',
  title: '',
  width: '',
  render: ({ title, width, icon, collapsed }) =>  html`
    <style>
      :host {
        ${width && 'width: ' + width + ';' }
        ${title && !collapsed && 'flex: 1;' }
      }
    </style>
    ${title && html`
      <div class='header' onclick='${toggleState}'>
        <app-icon glyph='${icon}' class='icon'></app-icon>
        <span>${title}</span>
      </div>
    `}
    ${!collapsed && html`
      <div class='body'>
        <slot></slot>
      </div>
    `}
  `.style(styles),
};

define('app-panel', AppPanel);