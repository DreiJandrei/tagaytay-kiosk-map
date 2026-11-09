-- ============================================================
-- 2FA NG ADMIN — ANG KANDADO SA DATABASE
-- Patakbuhin sa Supabase → SQL Editor → New query → Run.
-- Ligtas itong ulitin.
--
-- BAKIT: Ang tanong ng code sa login screen ay nasa JavaScript — kayang
-- laktawan ng sinumang may password at anon key. Kaya dito rin sa
-- database sinusuri: REQUIRED ang 2FA — makakapagsulat lang ang admin
-- kung
--   • dumaan sa code ang session na ito (aal2), O
--   • may nag-code sa admin account sa loob ng huling 12 oras.
-- Ang pangalawa ang dahilan kung bakit isang beses lang hinihingi ang
-- code bawat 12 oras: nila-logout ang admin tuwing bumabalik sa welcome
-- screen, at walang code ang susunod na login sa loob ng 12 oras.
--
-- Wala pang authenticator ang admin? Hindi ito mala-lock out: sa susunod
-- na login, ipapa-set up muna ng app ang 2FA bago papasukin — at ang code
-- sa setup na iyon mismo ang nagbubukas ng 12 oras. Pero hangga't hindi
-- pa iyon tapos, wala nang maisusulat ang admin.
--
-- ⚠️ Pinapalitan nito ang is_kiosk_admin(). Kapag pinatakbo ulit ang
-- admin_only_writes.sql o security_hardening.sql, patakbuhin ULIT ito
-- pagkatapos — ibinabalik ng mga iyon ang lumang email lang na tseke.
--
-- Nawala ang telepono? Supabase Dashboard → Authentication → Users →
-- tagaytaykiosk@gmail.com → burahin ang MFA factor. Sa susunod na login,
-- ipapa-set up ulit ang 2FA sa bagong telepono.
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

-- ── 3. Admin account ba (bago pa ang 2FA)? ─────────────────
-- Tinatanong ng app pagkatapos ng password, para ang admin lang ang
-- hingan ng code o pa-set-up-in ng 2FA — hindi ang account ng kiosk.
-- Hindi ito nagbibigay ng karapatang magsulat.
create or replace function public.is_kiosk_admin_account()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = 'tagaytaykiosk@gmail.com';
$$;

-- ── 4. Sino ang admin — ngayon may 2FA na ──────────────────
-- `security definer`: kailangang mabasa ang table sa itaas, na sarado sa
-- naka-login.
create or replace function public.is_kiosk_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_kiosk_admin_account()
    and (
      coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
      or exists (
        select 1 from public.admin_mfa_trust t
        where t.user_id = auth.uid() and t.verified_at > now() - interval '12 hours'
      )
    );
$$;

notify pgrst, 'reload schema';
