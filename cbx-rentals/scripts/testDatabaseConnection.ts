import { createClient } from '@supabase/supabase-js';

// Using the values from .env
const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('Testing database connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 50) + '...\n');

  try {
    // Test basic connection
    const { data: test, error: testError } = await supabase
      .from('attendees')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }

    console.log('✅ Connection successful!\n');

    // Get total attendees count
    const { count: totalCount } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true });

    console.log(`Total attendees in database: ${totalCount}`);

    // Get attendees with vehicles
    const { data: vehicleAttendees, count: vehicleCount, error: vehicleError } = await supabase
      .from('attendees')
      .select('id, name, has_rental_car', { count: 'exact' })
      .eq('has_rental_car', true)
      .order('name');

    if (vehicleError) {
      console.error('Error getting vehicle attendees:', vehicleError);
    } else {
      console.log(`\nAttendees with vehicles: ${vehicleCount}`);
      if (vehicleAttendees && vehicleAttendees.length > 0) {
        console.log('\nList of attendees with vehicles:');
        vehicleAttendees.forEach(a => console.log(`  - ${a.name}`));
      }
    }

    // Test the exact query from VehicleReport component
    console.log('\n\nTesting exact query from VehicleReport component...');
    const { data: reportData, error: reportError } = await supabase
      .from('attendees')
      .select(`
        id,
        name,
        email,
        phone,
        has_rental_car,
        bookings (
          id,
          check_in,
          check_out,
          property:properties (
            id,
            name,
            address
          )
        )
      `)
      .eq('has_rental_car', true)
      .order('name');

    if (reportError) {
      console.error('Report query error:', reportError);
    } else {
      console.log(`Report query returned ${reportData?.length || 0} attendees`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testDatabase();