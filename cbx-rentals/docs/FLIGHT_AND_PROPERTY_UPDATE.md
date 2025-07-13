# Flight Information and Property Updates

## Summary of Changes

### 1. Property Updates
- Updated all property URLs to actual VRBO listings:
  - House 1 (6BR): https://www.vrbo.com/1234127
  - House 2 (6BR): https://www.vrbo.com/1244150
  - House 3 (6BR): https://www.vrbo.com/2037172
  - House 4 (4BR): https://www.vrbo.com/2040523

- Added property details:
  - Number of bedrooms
  - Number of bathrooms  
  - Sleeps capacity
  - Property type (Beach House)

- Enhanced property display:
  - Shows bedroom/bathroom count
  - Direct "View on VRBO" links
  - Image carousel with captions
  - Removed pricing info (since already booked)

### 2. Flight Information Tracking
Added new fields to attendees table:
- `arrival_airline` - Airline for arrival flight
- `arrival_flight_number` - Flight number
- `arrival_time` - Arrival time (HH:MM format)
- `departure_airline` - Airline for departure flight
- `departure_flight_number` - Flight number  
- `departure_time` - Departure time (HH:MM format)
- `interested_in_carpool` - Boolean flag for carpool interest

### 3. UI Components Added
- **FlightInformation.tsx** - Displays flight details in attendee profile
- Enhanced **PropertyImages.tsx** - Fetches images from database with fallbacks
- Updated **PropertyCard.tsx** - Shows room details and VRBO link

### 4. Database Migrations Created
- `0004_add_flight_information.sql` - Adds flight tracking fields
- `0005_update_property_urls_and_details.sql` - Updates VRBO URLs and property details

## How to Apply Migrations

Run these SQL scripts in your Supabase SQL editor:

```sql
-- First migration: Add flight information fields
ALTER TABLE attendees 
ADD COLUMN arrival_airline TEXT,
ADD COLUMN arrival_flight_number TEXT,
ADD COLUMN arrival_time TIME,
ADD COLUMN departure_airline TEXT,
ADD COLUMN departure_flight_number TEXT,
ADD COLUMN departure_time TIME,
ADD COLUMN interested_in_carpool BOOLEAN DEFAULT FALSE;

-- Add property details
ALTER TABLE properties
ADD COLUMN bedrooms INTEGER DEFAULT 0,
ADD COLUMN bathrooms DECIMAL(3,1) DEFAULT 0,
ADD COLUMN sleeps INTEGER DEFAULT 0,
ADD COLUMN property_type TEXT;

-- Second migration: Update property data
UPDATE properties SET 
  listing_url = 'https://www.vrbo.com/1234127',
  bedrooms = 6,
  bathrooms = 4.0,
  sleeps = 12,
  property_type = 'Beach House'
WHERE name = 'Property 1';

-- (Continue with other properties...)
```

## Features Implemented

1. **Real Property Information**
   - Properties now show actual bedroom/bathroom counts
   - Direct links to VRBO listings for reference
   - Beach house imagery appropriate for Oceanside, CA

2. **Flight Tracking**
   - Attendees can have arrival/departure flight details stored
   - Shows formatted times and airline information
   - Carpool interest flag for coordination

3. **Enhanced Property Display**
   - Image carousel with multiple views
   - Property details at a glance
   - Clean, focused UI without booking/pricing info

## Next Steps

To populate flight information:
1. Update attendee records with flight details via Supabase dashboard
2. Or create an admin form to edit flight information
3. Consider adding a flight update form to the check-in wizard