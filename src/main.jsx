import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

// Development-only studies page. Guarded by import.meta.env.DEV so the production
// build drops it (and its stylesheet) entirely.
const isPivotDemos = import.meta.env.DEV
  && window.location.pathname.replace(/\/+$/, '').endsWith('/pivot-demos');
const root = createRoot(document.getElementById('root'));

if (isPivotDemos) {
  import('./PivotDemos.jsx').then(({ default: PivotDemos }) => {
    root.render(
      <React.StrictMode>
        <PivotDemos />
      </React.StrictMode>,
    );
  });
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
