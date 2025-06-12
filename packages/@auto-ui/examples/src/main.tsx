import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Keep Tailwind CSS import
import { EndToEndDemoPage } from './pages/EndToEndDemoPage'; // Import the new page

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EndToEndDemoPage />
  </React.StrictMode>
);
