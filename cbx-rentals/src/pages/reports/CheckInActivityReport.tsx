import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, User, Home, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency } from '../../lib/utils';

interface CheckInActivity {
  id: string;
  attendee_id: string | null;
  attendee_name: string;
  activity_type: 'check_in_started' | 'check_in_completed';
  activity_details: any;
  created_at: string;
}

export function CheckInActivityReport() {
  const [activities, setActivities] = useState<CheckInActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'started' | 'completed'>('all');
  const [stats, setStats] = useState({
    totalStarted: 0,
    totalCompleted: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchCheckInActivities();
  }, [filter]);

  const fetchCheckInActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .in('activity_type', ['check_in_started', 'check_in_completed'])
        .order('created_at', { ascending: false });

      if (filter === 'started') {
        query = query.eq('activity_type', 'check_in_started');
      } else if (filter === 'completed') {
        query = query.eq('activity_type', 'check_in_completed');
      }

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);

      // Calculate stats
      const started = (data || []).filter(a => a.activity_type === 'check_in_started').length;
      const completed = (data || []).filter(a => a.activity_type === 'check_in_completed').length;
      setStats({
        totalStarted: started,
        totalCompleted: completed,
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching check-in activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (type: string) => {
    if (type === 'check_in_completed') {
      return <Badge className="bg-green-600">Completed</Badge>;
    }
    return <Badge variant="secondary">Started</Badge>;
  };

  const getPaymentMethod = (details: any) => {
    if (!details?.method) return '-';
    if (details.method === 'payment_flow') return 'Paid';
    if (details.method === 'without_payment') return 'Pay Later';
    return details.method;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check-In Activity Report</h1>
        <p className="text-gray-600">Track guest check-in progress and completion</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Check-Ins Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStarted}</div>
            <p className="text-xs text-gray-500">Total initiated</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Check-Ins Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalCompleted}</div>
            <p className="text-xs text-gray-500">Successfully finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-gray-500">Of started check-ins</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="started">Started Only</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check-In Activity</CardTitle>
          <CardDescription>
            Detailed log of all check-in activities
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
            <p className="text-center text-gray-500 py-8">No check-in activity found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
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
                      {getStatusBadge(activity.activity_type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {activity.activity_details?.propertyName || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.activity_details?.amount ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="font-medium">
                            {formatCurrency(activity.activity_details.amount)}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethod(activity.activity_details)}
                      </Badge>
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