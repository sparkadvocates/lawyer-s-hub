import { Briefcase, Users, Gavel, Clock, Plus, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useCases } from "@/hooks/useCases";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { cases, loading: casesLoading } = useCases();

  const getUserName = () => {
    if (!user?.email) return "";
    return user.email.split("@")[0];
  };

  // Get upcoming hearings
  const upcomingHearings = cases
    ?.filter(c => c.next_hearing_date && new Date(c.next_hearing_date) >= new Date())
    .sort((a, b) => new Date(a.next_hearing_date!).getTime() - new Date(b.next_hearing_date!).getTime())
    .slice(0, 3) || [];

  // Get recent cases
  const recentCases = cases?.slice(0, 4) || [];

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "আজ";
    if (isTomorrow(date)) return "আগামীকাল";
    return format(date, "dd MMM");
  };

  const statCards = [
    { icon: Briefcase, label: "সক্রিয় কেস", value: stats?.activeCases || 0, color: "text-primary", bg: "bg-primary/10" },
    { icon: Users, label: "ক্লায়েন্ট", value: stats?.totalClients || 0, color: "text-info", bg: "bg-info/10" },
    { icon: Gavel, label: "আসন্ন শুনানি", value: stats?.upcomingHearings || 0, color: "text-warning", bg: "bg-warning/10" },
    { icon: Clock, label: "মোট কেস", value: stats?.totalCases || 0, color: "text-success", bg: "bg-success/10" },
  ];

  const quickActions = [
    { label: "নতুন কেস", icon: Briefcase, path: "/dashboard/cases", color: "bg-primary" },
    { label: "নতুন ক্লায়েন্ট", icon: Users, path: "/dashboard/clients", color: "bg-info" },
    { label: "চেক এন্ট্রি", icon: Gavel, path: "/dashboard/checks", color: "bg-warning" },
    { label: "ক্যালেন্ডার", icon: Clock, path: "/dashboard/calendar", color: "bg-success" },
  ];

  const statusColors: Record<string, string> = {
    open: "bg-success/20 text-success",
    in_progress: "bg-info/20 text-info",
    pending: "bg-warning/20 text-warning",
    closed: "bg-muted text-muted-foreground",
  };

  return (
    <AppLayout title="ড্যাশবোর্ড" showSearch>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-xl font-bold text-foreground">
            স্বাগতম, <span className="text-primary">{getUserName()}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">আজকের কেস আপডেট দেখুন</p>
        </div>

        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))
          ) : (
            statCards.map((stat, idx) => (
              <div
                key={stat.label}
                className={cn(
                  "p-4 rounded-2xl bg-card border border-border",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
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
            ))
          )}
        </div>

        {/* Quick Actions - Horizontal Scroll */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            দ্রুত অ্যাকশন
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-2xl bg-card border border-border active:scale-95 transition-transform"
              >
                <div className={cn("p-3 rounded-xl", action.color)}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Hearings */}
        {upcomingHearings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                আসন্ন শুনানি
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary h-auto p-0"
                onClick={() => navigate("/dashboard/calendar")}
              >
                সব দেখুন <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {upcomingHearings.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/dashboard/cases?case=${c.id}`)}
                  className="w-full p-4 rounded-2xl bg-card border border-border text-left active:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      isToday(new Date(c.next_hearing_date!)) ? "bg-destructive/20" : "bg-warning/20"
                    )}>
                      <Gavel className={cn(
                        "w-4 h-4",
                        isToday(new Date(c.next_hearing_date!)) ? "text-destructive" : "text-warning"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{c.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium text-foreground">
                          {getDateLabel(c.next_hearing_date!)}
                        </span>
                        {c.court_name && (
                          <>
                            <span>•</span>
                            <span className="truncate">{c.court_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Cases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              সাম্প্রতিক কেস
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary h-auto p-0"
              onClick={() => navigate("/dashboard/cases")}
            >
              সব দেখুন <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          {casesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : recentCases.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">কোন কেস নেই</p>
              <Button 
                variant="gold" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate("/dashboard/cases")}
              >
                <Plus className="w-4 h-4 mr-1" /> নতুন কেস
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/dashboard/cases?case=${c.id}`)}
                  className="w-full p-4 rounded-2xl bg-card border border-border text-left active:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{c.title}</p>
                        <Badge className={cn("text-[10px] px-1.5", statusColors[c.status])}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.case_number} • {c.case_type || "General"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin Quick Link */}
        {isAdmin && (
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => navigate("/dashboard/settings")}
          >
            <span>অ্যাডমিন সেটিংস</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
