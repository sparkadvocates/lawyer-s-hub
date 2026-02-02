import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentCases from "@/components/dashboard/RecentCases";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Briefcase, Users, Gavel, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const UserDashboard = () => {
  const { user } = useAuth();

  const getUserName = () => {
    if (!user?.email) return "there";
    return user.email.split("@")[0];
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
          স্বাগতম, <span className="text-gradient-gold">{getUserName()}</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          আজকের কেস আপডেট দেখুন।
        </p>
      </div>

      {/* Stats Grid - 2x2 on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          title="সক্রিয় কেস"
          value={24}
          change="+3 এই মাসে"
          changeType="positive"
          icon={Briefcase}
          iconColor="text-primary"
          className="animate-fade-in stagger-1"
        />
        <StatCard
          title="মোট ক্লায়েন্ট"
          value={156}
          change="+12 এই কোয়ার্টার"
          changeType="positive"
          icon={Users}
          iconColor="text-info"
          className="animate-fade-in stagger-2"
        />
        <StatCard
          title="আসন্ন শুনানি"
          value={8}
          change="পরবর্তী: আগামীকাল"
          changeType="neutral"
          icon={Gavel}
          iconColor="text-warning"
          className="animate-fade-in stagger-3"
        />
        <StatCard
          title="বিলযোগ্য ঘন্টা"
          value="142.5"
          change="+18% গত মাসের তুলনায়"
          changeType="positive"
          icon={Clock}
          iconColor="text-success"
          className="animate-fade-in stagger-4"
        />
      </div>

      {/* Main Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Cases & Events */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <RecentCases />
          <UpcomingEvents />
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="space-y-4 md:space-y-6">
          <QuickActions />
          <ActivityFeed />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
