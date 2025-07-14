import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
// Use the service role key provided by the user earlier
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.p5c_L-OJ-TcLo2vMSS_xj-9iX-VmFXhSSMxOgQ6iCKM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateEvent() {
  console.log('Updating Thursday breakfast event with service role key...\n');

  try {
    // Update the Group Breakfast event directly
    const { data, error } = await supabase
      .from('events')
      .update({
        event_time: '07:30:00',
        location_name: 'Beach Break Cafe',
        location_address: '1802 S Coast Hwy, Oceanside, CA 92054',
        location_latitude: 33.1892,
        location_longitude: -117.3701,
        map_url: 'https://maps.google.com/?q=1802+S+Coast+Hwy+Oceanside+CA+92054'
      })
      .eq('event_date', '2025-09-11')
      .eq('title', 'Group Breakfast')
      .select();

    if (error) {
      console.error('Error updating event:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Event updated successfully!');
      console.log('Updated event details:');
      console.log(`- Time: ${data[0].event_time}`);
      console.log(`- Location: ${data[0].location_name}`);
      console.log(`- Address: ${data[0].location_address}`);
    } else {
      console.log('No event was updated. The event might not exist.');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateEvent();