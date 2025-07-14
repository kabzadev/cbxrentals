import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPhotosTable() {
  console.log('Checking if photos table exists...\n');

  try {
    // Try to query the photos table
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Photos table does not exist');
        console.log('Please run the migration SQL in your Supabase dashboard');
      } else {
        console.error('Error checking table:', error);
      }
    } else {
      console.log('✅ Photos table exists!');
      console.log('Sample data:', data);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkPhotosTable();