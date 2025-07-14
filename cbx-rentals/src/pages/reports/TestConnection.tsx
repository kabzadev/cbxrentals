import { useEffect, useState } from 'react';
import { supabase, testSupabaseConnection } from '../../lib/supabase';

export function TestConnection() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const connected = await testSupabaseConnection();
        console.log('Connection test result:', connected);

        // Try to get attendees
        const { data: attendees, error } = await supabase
          .from('attendees')
          .select('id, name, has_rental_car')
          .limit(5);

        console.log('Attendees query:', { attendees, error });

        // Count attendees with vehicles
        const { count, error: countError } = await supabase
          .from('attendees')
          .select('*', { count: 'exact', head: true })
          .eq('has_rental_car', true);

        console.log('Vehicle count:', { count, countError });

        setResult({
          connected,
          attendees,
          error,
          vehicleCount: count,
          countError
        });
      } catch (err) {
        console.error('Test error:', err);
        setResult({ error: err });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) return <div>Testing connection...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Connection Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}