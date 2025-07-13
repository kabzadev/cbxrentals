-- CBX Experience Events Schedule
-- Run these queries in your Supabase SQL Editor

-- First, clear existing events (optional - comment out if you want to keep existing events)
DELETE FROM event_attendees;
DELETE FROM events;

-- Wednesday: Informal dinner get-together (optional)
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location_name,
  location_address,
  location_latitude,
  location_longitude,
  is_optional,
  map_url
) VALUES (
  'Welcome Dinner Get-Together',
  'Casual dinner to meet everyone and kick off the CBX Experience weekend',
  '2025-09-10',
  '18:30:00',
  'Oceanside Harbor Restaurant',
  '1540 Harbor Dr N, Oceanside, CA 92054',
  33.2108,
  -117.3931,
  true,
  'https://maps.google.com/?q=33.2108,-117.3931'
);

-- Thursday: Morning breakfast (optional)
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location_name,
  location_address,
  location_latitude,
  location_longitude,
  is_optional,
  map_url
) VALUES (
  'Group Breakfast',
  'Start the day together with breakfast and coffee',
  '2025-09-11',
  '08:30:00',
  'Ruby''s Diner Oceanside',
  '1200 N Coast Hwy, Oceanside, CA 92054',
  33.2058,
  -117.3794,
  true,
  'https://maps.google.com/?q=33.2058,-117.3794'
);

-- Thursday: Afternoon hike (optional)
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location_name,
  location_address,
  location_latitude,
  location_longitude,
  is_optional,
  map_url
) VALUES (
  'Hiking Adventure',
  'Scenic hike with beautiful views - bring water and comfortable shoes',
  '2025-09-11',
  '14:00:00',
  'Buena Vista Lagoon Trail',
  '2202 S Coast Hwy, Oceanside, CA 92054',
  33.1847,
  -117.3441,
  true,
  'https://maps.google.com/?q=33.1847,-117.3441'
);

-- Friday: Beach visit (optional)
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location_name,
  location_address,
  location_latitude,
  location_longitude,
  is_optional,
  map_url
) VALUES (
  'Beach Day',
  'Relax at the beach, swim, or beach volleyball - bring sunscreen and towels',
  '2025-09-12',
  '11:00:00',
  'Oceanside Beach',
  'The Strand, Oceanside, CA 92054',
  33.1958,
  -117.3794,
  true,
  'https://maps.google.com/?q=33.1958,-117.3794'
);

-- Saturday: Main CBX Experience Event (official) - 7 AM to 5 PM
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location_name,
  location_address,
  location_latitude,
  location_longitude,
  is_optional,
  map_url
) VALUES (
  'Clark''s House CBX Experience - Day 1',
  'The main CBX Experience event - 7:00 AM to 5:00 PM. This is the official event we''re all here for!',
  '2025-09-13',
  '07:00:00',
  'Clark''s House',
  '123 Oceanside Blvd, Oceanside, CA 92054',
  33.1958,
  -117.3731,
  false,
  'https://maps.google.com/?q=33.1958,-117.3731'
);

-- Sunday: CBX Experience continuation (official)
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location_name,
  location_address,
  location_latitude,
  location_longitude,
  is_optional,
  map_url
) VALUES (
  'Clark''s House CBX Experience - Day 2',
  'Continuation of the main CBX Experience event at Clark''s House',
  '2025-09-14',
  '09:00:00',
  'Clark''s House',
  '123 Oceanside Blvd, Oceanside, CA 92054',
  33.1958,
  -117.3731,
  false,
  'https://maps.google.com/?q=33.1958,-117.3731'
);