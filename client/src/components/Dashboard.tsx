import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Briefcase, Clock, Phone, MessageSquare, TrendingUp } from "lucide-react";

export default function Dashboard() {
  // todo: remove mock functionality
  const stats = {
    totalRevenue: 15420,
    activeJobs: 23,
    totalClients: 167,
    pendingBookings: 8,
    completedToday: 12,
    avgJobValue: 85
  };

  const recentActivity = [
    { id: 1, type: 'booking', client: 'Sarah Johnson', action: 'New booking scheduled', time: '2 min ago' },
    { id: 2, type: 'job', client: 'Mike Chen', action: 'Job completed', time: '15 min ago' },
    { id: 3, type: 'lead', client: 'Emma Davis', action: 'Lead contacted', time: '1 hour ago' },
    { id: 4, type: 'message', client: 'John Smith', action: 'SMS received', time: '2 hours ago' }
  ];

  const upcomingJobs = [
    { id: 1, client: 'Alice Brown', service: 'Deep Cleaning', time: '2:00 PM', staff: 'Maria Rodriguez', status: 'confirmed' },
    { id: 2, client: 'Tom Wilson', service: 'Regular Clean', time: '3:30 PM', staff: 'Lisa Thompson', status: 'pending' },
    { id: 3, client: 'Grace Lee', service: 'Move-out Clean', time: '5:00 PM', staff: 'Ana Martinez', status: 'confirmed' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'job': return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'lead': return <Users className="w-4 h-4 text-orange-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

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
            <div className="text-2xl font-bold" data-testid="text-total-revenue">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-jobs">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedToday} completed today
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clients">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +5 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-bookings">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Require confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-md hover-elevate" data-testid={`job-${job.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium" data-testid={`text-client-${job.id}`}>{job.client}</p>
                      <p className="text-sm text-muted-foreground">{job.service}</p>
                      <p className="text-xs text-muted-foreground">Staff: {job.staff}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" data-testid={`text-time-${job.id}`}>{job.time}</p>
                    <Badge variant={job.status === 'confirmed' ? 'default' : 'secondary'} data-testid={`badge-status-${job.id}`}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}