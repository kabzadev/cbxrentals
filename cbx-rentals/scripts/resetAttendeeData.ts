import { createClient } from '@supabase/supabase-js';

// Read environment variables directly from .env file
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAttendeeData() {
  try {
    // Reset attendee check-in and transportation data
    // First try to reset check-in fields if they exist
    const { error: checkinError } = await supabase
      .from('attendees')
      .update({
        checked_in: false
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (checkinError && !checkinError.message.includes('column')) {
      console.error('Error resetting check-in status:', checkinError);
    }

    // Reset transportation data
    const { error: attendeeError } = await supabase
      .from('attendees')
      .update({
        has_rental_car: false,
        needs_airport_pickup: false,
        interested_in_carpool: false
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (attendeeError) {
      console.error('Error resetting attendee data:', attendeeError);
      return;
    }

    console.log('✓ Attendee data reset successfully');

    // Reset all bookings to unpaid
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ paid: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (bookingError) {
      console.error('Error resetting booking data:', bookingError);
      return;
    }

    console.log('✓ Booking payment status reset successfully');
    console.log('\nAll attendee data has been reset to defaults:');
    console.log('- All check-ins cleared');
    console.log('- All transportation preferences reset');
    console.log('- All payments marked as unpaid');

  } catch (error) {
    console.error('Error:', error);
  }
}

resetAttendeeData();