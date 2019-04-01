import { svg, define } from 'hybrids';

export const SvgPath = {
    render: () => svg`
        <circle cx='20' cy='20' r='10' fill='red' />
    `,
  };

define('svg-path', SvgPath);
