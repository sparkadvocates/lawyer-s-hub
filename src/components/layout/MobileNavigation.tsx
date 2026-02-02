import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "হোম", path: "/dashboard" },
  { icon: Briefcase, label: "কেস", path: "/dashboard/cases" },
  { icon: Users, label: "ক্লায়েন্ট", path: "/dashboard/clients" },
  { icon: Calendar, label: "ক্যালেন্ডার", path: "/dashboard/calendar" },
  { icon: MoreHorizontal, label: "আরও", path: "/dashboard/more" },
];

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard/more") {
      // "More" is active if current path is not one of the main nav items
      const mainPaths = navItems.slice(0, 4).map(i => i.path);
      return !mainPaths.some(p => location.pathname === p || location.pathname.startsWith(p + "/"));
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors touch-manipulation",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                active && "bg-primary/10"
              )}>
                <item.icon className={cn("w-5 h-5", active && "text-primary")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                active && "text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
