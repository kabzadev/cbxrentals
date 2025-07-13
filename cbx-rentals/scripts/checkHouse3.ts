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

async function checkAndUpdateHouse3() {
  try {
    // First check current values
    const { data: house3, error: fetchError } = await supabase
      .from('properties')
      .select('name, bedrooms, bathrooms')
      .eq('name', 'House 3')
      .single();

    if (fetchError) {
      console.error('Error fetching House 3:', fetchError);
      return;
    }

    console.log('Current House 3 data:', house3);

    // Update bedrooms to 6 if needed
    if (house3.bedrooms !== 6) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ bedrooms: 6 })
        .eq('name', 'House 3');

      if (updateError) {
        console.error('Error updating House 3 bedrooms:', updateError);
        return;
      }

      console.log('✓ House 3 bedroom count updated from', house3.bedrooms, 'to 6');
    } else {
      console.log('✓ House 3 already has 6 bedrooms');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndUpdateHouse3();