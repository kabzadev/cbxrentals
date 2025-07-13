# Database Migration Instructions

## New Features Added

1. **Date Confirmation and Modification Tracking**
   - Guests can confirm their dates during check-in
   - Guests can modify dates if they're incorrect
   - System tracks original dates and modifications
   - Alerts appear for admin when dates are modified

2. **Enhanced Payment Tracking**
   - Payment confirmation timestamp is recorded
   - Venmo payment integration in check-in wizard

3. **Property Images**
   - Property image carousel for each property
   - Images displayed in property cards and check-in wizard

## Database Migration Required

Run the following migration on your Supabase project:

```sql
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
```

## How to Apply the Migration

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the migration SQL above
4. Click "Run" to execute the migration

## New Features Overview

### For Guests (Check-In Process)
1. Navigate to `/check-in`
2. Enter last name and phone number
3. Step 1: Confirm or modify arrival/departure dates
4. Step 2: View property details with images
5. Step 3: Make payment via Venmo (QR code shown)

### For Admins
1. View date modification alerts on attendee details page
2. See confirmation badges for dates
3. Track payment confirmation timestamps
4. Monitor which guests have modified their dates

### UI Components Added
- `PropertyImages.tsx` - Image carousel for properties
- `DateModificationAlert.tsx` - Alert component for modified dates
- Enhanced `CheckInWizard.tsx` with date editing capabilities
- Updated `AttendeeDetails.tsx` to show modification alerts

## Notes
- Property images currently use placeholder images from Unsplash
- To add actual VRBO images, update the `property_images` table with real image URLs
- The system automatically tracks original dates when bookings are created
- Date modifications are flagged for admin review