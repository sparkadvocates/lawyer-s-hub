import { useState } from "react";
import { useChecks, Check, CreateCheckData, NoticeStatus } from "@/hooks/useChecks";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Edit2, Trash2, FileCheck, AlertTriangle, Clock, Ban, CheckCircle, Bell } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
};

const noticeStatusColors: Record<NoticeStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  ad_received: 'bg-green-500/10 text-green-600 border-green-500/20',
  recipient_not_found: 'bg-red-500/10 text-red-600 border-red-500/20',
  returned_unaccepted: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  delivered: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const Checks = () => {
  const { checks, loading, alerts, createCheck, updateCheck, deleteCheck } = useChecks();
  const { clients } = useClients();
  const { cases } = useCases();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  const [formData, setFormData] = useState<CreateCheckData>({
    check_number: '',
    bank_name: '',
    check_date: '',
    check_amount: null,
    client_id: null,
    case_id: null,
    dishonor_date: null,
    legal_notice_date: null,
    notice_status: 'pending',
    case_filed_date: null,
    notes: null,
  });

  const resetForm = () => {
    setFormData({
      check_number: '',
      bank_name: '',
      check_date: '',
      check_amount: null,
      client_id: null,
      case_id: null,
      dishonor_date: null,
      legal_notice_date: null,
      notice_status: 'pending',
      case_filed_date: null,
      notes: null,
    });
    setEditingCheck(null);
  };

  const handleOpenDialog = (check?: Check) => {
    if (check) {
      setEditingCheck(check);
      setFormData({
        check_number: check.check_number,
        bank_name: check.bank_name,
        check_date: check.check_date,
        check_amount: check.check_amount,
        client_id: check.client_id,
        case_id: check.case_id,
        dishonor_date: check.dishonor_date,
        legal_notice_date: check.legal_notice_date,
        notice_status: check.notice_status,
        case_filed_date: check.case_filed_date,
        notes: check.notes,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCheck) {
      await updateCheck(editingCheck.id, formData);
    } else {
      await createCheck(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই চেক মুছে ফেলতে চান?')) {
      await deleteCheck(id);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: bn });
  };

  const criticalAlerts = alerts.filter(a => a.is_overdue);
  const warningAlerts = alerts.filter(a => !a.is_overdue);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  চেক ম্যানেজমেন্ট
                </h1>
                <p className="text-muted-foreground mt-1">
                  চেক ডিস অনার ও লিগ্যাল নোটিশ ট্র্যাকিং
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    নতুন চেক যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCheck ? 'চেক সম্পাদনা করুন' : 'নতুন চেক যোগ করুন'}
                    </DialogTitle>
                    <DialogDescription>
                      চেকের বিস্তারিত তথ্য প্রদান করুন
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="check_number">চেক নম্বর *</Label>
                        <Input
                          id="check_number"
                          value={formData.check_number}
                          onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank_name">ব্যাংকের নাম *</Label>
                        <Input
                          id="bank_name"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="check_date">চেকের তারিখ *</Label>
                        <Input
                          id="check_date"
                          type="date"
                          value={formData.check_date}
                          onChange={(e) => setFormData({ ...formData, check_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="check_amount">চেকের পরিমাণ (টাকা)</Label>
                        <Input
                          id="check_amount"
                          type="number"
                          value={formData.check_amount || ''}
                          onChange={(e) => setFormData({ ...formData, check_amount: e.target.value ? parseFloat(e.target.value) : null })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client_id">মক্কেল</Label>
                        <Select
                          value={formData.client_id || 'none'}
                          onValueChange={(value) => setFormData({ ...formData, client_id: value === 'none' ? null : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="মক্কেল নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">কোনো মক্কেল নেই</SelectItem>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="case_id">মামলা</Label>
                        <Select
                          value={formData.case_id || 'none'}
                          onValueChange={(value) => setFormData({ ...formData, case_id: value === 'none' ? null : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="মামলা নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">কোনো মামলা নেই</SelectItem>
                            {cases.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dishonor_date">ডিস অনার তারিখ</Label>
                        <Input
                          id="dishonor_date"
                          type="date"
                          value={formData.dishonor_date || ''}
                          onChange={(e) => setFormData({ ...formData, dishonor_date: e.target.value || null })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="legal_notice_date">লিগ্যাল নোটিশ তারিখ</Label>
                        <Input
                          id="legal_notice_date"
                          type="date"
                          value={formData.legal_notice_date || ''}
                          onChange={(e) => setFormData({ ...formData, legal_notice_date: e.target.value || null })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="notice_status">নোটিশের অবস্থা</Label>
                        <Select
                          value={formData.notice_status}
                          onValueChange={(value) => setFormData({ ...formData, notice_status: value as NoticeStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(noticeStatusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="case_filed_date">মামলা দায়ের তারিখ</Label>
                        <Input
                          id="case_filed_date"
                          type="date"
                          value={formData.case_filed_date || ''}
                          onChange={(e) => setFormData({ ...formData, case_filed_date: e.target.value || null })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">নোট</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        বাতিল
                      </Button>
                      <Button type="submit">
                        {editingCheck ? 'আপডেট করুন' : 'যোগ করুন'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Alerts Section */}
            {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
              <div className="space-y-4">
                {criticalAlerts.length > 0 && (
                  <Alert variant="destructive">
                    <Ban className="h-4 w-4" />
                    <AlertTitle>জরুরি সতর্কতা</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1">
                        {criticalAlerts.map((alert) => (
                          <li key={`${alert.check_id}-${alert.type}`} className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            {alert.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {warningAlerts.length > 0 && (
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <Bell className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-600">আসন্ন সময়সীমা</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1 text-yellow-700">
                        {warningAlerts.map((alert) => (
                          <li key={`${alert.check_id}-${alert.type}`} className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {alert.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Checks Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  চেক তালিকা
                </CardTitle>
                <CardDescription>
                  মোট {checks.length}টি চেক
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
                ) : checks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    কোনো চেক পাওয়া যায়নি
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>চেক নম্বর</TableHead>
                          <TableHead>ব্যাংক</TableHead>
                          <TableHead>চেকের তারিখ</TableHead>
                          <TableHead>পরিমাণ</TableHead>
                          <TableHead>ডিস অনার</TableHead>
                          <TableHead>লিগ্যাল নোটিশ</TableHead>
                          <TableHead>নোটিশ অবস্থা</TableHead>
                          <TableHead>মামলা দায়ের</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checks.map((check) => (
                          <TableRow key={check.id}>
                            <TableCell className="font-medium">{check.check_number}</TableCell>
                            <TableCell>{check.bank_name}</TableCell>
                            <TableCell>{formatDate(check.check_date)}</TableCell>
                            <TableCell>
                              {check.check_amount ? `৳${check.check_amount.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell>{formatDate(check.dishonor_date)}</TableCell>
                            <TableCell>{formatDate(check.legal_notice_date)}</TableCell>
                            <TableCell>
                              <Badge className={noticeStatusColors[check.notice_status]}>
                                {noticeStatusLabels[check.notice_status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {check.case_filed_date ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  {formatDate(check.case_filed_date)}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(check)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(check.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checks;
