import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAttendees() {
  console.log('Searching for attendees...\n');

  // Search for attendees with names that might match
  const { data, error } = await supabase
    .from('attendees')
    .select('id, name, phone, email')
    .or('name.ilike.%zach%,name.ilike.%joel%,name.ilike.%eliza%,name.ilike.%alex%,name.ilike.%james%')
    .order('name');

  if (error) {
    console.error('Error fetching attendees:', error);
    return;
  }

  console.log('Found attendees:');
  console.log('================');
  data.forEach(attendee => {
    console.log(`ID: ${attendee.id}`);
    console.log(`Name: ${attendee.name}`);
    console.log(`Phone: ${attendee.phone}`);
    console.log(`Email: ${attendee.email}`);
    console.log('---');
  });

  console.log('\nUse these UPDATE statements in Supabase SQL Editor:');
  console.log('================================================');
  console.log("-- UPDATE attendees SET phone = '4406653628' WHERE id = 'xxx'; -- Zach");
  console.log("-- UPDATE attendees SET phone = '8322702627' WHERE id = 'xxx'; -- Joel Eliza");
  console.log("-- UPDATE attendees SET phone = '7173649848' WHERE id = 'xxx'; -- Alexander");
  console.log("-- UPDATE attendees SET phone = '6199725501' WHERE id = 'xxx'; -- James");
}

findAttendees();