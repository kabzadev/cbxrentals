-- Update phone numbers with exact names from database
UPDATE attendees SET phone = '4406653628' WHERE name = 'Zach Forsythe';
UPDATE attendees SET phone = '8322702627' WHERE name = 'Joel Eliaz';
UPDATE attendees SET phone = '7173649848' WHERE name = 'Alexander Hernandez';
UPDATE attendees SET phone = '6199725501' WHERE name = 'Dr. James Longobardi';

-- Verify the updates
SELECT name, phone 
FROM attendees 
WHERE name IN ('Zach Forsythe', 'Joel Eliaz', 'Alexander Hernandez', 'Dr. James Longobardi')
ORDER BY name;