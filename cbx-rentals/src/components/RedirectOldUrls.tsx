import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function RedirectOldUrls() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect old rental-cars URL to new vehicles URL
    if (location.pathname === '/reports/rental-cars') {
      navigate('/reports/vehicles', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}