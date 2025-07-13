import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  redirectTo?: string;
}

export function ProtectedRoute({ redirectTo = '/login' }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.userType);
  const attendeeData = useAuthStore((state) => state.attendeeData);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is an attendee who hasn't checked in, redirect to check-in page
  // unless they're already on the check-in page
  if (userType === 'attendee' && attendeeData && !attendeeData.checked_in && !location.pathname.startsWith('/check-in')) {
    return <Navigate to="/check-in" replace />;
  }

  return <Outlet />;
}