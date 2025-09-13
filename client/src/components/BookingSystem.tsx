import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, User, MapPin, Phone, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Booking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  staff: string;
  address: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  estimatedCost: number;
}

export default function BookingSystem() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // todo: remove mock functionality
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      service: 'Deep Cleaning',
      date: '2024-01-15',
      time: '09:00',
      duration: 180,
      staff: 'Maria Rodriguez',
      address: '123 Oak Street, Downtown',
      phone: '(555) 123-4567',
      status: 'confirmed',
      notes: 'Extra attention to kitchen',
      estimatedCost: 250
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      service: 'Regular Clean',
      date: '2024-01-15',
      time: '11:30',
      duration: 120,
      staff: 'Lisa Thompson',
      address: '456 Pine Avenue, Midtown',
      phone: '(555) 234-5678',
      status: 'pending',
      notes: 'Please call before arrival',
      estimatedCost: 150
    },
    {
      id: '3',
      clientName: 'Emma Davis',
      service: 'Move-out Clean',
      date: '2024-01-15',
      time: '14:00',
      duration: 240,
      staff: 'Ana Martinez',
      address: '789 Elm Drive, Suburbs',
      phone: '(555) 345-6789',
      status: 'confirmed',
      notes: 'Keys under doormat',
      estimatedCost: 320
    },
    {
      id: '4',
      clientName: 'John Smith',
      service: 'Regular Clean',
      date: '2024-01-16',
      time: '10:00',
      duration: 120,
      staff: 'Maria Rodriguez',
      address: '321 Maple Street, Downtown',
      phone: '(555) 456-7890',
      status: 'confirmed',
      notes: 'Bi-weekly service',
      estimatedCost: 150
    }
  ]);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="p-6" data-testid="booking-system">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Booking System</h1>
          <p className="text-muted-foreground">Manage appointments and scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-filter-bookings">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button data-testid="button-new-booking">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'week' | 'month')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="day" data-testid="tab-day-view">Day</TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-week-view">Week</TabsTrigger>
            <TabsTrigger value="month" data-testid="tab-month-view">Month</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const prevDay = new Date(selectedDate);
                prevDay.setDate(prevDay.getDate() - 1);
                setSelectedDate(prevDay);
              }}
              data-testid="button-prev-day"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium px-4" data-testid="text-selected-date">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                setSelectedDate(nextDay);
              }}
              data-testid="button-next-day"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border-0"
                data-testid="calendar-picker"
              />
            </CardContent>
          </Card>

          {/* Schedule View */}
          <div className="lg:col-span-3">
            <TabsContent value="day" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Daily Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {timeSlots.map((timeSlot) => {
                      const slotBookings = getBookingsForDate(selectedDate).filter(
                        booking => booking.time === timeSlot
                      );
                      
                      return (
                        <div key={timeSlot} className="flex items-start gap-4 p-2 border-b">
                          <div className="w-16 text-sm text-muted-foreground font-mono">
                            {timeSlot}
                          </div>
                          <div className="flex-1">
                            {slotBookings.length > 0 ? (
                              <div className="space-y-2">
                                {slotBookings.map((booking) => (
                                  <Card 
                                    key={booking.id} 
                                    className="p-3 hover-elevate cursor-pointer" 
                                    onClick={() => console.log(`Clicked booking: ${booking.id}`)}
                                    data-testid={`booking-${booking.id}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3">
                                        <Avatar className="w-8 h-8">
                                          <AvatarFallback className="text-xs">
                                            {getInitials(booking.clientName)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium text-sm" data-testid={`text-booking-client-${booking.id}`}>
                                            {booking.clientName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {booking.service}
                                          </p>
                                          <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-muted-foreground" />
                                              <span className="text-xs text-muted-foreground">
                                                {formatDuration(booking.duration)}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <User className="w-3 h-3 text-muted-foreground" />
                                              <span className="text-xs text-muted-foreground">
                                                {booking.staff}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3 text-muted-foreground" />
                                              <span className="text-xs text-muted-foreground truncate max-w-32">
                                                {booking.address}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <Badge 
                                          className={getStatusColor(booking.status)}
                                          data-testid={`badge-status-${booking.id}`}
                                        >
                                          {booking.status}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          ${booking.estimatedCost}
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="h-8 flex items-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-muted-foreground hover-elevate"
                                  onClick={() => console.log(`Book appointment at ${timeSlot}`)}
                                  data-testid={`button-book-${timeSlot}`}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Available
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Weekly view coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Monthly view coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.slice(0, 6).map((booking) => (
                <div 
                  key={booking.id} 
                  className="p-4 border rounded-lg hover-elevate cursor-pointer"
                  onClick={() => console.log(`Viewing booking details: ${booking.id}`)}
                  data-testid={`upcoming-booking-${booking.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-upcoming-client-${booking.id}`}>
                        {booking.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.service}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      <span>{booking.date} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{booking.staff}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{booking.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}