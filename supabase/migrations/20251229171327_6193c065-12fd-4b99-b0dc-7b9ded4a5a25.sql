-- Create enum for notice status
CREATE TYPE notice_status AS ENUM ('pending', 'ad_received', 'recipient_not_found', 'returned_unaccepted', 'delivered');

-- Create checks table for check management
CREATE TABLE public.checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  check_number TEXT NOT NULL,
  check_amount NUMERIC,
  bank_name TEXT NOT NULL,
  check_date DATE NOT NULL,
  dishonor_date DATE,
  legal_notice_date DATE,
  notice_status notice_status DEFAULT 'pending',
  case_filed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own checks"
ON public.checks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checks"
ON public.checks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checks"
ON public.checks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checks"
ON public.checks
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all checks"
ON public.checks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_checks_updated_at
BEFORE UPDATE ON public.checks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for checks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.checks;