import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TimelineEvent {
  id: string;
  case_id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
  user_id: string;
}

export interface CreateTimelineEvent {
  case_id: string;
  event_type: string;
  title: string;
  description?: string;
  event_date: string;
}

const eventTypeLabels: Record<string, string> = {
  hearing: "শুনানি",
  filing: "দাখিল",
  order: "আদেশ",
  adjournment: "মুলতবি",
  argument: "যুক্তিতর্ক",
  evidence: "সাক্ষ্য",
  judgment: "রায়",
  appeal: "আপিল",
  other: "অন্যান্য",
};

export const useCaseTimeline = (caseId?: string) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user || !caseId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("case_timeline")
        .select("*")
        .eq("case_id", caseId)
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching timeline:", error);
      toast.error("টাইমলাইন লোড করতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateTimelineEvent) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("case_timeline")
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => [data, ...prev]);
      toast.success("হেয়ারিং এন্ট্রি যোগ হয়েছে");
      return data;
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error("এন্ট্রি যোগ করতে ব্যর্থ");
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CreateTimelineEvent>) => {
    try {
      const { data, error } = await supabase
        .from("case_timeline")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      toast.success("এন্ট্রি আপডেট হয়েছে");
      return data;
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error("আপডেট করতে ব্যর্থ");
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("case_timeline").delete().eq("id", id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("এন্ট্রি মুছে ফেলা হয়েছে");
      return true;
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("মুছতে ব্যর্থ");
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, caseId]);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    eventTypeLabels,
  };
};
