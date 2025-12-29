-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  max_cases INTEGER,
  max_clients INTEGER,
  max_documents INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  amount_paid DECIMAL(10,2),
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment history table
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity logs table for reports
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Subscription plans - public read, admin write
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON public.subscription_plans FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- User subscriptions - users see own, admins see all
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscriptions"
ON public.user_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Payment history - users see own, admins see all
CREATE POLICY "Users can view own payments"
ON public.payment_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
ON public.payment_history FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage payments"
ON public.payment_history FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Activity logs - admins only
CREATE POLICY "Admins can view all activity"
ON public.activity_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs"
ON public.activity_logs FOR INSERT
WITH CHECK (true);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, max_cases, max_clients, max_documents) VALUES
('Basic', 'basic', 'ছোট আইন প্র্যাকটিস এর জন্য উপযুক্ত', 0, 0, '["5টি পর্যন্ত কেস", "10টি ক্লায়েন্ট", "বেসিক রিপোর্ট", "ইমেইল সাপোর্ট"]'::jsonb, 5, 10, 50),
('Pro', 'pro', 'মাঝারি আকারের ফার্মের জন্য আদর্শ', 2999, 29990, '["আনলিমিটেড কেস", "আনলিমিটেড ক্লায়েন্ট", "বিস্তারিত রিপোর্ট", "প্রায়োরিটি সাপোর্ট", "টাইম ট্র্যাকিং", "ডকুমেন্ট স্টোরেজ 10GB"]'::jsonb, NULL, NULL, 500),
('Enterprise', 'enterprise', 'বড় ফার্ম ও কর্পোরেট এর জন্য', 9999, 99990, '["সব Pro ফিচার", "আনলিমিটেড স্টোরেজ", "কাস্টম ইন্টিগ্রেশন", "ডেডিকেটেড সাপোর্ট", "API অ্যাক্সেস", "মাল্টি-ইউজার"]'::jsonb, NULL, NULL, NULL);

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();