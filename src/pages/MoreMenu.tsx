import { useNavigate } from "react-router-dom";
import {
  FileText,
  DollarSign,
  Clock,
  Gavel,
  MessageSquare,
  Database,
  Settings,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronRight,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  description?: string;
  color?: string;
}

const menuGroups = [
  {
    title: "কেস ম্যানেজমেন্ট",
    items: [
      { icon: FileCheck, label: "চেক ট্র্যাকিং", path: "/dashboard/checks", description: "চেক ডিস অনার কেস", color: "text-warning" },
      { icon: Gavel, label: "কোর্ট ডেট", path: "/dashboard/court", description: "আসন্ন শুনানি", color: "text-destructive" },
      { icon: FileText, label: "ডকুমেন্ট", path: "/dashboard/documents", description: "ফাইল ম্যানেজমেন্ট", color: "text-info" },
    ],
  },
  {
    title: "অর্থ ও সময়",
    items: [
      { icon: DollarSign, label: "বিলিং", path: "/dashboard/billing", description: "ইনভয়েস ও পেমেন্ট", color: "text-success" },
      { icon: Clock, label: "টাইম ট্র্যাকিং", path: "/dashboard/time", description: "কাজের সময় রেকর্ড", color: "text-primary" },
    ],
  },
  {
    title: "যোগাযোগ",
    items: [
      { icon: MessageSquare, label: "মেসেজ", path: "/dashboard/messages", description: "ক্লায়েন্ট চ্যাট", color: "text-info" },
    ],
  },
  {
    title: "সিস্টেম",
    items: [
      { icon: Database, label: "ব্যাকআপ", path: "/dashboard/backup", description: "ডাটা সংরক্ষণ", color: "text-muted-foreground" },
      { icon: Settings, label: "সেটিংস", path: "/dashboard/settings", description: "অ্যাপ কনফিগার", color: "text-muted-foreground" },
    ],
  },
];

const adminItems: MenuItem[] = [
  { icon: BarChart3, label: "রিপোর্ট", path: "/dashboard/reports", description: "অ্যানালিটিক্স", color: "text-primary" },
  { icon: CreditCard, label: "প্যাকেজ", path: "/dashboard/packages", description: "সাবস্ক্রিপশন", color: "text-warning" },
  { icon: ShieldCheck, label: "অ্যাডমিন", path: "/dashboard/settings", description: "ইউজার ম্যানেজমেন্ট", color: "text-destructive" },
];

const MoreMenu = () => {
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("সাইন আউট সফল");
    navigate("/login");
  };

  return (
    <AppLayout title="আরও" showSearch={false}>
      <div className="p-4 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {group.items.map((item, idx) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 text-left transition-colors active:bg-secondary/80",
                    idx !== group.items.length - 1 && "border-b border-border"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl bg-secondary/50", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <h2 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3 px-1">
              অ্যাডমিন
            </h2>
            <div className="bg-card rounded-2xl border border-destructive/20 overflow-hidden">
              {adminItems.map((item, idx) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 text-left transition-colors active:bg-secondary/80",
                    idx !== adminItems.length - 1 && "border-b border-border"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl bg-destructive/10", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive font-medium transition-colors active:bg-destructive/20"
          >
            <LogOut className="w-5 h-5" />
            সাইন আউট
          </button>
        </div>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-4 pb-8">
          LexProSuite v1.0.0
        </p>
      </div>
    </AppLayout>
  );
};

export default MoreMenu;
