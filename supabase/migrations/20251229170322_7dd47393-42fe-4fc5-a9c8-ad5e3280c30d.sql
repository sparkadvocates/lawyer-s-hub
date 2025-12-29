-- Update email_settings table for SMTP configuration
ALTER TABLE public.email_settings 
DROP COLUMN IF EXISTS resend_api_key;

ALTER TABLE public.email_settings 
ADD COLUMN IF NOT EXISTS smtp_host TEXT DEFAULT 'smtp.gmail.com',
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_user TEXT,
ADD COLUMN IF NOT EXISTS smtp_password TEXT,
ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT true;

-- Update default row
UPDATE public.email_settings SET smtp_host = 'smtp.gmail.com', smtp_port = 587 WHERE smtp_host IS NULL;