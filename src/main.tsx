// Ensure window.fetch is safely writeable in sandboxed/iframe environments
try {
  const desc = Object.getOwnPropertyDescriptor(Window.prototype, 'fetch') || Object.getOwnPropertyDescriptor(window, 'fetch');
  if (!desc || (desc.get && !desc.set)) {
    const origFetch = window.fetch ? window.fetch.bind(window) : null;
    let currentFetch = origFetch;
    Object.defineProperty(window, 'fetch', {
      get: () => currentFetch,
      set: (fn) => { currentFetch = fn; },
      configurable: true,
      enumerable: true
    });
  }
} catch {
  // Ignore polyfill guard errors
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
