import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateFridayDinner() {
  console.log('Updating Friday events...\n');

  try {
    // First, let's check what events we have on Friday
    const { data: currentEvents, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .order('event_date');

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return;
    }

    // Find the Beach Day event (it might be on a different date)
    const beachDayEvent = currentEvents?.find(e => e.title === 'Beach Day');
    
    if (!beachDayEvent) {
      console.error('Beach Day event not found');
      return;
    }

    console.log(`Found Beach Day event on ${beachDayEvent.event_date} at ${beachDayEvent.event_time}`);
    console.log(`Location: ${beachDayEvent.location_name}\n`);

    // Update the Beach Day event to Clark's Dinner Event
    const { data, error } = await supabase
      .from('events')
      .update({
        title: "Clark's Dinner Event",
        event_time: '18:00:00', // 6:00 PM
        location_name: "Coach Clark's House",
        location_address: '1440 Rock Springs Rd, Escondido, CA 92026',
        location_latitude: 33.1283,
        location_longitude: -117.0794,
        map_url: 'https://maps.google.com/?q=1440+Rock+Springs+Rd+Escondido+CA+92026',
        description: 'Join us for dinner at Coach Clark\'s house'
      })
      .eq('id', beachDayEvent.id)
      .select();

    if (error) {
      console.error('Error updating event:', error);
      return;
    }

    console.log('✅ Successfully updated to Clark\'s Dinner Event at 6:00 PM');
    console.log('New details:');
    console.log(`- Title: Clark's Dinner Event`);
    console.log(`- Time: 6:00 PM`);
    console.log(`- Location: Coach Clark's House`);
    console.log(`- Address: 1440 Rock Springs Rd, Escondido, CA 92026`);

    // Show all events by date
    const { data: allEvents } = await supabase
      .from('events')
      .select('title, event_date, event_time, location_name')
      .order('event_date')
      .order('event_time');

    console.log('\nAll events schedule:');
    let currentDate = '';
    allEvents?.forEach(e => {
      if (e.event_date !== currentDate) {
        currentDate = e.event_date;
        const date = new Date(e.event_date + 'T00:00:00');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        console.log(`\n${dayName}:`);
      }
      const time = new Date(`2000-01-01T${e.event_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      console.log(`  - ${time}: ${e.title}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateFridayDinner();