import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateThursdayEvent() {
  console.log('Updating Thursday breakfast event...\n');

  try {
    // First, find the breakfast event (showing as Wednesday 9/11 but is actually Thursday morning)
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', '2025-09-11')
      .eq('title', 'Group Breakfast');

    if (fetchError) {
      console.error('Error fetching event:', fetchError);
      return;
    }

    if (!events || events.length === 0) {
      console.error('Thursday breakfast event not found');
      return;
    }

    const event = events[0];
    console.log('Current event details:');
    console.log(`- Time: ${event.event_time}`);
    console.log(`- Location: ${event.location_name}`);
    console.log(`- Address: ${event.location_address}\n`);

    // Update the event
    const { error: updateError } = await supabase
      .from('events')
      .update({
        event_time: '07:30:00',
        location_name: 'Beach Break Cafe',
        location_address: '1802 S Coast Hwy, Oceanside, CA 92054',
        location_latitude: 33.1892,
        location_longitude: -117.3701,
        map_url: 'https://maps.google.com/?q=1802+S+Coast+Hwy+Oceanside+CA+92054',
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id);

    if (updateError) {
      console.error('Error updating event:', updateError);
      return;
    }

    console.log('✅ Event updated successfully!\n');

    // Verify the update
    const { data: updatedEvent, error: verifyError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event.id)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Updated event details:');
      console.log(`- Time: ${updatedEvent.event_time}`);
      console.log(`- Location: ${updatedEvent.location_name}`);
      console.log(`- Address: ${updatedEvent.location_address}`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateThursdayEvent();