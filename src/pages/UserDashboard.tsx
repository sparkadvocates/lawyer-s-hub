import { Briefcase, Users, Gavel, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import RecentCases from "@/components/dashboard/RecentCases";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  const getUserName = () => {
    if (!user?.email) return "";
    return user.email.split("@")[0];
  };

  const statCards = [
    { icon: Briefcase, label: "সক্রিয় কেস", value: stats?.activeCases || 0, color: "text-primary", bg: "bg-primary/10" },
    { icon: Users, label: "ক্লায়েন্ট", value: stats?.totalClients || 0, color: "text-info", bg: "bg-info/10" },
    { icon: Gavel, label: "আসন্ন শুনানি", value: stats?.upcomingHearings || 0, color: "text-warning", bg: "bg-warning/10" },
    { icon: Clock, label: "মোট কেস", value: stats?.totalCases || 0, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <AppLayout title="ড্যাশবোর্ড" showSearch>
      <div className="p-4 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            স্বাগতম, <span className="text-primary">{getUserName()}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">আজকের কেস আপডেট দেখুন</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Cases */}
        <RecentCases />

        {/* Upcoming Events */}
        <UpcomingEvents />

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </AppLayout>
  );
};

export default UserDashboard;
