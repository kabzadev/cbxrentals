-- Fix transportation data - only Ken, Keith, and Rob have rental cars
-- Everyone else needs ride shares

-- First, set everyone to needs_airport_pickup = true and has_rental_car = false
UPDATE public.attendees 
SET 
    has_rental_car = false,
    needs_airport_pickup = true;

-- Now update the people who have rental cars
UPDATE public.attendees 
SET 
    has_rental_car = true,
    needs_airport_pickup = false
WHERE name IN (
    'Keith Kabza', 
    'Robert Steinberg',
    'Paul Bird',
    'Tyler Craig',
    'Daniel Stewart'
);

-- Check if there's a Ken or Kenneth in the database
UPDATE public.attendees 
SET 
    has_rental_car = true,
    needs_airport_pickup = false
WHERE name LIKE 'Ken%' OR name LIKE 'Kenneth%';

-- Verify the results
SELECT 
    name,
    has_rental_car,
    needs_airport_pickup
FROM public.attendees
ORDER BY 
    CASE WHEN has_rental_car THEN 0 ELSE 1 END,
    name;