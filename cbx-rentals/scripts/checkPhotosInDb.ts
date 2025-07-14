import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPhotos() {
  console.log('Checking photos in database...\n');

  try {
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return;
    }

    if (!photos || photos.length === 0) {
      console.log('No photos in database');
      return;
    }

    console.log(`Found ${photos.length} photos:\n`);
    
    photos.forEach(photo => {
      console.log(`Filename: ${photo.filename}`);
      console.log(`Uploaded: ${photo.uploaded_at}`);
      console.log(`URL: ${photo.url}`);
      console.log(`Has SAS token: ${photo.url.includes('?') ? 'Yes' : 'No'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkPhotos();