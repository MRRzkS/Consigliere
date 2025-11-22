-- Add new columns to clients table for CRM features
alter table public.clients
add column if not exists last_contact timestamp with time zone,
add column if not exists total_value bigint default 0,
add column if not exists source text;

-- Update existing clients with default values (optional)
update public.clients
set total_value = 0
where total_value is null;
