import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DocumentData {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  category: string | null;
  description: string | null;
  case_id: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  case?: {
    id: string;
    title: string;
    case_number: string;
  } | null;
}

export interface UploadDocumentData {
  name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  description?: string;
  case_id?: string;
  client_id?: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("case_documents")
        .select(`
          *,
          case:cases(id, title, case_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, data: Omit<UploadDocumentData, "name" | "file_path" | "file_size" | "file_type">) => {
    if (!user) return null;

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: dbError } = await supabase
        .from("case_documents")
        .insert({
          ...data,
          name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: fileExt,
          user_id: user.id,
        })
        .select(`
          *,
          case:cases(id, title, case_number)
        `)
        .single();

      if (dbError) throw dbError;
      
      setDocuments((prev) => [docData, ...prev]);
      toast.success("Document uploaded successfully");
      return docData;
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
      return null;
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (storageError) {
        console.warn("Storage deletion warning:", storageError);
      }

      // Delete record
      const { error: dbError } = await supabase
        .from("case_documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
      
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  };

  const getDocumentUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl;
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
  };
};
