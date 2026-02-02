import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  className,
}: StatCardProps) => {
  return (
    <div className={cn("stat-card p-3 md:p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-lg md:text-2xl font-bold text-foreground font-display">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs truncate",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-2 rounded-xl bg-secondary shrink-0", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
