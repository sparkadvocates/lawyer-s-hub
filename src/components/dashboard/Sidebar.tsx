import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  LogOut,
  Scale,
  ChevronLeft,
  ChevronRight,
  Gavel,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  CreditCard,
  FileCheck,
  Database,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, label: "Cases", path: "/dashboard/cases" },
  { icon: Users, label: "Clients", path: "/dashboard/clients" },
  { icon: FileCheck, label: "Cheque", path: "/dashboard/checks" },
  { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
  { icon: FileText, label: "Documents", path: "/dashboard/documents" },
  { icon: Clock, label: "Time Tracking", path: "/dashboard/time" },
  { icon: DollarSign, label: "Billing", path: "/dashboard/billing" },
  { icon: Gavel, label: "Court Dates", path: "/dashboard/court" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Database, label: "Backup", path: "/dashboard/backup" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  const bottomItems = [
    ...(isAdmin ? [
      { icon: BarChart3, label: "Reports", path: "/dashboard/reports" },
      { icon: CreditCard, label: "Packages", path: "/dashboard/packages" },
      { icon: ShieldCheck, label: "Admin Settings", path: "/dashboard/settings" },
    ] : []),
  ];

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => isMobile && setMobileOpen(false)}>
          <div className="p-2 rounded-xl gradient-gold shadow-gold flex-shrink-0">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-display text-lg sm:text-xl font-bold text-foreground">
              LexPro<span className="text-gradient-gold">Suite</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "nav-item w-full text-left",
                isActive && "nav-item-active",
                collapsed && !isMobile && "justify-center px-2"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {(!collapsed || isMobile) && <span className="text-sm sm:text-base">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "nav-item w-full text-left",
                isActive && "nav-item-active",
                collapsed && !isMobile && "justify-center px-2"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="text-sm sm:text-base">{item.label}</span>}
            </button>
          );
        })}

        <button
          onClick={handleLogout}
          className={cn(
            "nav-item w-full text-left text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && !isMobile && "justify-center px-2"
          )}
          title={collapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm sm:text-base">Logout</span>}
        </button>

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full mt-2", collapsed && "px-0")}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile: Use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 bg-background/80 backdrop-blur-sm shadow-md md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 hidden md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
