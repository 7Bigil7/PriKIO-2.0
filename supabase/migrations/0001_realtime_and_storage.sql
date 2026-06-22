-- Enable Realtime for print_jobs
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.print_jobs;

-- Create Storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Set up RLS for storage (Allow authenticated users to upload)
create policy "Users can upload their own documents"
on storage.objects for insert to authenticated
with check ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can view their own documents"
on storage.objects for select to authenticated
using ( bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1] );

-- Service role bypasses RLS, so the API routes and Raspberry Pi will have full access.
