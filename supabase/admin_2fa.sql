-- ============================================================
-- 2FA NG ADMIN — ANG KANDADO SA DATABASE
-- Patakbuhin sa Supabase → SQL Editor → New query → Run.
-- Ligtas itong ulitin.
--
-- BAKIT: Ang tanong ng code sa login screen ay nasa JavaScript — kayang
-- laktawan ng sinumang may password at anon key. Kaya dito rin sa
-- database sinusuri: ang admin na may naka-on na 2FA ay makakapagsulat
-- lang kung
--   • dumaan sa code ang session na ito (aal2), O
--   • may nag-code sa admin account sa loob ng huling 12 oras.
-- Ang pangalawa ang dahilan kung bakit isang beses lang hinihingi ang
-- code bawat 12 oras: nila-logout ang admin tuwing bumabalik sa welcome
-- screen, at walang code ang susunod na login sa loob ng 12 oras.
--
-- Habang naka-off ang 2FA (walang authenticator na natapos i-set up),
-- walang nagbabago — kaya hindi mala-lock out ang admin kapag pinatakbo
-- ito bago pa i-on ang 2FA.
--
-- ⚠️ Pinapalitan nito ang is_kiosk_admin(). Kapag pinatakbo ulit ang
-- admin_only_writes.sql o security_hardening.sql, patakbuhin ULIT ito
-- pagkatapos — ibinabalik ng mga iyon ang lumang email lang na tseke.
--
-- Nawala ang telepono? Supabase Dashboard → Authentication → Users →
-- tagaytaykiosk@gmail.com → burahin ang MFA factor. Off na ulit ang 2FA.
-- ============================================================

-- ── 1. Kailan huling nag-code ──────────────────────────────
-- Walang policy: ang mga function lang sa ibaba ang nakakabasa at
-- nakakasulat dito.
create table if not exists public.admin_mfa_trust (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  verified_at timestamptz not null default now()
);

alter table public.admin_mfa_trust enable row level security;
revoke all on public.admin_mfa_trust from anon, authenticated;

-- ── 2. Itala ang tamang code ───────────────────────────────
-- Tinatawag ng app pagkatapos ng tamang code. Ang session lang na
-- talagang dumaan sa code (aal2 sa token na pinirmahan ng Supabase) ang
-- makakapagtala — hindi ito kayang pekein ng password lang.
create or replace function public.mark_admin_mfa_verified()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'Kailangan ng 2FA' using errcode = '42501';
  end if;

  insert into public.admin_mfa_trust (user_id, verified_at)
  values (auth.uid(), now())
  on conflict (user_id) do update set verified_at = excluded.verified_at;
end;
$$;

revoke all on function public.mark_admin_mfa_verified() from public, anon;
grant execute on function public.mark_admin_mfa_verified() to authenticated;

-- ── 3. Sino ang admin — ngayon may 2FA na ──────────────────
-- `security definer`: kailangang mabasa ang auth.mfa_factors at ang
-- table sa itaas, na sarado sa naka-login.
create or replace function public.is_kiosk_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = 'tagaytaykiosk@gmail.com'
    and (
      coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status = 'verified'
      )
      or exists (
        select 1 from public.admin_mfa_trust t
        where t.user_id = auth.uid() and t.verified_at > now() - interval '12 hours'
      )
    );
$$;

notify pgrst, 'reload schema';
