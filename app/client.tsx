import { hydrateRoot } from 'react-dom/client';
import App from './App';
import './globals.css';
import type { Page } from './pages';

declare global {
  interface Window {
    __PAGE__: Page;
  }
}

hydrateRoot(
  document.getElementById('root')!,
  <App page={window.__PAGE__} pathname={window.location.pathname} />,
);
