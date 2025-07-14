-- Fix event deletion by adding proper RLS policies

-- First, check if RLS is enabled on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policies if any
DROP POLICY IF EXISTS "Enable delete for all users" ON public.events;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Enable delete for anon users" ON public.events;

-- Create a permissive DELETE policy for all users (including anon)
-- This matches the current SELECT and INSERT policies
CREATE POLICY "Enable delete for all users" ON public.events
  FOR DELETE 
  USING (true);

-- Also ensure event_attendees can be deleted
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policies if any
DROP POLICY IF EXISTS "Enable delete for all users" ON public.event_attendees;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.event_attendees;
DROP POLICY IF EXISTS "Enable delete for anon users" ON public.event_attendees;

-- Create a permissive DELETE policy for event_attendees
CREATE POLICY "Enable delete for all users" ON public.event_attendees
  FOR DELETE 
  USING (true);

-- Verify policies are in place
DO $$
BEGIN
  RAISE NOTICE 'Events table RLS policies have been updated to allow deletion';
  RAISE NOTICE 'Event_attendees table RLS policies have been updated to allow deletion';
END $$;