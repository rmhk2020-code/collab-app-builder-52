-- Create table to store password reset codes persistently
CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- No public policies - this table is only accessed by edge functions using service role
-- The service role bypasses RLS, so no policies needed for edge function access

-- Create index for faster lookups
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at);

-- Add a trigger to automatically clean up expired codes (optional cleanup function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_codes WHERE expires_at < now();
  RETURN NEW;
END;
$$;

-- Clean up expired codes whenever a new code is inserted
CREATE TRIGGER cleanup_expired_codes_trigger
AFTER INSERT ON public.password_reset_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_reset_codes();