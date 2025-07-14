import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateKeithPaymentStatus() {
  console.log('Updating payment status for Keith Kabza...\n');

  try {
    // First, find Keith Kabza
    const { data: attendees, error: fetchError } = await supabase
      .from('attendees')
      .select(`
        id,
        name,
        bookings (
          id,
          paid,
          total_amount
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
    console.log('Bookings:', keith.bookings);

    // Update paid status to false for all bookings
    if (keith.bookings && keith.bookings.length > 0) {
      for (const booking of keith.bookings) {
        console.log(`\nUpdating booking ${booking.id}:`);
        console.log(`- Current paid status: ${booking.paid}`);
        console.log(`- Total amount: $${booking.total_amount}`);
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ paid: false })
          .eq('id', booking.id);

        if (updateError) {
          console.error('Error updating booking:', updateError);
        } else {
          console.log('✅ Successfully set paid to false');
        }
      }
    }

    console.log('\nPayment status update completed for Keith Kabza');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateKeithPaymentStatus();