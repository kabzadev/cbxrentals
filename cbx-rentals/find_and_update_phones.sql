-- Step 1: Find all attendees whose names might match (run this first)
SELECT id, name, phone, email
FROM attendees
WHERE 
  LOWER(name) LIKE '%zach%' OR 
  LOWER(name) LIKE '%joel%' OR 
  LOWER(name) LIKE '%eliza%' OR 
  LOWER(name) LIKE '%alex%' OR 
  LOWER(name) LIKE '%james%'
ORDER BY name;

-- Step 2: Also show ALL attendees in case the names are very different
-- SELECT id, name, phone FROM attendees ORDER BY name;

-- Step 3: Once you identify the correct attendees from above, update by ID (most reliable):
-- UPDATE attendees SET phone = '4406653628' WHERE id = 'paste-zach-id-here';
-- UPDATE attendees SET phone = '8322702627' WHERE id = 'paste-joel-eliza-id-here';
-- UPDATE attendees SET phone = '7173649848' WHERE id = 'paste-alexander-id-here';
-- UPDATE attendees SET phone = '6199725501' WHERE id = 'paste-james-id-here';

-- Alternative: Update by exact name if IDs are not visible:
-- UPDATE attendees SET phone = '4406653628' WHERE name = 'paste-exact-name-here';
-- UPDATE attendees SET phone = '8322702627' WHERE name = 'paste-exact-name-here';
-- UPDATE attendees SET phone = '7173649848' WHERE name = 'paste-exact-name-here';
-- UPDATE attendees SET phone = '6199725501' WHERE name = 'paste-exact-name-here';