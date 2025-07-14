import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.1XqW1P9hnMN5YL0U-cZLi7NhUvtxyH7vCAsZ7FBYwqg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVehicles() {
  console.log('Checking attendees with vehicles...\n');

  try {
    // Get count of attendees with vehicles
    const { count, error: countError } = await supabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('has_rental_car', true);

    console.log(`Total attendees with vehicles: ${count || 0}`);

    // Get actual attendees with vehicles
    const { data: attendees, error } = await supabase
      .from('attendees')
      .select('id, name, has_rental_car')
      .eq('has_rental_car', true)
      .order('name');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('\nAttendees with vehicles:');
    if (attendees && attendees.length > 0) {
      attendees.forEach(a => console.log(`- ${a.name}`));
    } else {
      console.log('None found');
    }

    // Also check a few specific people
    console.log('\nChecking specific attendees:');
    const names = ['Keith Kabza', 'Robert Steinberg', 'Perry', 'Tyler', 'Daniel', 'James'];
    
    for (const name of names) {
      const { data } = await supabase
        .from('attendees')
        .select('name, has_rental_car')
        .ilike('name', `%${name}%`)
        .single();
      
      if (data) {
        console.log(`- ${data.name}: has_rental_car = ${data.has_rental_car}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkVehicles();