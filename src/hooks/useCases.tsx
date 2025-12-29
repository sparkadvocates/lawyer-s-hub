import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CaseData {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  case_type: string | null;
  court_name: string | null;
  judge_name: string | null;
  opposing_party: string | null;
  opposing_counsel: string | null;
  status: "open" | "in_progress" | "pending" | "closed" | "won" | "lost";
  priority: "low" | "medium" | "high" | "urgent";
  filing_date: string | null;
  next_hearing_date: string | null;
  closed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  user_id: string;
  client?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface CreateCaseData {
  title: string;
  description?: string;
  case_type?: string;
  court_name?: string;
  judge_name?: string;
  opposing_party?: string;
  opposing_counsel?: string;
  status?: "open" | "in_progress" | "pending" | "closed" | "won" | "lost";
  priority?: "low" | "medium" | "high" | "urgent";
  filing_date?: string;
  next_hearing_date?: string;
  notes?: string;
  client_id?: string;
}

export const useCases = () => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCases = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      console.error("Error fetching cases:", error);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (caseData: CreateCaseData) => {
    if (!user) return null;

    try {
      const caseNumber = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const { data, error } = await supabase
        .from("cases")
        .insert({
          ...caseData,
          case_number: caseNumber,
          user_id: user.id,
        })
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .single();

      if (error) throw error;
      
      setCases((prev) => [data, ...prev]);
      toast.success("Case created successfully");
      return data;
    } catch (error: any) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case");
      return null;
    }
  };

  const updateCase = async (id: string, updates: Partial<CreateCaseData>) => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .single();

      if (error) throw error;
      
      setCases((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success("Case updated successfully");
      return data;
    } catch (error: any) {
      console.error("Error updating case:", error);
      toast.error("Failed to update case");
      return null;
    }
  };

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase.from("cases").delete().eq("id", id);

      if (error) throw error;
      
      setCases((prev) => prev.filter((c) => c.id !== id));
      toast.success("Case deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting case:", error);
      toast.error("Failed to delete case");
      return false;
    }
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  return {
    cases,
    loading,
    fetchCases,
    createCase,
    updateCase,
    deleteCase,
  };
};
