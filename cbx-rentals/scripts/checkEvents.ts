import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
  console.log('Checking events in database...\n');

  try {
    // Get all events
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, event_date, event_time, location_name, location_address')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    console.log(`Found ${events?.length || 0} events:\n`);
    
    events?.forEach(event => {
      const date = new Date(event.event_date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      console.log(`${dayOfWeek}, ${event.event_date} - ${event.title}`);
      console.log(`  Time: ${event.event_time}`);
      console.log(`  Location: ${event.location_name}`);
      console.log(`  Address: ${event.location_address}\n`);
    });

    // Look specifically for Thursday events
    const thursdayEvents = events?.filter(e => {
      const date = new Date(e.event_date);
      return date.getDay() === 4; // Thursday
    });

    console.log(`\nThursday events (${thursdayEvents?.length || 0}):`);
    thursdayEvents?.forEach(event => {
      console.log(`- ${event.title} at ${event.event_time}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkEvents();