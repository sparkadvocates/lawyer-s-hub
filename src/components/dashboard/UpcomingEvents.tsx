import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface CaseEvent {
  id: string;
  title: string;
  case_number: string;
  next_hearing_date: string;
  court_name: string | null;
}

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from("cases")
          .select("id, title, case_number, next_hearing_date, court_name")
          .not("next_hearing_date", "is", null)
          .gte("next_hearing_date", today.toISOString())
          .order("next_hearing_date", { ascending: true })
          .limit(5);

        if (error) throw error;

        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getTimeLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "h:mm a");
  };

  const getEventStyle = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return "bg-destructive/20 text-destructive";
    }
    if (isTomorrow(date)) {
      return "bg-warning/20 text-warning";
    }
    return "bg-primary/20 text-primary";
  };

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
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No upcoming hearings scheduled.
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
              className={`p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in stagger-${index + 1}`}
              onClick={() => navigate(`/dashboard/cases?case=${event.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg flex-shrink-0", getEventStyle(event.next_hearing_date))}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1 truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {getDateLabel(event.next_hearing_date)} • {getTimeLabel(event.next_hearing_date)}
                    </span>
                  </div>
                  {event.court_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.court_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
