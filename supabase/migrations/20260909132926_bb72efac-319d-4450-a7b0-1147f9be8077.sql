CREATE TABLE public.upgrade_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_uid text NOT NULL,
  user_name text,
  user_email text,
  plan_id text,
  plan_name text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  proof_path text,
  receipt_type text,
  reference text NOT NULL DEFAULT ('MBU-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX upgrade_payments_reference_key ON public.upgrade_payments (reference);
CREATE INDEX upgrade_payments_uid_idx ON public.upgrade_payments (external_uid);

GRANT SELECT, UPDATE ON public.upgrade_payments TO authenticated;
GRANT INSERT ON public.upgrade_payments TO anon, authenticated;
GRANT ALL ON public.upgrade_payments TO service_role;

ALTER TABLE public.upgrade_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read upgrade payments" ON public.upgrade_payments
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update upgrade payments" ON public.upgrade_payments
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "anyone can submit upgrade payment" ON public.upgrade_payments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TRIGGER upgrade_payments_updated
  BEFORE UPDATE ON public.upgrade_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (key, value)
VALUES ('upgrade', '{"plan_name":"Premium Plan","amount":8500,"starter_amount":10000,"silver_amount":20000,"gold_amount":30000,"bank_name":"","account_number":"","account_name":""}'::jsonb)
ON CONFLICT (key) DO NOTHING;