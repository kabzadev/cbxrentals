-- Update rental_car to true for specific attendees
UPDATE attendees 
SET rental_car = true
WHERE 
  name ILIKE '%Keith%' OR
  name ILIKE '%Robert Steinberg%' OR
  name ILIKE '%Perry%' OR
  name ILIKE '%Tyler%' OR
  name ILIKE '%Daniel%' OR
  name ILIKE '%James%';

-- Verify the updates
SELECT id, name, rental_car 
FROM attendees 
WHERE 
  name ILIKE '%Keith%' OR
  name ILIKE '%Robert Steinberg%' OR
  name ILIKE '%Perry%' OR
  name ILIKE '%Tyler%' OR
  name ILIKE '%Daniel%' OR
  name ILIKE '%James%'
ORDER BY name;