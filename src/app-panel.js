import { html, define } from 'hybrids';

import './app-icon';

import styles from './app-panel.scss';

/**
 * Toggle the collapsed state of the component
 * @param {Boolean} host 
 */
const toggleState = host => {
  host.collapsed = !host.collapsed;
}

export const AppPanel = {
  active: false,
  collapsed: false,
  icon: '',
  title: '',
  width: '',
  render: ({ title, icon, width, collapsed }) =>  html`
    <style>
      :host {
        ${width && 'width: ' + width + ';' }
        ${title && !collapsed && 'flex: 1'}
      }
    </style>
    ${title && html`
      <div class='header' onclick='${toggleState}'>
        <div class='icon'>
          <app-icon glyph='${icon}' />
        </div>
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