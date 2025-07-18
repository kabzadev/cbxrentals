import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, LogOut, UserCheck, Menu, X, CalendarIcon, MapPin, FileText, ChevronDown, Car, UserPlus, Camera, Activity, LogIn, CalendarCheck, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, username, userType, attendeeData } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/events', label: 'Events', icon: CalendarIcon },
    { path: '/attendees', label: 'Attendees', icon: Users },
    { path: '/map', label: 'Map', icon: MapPin },
    { path: '/check-in', label: 'Guest Check-In', icon: UserCheck },
    { path: '/photos', label: 'Photos', icon: Camera },
  ].filter(item => {
    // Hide Guest Check-In for admin and attendee users
    if (item.path === '/check-in' && (userType === 'admin' || userType === 'attendee')) {
      return false;
    }
    return true;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#303030] border-b border-[#505050]">
      <div className="w-full sm:max-w-7xl sm:mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-[#e50914]">
                CBX Experience
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      isActive(item.path)
                        ? "border-[#e50914] text-white"
                        : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Reports Dropdown - Only for admin */}
              {userType === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                        location.pathname.startsWith('/reports')
                          ? "border-[#e50914] text-white"
                          : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200"
                      )}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Reports
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#303030] border-[#505050]">
                    <DropdownMenuItem 
                      onClick={() => navigate('/reports/vehicles')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Vehicles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/reports/ride-share')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ride Share Requests
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/reports/login-activity')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login Activity
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/reports/checkin-activity')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Check-In Activity
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/reports/event-attendance')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4 mr-2" />
                      Event Attendance
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/reports/payment')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payment Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Admin Menu - Only for admin */}
              {userType === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                        location.pathname.startsWith('/admin')
                          ? "border-[#e50914] text-white"
                          : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200"
                      )}
                    >
                      Admin
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#303030] border-[#505050]">
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin/photos')}
                      className="text-gray-200 hover:bg-[#505050] hover:text-white cursor-pointer"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Manage Photos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <span className="text-sm text-gray-400 mr-4">
              Welcome, {username}
            </span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="ml-2 text-gray-400 hover:text-white hover:bg-[#505050]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#505050]"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#303030]">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                    isActive(item.path)
                      ? "bg-black border-[#e50914] text-white"
                      : "border-transparent text-gray-400 hover:bg-[#505050] hover:border-gray-600 hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
            
            {/* Reports Section - Only for admin */}
            {userType === 'admin' && (
              <>
                <div className="pl-3 pr-4 py-2 text-sm font-medium text-gray-400">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </div>
                </div>
                <Link
                  to="/reports/vehicles"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/reports/vehicles'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2" />
                    Vehicles
                  </div>
                </Link>
                <Link
                  to="/reports/ride-share"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/reports/ride-share'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ride Share Requests
                  </div>
                </Link>
                <Link
                  to="/reports/login-activity"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/reports/login-activity'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login Activity
                  </div>
                </Link>
                <Link
                  to="/reports/checkin-activity"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/reports/checkin-activity'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Check-In Activity
                  </div>
                </Link>
                <Link
                  to="/reports/event-attendance"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/reports/event-attendance'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Event Attendance
                  </div>
                </Link>
                <Link
                  to="/reports/payment"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/reports/payment'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payment Report
                  </div>
                </Link>
                
                {/* Admin Section */}
                <div className="pl-3 pr-4 py-2 text-sm font-medium text-gray-400 mt-2">
                  <div className="flex items-center">
                    Admin
                  </div>
                </div>
                <Link
                  to="/admin/photos"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block pl-8 pr-4 py-2 text-base font-medium",
                    location.pathname === '/admin/photos'
                      ? "bg-black text-white"
                      : "text-gray-400 hover:bg-[#505050] hover:text-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Manage Photos
                  </div>
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-[#505050]">
            <div className="flex items-center px-4">
              <span className="text-sm text-gray-400">Welcome, {username}</span>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-[#505050]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}