import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { EventsPage } from './pages/EventsPage'
import { AttendeesPage } from './pages/AttendeesPage'
import { AttendeeDetailsPage } from './pages/AttendeeDetailsPage'
import { PropertyDetailsPage } from './pages/PropertyDetailsPage'
import { CheckInPage } from './pages/CheckInPage'
import { CheckInWizard } from './pages/CheckInWizard'
import { MapPage } from './pages/MapPage'
import { VehicleReport } from './pages/reports/VehicleReport'
import { RideShareReport } from './pages/reports/RideShareReport'
import { UpdateRentalCars } from './pages/admin/UpdateRentalCars'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/check-in/wizard" element={<CheckInWizard />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/attendees" element={<AttendeesPage />} />
              <Route path="/attendees/:id" element={<AttendeeDetailsPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/reports/rental-cars" element={<VehicleReport />} />
              <Route path="/reports/ride-share" element={<RideShareReport />} />
              <Route path="/admin/update-rental-cars" element={<UpdateRentalCars />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  )
}

export default App
