import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import RecentCases from "@/components/dashboard/RecentCases";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Briefcase, Users, Gavel, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Dashboard = () => {
  const { user, role, isAdmin, refreshRole } = useAuth();
  const [showAdminBanner, setShowAdminBanner] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    // Show admin banner if user has no admin role and they might be the first user
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
              Good morning, <span className="text-gradient-gold">{getUserName()}</span>
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your cases today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Active Cases"
              value={24}
              change="+3 this month"
              changeType="positive"
              icon={Briefcase}
              iconColor="text-primary"
              className="animate-fade-in stagger-1"
            />
            <StatCard
              title="Total Clients"
              value={156}
              change="+12 this quarter"
              changeType="positive"
              icon={Users}
              iconColor="text-info"
              className="animate-fade-in stagger-2"
            />
            <StatCard
              title="Upcoming Hearings"
              value={8}
              change="Next: Tomorrow"
              changeType="neutral"
              icon={Gavel}
              iconColor="text-warning"
              className="animate-fade-in stagger-3"
            />
            <StatCard
              title="Billable Hours"
              value="142.5"
              change="+18% vs last month"
              changeType="positive"
              icon={Clock}
              iconColor="text-success"
              className="animate-fade-in stagger-4"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Cases & Events */}
            <div className="xl:col-span-2 space-y-6">
              <RecentCases />
              <UpcomingEvents />
            </div>

            {/* Right Column - Actions & Activity */}
            <div className="space-y-6">
              <QuickActions />
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
