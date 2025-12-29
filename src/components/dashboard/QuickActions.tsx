import {
  Plus,
  UserPlus,
  FileText,
  Clock,
  Upload,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "New Case", color: "text-success", path: "/dashboard/cases" },
  { icon: UserPlus, label: "Add Client", color: "text-info", path: "/dashboard/clients" },
  { icon: FileText, label: "Draft Document", color: "text-primary", path: "/dashboard/documents" },
  { icon: Clock, label: "Log Time", color: "text-warning", path: "/dashboard/time-tracking" },
  { icon: Upload, label: "Upload File", color: "text-muted-foreground", path: "/dashboard/documents" },
  { icon: Send, label: "Send Invoice", color: "text-destructive", path: "/dashboard/billing" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-auto py-4 flex-col gap-2 hover:bg-secondary animate-fade-in stagger-${index + 1}`}
            onClick={() => navigate(action.path)}
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
