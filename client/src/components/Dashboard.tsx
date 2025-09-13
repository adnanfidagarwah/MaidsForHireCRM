import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Briefcase, Clock, Phone, MessageSquare, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalClients: number;
  totalJobs: number;
  totalRevenue: number;
  activeLeads: number;
  completedJobsThisMonth: number;
  pendingBookings: number;
}

interface Job {
  id: string;
  clientId: string;
  service: string;
  scheduledDate: string;
  scheduledTime: string;
  staff: string[];
  status: string;
}

interface Booking {
  id: string;
  clientId: string;
  service: string;
  date: string;
  time: string;
  staff: string[];
  status: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function Dashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch today's jobs
  const today = new Date().toISOString().split('T')[0];
  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs', { startDate: today, endDate: today }],
    select: (data) => data?.slice(0, 3) || [], // Only show first 3 jobs
  });

  // Fetch all clients for name lookup
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Create a client lookup map
  const clientMap = new Map(clients?.map(client => [client.id, client]) || []);

  // Get client name by ID
  const getClientName = (clientId: string) => {
    return clientMap.get(clientId)?.name || 'Unknown Client';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'job': return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'lead': return <Users className="w-4 h-4 text-orange-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'scheduled': return 'default';
      case 'in-progress': return 'destructive';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  // Mock recent activity for now (would come from an activity log table in a real app)
  const recentActivity = [
    { id: 1, type: 'job', client: 'Recent Client', action: 'Job updated', time: '2 min ago' },
    { id: 2, type: 'booking', client: 'New Client', action: 'Booking created', time: '15 min ago' },
    { id: 3, type: 'lead', client: 'Potential Client', action: 'Lead added', time: '1 hour ago' },
  ];

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6" data-testid="dashboard">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-testid="button-export-data">Export Data</Button>
          <Button data-testid="button-new-booking">New Booking</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              ${stats?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              From completed jobs
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-jobs">
              {stats?.totalJobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedJobsThisMonth || 0} completed this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clients">
              {stats?.totalClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-bookings">
              {stats?.pendingBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-2 h-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-md hover-elevate" data-testid={`job-${job.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium" data-testid={`text-client-${job.id}`}>
                          {getClientName(job.clientId)}
                        </p>
                        <p className="text-sm text-muted-foreground">{job.service}</p>
                        <p className="text-xs text-muted-foreground">
                          Staff: {job.staff?.join(', ') || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" data-testid={`text-time-${job.id}`}>
                        {job.scheduledTime}
                      </p>
                      <Badge variant={getStatusColor(job.status)} data-testid={`badge-status-${job.id}`}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No jobs scheduled for today</p>
                <Button className="mt-4" data-testid="button-schedule-job">
                  Schedule First Job
                </Button>
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <Button variant="outline" className="w-full" data-testid="button-view-all-jobs">
                View Full Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" data-testid={`text-client-activity-${activity.id}`}>
                      {activity.client}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="ghost" className="w-full" data-testid="button-view-all-activity">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Leads Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sales Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold" data-testid="text-active-leads">
                {stats?.activeLeads || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active leads in pipeline</p>
            </div>
            <Button variant="outline" data-testid="button-view-pipeline">
              View Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}