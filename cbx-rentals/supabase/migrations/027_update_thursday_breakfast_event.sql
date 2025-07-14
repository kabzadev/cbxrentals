-- Update Thursday Group Breakfast event
-- Change time from 8:30 AM to 7:30 AM
-- Change location to Beach Break Cafe at 1802 S Coast Hwy, Oceanside, CA 92054

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
  AND event_date = '2025-09-11'
  AND event_time = '08:30:00';