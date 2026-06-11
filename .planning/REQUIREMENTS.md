# Requirements

## Database Schema

```sql
-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  student_id    text unique,
  email         text,
  avatar_url    text,
  storage_used_bytes bigint default 0,
  created_at    timestamptz default now()
);

-- Trigger: auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cloud documents (signed-in users only)
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles on delete cascade,
  filename      text not null,
  storage_path  text not null,
  file_type     text not null,
  page_count    int,
  size_bytes    bigint,
  created_at    timestamptz default now()
);

-- Print jobs
create table public.print_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles on delete set null,
  session_id      text not null,
  razorpay_order_id text,
  status          text default 'pending',
  -- status values: pending | paid | printing | completed | cancelled | failed
  total_amount_paise int,
  files           jsonb not null default '[]',
  -- [{file_id, filename, pages_selected, copies, color_mode, paper_size, sides, bw_pages, color_pages, subtotal_paise}]
  estimated_seconds int,
  created_at      timestamptz default now()
);

-- OTP sessions
create table public.otp_sessions (
  id            uuid primary key default gen_random_uuid(),
  print_job_id  uuid references public.print_jobs on delete cascade,
  otp_code      char(4) not null,
  expires_at    timestamptz not null,
  used          boolean default false,
  used_at       timestamptz,
  created_at    timestamptz default now()
);

-- Print config (admin-editable, fetched at runtime)
create table public.print_config (
  key           text primary key,
  value         text not null,
  label         text,
  updated_at    timestamptz default now()
);

-- Seed default config values
insert into public.print_config (key, value, label) values
  ('rate_bw_paise',             '200',  'B&W cost per page (paise)'),
  ('rate_color_paise',          '800',  'Color cost per page (paise)'),
  ('cloud_storage_limit_mb',    '500',  'Cloud storage per user (MB)'),
  ('otp_valid_minutes',         '15',   'OTP validity duration (minutes)'),
  ('session_timeout_minutes',   '30',   'Idle session timeout (minutes)'),
  ('kiosk_reset_seconds',       '90',   'Kiosk auto-reset on idle (seconds)'),
  ('temp_upload_ttl_hours',     '24',   'Temp upload auto-delete (hours)');
```

## Design System Directives

- **Typography**: Display/headings: `DM Serif Display` or `Playfair Display`. Body/UI: `DM Sans` or `Outfit`. OTP digits: `JetBrains Mono`. Fluid type scale via `clamp()`.
- **Colors**:
  - Primary: `#1A56DB` (blue)
  - Accent: `#0E9F6E` (green)
  - Warning: `#F59E0B` (amber)
  - Danger: `#EF4444` (red)
  - Neutral surface: `#F9FAFB`
  - Text primary: `#111827`, Text secondary: `#6B7280`
- **Spacing rhythm**: 4px base grid (4, 8, 12, 16, 24, 32, 48, 64px)
- **Interactive elements**: Buttons 48px height mobile, 64px kiosk. Rounded 8px corners. Inputs 48px height, 2px border, focus ring 3px offset primary. Transitions 150–200ms ease-out.
- **Feedback**: Skeleton screens for loading. Errors inline below field. Success checkmark + toast.
