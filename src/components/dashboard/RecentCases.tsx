import { Briefcase, ArrowRight, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const cases = [
  {
    id: 1,
    name: "Smith vs. Johnson Corp",
    client: "Robert Smith",
    type: "Corporate Litigation",
    status: "Active",
    priority: "High",
    dueDate: "Jan 15, 2025",
  },
  {
    id: 2,
    name: "Estate of Williams",
    client: "Sarah Williams",
    type: "Estate Planning",
    status: "In Review",
    priority: "Medium",
    dueDate: "Jan 22, 2025",
  },
  {
    id: 3,
    name: "Thompson Merger",
    client: "Thompson Industries",
    type: "M&A",
    status: "Active",
    priority: "High",
    dueDate: "Feb 1, 2025",
  },
  {
    id: 4,
    name: "Davis Immigration",
    client: "Michael Davis",
    type: "Immigration",
    status: "Pending",
    priority: "Low",
    dueDate: "Feb 10, 2025",
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-success/20 text-success border-success/30",
  "In Review": "bg-warning/20 text-warning border-warning/30",
  Pending: "bg-info/20 text-info border-info/30",
};

const priorityColors: Record<string, string> = {
  High: "bg-destructive/20 text-destructive border-destructive/30",
  Medium: "bg-warning/20 text-warning border-warning/30",
  Low: "bg-muted text-muted-foreground border-border",
};

const RecentCases = () => {
  const navigate = useNavigate();

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
        {cases.map((caseItem, index) => (
          <div
            key={caseItem.id}
            className={`p-4 hover:bg-secondary/30 transition-colors animate-fade-in stagger-${index + 1}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground truncate">
                    {caseItem.name}
                  </h4>
                  <Badge variant="outline" className={priorityColors[caseItem.priority]}>
                    {caseItem.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {caseItem.client} • {caseItem.type}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={statusColors[caseItem.status]}>
                    {caseItem.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Due: {caseItem.dueDate}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard/cases")}>View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/cases")}>Edit Case</DropdownMenuItem>
                  <DropdownMenuItem>Add Note</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCases;
