import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  MoreHorizontal,
  Plus,
  Filter
} from "lucide-react";
import { useState } from "react";

interface Job {
  id: string;
  clientName: string;
  service: string;
  address: string;
  staff: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  actualDuration?: number;
  cost: number;
  tips: number;
  notes: string;
  materials: string[];
  photos: string[];
  completedDate?: string;
}

export default function JobManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  
  // todo: remove mock functionality
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      service: 'Deep Cleaning',
      address: '123 Oak Street, Downtown',
      staff: ['Maria Rodriguez', 'Ana Martinez'],
      status: 'in-progress',
      scheduledDate: '2024-01-15',
      scheduledTime: '09:00',
      estimatedDuration: 180,
      actualDuration: 120,
      cost: 250,
      tips: 25,
      notes: 'Extra attention to kitchen. Client mentioned stove needs deep cleaning.',
      materials: ['All-purpose cleaner', 'Glass cleaner', 'Microfiber cloths'],
      photos: []
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      service: 'Regular Clean',
      address: '456 Pine Avenue, Midtown',
      staff: ['Lisa Thompson'],
      status: 'scheduled',
      scheduledDate: '2024-01-15',
      scheduledTime: '11:30',
      estimatedDuration: 120,
      cost: 150,
      tips: 0,
      notes: 'Please call before arrival. Dog needs to be contained.',
      materials: ['Vacuum', 'Mop', 'All-purpose cleaner'],
      photos: []
    },
    {
      id: '3',
      clientName: 'Emma Davis',
      service: 'Move-out Clean',
      address: '789 Elm Drive, Suburbs',
      staff: ['Maria Rodriguez', 'Lisa Thompson'],
      status: 'completed',
      scheduledDate: '2024-01-14',
      scheduledTime: '14:00',
      estimatedDuration: 240,
      actualDuration: 220,
      cost: 320,
      tips: 40,
      notes: 'Complete move-out cleaning. All rooms cleaned thoroughly.',
      materials: ['Heavy-duty cleaner', 'Carpet cleaner', 'Window cleaner'],
      photos: ['before1.jpg', 'after1.jpg'],
      completedDate: '2024-01-14'
    },
    {
      id: '4',
      clientName: 'John Smith',
      service: 'Regular Clean',
      address: '321 Maple Street, Downtown',
      staff: ['Ana Martinez'],
      status: 'scheduled',
      scheduledDate: '2024-01-16',
      scheduledTime: '10:00',
      estimatedDuration: 120,
      cost: 150,
      tips: 0,
      notes: 'Bi-weekly service. Focus on bathroom and kitchen.',
      materials: ['Standard cleaning supplies'],
      photos: []
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const updateJobStatus = (jobId: string, newStatus: Job['status']) => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId) {
          console.log(`Updating job ${jobId} status to ${newStatus}`);
          const updatedJob = { ...job, status: newStatus };
          if (newStatus === 'completed') {
            updatedJob.completedDate = new Date().toISOString().split('T')[0];
          }
          return updatedJob;
        }
        return job;
      })
    );
  };

  const getFilteredJobs = () => {
    switch (activeTab) {
      case 'active':
        return jobs.filter(job => job.status === 'scheduled' || job.status === 'in-progress');
      case 'completed':
        return jobs.filter(job => job.status === 'completed');
      default:
        return jobs;
    }
  };

  const getProgressPercentage = (job: Job) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'in-progress' && job.actualDuration) {
      return Math.min((job.actualDuration / job.estimatedDuration) * 100, 100);
    }
    if (job.status === 'scheduled') return 0;
    return 0;
  };

  return (
    <div className="p-6" data-testid="job-management">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job Management</h1>
          <p className="text-muted-foreground">Track and manage job progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-filter-jobs">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button data-testid="button-create-job">
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-xl font-bold" data-testid="text-total-jobs">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold" data-testid="text-in-progress-jobs">
                  {jobs.filter(job => job.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold" data-testid="text-completed-jobs">
                  {jobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold" data-testid="text-total-revenue">
                  ${jobs.reduce((sum, job) => sum + job.cost, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed' | 'all')}>
        <TabsList className="mb-4">
          <TabsTrigger value="active" data-testid="tab-active-jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-jobs">Completed</TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all-jobs">All Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="space-y-4">
            {getFilteredJobs().map((job) => (
              <Card key={job.id} className="hover-elevate" data-testid={`job-card-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{getInitials(job.clientName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium" data-testid={`text-job-client-${job.id}`}>
                            {job.clientName}
                          </h3>
                          <Badge className={getStatusColor(job.status)} data-testid={`badge-job-status-${job.id}`}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1">{job.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{job.service}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{job.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{job.scheduledDate} at {job.scheduledTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{job.staff.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="font-medium" data-testid={`text-job-cost-${job.id}`}>
                          ${job.cost}
                        </p>
                        {job.tips > 0 && (
                          <p className="text-sm text-green-600">+${job.tips} tip</p>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm" data-testid={`button-job-menu-${job.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {job.actualDuration ? formatDuration(job.actualDuration) : '0h'} / {formatDuration(job.estimatedDuration)}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(job)} className="h-2" data-testid={`progress-${job.id}`} />
                  </div>

                  {/* Notes */}
                  {job.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground" data-testid={`text-job-notes-${job.id}`}>
                        {job.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {job.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateJobStatus(job.id, 'in-progress')}
                        data-testid={`button-start-job-${job.id}`}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Job
                      </Button>
                    )}
                    
                    {job.status === 'in-progress' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => updateJobStatus(job.id, 'completed')}
                          data-testid={`button-complete-job-${job.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => console.log(`Pausing job ${job.id}`)}
                          data-testid={`button-pause-job-${job.id}`}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => console.log(`Viewing details for job ${job.id}`)}
                      data-testid={`button-view-details-${job.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}