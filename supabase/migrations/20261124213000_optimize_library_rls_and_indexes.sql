-- Improve resource author lookup and combine equivalent public SELECT policies.
drop policy "Anyone can view published academic resources" on public.academic_resources;
drop policy "Authors can view own submissions" on public.academic_resources;
create policy "Published resources and own submissions are visible"
on public.academic_resources for select to anon,authenticated
using (status='published' or (select auth.uid())=author_id);
create index academic_resources_author_created_idx on public.academic_resources(author_id,created_at desc);
