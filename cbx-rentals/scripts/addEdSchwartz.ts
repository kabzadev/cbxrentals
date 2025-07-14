import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addEdSchwartz() {
  console.log('Adding Ed Schwartz as an off-site attendee...\n');

  try {
    // First check if Ed already exists
    const { data: existing, error: checkError } = await supabase
      .from('attendees')
      .select('*')
      .or('name.eq.Ed Schwartz,phone.eq.7605801113');

    if (checkError) {
      console.error('Error checking for existing attendee:', checkError);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('Ed Schwartz already exists in the database');
      console.log('Current details:', existing[0]);
      return;
    }

    // Add Ed Schwartz as a new attendee
    const { data, error } = await supabase
      .from('attendees')
      .insert({
        name: 'Ed Schwartz',
        phone: '7605801113',
        email: 'ed.schwartz@email.com', // Placeholder email
        has_rental_car: true,
        interested_in_carpool: false, // Has vehicle, so doesn't need carpool
        needs_airport_pickup: false,
        checked_in: false
      })
      .select();

    if (error) {
      console.error('Error adding attendee:', error);
      return;
    }

    console.log('✅ Successfully added Ed Schwartz');
    console.log('Details:');
    console.log(`- Name: ${data[0].name}`);
    console.log(`- Phone: ${data[0].phone}`);
    console.log(`- Email: ${data[0].email}`);
    console.log(`- Has vehicle: ${data[0].has_rental_car}`);
    console.log(`- Attendee ID: ${data[0].id}`);
    console.log('\nNote: Ed is staying off-site (not in database properties)');

    // Show updated vehicle count
    const { count } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('has_rental_car', true);

    console.log(`\nTotal attendees with vehicles: ${count}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addEdSchwartz();