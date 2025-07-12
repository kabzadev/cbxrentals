import { supabase } from './supabase'

// Test queries for each table

export async function testDatabaseConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect
    const { error: healthError } = await supabase
      .from('properties')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('Health check failed:', healthError)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test 2: Insert a test property
    const testProperty = {
      name: 'Test Property',
      address: '123 Test Street, Test City',
      latitude: 33.7490,
      longitude: -84.3880,
      max_occupancy: 4,
      price_per_night: 150.00,
      listing_url: 'https://example.com/property'
    }
    
    const { data: insertedProperty, error: insertError } = await supabase
      .from('properties')
      .insert([testProperty])
      .select()
      .single()
    
    if (insertError) {
      console.error('Insert test failed:', insertError)
      return false
    }
    
    console.log('✅ Property insert successful:', insertedProperty)
    
    // Test 3: Query properties
    const { data: properties, error: queryError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (queryError) {
      console.error('Query test failed:', queryError)
      return false
    }
    
    console.log('✅ Query successful. Found', properties?.length, 'properties')
    
    // Test 4: Clean up - delete test property
    if (insertedProperty) {
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', insertedProperty.id)
      
      if (deleteError) {
        console.error('Cleanup failed:', deleteError)
      } else {
        console.log('✅ Test property cleaned up')
      }
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error during testing:', error)
    return false
  }
}

// Example query functions for use in the app

export async function getAllProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getAllAttendees() {
  const { data, error } = await supabase
    .from('attendees')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getBookingsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      attendee:attendees(*),
      property:properties(*)
    `)
    .eq('property_id', propertyId)
    .order('arrival_date')
  
  if (error) throw error
  return data
}

export async function createBooking(booking: {
  attendee_id: string
  property_id: string
  arrival_date: string
  exit_date: string
  total_amount: number
  paid?: boolean
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()
  
  if (error) throw error
  return data
}