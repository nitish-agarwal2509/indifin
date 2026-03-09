-- Create portfolios table to store uploaded CAS data
create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  uploaded_at timestamptz default now() not null,
  cas_period_from date,
  cas_period_to date,
  raw_text text not null,
  page_count integer,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table portfolios enable row level security;

-- Users can only see their own portfolios
create policy "Users can view own portfolios"
  on portfolios for select
  using (auth.uid() = user_id);

-- Users can insert their own portfolios
create policy "Users can insert own portfolios"
  on portfolios for insert
  with check (auth.uid() = user_id);

-- Users can delete their own portfolios
create policy "Users can delete own portfolios"
  on portfolios for delete
  using (auth.uid() = user_id);
