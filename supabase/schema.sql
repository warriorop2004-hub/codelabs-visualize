-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Set up storage for avatars
insert into storage.buckets (id, name)
values ('avatars', 'avatars')
on conflict (id) do nothing;


-- Create custom types
create type public.profile_role as enum ('student', 'instructor');
create type public.experiment_difficulty as enum ('beginner', 'intermediate', 'advanced');
create type public.submission_status as enum ('pending', 'submitted', 'graded');

-- Create tables
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role public.profile_role default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 🔹 Automatically create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.profile_role;
  user_name text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'full_name', '');
  
  begin
    user_role := coalesce((new.raw_user_meta_data->>'role')::public.profile_role, 'student'::public.profile_role);
  exception when invalid_text_representation then
    user_role := 'student'::public.profile_role;
  end;

  insert into public.profiles (id, full_name, role)
  values (new.id, user_name, user_role)
  on conflict (id) do nothing;

  return new;
exception when others then
  raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
  return new;
end;
$$;

-- 🔹 Trigger: runs every time a new auth user is created
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  code text not null,
  name text not null,
  description text,
  instructor_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.experiments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text not null,
  difficulty public.experiment_difficulty default 'beginner',
  icon text not null,
  course_id uuid references public.courses,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.course_enrollments (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses not null,
  user_id uuid references auth.users not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course_id, user_id)
);

create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  experiment_id uuid references public.experiments not null,
  user_id uuid references auth.users not null,
  answers jsonb not null,
  experiment_state jsonb,
  status public.submission_status default 'pending',
  grade integer,
  feedback text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  graded_at timestamp with time zone
);

-- Create views
create view public.course_stats as
select 
  c.id as course_id,
  c.code,
  c.name,
  count(distinct ce.user_id) as student_count,
  count(distinct s.id) as submission_count,
  round(avg(case when s.status = 'graded' then s.grade else null end))::integer as avg_grade
from public.courses c
left join public.course_enrollments ce on ce.course_id = c.id
left join public.experiments e on e.course_id = c.id
left join public.submissions s on s.experiment_id = e.id
group by c.id, c.code, c.name;

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.experiments enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.submissions enable row level security;

-- Create policies
-- Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Instructors can view all profiles"
  on public.profiles for select
  using (auth.jwt() ->> 'role' = 'instructor');

-- ‼️ NOTE: The INSERT policy for profiles is INTENTIONALLY REMOVED.
-- The "handle_new_user" trigger is "SECURITY DEFINER" and
-- does not need an INSERT policy to work. The old policy:
-- "create policy ... on public.profiles for insert with check (auth.uid() = id);"
-- was CAUSING the 42501 error.

-- Courses
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

create policy "Instructors can create courses"
  on public.courses for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'instructor'
    )
  );

create policy "Instructors can update their own courses"
  on public.courses for update
  using (instructor_id = auth.uid());

-- Experiments
create policy "Anyone can view experiments"
  on public.experiments for select
  using (true);

create policy "Instructors can create experiments for their courses"
  on public.experiments for insert
  with check (
    exists (
      select 1 from public.courses
      where id = course_id
      and instructor_id = auth.uid()
    )
  );

-- Course Enrollments
create policy "Students can view their enrollments"
  on public.course_enrollments for select
  using (user_id = auth.uid());

create policy "Students can enroll themselves"
  on public.course_enrollments for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'student'
    )
  );

-- Submissions
create policy "Users can view their own submissions"
  on public.submissions for select
  using (user_id = auth.uid());

create policy "Instructors can view submissions for their courses"
  on public.submissions for select
  using (
    exists (
      select 1 from public.experiments e
      join public.courses c on c.id = e.course_id
      where e.id = experiment_id
      and c.instructor_id = auth.uid()
    )
  );

create policy "Students can submit their work"
  on public.submissions for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'student'
    )
  );

-- Create functions
create or replace function public.get_user_progress(p_user_id uuid)
returns table (
  total_experiments bigint,
  completed_experiments bigint,
  completion_percentage integer,
  recent_submissions json
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    count(distinct e.id)::bigint as total_experiments,
    count(distinct s.experiment_id)::bigint as completed_experiments,
    round((count(distinct s.experiment_id) * 100.0 / nullif(count(distinct e.id), 0))::numeric)::integer as completion_percentage,
    coalesce(
      (
        select json_agg(
          json_build_object(
            'id', s2.id,
            'experiment_name', e2.title,
            'submitted_at', s2.submitted_at,
            'status', s2.status
          )
        )
        from (
          select distinct on (experiment_id) *
          from public.submissions
          where user_id = p_user_id
          order by experiment_id, submitted_at desc
          limit 5
        ) s2
        join public.experiments e2 on e2.id = s2.experiment_id
      ),
      '[]'::json
    ) as recent_submissions
  from public.experiments e
  left join public.submissions s on s.experiment_id = e.id
  where s.user_id = p_user_id or s.user_id is null;
end;
$$;

-- Triggers
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.courses
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.experiments
  for each row
  execute function public.handle_updated_at();

-- Initial Data
insert into public.experiments (title, description, category, difficulty, icon) values
('Binary Search Tree', 'Interactive visualization of BST operations', 'data-structures', 'intermediate', 'GitBranch'),
('Sorting Algorithms', 'Compare and visualize sorting algorithms', 'algorithms', 'beginner', 'Layers'),
('TCP Handshake', 'Simulate TCP connection establishment', 'networks', 'beginner', 'Network'),
('CPU Scheduling', 'Visualize different scheduling algorithms', 'operating-systems', 'intermediate', 'Cpu'),
('Hash Tables', 'Learn hash table operations and collisions', 'data-structures', 'intermediate', 'Layers');