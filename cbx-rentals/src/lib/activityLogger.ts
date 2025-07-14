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
  console.log('logActivity called:', { attendeeId, attendeeName, activityType, details });
  
  try {
    // Get user agent and other browser info
    const userAgent = navigator.userAgent;
    
    // Note: IP address would need to be obtained server-side
    // For now, we'll log what we can from the client
    
    const logEntry = {
      attendee_id: attendeeId,
      attendee_name: attendeeName,
      activity_type: activityType,
      activity_details: details || {},
      user_agent: userAgent,
      ip_address: null // Would need server-side implementation
    };
    
    console.log('Inserting activity log:', logEntry);
    
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(logEntry)
      .select();

    if (error) {
      console.error('Failed to log activity:', error);
    } else {
      console.log('Activity logged successfully:', data);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}