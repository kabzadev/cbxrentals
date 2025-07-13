-- Get all attendees to find exact names
SELECT id, name, phone, email
FROM attendees
ORDER BY name;

-- This will show you all attendees so you can find:
-- 1. The exact spelling of Zach's name
-- 2. The exact spelling of Joel/Eliza's name (might be separate people or one person)
-- 3. The exact spelling of Alexander's name
-- 4. The exact spelling of James's name

-- Once you have the exact names, use these update statements:
-- UPDATE attendees SET phone = '440-665-3628' WHERE name = 'EXACT_NAME_HERE';
-- UPDATE attendees SET phone = '832-270-2627' WHERE name = 'EXACT_NAME_HERE';
-- UPDATE attendees SET phone = '717-364-9848' WHERE name = 'EXACT_NAME_HERE';
-- UPDATE attendees SET phone = '619-972-5501' WHERE name = 'EXACT_NAME_HERE';