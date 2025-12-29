import {
  Plus,
  UserPlus,
  FileText,
  Clock,
  Upload,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "New Case", color: "text-success" },
  { icon: UserPlus, label: "Add Client", color: "text-info" },
  { icon: FileText, label: "Draft Document", color: "text-primary" },
  { icon: Clock, label: "Log Time", color: "text-warning" },
  { icon: Upload, label: "Upload File", color: "text-muted-foreground" },
  { icon: Send, label: "Send Invoice", color: "text-destructive" },
];

const QuickActions = () => {
  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-auto py-4 flex-col gap-2 hover:bg-secondary animate-fade-in stagger-${index + 1}`}
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
