import { Activity, FileText, MessageSquare, Clock, CheckCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    icon: FileText,
    message: "Document uploaded to Smith vs. Johnson case",
    time: "2 minutes ago",
    color: "text-primary",
  },
  {
    id: 2,
    icon: MessageSquare,
    message: "New message from client Sarah Williams",
    time: "15 minutes ago",
    color: "text-info",
  },
  {
    id: 3,
    icon: Clock,
    message: "Time entry logged: 2.5 hours - Thompson Merger",
    time: "1 hour ago",
    color: "text-warning",
  },
  {
    id: 4,
    icon: CheckCircle,
    message: "Task completed: File motion for Davis case",
    time: "2 hours ago",
    color: "text-success",
  },
  {
    id: 5,
    icon: FileText,
    message: "Contract draft approved by partner",
    time: "3 hours ago",
    color: "text-primary",
  },
];

const ActivityFeed = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 animate-fade-in stagger-${index + 1}`}
          >
            <div className={`p-1.5 rounded-lg bg-secondary ${activity.color}`}>
              <activity.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
