-- Add DELETE policy for events table to allow authenticated users to delete events
CREATE POLICY "Allow authenticated users to delete events" ON public.events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also add UPDATE and INSERT policies while we're at it
CREATE POLICY "Allow authenticated users to insert events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update events" ON public.events
    FOR UPDATE USING (auth.role() = 'authenticated');