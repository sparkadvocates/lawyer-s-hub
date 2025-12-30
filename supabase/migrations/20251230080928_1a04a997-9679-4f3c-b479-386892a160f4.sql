-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop pg_net from public schema
DROP EXTENSION IF EXISTS pg_net;

-- Recreate pg_net in extensions schema
CREATE EXTENSION pg_net WITH SCHEMA extensions;