# CBX Rentals Setup Guide

## Quick Start

Follow these steps to get the CBX Rentals application running:

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed

### 2. Clone and Install

```bash
cd cbx-rentals
npm install
```

### 3. Supabase Setup

1. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy your project URL and anon key

2. **Update environment variables:**
   - Open `cbx-rentals/.env.local`
   - Replace `your-anon-key-here` with your actual Supabase anon key
   - The URL should already be set to: `https://ttsharxrnbcqbmllvgwa.supabase.co`

3. **Run database migrations:**
   - Go to your Supabase SQL Editor
   - Run the migrations in order:
     ```sql
     -- First, run the schema creation
     -- Copy and paste from: cbx-rentals/supabase/migrations/000_initial_schema.sql
     
     -- Then, load the initial data
     -- Copy and paste from: cbx-rentals/supabase/migrations/004_load_initial_data.sql
     ```

### 4. Start the Application

```bash
cd cbx-rentals
npm run dev
```

The application will start at http://localhost:5173

### 5. Login Credentials

- **Username:** cbxadmin
- **Password:** CBX2024Secure!

## Features Overview

### 🏠 Property Management
- View all 4 rental properties
- See current occupancy and guest lists
- Track revenue per property
- Access property listing URLs

### 👥 Attendee Management
- View all 24 attendees
- Search and filter attendees
- Track payment status
- View transportation needs (rental car, airport pickup)
- Update payment status

### 📊 Dashboard
- Quick stats overview
- Total revenue tracking
- Occupancy summary
- Quick navigation to all features

## Project Structure

```
cbx-rentals/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── properties/    # Property management UI
│   │   ├── attendees/     # Attendee management UI
│   │   └── ui/           # Shadcn UI components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   ├── pages/            # Page components
│   └── lib/              # Utilities and Supabase client
├── supabase/
│   └── migrations/       # SQL migration files
└── data/                 # Initial data JSON
```

## Troubleshooting

### "Failed to fetch properties" error
- Check that your Supabase anon key is correctly set in `.env.local`
- Ensure you've run all migrations in Supabase
- Verify your Supabase project URL is correct

### "Invalid login credentials"
- Username: cbxadmin
- Password: CBX2024Secure!
- These are set in `.env.local`

### Data not appearing
- Run the migration script `004_load_initial_data.sql` in Supabase SQL Editor
- Check the Supabase dashboard to verify data was inserted

## Next Steps

1. **Customize the theme** - Edit `src/index.css` to change colors
2. **Add more features** - Check GitHub issues for enhancement ideas
3. **Deploy to production** - Use Vercel or Netlify for easy deployment

## Support

- Check the [GitHub Issues](https://github.com/kabzadev/cbxrentals/issues) for known issues
- Review [CLAUDE.md](../CLAUDE.md) for detailed technical documentation