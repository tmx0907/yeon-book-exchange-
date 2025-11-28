-- 1. Profiles Table & Trigger
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  avatar_url text,
  state text,
  suburb text,
  points int default 50,
  join_date timestamp with time zone default timezone('utc'::text, now()) not null,
  favorite_quote text
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'https://i.pravatar.cc/150?u=' || new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Books Table
create table public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  isbn text,
  condition text,
  owner_id uuid references public.profiles(id) not null,
  owner_name text,
  location_state text,
  location_suburb text,
  points int default 10,
  image_url text,
  category text,
  status text default 'Available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.books enable row level security;
create policy "Books are viewable by everyone" on public.books for select using (true);
create policy "Users can insert their own books" on public.books for insert with check (auth.uid() = owner_id);
create policy "Users can update their own books" on public.books for update using (auth.uid() = owner_id);

-- 3. Chats Table
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  partner_a uuid references public.profiles(id) not null,
  partner_b uuid references public.profiles(id) not null,
  last_message text,
  last_message_time timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chats enable row level security;
create policy "Users can view their own chats" on public.chats for select using (auth.uid() = partner_a or auth.uid() = partner_b);
create policy "Users can insert chats" on public.chats for insert with check (auth.uid() = partner_a or auth.uid() = partner_b);
create policy "Users can update their own chats" on public.chats for update using (auth.uid() = partner_a or auth.uid() = partner_b);

-- 4. Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  text text not null,
  proposal_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;
create policy "Users can view messages in their chats" on public.messages 
  for select using (
    exists (
      select 1 from public.chats
      where id = messages.chat_id
      and (partner_a = auth.uid() or partner_b = auth.uid())
    )
  );
create policy "Users can insert messages in their chats" on public.messages 
  for insert with check (
    exists (
      select 1 from public.chats
      where id = messages.chat_id
      and (partner_a = auth.uid() or partner_b = auth.uid())
    )
  );
