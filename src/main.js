/**
 * Flow State - Application Entry Point
 */

import './assets/css/style.css';
import { FlowApp } from './App.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    globalThis.flowState = new FlowApp();
});
