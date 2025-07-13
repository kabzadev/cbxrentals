import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read environment variables directly from .env.local file
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

async function resetKabzaStatus() {
  try {
    // First, get Keith Kabza's attendee ID
    const { data: attendee, error: attendeeError } = await supabase
      .from('attendees')
      .select('id, name')
      .eq('name', 'Keith Kabza')
      .single();

    if (attendeeError || !attendee) {
      console.error('Error finding Keith Kabza:', attendeeError);
      return;
    }

    console.log(`Found: ${attendee.name} (ID: ${attendee.id})`);

    // Reset check-in status
    const { error: checkinError } = await supabase
      .from('attendees')
      .update({ checked_in: false })
      .eq('id', attendee.id);

    if (checkinError) {
      console.error('Error resetting check-in:', checkinError);
    } else {
      console.log('✓ Reset check-in status to false');
    }

    // Find and reset payment status for Keith's booking
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, attendee_id, paid')
      .eq('attendee_id', attendee.id);

    if (!bookingError && bookings && bookings.length > 0) {
      for (const booking of bookings) {
        const { error: paymentError } = await supabase
          .from('bookings')
          .update({ paid: false })
          .eq('id', booking.id);

        if (!paymentError) {
          console.log(`✓ Reset payment status to false for booking ${booking.id}`);
        }
      }
    }

    // Verify the updates
    const { data: verifyAttendee } = await supabase
      .from('attendees')
      .select('name, checked_in')
      .eq('id', attendee.id)
      .single();

    const { data: verifyBooking } = await supabase
      .from('bookings')
      .select('paid')
      .eq('attendee_id', attendee.id)
      .single();

    console.log('\nVerification:');
    console.log(`- Check-in status: ${verifyAttendee?.checked_in || false}`);
    console.log(`- Payment status: ${verifyBooking?.paid || false}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

resetKabzaStatus();