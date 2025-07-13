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

async function fixKabzaPhone() {
  try {
    // Update Keith Kabza's phone number to the correct one
    const { error } = await supabase
      .from('attendees')
      .update({ phone: '7274553833' })
      .eq('name', 'Keith Kabza');

    if (error) {
      console.error('Error updating phone number:', error);
      return;
    }

    console.log('✓ Updated Keith Kabza phone number from 7274538333 to 7274553833');

    // Verify the update
    const { data, error: verifyError } = await supabase
      .from('attendees')
      .select('name, phone')
      .eq('name', 'Keith Kabza')
      .single();

    if (!verifyError && data) {
      console.log(`✓ Verified: ${data.name} - ${data.phone}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

fixKabzaPhone();