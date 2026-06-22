-- ==========================================
-- HIREFLOW DATABASE SETUP SCRIPT (POSTGRESQL)
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Profiles Table (Linked to Auth.Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text check (role in ('candidate', 'recruiter')) default 'candidate',
  resume_url text,
  avatar_url text,
  skills text[],
  bio text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on Profiles
alter table public.profiles enable row level security;

-- 2. Create Jobs Table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  department text not null,
  location text not null,
  type text check (type in ('Full-time', 'Part-time', 'Internship', 'Contract', 'Remote')) default 'Full-time',
  salary_range text,
  description text,
  requirements text,
  status text check (status in ('active', 'closed')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Jobs
alter table public.jobs enable row level security;

-- 3. Create Applications Table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('applied', 'screening', 'interviewing', 'offered', 'rejected')) default 'applied',
  resume_url text,
  cover_letter text,
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Applications
alter table public.applications enable row level security;

-- 4. Create Interviews Table
create table public.interviews (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  scheduled_at timestamp with time zone not null,
  interviewer_name text not null,
  meeting_link text,
  feedback text,
  score integer check (score >= 1 and score <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Interviews
alter table public.interviews enable row level security;


-- ==========================================
-- AUTOMATIC USER CREATION TRIGGER
-- ==========================================

-- Trigger function to insert a public profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run handle_new_user on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- --- Profiles Policies ---
create policy "Allow public read access to profiles" 
  on public.profiles for select 
  using (true);

create policy "Allow users to update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- --- Jobs Policies ---
create policy "Allow public read access to jobs" 
  on public.jobs for select 
  using (true);

create policy "Allow recruiters to insert jobs" 
  on public.jobs for insert 
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );

create policy "Allow recruiters to update jobs" 
  on public.jobs for update 
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );

create policy "Allow recruiters to delete jobs" 
  on public.jobs for delete 
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );

-- --- Applications Policies ---
create policy "Allow users to view their own applications" 
  on public.applications for select 
  using (
    auth.uid() = candidate_id or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );

create policy "Allow candidates to insert applications" 
  on public.applications for insert 
  with check (auth.uid() = candidate_id);

create policy "Allow recruiters/candidates to update applications" 
  on public.applications for update 
  using (
    auth.uid() = candidate_id or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );

-- --- Interviews Policies ---
create policy "Allow users to view their own interviews" 
  on public.interviews for select 
  using (
    exists (
      select 1 from public.applications 
      where id = application_id and candidate_id = auth.uid()
    ) or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );

create policy "Allow recruiters to manage interviews" 
  on public.interviews for all 
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'recruiter'
    )
  );


-- ==========================================
-- SEED SAMPLE DATA FOR TESTING
-- ==========================================

-- Insert sample jobs (since these don't reference auth users directly, they can be inserted freely)
insert into public.jobs (title, department, location, type, salary_range, description, requirements, status)
values 
('Frontend Developer Intern', 'Engineering', 'Hanoi, Vietnam (Hybrid)', 'Internship', '5,000,000 - 8,000,000 VND', 'We are looking for a passionate Frontend Intern to build stunning UI components using React and modern CSS.', 'Basic understanding of HTML/CSS/JS. Familiarity with React is a plus. Eager to learn.', 'active'),
('Backend Engineer (Node.js/SQL)', 'Engineering', 'Ho Chi Minh City, Vietnam (Remote)', 'Full-time', '15,000,000 - 25,000,000 VND', 'Join our core backend team to design database schemas, optimize SQL queries, and build robust API services.', 'Solid knowledge of JavaScript/TypeScript and SQL databases. Node.js experience of 1+ years.', 'active'),
('UI/UX Designer Intern', 'Product & Design', 'Hanoi, Vietnam (On-site)', 'Internship', '4,000,000 - 6,000,000 VND', 'Collaborate with product managers and engineers to create beautiful mockups, user flows, and wireframes.', 'Proficiency in Figma. Strong portfolio demonstrating clean, grid-based layouts and color theory.', 'active');
