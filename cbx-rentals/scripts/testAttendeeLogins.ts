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

async function testAllAttendeeLogins() {
  try {
    // Fetch all attendees
    const { data: attendees, error } = await supabase
      .from('attendees')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching attendees:', error);
      return;
    }

    console.log(`Testing login for ${attendees.length} attendees...\n`);

    for (const attendee of attendees) {
      const lastName = attendee.name.split(' ').pop()?.toUpperCase() || '';
      const phoneDigits = attendee.phone?.replace(/\D/g, '') || '';
      
      // Test the login logic
      const { data: loginAttempt, error: loginError } = await supabase
        .from('attendees')
        .select('*')
        .ilike('name', `%${lastName}`)
        .eq('phone', phoneDigits)
        .single();

      if (loginError || !loginAttempt) {
        console.log(`❌ FAILED: ${attendee.name}`);
        console.log(`   Last Name: "${lastName}"`);
        console.log(`   Phone in DB: "${attendee.phone}"`);
        console.log(`   Phone digits: "${phoneDigits}"`);
        console.log(`   Error: ${loginError?.message || 'No match found'}`);
        
        // Try to debug why it failed
        const { data: nameMatches } = await supabase
          .from('attendees')
          .select('name, phone')
          .ilike('name', `%${lastName}`);
        
        if (nameMatches && nameMatches.length > 0) {
          console.log(`   Found ${nameMatches.length} name matches:`);
          nameMatches.forEach(m => console.log(`     - ${m.name} (${m.phone})`));
        }
      } else {
        console.log(`✅ SUCCESS: ${attendee.name} (${attendee.phone}) - Checked in: ${attendee.checked_in ? 'Yes' : 'No'}`);
      }
      console.log('');
    }

    // Specific test for Keith Kabza
    console.log('\n--- Testing Keith Kabza specifically ---');
    const { data: kabzaTest, error: kabzaError } = await supabase
      .from('attendees')
      .select('*')
      .ilike('name', '%KABZA')
      .eq('phone', '7274553833');

    if (kabzaError || !kabzaTest || kabzaTest.length === 0) {
      console.log('❌ Keith Kabza login test FAILED');
      console.log('Error:', kabzaError);
      
      // Debug: find all Kabza entries
      const { data: allKabza } = await supabase
        .from('attendees')
        .select('*')
        .ilike('name', '%kabza%');
      
      console.log('\nAll Kabza entries in database:');
      allKabza?.forEach(k => {
        console.log(`- Name: "${k.name}", Phone: "${k.phone}", Checked in: ${k.checked_in}`);
      });
    } else {
      console.log('✅ Keith Kabza login test PASSED');
      kabzaTest.forEach(k => {
        console.log(`- Name: "${k.name}", Phone: "${k.phone}", Checked in: ${k.checked_in}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testAllAttendeeLogins();