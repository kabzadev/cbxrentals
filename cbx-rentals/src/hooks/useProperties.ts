import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Property = Database['public']['Tables']['properties']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Attendee = Database['public']['Tables']['attendees']['Row'];

export interface PropertyWithBookings extends Property {
  bookings: (Booking & { attendee: Attendee })[];
  currentOccupancy: number;
  totalRevenue: number;
}

export function useProperties() {
  const [properties, setProperties] = useState<PropertyWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch properties with their bookings and attendee information
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          bookings (
            *,
            attendee:attendees (*)
          )
        `)
        .order('name');

      if (propertiesError) throw propertiesError;

      // Calculate current occupancy and total revenue for each property
      const today = new Date().toISOString().split('T')[0];
      const enrichedProperties = (propertiesData || []).map(property => {
        // Filter bookings to only include current ones
        const currentBookings = property.bookings.filter((booking: Booking) => {
          return booking.arrival_date <= today && booking.exit_date >= today;
        });

        // Calculate total revenue from all bookings
        const totalRevenue = property.bookings.reduce((sum: number, booking: Booking) => {
          return sum + booking.total_amount;
        }, 0);

        return {
          ...property,
          currentOccupancy: currentBookings.length,
          totalRevenue,
        };
      });

      setProperties(enrichedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();

    // Set up real-time subscription for properties
    const propertiesSubscription = supabase
      .channel('properties_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    // Set up real-time subscription for bookings
    const bookingsSubscription = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesSubscription);
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  return { properties, loading, error, refetch: fetchProperties };
}