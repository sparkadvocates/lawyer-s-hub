import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface BackupData {
  version: string;
  created_at: string;
  user_id: string;
  data: {
    cases: any[];
    clients: any[];
    checks: any[];
    case_timeline: any[];
    case_documents: any[];
  };
}

interface BackupMeta {
  id: string;
  name: string;
  size: string;
  created_at: string;
  type: "local";
}

export const useBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const { user } = useAuth();

  const loadLocalBackups = () => {
    try {
      const stored = localStorage.getItem("law_backups_list");
      if (stored) {
        setBackups(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading backups:", error);
    }
  };

  const exportBackup = async () => {
    if (!user) {
      toast.error("অনুগ্রহ করে লগইন করুন");
      return null;
    }

    setIsExporting(true);

    try {
      // Fetch all user data
      const [casesRes, clientsRes, checksRes, timelineRes, docsRes] = await Promise.all([
        supabase.from("cases").select("*"),
        supabase.from("clients").select("*"),
        supabase.from("checks").select("*"),
        supabase.from("case_timeline").select("*"),
        supabase.from("case_documents").select("*"),
      ]);

      if (casesRes.error) throw casesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (checksRes.error) throw checksRes.error;

      const backupData: BackupData = {
        version: "1.0",
        created_at: new Date().toISOString(),
        user_id: user.id,
        data: {
          cases: casesRes.data || [],
          clients: clientsRes.data || [],
          checks: checksRes.data || [],
          case_timeline: timelineRes.data || [],
          case_documents: docsRes.data || [],
        },
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      
      // Save to local storage for backup list
      const backupId = `backup_${Date.now()}`;
      const backupMeta: BackupMeta = {
        id: backupId,
        name: `ব্যাকআপ - ${new Date().toLocaleDateString("bn-BD")}`,
        size: formatBytes(blob.size),
        created_at: new Date().toISOString(),
        type: "local",
      };

      // Save backup data
      localStorage.setItem(backupId, jsonString);

      // Update backup list
      const existingList = localStorage.getItem("law_backups_list");
      const backupsList: BackupMeta[] = existingList ? JSON.parse(existingList) : [];
      backupsList.unshift(backupMeta);
      localStorage.setItem("law_backups_list", JSON.stringify(backupsList.slice(0, 10))); // Keep last 10

      // Download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `law_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      loadLocalBackups();
      toast.success("ব্যাকআপ সম্পন্ন হয়েছে!");
      return backupMeta;
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("ব্যাকআপ করতে ব্যর্থ");
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const importBackup = async (file: File) => {
    if (!user) {
      toast.error("অনুগ্রহ করে লগইন করুন");
      return false;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);

      if (!backupData.version || !backupData.data) {
        throw new Error("Invalid backup file");
      }

      // Confirm before restore
      const confirmed = window.confirm(
        `এই ব্যাকআপটি রিস্টোর করলে বর্তমান ডাটা মুছে যাবে। আপনি কি নিশ্চিত?\n\nব্যাকআপের তারিখ: ${new Date(backupData.created_at).toLocaleDateString("bn-BD")}`
      );

      if (!confirmed) {
        setIsImporting(false);
        return false;
      }

      // Delete existing data
      await Promise.all([
        supabase.from("case_timeline").delete().eq("user_id", user.id),
        supabase.from("case_documents").delete().eq("user_id", user.id),
      ]);

      await supabase.from("checks").delete().eq("user_id", user.id);
      await supabase.from("cases").delete().eq("user_id", user.id);
      await supabase.from("clients").delete().eq("user_id", user.id);

      // Restore clients first (for foreign key references)
      if (backupData.data.clients?.length > 0) {
        const clientsToInsert = backupData.data.clients.map((c: any) => ({
          ...c,
          user_id: user.id,
        }));
        await supabase.from("clients").insert(clientsToInsert);
      }

      // Restore cases
      if (backupData.data.cases?.length > 0) {
        const casesToInsert = backupData.data.cases.map((c: any) => ({
          ...c,
          user_id: user.id,
        }));
        await supabase.from("cases").insert(casesToInsert);
      }

      // Restore checks
      if (backupData.data.checks?.length > 0) {
        const checksToInsert = backupData.data.checks.map((c: any) => ({
          ...c,
          user_id: user.id,
        }));
        await supabase.from("checks").insert(checksToInsert);
      }

      // Restore timeline
      if (backupData.data.case_timeline?.length > 0) {
        const timelineToInsert = backupData.data.case_timeline.map((t: any) => ({
          ...t,
          user_id: user.id,
        }));
        await supabase.from("case_timeline").insert(timelineToInsert);
      }

      toast.success("ডাটা সফলভাবে রিস্টোর হয়েছে!");
      return true;
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("রিস্টোর করতে ব্যর্থ: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  const restoreFromLocal = async (backupId: string) => {
    const stored = localStorage.getItem(backupId);
    if (!stored) {
      toast.error("ব্যাকআপ পাওয়া যায়নি");
      return false;
    }

    const file = new File([stored], "backup.json", { type: "application/json" });
    return importBackup(file);
  };

  const deleteLocalBackup = (backupId: string) => {
    localStorage.removeItem(backupId);
    const existingList = localStorage.getItem("law_backups_list");
    if (existingList) {
      const backupsList: BackupMeta[] = JSON.parse(existingList);
      const filtered = backupsList.filter((b) => b.id !== backupId);
      localStorage.setItem("law_backups_list", JSON.stringify(filtered));
      setBackups(filtered);
    }
    toast.success("ব্যাকআপ মুছে ফেলা হয়েছে");
  };

  return {
    isExporting,
    isImporting,
    backups,
    loadLocalBackups,
    exportBackup,
    importBackup,
    restoreFromLocal,
    deleteLocalBackup,
  };
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
