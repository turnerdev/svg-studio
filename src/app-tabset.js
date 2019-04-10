import { children, define, html } from 'hybrids'

import { AppPanel } from './app-panel.js'

import styles from './app-tabset.scss';

const AppTab = Object.assign(AppPanel, {
  render: ({ active }) => active && html`
    <div class='body'>
      <slot></slot>
    </div>
  `
});

const AppTabset = {
  active: ({tabs}) => tabs.filter(tab => tab.active),
  tabs: children(AppTab),
  render: ({ active, tabs }) => html`
    <ul>
      ${tabs.map((tab) => html`
        <li class='${ tab.active && 'active'}' onclick='${() => { active.forEach(a => a.active = false); tab.active = true } }'>${tab.title}</li>
      `)}
    </ul>
    <main>
        <slot></slot>
    </main>
  `.style(styles)
};

define('app-tab', AppTab);

define('app-tabset', AppTabset);

