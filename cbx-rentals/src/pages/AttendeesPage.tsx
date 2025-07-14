import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { AttendeeList } from '../components/attendees';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, ArrowLeft, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';

export function AttendeesPage() {
  const { username, logout, userType } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = userType === 'admin';
  const { toast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttendee, setNewAttendee] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '');
  };

  const handleAddAttendee = async () => {
    if (!newAttendee.name.trim() || !newAttendee.phone.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both name and phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(newAttendee.phone);
      
      // First, get the off-site property
      const { data: offsiteProperty, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('name', 'Off-site')
        .single();

      if (propError) {
        throw new Error('Off-site property not found. Please ensure it exists in the database.');
      }

      // Create the attendee
      const { data: attendee, error: attendeeError } = await supabase
        .from('attendees')
        .insert({
          name: newAttendee.name.trim(),
          phone: formattedPhone,
          email: `${newAttendee.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Generate placeholder email
          has_rental_car: false,
          needs_airport_pickup: false
        })
        .select()
        .single();

      if (attendeeError) throw attendeeError;

      // Create off-site booking for the attendee
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          attendee_id: attendee.id,
          property_id: offsiteProperty.id,
          arrival_date: '2025-09-12',
          exit_date: '2025-09-13',
          total_amount: 0,
          paid: true
        });

      if (bookingError) throw bookingError;

      toast({
        title: 'Success',
        description: `${newAttendee.name} has been added as an off-site attendee`,
      });

      // Reset form and refresh list
      setNewAttendee({ name: '', phone: '' });
      setShowAddForm(false);
      setRefreshKey(prev => prev + 1); // Trigger AttendeeList refresh
      
    } catch (error) {
      console.error('Error adding attendee:', error);
      toast({
        title: 'Error',
        description: 'Failed to add attendee. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">{isAdmin ? 'Attendee Management' : 'Attendee List'}</h1>
              <span className="text-sm text-gray-600">Welcome, {username}</span>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOutIcon className="h-4 w-4" />
                <span>Logout</span>
              </Button>
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
        {/* Add New Attendee Button - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="default"
              className="flex items-center gap-2"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add New Attendee
                </>
              )}
            </Button>
          </div>
        )}

        {/* Add New Attendee Form */}
        {isAdmin && showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Attendee (Off-site)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-md">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter attendee name"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={newAttendee.phone}
                    onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddAttendee}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Attendee'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAttendee({ name: '', phone: '' });
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AttendeeList key={refreshKey} />
      </main>
    </div>
  );
}