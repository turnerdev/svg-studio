import { JSDOM } from '@tbranyen/jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.NodeFilter = dom.window.NodeFilter;
global.Node = dom.window.Node;
global.SVGElement = dom.window.SVGElement;
global.ActiveXObject = true;
global.window.HTMLElementActiveXObject = true;

function noop() {
    return null;
}

require.extensions['.css'] = noop;
require.extensions['.scss'] = noop;