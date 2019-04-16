import { children, define, html } from 'hybrids'

import { AppPanel } from './app-panel.js'

import styles from './app-tabset.scss';

const select = (host, tab) => {
  host.tabs.filter(t => t.active).forEach(t => t.active = false);
  tab.active = true;
};

const AppTab = Object.assign(AppPanel, {
  render: ({ active }) => !active ? html`<div/>` : html`
    <slot></slot>
  `
});

const AppTabset = {
  active: ({ tabs }) => tabs.filter(tab => tab.active),
  tabs: children(AppTab),
  render: ({ active, tabs }) => html`
    <ul>
      ${tabs.map((tab) => html`
        <li class='${~active.indexOf(tab) && 'active'}' onclick='${host => select(host, tab)}'>${tab.title}</li>
      `)}
    </ul>
    <main>
      <slot></slot>
    </main>
  `.style(styles)
};

define('app-tab', AppTab);

define('app-tabset', AppTabset);

