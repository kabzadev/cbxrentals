-- Update Denny Gallap's booking from House 3 to Off-site
UPDATE bookings
SET property_id = 'c827c140-d667-4814-ba78-50f0a6897079' -- Off-site property ID
WHERE id = '82b79137-490b-4c95-9656-f35317cfe4d6'; -- Denny Gallap's booking ID

-- Add a comment to track this change
COMMENT ON COLUMN bookings.property_id IS 'Updated Denny Gallap from House 3 to Off-site on 2025-07-16';