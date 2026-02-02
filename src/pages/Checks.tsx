import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileCheck } from "lucide-react";
import CheckFilters, { FilterType, SortField, SortOrder } from "@/components/checks/CheckFilters";
import CheckStats from "@/components/checks/CheckStats";
import CheckAlerts from "@/components/checks/CheckAlerts";
import CheckTable from "@/components/checks/CheckTable";
import CheckReports from "@/components/checks/CheckReports";
import CheckDetailModal from "@/components/checks/CheckDetailModal";

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
};

const Checks = () => {
  const { checks, loading, alerts, createCheck, updateCheck, deleteCheck } = useChecks();
  const { clients } = useClients();
  const { cases } = useCases();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  const [viewingCheck, setViewingCheck] = useState<Check | null>(null);
  const [highlightedCheckId, setHighlightedCheckId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [noticeStatusFilter, setNoticeStatusFilter] = useState<NoticeStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [bankFilter, setBankFilter] = useState('all');

  const [formData, setFormData] = useState<CreateCheckData>({
    check_number: '', bank_name: '', check_date: '', check_amount: null,
    client_id: null, case_id: null, dishonor_date: null, legal_notice_date: null,
    notice_status: 'pending', case_filed_date: null, notes: null,
  });

  const banks = useMemo(() => [...new Set(checks.map(c => c.bank_name))], [checks]);

  const filteredChecks = useMemo(() => {
    let result = [...checks];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.check_number.toLowerCase().includes(query) || 
        c.bank_name.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      const today = new Date();
      const getDaysDiff = (date: string) => Math.ceil((today.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
      
      result = result.filter(c => {
        switch (filterType) {
          case 'pending_dishonor': return !c.dishonor_date;
          case 'pending_notice': return c.dishonor_date && !c.legal_notice_date;
          case 'pending_case': return c.legal_notice_date && !c.case_filed_date;
          case 'completed': return !!c.case_filed_date;
          case 'overdue': return alerts.some(a => a.check_id === c.id && a.is_overdue);
          default: return true;
        }
      });
    }

    // Filter by notice status
    if (noticeStatusFilter !== 'all') {
      result = result.filter(c => c.notice_status === noticeStatusFilter);
    }

    // Filter by bank
    if (bankFilter !== 'all') {
      result = result.filter(c => c.bank_name === bankFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'check_amount') {
        aVal = a.check_amount || 0;
        bVal = b.check_amount || 0;
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [checks, searchQuery, filterType, noticeStatusFilter, bankFilter, sortField, sortOrder, alerts]);

  const resetForm = () => {
    setFormData({
      check_number: '', bank_name: '', check_date: '', check_amount: null,
      client_id: null, case_id: null, dishonor_date: null, legal_notice_date: null,
      notice_status: 'pending', case_filed_date: null, notes: null,
    });
    setEditingCheck(null);
  };

  const handleOpenDialog = (check?: Check) => {
    if (check) {
      setEditingCheck(check);
      setFormData({ ...check });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCheck) await updateCheck(editingCheck.id, formData);
    else await createCheck(formData);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত?')) await deleteCheck(id);
  };

  const handleNavigateToCheck = (checkId: string) => {
    setHighlightedCheckId(checkId);
    setTimeout(() => setHighlightedCheckId(null), 3000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setNoticeStatusFilter('all');
    setBankFilter('all');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-16 md:pl-0">
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Cheque ম্যানেজমেন্ট</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">চেক ডিস অনার ও লিগ্যাল নোটিশ ট্র্যাকিং</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />নতুন চেক
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCheck ? 'চেক সম্পাদনা' : 'নতুন চেক যোগ করুন'}</DialogTitle>
                    <DialogDescription>চেকের বিস্তারিত তথ্য প্রদান করুন</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>চেক নম্বর *</Label>
                        <Input value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>ব্যাংকের নাম *</Label>
                        <Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>চেকের তারিখ *</Label>
                        <Input type="date" value={formData.check_date} onChange={(e) => setFormData({ ...formData, check_date: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>পরিমাণ (টাকা)</Label>
                        <Input type="number" value={formData.check_amount || ''} onChange={(e) => setFormData({ ...formData, check_amount: e.target.value ? parseFloat(e.target.value) : null })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>মক্কেল</Label>
                        <Select value={formData.client_id || 'none'} onValueChange={(v) => setFormData({ ...formData, client_id: v === 'none' ? null : v })}>
                          <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">কোনো মক্কেল নেই</SelectItem>
                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>মামলা</Label>
                        <Select value={formData.case_id || 'none'} onValueChange={(v) => setFormData({ ...formData, case_id: v === 'none' ? null : v })}>
                          <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">কোনো মামলা নেই</SelectItem>
                            {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ডিস অনার তারিখ</Label>
                        <Input type="date" value={formData.dishonor_date || ''} onChange={(e) => setFormData({ ...formData, dishonor_date: e.target.value || null })} />
                      </div>
                      <div className="space-y-2">
                        <Label>লিগ্যাল নোটিশ তারিখ</Label>
                        <Input type="date" value={formData.legal_notice_date || ''} onChange={(e) => setFormData({ ...formData, legal_notice_date: e.target.value || null })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>নোটিশের অবস্থা</Label>
                        <Select value={formData.notice_status} onValueChange={(v) => setFormData({ ...formData, notice_status: v as NoticeStatus })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(noticeStatusLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>মামলা দায়ের তারিখ</Label>
                        <Input type="date" value={formData.case_filed_date || ''} onChange={(e) => setFormData({ ...formData, case_filed_date: e.target.value || null })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>নোট</Label>
                      <Textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })} rows={2} />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">বাতিল</Button>
                      <Button type="submit" className="w-full sm:w-auto">{editingCheck ? 'আপডেট' : 'যোগ করুন'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <CheckStats checks={checks} alerts={alerts} />

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="w-full sm:w-auto flex">
                <TabsTrigger value="list" className="flex-1 sm:flex-none text-xs sm:text-sm">চেক তালিকা</TabsTrigger>
                <TabsTrigger value="alerts" className="flex-1 sm:flex-none text-xs sm:text-sm">অ্যালার্ট ({alerts.length})</TabsTrigger>
                <TabsTrigger value="reports" className="flex-1 sm:flex-none text-xs sm:text-sm">রিপোর্ট</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <CheckFilters
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  filterType={filterType} setFilterType={setFilterType}
                  noticeStatusFilter={noticeStatusFilter} setNoticeStatusFilter={setNoticeStatusFilter}
                  sortField={sortField} setSortField={setSortField}
                  sortOrder={sortOrder} setSortOrder={setSortOrder}
                  bankFilter={bankFilter} setBankFilter={setBankFilter}
                  banks={banks} onClearFilters={clearFilters}
                />
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />চেক তালিকা</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">মোট {filteredChecks.length}টি চেক</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 sm:pt-0">
                    {loading ? <div className="text-center py-8 text-sm">লোড হচ্ছে...</div> : (
                      <div className="overflow-x-auto">
                        <CheckTable
                          checks={filteredChecks} alerts={alerts}
                          onEdit={handleOpenDialog} onDelete={handleDelete}
                          onView={setViewingCheck} highlightedCheckId={highlightedCheckId}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts">
                <CheckAlerts alerts={alerts} onNavigateToCheck={handleNavigateToCheck} />
              </TabsContent>

              <TabsContent value="reports">
                <CheckReports checks={checks} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <CheckDetailModal check={viewingCheck} alerts={alerts} isOpen={!!viewingCheck} onClose={() => setViewingCheck(null)} />
    </div>
  );
};

export default Checks;
