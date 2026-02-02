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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useClients, ClientData, CreateClientData } from "@/hooks/useClients";

const Clients = () => {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CreateClientData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      notes: "",
    });
  };

  const handleCreateClient = async () => {
    if (!formData.name) return;
    
    setIsSaving(true);
    const result = await createClient(formData);
    setIsSaving(false);
    
    if (result) {
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    
    setIsSaving(true);
    const result = await updateClient(selectedClient.id, formData);
    setIsSaving(false);
    
    if (result) {
      setIsEditOpen(false);
      setSelectedClient(null);
      resetForm();
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId);
  };

  const openEditDialog = (client: ClientData) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      company: client.company || "",
      notes: client.notes || "",
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (client: ClientData) => {
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const ClientForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Full name or organization"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+880 1XXX-XXXXXX"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company / Organization</Label>
        <Input
          id="company"
          placeholder="Company name (if applicable)"
          value={formData.company || ""}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Full address"
          value={formData.address || ""}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes about this client..."
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
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
          onClick={isEdit ? handleUpdateClient : handleCreateClient}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Update Client" : "Add Client"}
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
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">ক্লায়েন্ট</h1>
            <p className="text-sm text-muted-foreground">ক্লায়েন্টদের তথ্য পরিচালনা করুন</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-gold text-primary-foreground shadow-gold w-full">
                <Plus className="w-4 h-4 mr-2" />
                নতুন ক্লায়েন্ট
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">নতুন ক্লায়েন্ট যোগ করুন</DialogTitle>
              </DialogHeader>
              <ClientForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{clients.length}</p>
                <p className="text-xs text-muted-foreground">মোট</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/20">
                <Building className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {clients.filter((c) => c.company).length}
                </p>
                <p className="text-xs text-muted-foreground">কর্পোরেট</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-info/20">
                <Mail className="w-4 h-4 text-info" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {clients.filter((c) => c.email).length}
                </p>
                <p className="text-xs text-muted-foreground">ইমেইলসহ</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/20">
                <Phone className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {clients.filter((c) => c.phone).length}
                </p>
                <p className="text-xs text-muted-foreground">ফোনসহ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ক্লায়েন্ট খুঁজুন..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Clients List - Mobile Card View */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="glass-card text-center py-12">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-base font-medium text-foreground mb-1">কোনো ক্লায়েন্ট নেই</h3>
              <p className="text-sm text-muted-foreground">প্রথম ক্লায়েন্ট যোগ করুন</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div key={client.id} className="glass-card p-3 active:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{client.name}</p>
                      {client.company && (
                        <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {client.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(client)}>
                        <Eye className="w-4 h-4 mr-2" />
                        বিস্তারিত
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(client)}>
                        <Edit className="w-4 h-4 mr-2" />
                        সম্পাদনা
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        মুছুন
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">ক্লায়েন্ট বিবরণ</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {selectedClient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-semibold">{selectedClient.name}</h3>
                  {selectedClient.company && (
                    <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {selectedClient.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{selectedClient.address}</span>
                  </div>
                )}
              </div>

              {selectedClient.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">নোট</p>
                  <p className="text-sm text-foreground">{selectedClient.notes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                যোগ করা হয়েছে: {format(new Date(selectedClient.created_at), "d MMMM, yyyy")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">ক্লায়েন্ট সম্পাদনা</DialogTitle>
          </DialogHeader>
          <ClientForm isEdit />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Clients;
