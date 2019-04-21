import { html, define } from 'hybrids';

import './ui-icon';

import styles from './ui-panel.scss';

/**
 * Toggle the collapsed state of the component
 * @param {Boolean} host 
 */
const toggleState = host => {
  host.collapsed = !host.collapsed;
}

/**
 * Panel component
 */
export const UIPanel = {
  active: false,
  collapsed: false,
  icon: '',
  title: '',
  scrollable: false,
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
          <ui-icon glyph='${icon}' />
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

define('ui-panel', UIPanel);