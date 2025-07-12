# Supabase Setup for CBX Rentals

## Database Schema

This directory contains the SQL migrations and seed data for the CBX Rentals database.

### Tables

1. **properties** - Rental properties available for CBX Experience
   - id (UUID, primary key)
   - name (text)
   - address (text)
   - latitude (decimal)
   - longitude (decimal)
   - max_occupancy (integer)
   - price_per_night (decimal)
   - listing_url (text, optional)
   - created_at (timestamp)

2. **attendees** - Event attendees
   - id (UUID, primary key)
   - name (text)
   - email (text, unique)
   - phone (text)
   - has_rental_car (boolean)
   - needs_airport_pickup (boolean)
   - created_at (timestamp)

3. **bookings** - Links attendees to properties with dates
   - id (UUID, primary key)
   - attendee_id (UUID, foreign key)
   - property_id (UUID, foreign key)
   - arrival_date (date)
   - exit_date (date)
   - total_amount (decimal)
   - paid (boolean)
   - created_at (timestamp)

## Setup Instructions

### 1. Run Migrations

You can run the migrations in the Supabase dashboard SQL editor:

```sql
-- Run the initial schema migration
-- Copy and paste the contents of migrations/000_initial_schema.sql
```

Or run them individually in order:
1. `001_create_properties_table.sql`
2. `002_create_attendees_table.sql`
3. `003_create_bookings_table.sql`

### 2. Load Sample Data (Optional)

To load sample data for testing:

```sql
-- Copy and paste the contents of seed-data.sql
```

### 3. Get Your Anon Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "anon public" key
4. Add it to your `.env.local` file:

```
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Test the Connection

Run the test function in your application:

```typescript
import { testDatabaseConnection } from './src/lib/supabase-test'

// Test the connection
testDatabaseConnection().then(success => {
  if (success) {
    console.log('Database setup complete!')
  }
})
```

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Current policies allow all operations (to be refined based on auth requirements)
- Never expose the service role key in client-side code
- Always use the anon key for client-side operations