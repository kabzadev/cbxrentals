import { supabase } from '../lib/supabase';

async function resetKeithKabzaStatus() {
  try {
    console.log('Finding Keith Kabza...');
    
    // Find Keith Kabza
    const { data: attendees, error: findError } = await supabase
      .from('attendees')
      .select('id, name, checked_in')
      .ilike('name', '%keith%kabza%');

    if (findError) {
      console.error('Error finding attendee:', findError);
      return;
    }

    if (!attendees || attendees.length === 0) {
      console.log('No attendee found with name matching "Keith Kabza"');
      return;
    }

    const keith = attendees[0];
    console.log('Found attendee:', keith);

    // Reset check-in status
    console.log('Resetting check-in status...');
    const { error: attendeeError } = await supabase
      .from('attendees')
      .update({ 
        checked_in: false,
        check_in_time: null
      })
      .eq('id', keith.id);

    if (attendeeError) {
      console.error('Error updating attendee:', attendeeError);
      return;
    }

    console.log('✓ Reset check-in status');

    // Reset payment status
    console.log('Resetting payment status...');
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ paid: false })
      .eq('attendee_id', keith.id);

    if (bookingError) {
      console.error('Error updating booking:', bookingError);
      return;
    }

    console.log('✓ Reset payment status');

    // Verify the changes
    const { data: verification, error: verifyError } = await supabase
      .from('attendees')
      .select(`
        name,
        checked_in,
        check_in_time,
        bookings (
          paid,
          total_amount
        )
      `)
      .eq('id', keith.id)
      .single();

    if (verifyError) {
      console.error('Error verifying:', verifyError);
      return;
    }

    console.log('\n✅ Status reset successfully!');
    console.log('\nCurrent status:');
    console.log('Name:', verification.name);
    console.log('Checked In:', verification.checked_in ? 'Yes' : 'No');
    console.log('Check In Time:', verification.check_in_time || 'None');
    console.log('Payment Status:', verification.bookings[0]?.paid ? 'Paid' : 'Unpaid');
    console.log('Amount Due:', `$${verification.bookings[0]?.total_amount || 0}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the reset
resetKeithKabzaStatus();