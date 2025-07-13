-- First, let's see the current data to verify names
SELECT id, name, phone 
FROM attendees 
WHERE 
  name ILIKE '%zach%' OR 
  name ILIKE '%joel%' OR 
  name ILIKE '%eliza%' OR 
  name ILIKE '%alex%' OR 
  name ILIKE '%james%'
ORDER BY name;

-- After verifying, you can run these updates:
-- UPDATE attendees SET phone = '4406653628' WHERE id = 'xxx'; -- Replace xxx with Zach's ID
-- UPDATE attendees SET phone = '8322702627' WHERE id = 'xxx'; -- Replace xxx with Joel Eliza's ID
-- UPDATE attendees SET phone = '7173649848' WHERE id = 'xxx'; -- Replace xxx with Alexander's ID
-- UPDATE attendees SET phone = '6199725501' WHERE id = 'xxx'; -- Replace xxx with James's ID