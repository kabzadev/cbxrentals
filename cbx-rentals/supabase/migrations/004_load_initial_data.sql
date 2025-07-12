-- Migration to load initial CBX Rentals data
-- This script inserts properties, attendees, and creates bookings

-- Clear existing data (optional - comment out if you want to preserve existing data)
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.attendees CASCADE;
TRUNCATE TABLE public.properties CASCADE;

-- Insert properties
INSERT INTO public.properties (name, address, latitude, longitude, max_occupancy, price_per_night, listing_url) VALUES
('Property 1', '1724 S Pacific St, Oceanside, CA', 33.1894, -117.3814, 8, 332.69, 'https://bit.ly/4ln5IJE'),
('Property 2', '1722 S Pacific St, Oceanside, CA', 33.1894, -117.3814, 8, 311.53, 'https://bit.ly/3TVueWx'),
('Property 3', '828 S Pacific St, Oceanside, CA', 33.1984, -117.3814, 8, 298.05, 'https://bit.ly/4kF1jkn'),
('Property 4', '923 S Pacific St, Oceanside, CA', 33.1974, -117.3814, 4, 279.34, 'https://bit.ly/3IpQfKi');

-- Insert attendees
INSERT INTO public.attendees (name, email, phone, has_rental_car, needs_airport_pickup) VALUES
-- Property 1 attendees
('Zach Forsythe', 'zach.forsythe@email.com', '(555) 000-0001', true, false),
('Robert Steinberg', 'robert.steinberg@email.com', '(555) 000-0002', false, true),
('Keith Kabza', 'keith.kabza@email.com', '(555) 000-0003', false, true),
('Joel Eliaz', 'joel.eliaz@email.com', '(555) 000-0004', true, false),
('Alexander Hernandez', 'alexander.hernandez@email.com', '(555) 000-0005', false, true),
('Dr. James Longobardi', 'dr.longobardi@email.com', '(555) 000-0006', false, true),
-- Property 2 attendees
('Pirmin Guolo', 'pirmin.guolo@email.com', '(555) 000-0007', true, false),
('J. Faignant', 'j.faignant@email.com', '(555) 000-0008', false, true),
('Kent Riddle', 'kent.riddle@email.com', '(555) 000-0009', false, true),
('Dwayne Anderson', 'dwayne.anderson@email.com', '(555) 000-0010', true, false),
('Rob Williams', 'rob.williams@email.com', '(555) 000-0011', false, true),
('David Carter', 'david.carter@email.com', '(555) 000-0012', false, true),
('Chris McCarthy', 'chris.mccarthy@email.com', '(555) 000-0013', true, false),
-- Property 3 attendees
('Perry Roelofs', 'perry.roelofs@email.com', '(555) 000-0014', false, true),
('Peter Spadaro', 'peter.spadaro@email.com', '(555) 000-0015', false, true),
('Gordon Margerum', 'gordon.margerum@email.com', '(555) 000-0016', true, false),
('Damon Powell', 'damon.powell@email.com', '(555) 000-0017', false, true),
('Daniel Stewart', 'daniel.stewart@email.com', '(555) 000-0018', false, true),
('Denny T', 'denny.t@email.com', '(555) 000-0019', true, false),
('Timothy Schrader', 'timothy.schrader@email.com', '(555) 000-0020', false, true),
-- Property 4 attendees
('Eric Kessler', 'eric.kessler@email.com', '(555) 000-0021', false, true),
('Isaac De La Sierria', 'isaac.sierria@email.com', '(555) 000-0022', true, false),
('Tyler Craig', 'tyler.craig@email.com', '(555) 000-0023', false, true),
('Paul Bird', 'paul.bird@email.com', '(555) 000-0024', false, true);

-- Create bookings linking attendees to properties
-- Note: Using subqueries to get IDs since we're using UUIDs
INSERT INTO public.bookings (attendee_id, property_id, arrival_date, exit_date, total_amount, paid)
SELECT 
    a.id,
    p.id,
    b.arrival_date::DATE,
    b.exit_date::DATE,
    b.total_amount,
    false -- All bookings start as unpaid
FROM (VALUES
    -- Property 1 bookings
    ('Zach Forsythe', 'Property 1', '2024-09-10', '2024-09-14', 830.00),
    ('Robert Steinberg', 'Property 1', '2024-09-10', '2024-09-14', 830.00),
    ('Keith Kabza', 'Property 1', '2024-09-10', '2024-09-14', 830.00),
    ('Joel Eliaz', 'Property 1', '2024-09-10', '2024-09-14', 830.00),
    ('Alexander Hernandez', 'Property 1', '2024-09-10', '2024-09-14', 830.00),
    ('Dr. James Longobardi', 'Property 1', '2024-09-10', '2024-09-13', 630.00),
    -- Property 2 bookings
    ('Pirmin Guolo', 'Property 2', '2024-09-10', '2024-09-14', 830.00),
    ('J. Faignant', 'Property 2', '2024-09-10', '2024-09-12', 450.00),
    ('Kent Riddle', 'Property 2', '2024-09-10', '2024-09-14', 830.00),
    ('Dwayne Anderson', 'Property 2', '2024-09-10', '2024-09-14', 830.00),
    ('Rob Williams', 'Property 2', '2024-09-10', '2024-09-14', 830.00),
    ('David Carter', 'Property 2', '2024-09-10', '2024-09-14', 830.00),
    ('Chris McCarthy', 'Property 2', '2024-09-10', '2024-09-14', 830.00),
    -- Property 3 bookings
    ('Perry Roelofs', 'Property 3', '2024-09-10', '2024-09-14', 830.00),
    ('Peter Spadaro', 'Property 3', '2024-09-10', '2024-09-14', 830.00),
    ('Gordon Margerum', 'Property 3', '2024-09-10', '2024-09-14', 830.00),
    ('Damon Powell', 'Property 3', '2024-09-10', '2024-09-14', 830.00),
    ('Daniel Stewart', 'Property 3', '2024-09-11', '2024-09-14', 630.00),
    ('Denny T', 'Property 3', '2024-09-11', '2024-09-14', 630.00),
    ('Timothy Schrader', 'Property 3', '2024-09-12', '2024-09-14', 400.00),
    -- Property 4 bookings
    ('Eric Kessler', 'Property 4', '2024-09-11', '2024-09-13', 450.00),
    ('Isaac De La Sierria', 'Property 4', '2024-09-11', '2024-09-13', 450.00),
    ('Tyler Craig', 'Property 4', '2024-09-11', '2024-09-13', 450.00),
    ('Paul Bird', 'Property 4', '2024-09-11', '2024-09-13', 450.00)
) AS b(attendee_name, property_name, arrival_date, exit_date, total_amount)
JOIN public.attendees a ON a.name = b.attendee_name
JOIN public.properties p ON p.name = b.property_name;

-- Verify data was loaded correctly
DO $$
DECLARE
    property_count INTEGER;
    attendee_count INTEGER;
    booking_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO property_count FROM public.properties;
    SELECT COUNT(*) INTO attendee_count FROM public.attendees;
    SELECT COUNT(*) INTO booking_count FROM public.bookings;
    
    RAISE NOTICE 'Data load complete:';
    RAISE NOTICE '  Properties: %', property_count;
    RAISE NOTICE '  Attendees: %', attendee_count;
    RAISE NOTICE '  Bookings: %', booking_count;
    
    IF property_count != 4 OR attendee_count != 24 OR booking_count != 24 THEN
        RAISE EXCEPTION 'Data load verification failed. Expected 4 properties, 24 attendees, and 24 bookings.';
    END IF;
END $$;