import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2hhcnhybmJjcWJtbGx2Z3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI4NDU3NywiZXhwIjoyMDY3ODYwNTc3fQ.tO4dhbqkEJbQQJuvZdy8LAKzrLV84ezqR89XuIHLJa8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupPhotos() {
  console.log('Checking for photos without SAS tokens...\n');

  try {
    // Get all photos
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return;
    }

    if (!photos || photos.length === 0) {
      console.log('No photos found in database');
      return;
    }

    console.log(`Found ${photos.length} total photos\n`);

    // Find photos without SAS tokens (URLs that don't contain query parameters)
    const photosWithoutSAS = photos.filter(photo => !photo.url.includes('?'));

    if (photosWithoutSAS.length === 0) {
      console.log('All photos have SAS tokens. No cleanup needed.');
      return;
    }

    console.log(`Found ${photosWithoutSAS.length} photos without SAS tokens:`);
    photosWithoutSAS.forEach(photo => {
      console.log(`- ${photo.filename} (uploaded at ${photo.uploaded_at})`);
    });

    console.log('\nDeleting photos without SAS tokens...');

    // Delete photos without SAS tokens
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .in('id', photosWithoutSAS.map(p => p.id));

    if (deleteError) {
      console.error('Error deleting photos:', deleteError);
    } else {
      console.log(`✅ Successfully deleted ${photosWithoutSAS.length} photos without SAS tokens`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

cleanupPhotos();