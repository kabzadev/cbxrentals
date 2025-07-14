import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import './lib/appInsights' // Initialize Application Insights

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="cbx-rentals-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
