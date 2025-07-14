import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running photos table migration...\n');

  try {
    // Create photos table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (createError) {
      console.error('Error creating table:', createError);
      return;
    }

    console.log('✅ Photos table created successfully');

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable Row Level Security
        ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Photos are viewable by anyone" ON photos;
        DROP POLICY IF EXISTS "Attendees can upload their own photos" ON photos;
        DROP POLICY IF EXISTS "Attendees can update their own photos" ON photos;
        DROP POLICY IF EXISTS "Attendees can delete their own photos" ON photos;

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
      `
    });

    if (rlsError) {
      console.error('Error setting up RLS:', rlsError);
      return;
    }

    console.log('✅ RLS policies created successfully');

    // Add comment
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON TABLE photos IS 'Stores references to photos uploaded to Azure Blob Storage';
      `
    });

    if (commentError) {
      console.error('Error adding comment:', commentError);
    }

    console.log('\n✅ Photos table migration completed successfully!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runMigration();