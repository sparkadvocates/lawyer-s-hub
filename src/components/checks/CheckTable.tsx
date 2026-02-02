import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2, Trash2, CheckCircle, AlertTriangle, Clock, Eye } from "lucide-react";
import { Check, NoticeStatus, CheckAlert } from "@/hooks/useChecks";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface CheckTableProps {
  checks: Check[];
  alerts: CheckAlert[];
  onEdit: (check: Check) => void;
  onDelete: (id: string) => void;
  onView: (check: Check) => void;
  highlightedCheckId?: string | null;
}

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
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
  return format(new Date(dateStr), 'dd MMM yyyy', { locale: bn });
};

const CheckTable = ({ checks, alerts, onEdit, onDelete, onView, highlightedCheckId }: CheckTableProps) => {
  const getCheckAlerts = (checkId: string) => {
    return alerts.filter(a => a.check_id === checkId);
  };

  const getStatusIcon = (check: Check) => {
    if (check.case_filed_date) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    
    const checkAlerts = getCheckAlerts(check.id);
    const hasOverdue = checkAlerts.some(a => a.is_overdue);
    const hasWarning = checkAlerts.some(a => !a.is_overdue);

    if (hasOverdue) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    if (hasWarning) {
      return <Clock className="w-4 h-4 text-warning" />;
    }
    return null;
  };

  if (checks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">কোনো চেক পাওয়া যায়নি</p>
        <p className="text-sm mt-1">ফিল্টার পরিবর্তন করুন অথবা নতুন চেক যোগ করুন</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table className="min-w-[720px] sm:min-w-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>চেক নম্বর</TableHead>
              <TableHead>ব্যাংক</TableHead>
              <TableHead>চেকের তারিখ</TableHead>
              <TableHead className="text-right">পরিমাণ</TableHead>
              <TableHead className="hidden md:table-cell">ডিস অনার</TableHead>
              <TableHead className="hidden md:table-cell">লিগ্যাল নোটিশ</TableHead>
              <TableHead>নোটিশ অবস্থা</TableHead>
              <TableHead className="hidden md:table-cell">মামলা দায়ের</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((check) => {
              const checkAlerts = getCheckAlerts(check.id);
              const isHighlighted = highlightedCheckId === check.id;
              
              return (
                <TableRow 
                  key={check.id}
                  className={`transition-colors ${isHighlighted ? 'bg-primary/10 animate-pulse' : ''}`}
                >
                  <TableCell>
                    {checkAlerts.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">{getStatusIcon(check)}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <ul className="space-y-1">
                            {checkAlerts.map((alert, i) => (
                              <li key={i} className="text-xs">{alert.message}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {checkAlerts.length === 0 && getStatusIcon(check)}
                  </TableCell>
                  <TableCell className="font-medium">{check.check_number}</TableCell>
                  <TableCell>{check.bank_name}</TableCell>
                  <TableCell>{formatDate(check.check_date)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {check.check_amount ? `৳${check.check_amount.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(check.dishonor_date)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(check.legal_notice_date)}</TableCell>
                  <TableCell>
                    <Badge className={noticeStatusColors[check.notice_status]}>
                      {noticeStatusLabels[check.notice_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {check.case_filed_date ? (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="w-3 h-3 text-success" />
                        {formatDate(check.case_filed_date)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(check)}
                        className="h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(check)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(check.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default CheckTable;
