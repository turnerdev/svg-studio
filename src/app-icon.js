import { html, svg, define } from 'hybrids';
import style from './app-icon.scss';

import feather from 'feather-icons';

/**
 * Generates SVG content for the specified feather icon
 * @param {string} icon Feather icon glyph name
 */
const featherIconSVGContent = (icon) => {
  const content = feather.icons[icon].contents;
  return svg([content]);
}

/**
 * AppIcon - Hybrids wrapper for Feather Icon
 */
export const AppIcon = {
  glyph: '',
  width: 'auto',
  height: 'auto',
  render: ({ glyph, width, height }) => html`
    <svg width='${width}'
        height='${height}'
        viewBox='0 0 24 24'
        preserveAspectRatio='none'
        fill='none' stroke='currentColor'
        stroke-width='2' stroke-linecap='round'
        stroke-linejoin='round'
        class='feather feather-${glyph}'>
      ${featherIconSVGContent(glyph)}
    </svg>  
  `.style(style)
}

define('app-icon', AppIcon);