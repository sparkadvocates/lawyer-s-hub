import { useState, useMemo } from "react";
import { useChecks, Check, CreateCheckData, NoticeStatus } from "@/hooks/useChecks";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import AppLayout from "@/components/layout/AppLayout";
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
import MobileCheckFilters from "@/components/checks/MobileCheckFilters";
import CheckStats from "@/components/checks/CheckStats";
import CheckAlerts from "@/components/checks/CheckAlerts";
import CheckTable from "@/components/checks/CheckTable";
import MobileCheckCard from "@/components/checks/MobileCheckCard";
import CheckReports from "@/components/checks/CheckReports";
import CheckDetailModal from "@/components/checks/CheckDetailModal";
import { useIsMobile } from "@/hooks/use-mobile";

const noticeStatusLabels: Record<NoticeStatus, string> = {
  pending: 'অপেক্ষমাণ',
  ad_received: 'AD প্রাপ্ত',
  recipient_not_found: 'প্রাপক পাওয়া যায়নি',
  returned_unaccepted: 'গ্রহণ না করায় ফেরত',
  delivered: 'ডেলিভারি সম্পন্ন',
};

const Checks = () => {
  const isMobile = useIsMobile();
  const { checks, loading, alerts, createCheck, updateCheck, deleteCheck } = useChecks();
  const { clients } = useClients();
  const { cases } = useCases();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  const [viewingCheck, setViewingCheck] = useState<Check | null>(null);
  const [highlightedCheckId, setHighlightedCheckId] = useState<string | null>(null);
  
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.check_number.toLowerCase().includes(query) || 
        c.bank_name.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
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

    if (noticeStatusFilter !== 'all') {
      result = result.filter(c => c.notice_status === noticeStatusFilter);
    }

    if (bankFilter !== 'all') {
      result = result.filter(c => c.bank_name === bankFilter);
    }

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
    <AppLayout title="চেক ম্যানেজমেন্ট" showSearch={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">চেক ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">চেক ডিস অনার ও নোটিশ ট্র্যাকিং</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 w-full">
                <Plus className="w-4 h-4" />নতুন চেক
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>{editingCheck ? 'চেক সম্পাদনা' : 'নতুন চেক'}</DialogTitle>
                <DialogDescription>চেকের তথ্য প্রদান করুন</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">চেক নম্বর *</Label>
                    <Input value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ব্যাংক *</Label>
                    <Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">তারিখ *</Label>
                    <Input type="date" value={formData.check_date} onChange={(e) => setFormData({ ...formData, check_date: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">পরিমাণ (৳)</Label>
                    <Input type="number" value={formData.check_amount || ''} onChange={(e) => setFormData({ ...formData, check_amount: e.target.value ? parseFloat(e.target.value) : null })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">মক্কেল</Label>
                    <Select value={formData.client_id || 'none'} onValueChange={(v) => setFormData({ ...formData, client_id: v === 'none' ? null : v })}>
                      <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">নেই</SelectItem>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">মামলা</Label>
                    <Select value={formData.case_id || 'none'} onValueChange={(v) => setFormData({ ...formData, case_id: v === 'none' ? null : v })}>
                      <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">নেই</SelectItem>
                        {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">ডিস অনার</Label>
                    <Input type="date" value={formData.dishonor_date || ''} onChange={(e) => setFormData({ ...formData, dishonor_date: e.target.value || null })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">নোটিশ</Label>
                    <Input type="date" value={formData.legal_notice_date || ''} onChange={(e) => setFormData({ ...formData, legal_notice_date: e.target.value || null })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">নোটিশ অবস্থা</Label>
                    <Select value={formData.notice_status} onValueChange={(v) => setFormData({ ...formData, notice_status: v as NoticeStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(noticeStatusLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">মামলা দায়ের</Label>
                    <Input type="date" value={formData.case_filed_date || ''} onChange={(e) => setFormData({ ...formData, case_filed_date: e.target.value || null })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">নোট</Label>
                  <Textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })} rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">বাতিল</Button>
                  <Button type="submit" className="flex-1">{editingCheck ? 'আপডেট' : 'যোগ করুন'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <CheckStats checks={checks} alerts={alerts} />

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="list" className="text-xs">তালিকা</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">অ্যালার্ট ({alerts.length})</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">রিপোর্ট</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-3">
            {/* Filters - Mobile vs Desktop */}
            {isMobile ? (
              <MobileCheckFilters
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                filterType={filterType} setFilterType={setFilterType}
                noticeStatusFilter={noticeStatusFilter} setNoticeStatusFilter={setNoticeStatusFilter}
                sortField={sortField} setSortField={setSortField}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                bankFilter={bankFilter} setBankFilter={setBankFilter}
                banks={banks} onClearFilters={clearFilters}
              />
            ) : (
              <CheckFilters
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                filterType={filterType} setFilterType={setFilterType}
                noticeStatusFilter={noticeStatusFilter} setNoticeStatusFilter={setNoticeStatusFilter}
                sortField={sortField} setSortField={setSortField}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                bankFilter={bankFilter} setBankFilter={setBankFilter}
                banks={banks} onClearFilters={clearFilters}
              />
            )}

            {/* Check List */}
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">লোড হচ্ছে...</div>
            ) : isMobile ? (
              /* Mobile Card View */
              <div className="space-y-3">
                {filteredChecks.length === 0 ? (
                  <div className="text-center py-12">
                    <FileCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">কোনো চেক পাওয়া যায়নি</p>
                  </div>
                ) : (
                  filteredChecks.map((check) => (
                    <MobileCheckCard
                      key={check.id}
                      check={check}
                      alerts={alerts}
                      onEdit={handleOpenDialog}
                      onDelete={handleDelete}
                      onView={setViewingCheck}
                      isHighlighted={highlightedCheckId === check.id}
                    />
                  ))
                )}
              </div>
            ) : (
              /* Desktop Table View */
              <Card className="glass-card overflow-hidden">
                <CardHeader className="p-3">
                  <CardTitle className="flex items-center gap-2 text-sm"><FileCheck className="w-4 h-4" />চেক তালিকা</CardTitle>
                  <CardDescription className="text-xs">মোট {filteredChecks.length}টি</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <CheckTable
                      checks={filteredChecks} alerts={alerts}
                      onEdit={handleOpenDialog} onDelete={handleDelete}
                      onView={setViewingCheck} highlightedCheckId={highlightedCheckId}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts">
            <CheckAlerts alerts={alerts} onNavigateToCheck={handleNavigateToCheck} />
          </TabsContent>

          <TabsContent value="reports">
            <CheckReports checks={checks} />
          </TabsContent>
        </Tabs>
      </div>

      <CheckDetailModal check={viewingCheck} alerts={alerts} isOpen={!!viewingCheck} onClose={() => setViewingCheck(null)} />
    </AppLayout>
  );
};

export default Checks;
