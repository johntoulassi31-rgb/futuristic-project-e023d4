-- Mentoratplus initial Supabase schema.
-- The application uses Supabase Auth identities and RLS-protected per-user records.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  role text not null default 'student' check (role in ('student','teacher','admin')),
  country text not null default 'TG',
  institution text not null default 'Université de Lomé',
  field text not null default 'gestion-marketing',
  level text not null default 'licence-1',
  custom_institution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_mentoratplus_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  if requested_role not in ('student','teacher') then requested_role := 'student'; end if;
  insert into public.profiles (id,email,display_name,role)
  values (new.id,new.email,coalesce(new.raw_user_meta_data ->> 'display_name',''),requested_role);
  return new;
end;
$$;
revoke all on function public.handle_new_mentoratplus_user() from public, anon, authenticated;
create trigger on_auth_user_created_mentoratplus after insert on auth.users
for each row execute function public.handle_new_mentoratplus_user();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  title text not null, domain text not null, description text not null, role text not null,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index projects_owner_created_idx on public.projects(owner,created_at desc);

create table public.learning_spaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  career text, completed jsonb not null default '[]'::jsonb,
  portfolio jsonb not null default '[]'::jsonb, day text not null default '',
  profile jsonb not null default '{"country":"TG","institution":"Université de Lomé","field":"gestion-marketing","level":"licence-1","role":"student"}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, content text not null, explanation text not null default '',
  quiz jsonb, attempts jsonb not null default '[]'::jsonb,
  messages jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create index courses_user_created_idx on public.courses(user_id,created_at desc);

create table public.academic_resources (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null, title text not null, summary text not null, content text not null,
  country text not null, institution text not null, field text not null, level text not null, subject text not null,
  source_type text not null default 'enseignant' check(source_type in ('enseignant','institution','manuel','autre')),
  source_url text, status text not null default 'pending' check(status in ('pending','published','rejected')),
  verified_official boolean not null default false, review_note text,
  created_at timestamptz not null default now(), reviewed_at timestamptz
);
create index academic_resources_status_created_idx on public.academic_resources(status,created_at desc);
create index academic_resources_profile_idx on public.academic_resources(country,field,level,subject);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.learning_spaces enable row level security;
alter table public.courses enable row level security;
alter table public.academic_resources enable row level security;

grant select on public.profiles to authenticated;
grant update(display_name,country,institution,field,level,custom_institution,updated_at) on public.profiles to authenticated;
create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update own editable profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

grant select,insert,update,delete on public.projects to authenticated;
create policy "Users manage own projects" on public.projects for all to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);

grant select,insert,update,delete on public.learning_spaces to authenticated;
create policy "Users manage own learning space" on public.learning_spaces for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select,insert,update,delete on public.courses to authenticated;
create policy "Users manage own courses" on public.courses for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select on public.academic_resources to anon,authenticated;
create policy "Anyone can view published academic resources" on public.academic_resources
for select to anon,authenticated using (status='published');
create policy "Authors can view own submissions" on public.academic_resources
for select to authenticated using ((select auth.uid())=author_id);

comment on table public.profiles is 'Mentoratplus user profile; role is assigned at signup and is not client-editable.';
comment on table public.academic_resources is 'Shared academic library. Only server-side moderated submissions are published.';
