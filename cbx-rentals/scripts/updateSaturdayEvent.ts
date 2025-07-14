import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSaturdayEvent() {
  console.log('Updating Saturday Clark\'s House CBX Experience event...\n');

  try {
    // Find the Saturday Clark's House CBX Experience event
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('title', "Clark's House CBX Experience");

    if (fetchError) {
      console.error('Error fetching event:', fetchError);
      return;
    }

    if (!events || events.length === 0) {
      console.error('Clark\'s House CBX Experience event not found');
      return;
    }

    const event = events[0];
    console.log(`Found event on ${event.event_date} at ${event.event_time}`);
    console.log(`Current description: ${event.description || '(none)'}\n`);

    // Update the event with the new description
    const { data, error } = await supabase
      .from('events')
      .update({
        description: 'Bring swim trunks and a towel. Food and water will be provided. Come watch Ed win the Olympics event again and again.'
      })
      .eq('id', event.id)
      .select();

    if (error) {
      console.error('Error updating event:', error);
      return;
    }

    console.log('✅ Successfully updated Clark\'s House CBX Experience');
    console.log('\nUpdated event details:');
    console.log(`- Title: ${data[0].title}`);
    console.log(`- Date: ${data[0].event_date}`);
    console.log(`- Time: ${data[0].event_time}`);
    console.log(`- Location: ${data[0].location_name}`);
    console.log(`- Description: ${data[0].description}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateSaturdayEvent();