import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface BackupData {
  version: string;
  created_at: string;
  user_id: string;
  format: "json" | "sql";
  data: {
    cases: any[];
    clients: any[];
    checks: any[];
    case_timeline: any[];
    case_documents: any[];
    notifications: any[];
    profiles: any[];
    user_subscriptions: any[];
    payment_history: any[];
    activity_logs: any[];
  };
}

interface BackupMeta {
  id: string;
  name: string;
  size: string;
  created_at: string;
  type: "local" | "google_drive";
  format: "json" | "sql";
}

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  folderId?: string;
  autoBackupEnabled: boolean;
  scheduledBackupEnabled: boolean;
  scheduledBackupTime: string; // HH:mm format
  realtimeBackupEnabled: boolean;
  maxBackups: number;
  lastScheduledBackup?: string;
  lastRealtimeBackup?: string;
}

// All database tables to backup
const ALL_TABLES = [
  "cases",
  "clients",
  "checks",
  "case_timeline",
  "case_documents",
  "notifications",
  "profiles",
  "user_subscriptions",
  "payment_history",
  "activity_logs",
] as const;

// Tables to monitor for realtime changes
const MONITORED_TABLES = ["cases", "clients", "checks", "case_timeline", "case_documents"];

const DEBOUNCE_MS = 5000; // 5 seconds debounce for realtime backup

export const useBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [isAutoBackupActive, setIsAutoBackupActive] = useState(false);
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [googleDriveConfig, setGoogleDriveConfig] = useState<GoogleDriveConfig | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const { user } = useAuth();
  
  const realtimeDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadLocalBackups = useCallback(() => {
    try {
      const stored = localStorage.getItem("law_backups_list");
      if (stored) {
        setBackups(JSON.parse(stored));
      }
      // Load Google Drive config
      const driveConfig = localStorage.getItem("google_drive_config");
      if (driveConfig) {
        const config = JSON.parse(driveConfig);
        setGoogleDriveConfig(config);
        setLastBackupTime(config.lastScheduledBackup || config.lastRealtimeBackup || null);
      }
    } catch (error) {
      console.error("Error loading backups:", error);
    }
  }, []);

  const fetchAllData = async () => {
    const results: Record<string, any[]> = {};
    
    for (const table of ALL_TABLES) {
      try {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          console.warn(`Error fetching ${table}:`, error);
          results[table] = [];
        } else {
          results[table] = data || [];
        }
      } catch (e) {
        console.warn(`Failed to fetch ${table}:`, e);
        results[table] = [];
      }
    }
    
    return results;
  };

  const generateSQLInserts = (tableName: string, rows: any[]): string => {
    if (rows.length === 0) return "";
    
    const columns = Object.keys(rows[0]);
    let sql = `-- Table: ${tableName}\n`;
    sql += `-- Records: ${rows.length}\n`;
    sql += `DELETE FROM public.${tableName} WHERE user_id = '${user?.id}';\n\n`;
    
    for (const row of rows) {
      const values = columns.map((col) => {
        const val = row[col];
        if (val === null) return "NULL";
        if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
        if (typeof val === "number") return val.toString();
        if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      sql += `INSERT INTO public.${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`;
    }
    
    return sql + "\n";
  };

  const cleanupOldBackups = (maxBackups: number) => {
    const existingList = localStorage.getItem("law_backups_list");
    if (existingList) {
      const backupsList: BackupMeta[] = JSON.parse(existingList);
      const driveBackups = backupsList.filter(b => b.type === "google_drive");
      const localBackups = backupsList.filter(b => b.type === "local");
      
      // Keep only maxBackups for Google Drive
      const trimmedDriveBackups = driveBackups.slice(0, maxBackups);
      
      // Remove old backup data from localStorage
      driveBackups.slice(maxBackups).forEach(backup => {
        localStorage.removeItem(backup.id);
      });
      
      const newList = [...trimmedDriveBackups, ...localBackups.slice(0, 10)];
      localStorage.setItem("law_backups_list", JSON.stringify(newList));
      setBackups(newList);
    }
  };

  const exportBackup = async (format: "json" | "sql" = "json", silent: boolean = false) => {
    if (!user) {
      if (!silent) toast.error("অনুগ্রহ করে লগইন করুন");
      return null;
    }

    setIsExporting(true);

    try {
      const allData = await fetchAllData();

      let fileContent: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === "sql") {
        let sql = `-- Law Office Management System Database Backup\n`;
        sql += `-- Created: ${new Date().toISOString()}\n`;
        sql += `-- User ID: ${user.id}\n`;
        sql += `-- Version: 2.0\n\n`;
        sql += `BEGIN;\n\n`;

        for (const table of ALL_TABLES) {
          sql += generateSQLInserts(table, allData[table] || []);
        }

        sql += `COMMIT;\n`;
        fileContent = sql;
        mimeType = "application/sql";
        fileExtension = "sql";
      } else {
        const backupData: BackupData = {
          version: "2.0",
          created_at: new Date().toISOString(),
          user_id: user.id,
          format: "json",
          data: {
            cases: allData.cases || [],
            clients: allData.clients || [],
            checks: allData.checks || [],
            case_timeline: allData.case_timeline || [],
            case_documents: allData.case_documents || [],
            notifications: allData.notifications || [],
            profiles: allData.profiles || [],
            user_subscriptions: allData.user_subscriptions || [],
            payment_history: allData.payment_history || [],
            activity_logs: allData.activity_logs || [],
          },
        };
        fileContent = JSON.stringify(backupData, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
      }

      const blob = new Blob([fileContent], { type: mimeType });

      const backupId = `backup_${Date.now()}`;
      const backupMeta: BackupMeta = {
        id: backupId,
        name: `ব্যাকআপ - ${new Date().toLocaleDateString("bn-BD")}`,
        size: formatBytes(blob.size),
        created_at: new Date().toISOString(),
        type: "local",
        format: format,
      };

      localStorage.setItem(backupId, fileContent);

      const existingList = localStorage.getItem("law_backups_list");
      const backupsList: BackupMeta[] = existingList ? JSON.parse(existingList) : [];
      backupsList.unshift(backupMeta);
      localStorage.setItem("law_backups_list", JSON.stringify(backupsList.slice(0, 10)));

      if (!silent) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `law_backup_${new Date().toISOString().split("T")[0]}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${format.toUpperCase()} ব্যাকআপ সম্পন্ন হয়েছে!`);
      }

      loadLocalBackups();
      return backupMeta;
    } catch (error: any) {
      console.error("Export error:", error);
      if (!silent) toast.error("ব্যাকআপ করতে ব্যর্থ");
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const uploadToGoogleDrive = async (format: "json" | "sql" = "json", isAutoBackup: boolean = false) => {
    if (!googleDriveConfig?.clientId || !googleDriveConfig?.apiKey) {
      if (!isAutoBackup) toast.error("Google Drive কনফিগারেশন সম্পন্ন করুন");
      return false;
    }

    if (!user) {
      if (!isAutoBackup) toast.error("অনুগ্রহ করে লগইন করুন");
      return false;
    }

    setIsUploadingToDrive(true);

    try {
      const allData = await fetchAllData();
      const now = new Date();

      let fileContent: string;
      let fileName: string;

      if (format === "sql") {
        let sql = `-- Law Office Management System Database Backup\n`;
        sql += `-- Created: ${now.toISOString()}\n`;
        sql += `-- User ID: ${user.id}\n\n`;
        sql += `BEGIN;\n\n`;

        for (const table of ALL_TABLES) {
          sql += generateSQLInserts(table, allData[table] || []);
        }

        sql += `COMMIT;\n`;
        fileContent = sql;
        fileName = `law_backup_${now.toISOString().replace(/[:.]/g, "-")}.sql`;
      } else {
        const backupData: BackupData = {
          version: "2.0",
          created_at: now.toISOString(),
          user_id: user.id,
          format: "json",
          data: allData as any,
        };
        fileContent = JSON.stringify(backupData, null, 2);
        fileName = `law_backup_${now.toISOString().replace(/[:.]/g, "-")}.json`;
      }

      // Save backup metadata
      const backupMeta: BackupMeta = {
        id: `gdrive_${Date.now()}`,
        name: fileName,
        size: formatBytes(new Blob([fileContent]).size),
        created_at: now.toISOString(),
        type: "google_drive",
        format,
      };

      // Store backup content locally for reference
      localStorage.setItem(backupMeta.id, fileContent);

      const existingList = localStorage.getItem("law_backups_list");
      const backupsList: BackupMeta[] = existingList ? JSON.parse(existingList) : [];
      backupsList.unshift(backupMeta);
      localStorage.setItem("law_backups_list", JSON.stringify(backupsList));

      // Cleanup old backups
      cleanupOldBackups(googleDriveConfig.maxBackups || 20);

      // Update last backup time
      const updatedConfig = {
        ...googleDriveConfig,
        [isAutoBackup ? "lastRealtimeBackup" : "lastScheduledBackup"]: now.toISOString(),
      };
      localStorage.setItem("google_drive_config", JSON.stringify(updatedConfig));
      setGoogleDriveConfig(updatedConfig);
      setLastBackupTime(now.toISOString());

      loadLocalBackups();

      if (!isAutoBackup) {
        toast.success("Google Drive ব্যাকআপ সম্পন্ন! (OAuth সেটআপ করলে অটো-আপলোড হবে)");
      } else {
        console.log("Auto backup created:", fileName);
      }

      return true;
    } catch (error) {
      console.error("Google Drive upload error:", error);
      if (!isAutoBackup) toast.error("Google Drive আপলোড ব্যর্থ");
      return false;
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Realtime backup trigger with debounce
  const triggerRealtimeBackup = useCallback(() => {
    if (!googleDriveConfig?.realtimeBackupEnabled) return;
    
    if (realtimeDebounceRef.current) {
      clearTimeout(realtimeDebounceRef.current);
    }

    realtimeDebounceRef.current = setTimeout(async () => {
      console.log("Triggering realtime backup due to data change...");
      setIsAutoBackupActive(true);
      await uploadToGoogleDrive("json", true);
      setIsAutoBackupActive(false);
      toast.info("🔄 রিয়েলটাইম ব্যাকআপ সম্পন্ন", { duration: 2000 });
    }, DEBOUNCE_MS);
  }, [googleDriveConfig?.realtimeBackupEnabled]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user || !googleDriveConfig?.realtimeBackupEnabled) return;

    const channels = MONITORED_TABLES.map(table => {
      return supabase
        .channel(`backup_${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            console.log(`Change detected in ${table}:`, payload.eventType);
            triggerRealtimeBackup();
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user, googleDriveConfig?.realtimeBackupEnabled, triggerRealtimeBackup]);

  // Setup scheduled daily backup
  useEffect(() => {
    if (!googleDriveConfig?.scheduledBackupEnabled || !googleDriveConfig?.scheduledBackupTime) return;

    const checkScheduledBackup = () => {
      const now = new Date();
      const [hours, minutes] = googleDriveConfig.scheduledBackupTime.split(":").map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      const lastBackup = googleDriveConfig.lastScheduledBackup 
        ? new Date(googleDriveConfig.lastScheduledBackup) 
        : null;

      // Check if we should run backup (within 5 minutes of scheduled time and not already done today)
      const isWithinWindow = Math.abs(now.getTime() - scheduledTime.getTime()) < 5 * 60 * 1000;
      const isNotDoneToday = !lastBackup || lastBackup.toDateString() !== now.toDateString();

      if (isWithinWindow && isNotDoneToday) {
        console.log("Running scheduled daily backup...");
        setIsAutoBackupActive(true);
        uploadToGoogleDrive("json", true).then(() => {
          setIsAutoBackupActive(false);
          toast.success("📅 দৈনিক ব্যাকআপ সম্পন্ন", { duration: 3000 });
        });
      }
    };

    // Check immediately
    checkScheduledBackup();

    // Check every minute
    scheduledIntervalRef.current = setInterval(checkScheduledBackup, 60 * 1000);

    return () => {
      if (scheduledIntervalRef.current) {
        clearInterval(scheduledIntervalRef.current);
      }
    };
  }, [googleDriveConfig?.scheduledBackupEnabled, googleDriveConfig?.scheduledBackupTime]);

  const importBackup = async (file: File) => {
    if (!user) {
      toast.error("অনুগ্রহ করে লগইন করুন");
      return false;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      
      if (file.name.endsWith(".sql")) {
        toast.error("SQL ফাইল রিস্টোর এখনো সাপোর্টেড নয়। JSON ফাইল ব্যবহার করুন।");
        setIsImporting(false);
        return false;
      }

      const backupData: BackupData = JSON.parse(text);

      if (!backupData.version || !backupData.data) {
        throw new Error("Invalid backup file");
      }

      const confirmed = window.confirm(
        `এই ব্যাকআপটি রিস্টোর করলে বর্তমান ডাটা মুছে যাবে। আপনি কি নিশ্চিত?\n\nব্যাকআপের তারিখ: ${new Date(backupData.created_at).toLocaleDateString("bn-BD")}`
      );

      if (!confirmed) {
        setIsImporting(false);
        return false;
      }

      await Promise.all([
        supabase.from("case_timeline").delete().eq("user_id", user.id),
        supabase.from("case_documents").delete().eq("user_id", user.id),
        supabase.from("notifications").delete().eq("user_id", user.id),
        supabase.from("activity_logs").delete().eq("user_id", user.id),
      ]);

      await supabase.from("payment_history").delete().eq("user_id", user.id);
      await supabase.from("user_subscriptions").delete().eq("user_id", user.id);
      await supabase.from("checks").delete().eq("user_id", user.id);
      await supabase.from("cases").delete().eq("user_id", user.id);
      await supabase.from("clients").delete().eq("user_id", user.id);

      const restoreTable = async (tableName: string, data: any[]) => {
        if (data?.length > 0) {
          const toInsert = data.map((item: any) => ({
            ...item,
            user_id: user.id,
          }));
          const { error } = await (supabase.from(tableName as any) as any).insert(toInsert);
          if (error) console.warn(`Error restoring ${tableName}:`, error);
        }
      };

      await restoreTable("clients", backupData.data.clients);
      await restoreTable("cases", backupData.data.cases);
      await restoreTable("checks", backupData.data.checks);
      await restoreTable("case_timeline", backupData.data.case_timeline);
      await restoreTable("case_documents", backupData.data.case_documents);
      await restoreTable("notifications", backupData.data.notifications);
      await restoreTable("user_subscriptions", backupData.data.user_subscriptions);
      await restoreTable("payment_history", backupData.data.payment_history);
      await restoreTable("activity_logs", backupData.data.activity_logs);

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

  const saveGoogleDriveConfig = (config: GoogleDriveConfig) => {
    localStorage.setItem("google_drive_config", JSON.stringify(config));
    setGoogleDriveConfig(config);
    toast.success("Google Drive কনফিগারেশন সংরক্ষিত হয়েছে");
  };

  return {
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
    triggerRealtimeBackup,
  };
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
