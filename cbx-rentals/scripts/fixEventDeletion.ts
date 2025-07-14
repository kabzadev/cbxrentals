import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixEventDeletion() {
  console.log('Checking event deletion capabilities...\n');

  try {
    // First, let's check if we can fetch events
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return;
    }

    console.log(`Found ${events?.length || 0} events`);
    
    if (events && events.length > 0) {
      console.log('\nRecent events:');
      events.forEach(event => {
        console.log(`- ${event.title} (${event.id}) - ${event.event_date}`);
      });
    }

    // Try to check RLS policies (this requires admin access)
    console.log('\n--- Checking RLS Policies ---');
    
    // Check if RLS is enabled
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info', { table_name: 'events' })
      .single();

    if (!tablesError && tables) {
      console.log('Table info:', tables);
    }

    // Test deletion with a specific event
    if (events && events.length > 0) {
      const testEventId = events[0].id;
      console.log(`\nTesting deletion for event: ${events[0].title} (${testEventId})`);
      
      // First, check for related event_attendees
      const { data: attendees, error: attendeesCheckError } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', testEventId);

      console.log(`Found ${attendees?.length || 0} event_attendees records for this event`);

      // Try to delete event_attendees first
      if (attendees && attendees.length > 0) {
        const { error: deleteAttendeesError } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', testEventId);

        if (deleteAttendeesError) {
          console.error('Error deleting event_attendees:', deleteAttendeesError);
        } else {
          console.log('Successfully deleted event_attendees records');
        }
      }

      // Now try to delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', testEventId);

      if (deleteError) {
        console.error('\nDelete error:', deleteError);
        console.error('Error code:', deleteError.code);
        console.error('Error message:', deleteError.message);
        
        if (deleteError.code === '42501' || deleteError.message?.includes('policy')) {
          console.log('\n⚠️  This is a Row Level Security (RLS) policy issue.');
          console.log('The events table needs a DELETE policy to allow deletion.');
          console.log('\nSuggested SQL to fix:');
          console.log(`
-- Add DELETE policy for events table
CREATE POLICY "Enable delete for all users" ON public.events
  FOR DELETE USING (true);

-- Or for more restrictive access (only authenticated users):
CREATE POLICY "Enable delete for authenticated users" ON public.events
  FOR DELETE TO authenticated USING (true);
          `);
        }
      } else {
        console.log('✅ Successfully deleted event!');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkAndFixEventDeletion();