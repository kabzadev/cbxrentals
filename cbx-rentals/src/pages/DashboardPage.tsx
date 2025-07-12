import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PropertyList } from '../components/properties/PropertyList';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, HomeIcon, UsersIcon, CalendarIcon } from 'lucide-react';

export function DashboardPage() {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    {
      title: 'Total Properties',
      value: '4',
      icon: HomeIcon,
      description: 'Available rental properties',
    },
    {
      title: 'Total Attendees',
      value: '24',
      icon: UsersIcon,
      description: 'Registered attendees',
    },
    {
      title: 'Active Bookings',
      value: '24',
      icon: CalendarIcon,
      description: 'Current bookings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">CBX Rentals Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage properties, attendees, and bookings from here
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              View Properties
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/attendees')}
            >
              Manage Attendees
            </Button>
            <Button variant="outline" className="w-full">
              View Bookings
            </Button>
          </CardContent>
        </Card>

        {/* Properties Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Manage your rental properties and view current occupancy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}