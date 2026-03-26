-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Tasks table
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  notes        text,
  date         date not null,
  start_time   time not null,
  end_time     time not null,
  color        text not null default 'blue',
  icon         text not null default 'star',
  completed    boolean not null default false,
  recurrence   text not null default 'none',
  recurrence_end_date date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Habits table
create table if not exists public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  color        text not null default 'blue',
  icon         text not null default 'star',
  frequency    text not null default 'daily',
  target_days  integer[] not null default '{0,1,2,3,4,5,6}',
  created_at   timestamptz not null default now()
);

-- Habit logs table
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  completed  boolean not null default false,
  unique(habit_id, date)
);

-- Row Level Security
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- Tasks RLS
create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Habits RLS
create policy "Users can manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Habit logs RLS
create policy "Users can manage own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Updated at trigger
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();
