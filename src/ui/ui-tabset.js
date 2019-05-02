import { children, define, html } from 'hybrids'

import { UIPanel } from './ui-panel.js'

import styles from './ui-tabset.scss';

/**
 * Display the specified tab
 * @param {hybrids} host UITabset
 * @param {hybrids} tab UITab
 */
const select = (host, tab) => {
  host.tabs.filter(t => t.active).forEach(t => t.active = false);
  tab.active = true; // bad practice?
};

/**
 * Tab component
 */
const UITab = Object.assign(UIPanel, {
  color: 'inherit',
  backgroundColor: 'inherit',
  render: ({ active }) => !active ? html`<div/>` : html`
    <slot></slot>
  `
});

/**
 * Tabset component
 */
export const UITabset = {
  active: ({ tabs }) => tabs.filter(tab => tab.active),
  tabs: children(UITab),
  render: ({ tabs }) => html`
    <ul>
      ${tabs.map((tab) => html`
        <li class='${tab.active && 'active'}' onclick='${host => select(host, tab)}'>
          ${tab.title}
        </li>
      `)}
    </ul>
    <main>
      <slot></slot>
    </main>
  `.style(styles)
};

define('ui-tab', UITab);

define('ui-tabset', UITabset);

