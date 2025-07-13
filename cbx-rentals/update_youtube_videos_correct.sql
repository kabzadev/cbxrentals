-- First, let's check the current listing_url values
SELECT name, listing_url 
FROM properties 
ORDER BY name;

-- Update the listing_url field with YouTube URLs for Houses 3 and 4
-- Since houses 1 and 2 already work, we'll use the same field
UPDATE properties 
SET listing_url = 'https://www.youtube.com/watch?v=Qwo9aq8q90U' 
WHERE name = 'House 3';

UPDATE properties 
SET listing_url = 'https://www.youtube.com/watch?v=mzPQJxp-oEE' 
WHERE name = 'House 4';

-- Verify the updates
SELECT name, listing_url 
FROM properties 
ORDER BY name;