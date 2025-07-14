import { createClient } from '@supabase/supabase-js';

// Using the service role key provided by the user
const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.p5c_L-OJ-TcLo2vMSS_xj-9iX-VmFXhSSMxOgQ6iCKM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWithServiceKey() {
  console.log('Testing with service role key...\n');

  try {
    // Get attendees with vehicles
    const { data: vehicleAttendees, count: vehicleCount, error: vehicleError } = await supabase
      .from('attendees')
      .select('id, name, has_rental_car', { count: 'exact' })
      .eq('has_rental_car', true)
      .order('name');

    if (vehicleError) {
      console.error('Error:', vehicleError);
    } else {
      console.log(`Attendees with vehicles: ${vehicleCount}`);
      if (vehicleAttendees && vehicleAttendees.length > 0) {
        console.log('\nList:');
        vehicleAttendees.forEach(a => console.log(`  - ${a.name}`));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testWithServiceKey();