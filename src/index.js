import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/archive.css';
import App from './App';
import { shouldMountSpa } from './seo/hydrate';

const rootEl = document.getElementById('root');
if (shouldMountSpa(window.location.pathname, rootEl)) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
