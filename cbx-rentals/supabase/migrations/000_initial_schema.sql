-- Initial schema for CBX Rentals
-- This file combines all table creation in the correct order

-- 1. Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    max_occupancy INTEGER NOT NULL CHECK (max_occupancy > 0),
    price_per_night DECIMAL(10, 2) NOT NULL CHECK (price_per_night >= 0),
    listing_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for properties
CREATE INDEX idx_properties_name ON public.properties(name);
CREATE INDEX idx_properties_created_at ON public.properties(created_at);

-- 2. Create attendees table
CREATE TABLE IF NOT EXISTS public.attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    has_rental_car BOOLEAN DEFAULT false NOT NULL,
    needs_airport_pickup BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for attendees
CREATE INDEX idx_attendees_email ON public.attendees(email);
CREATE INDEX idx_attendees_name ON public.attendees(name);
CREATE INDEX idx_attendees_created_at ON public.attendees(created_at);
CREATE UNIQUE INDEX idx_attendees_email_unique ON public.attendees(lower(email));

-- 3. Create bookings table
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

-- Create indexes for bookings
CREATE INDEX idx_bookings_attendee_id ON public.bookings(attendee_id);
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_arrival_date ON public.bookings(arrival_date);
CREATE INDEX idx_bookings_exit_date ON public.bookings(exit_date);
CREATE INDEX idx_bookings_paid ON public.bookings(paid);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX idx_bookings_date_range ON public.bookings(property_id, arrival_date, exit_date);

-- 4. Enable Row Level Security on all tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies (to be refined later based on auth requirements)
CREATE POLICY "Allow all operations on properties" ON public.properties
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on attendees" ON public.attendees
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on bookings" ON public.bookings
    FOR ALL USING (true);

-- 6. Add table comments
COMMENT ON TABLE public.properties IS 'Rental properties available for CBX Experience attendees';
COMMENT ON TABLE public.attendees IS 'CBX Experience event attendees';
COMMENT ON TABLE public.bookings IS 'Bookings linking attendees to properties with dates and payment info';