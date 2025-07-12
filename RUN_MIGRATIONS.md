# How to Run Supabase Migrations

## Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase SQL Editor**:
   https://supabase.com/dashboard/project/ttsharxrnbcqbmllvgwa/sql

2. **Create the database schema**:
   - Click "New Query"
   - Copy ALL the contents from `cbx-rentals/supabase/migrations/000_initial_schema.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

3. **Load the initial data**:
   - Click "New Query" again
   - Copy ALL the contents from `cbx-rentals/supabase/migrations/004_load_initial_data.sql`
   - Paste into the SQL editor
   - Click "Run"
   - You should see "Success. No rows returned"

4. **Verify the data**:
   - Run this query to check:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM properties) as properties_count,
     (SELECT COUNT(*) FROM attendees) as attendees_count,
     (SELECT COUNT(*) FROM bookings) as bookings_count;
   ```
   - You should see: 4 properties, 24 attendees, 24 bookings

## Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI if you haven't
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref ttsharxrnbcqbmllvgwa

# Run migrations
supabase db push
```

## Verification Steps

After running migrations, verify everything worked:

1. Go to Table Editor in Supabase dashboard
2. Check each table:
   - **properties**: Should have 4 rows (House 1-4)
   - **attendees**: Should have 24 rows (all attendees)
   - **bookings**: Should have 24 rows (linking attendees to properties)

## Common Issues

**"permission denied for schema public"**
- Make sure you're logged into the correct Supabase project
- Try refreshing the page and running again

**"relation already exists"**
- The tables are already created
- You can skip to loading the data (step 3)

**No data after running migrations**
- Make sure you ran BOTH migration files
- The second file (004_load_initial_data.sql) contains all the data

## After Migrations Complete

Your app is ready! Start it with:
```bash
cd cbx-rentals
npm run dev
```

Login with:
- Username: cbxadmin  
- Password: CBX2024$ecure!