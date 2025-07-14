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
import { PhotosPage } from './pages/PhotosPage'
import { PhotosManagement } from './pages/admin/PhotosManagement'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { Toaster } from './components/ui/toaster'
import { RedirectOldUrls } from './components/RedirectOldUrls'

function App() {
  return (
    <>
      <Router>
        <RedirectOldUrls />
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
              <Route path="/photos" element={<PhotosPage />} />
              <Route path="/reports/vehicles" element={<VehicleReport />} />
              <Route path="/reports/rental-cars" element={<Navigate to="/reports/vehicles" replace />} />
              <Route path="/reports/ride-share" element={<RideShareReport />} />
              <Route path="/admin/update-rental-cars" element={<UpdateRentalCars />} />
              <Route path="/admin/photos" element={<PhotosManagement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  )
}

export default App
