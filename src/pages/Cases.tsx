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
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
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
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col pl-16 md:pl-0">
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Cases</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your legal cases and matters</p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="font-display text-lg sm:text-xl">Create New Case</DialogTitle>
                  </DialogHeader>
                  <CaseForm />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-success/20">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.open}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-warning/20">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.closed}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Case Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
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

            {/* Cases Table */}
            <div className="glass-card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No cases found</h3>
                  <p className="text-muted-foreground">Create your first case to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Next Hearing</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-mono text-sm">{caseItem.case_number}</TableCell>
                        <TableCell className="font-medium">{caseItem.title}</TableCell>
                        <TableCell>{caseItem.client?.name || "-"}</TableCell>
                        <TableCell>{caseItem.case_type || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[caseItem.status]?.className}
                          >
                            {statusConfig[caseItem.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={priorityConfig[caseItem.priority]?.className}
                          >
                            {priorityConfig[caseItem.priority]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {caseItem.next_hearing_date
                            ? format(new Date(caseItem.next_hearing_date), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(caseItem)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(caseItem)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCase(caseItem.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedCase?.case_number} - {selectedCase?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedCase && <CaseDetailView caseData={selectedCase} />}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Case</DialogTitle>
          </DialogHeader>
          <CaseForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;
