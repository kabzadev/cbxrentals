import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { AttendeeList } from '../components/attendees';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, ArrowLeft } from 'lucide-react';

export function AttendeesPage() {
  const { username, logout, userType } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = userType === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">{isAdmin ? 'Attendee Management' : 'Attendee List'}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <span className="text-sm text-gray-600">Welcome, {username}</span>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:justify-between sm:items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Attendee Management' : 'Attendee List'}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOutIcon className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AttendeeList />
      </main>
    </div>
  );
}