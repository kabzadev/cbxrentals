# Fix Events Update Issue

The event update is failing because of Row Level Security (RLS) policies on the `events` table. Here's how to fix it:

## Quick Fix via Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/ttsharxrnbcqbmllvgwa

2. **Navigate to SQL Editor**
   - In the left sidebar, click on "SQL Editor"

3. **Copy and paste this SQL**:

```sql
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

-- Allow everyone to read events
CREATE POLICY "events_select_policy" ON events
    FOR SELECT
    TO public
    USING (true);

-- Allow anonymous users to insert events
CREATE POLICY "events_insert_policy" ON events
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to update events
CREATE POLICY "events_update_policy" ON events
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to delete events
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
```

4. **Click "Run"**
   - You should see a success message

5. **Test the fix**
   - Go back to your app and try updating an event again
   - It should work now!

## Alternative: Check Current Policies

If you want to see what policies currently exist before making changes:

1. In SQL Editor, run this query:
```sql
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
```

This will show you all current policies on the events table.

## Why This Happened

The error "JSON object requested, multiple (or no) rows returned" occurs when:
- RLS is enabled on the table
- The UPDATE policy is either missing or too restrictive
- The app is using the `anon` role (via the public API key)
- The policy doesn't allow the `anon` role to update events

The fix above creates permissive policies that allow both anonymous and authenticated users to perform all operations on events.