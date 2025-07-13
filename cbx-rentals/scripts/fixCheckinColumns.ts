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

async function fixCheckinColumns() {
  try {
    console.log('Checking attendees table structure...\n');

    // First, let's check what columns exist
    const { data: sample, error: sampleError } = await supabase
      .from('attendees')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error checking table:', sampleError);
      return;
    }

    if (sample && sample.length > 0) {
      console.log('Current attendees table columns:');
      console.log(Object.keys(sample[0]).join(', '));
      console.log('');
    }

    // Try to add the checked_in column if it doesn't exist
    console.log('Attempting to add checked_in column...');
    
    // Since we can't run ALTER TABLE directly through Supabase client,
    // let's try updating a record to see if the column exists
    const testId = sample?.[0]?.id;
    if (testId) {
      const { error: updateError } = await supabase
        .from('attendees')
        .update({ checked_in: false })
        .eq('id', testId);

      if (updateError) {
        console.log('❌ checked_in column does not exist');
        console.log('Error:', updateError.message);
        console.log('\nTo fix this, you need to run the following SQL in your Supabase dashboard:');
        console.log('');
        console.log('ALTER TABLE attendees');
        console.log('ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;');
        console.log('');
        console.log('Go to: https://supabase.com/dashboard/project/[your-project]/sql/new');
        console.log('and run the SQL above.');
      } else {
        console.log('✅ checked_in column exists!');
        
        // Reset it back to false
        await supabase
          .from('attendees')
          .update({ checked_in: false })
          .eq('id', testId);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

fixCheckinColumns();