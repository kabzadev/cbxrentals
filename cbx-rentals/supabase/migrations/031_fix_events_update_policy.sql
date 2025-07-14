-- Drop existing restrictive update policy
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON public.events;

-- Create a new policy that allows all updates (matching the read policy pattern)
CREATE POLICY "Allow all to update events" ON public.events
    FOR UPDATE USING (true)
    WITH CHECK (true);

-- Also ensure insert and delete policies are consistent
DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON public.events;

-- Create consistent policies for insert
CREATE POLICY "Allow all to insert events" ON public.events
    FOR INSERT WITH CHECK (true);

-- Note: Delete policy was already fixed in migration 026