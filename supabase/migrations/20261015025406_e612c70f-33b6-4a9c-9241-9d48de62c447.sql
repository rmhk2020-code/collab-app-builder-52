create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Member',
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Member',
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);
create table public.community_kudos (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_kudos enable row level security;
grant select, insert, delete on public.community_posts, public.community_comments, public.community_kudos to authenticated;
create policy "read posts" on public.community_posts for select to authenticated using (true);
create policy "own posts insert" on public.community_posts for insert to authenticated with check (auth.uid() = user_id);
create policy "own posts delete" on public.community_posts for delete to authenticated using (auth.uid() = user_id);
create policy "read comments" on public.community_comments for select to authenticated using (true);
create policy "own comments insert" on public.community_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "own comments delete" on public.community_comments for delete to authenticated using (auth.uid() = user_id);
create policy "read kudos" on public.community_kudos for select to authenticated using (true);
create policy "own kudos insert" on public.community_kudos for insert to authenticated with check (auth.uid() = user_id);
create policy "own kudos delete" on public.community_kudos for delete to authenticated using (auth.uid() = user_id);