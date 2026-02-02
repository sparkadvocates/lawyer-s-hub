import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import {
  Database,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  HardDrive,
  Cloud,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileJson,
  FileCode,
  Settings,
  ExternalLink,
  Key,
  FolderOpen,
  Save,
  Zap,
  Calendar,
  RefreshCw,
  Activity,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useBackup } from "@/hooks/useBackup";

const Backup = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportFormat, setExportFormat] = useState<"json" | "sql">("sql");
  const [driveClientId, setDriveClientId] = useState("");
  const [driveApiKey, setDriveApiKey] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");
  const [scheduledBackupEnabled, setScheduledBackupEnabled] = useState(false);
  const [scheduledBackupTime, setScheduledBackupTime] = useState("02:00");
  const [realtimeBackupEnabled, setRealtimeBackupEnabled] = useState(true);
  const [maxBackups, setMaxBackups] = useState(20);

  const {
    isExporting,
    isImporting,
    isUploadingToDrive,
    isAutoBackupActive,
    backups,
    googleDriveConfig,
    lastBackupTime,
    loadLocalBackups,
    exportBackup,
    importBackup,
    restoreFromLocal,
    deleteLocalBackup,
    saveGoogleDriveConfig,
    uploadToGoogleDrive,
  } = useBackup();

  useEffect(() => {
    loadLocalBackups();
  }, []);

  useEffect(() => {
    if (googleDriveConfig) {
      setDriveClientId(googleDriveConfig.clientId || "");
      setDriveApiKey(googleDriveConfig.apiKey || "");
      setDriveFolderId(googleDriveConfig.folderId || "");
      setScheduledBackupEnabled(googleDriveConfig.scheduledBackupEnabled || false);
      setScheduledBackupTime(googleDriveConfig.scheduledBackupTime || "02:00");
      setRealtimeBackupEnabled(googleDriveConfig.realtimeBackupEnabled ?? true);
      setMaxBackups(googleDriveConfig.maxBackups || 20);
    }
  }, [googleDriveConfig]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importBackup(file);
      if (success) {
        window.location.reload();
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRestore = async (backupId: string) => {
    const success = await restoreFromLocal(backupId);
    if (success) {
      window.location.reload();
    }
  };

  const handleSaveGoogleDriveConfig = () => {
    saveGoogleDriveConfig({
      clientId: driveClientId,
      apiKey: driveApiKey,
      folderId: driveFolderId,
      autoBackupEnabled: scheduledBackupEnabled || realtimeBackupEnabled,
      scheduledBackupEnabled,
      scheduledBackupTime,
      realtimeBackupEnabled,
      maxBackups,
    });
  };

  const allTables = [
    { name: "cases", label: "মামলা", icon: "⚖️" },
    { name: "clients", label: "মক্কেল", icon: "👥" },
    { name: "checks", label: "চেক", icon: "📝" },
    { name: "case_timeline", label: "মামলা টাইমলাইন", icon: "📅" },
    { name: "case_documents", label: "ডকুমেন্ট", icon: "📁" },
    { name: "notifications", label: "নোটিফিকেশন", icon: "🔔" },
    { name: "profiles", label: "প্রোফাইল", icon: "👤" },
    { name: "user_subscriptions", label: "সাবস্ক্রিপশন", icon: "💳" },
    { name: "payment_history", label: "পেমেন্ট ইতিহাস", icon: "💰" },
    { name: "activity_logs", label: "অ্যাক্টিভিটি লগ", icon: "📊" },
  ];

  const driveBackupCount = backups.filter(b => b.type === "google_drive").length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-16 md:ml-0">
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  ডাটাবেস ব্যাকআপ ও রিস্টোর
                </h1>
                <p className="text-muted-foreground mt-1">
                  সম্পূর্ণ ডাটাবেস ব্যাকআপ, রিস্টোর এবং Google Drive অটো-সিঙ্ক
                </p>
              </div>
              {isAutoBackupActive && (
                <Badge variant="outline" className="gap-2 animate-pulse bg-primary/10">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  অটো-ব্যাকআপ চলছে...
                </Badge>
              )}
            </div>

            {/* Status Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">শেষ ব্যাকআপ</p>
                      <p className="font-semibold">
                        {lastBackupTime
                          ? format(new Date(lastBackupTime), "dd MMM, hh:mm a", { locale: bn })
                          : "কখনো হয়নি"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-info/10">
                      <Cloud className="w-6 h-6 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Drive ব্যাকআপ</p>
                      <p className="font-semibold">{driveBackupCount} / {maxBackups}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${realtimeBackupEnabled ? "bg-success/10" : "bg-muted"}`}>
                      <Activity className={`w-6 h-6 ${realtimeBackupEnabled ? "text-success" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">রিয়েলটাইম ব্যাকআপ</p>
                      <p className="font-semibold">{realtimeBackupEnabled ? "সক্রিয়" : "নিষ্ক্রিয়"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database Tables Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  ব্যাকআপে অন্তর্ভুক্ত টেবিল
                </CardTitle>
                <CardDescription>
                  নিম্নলিখিত সমস্ত ডাটাবেস টেবিল ব্যাকআপে সংরক্ষিত হবে
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {allTables.map((table) => (
                    <div
                      key={table.name}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <span className="text-lg">{table.icon}</span>
                      <span className="text-sm font-medium">{table.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="local" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="local" className="gap-2">
                  <HardDrive className="w-4 h-4" />
                  লোকাল ব্যাকআপ
                </TabsTrigger>
                <TabsTrigger value="gdrive" className="gap-2">
                  <Cloud className="w-4 h-4" />
                  Google Drive অটো-ব্যাকআপ
                </TabsTrigger>
              </TabsList>

              {/* Local Backup Tab */}
              <TabsContent value="local" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Export Card */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary" />
                        ব্যাকআপ তৈরি করুন
                      </CardTitle>
                      <CardDescription>
                        সম্পূর্ণ ডাটাবেস SQL বা JSON ফরম্যাটে ডাউনলোড করুন
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>ফরম্যাট নির্বাচন করুন</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={exportFormat === "sql" ? "default" : "outline"}
                            className="flex-1 gap-2"
                            onClick={() => setExportFormat("sql")}
                          >
                            <FileCode className="w-4 h-4" />
                            SQL
                          </Button>
                          <Button
                            variant={exportFormat === "json" ? "default" : "outline"}
                            className="flex-1 gap-2"
                            onClick={() => setExportFormat("json")}
                          >
                            <FileJson className="w-4 h-4" />
                            JSON
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {exportFormat === "sql"
                            ? "SQL ফরম্যাট সরাসরি ডাটাবেসে ইম্পোর্ট করা যায়"
                            : "JSON ফরম্যাট এই অ্যাপে রিস্টোর করা যায়"}
                        </p>
                      </div>
                      <Button
                        className="w-full gradient-gold text-primary-foreground"
                        onClick={() => exportBackup(exportFormat)}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ব্যাকআপ হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            {exportFormat.toUpperCase()} ব্যাকআপ ডাউনলোড করুন
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Import Card */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-info" />
                        ব্যাকআপ রিস্টোর করুন
                      </CardTitle>
                      <CardDescription>
                        আগের ব্যাকআপ ফাইল থেকে সমস্ত ডাটা পুনরুদ্ধার করুন
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-warning">
                        <AlertCircle className="w-4 h-4" />
                        <span>সতর্কতা: বর্তমান ডাটা প্রতিস্থাপিত হবে</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            রিস্টোর হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            JSON ফাইল আপলোড করুন
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        শুধুমাত্র JSON ফরম্যাট রিস্টোর সাপোর্টেড
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Google Drive Tab */}
              <TabsContent value="gdrive" className="space-y-6">
                {/* Auto Backup Settings */}
                <Card className="glass-card border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      অটো-ব্যাকআপ সেটিংস
                    </CardTitle>
                    <CardDescription>
                      স্বয়ংক্রিয় ব্যাকআপের জন্য নিয়ম নির্ধারণ করুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Realtime Backup */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-success" />
                          <Label className="font-semibold">রিয়েলটাইম ব্যাকআপ</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          যেকোনো নতুন মামলা, চেক বা ডাটা এন্ট্রি হলে সাথে সাথে ব্যাকআপ হবে
                        </p>
                      </div>
                      <Switch 
                        checked={realtimeBackupEnabled} 
                        onCheckedChange={setRealtimeBackupEnabled} 
                      />
                    </div>

                    {/* Scheduled Daily Backup */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-info/5 border border-info/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-info" />
                          <Label className="font-semibold">দৈনিক নির্ধারিত ব্যাকআপ</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          প্রতিদিন নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে ব্যাকআপ হবে
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="time"
                          value={scheduledBackupTime}
                          onChange={(e) => setScheduledBackupTime(e.target.value)}
                          className="w-32"
                          disabled={!scheduledBackupEnabled}
                        />
                        <Switch 
                          checked={scheduledBackupEnabled} 
                          onCheckedChange={setScheduledBackupEnabled} 
                        />
                      </div>
                    </div>

                    {/* Max Backups */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <Label className="font-semibold">সর্বোচ্চ ব্যাকআপ সংখ্যা</Label>
                        <p className="text-xs text-muted-foreground">
                          এই সংখ্যার বেশি হলে পুরাতন ব্যাকআপ স্বয়ংক্রিয়ভাবে মুছে যাবে
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={5}
                        max={50}
                        value={maxBackups}
                        onChange={(e) => setMaxBackups(parseInt(e.target.value) || 20)}
                        className="w-20 text-center"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Google Drive API Configuration */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Google Drive API কনফিগারেশন
                    </CardTitle>
                    <CardDescription>
                      অটোমেটিক ব্যাকআপের জন্য Google Cloud Console থেকে API কী সেটআপ করুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Setup Instructions */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="setup">
                        <AccordionTrigger className="text-primary">
                          📖 Google Drive API সেটআপ গাইড (ক্লিক করুন)
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 text-sm">
                          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold">ধাপ ১: Google Cloud Console এ প্রজেক্ট তৈরি</h4>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                              <li>
                                <a
                                  href="https://console.cloud.google.com/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                                </a>
                                {" "}এ যান
                              </li>
                              <li>নতুন প্রজেক্ট তৈরি করুন বা বিদ্যমান প্রজেক্ট সিলেক্ট করুন</li>
                              <li>"APIs & Services" → "Library" এ যান</li>
                              <li>"Google Drive API" সার্চ করে Enable করুন</li>
                            </ol>
                          </div>

                          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold">ধাপ ২: OAuth Credentials তৈরি</h4>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                              <li>"APIs & Services" → "Credentials" এ যান</li>
                              <li>"Create Credentials" → "OAuth client ID" সিলেক্ট করুন</li>
                              <li>Application type: "Web application" সিলেক্ট করুন</li>
                              <li>Authorized JavaScript origins এ আপনার সাইটের URL দিন</li>
                              <li>Client ID কপি করুন</li>
                            </ol>
                          </div>

                          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold">ধাপ ৩: API Key তৈরি</h4>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                              <li>"Create Credentials" → "API key" সিলেক্ট করুন</li>
                              <li>API key কপি করুন</li>
                              <li>"Edit API key" → "Application restrictions" এ HTTP referrers সেট করুন</li>
                              <li>"API restrictions" এ Google Drive API সিলেক্ট করুন</li>
                            </ol>
                          </div>

                          <div className="space-y-3 p-4 bg-info/10 border border-info/30 rounded-lg">
                            <h4 className="font-semibold text-info">💡 টিপস</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              <li>ফোল্ডার ID পেতে Google Drive এ ফোল্ডার খুলুন, URL এর শেষ অংশ হল ID</li>
                              <li>OAuth consent screen সেটআপ করতে ভুলবেন না</li>
                              <li>টেস্ট মোডে আপনার ইমেইল টেস্ট ইউজার হিসেবে যোগ করুন</li>
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Configuration Form */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Client ID
                        </Label>
                        <Input
                          placeholder="xxxxx.apps.googleusercontent.com"
                          value={driveClientId}
                          onChange={(e) => setDriveClientId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          API Key
                        </Label>
                        <Input
                          placeholder="AIzaSy..."
                          value={driveApiKey}
                          onChange={(e) => setDriveApiKey(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Folder ID (ঐচ্ছিক - নির্দিষ্ট ফোল্ডারে ব্যাকআপ রাখতে)
                        </Label>
                        <Input
                          placeholder="1abc2def3ghi..."
                          value={driveFolderId}
                          onChange={(e) => setDriveFolderId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleSaveGoogleDriveConfig}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        সেটিংস সংরক্ষণ করুন
                      </Button>
                      <Button
                        className="flex-1 gradient-gold text-primary-foreground"
                        onClick={() => uploadToGoogleDrive(exportFormat)}
                        disabled={isUploadingToDrive || !driveClientId || !driveApiKey}
                      >
                        {isUploadingToDrive ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            আপলোড হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Cloud className="w-4 h-4 mr-2" />
                            এখনই ব্যাকআপ করুন
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Backup History */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  ব্যাকআপ ইতিহাস
                </CardTitle>
                <CardDescription>
                  সাম্প্রতিক ব্যাকআপগুলো (লোকাল: সর্বোচ্চ ১০টি, Drive: সর্বোচ্চ {maxBackups}টি)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>কোনো ব্যাকআপ পাওয়া যায়নি</p>
                    <p className="text-sm">প্রথম ব্যাকআপ তৈরি করুন</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>নাম</TableHead>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>সাইজ</TableHead>
                        <TableHead>ফরম্যাট</TableHead>
                        <TableHead>উৎস</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {backup.format === "sql" ? (
                                <FileCode className="w-4 h-4 text-primary" />
                              ) : (
                                <FileJson className="w-4 h-4 text-info" />
                              )}
                              {backup.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(backup.created_at), "dd MMM yyyy, hh:mm a", {
                              locale: bn,
                            })}
                          </TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {backup.format?.toUpperCase() || "JSON"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`gap-1 ${backup.type === "google_drive" ? "text-info border-info/50" : ""}`}
                            >
                              {backup.type === "google_drive" ? (
                                <>
                                  <Cloud className="w-3 h-3" />
                                  Drive
                                </>
                              ) : (
                                <>
                                  <HardDrive className="w-3 h-3" />
                                  লোকাল
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {backup.type === "local" && backup.format !== "sql" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>রিস্টোর নিশ্চিত করুন</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        এই ব্যাকআপ রিস্টোর করলে বর্তমান সমস্ত ডাটা মুছে যাবে এবং ব্যাকআপের ডাটা দিয়ে প্রতিস্থাপিত হবে।
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRestore(backup.id)}
                                        className="bg-primary"
                                      >
                                        রিস্টোর করুন
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>ব্যাকআপ মুছে ফেলুন</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      এই ব্যাকআপটি স্থায়ীভাবে মুছে যাবে।
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteLocalBackup(backup.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      মুছে ফেলুন
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <div className="bg-info/10 border border-info/30 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">অটো-ব্যাকআপ সম্পর্কে</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• <strong>রিয়েলটাইম ব্যাকআপ:</strong> মামলা, চেক, মক্কেল ইত্যাদি যোগ/পরিবর্তন হলে সাথে সাথে ব্যাকআপ</li>
                    <li>• <strong>দৈনিক ব্যাকআপ:</strong> আপনার নির্ধারিত সময়ে প্রতিদিন একবার ব্যাকআপ</li>
                    <li>• সর্বোচ্চ {maxBackups}টি ব্যাকআপ Google Drive এ সংরক্ষিত থাকবে</li>
                    <li>• পুরাতন ব্যাকআপ স্বয়ংক্রিয়ভাবে মুছে যাবে</li>
                    <li>• অ্যাপ চালু থাকলে অটো-ব্যাকআপ কাজ করবে</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Backup;
