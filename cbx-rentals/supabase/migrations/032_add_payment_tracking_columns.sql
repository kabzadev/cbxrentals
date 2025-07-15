-- Add columns to track partial payments
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- Update existing paid bookings to have the correct paid_amount and status
UPDATE bookings 
SET paid_amount = total_amount, 
    payment_status = 'paid' 
WHERE paid = true;

-- Update existing unpaid bookings to have the correct status
UPDATE bookings 
SET payment_status = 'unpaid' 
WHERE paid = false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add a comment to document the payment tracking
COMMENT ON COLUMN bookings.paid_amount IS 'Amount paid by the attendee. Can be less than total_amount for partial payments.';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: unpaid (0 paid), partial (some paid), paid (full amount paid)';