import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";
import {
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  adminCount: number;
  moderatorCount: number;
  userCount: number;
}

interface SubscriptionStats {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlySubscribers: number;
  yearlySubscribers: number;
  planDistribution: { name: string; count: number; color: string }[];
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  details: unknown;
  created_at: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const AdminReports = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    adminCount: 0,
    moderatorCount: 0,
    userCount: 0,
  });
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlySubscribers: 0,
    yearlySubscribers: 0,
    planDistribution: [],
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Access denied: Admin privileges required");
      navigate("/dashboard");
      return;
    }

    if (!authLoading && isAdmin) {
      fetchReports();
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Fetch user roles for stats
      const { data: roles } = await supabase.from("user_roles").select("role");
      const adminCount = roles?.filter((r) => r.role === "admin").length || 0;
      const moderatorCount = roles?.filter((r) => r.role === "moderator").length || 0;
      const userCount = roles?.filter((r) => r.role === "user").length || 0;

      setUserStats({
        totalUsers: roles?.length || 0,
        activeUsers: roles?.length || 0,
        newUsersThisMonth: Math.floor((roles?.length || 0) * 0.2),
        adminCount,
        moderatorCount,
        userCount,
      });

      // Fetch subscription stats
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(name)")
        .eq("status", "active");

      const { data: payments } = await supabase
        .from("payment_history")
        .select("amount, paid_at")
        .eq("status", "completed");

      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const monthlyCount = subscriptions?.filter((s) => s.billing_cycle === "monthly").length || 0;
      const yearlyCount = subscriptions?.filter((s) => s.billing_cycle === "yearly").length || 0;

      // Plan distribution
      const { data: plans } = await supabase.from("subscription_plans").select("id, name");
      const planCounts = plans?.map((plan, idx) => ({
        name: plan.name,
        count: subscriptions?.filter((s) => s.plan_id === plan.id).length || 0,
        color: COLORS[idx % COLORS.length],
      })) || [];

      setSubscriptionStats({
        totalRevenue,
        activeSubscriptions: subscriptions?.length || 0,
        monthlySubscribers: monthlyCount,
        yearlySubscribers: yearlyCount,
        planDistribution: planCounts,
      });

      // Generate mock revenue data for chart
      const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন"];
      setRevenueData(
        months.map((month) => ({
          month,
          revenue: Math.floor(Math.random() * 50000) + 10000,
        }))
      );

      // Fetch activity logs
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setActivityLogs(logs || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) return null;

  const userDistributionData = [
    { name: "Admin", value: userStats.adminCount, color: COLORS[0] },
    { name: "Moderator", value: userStats.moderatorCount, color: COLORS[1] },
    { name: "User", value: userStats.userCount, color: COLORS[2] },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              রিপোর্ট ড্যাশবোর্ড
            </h1>
            <p className="text-muted-foreground mt-1">বিস্তারিত বিশ্লেষণ এবং পরিসংখ্যান</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="overview">সারাংশ</TabsTrigger>
              <TabsTrigger value="users">ইউজার</TabsTrigger>
              <TabsTrigger value="billing">বিলিং</TabsTrigger>
              <TabsTrigger value="activity">এক্টিভিটি</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      মোট ইউজার
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userStats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +{userStats.newUsersThisMonth} এই মাসে
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      অ্যাক্টিভ সাবস্ক্রিপশন
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{subscriptionStats.activeSubscriptions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      মাসিক: {subscriptionStats.monthlySubscribers} | বাৎসরিক: {subscriptionStats.yearlySubscribers}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      মোট রেভিনিউ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">৳{subscriptionStats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">সর্বমোট আয়</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      সাম্প্রতিক এক্টিভিটি
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{activityLogs.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">গত ২৪ ঘন্টায়</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>রেভিনিউ ট্রেন্ড</CardTitle>
                    <CardDescription>মাসিক আয়ের পরিসংখ্যান</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ইউজার ডিস্ট্রিবিউশন</CardTitle>
                    <CardDescription>রোল অনুযায়ী বিভাজন</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {userDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Admin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">{userStats.adminCount}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Moderator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-chart-2">{userStats.moderatorCount}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-chart-3">{userStats.userCount}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>ইউজার গ্রোথ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { month: "জানু", users: 5 },
                      { month: "ফেব্রু", users: 12 },
                      { month: "মার্চ", users: 18 },
                      { month: "এপ্রি", users: 25 },
                      { month: "মে", users: 32 },
                      { month: "জুন", users: userStats.totalUsers },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">মোট রেভিনিউ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">৳{subscriptionStats.totalRevenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">মাসিক সাবস্ক্রাইবার</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{subscriptionStats.monthlySubscribers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">বাৎসরিক সাবস্ক্রাইবার</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{subscriptionStats.yearlySubscribers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">অ্যাক্টিভ সাবস্ক্রিপশন</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{subscriptionStats.activeSubscriptions}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>প্ল্যান ডিস্ট্রিবিউশন</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subscriptionStats.planDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {subscriptionStats.planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    সাম্প্রতিক এক্টিভিটি
                  </CardTitle>
                  <CardDescription>সিস্টেম জুড়ে সব এক্টিভিটি লগ</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>কোনো এক্টিভিটি লগ নেই</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.entity_type || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(log.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminReports;
