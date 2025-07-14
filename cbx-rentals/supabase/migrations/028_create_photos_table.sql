-- Create photos table to track uploaded event photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_photos_attendee_id ON photos(attendee_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view photos
CREATE POLICY "Photos are viewable by anyone"
  ON photos FOR SELECT
  USING (true);

-- Attendees can upload their own photos
CREATE POLICY "Attendees can upload their own photos"
  ON photos FOR INSERT
  WITH CHECK (
    attendee_id IN (
      SELECT id FROM attendees 
      WHERE id = auth.uid() OR id = photos.attendee_id
    )
  );

-- Attendees can update their own photos (e.g., add captions)
CREATE POLICY "Attendees can update their own photos"
  ON photos FOR UPDATE
  USING (
    attendee_id IN (
      SELECT id FROM attendees 
      WHERE id = auth.uid() OR id = photos.attendee_id
    )
  );

-- Attendees can delete their own photos
CREATE POLICY "Attendees can delete their own photos"
  ON photos FOR DELETE
  USING (
    attendee_id IN (
      SELECT id FROM attendees 
      WHERE id = auth.uid() OR id = photos.attendee_id
    )
  );

-- Add a comment to the table
COMMENT ON TABLE photos IS 'Stores references to photos uploaded to Azure Blob Storage';