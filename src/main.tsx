import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useTheme } from './store/useTheme'

// Initialize theme on mount
if (typeof document !== 'undefined') {
  const theme = useTheme.getState().theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

