-- =========================================================
-- Storage bucket for the media library.
-- Public bucket: anyone can read a file if they know its path
-- (fine for portfolio images), only the authenticated admin can
-- upload/delete.
-- =========================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_bucket_public_read"
on storage.objects for select
using (bucket_id = 'media');

create policy "media_bucket_admin_write"
on storage.objects for insert
with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_bucket_admin_update"
on storage.objects for update
using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_bucket_admin_delete"
on storage.objects for delete
using (bucket_id = 'media' and auth.role() = 'authenticated');
