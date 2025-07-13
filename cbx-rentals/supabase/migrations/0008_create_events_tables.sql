-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    is_optional BOOLEAN DEFAULT false NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    map_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create event_attendees table for tracking interest in optional events
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL,
    attendee_id UUID NOT NULL,
    is_interested BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_event_attendees_event FOREIGN KEY (event_id) 
        REFERENCES public.events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_attendees_attendee FOREIGN KEY (attendee_id) 
        REFERENCES public.attendees(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate entries
    CONSTRAINT unique_event_attendee UNIQUE (event_id, attendee_id)
);

-- Create indexes
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_is_optional ON public.events(is_optional);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_attendee_id ON public.event_attendees(attendee_id);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for events (read-only for all authenticated users)
CREATE POLICY "Allow all to read events" ON public.events
    FOR SELECT USING (true);

-- Create policies for event_attendees
CREATE POLICY "Allow all to read event_attendees" ON public.event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Allow attendees to manage their own interest" ON public.event_attendees
    FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE public.events IS 'CBX Experience events - both official and optional';
COMMENT ON COLUMN public.events.is_optional IS 'True if event is optional, false if it is part of the official program';
COMMENT ON COLUMN public.events.location_latitude IS 'Latitude for map display';
COMMENT ON COLUMN public.events.location_longitude IS 'Longitude for map display';
COMMENT ON COLUMN public.events.map_url IS 'Optional direct link to Google Maps or similar';

COMMENT ON TABLE public.event_attendees IS 'Tracks which attendees are interested in optional events';
COMMENT ON COLUMN public.event_attendees.is_interested IS 'Whether the attendee is interested in attending this optional event';