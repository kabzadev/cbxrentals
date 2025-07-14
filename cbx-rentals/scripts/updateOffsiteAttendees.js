import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhmxocpjgpujoelzmzbn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXhvY3BqZ3B1am9lbHptemJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MjI3NjcsImV4cCI6MjA0NTE5ODc2N30.SxBZCOJKL3PjImm3fTcvfgNaR3a0xb5Qxzw2c-6S7e0'
);

async function updateOffsiteAttendees() {
  console.log('Setting up off-site attendees...\n');

  try {
    // First, find or create the Off-site property
    let { data: offsiteProperty, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('name', 'Off-site')
      .single();

    if (propError) {
      console.log('Off-site property not found. Creating it...');
      
      const { data: newProperty, error: createError } = await supabase
        .from('properties')
        .insert({
          name: 'Off-site',
          address: 'Various Locations',
          latitude: 33.1950,
          longitude: -117.3795,
          max_occupancy: 20,
          price_per_night: 0,
          bedrooms: 0,
          bathrooms: 0,
          sleeps: 0,
          property_type: 'off-site'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating off-site property:', createError);
        return;
      }
      offsiteProperty = newProperty;
    }

    console.log('Off-site property ID:', offsiteProperty.id);

    // Find Hector and Eric
    const offsiteNames = ['Hector', 'Eric'];
    
    for (const firstName of offsiteNames) {
      console.log(`\nLooking for attendees with first name: ${firstName}`);
      
      const { data: attendees, error: attendeeError } = await supabase
        .from('attendees')
        .select('id, name, bookings(*)')
        .ilike('name', `${firstName}%`);

      if (attendeeError) {
        console.error(`Error finding ${firstName}:`, attendeeError);
        continue;
      }

      if (!attendees || attendees.length === 0) {
        console.log(`No attendees found with name starting with ${firstName}`);
        continue;
      }

      for (const attendee of attendees) {
        console.log(`Found: ${attendee.name}`);
        
        // Check if they already have a booking
        if (attendee.bookings && attendee.bookings.length > 0) {
          const currentBooking = attendee.bookings[0];
          
          // Update existing booking to off-site property
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
              property_id: offsiteProperty.id,
              total_amount: 0  // No charge for off-site
            })
            .eq('id', currentBooking.id);

          if (updateError) {
            console.error(`Error updating booking for ${attendee.name}:`, updateError);
          } else {
            console.log(`✓ Updated ${attendee.name} to Off-site`);
          }
        } else {
          // Create new booking for off-site
          const { error: createBookingError } = await supabase
            .from('bookings')
            .insert({
              attendee_id: attendee.id,
              property_id: offsiteProperty.id,
              arrival_date: '2025-09-12',
              exit_date: '2025-09-13',
              total_amount: 0,
              paid: true  // Mark as paid since there's no charge
            });

          if (createBookingError) {
            console.error(`Error creating booking for ${attendee.name}:`, createBookingError);
          } else {
            console.log(`✓ Created Off-site booking for ${attendee.name}`);
          }
        }
      }
    }

    console.log('\nDone! Hector and Eric should now show as Off-site.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateOffsiteAttendees();