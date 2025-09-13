import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Plus, MoreHorizontal, DollarSign, Calendar, User } from "lucide-react";
import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  value: number;
  source: string;
  stage: 'lead' | 'contacted' | 'proposal' | 'booked' | 'won' | 'lost';
  lastContact: string;
  service: string;
}

export default function SalesPipeline() {
  // todo: remove mock functionality
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '(555) 123-4567',
      value: 250,
      source: 'Website',
      stage: 'lead',
      lastContact: '2024-01-15',
      service: 'Deep Cleaning'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@email.com',
      phone: '(555) 234-5678',
      value: 180,
      source: 'Referral',
      stage: 'contacted',
      lastContact: '2024-01-14',
      service: 'Regular Clean'
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@email.com',
      phone: '(555) 345-6789',
      value: 320,
      source: 'Google Ads',
      stage: 'proposal',
      lastContact: '2024-01-13',
      service: 'Move-out Clean'
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john@email.com',
      phone: '(555) 456-7890',
      value: 150,
      source: 'Facebook',
      stage: 'booked',
      lastContact: '2024-01-12',
      service: 'Regular Clean'
    }
  ]);

  const stages = [
    { id: 'lead', title: 'New Leads', color: 'bg-gray-500' },
    { id: 'contacted', title: 'Contacted', color: 'bg-blue-500' },
    { id: 'proposal', title: 'Proposal Sent', color: 'bg-yellow-500' },
    { id: 'booked', title: 'Booked', color: 'bg-purple-500' },
    { id: 'won', title: 'Won', color: 'bg-green-500' },
    { id: 'lost', title: 'Lost', color: 'bg-red-500' }
  ];

  const moveToNextStage = (leadId: string) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          const stageOrder = ['lead', 'contacted', 'proposal', 'booked', 'won'];
          const currentIndex = stageOrder.indexOf(lead.stage);
          const nextStage = stageOrder[currentIndex + 1];
          
          if (nextStage) {
            console.log(`Moving ${lead.name} to ${nextStage} stage`);
            return { ...lead, stage: nextStage as Lead['stage'] };
          }
        }
        return lead;
      })
    );
  };

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => lead.stage === stage);
  };

  const getTotalValueByStage = (stage: string) => {
    return getLeadsByStage(stage).reduce((sum, lead) => sum + lead.value, 0);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6" data-testid="sales-pipeline">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track leads through your sales process</p>
        </div>
        <Button data-testid="button-add-lead">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          const stageValue = getTotalValueByStage(stage.id);
          
          return (
            <Card key={stage.id} className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  {stage.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold" data-testid={`text-stage-count-${stage.id}`}>
                  {stageLeads.length}
                </div>
                <div className="text-xs text-muted-foreground" data-testid={`text-stage-value-${stage.id}`}>
                  ${stageValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          
          return (
            <div key={stage.id} className="min-h-[500px]">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  <h3 className="font-medium">{stage.title}</h3>
                  <Badge variant="secondary" data-testid={`badge-stage-count-${stage.id}`}>
                    {stageLeads.length}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className="hover-elevate cursor-pointer" data-testid={`lead-card-${lead.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm" data-testid={`text-lead-name-${lead.id}`}>
                              {lead.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.source}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" data-testid={`button-lead-menu-${lead.id}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span data-testid={`text-lead-value-${lead.id}`}>
                            ${lead.value}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{lead.service}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Last: {lead.lastContact}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => console.log(`Calling ${lead.name}`)}
                          data-testid={`button-call-${lead.id}`}
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => console.log(`Emailing ${lead.name}`)}
                          data-testid={`button-email-${lead.id}`}
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                        {stage.id !== 'won' && stage.id !== 'lost' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-auto"
                            onClick={() => moveToNextStage(lead.id)}
                            data-testid={`button-advance-${lead.id}`}
                          >
                            Advance
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Lead Button */}
                <Button 
                  variant="ghost" 
                  className="w-full border-2 border-dashed border-muted-foreground/20 h-20 hover-elevate"
                  onClick={() => console.log(`Adding lead to ${stage.title}`)}
                  data-testid={`button-add-lead-${stage.id}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}