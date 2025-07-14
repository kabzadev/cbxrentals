-- Fix RLS policies for events table

-- First, check if RLS is enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON events;
DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "events_insert_policy" ON events;
DROP POLICY IF EXISTS "events_update_policy" ON events;
DROP POLICY IF EXISTS "events_delete_policy" ON events;

-- Create new policies that allow operations

-- Allow everyone to read events (both authenticated and anonymous)
CREATE POLICY "events_select_policy" ON events
    FOR SELECT
    TO public
    USING (true);

-- Allow anonymous users to insert events (for the app using anon key)
CREATE POLICY "events_insert_policy" ON events
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to update events (for the app using anon key)
CREATE POLICY "events_update_policy" ON events
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to delete events (for the app using anon key)
CREATE POLICY "events_delete_policy" ON events
    FOR DELETE
    TO anon
    USING (true);

-- Also add policies for authenticated users
CREATE POLICY "events_insert_authenticated" ON events
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "events_update_authenticated" ON events
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "events_delete_authenticated" ON events
    FOR DELETE
    TO authenticated
    USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'events'
ORDER BY policyname;