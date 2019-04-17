import { fromJS } from 'immutable';

const labels = fromJS({
    settings: {
    }
});

/**
 * Default behaviour for missing labels
 * Convert from camelCase to Title Case
 * @param {*} key 
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

