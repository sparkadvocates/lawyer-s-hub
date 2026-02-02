import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Gavel, MapPin, Clock, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCases } from "@/hooks/useCases";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "court" | "meeting" | "deadline";
  location?: string;
  caseId?: string;
}

const eventTypeConfig = {
  court: { color: "bg-destructive", label: "শুনানি" },
  meeting: { color: "bg-info", label: "মিটিং" },
  deadline: { color: "bg-warning", label: "ডেডলাইন" },
};

const CalendarPage = () => {
  const { cases, loading: casesLoading } = useCases();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Load events from cases
  useEffect(() => {
    if (cases && cases.length > 0) {
      const caseEvents: CalendarEvent[] = cases
        .filter(c => c.next_hearing_date)
        .map(c => ({
          id: `case-${c.id}`,
          title: c.title,
          date: c.next_hearing_date!,
          time: "10:00",
          type: "court" as const,
          caseId: c.id,
          location: c.court_name || undefined,
        }));
      setEvents(caseEvents);
    }
  }, [cases]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const weekDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

  return (
    <AppLayout title="ক্যালেন্ডার" showSearch={false}>
      <div className="flex flex-col h-full">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {format(currentDate, "MMMM yyyy", { locale: bn })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs h-auto p-0"
              onClick={() => setCurrentDate(new Date())}
            >
              আজ
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="aspect-square" />
            ))}
            
            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasEvents = dayEvents.length > 0;
              const hasCourtDate = dayEvents.some((e) => e.type === "court");

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-1 rounded-xl flex flex-col items-center justify-center relative transition-all",
                    "active:scale-95",
                    isToday(day) && "ring-2 ring-primary",
                    isSelected && "bg-primary text-primary-foreground",
                    hasCourtDate && !isSelected && "bg-destructive/10",
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) && !isSelected && "text-primary",
                  )}>
                    {format(day, "d")}
                  </span>
                  {hasEvents && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={cn("w-1 h-1 rounded-full", eventTypeConfig[e.type].color)}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-border">
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", config.color)} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="border-t border-border p-4 bg-card/50 max-h-[40vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {format(selectedDate, "d MMMM", { locale: bn })}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> যোগ করুন
              </Button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                এই তারিখে কোন ইভেন্ট নেই
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full p-3 rounded-xl bg-secondary/50 text-left active:bg-secondary"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", eventTypeConfig[event.type].color + "/20")}>
                        <Gavel className={cn("w-4 h-4", eventTypeConfig[event.type].color.replace("bg-", "text-"))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={cn("text-[10px]", eventTypeConfig[event.type].color.replace("bg-", "bg-") + "/20", eventTypeConfig[event.type].color.replace("bg-", "text-"))}>
                        {eventTypeConfig[event.type].label}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Event Sheet */}
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader className="text-left pb-4">
              <SheetTitle className="text-xl font-display">নতুন ইভেন্ট</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4 overflow-y-auto pb-8">
              <div className="space-y-2">
                <Label>শিরোনাম *</Label>
                <Input placeholder="ইভেন্টের নাম" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>তারিখ</Label>
                  <Input type="date" defaultValue={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} />
                </div>
                <div className="space-y-2">
                  <Label>সময়</Label>
                  <Input type="time" defaultValue="10:00" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select defaultValue="court">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="court">শুনানি</SelectItem>
                    <SelectItem value="meeting">মিটিং</SelectItem>
                    <SelectItem value="deadline">ডেডলাইন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>স্থান</Label>
                <Input placeholder="আদালত / অফিস" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>
                  বাতিল
                </Button>
                <Button variant="gold" className="flex-1">
                  সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Event Detail Sheet */}
        <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
            {selectedEvent && (
              <>
                <SheetHeader className="text-left pb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-xl", eventTypeConfig[selectedEvent.type].color + "/20")}>
                      <Gavel className={cn("w-6 h-6", eventTypeConfig[selectedEvent.type].color.replace("bg-", "text-"))} />
                    </div>
                    <div>
                      <SheetTitle className="text-xl font-display">{selectedEvent.title}</SheetTitle>
                      <Badge className={cn("mt-1", eventTypeConfig[selectedEvent.type].color)}>
                        {eventTypeConfig[selectedEvent.type].label}
                      </Badge>
                    </div>
                  </div>
                </SheetHeader>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">তারিখ ও সময়</p>
                      <p className="font-medium">
                        {format(parseISO(selectedEvent.date), "d MMMM yyyy", { locale: bn })} • {selectedEvent.time}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">স্থান</p>
                        <p className="font-medium">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
