create extension if not exists "pgcrypto";
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,username text unique not null,display_name text not null default '',bio text not null default '',avatar_url text,server_name text,created_at timestamptz not null default now());
create table if not exists public.posts(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,image_url text not null,caption text not null default '',created_at timestamptz not null default now());
create table if not exists public.likes(user_id uuid not null references auth.users(id) on delete cascade,post_id uuid not null references public.posts(id) on delete cascade,created_at timestamptz not null default now(),primary key(user_id,post_id));
create table if not exists public.comments(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,post_id uuid not null references public.posts(id) on delete cascade,body text not null,created_at timestamptz not null default now());
create table if not exists public.follows(follower_id uuid not null references auth.users(id) on delete cascade,following_id uuid not null references auth.users(id) on delete cascade,created_at timestamptz not null default now(),primary key(follower_id,following_id),check(follower_id<>following_id));
create table if not exists public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,actor_id uuid references auth.users(id) on delete set null,type text not null,post_id uuid references public.posts(id) on delete cascade,read boolean not null default false,created_at timestamptz not null default now());
create table if not exists public.conversations(id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.conversation_members(conversation_id uuid not null references public.conversations(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,joined_at timestamptz not null default now(),primary key(conversation_id,user_id));
create table if not exists public.messages(id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations(id) on delete cascade,sender_id uuid not null references auth.users(id) on delete cascade,body text not null check(length(trim(body))>0 and length(body)<=4000),created_at timestamptz not null default now(),read_at timestamptz);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id,created_at);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id);

alter table public.profiles enable row level security;alter table public.posts enable row level security;alter table public.likes enable row level security;alter table public.comments enable row level security;alter table public.follows enable row level security;alter table public.notifications enable row level security;alter table public.conversations enable row level security;alter table public.conversation_members enable row level security;alter table public.messages enable row level security;
create policy "profiles readable" on public.profiles for select using(true);create policy "own profile insert" on public.profiles for insert with check(auth.uid()=id);create policy "own profile update" on public.profiles for update using(auth.uid()=id);
create policy "posts readable" on public.posts for select using(true);create policy "own posts insert" on public.posts for insert with check(auth.uid()=user_id);create policy "own posts update" on public.posts for update using(auth.uid()=user_id);create policy "own posts delete" on public.posts for delete using(auth.uid()=user_id);
create policy "likes readable" on public.likes for select using(true);create policy "own likes insert" on public.likes for insert with check(auth.uid()=user_id);create policy "own likes delete" on public.likes for delete using(auth.uid()=user_id);
create policy "comments readable" on public.comments for select using(true);create policy "own comments insert" on public.comments for insert with check(auth.uid()=user_id);create policy "own comments delete" on public.comments for delete using(auth.uid()=user_id);
create policy "follows readable" on public.follows for select using(true);create policy "own follows insert" on public.follows for insert with check(auth.uid()=follower_id);create policy "own follows delete" on public.follows for delete using(auth.uid()=follower_id);
create policy "own notifications readable" on public.notifications for select using(auth.uid()=user_id);create policy "own notifications update" on public.notifications for update using(auth.uid()=user_id);
create policy "conversation members readable" on public.conversation_members for select using(auth.uid()=user_id);
create policy "conversation members insert" on public.conversation_members for insert with check(auth.uid()=user_id);
create policy "conversations member readable" on public.conversations for select using(exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid()));
create policy "conversations member insert" on public.conversations for insert with check(true);
create policy "conversations member update" on public.conversations for update using(exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid()));
create policy "messages member readable" on public.messages for select using(exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid()));
create policy "messages own insert" on public.messages for insert with check(auth.uid()=sender_id and exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid()));
create policy "messages own update" on public.messages for update using(auth.uid()=sender_id or exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid()));

insert into storage.buckets(id,name,public) values('rpgram-media','rpgram-media',true) on conflict(id) do nothing;
create policy "media public read" on storage.objects for select using(bucket_id='rpgram-media');
create policy "media own upload" on storage.objects for insert with check(bucket_id='rpgram-media' and auth.uid()::text=split_part(name,'/',1));
create policy "media own update" on storage.objects for update using(bucket_id='rpgram-media' and auth.uid()::text=split_part(name,'/',1));
create policy "media own delete" on storage.objects for delete using(bucket_id='rpgram-media' and auth.uid()::text=split_part(name,'/',1));

alter publication supabase_realtime add table public.messages;
