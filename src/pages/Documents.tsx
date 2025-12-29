import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  FileText,
  Plus,
  Search,
  Upload,
  Folder,
  FolderOpen,
  File,
  Image,
  FileSpreadsheet,
  FileType,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Grid,
  List,
  ChevronRight,
  X,
  Briefcase,
  Clock,
  HardDrive,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "jpg" | "png" | "txt" | "other";
  size: number; // in bytes
  caseId: string;
  caseName: string;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

interface CaseFolder {
  id: string;
  name: string;
  caseNumber: string;
  documentCount: number;
  lastModified: string;
}

const mockCases: CaseFolder[] = [
  { id: "1", name: "Smith vs. Johnson Corporation", caseNumber: "CASE-2024-001", documentCount: 8, lastModified: "2024-12-28" },
  { id: "2", name: "Estate of Williams", caseNumber: "CASE-2024-002", documentCount: 5, lastModified: "2024-12-27" },
  { id: "3", name: "Thompson Criminal Defense", caseNumber: "CASE-2024-003", documentCount: 12, lastModified: "2024-12-28" },
  { id: "4", name: "Garcia Immigration Appeal", caseNumber: "CASE-2024-004", documentCount: 3, lastModified: "2024-12-26" },
  { id: "5", name: "Chen Contract Dispute", caseNumber: "CASE-2024-005", documentCount: 6, lastModified: "2024-12-25" },
];

const categories = [
  "Contracts",
  "Court Filings",
  "Correspondence",
  "Evidence",
  "Financial Records",
  "Legal Research",
  "Client Documents",
  "Internal Notes",
  "Other",
];

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "Contract Agreement.pdf",
    type: "pdf",
    size: 2457600,
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    category: "Contracts",
    uploadedAt: "2024-01-15T10:30:00",
    uploadedBy: "Sarah Mitchell",
    description: "Original contract between parties",
  },
  {
    id: "2",
    name: "Evidence Photos.jpg",
    type: "jpg",
    size: 15728640,
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    category: "Evidence",
    uploadedAt: "2024-02-10T14:20:00",
    uploadedBy: "James Wilson",
  },
  {
    id: "3",
    name: "Motion to Dismiss.docx",
    type: "docx",
    size: 524288,
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    category: "Court Filings",
    uploadedAt: "2024-03-05T09:00:00",
    uploadedBy: "Sarah Mitchell",
  },
  {
    id: "4",
    name: "Will Document.pdf",
    type: "pdf",
    size: 1153433,
    caseId: "2",
    caseName: "Estate of Williams",
    category: "Client Documents",
    uploadedAt: "2024-02-20T11:00:00",
    uploadedBy: "Emily Chen",
    description: "Last will and testament",
  },
  {
    id: "5",
    name: "Asset Inventory.xlsx",
    type: "xlsx",
    size: 890880,
    caseId: "2",
    caseName: "Estate of Williams",
    category: "Financial Records",
    uploadedAt: "2024-02-25T16:30:00",
    uploadedBy: "Emily Chen",
  },
  {
    id: "6",
    name: "Police Report.pdf",
    type: "pdf",
    size: 3932160,
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    category: "Evidence",
    uploadedAt: "2024-03-05T08:00:00",
    uploadedBy: "Sarah Mitchell",
  },
  {
    id: "7",
    name: "Witness Statements.pdf",
    type: "pdf",
    size: 2202009,
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    category: "Evidence",
    uploadedAt: "2024-04-15T10:00:00",
    uploadedBy: "James Wilson",
  },
  {
    id: "8",
    name: "Financial Records.xlsx",
    type: "xlsx",
    size: 912384,
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    category: "Financial Records",
    uploadedAt: "2024-03-10T14:00:00",
    uploadedBy: "Emily Chen",
  },
  {
    id: "9",
    name: "Visa Application.pdf",
    type: "pdf",
    size: 1048576,
    caseId: "4",
    caseName: "Garcia Immigration Appeal",
    category: "Court Filings",
    uploadedAt: "2024-04-10T09:30:00",
    uploadedBy: "Lisa Rodriguez",
  },
  {
    id: "10",
    name: "Settlement Agreement.pdf",
    type: "pdf",
    size: 1572864,
    caseId: "5",
    caseName: "Chen Contract Dispute",
    category: "Contracts",
    uploadedAt: "2024-06-20T15:00:00",
    uploadedBy: "Sarah Mitchell",
    description: "Final settlement terms",
  },
  {
    id: "11",
    name: "Case Research Notes.txt",
    type: "txt",
    size: 51200,
    caseId: "3",
    caseName: "Thompson Criminal Defense",
    category: "Legal Research",
    uploadedAt: "2024-03-20T11:00:00",
    uploadedBy: "James Wilson",
  },
  {
    id: "12",
    name: "Client Correspondence.docx",
    type: "docx",
    size: 307200,
    caseId: "1",
    caseName: "Smith vs. Johnson Corporation",
    category: "Correspondence",
    uploadedAt: "2024-04-01T13:00:00",
    uploadedBy: "Emily Chen",
  },
];

const getFileIcon = (type: Document["type"]) => {
  switch (type) {
    case "pdf":
      return { icon: FileText, className: "text-destructive" };
    case "doc":
    case "docx":
      return { icon: FileType, className: "text-info" };
    case "xls":
    case "xlsx":
      return { icon: FileSpreadsheet, className: "text-success" };
    case "jpg":
    case "png":
      return { icon: Image, className: "text-warning" };
    default:
      return { icon: File, className: "text-muted-foreground" };
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadData, setUploadData] = useState({
    caseId: "",
    category: "",
    description: "",
    files: [] as File[],
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadData({ ...uploadData, files: Array.from(e.target.files) });
    }
  };

  const handleUpload = () => {
    if (!uploadData.caseId || !uploadData.category || uploadData.files.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a case, category, and files to upload.",
        variant: "destructive",
      });
      return;
    }

    const selectedCaseData = mockCases.find((c) => c.id === uploadData.caseId);
    if (!selectedCaseData) return;

    const newDocuments: Document[] = uploadData.files.map((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "other";
      return {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png", "txt"].includes(extension)
          ? (extension as Document["type"])
          : "other",
        size: file.size,
        caseId: uploadData.caseId,
        caseName: selectedCaseData.name,
        category: uploadData.category,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Current User",
        description: uploadData.description,
      };
    });

    setDocuments([...newDocuments, ...documents]);
    setIsUploadOpen(false);
    setUploadData({ caseId: "", category: "", description: "", files: [] });

    toast({
      title: "Upload Successful",
      description: `${newDocuments.length} file(s) uploaded successfully.`,
    });
  };

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId));
    toast({
      title: "Document Deleted",
      description: "The document has been removed.",
    });
  };

  const openPreview = (doc: Document) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  const filteredDocuments = documents.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCase = selectedCase === "all" || d.caseId === selectedCase;
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    const matchesFolder = currentFolder ? d.caseId === currentFolder : true;
    return matchesSearch && matchesCase && matchesCategory && matchesFolder;
  });

  const totalSize = documents.reduce((acc, d) => acc + d.size, 0);
  const recentDocuments = [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  ).slice(0, 5);

  const documentsByCase = mockCases.map((c) => ({
    ...c,
    documents: documents.filter((d) => d.caseId === c.id),
    totalSize: documents.filter((d) => d.caseId === c.id).reduce((acc, d) => acc + d.size, 0),
  }));

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
                <h1 className="text-3xl font-display font-bold text-foreground">Documents</h1>
                <p className="text-muted-foreground mt-1">Manage and organize your legal documents</p>
              </div>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-primary-foreground shadow-gold">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Upload Documents</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Select Case *</Label>
                      <Select value={uploadData.caseId} onValueChange={(v) => setUploadData({ ...uploadData, caseId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a case" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCases.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={uploadData.category} onValueChange={(v) => setUploadData({ ...uploadData, category: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Brief description of the document(s)"
                        value={uploadData.description}
                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Files *</Label>
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                          "hover:border-primary/50 hover:bg-secondary/30",
                          uploadData.files.length > 0 ? "border-primary/50 bg-primary/5" : "border-border"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                        {uploadData.files.length > 0 ? (
                          <div>
                            <p className="font-medium text-foreground">{uploadData.files.length} file(s) selected</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadData.files.reduce((acc, f) => acc + f.size, 0))}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-muted-foreground">Click to select files or drag and drop</p>
                            <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, XLS, JPG, PNG</p>
                          </div>
                        )}
                      </div>
                      {uploadData.files.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {uploadData.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded">
                              <span className="truncate">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadData({
                                    ...uploadData,
                                    files: uploadData.files.filter((_, i) => i !== index),
                                  });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setIsUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1 gradient-gold text-primary-foreground" onClick={handleUpload}>
                        Upload
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                    <p className="text-sm text-muted-foreground">Total Files</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Folder className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mockCases.length}</p>
                    <p className="text-sm text-muted-foreground">Case Folders</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <HardDrive className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatFileSize(totalSize)}</p>
                    <p className="text-sm text-muted-foreground">Total Storage</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{recentDocuments.length}</p>
                    <p className="text-sm text-muted-foreground">Recent Uploads</p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="browse" className="space-y-6">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="browse">Browse Files</TabsTrigger>
                <TabsTrigger value="folders">Case Folders</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4">
                {/* Filters */}
                <div className="glass-card p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={selectedCase} onValueChange={setSelectedCase}>
                      <SelectTrigger className="w-full sm:w-56">
                        <SelectValue placeholder="Filter by case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cases</SelectItem>
                        {mockCases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Breadcrumb */}
                {currentFolder && (
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => setCurrentFolder(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Documents
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">
                      {mockCases.find((c) => c.id === currentFolder)?.name}
                    </span>
                  </div>
                )}

                {/* Documents Grid/List */}
                {viewMode === "grid" ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => {
                        const { icon: FileIcon, className: iconClass } = getFileIcon(doc.type);
                        return (
                          <div
                            key={doc.id}
                            className="glass-card p-4 hover:border-primary/30 transition-all group cursor-pointer"
                            onClick={() => openPreview(doc)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={cn("p-3 rounded-lg bg-secondary/50", iconClass)}>
                                <FileIcon className="w-6 h-6" />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openPreview(doc); }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <h3 className="font-medium text-foreground truncate mb-1">{doc.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{formatFileSize(doc.size)}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs font-normal">
                                {doc.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(doc.uploadedAt), "MMM d")}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full glass-card p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No documents found.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-card overflow-hidden">
                    <div className="divide-y divide-border">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => {
                          const { icon: FileIcon, className: iconClass } = getFileIcon(doc.type);
                          return (
                            <div
                              key={doc.id}
                              className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                              onClick={() => openPreview(doc)}
                            >
                              <div className={cn("p-2 rounded-lg bg-secondary/50", iconClass)}>
                                <FileIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">{doc.caseName}</p>
                              </div>
                              <Badge variant="outline" className="font-normal hidden sm:inline-flex">
                                {doc.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground hidden md:block">
                                {formatFileSize(doc.size)}
                              </span>
                              <span className="text-sm text-muted-foreground hidden lg:block">
                                {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openPreview(doc); }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No documents found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="folders" className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentsByCase.map((folder) => (
                    <div
                      key={folder.id}
                      className="glass-card p-5 hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => {
                        setCurrentFolder(folder.id);
                        setSelectedCase(folder.id);
                        const tabsTrigger = document.querySelector('[data-value="browse"]') as HTMLElement;
                        tabsTrigger?.click();
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                          <FolderOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">{folder.caseNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          {folder.documents.length} files
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(folder.totalSize)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                <div className="glass-card overflow-hidden">
                  <div className="divide-y divide-border">
                    {recentDocuments.map((doc) => {
                      const { icon: FileIcon, className: iconClass } = getFileIcon(doc.type);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => openPreview(doc)}
                        >
                          <div className={cn("p-2 rounded-lg bg-secondary/50", iconClass)}>
                            <FileIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{doc.caseName}</span>
                              <span>•</span>
                              <span>Uploaded by {doc.uploadedBy}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground">{format(new Date(doc.uploadedAt), "MMM d, yyyy")}</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(doc.uploadedAt), "h:mm a")}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-3">
                  {(() => {
                    const { icon: FileIcon, className: iconClass } = getFileIcon(selectedDocument.type);
                    return (
                      <div className={cn("p-2 rounded-lg bg-secondary/50", iconClass)}>
                        <FileIcon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  {selectedDocument.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Preview Area */}
                <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center border border-border">
                  {selectedDocument.type === "jpg" || selectedDocument.type === "png" ? (
                    <div className="text-center">
                      <Image className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Image Preview</p>
                    </div>
                  ) : selectedDocument.type === "pdf" ? (
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto text-destructive mb-2" />
                      <p className="text-muted-foreground">PDF Document</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <File className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Document Preview</p>
                    </div>
                  )}
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Case</p>
                    <p className="font-medium text-foreground truncate">{selectedDocument.caseName}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium text-foreground">{selectedDocument.category}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium text-foreground">{formatFileSize(selectedDocument.size)}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Uploaded</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(selectedDocument.uploadedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {selectedDocument.description && (
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-foreground">{selectedDocument.description}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsPreviewOpen(false)}>
                    Close
                  </Button>
                  <Button className="flex-1 gradient-gold text-primary-foreground">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
