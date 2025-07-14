import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addLaJollaBeach() {
  console.log('Adding La Jolla Beach Visit event...\n');

  try {
    // First check the structure of existing events
    const { data: sample } = await supabase
      .from('events')
      .select('*')
      .limit(1)
      .single();

    console.log('Event columns:', Object.keys(sample || {}));

    // Add the La Jolla Beach Visit event
    const { data, error } = await supabase
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
        is_optional: true
      })
      .select();

    if (error) {
      console.error('Error adding beach visit:', error);
      return;
    }

    console.log('✅ Successfully added La Jolla Beach Visit at 2:00 PM');

    // Show all Thursday events
    const { data: thursdayEvents } = await supabase
      .from('events')
      .select('title, event_time, location_name')
      .eq('event_date', '2025-09-11')
      .order('event_time');

    console.log('\nComplete Thursday (Sept 11) schedule:');
    thursdayEvents?.forEach(e => {
      const time = new Date(`2000-01-01T${e.event_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      console.log(`- ${time}: ${e.title} at ${e.location_name}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addLaJollaBeach();