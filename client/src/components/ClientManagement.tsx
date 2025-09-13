import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, Plus, Search, Filter, Edit, MessageSquare, Calendar, Star, DollarSign, Briefcase, Users } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  totalJobs: number;
  totalSpent: number;
  lastService: string;
  joinDate: string;
  status: 'active' | 'inactive';
  notes: string;
}

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // todo: remove mock functionality
  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '(555) 123-4567',
      address: '123 Oak Street, Downtown',
      tags: ['VIP', 'Recurring'],
      totalJobs: 24,
      totalSpent: 2400,
      lastService: '2024-01-10',
      joinDate: '2023-06-15',
      status: 'active',
      notes: 'Prefers morning appointments. Has two cats.'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@email.com',
      phone: '(555) 234-5678',
      address: '456 Pine Avenue, Midtown',
      tags: ['Pet Owner'],
      totalJobs: 8,
      totalSpent: 720,
      lastService: '2024-01-08',
      joinDate: '2023-11-20',
      status: 'active',
      notes: 'Has a dog that needs to be contained during service.'
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@email.com',
      phone: '(555) 345-6789',
      address: '789 Elm Drive, Suburbs',
      tags: ['New Client'],
      totalJobs: 2,
      totalSpent: 300,
      lastService: '2024-01-05',
      joinDate: '2024-01-01',
      status: 'active',
      notes: 'New client, very particular about eco-friendly products.'
    }
  ]);

  const recentActivity = [
    { id: '1', action: 'Booking confirmed', client: 'Sarah Johnson', date: '2024-01-15', type: 'booking' },
    { id: '2', action: 'Job completed', client: 'Mike Chen', date: '2024-01-14', type: 'job' },
    { id: '3', action: 'Payment received', client: 'Emma Davis', date: '2024-01-13', type: 'payment' },
    { id: '4', action: 'SMS sent', client: 'Sarah Johnson', date: '2024-01-12', type: 'message' }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'recurring': return 'bg-blue-100 text-blue-800';
      case 'pet owner': return 'bg-green-100 text-green-800';
      case 'new client': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6" data-testid="client-management">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">Manage your client relationships and interactions</p>
        </div>
        <Button data-testid="button-add-client">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Clients ({filteredClients.length})</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-filter-clients">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-clients"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {filteredClients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`flex items-center justify-between p-4 border-b hover-elevate cursor-pointer ${
                      selectedClient?.id === client.id ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => {
                      setSelectedClient(client);
                      console.log(`Selected client: ${client.name}`);
                    }}
                    data-testid={`client-row-${client.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium" data-testid={`text-client-name-${client.id}`}>
                          {client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <div className="flex gap-1 mt-1">
                          {client.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className={`text-xs ${getTagColor(tag)}`}
                              data-testid={`badge-tag-${client.id}-${tag}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" data-testid={`text-client-spent-${client.id}`}>
                        ${client.totalSpent}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.totalJobs} jobs
                      </p>
                      <Badge 
                        variant={client.status === 'active' ? 'default' : 'secondary'}
                        data-testid={`badge-client-status-${client.id}`}
                      >
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Details */}
        <div className="space-y-4">
          {selectedClient ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{getInitials(selectedClient.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle data-testid="text-selected-client-name">
                          {selectedClient.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Client since {selectedClient.joinDate}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-edit-client">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm" data-testid="text-selected-client-email">
                      {selectedClient.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{selectedClient.address}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex gap-1 flex-wrap">
                      {selectedClient.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          className={getTagColor(tag)}
                          data-testid={`selected-client-tag-${tag}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-selected-client-notes">
                      {selectedClient.notes}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" data-testid="button-message-client">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-book-client">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Client Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Total Jobs</span>
                    </div>
                    <span className="font-medium" data-testid="text-selected-client-jobs">
                      {selectedClient.totalJobs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <span className="font-medium" data-testid="text-selected-client-total-spent">
                      ${selectedClient.totalSpent}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Last Service</span>
                    </div>
                    <span className="font-medium">{selectedClient.lastService}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Select a client to view details</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm" data-testid={`activity-${activity.id}`}>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground">{activity.client}</p>
                    </div>
                    <span className="text-muted-foreground text-xs">{activity.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}