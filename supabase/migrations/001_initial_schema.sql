-- Sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  language text not null check (language in ('english', 'german', 'arabic', 'hindi')),
  mode text not null check (mode in ('word_by_word', 'conversation', 'roleplay', 'pronunciation', 'grammar', 'listening', 'live_translation')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  voice_type text not null check (voice_type in ('gemini', 'microsoft')),
  user_name text,
  device_info jsonb default '{}'::jsonb,
  duration_seconds integer,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  browser_fingerprint text
);

-- Transcripts table
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'tutor')),
  content text not null,
  created_at timestamptz not null default now(),
  sequence_number integer not null
);

create index idx_transcripts_session on public.transcripts(session_id, sequence_number);

-- Session scores table
create table public.session_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  fluency numeric(4,1) check (fluency between 0.0 and 100.0),
  vocabulary numeric(4,1) check (vocabulary between 0.0 and 100.0),
  grammar numeric(4,1) check (grammar between 0.0 and 100.0),
  pronunciation numeric(4,1) check (pronunciation between 0.0 and 100.0),
  overall numeric(4,1) check (overall between 0.0 and 100.0),
  feedback_text text,
  strengths text[] default '{}',
  improvements text[] default '{}',
  suggested_next text,
  xp integer not null default 10 check (xp between 10 and 100),
  bangla_fallback_count integer not null default 0
);

create unique index idx_scores_session on public.session_scores(session_id);

-- Audio recordings table
create table public.audio_recordings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  storage_path text not null,
  duration_seconds integer,
  file_size_bytes integer,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.sessions enable row level security;
alter table public.transcripts enable row level security;
alter table public.session_scores enable row level security;
alter table public.audio_recordings enable row level security;

-- Service role can do everything (used by API routes)
create policy "Service role full access" on public.sessions
  for all using (auth.role() = 'service_role');
create policy "Service role full access" on public.transcripts
  for all using (auth.role() = 'service_role');
create policy "Service role full access" on public.session_scores
  for all using (auth.role() = 'service_role');
create policy "Service role full access" on public.audio_recordings
  for all using (auth.role() = 'service_role');

-- Anon role: insert sessions only (for creating sessions from browser via relay)
create policy "Anon can insert sessions" on public.sessions
  for insert with check (auth.role() = 'anon');

-- Create private storage bucket for audio
insert into storage.buckets (id, name, public)
  values ('audio-recordings', 'audio-recordings', false);
