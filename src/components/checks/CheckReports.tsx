import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, PieChart, Calendar, Building2 } from "lucide-react";
import { Check, NoticeStatus } from "@/hooks/useChecks";
import { format, subMonths, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { bn } from "date-fns/locale";

interface CheckReportsProps {
  checks: Check[];
}

type ReportType = 'summary' | 'by_bank' | 'by_status' | 'monthly' | 'deadline';

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
};

const CheckReports = ({ checks }: CheckReportsProps) => {
  const [reportType, setReportType] = useState<ReportType>('summary');

  // Calculate summary stats
  const totalAmount = checks.reduce((sum, c) => sum + (c.check_amount || 0), 0);
  const completedChecks = checks.filter(c => c.case_filed_date);
  const completedAmount = completedChecks.reduce((sum, c) => sum + (c.check_amount || 0), 0);
  const pendingAmount = totalAmount - completedAmount;

  // Group by bank
  const bankStats = checks.reduce((acc, check) => {
    const bank = check.bank_name;
    if (!acc[bank]) {
      acc[bank] = { count: 0, amount: 0, completed: 0 };
    }
    acc[bank].count++;
    acc[bank].amount += check.check_amount || 0;
    if (check.case_filed_date) acc[bank].completed++;
    return acc;
  }, {} as Record<string, { count: number; amount: number; completed: number }>);

  // Group by notice status
  const statusStats = checks.reduce((acc, check) => {
    const status = check.notice_status;
    if (!acc[status]) {
      acc[status] = { count: 0, amount: 0 };
    }
    acc[status].count++;
    acc[status].amount += check.check_amount || 0;
    return acc;
  }, {} as Record<NoticeStatus, { count: number; amount: number }>);

  // Monthly stats (last 6 months)
  const monthlyStats = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const monthChecks = checks.filter(c => {
      const checkDate = new Date(c.created_at);
      return isAfter(checkDate, start) && isBefore(checkDate, end);
    });
    
    monthlyStats.push({
      month: format(date, 'MMM yyyy', { locale: bn }),
      count: monthChecks.length,
      amount: monthChecks.reduce((sum, c) => sum + (c.check_amount || 0), 0),
    });
  }

  // Deadline analysis
  const today = new Date();
  const calculateDaysDiff = (fromDate: string): number => {
    const from = new Date(fromDate);
    return Math.ceil((today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  };

  const deadlineAnalysis = {
    dishonorOverdue: checks.filter(c => !c.dishonor_date && calculateDaysDiff(c.check_date) > 180).length,
    noticeOverdue: checks.filter(c => c.dishonor_date && !c.legal_notice_date && calculateDaysDiff(c.dishonor_date) > 30).length,
    caseOverdue: checks.filter(c => c.legal_notice_date && !c.case_filed_date && calculateDaysDiff(c.legal_notice_date) > 60).length,
    dishonorUpcoming: checks.filter(c => {
      if (c.dishonor_date) return false;
      const days = 180 - calculateDaysDiff(c.check_date);
      return days > 0 && days <= 30;
    }).length,
    noticeUpcoming: checks.filter(c => {
      if (!c.dishonor_date || c.legal_notice_date) return false;
      const days = 30 - calculateDaysDiff(c.dishonor_date);
      return days > 0 && days <= 10;
    }).length,
    caseUpcoming: checks.filter(c => {
      if (!c.legal_notice_date || c.case_filed_date) return false;
      const days = 60 - calculateDaysDiff(c.legal_notice_date);
      return days > 0 && days <= 15;
    }).length,
  };

  const exportReport = () => {
    const data = checks.map(c => ({
      'চেক নম্বর': c.check_number,
      'ব্যাংক': c.bank_name,
      'পরিমাণ': c.check_amount || 0,
      'চেকের তারিখ': c.check_date,
      'ডিস অনার তারিখ': c.dishonor_date || '',
      'নোটিশ তারিখ': c.legal_notice_date || '',
      'নোটিশ অবস্থা': noticeStatusLabels[c.notice_status],
      'মামলা তারিখ': c.case_filed_date || '',
    }));

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `check-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              রিপোর্ট ও বিশ্লেষণ
            </CardTitle>
            <CardDescription>চেক ম্যানেজমেন্ট রিপোর্ট</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">সারসংক্ষেপ</SelectItem>
                <SelectItem value="by_bank">ব্যাংক অনুযায়ী</SelectItem>
                <SelectItem value="by_status">অবস্থা অনুযায়ী</SelectItem>
                <SelectItem value="monthly">মাসিক</SelectItem>
                <SelectItem value="deadline">সময়সীমা বিশ্লেষণ</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={exportReport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reportType === 'summary' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">মোট চেক</p>
              <p className="text-3xl font-bold text-primary">{checks.length}</p>
              <p className="text-sm text-primary mt-1">৳{totalAmount.toLocaleString('bn-BD')}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">সম্পন্ন মামলা</p>
              <p className="text-3xl font-bold text-green-500">{completedChecks.length}</p>
              <p className="text-sm text-green-500 mt-1">৳{completedAmount.toLocaleString('bn-BD')}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-muted-foreground">চলমান</p>
              <p className="text-3xl font-bold text-yellow-500">{checks.length - completedChecks.length}</p>
              <p className="text-sm text-yellow-500 mt-1">৳{pendingAmount.toLocaleString('bn-BD')}</p>
            </div>
          </div>
        )}

        {reportType === 'by_bank' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  ব্যাংক
                </TableHead>
                <TableHead className="text-center">চেক সংখ্যা</TableHead>
                <TableHead className="text-right">মোট পরিমাণ</TableHead>
                <TableHead className="text-center">সম্পন্ন</TableHead>
                <TableHead className="text-center">সাফল্যের হার</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(bankStats)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([bank, stats]) => (
                  <TableRow key={bank}>
                    <TableCell className="font-medium">{bank}</TableCell>
                    <TableCell className="text-center">{stats.count}</TableCell>
                    <TableCell className="text-right">৳{stats.amount.toLocaleString('bn-BD')}</TableCell>
                    <TableCell className="text-center">{stats.completed}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stats.completed / stats.count >= 0.5 ? 'default' : 'secondary'}>
                        {Math.round((stats.completed / stats.count) * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}

        {reportType === 'by_status' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  নোটিশ অবস্থা
                </TableHead>
                <TableHead className="text-center">চেক সংখ্যা</TableHead>
                <TableHead className="text-right">মোট পরিমাণ</TableHead>
                <TableHead className="text-center">শতকরা হার</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(statusStats).map(([status, stats]) => (
                <TableRow key={status}>
                  <TableCell className="font-medium">
                    {noticeStatusLabels[status as NoticeStatus]}
                  </TableCell>
                  <TableCell className="text-center">{stats.count}</TableCell>
                  <TableCell className="text-right">৳{stats.amount.toLocaleString('bn-BD')}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {Math.round((stats.count / checks.length) * 100)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {reportType === 'monthly' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  মাস
                </TableHead>
                <TableHead className="text-center">নতুন চেক</TableHead>
                <TableHead className="text-right">মোট পরিমাণ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyStats.map((stat) => (
                <TableRow key={stat.month}>
                  <TableCell className="font-medium">{stat.month}</TableCell>
                  <TableCell className="text-center">{stat.count}</TableCell>
                  <TableCell className="text-right">৳{stat.amount.toLocaleString('bn-BD')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {reportType === 'deadline' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-destructive">সময়সীমা শেষ</h4>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">ডিস অনার সময়সীমা শেষ</p>
                <p className="text-2xl font-bold text-destructive">{deadlineAnalysis.dishonorOverdue}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">নোটিশ সময়সীমা শেষ</p>
                <p className="text-2xl font-bold text-destructive">{deadlineAnalysis.noticeOverdue}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">মামলা সময়সীমা শেষ</p>
                <p className="text-2xl font-bold text-destructive">{deadlineAnalysis.caseOverdue}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-yellow-500">আসন্ন সময়সীমা</h4>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-muted-foreground">৩০ দিনের মধ্যে ডিস অনার করতে হবে</p>
                <p className="text-2xl font-bold text-yellow-500">{deadlineAnalysis.dishonorUpcoming}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-muted-foreground">১০ দিনের মধ্যে নোটিশ দিতে হবে</p>
                <p className="text-2xl font-bold text-yellow-500">{deadlineAnalysis.noticeUpcoming}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-muted-foreground">১৫ দিনের মধ্যে মামলা করতে হবে</p>
                <p className="text-2xl font-bold text-yellow-500">{deadlineAnalysis.caseUpcoming}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckReports;
