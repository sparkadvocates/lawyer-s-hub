import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, FileText, Search as SearchIcon, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CaseResult {
  id: string;
  case_number: string;
  title: string;
  status: string;
  case_type: string | null;
  client_name?: string;
}

interface ClientResult {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}

interface DocumentResult {
  id: string;
  name: string;
  category: string | null;
  file_type: string | null;
  case_title?: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = searchParams.get("q") || "";
  
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseResult[]>([]);
  const [clients, setClients] = useState<ClientResult[]>([]);
  const [documents, setDocuments] = useState<DocumentResult[]>([]);

  useEffect(() => {
    if (query && user) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query, user]);

  const performSearch = async () => {
    setLoading(true);
    const searchTerm = `%${query}%`;

    try {
      // Search cases
      const { data: casesData } = await supabase
        .from("cases")
        .select(`
          id,
          case_number,
          title,
          status,
          case_type,
          clients(name)
        `)
        .or(`title.ilike.${searchTerm},case_number.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(20);

      // Search clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, email, phone, company")
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},company.ilike.${searchTerm}`)
        .limit(20);

      // Search documents
      const { data: documentsData } = await supabase
        .from("case_documents")
        .select(`
          id,
          name,
          category,
          file_type,
          cases(title)
        `)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .limit(20);

      setCases(
        (casesData || []).map((c: any) => ({
          ...c,
          client_name: c.clients?.name,
        }))
      );
      setClients(clientsData || []);
      setDocuments(
        (documentsData || []).map((d: any) => ({
          ...d,
          case_title: d.cases?.title,
        }))
      );
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = cases.length + clients.length + documents.length;

  const statusColors: Record<string, string> = {
    open: "bg-success/20 text-success",
    in_progress: "bg-info/20 text-info",
    pending: "bg-warning/20 text-warning",
    closed: "bg-muted text-muted-foreground",
    won: "bg-success/20 text-success",
    lost: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-16 md:ml-0">
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          {/* Search Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <SearchIcon className="w-6 h-6 text-primary" />
              <h1 className="font-display text-2xl font-bold">সার্চ রেজাল্ট</h1>
            </div>
            {query && (
              <p className="text-muted-foreground">
                "<span className="text-foreground font-medium">{query}</span>" এর জন্য {totalResults} টি ফলাফল পাওয়া গেছে
              </p>
            )}
          </div>

          {!query ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">সার্চ করুন</h2>
                <p className="text-muted-foreground">
                  কেস, ক্লায়েন্ট বা ডকুমেন্ট খুঁজতে উপরের সার্চ বার ব্যবহার করুন
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  সব ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="cases">
                  <Briefcase className="w-4 h-4 mr-2" />
                  কেস ({cases.length})
                </TabsTrigger>
                <TabsTrigger value="clients">
                  <Users className="w-4 h-4 mr-2" />
                  ক্লায়েন্ট ({clients.length})
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="w-4 h-4 mr-2" />
                  ডকুমেন্ট ({documents.length})
                </TabsTrigger>
              </TabsList>

              {/* All Results */}
              <TabsContent value="all" className="space-y-6">
                {cases.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Briefcase className="w-5 h-5 text-primary" />
                          কেস
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/cases")}>
                          সব দেখুন <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cases.slice(0, 3).map((caseItem) => (
                        <div
                          key={caseItem.id}
                          className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                          onClick={() => navigate("/dashboard/cases")}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{caseItem.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {caseItem.case_number} • {caseItem.client_name || "ক্লায়েন্ট নেই"}
                              </p>
                            </div>
                            <Badge className={statusColors[caseItem.status] || "bg-muted"}>
                              {caseItem.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {clients.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="w-5 h-5 text-info" />
                          ক্লায়েন্ট
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/clients")}>
                          সব দেখুন <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {clients.slice(0, 3).map((client) => (
                        <div
                          key={client.id}
                          className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                          onClick={() => navigate("/dashboard/clients")}
                        >
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.email || client.phone || client.company || "তথ্য নেই"}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {documents.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="w-5 h-5 text-warning" />
                          ডকুমেন্ট
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/documents")}>
                          সব দেখুন <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                          onClick={() => navigate("/dashboard/documents")}
                        >
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.category || doc.file_type || "ক্যাটাগরি নেই"} {doc.case_title && `• ${doc.case_title}`}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {totalResults === 0 && (
                  <Card className="glass-card">
                    <CardContent className="p-12 text-center">
                      <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">কোন ফলাফল পাওয়া যায়নি</h2>
                      <p className="text-muted-foreground">
                        "{query}" এর জন্য কোন কেস, ক্লায়েন্ট বা ডকুমেন্ট পাওয়া যায়নি
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Cases Tab */}
              <TabsContent value="cases" className="space-y-3">
                {cases.length === 0 ? (
                  <Card className="glass-card p-8 text-center text-muted-foreground">
                    কোন কেস পাওয়া যায়নি
                  </Card>
                ) : (
                  cases.map((caseItem) => (
                    <Card
                      key={caseItem.id}
                      className="glass-card hover:bg-secondary/30 cursor-pointer transition-colors"
                      onClick={() => navigate("/dashboard/cases")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{caseItem.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {caseItem.case_number} • {caseItem.case_type || "টাইপ নেই"} • {caseItem.client_name || "ক্লায়েন্ট নেই"}
                            </p>
                          </div>
                          <Badge className={statusColors[caseItem.status] || "bg-muted"}>
                            {caseItem.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Clients Tab */}
              <TabsContent value="clients" className="space-y-3">
                {clients.length === 0 ? (
                  <Card className="glass-card p-8 text-center text-muted-foreground">
                    কোন ক্লায়েন্ট পাওয়া যায়নি
                  </Card>
                ) : (
                  clients.map((client) => (
                    <Card
                      key={client.id}
                      className="glass-card hover:bg-secondary/30 cursor-pointer transition-colors"
                      onClick={() => navigate("/dashboard/clients")}
                    >
                      <CardContent className="p-4">
                        <p className="font-medium">{client.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {client.email && <span>{client.email}</span>}
                          {client.phone && <span>{client.phone}</span>}
                          {client.company && <span>{client.company}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-3">
                {documents.length === 0 ? (
                  <Card className="glass-card p-8 text-center text-muted-foreground">
                    কোন ডকুমেন্ট পাওয়া যায়নি
                  </Card>
                ) : (
                  documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className="glass-card hover:bg-secondary/30 cursor-pointer transition-colors"
                      onClick={() => navigate("/dashboard/documents")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-warning" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.category || "ক্যাটাগরি নেই"} • {doc.file_type || "টাইপ নেই"}
                              {doc.case_title && ` • ${doc.case_title}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
