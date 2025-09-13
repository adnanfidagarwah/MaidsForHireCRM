import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Phone, Mail, Search, Filter, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  clientId: string;
  clientName: string;
  type: 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  type: 'sms' | 'email';
}

export default function MessagingCenter() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // todo: remove mock functionality
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'Sarah Johnson',
      lastMessage: 'Thank you for the great service!',
      lastMessageTime: '2024-01-15 14:30',
      unreadCount: 0,
      type: 'sms'
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Mike Chen',
      lastMessage: 'Can we reschedule to 3 PM?',
      lastMessageTime: '2024-01-15 11:45',
      unreadCount: 2,
      type: 'sms'
    },
    {
      id: '3',
      clientId: '3',
      clientName: 'Emma Davis',
      lastMessage: 'Booking confirmation for tomorrow',
      lastMessageTime: '2024-01-14 16:20',
      unreadCount: 0,
      type: 'email'
    },
    {
      id: '4',
      clientId: '4',
      clientName: 'John Smith',
      lastMessage: 'Running 15 minutes late',
      lastMessageTime: '2024-01-14 09:45',
      unreadCount: 1,
      type: 'sms'
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      clientId: '2',
      clientName: 'Mike Chen',
      type: 'sms',
      direction: 'inbound',
      content: 'Hi, I need to reschedule my appointment today. Something came up at work.',
      timestamp: '2024-01-15 11:30',
      status: 'read'
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Mike Chen',
      type: 'sms',
      direction: 'outbound',
      content: 'No problem! What time works better for you?',
      timestamp: '2024-01-15 11:32',
      status: 'delivered'
    },
    {
      id: '3',
      clientId: '2',
      clientName: 'Mike Chen',
      type: 'sms',
      direction: 'inbound',
      content: 'Can we reschedule to 3 PM?',
      timestamp: '2024-01-15 11:45',
      status: 'read'
    },
    {
      id: '4',
      clientId: '1',
      clientName: 'Sarah Johnson',
      type: 'sms',
      direction: 'outbound',
      content: 'Your cleaning is complete! Thank you for choosing MaidsforHire.',
      timestamp: '2024-01-15 14:00',
      status: 'delivered'
    },
    {
      id: '5',
      clientId: '1',
      clientName: 'Sarah Johnson',
      type: 'sms',
      direction: 'inbound',
      content: 'Thank you for the great service!',
      timestamp: '2024-01-15 14:30',
      status: 'read'
    }
  ]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConversationMessages = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return [];
    
    return messages.filter(m => m.clientId === conversation.clientId);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    console.log(`Sending message: ${newMessage} to conversation ${selectedConversation}`);
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? getConversationMessages(selectedConversation) : [];

  return (
    <div className="p-6" data-testid="messaging-center">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Messaging Center</h1>
          <p className="text-muted-foreground">Manage SMS and email communications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-filter-messages">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button data-testid="button-new-message">
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Conversations</CardTitle>
              <Badge variant="secondary" data-testid="text-conversation-count">
                {filteredConversations.length}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-conversations"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[450px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 border-b hover-elevate cursor-pointer ${
                    selectedConversation === conversation.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    console.log(`Selected conversation: ${conversation.clientName}`);
                  }}
                  data-testid={`conversation-${conversation.id}`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{getInitials(conversation.clientName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate" data-testid={`text-conversation-name-${conversation.id}`}>
                        {conversation.clientName}
                      </p>
                      <div className="flex items-center gap-1">
                        {conversation.type === 'sms' ? (
                          <MessageSquare className="w-3 h-3 text-green-500" />
                        ) : (
                          <Mail className="w-3 h-3 text-blue-500" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs" data-testid={`badge-unread-${conversation.id}`}>
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.lastMessageTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedConversationData ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{getInitials(selectedConversationData.clientName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg" data-testid="text-selected-conversation-name">
                        {selectedConversationData.clientName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversationData.type === 'sms' ? 'SMS Conversation' : 'Email Thread'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid="button-call-client">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-more-options">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-[400px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.id}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.direction === 'outbound'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {message.timestamp.split(' ')[1]}
                          </p>
                          {message.direction === 'outbound' && (
                            <p className="text-xs opacity-70">
                              {message.status}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Send ${selectedConversationData.type === 'sms' ? 'SMS' : 'email'} to ${selectedConversationData.clientName}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="resize-none min-h-[60px]"
                      data-testid="input-new-message"
                    />
                  </div>
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="self-end"
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a conversation to view messages</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start" data-testid="button-send-bulk-sms">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Bulk SMS
              </Button>
              <Button variant="outline" className="justify-start" data-testid="button-send-bulk-email">
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Email
              </Button>
              <Button variant="outline" className="justify-start" data-testid="button-message-templates">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Templates
              </Button>
              <Button variant="outline" className="justify-start" data-testid="button-schedule-message">
                <MessageSquare className="w-4 h-4 mr-2" />
                Schedule Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}