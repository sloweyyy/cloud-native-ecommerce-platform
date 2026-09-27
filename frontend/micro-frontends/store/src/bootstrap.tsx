import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './services/mocks';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
