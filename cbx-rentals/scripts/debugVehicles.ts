import { createClient } from '@supabase/supabase-js';

// Using the URL and key from .env
const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.1XqW1P9hnMN5YL0U-cZLi7NhUvtxyH7vCAsZ7FBYwqg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugVehicles() {
  console.log('Debugging vehicle data...\n');

  try {
    // First, let's just try to get ALL attendees
    const { data: allAttendees, error: allError } = await supabase
      .from('attendees')
      .select('id, name, has_rental_car')
      .limit(10)
      .order('name');

    if (allError) {
      console.error('Error getting all attendees:', allError);
      return;
    }

    console.log(`Sample of all attendees (showing ${allAttendees?.length || 0}):`);
    allAttendees?.forEach(a => console.log(`- ${a.name}: has_rental_car = ${a.has_rental_car}`));

    // Now count those with vehicles
    const { count: vehicleCount } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('has_rental_car', true);

    console.log(`\nTotal with has_rental_car = true: ${vehicleCount || 0}`);

    // Try with filter to true
    const { data: withVehicles, error: vehicleError } = await supabase
      .from('attendees')
      .select('name')
      .eq('has_rental_car', true)
      .limit(20);

    if (vehicleError) {
      console.error('Error getting attendees with vehicles:', vehicleError);
    } else {
      console.log(`\nAttendees with vehicles (${withVehicles?.length || 0} found):`);
      withVehicles?.forEach(a => console.log(`- ${a.name}`));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugVehicles();