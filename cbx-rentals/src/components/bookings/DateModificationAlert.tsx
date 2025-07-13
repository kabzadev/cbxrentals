import { AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { format } from 'date-fns';
import type { Database } from '../../types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];

interface DateModificationAlertProps {
  booking: Booking & {
    original_arrival_date?: string | null;
    original_exit_date?: string | null;
    date_modification_reason?: string | null;
    dates_modified?: boolean;
    modified_at?: string | null;
  };
}

export function DateModificationAlert({ booking }: DateModificationAlertProps) {
  if (!booking.dates_modified) return null;

  const hasArrivalChanged = booking.original_arrival_date && booking.original_arrival_date !== booking.arrival_date;
  const hasExitChanged = booking.original_exit_date && booking.original_exit_date !== booking.exit_date;

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Dates Modified</AlertTitle>
      <AlertDescription className="text-yellow-700 space-y-2">
        <div className="mt-2 space-y-1">
          {hasArrivalChanged && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              <span>
                Arrival changed from{' '}
                <strong>{format(new Date(booking.original_arrival_date + 'T00:00:00'), 'MMM d, yyyy')}</strong>
                {' to '}
                <strong>{format(new Date(booking.arrival_date + 'T00:00:00'), 'MMM d, yyyy')}</strong>
              </span>
            </div>
          )}
          {hasExitChanged && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              <span>
                Departure changed from{' '}
                <strong>{format(new Date(booking.original_exit_date + 'T00:00:00'), 'MMM d, yyyy')}</strong>
                {' to '}
                <strong>{format(new Date(booking.exit_date + 'T00:00:00'), 'MMM d, yyyy')}</strong>
              </span>
            </div>
          )}
          {booking.date_modification_reason && (
            <div className="text-sm mt-2">
              <strong>Reason:</strong> {booking.date_modification_reason}
            </div>
          )}
          {booking.modified_at && (
            <div className="text-xs text-gray-500 mt-1">
              Modified on {format(new Date(booking.modified_at), 'MMM d, yyyy \'at\' h:mm a')}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}