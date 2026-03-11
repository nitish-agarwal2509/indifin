-- Create user_tokens table for storing OAuth provider tokens (e.g., Google access/refresh tokens for Gmail API)
create table if not exists user_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'google',
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);

-- Enable RLS
alter table user_tokens enable row level security;

-- Users can only manage their own tokens
create policy "Users can view own tokens"
  on user_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert own tokens"
  on user_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tokens"
  on user_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete own tokens"
  on user_tokens for delete
  using (auth.uid() = user_id);
