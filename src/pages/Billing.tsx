import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Eye,
  Receipt,
  CreditCard,
  Calendar,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  caseTitle: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientName: "রহমান এন্টারপ্রাইজ",
    caseTitle: "ব্যবসায়িক বিরোধ",
    amount: 50000,
    status: "paid",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    paidDate: "2024-02-10",
    description: "কনসালটেশন ফি এবং ডকুমেন্টেশন",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientName: "করিম গ্রুপ",
    caseTitle: "সম্পত্তি মামলা",
    amount: 75000,
    status: "pending",
    issueDate: "2024-02-01",
    dueDate: "2024-03-01",
    description: "মামলা পরিচালনা ফি - ১ম কিস্তি",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    clientName: "হাসান ট্রেডার্স",
    caseTitle: "চেক ডিস অনার",
    amount: 25000,
    status: "overdue",
    issueDate: "2024-01-01",
    dueDate: "2024-01-31",
    description: "লিগ্যাল নোটিশ এবং কোর্ট ফি",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    clientName: "আলম ইন্ডাস্ট্রিজ",
    caseTitle: "শ্রম আইন মামলা",
    amount: 100000,
    status: "draft",
    issueDate: "2024-02-20",
    dueDate: "2024-03-20",
    description: "পূর্ণাঙ্গ মামলা পরিচালনা",
  },
];

const Billing = () => {
  const { user } = useAuth();
  const { cases } = useCases();
  const { clients } = useClients();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    caseTitle: "",
    amount: "",
    dueDate: "",
    description: "",
  });

  // Stats calculation
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);
  const draftAmount = invoices.filter(i => i.status === "draft").reduce((sum, i) => sum + i.amount, 0);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.caseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.amount || !newInvoice.dueDate) {
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: newInvoice.clientName,
      caseTitle: newInvoice.caseTitle,
      amount: parseFloat(newInvoice.amount),
      status: "draft",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate,
      description: newInvoice.description,
    };

    setInvoices([invoice, ...invoices]);
    setNewInvoice({ clientName: "", caseTitle: "", amount: "", dueDate: "", description: "" });
    setIsDialogOpen(false);
    toast.success("ইনভয়েস তৈরি হয়েছে");
  };

  const handleStatusChange = (invoiceId: string, newStatus: Invoice["status"]) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: newStatus, paidDate: newStatus === "paid" ? new Date().toISOString().split('T')[0] : inv.paidDate }
        : inv
    ));
    toast.success("স্ট্যাটাস আপডেট হয়েছে");
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">পরিশোধিত</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">বকেয়া</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">অতিরিক্ত বকেয়া</Badge>;
      case "draft":
        return <Badge variant="outline">ড্রাফট</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">বিলিং ম্যানেজমেন্ট</h1>
                <p className="text-muted-foreground mt-1">ইনভয়েস এবং পেমেন্ট ট্র্যাকিং</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    নতুন ইনভয়েস
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>নতুন ইনভয়েস তৈরি করুন</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>ক্লায়েন্টের নাম *</Label>
                      <Select
                        value={newInvoice.clientName}
                        onValueChange={(value) => setNewInvoice({ ...newInvoice, clientName: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>মামলা</Label>
                      <Select
                        value={newInvoice.caseTitle}
                        onValueChange={(value) => setNewInvoice({ ...newInvoice, caseTitle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="মামলা নির্বাচন করুন (ঐচ্ছিক)" />
                        </SelectTrigger>
                        <SelectContent>
                          {cases.map((c) => (
                            <SelectItem key={c.id} value={c.title}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>পরিমাণ (৳) *</Label>
                        <Input
                          type="number"
                          placeholder="০"
                          value={newInvoice.amount}
                          onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>পরিশোধের শেষ তারিখ *</Label>
                        <Input
                          type="date"
                          value={newInvoice.dueDate}
                          onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>বিবরণ</Label>
                      <Textarea
                        placeholder="ইনভয়েসের বিবরণ..."
                        value={newInvoice.description}
                        onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
                      <Button onClick={handleCreateInvoice} className="gradient-gold text-primary-foreground">
                        তৈরি করুন
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">মোট আয়</p>
                      <h3 className="text-2xl font-bold text-emerald-500 mt-1">
                        {formatCurrency(totalRevenue)}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">বকেয়া</p>
                      <h3 className="text-2xl font-bold text-amber-500 mt-1">
                        {formatCurrency(pendingAmount)}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10">
                      <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">অতিরিক্ত বকেয়া</p>
                      <h3 className="text-2xl font-bold text-red-500 mt-1">
                        {formatCurrency(overdueAmount)}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-muted/50 to-muted/25 border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ড্রাফট</p>
                      <h3 className="text-2xl font-bold text-muted-foreground mt-1">
                        {formatCurrency(draftAmount)}
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-muted">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ইনভয়েস নম্বর, ক্লায়েন্ট বা মামলা খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                      <SelectItem value="paid">পরিশোধিত</SelectItem>
                      <SelectItem value="pending">বকেয়া</SelectItem>
                      <SelectItem value="overdue">অতিরিক্ত বকেয়া</SelectItem>
                      <SelectItem value="draft">ড্রাফট</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    রিপোর্ট
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  ইনভয়েস তালিকা
                </CardTitle>
                <CardDescription>
                  মোট {filteredInvoices.length}টি ইনভয়েস
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ইনভয়েস নম্বর</TableHead>
                      <TableHead>ক্লায়েন্ট</TableHead>
                      <TableHead>মামলা</TableHead>
                      <TableHead className="text-right">পরিমাণ</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell className="text-muted-foreground">{invoice.caseTitle || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>ইস্যু: {format(new Date(invoice.issueDate), "dd/MM/yyyy")}</div>
                            <div className="text-muted-foreground">
                              ডিউ: {format(new Date(invoice.dueDate), "dd/MM/yyyy")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {invoice.status !== "paid" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-500 hover:text-emerald-600"
                                onClick={() => handleStatusChange(invoice.id, "paid")}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                পেইড
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          কোনো ইনভয়েস পাওয়া যায়নি
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              ইনভয়েস বিবরণ
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{selectedInvoice.invoiceNumber}</span>
                {getStatusBadge(selectedInvoice.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">ক্লায়েন্ট</p>
                  <p className="font-medium">{selectedInvoice.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">মামলা</p>
                  <p className="font-medium">{selectedInvoice.caseTitle || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ইস্যু তারিখ</p>
                  <p className="font-medium">{format(new Date(selectedInvoice.issueDate), "dd MMMM, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ডিউ তারিখ</p>
                  <p className="font-medium">{format(new Date(selectedInvoice.dueDate), "dd MMMM, yyyy")}</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">মোট পরিমাণ</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(selectedInvoice.amount)}
                </p>
              </div>

              {selectedInvoice.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">বিবরণ</p>
                  <p className="text-foreground">{selectedInvoice.description}</p>
                </div>
              )}

              {selectedInvoice.paidDate && (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>পরিশোধ করা হয়েছে: {format(new Date(selectedInvoice.paidDate), "dd MMMM, yyyy")}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF ডাউনলোড
                </Button>
                {selectedInvoice.status !== "paid" && (
                  <Button 
                    className="gradient-gold text-primary-foreground"
                    onClick={() => {
                      handleStatusChange(selectedInvoice.id, "paid");
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    পেইড মার্ক করুন
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
