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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [mobileExpanded, setMobileExpanded] = useState(false);
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
      setMobileExpanded(false);
    }
  };

  // Determine if sidebar should show text
  const showText = isMobile ? mobileExpanded : !collapsed;
  const sidebarWidth = isMobile 
    ? (mobileExpanded ? "w-56" : "w-16") 
    : (collapsed ? "w-20" : "w-64");

  return (
    <TooltipProvider delayDuration={0}>
      {/* Overlay for mobile when expanded */}
      {isMobile && mobileExpanded && (
        <div 
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileExpanded(false)}
        />
      )}
      
      <aside
        className={cn(
          "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
          sidebarWidth,
          isMobile ? "fixed left-0 top-0" : "sticky top-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "border-b border-sidebar-border flex items-center",
          showText ? "p-4" : "p-3 justify-center"
        )}>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3"
            onClick={() => isMobile && setMobileExpanded(false)}
          >
            <div className={cn(
              "rounded-xl gradient-gold shadow-gold flex-shrink-0",
              showText ? "p-2" : "p-2"
            )}>
              <Scale className={cn(
                "text-primary-foreground",
                showText ? "w-5 h-5 sm:w-6 sm:h-6" : "w-5 h-5"
              )} />
            </div>
            {showText && (
              <span className="font-display text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">
                LexPro<span className="text-gradient-gold">Suite</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1 overflow-y-auto",
          showText ? "p-3 sm:p-4" : "p-2"
        )}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const buttonContent = (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "nav-item w-full",
                  isActive && "nav-item-active",
                  showText ? "text-left" : "justify-center px-0"
                )}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  showText ? "w-5 h-5" : "w-5 h-5",
                  isActive && "text-primary"
                )} />
                {showText && <span className="text-sm truncate">{item.label}</span>}
              </button>
            );

            if (!showText) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-50">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}
        </nav>

        {/* Bottom Section */}
        <div className={cn(
          "border-t border-sidebar-border space-y-1",
          showText ? "p-3 sm:p-4" : "p-2"
        )}>
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            const buttonContent = (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "nav-item w-full",
                  isActive && "nav-item-active",
                  showText ? "text-left" : "justify-center px-0"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {showText && <span className="text-sm truncate">{item.label}</span>}
              </button>
            );

            if (!showText) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-50">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}

          {/* Logout */}
          {!showText ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="nav-item w-full justify-center px-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="z-50">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Logout</span>
            </button>
          )}

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isMobile ? setMobileExpanded(!mobileExpanded) : setCollapsed(!collapsed)}
            className={cn("w-full mt-2", !showText && "px-0")}
          >
            {showText ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
