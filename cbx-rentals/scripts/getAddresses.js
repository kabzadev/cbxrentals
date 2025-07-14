import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xhmxocpjgpujoelzmzbn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobXhvY3BqZ3B1am9lbHptemJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MjI3NjcsImV4cCI6MjA0NTE5ODc2N30.SxBZCOJKL3PjImm3fTcvfgNaR3a0xb5Qxzw2c-6S7e0'
);

async function getAddresses() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, name, address')
    .order('id');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Properties:');
    data.forEach(p => console.log(`${p.name}: ${p.address}`));
  }
}

getAddresses();