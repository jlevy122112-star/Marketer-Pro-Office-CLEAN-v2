import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './AppRouter';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
