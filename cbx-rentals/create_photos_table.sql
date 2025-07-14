-- Create photos table to track uploaded event photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_attendee_id ON photos(attendee_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Photos are viewable by anyone" ON photos;
DROP POLICY IF EXISTS "Anyone can upload photos" ON photos;
DROP POLICY IF EXISTS "Anyone can update photos" ON photos;
DROP POLICY IF EXISTS "Anyone can delete photos" ON photos;

-- Create policies
-- Anyone can view photos
CREATE POLICY "Photos are viewable by anyone"
  ON photos FOR SELECT
  USING (true);

-- Anyone can insert photos (simplified for now)
CREATE POLICY "Anyone can upload photos"
  ON photos FOR INSERT
  WITH CHECK (true);

-- Anyone can update their own photos (simplified for now)
CREATE POLICY "Anyone can update photos"
  ON photos FOR UPDATE
  USING (true);

-- Anyone can delete photos (admin functionality)
CREATE POLICY "Anyone can delete photos"
  ON photos FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE photos IS 'Stores references to photos uploaded to Azure Blob Storage';

-- To run this migration:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute the migration