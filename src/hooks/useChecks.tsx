import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type NoticeStatus = 'pending' | 'ad_received' | 'recipient_not_found' | 'returned_unaccepted' | 'delivered';

export interface Check {
  id: string;
  user_id: string;
  client_id: string | null;
  case_id: string | null;
  check_number: string;
  check_amount: number | null;
  bank_name: string;
  check_date: string;
  dishonor_date: string | null;
  legal_notice_date: string | null;
  notice_status: NoticeStatus;
  case_filed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client_name?: string;
  case_title?: string;
}

export interface CreateCheckData {
  client_id?: string | null;
  case_id?: string | null;
  check_number: string;
  check_amount?: number | null;
  bank_name: string;
  check_date: string;
  dishonor_date?: string | null;
  legal_notice_date?: string | null;
  notice_status?: NoticeStatus;
  case_filed_date?: string | null;
  notes?: string | null;
}

export interface CheckAlert {
  check_id: string;
  check_number: string;
  type: 'dishonor_deadline' | 'notice_deadline' | 'case_deadline';
  message: string;
  days_remaining: number;
  is_overdue: boolean;
}

const calculateDaysDiff = (fromDate: string, toDate: Date): number => {
  const from = new Date(fromDate);
  const diffTime = toDate.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const useChecks = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<CheckAlert[]>([]);

  const calculateAlerts = useCallback((checksData: Check[]): CheckAlert[] => {
    const today = new Date();
    const alertsList: CheckAlert[] = [];

    checksData.forEach((check) => {
      // 1. Alert for dishonor deadline (6 months from check date)
      if (!check.dishonor_date) {
        const daysSinceCheck = calculateDaysDiff(check.check_date, today);
        const daysRemaining = 180 - daysSinceCheck; // 6 months = 180 days

        if (daysRemaining <= 30 && daysRemaining > 0) {
          alertsList.push({
            check_id: check.id,
            check_number: check.check_number,
            type: 'dishonor_deadline',
            message: `চেক #${check.check_number} ডিস অনার করার জন্য ${daysRemaining} দিন বাকি`,
            days_remaining: daysRemaining,
            is_overdue: false,
          });
        } else if (daysRemaining <= 0) {
          alertsList.push({
            check_id: check.id,
            check_number: check.check_number,
            type: 'dishonor_deadline',
            message: `চেক #${check.check_number} ডিস অনার করার সময়সীমা শেষ`,
            days_remaining: daysRemaining,
            is_overdue: true,
          });
        }
      }

      // 2. Alert for legal notice deadline (30 days from dishonor date)
      if (check.dishonor_date && !check.legal_notice_date) {
        const daysSinceDishonor = calculateDaysDiff(check.dishonor_date, today);
        const daysRemaining = 30 - daysSinceDishonor;

        if (daysRemaining <= 10 && daysRemaining > 0) {
          alertsList.push({
            check_id: check.id,
            check_number: check.check_number,
            type: 'notice_deadline',
            message: `চেক #${check.check_number} লিগ্যাল নোটিশ পাঠাতে ${daysRemaining} দিন বাকি`,
            days_remaining: daysRemaining,
            is_overdue: false,
          });
        } else if (daysRemaining <= 0) {
          alertsList.push({
            check_id: check.id,
            check_number: check.check_number,
            type: 'notice_deadline',
            message: `চেক #${check.check_number} লিগ্যাল নোটিশের সময়সীমা শেষ`,
            days_remaining: daysRemaining,
            is_overdue: true,
          });
        }
      }

      // 3. Alert for case filing deadline (60 days from notice date)
      if (check.legal_notice_date && !check.case_filed_date) {
        const daysSinceNotice = calculateDaysDiff(check.legal_notice_date, today);
        const daysRemaining = 60 - daysSinceNotice;

        if (daysRemaining <= 15 && daysRemaining > 0) {
          alertsList.push({
            check_id: check.id,
            check_number: check.check_number,
            type: 'case_deadline',
            message: `চেক #${check.check_number} মামলা দায়ের করতে ${daysRemaining} দিন বাকি`,
            days_remaining: daysRemaining,
            is_overdue: false,
          });
        } else if (daysRemaining <= 0) {
          alertsList.push({
            check_id: check.id,
            check_number: check.check_number,
            type: 'case_deadline',
            message: `চেক #${check.check_number} মামলা দায়েরের সময়সীমা শেষ`,
            days_remaining: daysRemaining,
            is_overdue: true,
          });
        }
      }
    });

    return alertsList.sort((a, b) => a.days_remaining - b.days_remaining);
  }, []);

  const fetchChecks = useCallback(async () => {
    if (!user) {
      setChecks([]);
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('checks')
        .select(`
          *,
          clients(name),
          cases(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const checksWithJoins: Check[] = (data || []).map((check: any) => ({
        ...check,
        client_name: check.clients?.name,
        case_title: check.cases?.title,
      }));

      setChecks(checksWithJoins);
      setAlerts(calculateAlerts(checksWithJoins));
    } catch (error) {
      console.error('Error fetching checks:', error);
      toast.error('চেক লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [user, calculateAlerts]);

  const createCheck = async (checkData: CreateCheckData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('checks')
        .insert({
          ...checkData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('চেক সফলভাবে যোগ করা হয়েছে');
      await fetchChecks();
      return data;
    } catch (error) {
      console.error('Error creating check:', error);
      toast.error('চেক যোগ করতে সমস্যা হয়েছে');
      return null;
    }
  };

  const updateCheck = async (id: string, updates: Partial<CreateCheckData>) => {
    try {
      const { error } = await supabase
        .from('checks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('চেক সফলভাবে আপডেট করা হয়েছে');
      await fetchChecks();
      return true;
    } catch (error) {
      console.error('Error updating check:', error);
      toast.error('চেক আপডেট করতে সমস্যা হয়েছে');
      return false;
    }
  };

  const deleteCheck = async (id: string) => {
    try {
      const { error } = await supabase
        .from('checks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('চেক সফলভাবে মুছে ফেলা হয়েছে');
      await fetchChecks();
      return true;
    } catch (error) {
      console.error('Error deleting check:', error);
      toast.error('চেক মুছতে সমস্যা হয়েছে');
      return false;
    }
  };

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  return {
    checks,
    loading,
    alerts,
    createCheck,
    updateCheck,
    deleteCheck,
    refetch: fetchChecks,
  };
};
