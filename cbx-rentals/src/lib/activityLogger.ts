import { supabase } from './supabase';

export type ActivityType = 'login' | 'check_in_started' | 'check_in_completed';

interface ActivityDetails {
  [key: string]: any;
}

export async function logActivity(
  attendeeId: string | null,
  attendeeName: string,
  activityType: ActivityType,
  details?: ActivityDetails
) {
  try {
    // Get user agent and other browser info
    const userAgent = navigator.userAgent;
    
    // Note: IP address would need to be obtained server-side
    // For now, we'll log what we can from the client
    
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        attendee_id: attendeeId,
        attendee_name: attendeeName,
        activity_type: activityType,
        activity_details: details || {},
        user_agent: userAgent,
        ip_address: null // Would need server-side implementation
      });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}