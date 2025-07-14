-- Direct SQL query to update Thursday Group Breakfast event
-- Run this in your Supabase SQL Editor

-- First, let's check the current Thursday breakfast event
SELECT id, title, event_date, event_time, location_name, location_address 
FROM events 
WHERE event_date = '2025-09-11' 
  AND title = 'Group Breakfast';

-- Update the Thursday Group Breakfast event
UPDATE events
SET 
  event_time = '07:30:00',
  location_name = 'Beach Break Cafe',
  location_address = '1802 S Coast Hwy, Oceanside, CA 92054',
  location_latitude = 33.1892,
  location_longitude = -117.3701,
  map_url = 'https://maps.google.com/?q=1802+S+Coast+Hwy+Oceanside+CA+92054',
  updated_at = NOW()
WHERE 
  title = 'Group Breakfast'
  AND event_date = '2025-09-11';

-- Verify the update
SELECT id, title, event_date, event_time, location_name, location_address, map_url
FROM events 
WHERE event_date = '2025-09-11' 
  AND title = 'Group Breakfast';