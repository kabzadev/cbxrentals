-- UPDATE THURSDAY BREAKFAST EVENT
-- Run this SQL directly in your Supabase SQL Editor

-- First, verify the current event
SELECT id, title, event_date, event_time, location_name, location_address 
FROM events 
WHERE event_date = '2025-09-11' 
  AND title = 'Group Breakfast';

-- Update the event with new time and location
UPDATE events
SET 
  event_time = '07:30:00',
  location_name = 'Beach Break Cafe',
  location_address = '1802 S Coast Hwy, Oceanside, CA 92054',
  location_latitude = 33.1892,
  location_longitude = -117.3701,
  map_url = 'https://maps.google.com/?q=Beach+Break+Cafe+1802+S+Coast+Hwy+Oceanside+CA+92054',
  updated_at = NOW()
WHERE 
  event_date = '2025-09-11' 
  AND title = 'Group Breakfast';

-- Verify the update was successful
SELECT id, title, event_date, event_time, location_name, location_address, map_url
FROM events 
WHERE event_date = '2025-09-11' 
  AND title = 'Group Breakfast';

-- The event should now show:
-- Time: 07:30:00 (7:30 AM)
-- Location: Beach Break Cafe
-- Address: 1802 S Coast Hwy, Oceanside, CA 92054