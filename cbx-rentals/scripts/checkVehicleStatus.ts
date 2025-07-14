import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVehicleStatus() {
  console.log('Checking vehicle status for all attendees...\n');

  try {
    // Get all attendees
    const { data: attendees, error } = await supabase
      .from('attendees')
      .select('id, name, has_rental_car')
      .order('name');

    if (error) {
      console.error('Error fetching attendees:', error);
      return;
    }

    console.log(`Total attendees: ${attendees?.length || 0}\n`);

    // Filter by has_rental_car status
    const withVehicle = attendees?.filter(a => a.has_rental_car === true) || [];
    const withoutVehicle = attendees?.filter(a => a.has_rental_car === false) || [];
    const unknown = attendees?.filter(a => a.has_rental_car === null) || [];

    console.log(`Attendees WITH vehicle (has_rental_car = true): ${withVehicle.length}`);
    withVehicle.forEach(a => console.log(`  - ${a.name}`));

    console.log(`\nAttendees WITHOUT vehicle (has_rental_car = false): ${withoutVehicle.length}`);
    withoutVehicle.forEach(a => console.log(`  - ${a.name}`));

    console.log(`\nAttendees with UNKNOWN vehicle status (has_rental_car = null): ${unknown.length}`);
    unknown.forEach(a => console.log(`  - ${a.name}`));

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkVehicleStatus();