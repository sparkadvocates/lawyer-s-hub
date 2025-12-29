import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
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
  LineChart,
  Line,
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
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-auto">
          {/* Admin Bootstrap Banner */}
          {showAdminBanner && !isAdmin && (
            <Alert className="mb-6 border-primary/50 bg-primary/5">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Become an Admin</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  No admin exists yet. Click the button to become the first admin and access admin settings.
                </span>
                <Button
                  size="sm"
                  onClick={handleBootstrapAdmin}
                  disabled={bootstrapping}
                  className="ml-4"
                >
                  {bootstrapping ? "Setting up..." : "Become Admin"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {getGreeting()}, <span className="text-gradient-gold">{getUserName()}</span>
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your cases today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Active Cases"
              value={stats.activeCases}
              change={`${stats.totalCases} total`}
              changeType="neutral"
              icon={Briefcase}
              iconColor="text-primary"
              className="animate-fade-in stagger-1"
            />
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              change="All time"
              changeType="neutral"
              icon={Users}
              iconColor="text-info"
              className="animate-fade-in stagger-2"
            />
            <StatCard
              title="Upcoming Hearings"
              value={stats.upcomingHearings}
              change={upcomingHearings[0] ? `Next: ${format(new Date(upcomingHearings[0].next_hearing_date!), "MMM d")}` : "None scheduled"}
              changeType="neutral"
              icon={Gavel}
              iconColor="text-warning"
              className="animate-fade-in stagger-3"
            />
            <StatCard
              title="Pending Cases"
              value={stats.pendingCases}
              change={`${stats.closedCases} closed`}
              changeType="neutral"
              icon={Clock}
              iconColor="text-success"
              className="animate-fade-in stagger-4"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Cases Trend Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Cases Trend</h3>
                  <p className="text-sm text-muted-foreground">New cases over the last 6 months</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="h-[250px]">
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
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Cases"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#caseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Revenue</h3>
                  <p className="text-sm text-muted-foreground">Monthly revenue from subscriptions</p>
                </div>
                <div className="p-2 rounded-lg bg-success/20">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `৳${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="amount"
                      name="Revenue (৳)"
                      fill="hsl(var(--success))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Second Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Cases by Status Pie Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Cases by Status</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.casesByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
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
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {stats.casesByStatus.map((entry, index) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-xs">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: statusColors[entry.status] || COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{entry.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cases by Type */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Cases by Type</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.casesByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Cases" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Cases */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Cases</h3>
              {recentCases.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No cases yet</p>
              ) : (
                <div className="space-y-3">
                  {recentCases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-sm text-muted-foreground">{c.case_number}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="ml-2 shrink-0"
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
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Upcoming Hearings</h3>
              {upcomingHearings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No upcoming hearings</p>
              ) : (
                <div className="space-y-3">
                  {upcomingHearings.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-sm text-muted-foreground">{c.court_name || "Court not specified"}</p>
                      </div>
                      <div className="ml-2 shrink-0 text-right">
                        <p className="text-sm font-medium text-warning">
                          {format(new Date(c.next_hearing_date!), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(c.next_hearing_date!), "EEEE")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
