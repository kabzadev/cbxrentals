-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendee_id UUID NOT NULL,
    property_id UUID NOT NULL,
    arrival_date DATE NOT NULL,
    exit_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    paid BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_bookings_attendee FOREIGN KEY (attendee_id) 
        REFERENCES public.attendees(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_property FOREIGN KEY (property_id) 
        REFERENCES public.properties(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_dates CHECK (exit_date > arrival_date)
);

-- Create indexes for frequently queried fields and foreign keys
CREATE INDEX idx_bookings_attendee_id ON public.bookings(attendee_id);
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_arrival_date ON public.bookings(arrival_date);
CREATE INDEX idx_bookings_exit_date ON public.bookings(exit_date);
CREATE INDEX idx_bookings_paid ON public.bookings(paid);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);

-- Create composite index for date range queries
CREATE INDEX idx_bookings_date_range ON public.bookings(property_id, arrival_date, exit_date);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (to be refined later)
CREATE POLICY "Allow all operations on bookings" ON public.bookings
    FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE public.bookings IS 'Bookings linking attendees to properties with dates and payment info';
COMMENT ON COLUMN public.bookings.id IS 'Unique identifier for the booking';
COMMENT ON COLUMN public.bookings.attendee_id IS 'Reference to the attendee who made the booking';
COMMENT ON COLUMN public.bookings.property_id IS 'Reference to the booked property';
COMMENT ON COLUMN public.bookings.arrival_date IS 'Check-in date';
COMMENT ON COLUMN public.bookings.exit_date IS 'Check-out date';
COMMENT ON COLUMN public.bookings.total_amount IS 'Total cost for the stay';
COMMENT ON COLUMN public.bookings.paid IS 'Payment status of the booking';
COMMENT ON COLUMN public.bookings.created_at IS 'Timestamp when the booking was created';