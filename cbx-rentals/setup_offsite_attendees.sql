-- First, create the Off-site property if it doesn't exist
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

-- Get the Off-site property ID
DO $$
DECLARE
    offsite_property_id UUID;
    hector_id UUID;
    eric_id UUID;
BEGIN
    -- Get the Off-site property ID
    SELECT id INTO offsite_property_id 
    FROM properties 
    WHERE name = 'Off-site';
    
    -- Find Hector and update his booking
    FOR hector_id IN 
        SELECT id FROM attendees 
        WHERE name ILIKE 'Hector%'
    LOOP
        -- Update existing booking to off-site
        UPDATE bookings 
        SET property_id = offsite_property_id,
            total_amount = 0
        WHERE attendee_id = hector_id;
        
        -- If no booking exists, create one
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
            offsite_property_id,
            '2025-09-12',
            '2025-09-13',
            0,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM bookings WHERE attendee_id = hector_id
        );
        
        RAISE NOTICE 'Updated attendee % to Off-site', hector_id;
    END LOOP;
    
    -- Find Eric and update his booking  
    FOR eric_id IN 
        SELECT id FROM attendees 
        WHERE name ILIKE 'Eric%'
    LOOP
        -- Update existing booking to off-site
        UPDATE bookings 
        SET property_id = offsite_property_id,
            total_amount = 0
        WHERE attendee_id = eric_id;
        
        -- If no booking exists, create one
        INSERT INTO bookings (
            attendee_id,
            property_id,
            arrival_date,
            exit_date,
            total_amount,
            paid
        )
        SELECT 
            eric_id,
            offsite_property_id,
            '2025-09-12',
            '2025-09-13',
            0,
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM bookings WHERE attendee_id = eric_id
        );
        
        RAISE NOTICE 'Updated attendee % to Off-site', eric_id;
    END LOOP;
END $$;

-- Verify the results
SELECT 
    a.name as attendee_name,
    p.name as property_name,
    b.total_amount
FROM attendees a
JOIN bookings b ON a.id = b.attendee_id
JOIN properties p ON b.property_id = p.id
WHERE a.name ILIKE 'Hector%' OR a.name ILIKE 'Eric%'
ORDER BY a.name;