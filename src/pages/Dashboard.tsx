import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { Briefcase, Users, Gavel, Clock, ShieldCheck, TrendingUp, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useCases } from "@/hooks/useCases";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--destructive))", "hsl(var(--muted))"];

const statusColors: Record<string, string> = {
  "Open": "hsl(var(--info))",
  "In Progress": "hsl(var(--success))",
  "Pending": "hsl(var(--warning))",
  "Closed": "hsl(var(--muted-foreground))",
  "Won": "hsl(var(--success))",
  "Lost": "hsl(var(--destructive))",
};

const Dashboard = () => {
  const { user, role, isAdmin, refreshRole } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { cases, loading: casesLoading } = useCases();
  const [showAdminBanner, setShowAdminBanner] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (user && role === "user") {
      setShowAdminBanner(true);
    } else {
      setShowAdminBanner(false);
    }
  }, [user, role]);

  const handleBootstrapAdmin = async () => {
    try {
      setBootstrapping(true);
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke("bootstrap-admin", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to become admin");
      }

      if (response.data?.error) {
        toast.info(response.data.error);
        setShowAdminBanner(false);
        return;
      }

      toast.success("You are now an admin!");
      setShowAdminBanner(false);
      await refreshRole();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to become admin");
    } finally {
      setBootstrapping(false);
    }
  };

  const getUserName = () => {
    if (!user?.email) return "there";
    return user.email.split("@")[0];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "শুভ সকাল";
    if (hour < 17) return "শুভ অপরাহ্ন";
    return "শুভ সন্ধ্যা";
  };

  // Get upcoming hearings from cases
  const upcomingHearings = cases
    .filter((c) => c.next_hearing_date && new Date(c.next_hearing_date) >= new Date())
    .sort((a, b) => new Date(a.next_hearing_date!).getTime() - new Date(b.next_hearing_date!).getTime())
    .slice(0, 5);

  // Recent cases
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      {/* Admin Bootstrap Banner */}
      {showAdminBanner && !isAdmin && (
        <Alert className="mb-4 border-primary/50 bg-primary/5">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle className="text-sm">অ্যাডমিন হন</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span className="text-xs">
              এখনো কোনো অ্যাডমিন নেই। প্রথম অ্যাডমিন হতে বোতামে ক্লিক করুন।
            </span>
            <Button
              size="sm"
              onClick={handleBootstrapAdmin}
              disabled={bootstrapping}
              className="w-full"
            >
              {bootstrapping ? "সেটআপ হচ্ছে..." : "অ্যাডমিন হন"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <div className="mb-5 animate-fade-in">
        <h1 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          {getGreeting()}, <span className="text-gradient-gold">{getUserName()}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          আজকের কেস আপডেট দেখুন।
        </p>
      </div>

      {/* Stats Grid - 2x2 on mobile */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          title="সক্রিয় কেস"
          value={stats.activeCases}
          change={`${stats.totalCases} মোট`}
          changeType="neutral"
          icon={Briefcase}
          iconColor="text-primary"
          className="animate-fade-in stagger-1"
        />
        <StatCard
          title="মোট ক্লায়েন্ট"
          value={stats.totalClients}
          change="সর্বকালের"
          changeType="neutral"
          icon={Users}
          iconColor="text-info"
          className="animate-fade-in stagger-2"
        />
        <StatCard
          title="আসন্ন শুনানি"
          value={stats.upcomingHearings}
          change={upcomingHearings[0] ? `পরবর্তী: ${format(new Date(upcomingHearings[0].next_hearing_date!), "d MMM")}` : "নির্ধারিত নেই"}
          changeType="neutral"
          icon={Gavel}
          iconColor="text-warning"
          className="animate-fade-in stagger-3"
        />
        <StatCard
          title="বিচারাধীন"
          value={stats.pendingCases}
          change={`${stats.closedCases} সমাপ্ত`}
          changeType="neutral"
          icon={Clock}
          iconColor="text-success"
          className="animate-fade-in stagger-4"
        />
      </div>

      {/* Charts - Stack on mobile */}
      <div className="space-y-4 mb-5">
        {/* Cases Trend Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">কেস ট্রেন্ড</h3>
              <p className="text-xs text-muted-foreground">গত ৬ মাসের নতুন কেস</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.casesByMonth}>
                <defs>
                  <linearGradient id="caseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={25}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="কেস"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#caseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">আয়</h3>
              <p className="text-xs text-muted-foreground">মাসিক সাবস্ক্রিপশন আয়</p>
            </div>
            <div className="p-2 rounded-lg bg-success/20">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tickFormatter={(value) => `৳${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  name="আয় (৳)"
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart + Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Cases by Status Pie Chart */}
        <div className="glass-card p-4">
          <h3 className="font-display text-base font-semibold text-foreground mb-3">স্ট্যাটাস অনুযায়ী কেস</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.casesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="status"
                >
                  {stats.casesByStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={statusColors[entry.status] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {stats.casesByStatus.map((entry, index) => (
              <div key={entry.status} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: statusColors[entry.status] || COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{entry.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Recent Cases & Upcoming Hearings - Stack on mobile */}
      <div className="space-y-4">
        {/* Recent Cases */}
        <div className="glass-card p-4">
          <h3 className="font-display text-base font-semibold text-foreground mb-3">সাম্প্রতিক কেস</h3>
          {recentCases.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">এখনো কোনো কেস নেই</p>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 active:bg-secondary/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.case_number}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="ml-2 shrink-0 text-xs"
                    style={{ 
                      borderColor: statusColors[c.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())] || "hsl(var(--border))",
                      color: statusColors[c.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())] || "hsl(var(--foreground))"
                    }}
                  >
                    {c.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Hearings */}
        <div className="glass-card p-4">
          <h3 className="font-display text-base font-semibold text-foreground mb-3">আসন্ন শুনানি</h3>
          {upcomingHearings.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">কোনো আসন্ন শুনানি নেই</p>
          ) : (
            <div className="space-y-2">
              {upcomingHearings.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 active:bg-secondary/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.court_name || "আদালত নির্দিষ্ট নেই"}</p>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <p className="text-xs font-medium text-warning">
                      {format(new Date(c.next_hearing_date!), "d MMM, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
