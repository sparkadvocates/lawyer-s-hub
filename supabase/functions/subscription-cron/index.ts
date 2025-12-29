import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionPlan {
  name: string;
  slug?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    console.log('Starting subscription cron job...');
    console.log('Current time:', now.toISOString());

    // 1. Find subscriptions expiring in 7 days that haven't been reminded
    const { data: expiringSubscriptions, error: expiringError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        end_date,
        billing_cycle,
        renewal_reminder_sent,
        subscription_plans(name)
      `)
      .eq('status', 'active')
      .eq('renewal_reminder_sent', false)
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gt('end_date', now.toISOString());

    if (expiringError) {
      console.error('Error fetching expiring subscriptions:', expiringError);
    } else if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      console.log(`Found ${expiringSubscriptions.length} subscriptions expiring soon`);

      for (const sub of expiringSubscriptions) {
        const plans = sub.subscription_plans as unknown as SubscriptionPlan[] | SubscriptionPlan | null;
        const planName = Array.isArray(plans) ? plans[0]?.name : plans?.name || 'Unknown';
        const endDate = new Date(sub.end_date!).toLocaleDateString('bn-BD');

        // Create notification
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: sub.user_id,
          title: 'সাবস্ক্রিপশন রিনিউ করুন',
          message: `আপনার ${planName} প্ল্যানের মেয়াদ ${endDate} তারিখে শেষ হবে। মেয়াদ শেষ হলে আপনি বেসিক প্ল্যানে চলে যাবেন।`,
          type: 'warning',
          action_url: '/dashboard/packages'
        });

        if (notifError) {
          console.error('Error creating notification:', notifError);
        }

        // Mark as reminder sent
        await supabase
          .from('user_subscriptions')
          .update({ renewal_reminder_sent: true })
          .eq('id', sub.id);

        console.log(`Sent renewal reminder for subscription ${sub.id}`);
      }
    }

    // 2. Find expired subscriptions and downgrade to Basic
    const { data: expiredSubscriptions, error: expiredError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        subscription_plans(name, slug)
      `)
      .eq('status', 'active')
      .lt('end_date', now.toISOString());

    if (expiredError) {
      console.error('Error fetching expired subscriptions:', expiredError);
    } else if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

      // Get Basic plan
      const { data: basicPlan } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .eq('slug', 'basic')
        .eq('is_active', true)
        .single();

      if (!basicPlan) {
        console.error('Basic plan not found! Cannot downgrade subscriptions.');
      } else {
        for (const sub of expiredSubscriptions) {
          const plans = sub.subscription_plans as unknown as SubscriptionPlan[] | SubscriptionPlan | null;
          const oldPlanName = Array.isArray(plans) ? plans[0]?.name : plans?.name || 'Unknown';
          const oldPlanSlug = Array.isArray(plans) ? plans[0]?.slug : plans?.slug || '';

          // Don't downgrade if already on Basic
          if (oldPlanSlug === 'basic') {
            // Just mark as expired
            await supabase
              .from('user_subscriptions')
              .update({ status: 'expired' })
              .eq('id', sub.id);
            continue;
          }

          // Mark old subscription as expired
          await supabase
            .from('user_subscriptions')
            .update({ status: 'expired' })
            .eq('id', sub.id);

          // Create new Basic subscription (no end date for free plan)
          const { error: newSubError } = await supabase.from('user_subscriptions').insert({
            user_id: sub.user_id,
            plan_id: basicPlan.id,
            billing_cycle: 'monthly',
            status: 'active',
            amount_paid: 0,
            notes: `Auto-downgraded from ${oldPlanName}`,
            end_date: null
          });

          if (newSubError) {
            console.error('Error creating Basic subscription:', newSubError);
          }

          // Notify user
          await supabase.from('notifications').insert({
            user_id: sub.user_id,
            title: 'প্ল্যান পরিবর্তন হয়েছে',
            message: `আপনার ${oldPlanName} প্ল্যানের মেয়াদ শেষ হয়েছে। আপনাকে বেসিক প্ল্যানে নামানো হয়েছে।`,
            type: 'info',
            action_url: '/dashboard/packages'
          });

          console.log(`Downgraded subscription ${sub.id} to Basic`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiring_reminded: expiringSubscriptions?.length || 0,
        expired_downgraded: expiredSubscriptions?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Cron job error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
