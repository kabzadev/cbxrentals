-- Create properties table
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

-- Create indexes for frequently queried fields
CREATE INDEX idx_properties_name ON public.properties(name);
CREATE INDEX idx_properties_created_at ON public.properties(created_at);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (to be refined later)
CREATE POLICY "Allow all operations on properties" ON public.properties
    FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE public.properties IS 'Rental properties available for CBX Experience attendees';
COMMENT ON COLUMN public.properties.id IS 'Unique identifier for the property';
COMMENT ON COLUMN public.properties.name IS 'Name of the property';
COMMENT ON COLUMN public.properties.address IS 'Full address of the property';
COMMENT ON COLUMN public.properties.latitude IS 'Latitude coordinate for map display';
COMMENT ON COLUMN public.properties.longitude IS 'Longitude coordinate for map display';
COMMENT ON COLUMN public.properties.max_occupancy IS 'Maximum number of attendees that can stay';
COMMENT ON COLUMN public.properties.price_per_night IS 'Nightly rate for the property';
COMMENT ON COLUMN public.properties.listing_url IS 'URL to the property listing (e.g., Airbnb, VRBO)';
COMMENT ON COLUMN public.properties.created_at IS 'Timestamp when the property was added';