-- First ensure Off-site property exists
INSERT INTO public.properties (
    name, 
    address, 
    latitude, 
    longitude, 
    max_occupancy, 
    price_per_night,
    bedrooms,
    bathrooms,
    sleeps,
    property_type
) VALUES (
    'Off-site', 
    'Various Locations', 
    33.1950,
    -117.3795, 
    20,
    0.00,
    0,
    0,
    0,
    'off-site'
) ON CONFLICT (name) DO NOTHING;

-- Add Hector if he doesn't exist
INSERT INTO public.attendees (name, email, phone, has_rental_car, needs_airport_pickup)
SELECT 'Hector Garcia', 'hector.garcia@example.com', '5555551234', false, false
WHERE NOT EXISTS (
    SELECT 1 FROM attendees WHERE name ILIKE 'Hector%'
);

-- Create booking for Hector
DO $$
DECLARE
    hector_id UUID;
    offsite_id UUID;
BEGIN
    -- Get Hector's ID
    SELECT id INTO hector_id FROM attendees WHERE name ILIKE 'Hector%' LIMIT 1;
    
    -- Get Off-site property ID
    SELECT id INTO offsite_id FROM properties WHERE name = 'Off-site';
    
    IF hector_id IS NOT NULL AND offsite_id IS NOT NULL THEN
        -- Insert booking if it doesn't exist
        INSERT INTO bookings (
            attendee_id,
            property_id,
            arrival_date,
            exit_date,
            total_amount,
            paid
        )
        SELECT 
            hector_id,
            offsite_id,
            '2025-09-12',
            '2025-09-13',
            0,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM bookings WHERE attendee_id = hector_id
        );
    END IF;
END $$;

-- Update Eric Kessler to Off-site
DO $$
DECLARE
    eric_id UUID;
    offsite_id UUID;
BEGIN
    -- Get Eric's ID
    SELECT id INTO eric_id FROM attendees WHERE name = 'Eric Kessler';
    
    -- Get Off-site property ID
    SELECT id INTO offsite_id FROM properties WHERE name = 'Off-site';
    
    IF eric_id IS NOT NULL AND offsite_id IS NOT NULL THEN
        -- Update existing booking to off-site
        UPDATE bookings 
        SET property_id = offsite_id,
            total_amount = 0,
            paid = true
        WHERE attendee_id = eric_id;
    END IF;
END $$;

-- Verify the results
SELECT 
    a.name as attendee_name,
    p.name as property_name,
    b.total_amount,
    b.paid
FROM attendees a
JOIN bookings b ON a.id = b.attendee_id
JOIN properties p ON b.property_id = p.id
WHERE a.name ILIKE 'Hector%' OR a.name = 'Eric Kessler'
ORDER BY a.name;