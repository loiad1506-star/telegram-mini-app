import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Đã xóa dòng import './index.css' để chống sập web

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
