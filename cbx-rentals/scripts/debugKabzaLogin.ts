import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read environment variables directly from .env.local file
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugKabzaLogin() {
  try {
    console.log('=== Debugging Keith Kabza Login ===\n');

    // 1. Find all entries with "Kabza" in the name
    const { data: kabzaEntries } = await supabase
      .from('attendees')
      .select('*')
      .ilike('name', '%kabza%');

    console.log('All Kabza entries:');
    kabzaEntries?.forEach(entry => {
      console.log(`- Name: "${entry.name}"`);
      console.log(`  Phone in DB: "${entry.phone}"`);
      console.log(`  ID: ${entry.id}`);
      console.log('');
    });

    // 2. Test the exact login query
    const testPhone = '7274553833'; // Phone without dashes
    console.log(`\nTesting login with:`);
    console.log(`- Last name: "KABZA"`);
    console.log(`- Phone (digits only): "${testPhone}"`);

    const { data: loginTest, error: loginError } = await supabase
      .from('attendees')
      .select('*')
      .ilike('name', '%KABZA%')
      .eq('phone', testPhone);

    if (loginError) {
      console.log('\nLogin query error:', loginError);
    } else if (!loginTest || loginTest.length === 0) {
      console.log('\nNo matches found!');
      
      // Let's check what phone numbers contain these digits
      const { data: phoneCheck } = await supabase
        .from('attendees')
        .select('name, phone')
        .like('phone', '%455%');
      
      console.log('\nAttendees with "455" in phone:');
      phoneCheck?.forEach(p => console.log(`- ${p.name}: ${p.phone}`));
    } else {
      console.log('\nLogin query successful! Found:');
      loginTest.forEach(entry => {
        console.log(`- ${entry.name} (${entry.phone})`);
      });
    }

    // 3. Check case sensitivity
    console.log('\n=== Testing different case variations ===');
    const variations = ['Kabza', 'KABZA', 'kabza'];
    
    for (const variation of variations) {
      const { data } = await supabase
        .from('attendees')
        .select('name')
        .ilike('name', `%${variation}%`);
      
      console.log(`\nSearch for "%${variation}%": ${data?.length || 0} results`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugKabzaLogin();