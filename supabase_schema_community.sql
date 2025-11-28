-- Create Threads Table
create table public.threads (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  user_id uuid references public.profiles(id) not null,
  category text not null, -- 'General', 'Relations', 'Region', 'Help'
  tags text[] default '{}',
  country text default 'AU',
  region text,
  is_global boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.threads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.threads enable row level security;
alter table public.comments enable row level security;

-- Policies for Threads
create policy "Threads are viewable by everyone" on public.threads
  for select using (true);

create policy "Users can insert their own threads" on public.threads
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own threads" on public.threads
  for update using (auth.uid() = user_id);

-- Policies for Comments
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Users can insert their own comments" on public.comments
  for insert with check (auth.uid() = user_id);
