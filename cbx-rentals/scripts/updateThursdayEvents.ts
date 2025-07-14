import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateThursdayEvents() {
  console.log('Updating Thursday events...\n');

  try {
    // First, let's check what events we have
    const { data: currentEvents, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', '2025-09-11')
      .order('event_time');

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return;
    }

    console.log('Current events on 2025-09-11:');
    currentEvents?.forEach(e => {
      console.log(`- ${e.title} at ${e.event_time} - ${e.location_name}`);
    });
    console.log('\n');

    // 1. Update the breakfast event to 7:30 AM at Beach Break Cafe
    const { error: breakfastError } = await supabase
      .from('events')
      .update({
        event_time: '07:30:00',
        location_name: 'Beach Break Cafe',
        location_address: '1802 S Coast Hwy, Oceanside, CA 92054',
        location_latitude: 33.1892,
        location_longitude: -117.3701,
        map_url: 'https://maps.google.com/?q=Beach+Break+Cafe+1802+S+Coast+Hwy+Oceanside+CA+92054'
      })
      .eq('event_date', '2025-09-11')
      .eq('title', 'Group Breakfast');

    if (breakfastError) {
      console.error('Error updating breakfast:', breakfastError);
    } else {
      console.log('✅ Updated Group Breakfast to 7:30 AM at Beach Break Cafe');
    }

    // 2. Update the hiking event to Torrey Pines at 9:00 AM
    const { error: hikingError } = await supabase
      .from('events')
      .update({
        title: 'Torrey Pines Hiking Adventure',
        event_time: '09:00:00',
        location_name: 'Torrey Pines State Park',
        location_address: '12600 N Torrey Pines Rd, La Jolla, CA 92037',
        location_latitude: 32.9335,
        location_longitude: -117.2606,
        map_url: 'https://maps.google.com/?q=Torrey+Pines+State+Park+12600+N+Torrey+Pines+Rd+La+Jolla+CA+92037'
      })
      .eq('event_date', '2025-09-11')
      .eq('title', 'Hiking Adventure');

    if (hikingError) {
      console.error('Error updating hiking:', hikingError);
    } else {
      console.log('✅ Updated to Torrey Pines Hiking Adventure at 9:00 AM');
    }

    // 3. Add new La Jolla Beach Visit at 2:00 PM
    const { error: beachError } = await supabase
      .from('events')
      .insert({
        title: 'La Jolla Beach Visit',
        event_date: '2025-09-11',
        event_time: '14:00:00',
        location_name: 'La Jolla Shores Beach',
        location_address: '8300 Camino Del Oro, La Jolla, CA 92037',
        location_latitude: 32.8567,
        location_longitude: -117.2563,
        map_url: 'https://maps.google.com/?q=La+Jolla+Shores+Beach+8300+Camino+Del+Oro+La+Jolla+CA+92037',
        description: 'Enjoy a relaxing afternoon at one of San Diego\'s most beautiful beaches',
        optional: true,
        show_on_dashboard: true
      });

    if (beachError) {
      console.error('Error adding beach visit:', beachError);
    } else {
      console.log('✅ Added La Jolla Beach Visit at 2:00 PM');
    }

    // Verify all updates
    console.log('\nVerifying updated events...');
    const { data: updatedEvents, error: verifyError } = await supabase
      .from('events')
      .select('*')
      .eq('event_date', '2025-09-11')
      .order('event_time');

    if (verifyError) {
      console.error('Error verifying:', verifyError);
    } else {
      console.log('\nUpdated Thursday (Sept 11) schedule:');
      updatedEvents?.forEach(e => {
        const time = new Date(`2000-01-01T${e.event_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        console.log(`- ${time}: ${e.title} at ${e.location_name}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateThursdayEvents();