import { Plane, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import type { Database } from '../../types/database';

type Attendee = Database['public']['Tables']['attendees']['Row'];

interface FlightInformationProps {
  attendee: Attendee;
}

export function FlightInformation({ attendee }: FlightInformationProps) {
  // Handle case where flight fields don't exist yet
  const hasArrivalInfo = attendee.arrival_airline || attendee.arrival_flight_number || attendee.arrival_time;
  const hasDepartureInfo = attendee.departure_airline || attendee.departure_flight_number || attendee.departure_time;

  // Don't show component if no flight fields exist in the database yet
  if (!hasArrivalInfo && !hasDepartureInfo && !attendee.interested_in_carpool) {
    return null;
  }

  const formatFlightTime = (timeString: string | null) => {
    if (!timeString) return 'Not specified';
    try {
      // Assuming time is in HH:MM format
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Flight Information
        </CardTitle>
        <CardDescription>Travel details and transportation preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Arrival Flight */}
        {hasArrivalInfo && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Arrival</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              {attendee.arrival_airline && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Airline:</span>
                  <span className="font-medium">{attendee.arrival_airline}</span>
                </div>
              )}
              {attendee.arrival_flight_number && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Flight:</span>
                  <span className="font-medium">{attendee.arrival_flight_number}</span>
                </div>
              )}
              {attendee.arrival_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatFlightTime(attendee.arrival_time)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Departure Flight */}
        {hasDepartureInfo && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Departure</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              {attendee.departure_airline && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Airline:</span>
                  <span className="font-medium">{attendee.departure_airline}</span>
                </div>
              )}
              {attendee.departure_flight_number && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Flight:</span>
                  <span className="font-medium">{attendee.departure_flight_number}</span>
                </div>
              )}
              {attendee.departure_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatFlightTime(attendee.departure_time)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transportation Preferences */}
        <div className="flex flex-wrap gap-2 pt-2">
          {attendee.interested_in_carpool && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Interested in Carpool
            </Badge>
          )}
          {!hasArrivalInfo && !hasDepartureInfo && (
            <p className="text-sm text-gray-500">No flight information provided</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}