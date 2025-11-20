import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import './Home.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext'

// Set title immediately before React renders
if (typeof document !== 'undefined') {
  document.title = 'NeuroNote - Study Smarter, Not Harder';
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // {/* </StrictMode>, */}
)
