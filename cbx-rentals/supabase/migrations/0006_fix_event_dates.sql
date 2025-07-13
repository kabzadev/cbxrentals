-- Fix all dates to be September 10-14, 2024 for CBX Experience
-- Update all bookings to have the correct event dates

-- First, let's standardize most attendees to Sept 10-14
UPDATE bookings SET 
  arrival_date = '2024-09-10',
  exit_date = '2024-09-14',
  total_amount = CASE 
    WHEN property_id IN (SELECT id FROM properties WHERE name IN ('Property 1', 'Property 2', 'Property 3')) THEN 830.00
    WHEN property_id IN (SELECT id FROM properties WHERE name = 'Property 4') THEN 450.00
    ELSE total_amount
  END
WHERE attendee_id IN (
  SELECT id FROM attendees WHERE name IN (
    'Zach Forsythe', 'Robert Steinberg', 'Keith Kabza', 'Joel Eliaz', 'Alexander Hernandez',
    'Pirmin Guolo', 'Kent Riddle', 'Dwayne Anderson', 'Rob Williams', 'David Carter', 'Chris McCarthy',
    'Perry Roelofs', 'Peter Spadaro', 'Gordon Margerum', 'Damon Powell'
  )
);

-- Handle attendees with shorter stays
UPDATE bookings SET 
  arrival_date = '2024-09-10',
  exit_date = '2024-09-13',
  total_amount = 630.00
WHERE attendee_id IN (
  SELECT id FROM attendees WHERE name = 'Dr. James Longobardi'
);

UPDATE bookings SET 
  arrival_date = '2024-09-10',
  exit_date = '2024-09-12',
  total_amount = 450.00
WHERE attendee_id IN (
  SELECT id FROM attendees WHERE name = 'J. Faignant'
);

UPDATE bookings SET 
  arrival_date = '2024-09-11',
  exit_date = '2024-09-14',
  total_amount = 630.00
WHERE attendee_id IN (
  SELECT id FROM attendees WHERE name IN ('Daniel Stewart', 'Denny T')
);

UPDATE bookings SET 
  arrival_date = '2024-09-12',
  exit_date = '2024-09-14',
  total_amount = 400.00
WHERE attendee_id IN (
  SELECT id FROM attendees WHERE name = 'Timothy Schrader'
);

-- Property 4 attendees (shorter event)
UPDATE bookings SET 
  arrival_date = '2024-09-11',
  exit_date = '2024-09-13',
  total_amount = 450.00
WHERE attendee_id IN (
  SELECT id FROM attendees WHERE name IN (
    'Eric Kessler', 'Isaac De La Sierria', 'Tyler Craig', 'Paul Bird'
  )
);

-- Verify the updates
SELECT 
  a.name,
  p.name as property,
  b.arrival_date,
  b.exit_date,
  b.total_amount
FROM bookings b
JOIN attendees a ON a.id = b.attendee_id
JOIN properties p ON p.id = b.property_id
ORDER BY p.name, a.name;