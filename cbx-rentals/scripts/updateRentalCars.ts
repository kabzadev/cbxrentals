import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRentalCars() {
  console.log('Updating rental car status for specified attendees...');

  const namesToUpdate = [
    'Keith',
    'Robert Steinberg',
    'Perry',
    'Tyler',
    'Daniel',
    'James'
  ];

  try {
    // First, let's check the columns in the attendees table
    const { data: columns, error: columnError } = await supabase
      .from('attendees')
      .select('*')
      .limit(1);

    if (columnError) {
      console.error('Error checking columns:', columnError);
      return;
    }

    console.log('Available columns:', columns && columns[0] ? Object.keys(columns[0]) : 'No data');

    // Find these attendees using has_rental_car column
    const { data: attendees, error: fetchError } = await supabase
      .from('attendees')
      .select('id, name, has_rental_car')
      .or(namesToUpdate.map(name => `name.ilike.%${name}%`).join(','));

    if (fetchError) {
      console.error('Error fetching attendees:', fetchError);
      return;
    }

    console.log(`Found ${attendees?.length || 0} attendees matching the criteria:`);
    attendees?.forEach(a => console.log(`- ${a.name} (current has_rental_car: ${a.has_rental_car})`));

    // Update has_rental_car to true for these attendees
    const { data: updateData, error: updateError } = await supabase
      .from('attendees')
      .update({ has_rental_car: true })
      .or(namesToUpdate.map(name => `name.ilike.%${name}%`).join(','))
      .select();

    if (updateError) {
      console.error('Error updating attendees:', updateError);
      return;
    }

    console.log(`\nSuccessfully updated ${updateData?.length || 0} attendees:`);
    updateData?.forEach(a => console.log(`- ${a.name} (has_rental_car: ${a.has_rental_car})`));

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateRentalCars();