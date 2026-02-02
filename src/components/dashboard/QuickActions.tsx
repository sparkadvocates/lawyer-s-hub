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
  { icon: Plus, label: "নতুন কেস", color: "text-success", path: "/dashboard/cases" },
  { icon: UserPlus, label: "ক্লায়েন্ট যোগ", color: "text-info", path: "/dashboard/clients" },
  { icon: FileText, label: "ডকুমেন্ট", color: "text-primary", path: "/dashboard/documents" },
  { icon: Clock, label: "সময় লগ", color: "text-warning", path: "/dashboard/time" },
  { icon: Upload, label: "আপলোড", color: "text-muted-foreground", path: "/dashboard/documents" },
  { icon: Send, label: "ইনভয়েস", color: "text-destructive", path: "/dashboard/billing" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-4 h-full">
      <h3 className="font-display text-base font-semibold mb-3">দ্রুত অ্যাকশন</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-auto py-3 flex-col gap-1.5 active:scale-95 transition-transform animate-fade-in stagger-${index + 1}`}
            onClick={() => navigate(action.path)}
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-[10px]">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
