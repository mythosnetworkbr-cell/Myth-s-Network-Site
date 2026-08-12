alter table public.posts add column if not exists media_type text not null default 'image';
alter table public.posts drop constraint if exists posts_media_type_check;
alter table public.posts add constraint posts_media_type_check check (media_type in ('image','video','reel'));
create index if not exists posts_media_type_created_at_idx on public.posts(media_type, created_at desc);

create table if not exists public.stories(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image','video')),
  caption text not null default '',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create index if not exists stories_expires_at_idx on public.stories(expires_at desc);
alter table public.stories enable row level security;
create policy "stories readable" on public.stories for select using (expires_at > now());
create policy "own stories insert" on public.stories for insert with check (auth.uid() = user_id);
create policy "own stories delete" on public.stories for delete using (auth.uid() = user_id);

insert into storage.buckets(id,name,public) values('rpgram-media','rpgram-media',true) on conflict(id) do nothing;
