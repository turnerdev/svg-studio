import { html, svg, define } from 'hybrids';

import * as feather from 'feather-icons';

import style from './ui-icon.scss';

/**
 * Generates SVG content for the specified feather icon
 * @param {string} icon Feather icon glyph name
 */
const featherIconSVGContent = (icon) => {
  const content = feather.icons[icon].contents;
  return svg([content]);
}

/**
 * Feather Icon component
 */
export const UIIcon = {
  glyph: '',
  width: '20',
  height: '20',
  filters: ['glow'],
  render: ({ height, glyph, width }) => html`
    <svg viewBox='0 0 24 24'
        width='${width}' height='${height}'
        preserveAspectRatio='xMinYMin meet'
        fill='none' stroke='currentColor'
        stroke-width='2' stroke-linecap='round'
        stroke-linejoin='round'
        class='feather feather-${glyph}'>
      ${featherIconSVGContent(glyph)}
    </svg>
  `.style(style)
}

define('ui-icon', UIIcon);