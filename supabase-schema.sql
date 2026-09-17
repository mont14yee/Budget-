-- Supabase Schema for Budget App

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    name text,
    email text,
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Income Table
create table public.income (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    amount numeric(12, 2) not null,
    date date not null,
    category text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Expenses Table
create table public.expenses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    amount numeric(12, 2) not null,
    date date not null,
    category text not null,
    mood text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Savings Goals Table
create table public.savings_goals (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    target_amount numeric(12, 2) not null,
    deadline date not null,
    starting_balance numeric(12, 2) not null default 0,
    monthly_contribution numeric(12, 2) not null default 0,
    interest_rate numeric(5, 2) not null default 0,
    compounding_frequency text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Extra Contributions Table
create table public.extra_contributions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    savings_goal_id uuid references public.savings_goals(id) on delete cascade not null,
    amount numeric(12, 2) not null,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Loans Table
create table public.loans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    type text not null check (type in ('lent', 'borrowed')),
    person text not null,
    total_amount numeric(12, 2) not null,
    outstanding_amount numeric(12, 2) not null,
    interest_rate numeric(5, 2) not null default 0,
    interest_type text not null check (interest_type in ('simple', 'compound')),
    date date not null,
    due_date date not null,
    repayment_schedule text not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Repayments Table
create table public.repayments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    loan_id uuid references public.loans(id) on delete cascade not null,
    amount numeric(12, 2) not null,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Subscriptions Table
create table public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null check (type in ('expense', 'income')),
    amount numeric(12, 2) not null,
    frequency text not null,
    renewal_date date not null,
    category text not null,
    cancellation_url text,
    is_variable boolean default false,
    health text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Scheduled Transactions Table
create table public.scheduled_transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    amount numeric(12, 2) not null,
    category text not null,
    type text not null check (type in ('income', 'expense')),
    frequency text not null,
    start_date date not null,
    end_date date,
    next_due_date date not null,
    notes text,
    variance numeric(5, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Investments Table
create table public.investments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null,
    quantity numeric(18, 8) not null,
    purchase_price numeric(12, 2) not null,
    purchase_date date not null,
    current_price numeric(12, 2) not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.income enable row level security;
alter table public.expenses enable row level security;
alter table public.savings_goals enable row level security;
alter table public.extra_contributions enable row level security;
alter table public.loans enable row level security;
alter table public.repayments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scheduled_transactions enable row level security;
alter table public.investments enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Income Policies
create policy "Users can manage own income" on public.income for all using (auth.uid() = user_id);
-- Expenses Policies
create policy "Users can manage own expenses" on public.expenses for all using (auth.uid() = user_id);
-- Savings Goals Policies
create policy "Users can manage own savings goals" on public.savings_goals for all using (auth.uid() = user_id);
-- Extra Contributions Policies
create policy "Users can manage own extra contributions" on public.extra_contributions for all using (auth.uid() = user_id);
-- Loans Policies
create policy "Users can manage own loans" on public.loans for all using (auth.uid() = user_id);
-- Repayments Policies
create policy "Users can manage own repayments" on public.repayments for all using (auth.uid() = user_id);
-- Subscriptions Policies
create policy "Users can manage own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);
-- Scheduled Transactions Policies
create policy "Users can manage own scheduled transactions" on public.scheduled_transactions for all using (auth.uid() = user_id);
-- Investments Policies
create policy "Users can manage own investments" on public.investments for all using (auth.uid() = user_id);

-- Create a trigger to automatically create a profile for new users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User'), 
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
