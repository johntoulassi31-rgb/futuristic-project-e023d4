import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const initial=await read('../supabase/migrations/20261124212000_mentoratplus_initial_schema.sql');
const optimize=await read('../supabase/migrations/20261124213000_optimize_library_rls_and_indexes.sql');
const edge=await read('../supabase/functions/mentoratplus-api/index.ts');
const client=await read('../src/lib/supabase.js');
const api=await read('../src/lib/api.js');
const auth=await read('../src/AuthPanel.jsx');

test('Supabase schema protects user data with RLS and ownership foreign keys',()=>{
 for(const table of ['profiles','projects','learning_spaces','courses','academic_resources'])assert.match(initial,new RegExp('alter table public\\.'+table+' enable row level security','i'));
 assert.match(initial,/owner uuid not null references auth\.users\(id\)/i);
 assert.match(initial,/user_id uuid not null references auth\.users\(id\)/i);
 assert.match(initial,/using \(\(select auth\.uid\(\)\) = owner\)/i);
 assert.match(initial,/using \(\(select auth\.uid\(\)\) = user_id\)/i);
});

test('Public library only exposes published content and authors their own submissions',()=>{
 assert.match(initial,/status='published'/);
 assert.match(initial,/\(select auth\.uid\(\)\)=author_id/);
 assert.match(optimize,/Published resources and own submissions are visible/);
 assert.match(optimize,/academic_resources_author_created_idx/);
 assert.doesNotMatch(initial,/grant insert,update,delete on public\.academic_resources to anon/i);
});

test('Public registration cannot assign administrator privileges',()=>{
 assert.match(initial,/requested_role not in \('student','teacher'\)/);
 assert.match(initial,/revoke all on function public\.handle_new_mentoratplus_user\(\) from public, anon, authenticated/i);
 assert.match(initial,/grant update\(display_name,country,institution,field,level,custom_institution,updated_at\) on public\.profiles to authenticated/i);
});

test('Edge Function validates Supabase JWT and server-side account role',()=>{
 assert.match(edge,/admin\.auth\.getUser\(token\)/);
 assert.match(edge,/profile\.role/);
 assert.match(edge,/eq\("owner",owner\)/);
 assert.match(edge,/eq\("user_id",owner\)/);
 assert.match(edge,/profile\.role!=="admin"/);
 assert.match(edge,/OPENAI_API_KEY/);
});

test('Browser client only contains the publishable key and calls the protected Edge Function',()=>{
 assert.match(client,/sb_publishable_/);
 assert.doesNotMatch(client,/sb_secret_|service_role/i);
 assert.match(api,/functions\.invoke\('mentoratplus-api'/);
 assert.match(auth,/supabase\.auth\.signUp/);
 assert.match(auth,/supabase\.auth\.signInWithPassword/);
});
