import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

// Development-only studies page. Guarded by import.meta.env.DEV so the production
// build drops it (and its stylesheet) entirely.
const isPivotDemos = import.meta.env.DEV
  && window.location.pathname.replace(/\/+$/, '').endsWith('/pivot-demos');
const root = createRoot(document.getElementById('root'));

function LoadingShell() {
  return <main className="app-loading" aria-busy="true" aria-label="Đang mở bản đồ lịch sử">
    <p className="app-loading__mark">lịch sử <em>Đảng</em></p>
    <span className="app-loading__line" aria-hidden="true" />
    <p className="app-loading__status">Đang dựng hành trình…</p>
  </main>;
}

function LoadFailure() {
  return <main className="app-loading app-loading--error" role="alert">
    <p className="app-loading__mark">Không thể mở hành trình</p>
    <button type="button" onClick={() => window.location.reload()}>Thử lại</button>
  </main>;
}

if (isPivotDemos) {
  import('./PivotDemos.jsx').then(({ default: PivotDemos }) => {
    root.render(
      <React.StrictMode>
        <PivotDemos />
      </React.StrictMode>,
    );
  });
} else {
  root.render(<LoadingShell />);
  import('./App.jsx')
    .then(({ default: App }) => {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    })
    .catch(() => root.render(<LoadFailure />));
}
