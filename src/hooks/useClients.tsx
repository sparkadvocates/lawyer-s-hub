import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          ...clientData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setClients((prev) => [data, ...prev]);
      toast.success("Client added successfully");
      return data;
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error("Failed to add client");
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<CreateClientData>) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      setClients((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success("Client updated successfully");
      return data;
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) throw error;
      
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
};
