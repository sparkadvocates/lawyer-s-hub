import { useState } from "react";
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
  Users,
  Calendar,
  Clock,
  DollarSign,
  X,
  Upload,
  UserPlus,
  ChevronDown,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
}

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  type: string;
  status: "active" | "pending" | "closed" | "on-hold";
  priority: "high" | "medium" | "low";
  openDate: string;
  nextHearing?: string;
  description: string;
  billedHours: number;
  totalValue: number;
  teamMembers: TeamMember[];
  documents: Document[];
}

const teamPool: TeamMember[] = [
  { id: "1", name: "Sarah Mitchell", role: "Senior Partner" },
  { id: "2", name: "James Wilson", role: "Associate" },
  { id: "3", name: "Emily Chen", role: "Paralegal" },
  { id: "4", name: "Michael Brown", role: "Legal Assistant" },
  { id: "5", name: "Lisa Rodriguez", role: "Junior Associate" },
];

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

const initialCases: Case[] = [
  {
    id: "1",
    caseNumber: "CASE-2024-001",
    title: "Smith vs. Johnson Corporation",
    client: "John Smith",
    type: "Civil Litigation",
    status: "active",
    priority: "high",
    openDate: "2024-01-15",
    nextHearing: "2024-12-30",
    description: "Breach of contract dispute regarding commercial real estate transaction.",
    billedHours: 45.5,
    totalValue: 15000,
    teamMembers: [teamPool[0], teamPool[2]],
    documents: [
      { id: "d1", name: "Contract Agreement.pdf", type: "PDF", uploadedAt: "2024-01-15", size: "2.4 MB" },
      { id: "d2", name: "Evidence Photos.zip", type: "ZIP", uploadedAt: "2024-02-10", size: "15.2 MB" },
    ],
  },
  {
    id: "2",
    caseNumber: "CASE-2024-002",
    title: "Estate of Williams",
    client: "Williams Family Trust",
    type: "Estate Planning",
    status: "pending",
    priority: "medium",
    openDate: "2024-02-20",
    description: "Probate administration for deceased estate valued at $2.5M.",
    billedHours: 22.0,
    totalValue: 8500,
    teamMembers: [teamPool[1], teamPool[3]],
    documents: [
      { id: "d3", name: "Will Document.pdf", type: "PDF", uploadedAt: "2024-02-20", size: "1.1 MB" },
    ],
  },
  {
    id: "3",
    caseNumber: "CASE-2024-003",
    title: "Thompson Criminal Defense",
    client: "Robert Thompson",
    type: "Criminal Defense",
    status: "active",
    priority: "high",
    openDate: "2024-03-05",
    nextHearing: "2025-01-02",
    description: "Defense against fraud charges. Multiple state investigation involved.",
    billedHours: 78.25,
    totalValue: 35000,
    teamMembers: [teamPool[0], teamPool[1], teamPool[4]],
    documents: [
      { id: "d4", name: "Police Report.pdf", type: "PDF", uploadedAt: "2024-03-05", size: "3.8 MB" },
      { id: "d5", name: "Financial Records.xlsx", type: "XLSX", uploadedAt: "2024-03-10", size: "890 KB" },
      { id: "d6", name: "Witness Statements.pdf", type: "PDF", uploadedAt: "2024-04-15", size: "2.1 MB" },
    ],
  },
  {
    id: "4",
    caseNumber: "CASE-2024-004",
    title: "Garcia Immigration Appeal",
    client: "Maria Garcia",
    type: "Immigration",
    status: "on-hold",
    priority: "medium",
    openDate: "2024-04-10",
    description: "Appeal for visa denial. Awaiting documentation from home country.",
    billedHours: 12.0,
    totalValue: 4500,
    teamMembers: [teamPool[4]],
    documents: [],
  },
  {
    id: "5",
    caseNumber: "CASE-2024-005",
    title: "Chen Contract Dispute",
    client: "Chen Enterprises LLC",
    type: "Corporate Law",
    status: "closed",
    priority: "low",
    openDate: "2024-01-08",
    description: "Successfully mediated contract dispute with vendor. Case closed with settlement.",
    billedHours: 35.0,
    totalValue: 12000,
    teamMembers: [teamPool[0], teamPool[2]],
    documents: [
      { id: "d7", name: "Settlement Agreement.pdf", type: "PDF", uploadedAt: "2024-06-20", size: "1.5 MB" },
    ],
  },
];

const statusConfig = {
  active: { label: "Active", className: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
  "on-hold": { label: "On Hold", className: "bg-info/20 text-info border-info/30" },
};

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

const Cases = () => {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    client: "",
    type: "",
    status: "active" as Case["status"],
    priority: "medium" as Case["priority"],
    description: "",
    nextHearing: "",
  });

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>([]);

  const resetForm = () => {
    setFormData({
      title: "",
      client: "",
      type: "",
      status: "active",
      priority: "medium",
      description: "",
      nextHearing: "",
    });
    setSelectedTeamMembers([]);
  };

  const handleCreateCase = () => {
    if (!formData.title || !formData.client || !formData.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newCase: Case = {
      id: Date.now().toString(),
      caseNumber: `CASE-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, "0")}`,
      title: formData.title,
      client: formData.client,
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      openDate: format(new Date(), "yyyy-MM-dd"),
      nextHearing: formData.nextHearing || undefined,
      description: formData.description,
      billedHours: 0,
      totalValue: 0,
      teamMembers: selectedTeamMembers,
      documents: [],
    };

    setCases([newCase, ...cases]);
    setIsCreateOpen(false);
    resetForm();
    toast({
      title: "Case Created",
      description: `${newCase.caseNumber} has been created successfully.`,
    });
  };

  const handleUpdateCase = () => {
    if (!selectedCase) return;

    const updatedCases = cases.map((c) =>
      c.id === selectedCase.id
        ? {
            ...c,
            title: formData.title,
            client: formData.client,
            type: formData.type,
            status: formData.status,
            priority: formData.priority,
            description: formData.description,
            nextHearing: formData.nextHearing || undefined,
            teamMembers: selectedTeamMembers,
          }
        : c
    );

    setCases(updatedCases);
    setIsEditOpen(false);
    setSelectedCase(null);
    resetForm();
    toast({
      title: "Case Updated",
      description: "The case has been updated successfully.",
    });
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(cases.filter((c) => c.id !== caseId));
    toast({
      title: "Case Deleted",
      description: "The case has been removed.",
    });
  };

  const openEditDialog = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setFormData({
      title: caseItem.title,
      client: caseItem.client,
      type: caseItem.type,
      status: caseItem.status,
      priority: caseItem.priority,
      description: caseItem.description,
      nextHearing: caseItem.nextHearing || "",
    });
    setSelectedTeamMembers(caseItem.teamMembers);
    setIsEditOpen(true);
  };

  const openViewDialog = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsViewOpen(true);
  };

  const toggleTeamMember = (member: TeamMember) => {
    if (selectedTeamMembers.find((m) => m.id === member.id)) {
      setSelectedTeamMembers(selectedTeamMembers.filter((m) => m.id !== member.id));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, member]);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: cases.length,
    active: cases.filter((c) => c.status === "active").length,
    pending: cases.filter((c) => c.status === "pending").length,
    closed: cases.filter((c) => c.status === "closed").length,
  };

  const CaseForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="client">Client Name *</Label>
          <Input
            id="client"
            placeholder="e.g., John Smith"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Case Type *</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
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
            onValueChange={(v: Case["priority"]) => setFormData({ ...formData, priority: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v: Case["status"]) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextHearing">Next Hearing Date</Label>
          <Input
            id="nextHearing"
            type="date"
            value={formData.nextHearing}
            onChange={(e) => setFormData({ ...formData, nextHearing: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Case details and notes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Assign Team Members</Label>
        <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-lg min-h-[80px]">
          {teamPool.map((member) => {
            const isSelected = selectedTeamMembers.find((m) => m.id === member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggleTeamMember(member)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  isSelected
                    ? "bg-primary/20 border border-primary/50 text-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                )}
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <span>{member.name}</span>
                {isSelected && <X className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            isEdit ? setIsEditOpen(false) : setIsCreateOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gradient-gold text-primary-foreground"
          onClick={isEdit ? handleUpdateCase : handleCreateCase}
        >
          {isEdit ? "Update Case" : "Create Case"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Cases</h1>
                <p className="text-muted-foreground mt-1">Manage all your legal cases in one place</p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Create New Case</DialogTitle>
                  </DialogHeader>
                  <CaseForm />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Cases</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Clock className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Calendar className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.closed}</p>
                    <p className="text-sm text-muted-foreground">Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
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

            {/* Cases Table */}
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Case</TableHead>
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Priority</TableHead>
                    <TableHead className="text-muted-foreground">Team</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.length > 0 ? (
                    filteredCases.map((caseItem) => (
                      <TableRow key={caseItem.id} className="border-border">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{caseItem.title}</p>
                            <p className="text-sm text-muted-foreground">{caseItem.caseNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{caseItem.client}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {caseItem.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("font-normal", statusConfig[caseItem.status].className)}>
                            {statusConfig[caseItem.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("font-normal", priorityConfig[caseItem.priority].className)}>
                            {priorityConfig[caseItem.priority].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {caseItem.teamMembers.slice(0, 3).map((member) => (
                              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                                <AvatarFallback className="text-xs bg-secondary">
                                  {member.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {caseItem.teamMembers.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">+{caseItem.teamMembers.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem onClick={() => openViewDialog(caseItem)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(caseItem)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Case
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteCase(caseItem.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Case
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No cases found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Case</DialogTitle>
          </DialogHeader>
          <CaseForm isEdit />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="font-display text-xl">{selectedCase.title}</DialogTitle>
                    <p className="text-muted-foreground mt-1">{selectedCase.caseNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={cn(statusConfig[selectedCase.status].className)}>
                      {statusConfig[selectedCase.status].label}
                    </Badge>
                    <Badge className={cn(priorityConfig[selectedCase.priority].className)}>
                      {priorityConfig[selectedCase.priority].label}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="bg-secondary/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents ({selectedCase.documents.length})</TabsTrigger>
                  <TabsTrigger value="team">Team ({selectedCase.teamMembers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium text-foreground">{selectedCase.client}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Case Type</p>
                      <p className="font-medium text-foreground">{selectedCase.type}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Opened On</p>
                      <p className="font-medium text-foreground">{format(new Date(selectedCase.openDate), "MMMM d, yyyy")}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Hearing</p>
                      <p className="font-medium text-foreground">
                        {selectedCase.nextHearing ? format(new Date(selectedCase.nextHearing), "MMMM d, yyyy") : "Not scheduled"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Billed Hours</p>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{selectedCase.billedHours}h</p>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-success" />
                        <p className="text-sm text-muted-foreground">Total Value</p>
                      </div>
                      <p className="text-2xl font-bold text-foreground">${selectedCase.totalValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-foreground">{selectedCase.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="space-y-3">
                    {selectedCase.documents.length > 0 ? (
                      selectedCase.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.size} • Uploaded {doc.uploadedAt}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No documents uploaded yet.</p>
                        <Button variant="outline" className="mt-3">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="team" className="mt-4">
                  <div className="space-y-3">
                    {selectedCase.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button
                  className="flex-1 gradient-gold text-primary-foreground"
                  onClick={() => {
                    setIsViewOpen(false);
                    openEditDialog(selectedCase);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Case
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;
