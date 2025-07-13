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

async function updateHouse3Bathrooms() {
  try {
    // Update House 3 bathroom count
    const { error } = await supabase
      .from('properties')
      .update({ bathrooms: 5.0 })
      .eq('name', 'House 3');

    if (error) {
      console.error('Error updating House 3 bathrooms:', error);
      return;
    }

    console.log('✓ House 3 bathroom count updated successfully');
    console.log('  Changed from 3 bathrooms to 5 bathrooms');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateHouse3Bathrooms();