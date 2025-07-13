const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAttendeeData() {
  try {
    // Reset attendee check-in and transportation data
    const { error: attendeeError } = await supabase
      .from('attendees')
      .update({
        checked_in: false,
        check_in_time: null,
        has_rental_car: null,
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