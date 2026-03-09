-- Create schemes table
create table if not exists schemes (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) on delete cascade not null,
  scheme_name text not null,
  scheme_code text, -- AMFI scheme code (populated later)
  folio_number text not null,
  amc text not null,
  category text not null check (category in ('equity', 'debt', 'hybrid', 'other')),
  registrar text,
  closing_units decimal not null,
  closing_nav decimal,
  closing_value decimal,
  cost_value decimal,
  gain_loss decimal,
  xirr decimal,
  created_at timestamptz default now() not null
);

-- Create transactions table
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid references schemes(id) on delete cascade not null,
  date date not null,
  description text not null,
  amount decimal not null,
  units decimal not null,
  nav decimal not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table schemes enable row level security;
alter table transactions enable row level security;

-- Schemes: users can view/insert/delete their own (via portfolio ownership)
create policy "Users can view own schemes"
  on schemes for select
  using (
    portfolio_id in (
      select id from portfolios where user_id = auth.uid()
    )
  );

create policy "Users can insert own schemes"
  on schemes for insert
  with check (
    portfolio_id in (
      select id from portfolios where user_id = auth.uid()
    )
  );

create policy "Users can delete own schemes"
  on schemes for delete
  using (
    portfolio_id in (
      select id from portfolios where user_id = auth.uid()
    )
  );

-- Transactions: users can view/insert/delete their own (via scheme → portfolio ownership)
create policy "Users can view own transactions"
  on transactions for select
  using (
    scheme_id in (
      select s.id from schemes s
      join portfolios p on s.portfolio_id = p.id
      where p.user_id = auth.uid()
    )
  );

create policy "Users can insert own transactions"
  on transactions for insert
  with check (
    scheme_id in (
      select s.id from schemes s
      join portfolios p on s.portfolio_id = p.id
      where p.user_id = auth.uid()
    )
  );

create policy "Users can delete own transactions"
  on transactions for delete
  using (
    scheme_id in (
      select s.id from schemes s
      join portfolios p on s.portfolio_id = p.id
      where p.user_id = auth.uid()
    )
  );

-- Update portfolios table to store parsed investor info
alter table portfolios
  add column if not exists investor_name text,
  add column if not exists pan text,
  add column if not exists email text,
  add column if not exists total_invested decimal,
  add column if not exists total_current_value decimal,
  add column if not exists total_gain_loss decimal,
  add column if not exists portfolio_xirr decimal,
  add column if not exists is_parsed boolean default false;
