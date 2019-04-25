/**
 * Internationalization module
 * @module i18n
 */

import { fromJS } from 'immutable';

import en from './resources/en.json'

/**
 * @type {Map} 
 * @private
 */
const labels = fromJS(en);

/**
 * Default behaviour for missing labels
 * Convert from camelCase to Title Case
 * @private
 * @param {string} key
 * @return {string} key converted to title case
 */
const defaultLabel = (key) => key
  .replace(/([A-Z])/g, (match) => ` ${match}`)
  .replace(/^./, (match) => match.toUpperCase());

/**
 * Lookup label by key, falling back to default label if not found
 * @param  {...any} key Lookup path
 */
export const Label = (...key) => {
    if (labels.getIn(key, null) === null) {
        return defaultLabel(key[key.length-1]);
    }
    return labels.getIn(key);
} 

