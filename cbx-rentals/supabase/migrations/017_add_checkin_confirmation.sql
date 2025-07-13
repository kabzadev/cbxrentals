-- Add check-in confirmation field to attendees table
ALTER TABLE attendees 
ADD COLUMN checked_in BOOLEAN DEFAULT FALSE;

-- Add check-in timestamp field
ALTER TABLE attendees 
ADD COLUMN check_in_time TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on checked_in status
CREATE INDEX idx_attendees_checked_in ON attendees(checked_in);

-- Update any existing attendees to have a default check-in status
UPDATE attendees SET checked_in = FALSE WHERE checked_in IS NULL;