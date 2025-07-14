import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStructure() {
  console.log('Checking attendees table structure...\n');

  try {
    // Get a sample attendee to see structure
    const { data: sample, error } = await supabase
      .from('attendees')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Attendee columns:', Object.keys(sample || {}));
      console.log('\nSample data:', JSON.stringify(sample, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkStructure();