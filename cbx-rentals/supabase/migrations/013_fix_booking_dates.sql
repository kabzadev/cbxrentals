-- Fix booking dates to match the actual event dates in September 2025

-- Update House 1 bookings (all arrive Sept 10th)
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Zach Forsythe', 'Robert Steinberg', 'Keith Kabza', 'Joel Eliaz', 'Alexander Hernandez')
);

-- Dr. James Longobardi arrives Sept 10th, departs Sept 13th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-13'
WHERE attendee_id = (SELECT id FROM public.attendees WHERE name = 'Dr, James Longobardi');

-- House 2 bookings (most arrive Sept 10th)
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Pirmin Guolo', 'Kent Riddle', 'Dwayne Anderson', 'Rob Williams', 'David Carter', 'Chris McCarthy')
);

-- J. Faignant arrives Sept 10th, departs Sept 12th
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-12'
WHERE attendee_id = (SELECT id FROM public.attendees WHERE name = 'J. Faignant');

-- House 3 bookings (most arrive Sept 10th)
UPDATE public.bookings 
SET arrival_date = '2025-09-10', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Perry Roelofs', 'Peter Spadaro', 'Gordon Margerum', 'Damon Powell')
);

-- Daniel Stewart arrives Sept 11th
UPDATE public.bookings 
SET arrival_date = '2025-09-11', exit_date = '2025-09-14'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Daniel Stewart', 'Denny T')
);

-- House 4 bookings (all arrive Sept 11th, depart Sept 13th)
UPDATE public.bookings 
SET arrival_date = '2025-09-11', exit_date = '2025-09-13'
WHERE attendee_id IN (
    SELECT id FROM public.attendees 
    WHERE name IN ('Eric Kessler', 'Isaac De La Sierra', 'Tyler Craig', 'Paul Bird')
);

-- Timothy Schrader arrives Sept 12th, departs Sept 14th
UPDATE public.bookings 
SET arrival_date = '2025-09-12', exit_date = '2025-09-14'
WHERE attendee_id = (SELECT id FROM public.attendees WHERE name = 'Timothy Schrader');

-- Verify the updates
DO $$
DECLARE
    wrong_dates_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO wrong_dates_count
    FROM public.bookings
    WHERE arrival_date < '2025-09-10' OR arrival_date > '2025-09-12';
    
    IF wrong_dates_count > 0 THEN
        RAISE NOTICE 'Found % bookings with dates outside Sept 10-12, 2025', wrong_dates_count;
    ELSE
        RAISE NOTICE 'All booking dates successfully updated to September 2025';
    END IF;
END $$;