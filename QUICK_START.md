# CBX Rentals - Quick Start Guide

## ✅ Current Status

- **Supabase Anon Key**: ✓ Configured
- **Application**: ✓ Built and ready
- **Database**: ⏳ Needs migrations to be run

## 🚀 Next Steps

### 1. Run Database Migrations in Supabase

Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/ttsharxrnbcqbmllvgwa/sql) and run these scripts:

#### Step 1: Create Tables
```sql
-- Copy and paste the entire contents of:
-- cbx-rentals/supabase/migrations/000_initial_schema.sql
```

#### Step 2: Load Initial Data
```sql
-- Copy and paste the entire contents of:
-- cbx-rentals/supabase/migrations/004_load_initial_data.sql
```

### 2. Start the Application

```bash
cd cbx-rentals
npm run dev
```

The app will be available at: http://localhost:5173

### 3. Login Credentials

- **Username**: cbxadmin
- **Password**: CBX2024$ecure!

## 📊 What You'll See

After login, you'll have access to:

- **Dashboard**: Overview of all properties and attendees
- **Properties**: View all 4 rental properties on S Pacific St
  - House 1: 1724 S Pacific St (6 guests)
  - House 2: 1722 S Pacific St (7 guests)
  - House 3: 828 S Pacific St (7 guests)
  - House 4: 923 S Pacific St (4 guests)
- **Attendees**: Manage all 24 attendees with:
  - Contact information
  - Payment tracking ($17,280.98 total)
  - Transportation needs (8 rental cars, 16 need airport pickup)

## 🔧 Troubleshooting

If you see "Failed to fetch properties":
1. Make sure you've run both SQL migrations
2. Check the Supabase dashboard to verify the tables exist
3. Verify the anon key in `.env.local` matches your Supabase project

## 🎯 Features Available

- View property occupancy in real-time
- Search and filter attendees
- Update payment status
- View transportation arrangements
- Export attendee lists
- Dark mode support

The application is fully functional and ready to use!