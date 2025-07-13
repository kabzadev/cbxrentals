-- Check the current structure of the properties table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Check current data in properties table
SELECT id, name, listing_url 
FROM properties 
ORDER BY name;

-- Check if there are any video-related columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name LIKE '%video%' OR column_name LIKE '%url%';