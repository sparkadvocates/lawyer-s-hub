import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  FileText,
  Plus,
  Search,
  Upload,
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
  Loader2,
  HardDrive,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDocuments, DocumentData } from "@/hooks/useDocuments";
import { useCases } from "@/hooks/useCases";

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

const getFileIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "pdf":
      return { icon: FileText, className: "text-destructive" };
    case "doc":
    case "docx":
      return { icon: FileType, className: "text-info" };
    case "xls":
    case "xlsx":
      return { icon: FileSpreadsheet, className: "text-success" };
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return { icon: Image, className: "text-warning" };
    default:
      return { icon: File, className: "text-muted-foreground" };
  }
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Documents = () => {
  const { documents, loading, uploadDocument, deleteDocument, getDocumentUrl } = useDocuments();
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleUpload = async () => {
    if (uploadData.files.length === 0) return;

    setIsUploading(true);
    
    for (const file of uploadData.files) {
      await uploadDocument(file, {
        case_id: uploadData.caseId || undefined,
        category: uploadData.category || undefined,
        description: uploadData.description || undefined,
      });
    }
    
    setIsUploading(false);
    setIsUploadOpen(false);
    setUploadData({ caseId: "", category: "", description: "", files: [] });
  };

  const handleDelete = async (doc: DocumentData) => {
    await deleteDocument(doc.id, doc.file_path);
  };

  const handleDownload = async (doc: DocumentData) => {
    const url = await getDocumentUrl(doc.file_path);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const filteredDocuments = documents.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCase = selectedCase === "all" || d.case_id === selectedCase;
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    return matchesSearch && matchesCase && matchesCategory;
  });

  const totalSize = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
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
                      <Label>Link to Case (Optional)</Label>
                      <Select value={uploadData.caseId} onValueChange={(v) => setUploadData({ ...uploadData, caseId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a case" />
                        </SelectTrigger>
                        <SelectContent>
                          {cases.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
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
                            <p className="text-muted-foreground">Click to select files</p>
                            <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, XLS, JPG, PNG</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setIsUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 gradient-gold text-primary-foreground" 
                        onClick={handleUpload}
                        disabled={isUploading || uploadData.files.length === 0}
                      >
                        {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
                    <HardDrive className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatFileSize(totalSize)}</p>
                    <p className="text-sm text-muted-foreground">Total Size</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <FileText className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {documents.filter((d) => d.file_type?.toLowerCase() === "pdf").length}
                    </p>
                    <p className="text-sm text-muted-foreground">PDF Files</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Image className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {documents.filter((d) => ["jpg", "jpeg", "png", "gif"].includes(d.file_type?.toLowerCase() || "")).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Images</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex flex-col md:flex-row gap-4">
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
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cases</SelectItem>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[180px]">
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

            {/* Documents */}
            <div className="glass-card">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
                  <p className="text-muted-foreground">Upload your first document to get started</p>
                </div>
              ) : viewMode === "list" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const fileIcon = getFileIcon(doc.file_type);
                      const FileIcon = fileIcon.icon;
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg bg-secondary/50", fileIcon.className)}>
                                <FileIcon className="w-4 h-4" />
                              </div>
                              <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{doc.case?.title || "-"}</TableCell>
                          <TableCell>
                            {doc.category && (
                              <Badge variant="outline">{doc.category}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                          <TableCell>
                            {format(new Date(doc.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(doc)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                  {filteredDocuments.map((doc) => {
                    const fileIcon = getFileIcon(doc.file_type);
                    const FileIcon = fileIcon.icon;
                    return (
                      <div
                        key={doc.id}
                        className="group relative p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                      >
                        <div className={cn("p-3 rounded-lg bg-secondary/50 mx-auto w-fit mb-3", fileIcon.className)}>
                          <FileIcon className="w-8 h-8" />
                        </div>
                        <p className="font-medium text-sm text-center truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {formatFileSize(doc.file_size)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(doc)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
      </div>
    </AppLayout>
  );
};

export default Documents;
