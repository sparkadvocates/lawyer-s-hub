import { useState, useEffect } from "react";
import { Briefcase, ArrowRight, MoreHorizontal, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface CaseData {
  id: string;
  title: string;
  case_number: string;
  case_type: string | null;
  status: string;
  priority: string;
  next_hearing_date: string | null;
  client_id: string | null;
}

interface ClientData {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  open: "bg-success/20 text-success border-success/30",
  in_progress: "bg-info/20 text-info border-info/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  closed: "bg-muted text-muted-foreground border-border",
  won: "bg-success/20 text-success border-success/30",
  lost: "bg-destructive/20 text-destructive border-destructive/30",
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const RecentCases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      if (!user) return;

      try {
        // Fetch recent cases
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select("id, title, case_number, case_type, status, priority, next_hearing_date, client_id")
          .order("created_at", { ascending: false })
          .limit(5);

        if (casesError) throw casesError;

        setCases(casesData || []);

        // Fetch clients for the cases
        const clientIds = casesData
          ?.map((c) => c.client_id)
          .filter((id): id is string => id !== null);

        if (clientIds && clientIds.length > 0) {
          const { data: clientsData } = await supabase
            .from("clients")
            .select("id, name")
            .in("id", clientIds);

          if (clientsData) {
            const clientMap: Record<string, string> = {};
            clientsData.forEach((client) => {
              clientMap[client.id] = client.name;
            });
            setClients(clientMap);
          }
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [user]);

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">Recent Cases</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/dashboard/cases")}>
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No cases found. Create your first case to get started.
          </div>
        ) : (
          cases.map((caseItem, index) => (
            <div
              key={caseItem.id}
              className={`p-4 hover:bg-secondary/30 transition-colors cursor-pointer animate-fade-in stagger-${index + 1}`}
              onClick={() => navigate(`/dashboard/cases?case=${caseItem.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {caseItem.title}
                    </h4>
                    <Badge variant="outline" className={priorityColors[caseItem.priority] || priorityColors.medium}>
                      {caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {caseItem.client_id && clients[caseItem.client_id]
                      ? clients[caseItem.client_id]
                      : "No client"}{" "}
                    • {caseItem.case_type || "General"}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={statusColors[caseItem.status] || statusColors.open}>
                      {formatStatus(caseItem.status)}
                    </Badge>
                    {caseItem.next_hearing_date && (
                      <span className="text-xs text-muted-foreground">
                        Hearing: {format(new Date(caseItem.next_hearing_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/cases?case=${caseItem.id}`)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/cases")}>Edit Case</DropdownMenuItem>
                    <DropdownMenuItem>Add Note</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentCases;
