-- Add flight and transportation information to attendees table
ALTER TABLE attendees 
ADD COLUMN arrival_airline TEXT,
ADD COLUMN arrival_flight_number TEXT,
ADD COLUMN arrival_time TIME,
ADD COLUMN departure_airline TEXT,
ADD COLUMN departure_flight_number TEXT,
ADD COLUMN departure_time TIME,
ADD COLUMN interested_in_carpool BOOLEAN DEFAULT FALSE;

-- Add property details
ALTER TABLE properties
ADD COLUMN bedrooms INTEGER DEFAULT 0,
ADD COLUMN bathrooms DECIMAL(3,1) DEFAULT 0,
ADD COLUMN sleeps INTEGER DEFAULT 0,
ADD COLUMN property_type TEXT;

-- Update properties with known information
UPDATE properties SET 
  bedrooms = CASE 
    WHEN name = 'Property 1' THEN 4
    WHEN name = 'Property 2' THEN 3
    WHEN name = 'Property 3' THEN 3
    WHEN name = 'Property 4' THEN 4
    ELSE 0
  END,
  bathrooms = CASE 
    WHEN name = 'Property 1' THEN 3.0
    WHEN name = 'Property 2' THEN 2.0
    WHEN name = 'Property 3' THEN 2.5
    WHEN name = 'Property 4' THEN 3.0
    ELSE 0
  END,
  sleeps = CASE 
    WHEN name = 'Property 1' THEN 10
    WHEN name = 'Property 2' THEN 8
    WHEN name = 'Property 3' THEN 8
    WHEN name = 'Property 4' THEN 10
    ELSE 0
  END,
  property_type = 'House';