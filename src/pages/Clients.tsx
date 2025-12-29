import { useState } from "react";
import { format } from "date-fns";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  MessageSquare,
  Calendar,
  Clock,
  Send,
  User,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CommunicationLog {
  id: string;
  type: "email" | "phone" | "meeting" | "note";
  subject: string;
  content: string;
  date: string;
  time: string;
}

interface CaseHistory {
  id: string;
  caseNumber: string;
  title: string;
  status: "active" | "pending" | "closed";
  openDate: string;
  closeDate?: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  clientType: "individual" | "corporate";
  status: "active" | "inactive" | "prospective";
  notes: string;
  createdAt: string;
  cases: CaseHistory[];
  communications: CommunicationLog[];
}

const initialClients: Client[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    clientType: "individual",
    status: "active",
    notes: "Referred by Michael Brown. High-value client.",
    createdAt: "2024-01-15",
    cases: [
      { id: "c1", caseNumber: "CASE-2024-001", title: "Smith vs. Johnson Corporation", status: "active", openDate: "2024-01-15" },
    ],
    communications: [
      { id: "m1", type: "phone", subject: "Initial Consultation", content: "Discussed case details and strategy.", date: "2024-01-15", time: "10:00" },
      { id: "m2", type: "email", subject: "Document Request", content: "Sent request for additional documentation.", date: "2024-01-20", time: "14:30" },
      { id: "m3", type: "meeting", subject: "Strategy Review", content: "In-person meeting to review case strategy and timeline.", date: "2024-02-05", time: "09:00" },
    ],
  },
  {
    id: "2",
    firstName: "Williams",
    lastName: "Family Trust",
    email: "trust@williamsfamily.com",
    phone: "(555) 234-5678",
    company: "Williams Family Trust",
    address: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    clientType: "corporate",
    status: "active",
    notes: "Estate planning and probate matters.",
    createdAt: "2024-02-20",
    cases: [
      { id: "c2", caseNumber: "CASE-2024-002", title: "Estate of Williams", status: "pending", openDate: "2024-02-20" },
    ],
    communications: [
      { id: "m4", type: "meeting", subject: "Estate Review", content: "Reviewed estate documents with family members.", date: "2024-02-20", time: "11:00" },
      { id: "m5", type: "email", subject: "Probate Update", content: "Sent update on probate filing status.", date: "2024-03-10", time: "16:00" },
    ],
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Thompson",
    email: "r.thompson@email.com",
    phone: "(555) 345-6789",
    address: "789 Pine Road",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    clientType: "individual",
    status: "active",
    notes: "Criminal defense case. Requires careful handling.",
    createdAt: "2024-03-05",
    cases: [
      { id: "c3", caseNumber: "CASE-2024-003", title: "Thompson Criminal Defense", status: "active", openDate: "2024-03-05" },
    ],
    communications: [
      { id: "m6", type: "phone", subject: "Urgent Call", content: "Discussed immediate legal concerns.", date: "2024-03-05", time: "08:30" },
      { id: "m7", type: "meeting", subject: "Case Preparation", content: "Prepared for upcoming court appearance.", date: "2024-03-15", time: "14:00" },
      { id: "m8", type: "note", subject: "Internal Note", content: "Client expressed concerns about timeline. Reassured about process.", date: "2024-03-20", time: "10:00" },
    ],
  },
  {
    id: "4",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@email.com",
    phone: "(555) 456-7890",
    address: "321 Elm Street",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    clientType: "individual",
    status: "active",
    notes: "Immigration appeal case. Documents pending from home country.",
    createdAt: "2024-04-10",
    cases: [
      { id: "c4", caseNumber: "CASE-2024-004", title: "Garcia Immigration Appeal", status: "pending", openDate: "2024-04-10" },
    ],
    communications: [
      { id: "m9", type: "email", subject: "Document Status", content: "Requested status update on pending documents.", date: "2024-04-15", time: "09:00" },
    ],
  },
  {
    id: "5",
    firstName: "Chen",
    lastName: "Enterprises",
    email: "legal@chenenterprises.com",
    phone: "(555) 567-8901",
    company: "Chen Enterprises LLC",
    address: "555 Corporate Blvd",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    clientType: "corporate",
    status: "inactive",
    notes: "Long-term corporate client. Contract dispute resolved.",
    createdAt: "2024-01-08",
    cases: [
      { id: "c5", caseNumber: "CASE-2024-005", title: "Chen Contract Dispute", status: "closed", openDate: "2024-01-08", closeDate: "2024-06-20" },
    ],
    communications: [
      { id: "m10", type: "meeting", subject: "Settlement Discussion", content: "Finalized settlement terms.", date: "2024-06-15", time: "10:00" },
      { id: "m11", type: "email", subject: "Case Closure", content: "Sent final documentation and invoice.", date: "2024-06-20", time: "15:00" },
    ],
  },
  {
    id: "6",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 678-9012",
    address: "888 Maple Drive",
    city: "Boston",
    state: "MA",
    zipCode: "02101",
    clientType: "individual",
    status: "prospective",
    notes: "Inquired about personal injury case. Follow-up scheduled.",
    createdAt: "2024-12-20",
    cases: [],
    communications: [
      { id: "m12", type: "phone", subject: "Initial Inquiry", content: "Discussed potential personal injury case.", date: "2024-12-20", time: "11:00" },
    ],
  },
];

const statusConfig = {
  active: { label: "Active", className: "bg-success/20 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  prospective: { label: "Prospective", className: "bg-info/20 text-info border-info/30" },
};

const caseStatusConfig = {
  active: { label: "Active", className: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
};

const commTypeConfig = {
  email: { icon: Mail, label: "Email", className: "bg-info/20 text-info" },
  phone: { icon: Phone, label: "Phone", className: "bg-success/20 text-success" },
  meeting: { icon: Users, label: "Meeting", className: "bg-primary/20 text-primary" },
  note: { icon: FileText, label: "Note", className: "bg-warning/20 text-warning" },
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCommMessage, setNewCommMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    clientType: "individual" as Client["clientType"],
    status: "prospective" as Client["status"],
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      clientType: "individual",
      status: "prospective",
      notes: "",
    });
  };

  const handleCreateClient = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
      createdAt: format(new Date(), "yyyy-MM-dd"),
      cases: [],
      communications: [],
    };

    setClients([newClient, ...clients]);
    setIsCreateOpen(false);
    resetForm();
    toast({
      title: "Client Added",
      description: `${newClient.firstName} ${newClient.lastName} has been added.`,
    });
  };

  const handleUpdateClient = () => {
    if (!selectedClient) return;

    const updatedClients = clients.map((c) =>
      c.id === selectedClient.id ? { ...c, ...formData } : c
    );

    setClients(updatedClients);
    setIsEditOpen(false);
    setSelectedClient(null);
    resetForm();
    toast({
      title: "Client Updated",
      description: "Client information has been updated.",
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter((c) => c.id !== clientId));
    toast({
      title: "Client Deleted",
      description: "The client has been removed.",
    });
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      company: client.company || "",
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      clientType: client.clientType,
      status: client.status,
      notes: client.notes,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (client: Client) => {
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  const addCommunication = () => {
    if (!selectedClient || !newCommMessage.trim()) return;

    const newComm: CommunicationLog = {
      id: Date.now().toString(),
      type: "note",
      subject: "Quick Note",
      content: newCommMessage,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
    };

    const updatedClients = clients.map((c) =>
      c.id === selectedClient.id
        ? { ...c, communications: [newComm, ...c.communications] }
        : c
    );

    setClients(updatedClients);
    setSelectedClient({ ...selectedClient, communications: [newComm, ...selectedClient.communications] });
    setNewCommMessage("");
    toast({
      title: "Note Added",
      description: "Communication log has been updated.",
    });
  };

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.clientType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    prospective: clients.filter((c) => c.status === "prospective").length,
    corporate: clients.filter((c) => c.clientType === "corporate").length,
  };

  const ClientForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Smith"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Client Type</Label>
          <Select
            value={formData.clientType}
            onValueChange={(v: Client["clientType"]) => setFormData({ ...formData, clientType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v: Client["status"]) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospective">Prospective</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.clientType === "corporate" && (
        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            placeholder="Company LLC"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Main Street"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="New York"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="NY"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            placeholder="10001"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes about the client..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
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
          onClick={isEdit ? handleUpdateClient : handleCreateClient}
        >
          {isEdit ? "Update Client" : "Add Client"}
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
                <h1 className="text-3xl font-display font-bold text-foreground">Clients</h1>
                <p className="text-muted-foreground mt-1">Manage your client relationships and communications</p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Add New Client</DialogTitle>
                  </DialogHeader>
                  <ClientForm />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <User className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <Clock className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.prospective}</p>
                    <p className="text-sm text-muted-foreground">Prospective</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Building className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.corporate}</p>
                    <p className="text-sm text-muted-foreground">Corporate</p>
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
                    placeholder="Search clients..."
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
                    <SelectItem value="prospective">Prospective</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clients Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div key={client.id} className="glass-card p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {client.firstName[0]}{client.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {client.firstName} {client.lastName}
                          </h3>
                          {client.company && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {client.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => openViewDialog(client)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(client)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {client.city}, {client.state}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("font-normal", statusConfig[client.status].className)}>
                          {statusConfig[client.status].label}
                        </Badge>
                        <Badge variant="outline" className="font-normal capitalize">
                          {client.clientType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {client.cases.length}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full glass-card p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No clients found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Client</DialogTitle>
          </DialogHeader>
          <ClientForm isEdit />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xl">
                      {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="font-display text-2xl">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </DialogTitle>
                    {selectedClient.company && (
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <Building className="w-4 h-4" />
                        {selectedClient.company}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge className={cn(statusConfig[selectedClient.status].className)}>
                        {statusConfig[selectedClient.status].label}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedClient.clientType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="bg-secondary/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cases">Cases ({selectedClient.cases.length})</TabsTrigger>
                  <TabsTrigger value="communications">Communications ({selectedClient.communications.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Contact Information
                      </h4>
                      <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedClient.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedClient.phone}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="text-foreground">
                            <p>{selectedClient.address}</p>
                            <p>{selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Client Details
                      </h4>
                      <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Client Since</p>
                          <p className="text-foreground">{format(new Date(selectedClient.createdAt), "MMMM d, yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Cases</p>
                          <p className="text-foreground">{selectedClient.cases.filter((c) => c.status === "active").length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-foreground">{selectedClient.notes || "No notes"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cases" className="mt-4">
                  <div className="space-y-3">
                    {selectedClient.cases.length > 0 ? (
                      selectedClient.cases.map((caseItem) => (
                        <div key={caseItem.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <Briefcase className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{caseItem.title}</p>
                              <p className="text-sm text-muted-foreground">{caseItem.caseNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={cn("font-normal", caseStatusConfig[caseItem.status].className)}>
                              {caseStatusConfig[caseItem.status].label}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              Opened {format(new Date(caseItem.openDate), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No cases for this client.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="mt-4">
                  {/* Add Communication */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add a quick note..."
                      value={newCommMessage}
                      onChange={(e) => setNewCommMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCommunication()}
                    />
                    <Button onClick={addCommunication} className="gradient-gold text-primary-foreground">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {selectedClient.communications.length > 0 ? (
                        selectedClient.communications.map((comm) => {
                          const config = commTypeConfig[comm.type];
                          const IconComponent = config.icon;
                          return (
                            <div key={comm.id} className="p-4 bg-secondary/30 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-lg", config.className)}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-foreground">{comm.subject}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(comm.date), "MMM d, yyyy")} at {comm.time}
                                    </p>
                                  </div>
                                  <p className="text-muted-foreground mt-1">{comm.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No communication logs yet.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
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
                    openEditDialog(selectedClient);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Client
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
