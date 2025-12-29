import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, AlertTriangle, Clock, CheckCircle2, Ban, TrendingUp } from "lucide-react";
import { Check, CheckAlert } from "@/hooks/useChecks";

interface CheckStatsProps {
  checks: Check[];
  alerts: CheckAlert[];
}

const CheckStats = ({ checks, alerts }: CheckStatsProps) => {
  const totalChecks = checks.length;
  const pendingDishonor = checks.filter(c => !c.dishonor_date).length;
  const pendingNotice = checks.filter(c => c.dishonor_date && !c.legal_notice_date).length;
  const pendingCase = checks.filter(c => c.legal_notice_date && !c.case_filed_date).length;
  const completed = checks.filter(c => c.case_filed_date).length;
  const overdueCount = alerts.filter(a => a.is_overdue).length;
  const totalAmount = checks.reduce((sum, c) => sum + (c.check_amount || 0), 0);

  const stats = [
    {
      label: 'মোট চেক',
      value: totalChecks,
      icon: FileCheck,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'ডিস অনার বাকি',
      value: pendingDishonor,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'নোটিশ বাকি',
      value: pendingNotice,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'মামলা বাকি',
      value: pendingCase,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'সম্পন্ন',
      value: completed,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'সময়সীমা শেষ',
      value: overdueCount,
      icon: Ban,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Amount Card */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">মোট চেকের পরিমাণ</p>
                <p className="text-3xl font-bold text-primary">
                  ৳{totalAmount.toLocaleString('bn-BD')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">গড় পরিমাণ</p>
              <p className="text-lg font-semibold text-foreground">
                ৳{totalChecks > 0 ? Math.round(totalAmount / totalChecks).toLocaleString('bn-BD') : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckStats;
