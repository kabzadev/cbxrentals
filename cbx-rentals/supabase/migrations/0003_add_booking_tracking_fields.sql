-- Add tracking fields to bookings table
ALTER TABLE bookings 
ADD COLUMN dates_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN dates_modified BOOLEAN DEFAULT FALSE,
ADD COLUMN original_arrival_date DATE,
ADD COLUMN original_exit_date DATE,
ADD COLUMN date_modification_reason TEXT,
ADD COLUMN date_confirmed_at TIMESTAMPTZ,
ADD COLUMN payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN modified_at TIMESTAMPTZ;

-- Create a trigger to track original dates
CREATE OR REPLACE FUNCTION set_original_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_arrival_date IS NULL THEN
    NEW.original_arrival_date := NEW.arrival_date;
  END IF;
  IF NEW.original_exit_date IS NULL THEN
    NEW.original_exit_date := NEW.exit_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_original_dates_trigger
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_original_dates();

-- Create a function to track date modifications
CREATE OR REPLACE FUNCTION track_date_modifications()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.arrival_date != NEW.arrival_date OR OLD.exit_date != NEW.exit_date THEN
    NEW.dates_modified := TRUE;
    NEW.modified_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_date_modifications_trigger
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION track_date_modifications();

-- Add property images table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for property images
CREATE INDEX idx_property_images_property_id ON property_images(property_id);