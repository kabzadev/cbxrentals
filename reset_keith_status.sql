-- Reset Keith Kabza's payment and check-in status for testing

-- First, let's find Keith Kabza's attendee record
SELECT id, name, phone, checked_in FROM attendees 
WHERE LOWER(name) LIKE '%keith%kabza%';

-- Reset check-in status for Keith Kabza
UPDATE attendees 
SET checked_in = false, 
    check_in_time = NULL
WHERE LOWER(name) LIKE '%keith%kabza%';

-- Find and reset payment status for Keith Kabza's bookings
UPDATE bookings 
SET paid = false
WHERE attendee_id IN (
    SELECT id FROM attendees 
    WHERE LOWER(name) LIKE '%keith%kabza%'
);

-- Verify the changes
SELECT 
    a.name,
    a.checked_in,
    a.check_in_time,
    b.paid,
    b.total_amount
FROM attendees a
JOIN bookings b ON b.attendee_id = a.id
WHERE LOWER(a.name) LIKE '%keith%kabza%';