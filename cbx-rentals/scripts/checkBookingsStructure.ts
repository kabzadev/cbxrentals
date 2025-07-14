import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODQ1NzcsImV4cCI6MjA2Nzg2MDU3N30.ppN6WLAS5R5G0RJ6vBBxye4zBHk-fhNhAlWklTeNeJw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStructure() {
  console.log('Checking bookings table structure...\n');

  try {
    // Get a sample booking to see its structure
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Sample booking structure:');
      console.log(JSON.stringify(booking, null, 2));
      console.log('\nColumns available:', Object.keys(booking || {}));
    }

    // Also check what columns we can select
    const { data: test } = await supabase
      .from('bookings')
      .select('id, property_id, attendee_id')
      .limit(1);
    
    console.log('\nSuccessfully selected:', test);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkStructure();