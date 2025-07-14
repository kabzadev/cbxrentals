import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';
import { Car, CheckCircle } from 'lucide-react';

export function UpdateRentalCars() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const namesToUpdate = [
    'Keith',
    'Robert Steinberg',
    'Perry',
    'Tyler',
    'Daniel',
    'James'
  ];

  const handleUpdate = async () => {
    setLoading(true);
    setResults([]);

    try {
      // First, find these attendees
      const { data: attendees, error: fetchError } = await supabase
        .from('attendees')
        .select('id, name, rental_car')
        .or(namesToUpdate.map(name => `name.ilike.%${name}%`).join(','));

      if (fetchError) {
        toast({
          title: 'Error',
          description: 'Failed to fetch attendees',
          variant: 'destructive',
        });
        return;
      }

      console.log('Found attendees:', attendees);

      // Update rental_car to true for these attendees
      const { data: updateData, error: updateError } = await supabase
        .from('attendees')
        .update({ rental_car: true })
        .or(namesToUpdate.map(name => `name.ilike.%${name}%`).join(','))
        .select();

      if (updateError) {
        toast({
          title: 'Error',
          description: 'Failed to update attendees',
          variant: 'destructive',
        });
        return;
      }

      setResults(updateData || []);
      toast({
        title: 'Success',
        description: `Updated ${updateData?.length || 0} attendees`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Update Rental Car Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Will update rental car status for:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {namesToUpdate.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Rental Car Status'}
            </Button>

            {results.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Updated Attendees:
                </h3>
                <ul className="text-sm space-y-1">
                  {results.map(attendee => (
                    <li key={attendee.id} className="text-gray-600">
                      {attendee.name} - Rental Car: ✓
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}