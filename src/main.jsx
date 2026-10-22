import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import PivotDemos from './PivotDemos.jsx';
import './style.css';

const isPivotDemos = window.location.pathname.replace(/\/+$/, '').endsWith('/pivot-demos');
const Root = isPivotDemos ? PivotDemos : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
