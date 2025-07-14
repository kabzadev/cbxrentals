-- DANGER: This script will immediately delete ALL photos from the database
-- Run this in your Supabase SQL Editor

-- Show what will be deleted
SELECT COUNT(*) as photos_to_delete FROM photos;

-- DELETE ALL PHOTOS
DELETE FROM photos;

-- Confirm deletion
SELECT COUNT(*) as remaining_photos FROM photos;