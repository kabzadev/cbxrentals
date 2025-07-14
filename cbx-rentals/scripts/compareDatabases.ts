import { createClient } from '@supabase/supabase-js';

// Database 1 - From .env file (what the app uses)
const db1Url = 'https://xhmxocpjgpujoelzmzbn.supabase.co';
const db1Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXhvY3BqZ3B1am9lbHptemJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MjI3NjcsImV4cCI6MjA0NTE5ODc2N30.SxBZCOJKL3PjImm3fTcvfgNaR3a0xb5Qxzw2c-6S7e0';

// Database 2 - From scripts (where updates were made)
const db2Url = 'https://ttsharxrnbcqbmllvgwa.supabase.co';
const db2Key = 'YOUR_SERVICE_KEY'; // We'll use the anon key if available

const db1 = createClient(db1Url, db1Key);

async function compareDatabases() {
  console.log('Comparing two Supabase instances...\n');
  
  console.log('Database 1 (from .env - app uses this): xhmxocpjgpujoelzmzbn');
  console.log('Database 2 (from scripts - updates made here): ttsharxrnbcqbmllvgwa\n');

  try {
    // Check Database 1
    console.log('=== DATABASE 1 (xhmxocpjgpujoelzmzbn) ===');
    
    const { data: attendees1, error: error1 } = await db1
      .from('attendees')
      .select('id, name, has_rental_car')
      .order('name')
      .limit(5);
      
    if (error1) {
      console.log('Error accessing DB1:', error1.message);
    } else {
      console.log(`Sample attendees (${attendees1?.length} shown):`);
      attendees1?.forEach(a => console.log(`  - ${a.name} (vehicle: ${a.has_rental_car})`));
    }
    
    // Count attendees with vehicles
    const { count: vehicleCount1 } = await db1
      .from('attendees')
      .select('*', { count: 'exact', head: true })
      .eq('has_rental_car', true);
      
    console.log(`\nTotal attendees with vehicles: ${vehicleCount1 || 0}`);
    
    // Check for Keith Kabza
    const { data: keith1 } = await db1
      .from('attendees')
      .select('name, has_rental_car, bookings(paid)')
      .ilike('name', '%Keith Kabza%')
      .single();
      
    if (keith1) {
      console.log(`\nKeith Kabza status:`);
      console.log(`  - Has vehicle: ${keith1.has_rental_car}`);
      console.log(`  - Payment status: ${keith1.bookings?.[0]?.paid}`);
    }
    
    console.log('\n=== DATABASE 2 (ttsharxrnbcqbmllvgwa) ===');
    console.log('This is where recent updates were made (vehicle status, payment status)');
    console.log('But the app is NOT using this database!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

compareDatabases();