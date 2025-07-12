-- Create attendees table
CREATE TABLE IF NOT EXISTS public.attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    has_rental_car BOOLEAN DEFAULT false NOT NULL,
    needs_airport_pickup BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for frequently queried fields
CREATE INDEX idx_attendees_email ON public.attendees(email);
CREATE INDEX idx_attendees_name ON public.attendees(name);
CREATE INDEX idx_attendees_created_at ON public.attendees(created_at);

-- Create unique constraint on email
CREATE UNIQUE INDEX idx_attendees_email_unique ON public.attendees(lower(email));

-- Enable Row Level Security
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (to be refined later)
CREATE POLICY "Allow all operations on attendees" ON public.attendees
    FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE public.attendees IS 'CBX Experience event attendees';
COMMENT ON COLUMN public.attendees.id IS 'Unique identifier for the attendee';
COMMENT ON COLUMN public.attendees.name IS 'Full name of the attendee';
COMMENT ON COLUMN public.attendees.email IS 'Email address of the attendee (unique)';
COMMENT ON COLUMN public.attendees.phone IS 'Phone number of the attendee';
COMMENT ON COLUMN public.attendees.has_rental_car IS 'Whether the attendee has a rental car';
COMMENT ON COLUMN public.attendees.needs_airport_pickup IS 'Whether the attendee needs airport pickup';
COMMENT ON COLUMN public.attendees.created_at IS 'Timestamp when the attendee was added';