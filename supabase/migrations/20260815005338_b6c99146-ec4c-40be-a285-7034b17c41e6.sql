CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_uid text NOT NULL UNIQUE,
  full_name text,
  email text,
  phone text,
  referral_code text,
  status text NOT NULL DEFAULT 'active',
  ban_reason text,
  upgraded boolean NOT NULL DEFAULT false,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.app_users TO anon, authenticated;
GRANT SELECT, UPDATE ON public.app_users TO authenticated;
GRANT ALL ON public.app_users TO service_role;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can register" ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read users" ON public.app_users FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update users" ON public.app_users FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER app_users_updated BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_uid text NOT NULL,
  user_name text,
  user_email text,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  kind text NOT NULL DEFAULT 'upgrade',
  proof_path text,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.payments TO anon, authenticated;
GRANT SELECT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit payment" ON public.payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_uid text NOT NULL,
  user_name text,
  user_email text,
  amount numeric(14,2) NOT NULL,
  method text NOT NULL,
  destination text,
  account_name text,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.withdrawals TO anon, authenticated;
GRANT SELECT, UPDATE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request withdrawal" ON public.withdrawals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update withdrawals" ON public.withdrawals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER withdrawals_updated BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins edit settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.app_settings (key, value) VALUES
 ('bank', '{"bank_name":"Moniepoint MFB","account_name":"MONIEBEE VENTURES","account_number":"8123456789","branch":"Lagos"}'::jsonb),
 ('payment', '{"amount":6500}'::jsonb),
 ('support', '{"whatsapp_link":"https://wa.me/message/FOGLJUPV7MXJH1","whatsapp_text":"WhatsApp Support","whatsapp_enabled":true,"telegram_link":"https://t.me/Matthewxx8230","telegram_text":"Telegram Support","telegram_enabled":true}'::jsonb),
 ('community', '{"whatsapp_link":"","whatsapp_text":"Join WhatsApp Group","whatsapp_enabled":false,"telegram_link":"","telegram_text":"Join Telegram Group","telegram_enabled":false}'::jsonb);

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_table text,
  target_id text,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write audit" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND admin_id = auth.uid());