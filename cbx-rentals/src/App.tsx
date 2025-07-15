import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
import { LoginActivityReport } from './pages/reports/LoginActivityReport'
import { CheckInActivityReport } from './pages/reports/CheckInActivityReport'
import { EventAttendanceReport } from './pages/reports/EventAttendanceReport'
import { PaymentReport } from './pages/reports/PaymentReport'
import { UpdateRentalCars } from './pages/admin/UpdateRentalCars'
import { PhotosPage } from './pages/PhotosPage'
import { PhotosManagement } from './pages/admin/PhotosManagement'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { Toaster } from './components/ui/toaster'
import { RedirectOldUrls } from './components/RedirectOldUrls'
import { useAuthStore } from './stores/authStore'

function App() {
  const { refreshAttendeeData, userType } = useAuthStore();

  useEffect(() => {
    // Refresh attendee data on app mount if logged in as attendee
    if (userType === 'attendee') {
      refreshAttendeeData();
    }
  }, [userType]); // Remove refreshAttendeeData from dependencies to avoid hooks error
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
              <Route path="/reports/login-activity" element={<LoginActivityReport />} />
              <Route path="/reports/checkin-activity" element={<CheckInActivityReport />} />
              <Route path="/reports/event-attendance" element={<EventAttendanceReport />} />
              <Route path="/reports/payment" element={<PaymentReport />} />
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
