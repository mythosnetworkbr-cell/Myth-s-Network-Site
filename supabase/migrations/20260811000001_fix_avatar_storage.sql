-- Allow profile avatars to use avatars/<user-id>.jpg while keeping post media scoped to <user-id>/...
drop policy if exists "media own upload" on storage.objects;
drop policy if exists "media own update" on storage.objects;
drop policy if exists "media own delete" on storage.objects;
create policy "media own upload" on storage.objects for insert with check(
  bucket_id='rpgram-media' and (
    auth.uid()::text=split_part(name,'/',1)
    or (split_part(name,'/',1)='avatars' and auth.uid()::text=split_part(name,'/',2))
  )
);
create policy "media own update" on storage.objects for update using(
  bucket_id='rpgram-media' and (
    auth.uid()::text=split_part(name,'/',1)
    or (split_part(name,'/',1)='avatars' and auth.uid()::text=split_part(name,'/',2))
  )
);
create policy "media own delete" on storage.objects for delete using(
  bucket_id='rpgram-media' and (
    auth.uid()::text=split_part(name,'/',1)
    or (split_part(name,'/',1)='avatars' and auth.uid()::text=split_part(name,'/',2))
  )
);