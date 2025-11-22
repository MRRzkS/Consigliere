-- Create activities table
create table if not exists public.activities (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.clients(id) on delete cascade not null,
    type text check (type in ('Call', 'Meeting', 'Email', 'Note')) not null,
    content text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.clients(id) on delete cascade not null,
    title text not null,
    due_date timestamp with time zone,
    completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;
alter table public.tasks enable row level security;

-- Create policies (allow all for dev)
create policy "Allow all access for activities" on public.activities for all using (true) with check (true);
create policy "Allow all access for tasks" on public.tasks for all using (true) with check (true);
