import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Gavel, Users, Clock, Briefcase, Bell, MapPin, X } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "court" | "meeting" | "deadline" | "consultation" | "reminder";
  caseId?: string;
  caseName?: string;
  location?: string;
  description?: string;
  reminder?: boolean;
}

const eventTypeConfig = {
  court: { icon: Gavel, color: "bg-destructive text-destructive-foreground", label: "Court Date" },
  meeting: { icon: Users, color: "bg-info text-foreground", label: "Meeting" },
  deadline: { icon: Clock, color: "bg-warning text-primary-foreground", label: "Deadline" },
  consultation: { icon: Briefcase, color: "bg-success text-foreground", label: "Consultation" },
  reminder: { icon: Bell, color: "bg-primary text-primary-foreground", label: "Reminder" },
};

const Calendar = () => {
  const { user } = useAuth();
  const { cases: dbCases } = useCases();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Load events from database (hearing dates from cases)
  useEffect(() => {
    if (dbCases && dbCases.length > 0) {
      const caseEvents: CalendarEvent[] = dbCases
        .filter(c => c.next_hearing_date)
        .map(c => ({
          id: `case-${c.id}`,
          title: `হেয়ারিং - ${c.title}`,
          date: c.next_hearing_date!,
          time: "10:00",
          type: "court" as const,
          caseId: c.id,
          caseName: c.title,
          location: c.court_name || undefined,
          reminder: true,
        }));
      setEvents(caseEvents);
    }
  }, [dbCases]);

  // Form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "meeting" as CalendarEvent["type"],
    caseId: "",
    location: "",
    description: "",
    reminder: false,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month to add padding
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedCase = dbCases?.find((c) => c.id === newEvent.caseId);
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      caseId: newEvent.caseId || undefined,
      caseName: selectedCase?.title,
      location: newEvent.location || undefined,
      description: newEvent.description || undefined,
      reminder: newEvent.reminder,
    };

    setEvents(prev => [...prev, event]);
    setIsAddEventOpen(false);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      type: "meeting",
      caseId: "",
      location: "",
      description: "",
      reminder: false,
    });

    toast({
      title: "Event Added",
      description: `${event.title} has been scheduled.`,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your calendar.",
    });
  };

  const upcomingCourtDates = events
    .filter((e) => e.type === "court" && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const upcomingReminders = events
    .filter((e) => e.reminder && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col pl-16 md:pl-0">
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Calendar</h1>
                <p className="text-muted-foreground mt-1">Manage your schedule, court dates, and case deadlines</p>
              </div>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Schedule New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Court Hearing - Smith Case"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Event Type</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value: CalendarEvent["type"]) => setNewEvent({ ...newEvent, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="court">Court Date</SelectItem>
                          <SelectItem value="meeting">Client Meeting</SelectItem>
                          <SelectItem value="deadline">Deadline</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="case">Link to Case (Optional)</Label>
                      <Select
                        value={newEvent.caseId}
                        onValueChange={(value) => setNewEvent({ ...newEvent, caseId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No case linked</SelectItem>
                          {dbCases?.map((caseItem) => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {caseItem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., District Court, Room 204"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Notes</Label>
                      <Textarea
                        id="description"
                        placeholder="Additional details..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="reminder"
                        checked={newEvent.reminder}
                        onChange={(e) => setNewEvent({ ...newEvent, reminder: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="reminder" className="cursor-pointer">Set reminder for this event</Label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setIsAddEventOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1 gradient-gold text-primary-foreground" onClick={handleAddEvent}>
                        Add Event
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Calendar */}
              <div className="lg:col-span-2 glass-card p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Padding for first week */}
                  {paddingDays.map((_, index) => (
                    <div key={`padding-${index}`} className="aspect-square p-1" />
                  ))}
                  
                  {/* Days */}
                  {daysInMonth.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const hasCourtDate = dayEvents.some((e) => e.type === "court");

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "aspect-square p-1 rounded-lg transition-all duration-200 relative group",
                          "hover:bg-secondary/50",
                          isToday(day) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                          isSelected && "bg-primary/20",
                          hasCourtDate && "bg-destructive/10"
                        )}
                      >
                        <div className={cn(
                          "text-sm font-medium",
                          isToday(day) && "text-primary",
                          !isSameMonth(day, currentDate) && "text-muted-foreground/50"
                        )}>
                          {format(day, "d")}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((event) => {
                              const config = eventTypeConfig[event.type];
                              return (
                                <div
                                  key={event.id}
                                  className={cn("w-1.5 h-1.5 rounded-full", config.color)}
                                />
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <span className="text-[10px] text-muted-foreground ml-0.5">+{dayEvents.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                  {Object.entries(eventTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", config.color)} />
                      <span className="text-sm text-muted-foreground">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Panels */}
              <div className="space-y-6">
                {/* Selected Date Events */}
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
                  </h3>
                  {selectedDate ? (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).length > 0 ? (
                        getEventsForDate(selectedDate).map((event) => {
                          const config = eventTypeConfig[event.type];
                          const IconComponent = config.icon;
                          return (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-lg", config.color)}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">{event.title}</p>
                                  <p className="text-sm text-muted-foreground">{event.time}</p>
                                  {event.caseName && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      <Briefcase className="w-3 h-3 mr-1" />
                                      {event.caseName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm">No events scheduled for this date.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Click on a date to view events.</p>
                  )}
                </div>

                {/* Upcoming Court Dates */}
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-destructive" />
                    Upcoming Court Dates
                  </h3>
                  <div className="space-y-3">
                    {upcomingCourtDates.length > 0 ? (
                      upcomingCourtDates.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                        >
                          <p className="font-medium text-foreground text-sm">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            {format(parseISO(event.date), "MMM d, yyyy")} at {event.time}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No upcoming court dates.</p>
                    )}
                  </div>
                </div>

                {/* Reminders */}
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Active Reminders
                  </h3>
                  <div className="space-y-3">
                    {upcomingReminders.length > 0 ? (
                      upcomingReminders.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                        >
                          <p className="font-medium text-foreground text-sm">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            {format(parseISO(event.date), "MMM d, yyyy")} at {event.time}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No active reminders.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="font-display text-xl pr-8">{selectedEvent.title}</DialogTitle>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Badge className={cn(eventTypeConfig[selectedEvent.type].color)}>
                    {eventTypeConfig[selectedEvent.type].label}
                  </Badge>
                  {selectedEvent.reminder && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Bell className="w-3 h-3 mr-1" />
                      Reminder Set
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(parseISO(selectedEvent.date), "EEEE, MMMM d, yyyy")} at {selectedEvent.time}</span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  {selectedEvent.caseName && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{selectedEvent.caseName}</span>
                    </div>
                  )}
                  
                  {selectedEvent.description && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    Delete Event
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedEvent(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
