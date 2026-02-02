import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCases, CaseData, CreateCaseData } from "@/hooks/useCases";
import { useClients } from "@/hooks/useClients";
import CaseDetailView from "@/components/cases/CaseDetailView";

const caseTypes = [
  "Civil Litigation",
  "Criminal Defense",
  "Corporate Law",
  "Family Law",
  "Immigration",
  "Real Estate",
  "Intellectual Property",
  "Employment Law",
  "Personal Injury",
  "Estate Planning",
];

const statusConfig = {
  open: { label: "Open", className: "bg-info/20 text-info border-info/30" },
  in_progress: { label: "In Progress", className: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
  won: { label: "Won", className: "bg-success/20 text-success border-success/30" },
  lost: { label: "Lost", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const priorityConfig = {
  urgent: { label: "Urgent", className: "bg-destructive/20 text-destructive border-destructive/30" },
  high: { label: "High", className: "bg-warning/20 text-warning border-warning/30" },
  medium: { label: "Medium", className: "bg-info/20 text-info border-info/30" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

const Cases = () => {
  const { cases, loading, createCase, updateCase, deleteCase } = useCases();
  const { clients } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CreateCaseData>({
    title: "",
    description: "",
    case_type: "",
    status: "open",
    priority: "medium",
    next_hearing_date: "",
    court_name: "",
    judge_name: "",
    opposing_party: "",
    opposing_counsel: "",
    notes: "",
    client_id: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      case_type: "",
      status: "open",
      priority: "medium",
      next_hearing_date: "",
      court_name: "",
      judge_name: "",
      opposing_party: "",
      opposing_counsel: "",
      notes: "",
      client_id: "",
    });
  };

  const handleCreateCase = async () => {
    if (!formData.title) return;
    
    setIsSaving(true);
    const result = await createCase({
      ...formData,
      client_id: formData.client_id || undefined,
      next_hearing_date: formData.next_hearing_date || undefined,
    });
    setIsSaving(false);
    
    if (result) {
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleUpdateCase = async () => {
    if (!selectedCase) return;
    
    setIsSaving(true);
    const result = await updateCase(selectedCase.id, {
      ...formData,
      client_id: formData.client_id || undefined,
      next_hearing_date: formData.next_hearing_date || undefined,
    });
    setIsSaving(false);
    
    if (result) {
      setIsEditOpen(false);
      setSelectedCase(null);
      resetForm();
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    await deleteCase(caseId);
  };

  const openEditDialog = (caseItem: CaseData) => {
    setSelectedCase(caseItem);
    setFormData({
      title: caseItem.title,
      description: caseItem.description || "",
      case_type: caseItem.case_type || "",
      status: caseItem.status,
      priority: caseItem.priority,
      next_hearing_date: caseItem.next_hearing_date || "",
      court_name: caseItem.court_name || "",
      judge_name: caseItem.judge_name || "",
      opposing_party: caseItem.opposing_party || "",
      opposing_counsel: caseItem.opposing_counsel || "",
      notes: caseItem.notes || "",
      client_id: caseItem.client_id || "",
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (caseItem: CaseData) => {
    setSelectedCase(caseItem);
    setIsViewOpen(true);
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.client?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.case_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === "open" || c.status === "in_progress").length,
    pending: cases.filter((c) => c.status === "pending").length,
    closed: cases.filter((c) => c.status === "closed" || c.status === "won" || c.status === "lost").length,
  };

  const CaseForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Case Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Smith vs. Johnson Corp"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Client</Label>
          <Select value={formData.client_id || ""} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Case Type</Label>
          <Select value={formData.case_type || ""} onValueChange={(v) => setFormData({ ...formData, case_type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {caseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v: any) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextHearing">Next Hearing Date</Label>
          <Input
            id="nextHearing"
            type="date"
            value={formData.next_hearing_date || ""}
            onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="courtName">Court Name</Label>
          <Input
            id="courtName"
            placeholder="e.g., Supreme Court"
            value={formData.court_name || ""}
            onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="judgeName">Judge Name</Label>
          <Input
            id="judgeName"
            placeholder="e.g., Hon. John Doe"
            value={formData.judge_name || ""}
            onChange={(e) => setFormData({ ...formData, judge_name: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opposingParty">Opposing Party</Label>
          <Input
            id="opposingParty"
            placeholder="e.g., XYZ Corporation"
            value={formData.opposing_party || ""}
            onChange={(e) => setFormData({ ...formData, opposing_party: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opposingCounsel">Opposing Counsel</Label>
          <Input
            id="opposingCounsel"
            placeholder="e.g., Jane Smith"
            value={formData.opposing_counsel || ""}
            onChange={(e) => setFormData({ ...formData, opposing_counsel: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Case details..."
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-card">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            if (isEdit) setIsEditOpen(false);
            else setIsCreateOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gradient-gold text-primary-foreground"
          onClick={isEdit ? handleUpdateCase : handleCreateCase}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Update Case" : "Create Case"}
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">কেস ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground">আপনার আইনি মামলা পরিচালনা করুন</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-gold text-primary-foreground shadow-gold w-full">
                <Plus className="w-4 h-4 mr-2" />
                নতুন কেস
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-hidden mx-4">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">নতুন কেস তৈরি করুন</DialogTitle>
              </DialogHeader>
              <CaseForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">মোট</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/20">
                <Clock className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.open}</p>
                <p className="text-xs text-muted-foreground">সক্রিয়</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/20">
                <Calendar className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">বিচারাধীন</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.closed}</p>
                <p className="text-xs text-muted-foreground">সমাপ্ত</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-3">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="কেস খুঁজুন..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                  <SelectItem value="open">ওপেন</SelectItem>
                  <SelectItem value="in_progress">চলমান</SelectItem>
                  <SelectItem value="pending">বিচারাধীন</SelectItem>
                  <SelectItem value="closed">সমাপ্ত</SelectItem>
                  <SelectItem value="won">জয়ী</SelectItem>
                  <SelectItem value="lost">পরাজিত</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="ধরন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ধরন</SelectItem>
                  {caseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cases List - Mobile Card View */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="glass-card text-center py-12">
              <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-base font-medium text-foreground mb-1">কোনো কেস পাওয়া যায়নি</h3>
              <p className="text-sm text-muted-foreground">প্রথম কেস তৈরি করুন</p>
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="glass-card p-3 active:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{caseItem.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{caseItem.case_number}</p>
                    {caseItem.client?.name && (
                      <p className="text-xs text-muted-foreground mt-1">{caseItem.client.name}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(caseItem)}>
                        <Eye className="w-4 h-4 mr-2" />
                        বিস্তারিত
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(caseItem)}>
                        <Edit className="w-4 h-4 mr-2" />
                        সম্পাদনা
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteCase(caseItem.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        মুছুন
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", statusConfig[caseItem.status]?.className)}
                  >
                    {statusConfig[caseItem.status]?.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", priorityConfig[caseItem.priority]?.className)}
                  >
                    {priorityConfig[caseItem.priority]?.label}
                  </Badge>
                  {caseItem.next_hearing_date && (
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(caseItem.next_hearing_date), "d MMM")}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {selectedCase?.case_number}
            </DialogTitle>
          </DialogHeader>
          {selectedCase && <CaseDetailView caseData={selectedCase} />}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">কেস সম্পাদনা</DialogTitle>
          </DialogHeader>
          <CaseForm isEdit />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Cases;
