import './app.js';

import normalize from 'normalize.css';
import global from './global.scss';

// Inject Roboto font
const font = document.createElement('link');
font.href = 'https://fonts.googleapis.com/css?family=Roboto';
font.rel = 'stylesheet'
document.body.appendChild(font);

// Inject normalize.css + global styles
const styles = document.createElement('style');
styles.innerHTML = normalize + global;
document.body.appendChild(styles);

// Injection application
const app = document.createElement('app-main');
document.body.appendChild(app);
