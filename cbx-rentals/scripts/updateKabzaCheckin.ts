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

async function updateKabzaCheckin() {
  try {
    // Update Keith Kabza's check-in status
    const { error } = await supabase
      .from('attendees')
      .update({ checked_in: true })
      .eq('name', 'Keith Kabza');

    if (error) {
      console.error('Error updating check-in status:', error);
      return;
    }

    console.log('✓ Updated Keith Kabza check-in status to true');

    // Verify the update
    const { data, error: verifyError } = await supabase
      .from('attendees')
      .select('name, checked_in')
      .eq('name', 'Keith Kabza')
      .single();

    if (!verifyError && data) {
      console.log(`✓ Verified: ${data.name} - Checked in: ${data.checked_in}`);
    }

    // Show current check-in stats
    const { data: allAttendees } = await supabase
      .from('attendees')
      .select('checked_in');

    if (allAttendees) {
      const checkedIn = allAttendees.filter(a => a.checked_in).length;
      console.log(`\nTotal check-ins: ${checkedIn}/${allAttendees.length}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

updateKabzaCheckin();