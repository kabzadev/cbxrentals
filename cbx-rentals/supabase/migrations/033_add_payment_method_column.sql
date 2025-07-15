-- Add payment_method column to track how payments were made
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('venmo', 'zelle', 'paypal', 'cash', NULL));

-- Add index for better query performance on payment method
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);

-- Add a comment to document the payment method
COMMENT ON COLUMN bookings.payment_method IS 'Payment method used: venmo, zelle, paypal, cash, or NULL if not paid';