import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyEventDeletionFix() {
  console.log('Applying event deletion fix...\n');

  try {
    // Execute the SQL to fix RLS policies
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on events table
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

        -- Drop existing delete policies
        DROP POLICY IF EXISTS "Enable delete for all users" ON public.events;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.events;
        DROP POLICY IF EXISTS "Enable delete for anon users" ON public.events;

        -- Create permissive DELETE policy
        CREATE POLICY "Enable delete for all users" ON public.events
          FOR DELETE 
          USING (true);

        -- Enable RLS on event_attendees table
        ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

        -- Drop existing delete policies
        DROP POLICY IF EXISTS "Enable delete for all users" ON public.event_attendees;
        DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.event_attendees;
        DROP POLICY IF EXISTS "Enable delete for anon users" ON public.event_attendees;

        -- Create permissive DELETE policy
        CREATE POLICY "Enable delete for all users" ON public.event_attendees
          FOR DELETE 
          USING (true);
      `
    });

    if (error) {
      console.error('Error applying fix:', error);
      
      // If exec_sql doesn't exist, let's try a different approach
      console.log('\nTrying alternative approach...');
      
      // List current events to verify access
      const { data: events, error: listError } = await supabase
        .from('events')
        .select('id, title')
        .limit(1);
        
      if (listError) {
        console.error('Cannot access events table:', listError);
      } else {
        console.log('✅ Can access events table');
        console.log('\nThe RLS policies need to be updated in the Supabase dashboard:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Authentication > Policies');
        console.log('3. Find the "events" table');
        console.log('4. Add a DELETE policy with the following:');
        console.log('   - Policy name: "Enable delete for all users"');
        console.log('   - Target roles: Select all (anon, authenticated)');
        console.log('   - USING expression: true');
        console.log('\n5. Do the same for the "event_attendees" table');
      }
    } else {
      console.log('✅ Successfully applied RLS policy fixes!');
      console.log('Event deletion should now work properly.');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
applyEventDeletionFix();