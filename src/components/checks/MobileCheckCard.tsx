import { Check, NoticeStatus, CheckAlert } from "@/hooks/useChecks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, CheckCircle, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MobileCheckCardProps {
  check: Check;
  alerts: CheckAlert[];
  onEdit: (check: Check) => void;
  onDelete: (id: string) => void;
  onView: (check: Check) => void;
  isHighlighted?: boolean;
}

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'ফেরত',
  delivered: 'ডেলিভারি',
};

const noticeStatusColors: Record<NoticeStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  ad_received: 'bg-success/10 text-success border-success/20',
  recipient_not_found: 'bg-destructive/10 text-destructive border-destructive/20',
  returned_unaccepted: 'bg-warning/10 text-warning border-warning/20',
  delivered: 'bg-info/10 text-info border-info/20',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return format(new Date(dateStr), 'dd MMM', { locale: bn });
};

const MobileCheckCard = ({
  check,
  alerts,
  onEdit,
  onDelete,
  onView,
  isHighlighted,
}: MobileCheckCardProps) => {
  const checkAlerts = alerts.filter((a) => a.check_id === check.id);
  const hasOverdue = checkAlerts.some((a) => a.is_overdue);
  const hasWarning = checkAlerts.some((a) => !a.is_overdue);

  const getStatusIcon = () => {
    if (check.case_filed_date) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    if (hasOverdue) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    if (hasWarning) {
      return <Clock className="w-4 h-4 text-warning" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "glass-card p-3 transition-colors active:bg-secondary/30",
        isHighlighted && "bg-primary/10 animate-pulse"
      )}
    >
      {/* Main row */}
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onView(check)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm text-foreground truncate">
              {check.check_number}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {check.bank_name}
          </p>
        </button>

        <div className="text-right shrink-0">
          <p className="font-mono text-sm font-semibold text-foreground">
            {check.check_amount ? `৳${check.check_amount.toLocaleString()}` : '-'}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(check.check_date)}</p>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <Badge className={cn("text-[10px]", noticeStatusColors[check.notice_status])}>
          {noticeStatusLabels[check.notice_status]}
        </Badge>
        {check.dishonor_date && (
          <Badge variant="outline" className="text-[10px]">
            ডিস: {formatDate(check.dishonor_date)}
          </Badge>
        )}
        {check.case_filed_date && (
          <Badge variant="outline" className="text-[10px] border-success/30 text-success">
            মামলা দায়ের
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onView(check)}>
          <Eye className="w-4 h-4 mr-1" />
          <span className="text-xs">বিস্তারিত</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onEdit(check)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-destructive hover:text-destructive"
          onClick={() => onDelete(check.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileCheckCard;
