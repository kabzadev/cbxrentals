import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import './lib/appInsights' // Initialize Application Insights

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="cbx-rentals-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>
)
