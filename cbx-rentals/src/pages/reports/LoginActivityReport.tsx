import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, User, Smartphone, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui/skeleton';

interface LoginActivity {
  id: string;
  attendee_id: string | null;
  attendee_name: string;
  activity_type: string;
  activity_details: any;
  user_agent: string;
  created_at: string;
}

export function LoginActivityReport() {
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'attendee'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchLoginActivities();
  }, [filter, timeRange]);

  const fetchLoginActivities = async () => {
    setLoading(true);
    console.log('Fetching login activities...');
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('activity_type', 'login')
        .order('created_at', { ascending: false });

      // Apply time range filter
      const now = new Date();
      if (timeRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query = query.gte('created_at', today.toISOString());
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data, error } = await query;

      console.log('Login activities query result:', { data, error });

      if (error) throw error;

      // Apply user type filter
      let filteredData = data || [];
      if (filter !== 'all') {
        filteredData = filteredData.filter(activity => 
          activity.activity_details?.userType === filter
        );
      }

      console.log('Filtered activities:', filteredData);
      setActivities(filteredData);
    } catch (error) {
      console.error('Error fetching login activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceType = (userAgent: string) => {
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Login Activity Report</h1>
        <p className="text-gray-600">Monitor user login activity and access patterns</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="attendee">Attendees Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            {activities.length} logins {timeRange !== 'all' && `in the selected period`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No login activity found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Browser</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {format(new Date(activity.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(activity.created_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{activity.attendee_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={activity.activity_details?.userType === 'admin' ? 'destructive' : 'default'}>
                        {activity.activity_details?.userType || 'attendee'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {activity.activity_details?.method || 'standard'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getDeviceType(activity.user_agent)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {getBrowserInfo(activity.user_agent)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}