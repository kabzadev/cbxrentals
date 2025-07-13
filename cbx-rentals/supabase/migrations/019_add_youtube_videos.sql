-- First, add the video_url column to properties table if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add YouTube video URLs for House 3 and House 4
UPDATE properties 
SET video_url = 'https://www.youtube.com/watch?v=Qwo9aq8q90U' 
WHERE name = 'House 3';

UPDATE properties 
SET video_url = 'https://www.youtube.com/watch?v=mzPQJxp-oEE' 
WHERE name = 'House 4';

-- Verify the updates
SELECT name, video_url 
FROM properties 
WHERE name IN ('House 3', 'House 4')
ORDER BY name;