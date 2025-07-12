import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AttendeesPage } from './pages/AttendeesPage'
import { AttendeeDetailsPage } from './pages/AttendeeDetailsPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/attendees" element={<AttendeesPage />} />
            <Route path="/attendees/:id" element={<AttendeeDetailsPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  )
}

export default App
