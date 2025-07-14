-- Create activity logs table to track user activities
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendee_id UUID REFERENCES public.attendees(id),
    attendee_name TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'login', 'check_in_completed', 'check_in_started'
    activity_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_activity_logs_attendee_id ON public.activity_logs(attendee_id);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_attendee_name ON public.activity_logs(attendee_name);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to insert their own logs
CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows admins to view all logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT USING (true);

-- Add comments
COMMENT ON TABLE public.activity_logs IS 'Tracks user activities like logins and check-ins';
COMMENT ON COLUMN public.activity_logs.activity_type IS 'Type of activity: login, check_in_completed, check_in_started';
COMMENT ON COLUMN public.activity_logs.activity_details IS 'JSON object with additional details about the activity';