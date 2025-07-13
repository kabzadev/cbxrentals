-- Fix ALL booking dates to match the actual spreadsheet data
-- Clear approach: update all bookings with exact dates

-- First, update ALL bookings to 2025 (in case any are still 2024)
UPDATE public.bookings 
SET 
    arrival_date = arrival_date + INTERVAL '1 year',
    exit_date = exit_date + INTERVAL '1 year'
WHERE EXTRACT(YEAR FROM arrival_date) = 2024;

-- Now set the correct dates for each person based on the spreadsheet

-- House 1 - All arrive Sept 10th, depart Sept 14th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Zach Forsythe', 'Robert Steinberg', 'Keith Kabza', 'Joel Eliaz', 'Alexander Hernandez')
);

-- Dr. James Longobardi - arrives Sept 10th, departs Sept 13th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-13'
WHERE attendee_id IN (
    SELECT id FROM public.attendees WHERE name = 'Dr, James Longobardi' OR name = 'Dr. James Longobardi'
);

-- House 2 - Most arrive Sept 10th, depart Sept 14th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Pirmin Guolo', 'Kent Riddle', 'Dwayne Anderson', 'Rob Williams', 'David Carter', 'Chris McCarthy')
);

-- J. Faignant - arrives Sept 10th, departs Sept 12th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-12'
WHERE attendee_id IN (
    SELECT id FROM public.attendees WHERE name = 'J. Faignant' OR name = 'J Faignant'
);

-- House 3 - Most arrive Sept 10th, depart Sept 14th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Perry Roelofs', 'Peter Spadaro', 'Gordon Margerum', 'Damon Powell')
);

-- Daniel Stewart and Denny T - arrive Sept 11th, depart Sept 14th
UPDATE public.bookings 
SET arrival_date = '2025-09-11', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Daniel Stewart', 'Denny T')
);

-- House 4 - All arrive Sept 11th, depart Sept 13th
UPDATE public.bookings 
SET arrival_date = '2025-09-11', exit_date = '2025-09-13'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Eric Kessler', 'Isaac De La Sierra', 'Tyler Craig', 'Paul Bird')
);

-- Timothy Schrader - arrives Sept 12th, departs Sept 14th
UPDATE public.bookings 
SET arrival_date = '2025-09-12', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees WHERE name = 'Timothy Schrader' OR name = 'Tim Schrader'
);

-- Verify results
SELECT 
    a.name,
    p.name as house,
    b.arrival_date,
    b.exit_date
FROM public.bookings b
JOIN public.attendees a ON a.id = b.attendee_id
JOIN public.properties p ON p.id = b.property_id
ORDER BY p.name, b.arrival_date, a.name;