import { Calendar, Clock, MapPin, Video, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "Court Hearing - Smith vs. Johnson",
    time: "9:00 AM - 11:00 AM",
    date: "Today",
    location: "County Courthouse, Room 4B",
    type: "court",
  },
  {
    id: 2,
    title: "Client Meeting - Estate Planning",
    time: "2:00 PM - 3:00 PM",
    date: "Today",
    location: "Video Conference",
    type: "video",
  },
  {
    id: 3,
    title: "Deposition - Thompson Case",
    time: "10:00 AM - 12:00 PM",
    date: "Tomorrow",
    location: "Conference Room A",
    type: "meeting",
  },
  {
    id: 4,
    title: "Filing Deadline - Davis Immigration",
    time: "5:00 PM",
    date: "Jan 15",
    location: "Federal Building",
    type: "deadline",
  },
];

const typeStyles: Record<string, { bg: string; icon: typeof Calendar }> = {
  court: { bg: "bg-destructive/20 text-destructive", icon: Calendar },
  video: { bg: "bg-info/20 text-info", icon: Video },
  meeting: { bg: "bg-primary/20 text-primary", icon: Clock },
  deadline: { bg: "bg-warning/20 text-warning", icon: Clock },
};

const UpcomingEvents = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">Upcoming Events</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/dashboard/calendar")}>
          View Calendar <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {events.map((event, index) => {
          const style = typeStyles[event.type];
          const Icon = style.icon;

          return (
            <div
              key={event.id}
              className={`p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in stagger-${index + 1}`}
              onClick={() => navigate("/dashboard/court-dates")}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg flex-shrink-0", style.bg)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1 truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEvents;
