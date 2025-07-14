-- Update all phone numbers for CBX attendees
-- This script will update existing attendees and insert new ones if they don't exist

-- First, delete the old Denny T record if it exists
DELETE FROM bookings WHERE attendee_id IN (SELECT id FROM attendees WHERE name = 'Denny T');
DELETE FROM attendees WHERE name = 'Denny T';

-- Function to update or insert attendee
CREATE OR REPLACE FUNCTION upsert_attendee_phone(
    p_name TEXT,
    p_phone TEXT
) RETURNS VOID AS $$
BEGIN
    -- Try to update first
    UPDATE attendees 
    SET phone = p_phone 
    WHERE name = p_name;
    
    -- If no rows were updated, insert
    IF NOT FOUND THEN
        INSERT INTO attendees (name, phone, email, has_rental_car, needs_airport_pickup)
        VALUES (
            p_name, 
            p_phone, 
            LOWER(REPLACE(p_name, ' ', '.')) || '@example.com',
            false,
            false
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update/Insert all attendees
SELECT upsert_attendee_phone('Zach Forsythe', '4406653628');
SELECT upsert_attendee_phone('Joel Eliaz', '8322702627');
SELECT upsert_attendee_phone('Alexander Hernandez', '7173649848');
SELECT upsert_attendee_phone('Dr. James Longobardi', '6199725501');
SELECT upsert_attendee_phone('Robert Steinberg', '7149751091');
SELECT upsert_attendee_phone('Keith Kabza', '7274553833');
SELECT upsert_attendee_phone('Pirmin Guolo', '417966458777');
SELECT upsert_attendee_phone('J. Faignant', '5072719155');
SELECT upsert_attendee_phone('Dwayne Anderson', '4065312847');
SELECT upsert_attendee_phone('David Carter', '6146074225');
SELECT upsert_attendee_phone('Chris McCarthy', '7028108665');
SELECT upsert_attendee_phone('Perry Roelofs', '7027548583');
SELECT upsert_attendee_phone('Peter Spadaro', '8456560829');
SELECT upsert_attendee_phone('Gordon Margerum', '4433984448');
SELECT upsert_attendee_phone('Damon Powell', '4077659440');
SELECT upsert_attendee_phone('Daniel Stewart', '5622014190');
SELECT upsert_attendee_phone('Denny Gallap', '8703071066');
SELECT upsert_attendee_phone('Timothy Schrader', '4198066789');
SELECT upsert_attendee_phone('Eric Kessler', '4804894432');
SELECT upsert_attendee_phone('Isaac De La Sierria', '4694717395');
SELECT upsert_attendee_phone('Rob Williams', '3605182903');
SELECT upsert_attendee_phone('Tyler Craig', '8312385388');
SELECT upsert_attendee_phone('Paul Bird', '9097675808');
SELECT upsert_attendee_phone('Kent Riddle', '5123590036');
SELECT upsert_attendee_phone('Hector Bordas', '4154056595');

-- Drop the function as we don't need it anymore
DROP FUNCTION IF EXISTS upsert_attendee_phone(TEXT, TEXT);

-- For any newly inserted attendees, create off-site bookings
DO $$
DECLARE
    offsite_property_id UUID;
    attendee_record RECORD;
BEGIN
    -- Get the off-site property ID
    SELECT id INTO offsite_property_id FROM properties WHERE name = 'Off-site' LIMIT 1;
    
    IF offsite_property_id IS NULL THEN
        RAISE NOTICE 'Off-site property not found. Please ensure it exists in the database.';
        RETURN;
    END IF;
    
    -- Create bookings for any attendees without bookings
    FOR attendee_record IN 
        SELECT a.id, a.name
        FROM attendees a
        LEFT JOIN bookings b ON a.id = b.attendee_id
        WHERE b.id IS NULL
    LOOP
        INSERT INTO bookings (attendee_id, property_id, arrival_date, exit_date, total_amount, paid)
        VALUES (attendee_record.id, offsite_property_id, '2025-09-12', '2025-09-13', 0, true);
        RAISE NOTICE 'Created off-site booking for %', attendee_record.name;
    END LOOP;
END $$;

-- Verify all updates
SELECT name, phone 
FROM attendees 
ORDER BY name;