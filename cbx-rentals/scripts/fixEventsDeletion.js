import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhmxocpjgpujoelzmzbn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXhvY3BqZ3B1am9lbHptemJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MjI3NjcsImV4cCI6MjA0NTE5ODc2N30.SxBZCOJKL3PjImm3fTcvfgNaR3a0xb5Qxzw2c-6S7e0'
);

async function fixEventsDeletion() {
  console.log('Adding DELETE policy for events table...');
  
  // Note: These queries need to be run with admin/service role access
  // For now, let's at least test if we can delete an event
  
  // First, let's try to fetch events
  const { data: events, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .order('event_date');
    
  if (fetchError) {
    console.error('Error fetching events:', fetchError);
    return;
  }
  
  console.log(`Found ${events.length} events`);
  
  // Try to delete a test event (you would need to run the SQL migration directly in Supabase)
  console.log('\nTo fix the deletion issue, run this SQL in your Supabase SQL editor:');
  console.log(`
-- Add DELETE policy for events table
CREATE POLICY "Allow authenticated users to delete events" ON public.events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also add UPDATE and INSERT policies
CREATE POLICY "Allow authenticated users to insert events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update events" ON public.events
    FOR UPDATE USING (auth.role() = 'authenticated');
  `);
}

fixEventsDeletion();