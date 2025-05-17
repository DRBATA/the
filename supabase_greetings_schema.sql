-- Table: user_greeting_preferences
-- Stores user name and preferred greeting tone/style

create table if not exists user_greeting_preferences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tone text not null,
  created_at timestamptz default now()
);
