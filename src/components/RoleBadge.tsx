import { Badge } from "@/components/ui/badge";
import { AppRole } from "@/hooks/useAuth";
import { Shield, ShieldCheck, User } from "lucide-react";

interface RoleBadgeProps {
  role: AppRole | null;
  showIcon?: boolean;
}

export const RoleBadge = ({ role, showIcon = true }: RoleBadgeProps) => {
  if (!role) return null;

  const roleConfig = {
    admin: {
      label: "Admin",
      variant: "destructive" as const,
      icon: ShieldCheck,
    },
    moderator: {
      label: "Moderator",
      variant: "default" as const,
      icon: Shield,
    },
    user: {
      label: "User",
      variant: "secondary" as const,
      icon: User,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

export default RoleBadge;
