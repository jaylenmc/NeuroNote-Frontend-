import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

if (typeof document !== 'undefined') {
  document.title = 'NeuroNote - Study Smarter, Not Harder';
}

createRoot(document.getElementById('root')).render(<App />);
