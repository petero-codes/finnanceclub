import React from 'react'
import ReactDOM from 'react-dom/client'

// Polyfill window.matchMedia and listener methods for automated/headless browser compatibility
if (typeof window !== 'undefined') {
  // Disable right-click context menu globally for client-side security
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as any);
  } else {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query) => {
      const res = originalMatchMedia(query);
      if (res) {
        if (!res.addListener) res.addListener = () => {};
        if (!res.removeListener) res.removeListener = () => {};
        if (!res.addEventListener) res.addEventListener = () => {};
        if (!res.removeEventListener) res.removeEventListener = () => {};
      }
      return res;
    };
  }
}

import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
