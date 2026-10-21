-- ILMORA: student data, one row set per authenticated user, protected by RLS.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  daily_goal_minutes int not null default 10 check (daily_goal_minutes between 1 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.writing_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('letter', 'form', 'joining', 'word', 'quran', 'free')),
  ref_id text not null,
  title text not null,
  arabic text not null default '',
  guide_shown boolean not null default true,
  strokes jsonb not null,
  width int not null,
  height int not null,
  created_at timestamptz not null default now()
);
create index if not exists writing_attempts_user_idx on public.writing_attempts (user_id, created_at desc);

create table if not exists public.recordings (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  lesson_ref text,
  duration_ms int not null default 0,
  storage_path text,
  created_at timestamptz not null default now()
);
create index if not exists recordings_user_idx on public.recordings (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.writing_attempts enable row level security;
alter table public.recordings enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own progress" on public.progress_snapshots
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own attempts" on public.writing_attempts
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own recordings" on public.recordings
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Create the profile row when a student registers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Private bucket for recitation audio, one folder per student: recordings/<user id>/<file>.
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', false)
  on conflict (id) do nothing;

create policy "own audio read" on storage.objects for select to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own audio write" on storage.objects for insert to authenticated
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own audio delete" on storage.objects for delete to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = (select auth.uid())::text);
