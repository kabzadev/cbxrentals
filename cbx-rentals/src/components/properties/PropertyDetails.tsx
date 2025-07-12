import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  HomeIcon, 
  MapPinIcon, 
  UsersIcon, 
  DollarSignIcon, 
  CalendarIcon,
  ExternalLinkIcon,
  UserIcon,
  MailIcon,
  PhoneIcon
} from 'lucide-react';
import type { PropertyWithBookings } from '../../hooks/useProperties';
import { format } from 'date-fns';

interface PropertyDetailsProps {
  property: PropertyWithBookings | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetails({ property, open, onOpenChange }: PropertyDetailsProps) {
  if (!property) return null;

  const isFull = property.currentOccupancy >= property.max_occupancy;
  const today = new Date().toISOString().split('T')[0];
  
  // Get current guests
  const currentGuests = property.bookings.filter(booking => {
    return booking.arrival_date <= today && booking.exit_date >= today;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold">{property.name}</DialogTitle>
            <Badge variant={isFull ? "destructive" : "success"} className="ml-4">
              {isFull ? "Full" : "Available"}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-1 mt-2">
            <MapPinIcon className="h-4 w-4" />
            {property.address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Property Image Placeholder */}
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <HomeIcon className="h-16 w-16 text-gray-400" />
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price/Night</span>
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">${property.price_per_night}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Occupancy</span>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">
                  {property.currentOccupancy}/{property.max_occupancy}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">${property.totalRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Bookings</span>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{property.bookings.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Listing URL */}
          {property.listing_url && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(property.listing_url!, '_blank')}
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                View Listing
              </Button>
            </div>
          )}

          {/* Current Guests */}
          <Card>
            <CardHeader>
              <CardTitle>Current Guests ({currentGuests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {currentGuests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No current guests</p>
              ) : (
                <div className="space-y-3">
                  {currentGuests.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{booking.attendee.name}</span>
                            {booking.paid && (
                              <Badge variant="success" className="text-xs">
                                Paid
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MailIcon className="h-3 w-3" />
                            {booking.attendee.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PhoneIcon className="h-3 w-3" />
                            {booking.attendee.phone}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">${booking.total_amount}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.arrival_date), 'MMM d')} - {format(new Date(booking.exit_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Coordinates */}
          <div className="text-sm text-muted-foreground">
            <p>Coordinates: {property.latitude}, {property.longitude}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}