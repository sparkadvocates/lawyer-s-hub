import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  closedCases: number;
  totalClients: number;
  upcomingHearings: number;
  casesByStatus: { status: string; count: number }[];
  casesByType: { type: string; count: number }[];
  casesByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
  recentActivity: {
    id: string;
    action: string;
    created_at: string;
    entity_type: string | null;
  }[];
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    pendingCases: 0,
    closedCases: 0,
    totalClients: 0,
    upcomingHearings: 0,
    casesByStatus: [],
    casesByType: [],
    casesByMonth: [],
    revenueByMonth: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch cases
      const { data: cases } = await supabase
        .from("cases")
        .select("id, status, case_type, next_hearing_date, created_at");

      // Fetch clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id");

      // Fetch payment history for revenue
      const { data: payments } = await supabase
        .from("payment_history")
        .select("amount, paid_at, status")
        .eq("status", "completed");

      // Fetch recent activity
      const { data: activity } = await supabase
        .from("activity_logs")
        .select("id, action, created_at, entity_type")
        .order("created_at", { ascending: false })
        .limit(10);

      if (cases) {
        const today = new Date();
        
        // Count by status
        const statusCounts: Record<string, number> = {};
        const typeCounts: Record<string, number> = {};
        const monthCounts: Record<string, number> = {};
        let upcomingHearings = 0;

        cases.forEach((c) => {
          // Status counts
          statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
          
          // Type counts
          if (c.case_type) {
            typeCounts[c.case_type] = (typeCounts[c.case_type] || 0) + 1;
          }
          
          // Month counts (last 6 months)
          const createdDate = new Date(c.created_at);
          const monthKey = createdDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;

          // Upcoming hearings
          if (c.next_hearing_date) {
            const hearingDate = new Date(c.next_hearing_date);
            if (hearingDate >= today) {
              upcomingHearings++;
            }
          }
        });

        // Revenue by month
        const revenueCounts: Record<string, number> = {};
        if (payments) {
          payments.forEach((p) => {
            if (p.paid_at) {
              const paidDate = new Date(p.paid_at);
              const monthKey = paidDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
              revenueCounts[monthKey] = (revenueCounts[monthKey] || 0) + Number(p.amount);
            }
          });
        }

        // Generate last 6 months for consistent chart
        const last6Months: string[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          last6Months.push(date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
        }

        setStats({
          totalCases: cases.length,
          activeCases: (statusCounts["open"] || 0) + (statusCounts["in_progress"] || 0),
          pendingCases: statusCounts["pending"] || 0,
          closedCases: (statusCounts["closed"] || 0) + (statusCounts["won"] || 0) + (statusCounts["lost"] || 0),
          totalClients: clients?.length || 0,
          upcomingHearings,
          casesByStatus: Object.entries(statusCounts).map(([status, count]) => ({
            status: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            count,
          })),
          casesByType: Object.entries(typeCounts)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count })),
          casesByMonth: last6Months.map((month) => ({
            month,
            count: monthCounts[month] || 0,
          })),
          revenueByMonth: last6Months.map((month) => ({
            month,
            amount: revenueCounts[month] || 0,
          })),
          recentActivity: activity || [],
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, loading, refetch: fetchStats };
};
