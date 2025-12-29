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
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useBackup } from "@/hooks/useBackup";

const Backup = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isExporting,
    isImporting,
    backups,
    loadLocalBackups,
    exportBackup,
    importBackup,
    restoreFromLocal,
    deleteLocalBackup,
  } = useBackup();

  useEffect(() => {
    loadLocalBackups();
  }, []);

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

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                ডাটাবেস ব্যাকআপ
              </h1>
              <p className="text-muted-foreground mt-1">
                আপনার সমস্ত ডাটা ব্যাকআপ এবং রিস্টোর করুন
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Export Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    ব্যাকআপ তৈরি করুন
                  </CardTitle>
                  <CardDescription>
                    সমস্ত মামলা, মক্কেল, চেক এবং ডকুমেন্ট ডাটা JSON ফাইলে এক্সপোর্ট করুন
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="w-4 h-4" />
                    <span>লোকাল স্টোরেজ + ডাউনলোড</span>
                  </div>
                  <Button
                    className="w-full gradient-gold text-primary-foreground"
                    onClick={exportBackup}
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
                        এখনই ব্যাকআপ নিন
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
                </CardContent>
              </Card>
            </div>

            {/* Google Drive Coming Soon */}
            <Card className="glass-card opacity-75">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-muted-foreground" />
                  Google Drive ব্যাকআপ
                  <Badge variant="outline" className="ml-2">শীঘ্রই আসছে</Badge>
                </CardTitle>
                <CardDescription>
                  স্বয়ংক্রিয় Google Drive ব্যাকআপ শীঘ্রই যোগ হবে
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Backup History */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  ব্যাকআপ ইতিহাস
                </CardTitle>
                <CardDescription>
                  সাম্প্রতিক ব্যাকআপগুলো (সর্বোচ্চ ১০টি সংরক্ষিত)
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
                        <TableHead>উৎস</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileJson className="w-4 h-4 text-primary" />
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
                            <Badge variant="outline" className="gap-1">
                              <HardDrive className="w-3 h-3" />
                              লোকাল
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
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
                                      এই প্রক্রিয়া অপরিবর্তনীয়।
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
                                      এই ব্যাকআপটি স্থায়ীভাবে মুছে যাবে। এই প্রক্রিয়া অপরিবর্তনীয়।
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
                  <p className="font-medium text-foreground mb-1">ব্যাকআপ সম্পর্কে</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• ব্যাকআপে মামলা, মক্কেল, চেক এবং টাইমলাইন ডাটা থাকে</li>
                    <li>• লোকাল স্টোরেজে সর্বোচ্চ ১০টি ব্যাকআপ সংরক্ষিত থাকে</li>
                    <li>• JSON ফাইল ডাউনলোড করে নিরাপদ স্থানে রাখুন</li>
                    <li>• রিস্টোর করার আগে বর্তমান ডাটার ব্যাকআপ নিন</li>
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
