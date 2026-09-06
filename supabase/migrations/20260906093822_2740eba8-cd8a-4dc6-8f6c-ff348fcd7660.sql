ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS receipt_type text,
  ADD COLUMN IF NOT EXISTS moneebee_code text;

CREATE OR REPLACE FUNCTION public.gen_payment_reference()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'MBP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
$$;

CREATE OR REPLACE FUNCTION public.gen_moneebee_code()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'MBEE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))
       || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))
$$;

UPDATE public.payments
SET reference = COALESCE(reference, public.gen_payment_reference()),
    moneebee_code = COALESCE(moneebee_code, public.gen_moneebee_code());

ALTER TABLE public.payments
  ALTER COLUMN reference SET DEFAULT public.gen_payment_reference(),
  ALTER COLUMN moneebee_code SET DEFAULT public.gen_moneebee_code();

CREATE UNIQUE INDEX IF NOT EXISTS payments_reference_key ON public.payments (reference);
CREATE INDEX IF NOT EXISTS payments_external_uid_idx ON public.payments (external_uid);