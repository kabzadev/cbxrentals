-- Script to delete all photos from the database
-- WARNING: This will permanently delete all photo records!

-- First, let's see what we're about to delete
SELECT COUNT(*) as total_photos, 
       COUNT(DISTINCT attendee_id) as unique_uploaders
FROM photos;

-- Show the photos that will be deleted
SELECT id, filename, uploaded_at, 
       (SELECT name FROM attendees WHERE attendees.id = photos.attendee_id) as uploader_name
FROM photos
ORDER BY uploaded_at DESC;

-- Delete all photos
-- UNCOMMENT THE NEXT LINE TO ACTUALLY DELETE
-- DELETE FROM photos;

-- Verify deletion
-- SELECT COUNT(*) as remaining_photos FROM photos;