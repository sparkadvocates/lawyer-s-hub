import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Check, NoticeStatus, CheckAlert } from "@/hooks/useChecks";
import { format, differenceInDays } from "date-fns";
import { bn } from "date-fns/locale";
import { FileCheck, Building2, Calendar, User, Briefcase, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface CheckDetailModalProps {
  check: Check | null;
  alerts: CheckAlert[];
  isOpen: boolean;
  onClose: () => void;
}

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'নির্ধারিত নয়';
  return format(new Date(dateStr), 'dd MMMM yyyy', { locale: bn });
};

const CheckDetailModal = ({ check, alerts, isOpen, onClose }: CheckDetailModalProps) => {
  if (!check) return null;

  const checkAlerts = alerts.filter(a => a.check_id === check.id);
  const today = new Date();

  // Calculate progress for each stage
  const calculateStageProgress = () => {
    const stages = [];
    
    // Stage 1: Dishonor
    const checkDate = new Date(check.check_date);
    const daysSinceCheck = differenceInDays(today, checkDate);
    const dishonorDeadline = 180;
    
    if (check.dishonor_date) {
      stages.push({ name: 'ডিস অনার', status: 'completed', progress: 100 });
    } else if (daysSinceCheck > dishonorDeadline) {
      stages.push({ name: 'ডিস অনার', status: 'overdue', progress: 100 });
    } else {
      stages.push({ 
        name: 'ডিস অনার', 
        status: 'pending', 
        progress: Math.round((daysSinceCheck / dishonorDeadline) * 100),
        daysRemaining: dishonorDeadline - daysSinceCheck
      });
    }

    // Stage 2: Legal Notice
    if (check.dishonor_date) {
      const dishonorDate = new Date(check.dishonor_date);
      const daysSinceDishonor = differenceInDays(today, dishonorDate);
      const noticeDeadline = 30;
      
      if (check.legal_notice_date) {
        stages.push({ name: 'লিগ্যাল নোটিশ', status: 'completed', progress: 100 });
      } else if (daysSinceDishonor > noticeDeadline) {
        stages.push({ name: 'লিগ্যাল নোটিশ', status: 'overdue', progress: 100 });
      } else {
        stages.push({ 
          name: 'লিগ্যাল নোটিশ', 
          status: 'pending', 
          progress: Math.round((daysSinceDishonor / noticeDeadline) * 100),
          daysRemaining: noticeDeadline - daysSinceDishonor
        });
      }
    } else {
      stages.push({ name: 'লিগ্যাল নোটিশ', status: 'waiting', progress: 0 });
    }

    // Stage 3: Case Filing
    if (check.legal_notice_date) {
      const noticeDate = new Date(check.legal_notice_date);
      const daysSinceNotice = differenceInDays(today, noticeDate);
      const caseDeadline = 60;
      
      if (check.case_filed_date) {
        stages.push({ name: 'মামলা দায়ের', status: 'completed', progress: 100 });
      } else if (daysSinceNotice > caseDeadline) {
        stages.push({ name: 'মামলা দায়ের', status: 'overdue', progress: 100 });
      } else {
        stages.push({ 
          name: 'মামলা দায়ের', 
          status: 'pending', 
          progress: Math.round((daysSinceNotice / caseDeadline) * 100),
          daysRemaining: caseDeadline - daysSinceNotice
        });
      }
    } else {
      stages.push({ name: 'মামলা দায়ের', status: 'waiting', progress: 0 });
    }

    return stages;
  };

  const stages = calculateStageProgress();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-destructive';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'overdue': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            চেক #{check.check_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="glass-card">
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">ব্যাংক</p>
                  <p className="font-medium">{check.bank_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">চেকের তারিখ</p>
                  <p className="font-medium">{formatDate(check.check_date)}</p>
                </div>
              </div>
              {check.client_name && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">মক্কেল</p>
                    <p className="font-medium">{check.client_name}</p>
                  </div>
                </div>
              )}
              {check.case_title && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">মামলা</p>
                    <p className="font-medium">{check.case_title}</p>
                  </div>
                </div>
              )}
              {check.check_amount && (
                <div className="col-span-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground">পরিমাণ</p>
                  <p className="text-2xl font-bold text-primary">
                    ৳{check.check_amount.toLocaleString('bn-BD')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Stages */}
          <div className="space-y-4">
            <h4 className="font-medium">অগ্রগতি</h4>
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stage.status)}
                      <span className="text-sm font-medium">{stage.name}</span>
                    </div>
                    <div className="text-sm">
                      {stage.status === 'completed' && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">সম্পন্ন</Badge>
                      )}
                      {stage.status === 'overdue' && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">সময়সীমা শেষ</Badge>
                      )}
                      {stage.status === 'pending' && stage.daysRemaining !== undefined && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                          {stage.daysRemaining} দিন বাকি
                        </Badge>
                      )}
                      {stage.status === 'waiting' && (
                        <Badge variant="outline" className="text-muted-foreground">অপেক্ষমাণ</Badge>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={stage.progress} 
                    className={`h-2 ${stage.status === 'overdue' ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Dates Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">তারিখ সমূহ</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">ডিস অনার তারিখ</p>
                <p className="font-medium">{formatDate(check.dishonor_date)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">লিগ্যাল নোটিশ তারিখ</p>
                <p className="font-medium">{formatDate(check.legal_notice_date)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">নোটিশ অবস্থা</p>
                <p className="font-medium">{noticeStatusLabels[check.notice_status]}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">মামলা দায়ের তারিখ</p>
                <p className="font-medium">{formatDate(check.case_filed_date)}</p>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {checkAlerts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  সতর্কতা
                </h4>
                <div className="space-y-2">
                  {checkAlerts.map((alert, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg ${alert.is_overdue ? 'bg-destructive/10 border border-destructive/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}
                    >
                      <p className={`text-sm ${alert.is_overdue ? 'text-destructive' : 'text-yellow-600'}`}>
                        {alert.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {check.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">নোট</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{check.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckDetailModal;
