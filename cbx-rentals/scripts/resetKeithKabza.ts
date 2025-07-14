import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetKeithKabza() {
  console.log('Resetting confirmation and payment status for Keith Kabza...');

  try {
    // First, find Keith Kabza
    const { data: attendees, error: fetchError } = await supabase
      .from('attendees')
      .select(`
        id,
        name,
        checked_in,
        bookings (
          id,
          paid,
          attendee_id
        )
      `)
      .ilike('name', '%Keith Kabza%');

    if (fetchError) {
      console.error('Error fetching attendee:', fetchError);
      return;
    }

    if (!attendees || attendees.length === 0) {
      console.error('Keith Kabza not found');
      return;
    }

    const keith = attendees[0];
    console.log('Found:', keith.name);
    console.log('Current checked_in status:', keith.checked_in);
    console.log('Bookings:', keith.bookings);

    // Reset checked_in to false
    const { error: updateAttendeeError } = await supabase
      .from('attendees')
      .update({ checked_in: false })
      .eq('id', keith.id);

    if (updateAttendeeError) {
      console.error('Error updating attendee:', updateAttendeeError);
      return;
    }

    // Reset paid status to false for all bookings
    if (keith.bookings && keith.bookings.length > 0) {
      for (const booking of keith.bookings) {
        const { error: updateBookingError } = await supabase
          .from('bookings')
          .update({ paid: false })
          .eq('id', booking.id);

        if (updateBookingError) {
          console.error('Error updating booking:', updateBookingError);
        } else {
          console.log(`Updated booking ${booking.id} - paid set to false`);
        }
      }
    }

    console.log('\nSuccessfully reset Keith Kabza:');
    console.log('- checked_in: false');
    console.log('- All bookings paid: false');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

resetKeithKabza();