-- BERSAMA · migrasi awal (SPIKE pra-Hacking Day, jangan dibawa ke repo final)
-- Sumber: DBML tim (dbdiagram.io, proyek `bersama`) + perbaikan docs/blueprint/07-review-dbml.md.
-- Prinsip: RLS adalah IFC lapis 1. Tabel internal (jobs, outbox, llm_calls, audit_log, harga)
-- tidak punya policy untuk `authenticated`, sehingga tertutup bagi klien.

create extension if not exists vector;

-- ───────────────────────────── Enum ─────────────────────────────
create type public.member_role as enum ('member', 'lead');
create type public.team_tier as enum ('free', 'pro');
create type public.room_type as enum ('team', 'private');
create type public.memory_type as enum ('decision', 'task', 'rationale', 'note');
create type public.memory_scope as enum ('private', 'team');
create type public.memory_sensitivity as enum ('normal', 'pii');
-- 07-review B: tambah `rejected`
create type public.memory_status as enum ('proposed', 'confirmed', 'rejected', 'superseded');
create type public.edge_kind as enum ('supersedes', 'depends_on', 'about_kc', 'owned_by', 'conflicts_with');
create type public.grader_kind as enum ('ai', 'peer');
create type public.attempt_status as enum ('grading', 'graded', 'abstained', 'peer_graded', 'failed');
create type public.policy_decision as enum ('allow', 'deny');
-- 07-review A7: konvensi tanda. topup +, hold −H, release +H (penuh), charge −P, refund +.
create type public.ledger_entry_type as enum ('topup', 'hold', 'charge', 'release', 'refund');
create type public.job_status as enum ('queued', 'running', 'done', 'failed', 'dead');
create type public.agent_kind as enum ('personal', 'team');
create type public.taint_label as enum ('none', 'private');

-- ───────────────────────────── Identitas ─────────────────────────────
-- 07-review C1: id = auth.users.id, email tidak disalin ke tabel publik.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name varchar(120) not null,
  consent_explainback boolean not null default false,
  consent_voice boolean not null default false,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  tier public.team_tier not null default 'free',            -- 07-review C2
  spend_limit_idr bigint check (spend_limit_idr is null or spend_limit_idr >= 0),
  daily_token_quota integer not null default 200000 check (daily_token_quota > 0),
  retention_until timestamptz,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.member_role not null default 'member',
  spend_limit_idr bigint check (spend_limit_idr is null or spend_limit_idr >= 0),
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);
create index on public.memberships (user_id);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  token_hash text not null unique,
  created_by uuid references public.users (id) on delete set null,
  expires_at timestamptz not null,
  used_by uuid references public.users (id) on delete set null,
  used_at timestamptz
);

-- ───────────────────────────── Chat dan memori ─────────────────────────────
-- 07-review A2: author_id SET NULL agar pesan Ruang Tim (sumber sitasi) tetap ada.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  room public.room_type not null,
  author_id uuid references public.users (id) on delete set null,
  body text not null check (length(body) between 1 and 8000),
  client_msg_id text not null,
  created_at timestamptz not null default clock_timestamp(),
  unique (author_id, client_msg_id)
);
create index on public.messages (team_id, room, created_at, id);
create index on public.messages (author_id);

create table public.memory_items (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  type public.memory_type not null,
  content jsonb not null,
  owner_id uuid references public.users (id) on delete set null,   -- 07-review A2
  scope public.memory_scope not null,
  sensitivity public.memory_sensitivity not null default 'normal',
  status public.memory_status not null default 'proposed',
  ai_assisted boolean not null default false,                       -- 07-review B
  valid_from timestamptz,
  valid_to timestamptz,
  recorded_at timestamptz not null default now(),
  source_message_ids uuid[] not null default '{}',
  prompt_version varchar(64),
  model_version varchar(128),
  confirmed_by uuid references public.users (id) on delete set null, -- 07-review A1
  confirmed_at timestamptz,
  fts tsvector generated always as (
    to_tsvector('indonesian'::regconfig,
      coalesce(content ->> 'title', '') || ' ' ||
      coalesce(content ->> 'chosen_option', '') || ' ' ||
      coalesce(content ->> 'rationale', '') || ' ' ||
      coalesce(content ->> 'text', ''))
  ) stored,
  unique (team_id, id),                                              -- 07-review A5
  check (valid_to is null or valid_from is null or valid_to > valid_from),
  check (scope <> 'private' or owner_id is not null)
);
create index on public.memory_items (team_id, status, valid_from);   -- 07-review C4
create index on public.memory_items (team_id, scope, owner_id);
create index on public.memory_items using gin (fts);

create table public.memory_evidence (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.memory_items (id) on delete cascade,
  field varchar(64) not null,
  message_id uuid references public.messages (id) on delete set null,
  quote text not null
);
create index on public.memory_evidence (item_id);

create table public.knowledge_components (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  name varchar(160) not null,
  criticality smallint not null default 1 check (criticality between 1 and 3),
  created_by varchar(8) not null default 'human' check (created_by in ('ai', 'human')),
  merged_into uuid references public.knowledge_components (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (team_id, name),
  unique (team_id, id)
);

create table public.kc_contributors (
  kc_id uuid not null references public.knowledge_components (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  primary key (kc_id, user_id)
);

-- 07-review A4 + A5: tepat satu dst_*, cocok dengan kind, dan tidak lintas tim.
create table public.memory_edges (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  kind public.edge_kind not null,
  src_item_id uuid not null,
  dst_item_id uuid,
  dst_kc_id uuid,
  dst_user_id uuid references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  foreign key (team_id, src_item_id) references public.memory_items (team_id, id) on delete cascade,
  foreign key (team_id, dst_item_id) references public.memory_items (team_id, id) on delete cascade,
  foreign key (team_id, dst_kc_id) references public.knowledge_components (team_id, id) on delete cascade,
  check (num_nonnulls(dst_item_id, dst_kc_id, dst_user_id) = 1),
  check (
    (kind in ('supersedes', 'depends_on', 'conflicts_with') and dst_item_id is not null) or
    (kind = 'about_kc' and dst_kc_id is not null) or
    (kind = 'owned_by' and dst_user_id is not null)
  ),
  check (dst_item_id is null or dst_item_id <> src_item_id)
);
create unique index on public.memory_edges (src_item_id, kind, dst_item_id) where dst_item_id is not null;
create unique index on public.memory_edges (src_item_id, kind, dst_kc_id) where dst_kc_id is not null;
create unique index on public.memory_edges (src_item_id, kind, dst_user_id) where dst_user_id is not null;
create index on public.memory_edges (team_id, kind);
create index on public.memory_edges (dst_item_id);
create index on public.memory_edges (dst_kc_id);

-- 07-review A6: dimensi tetap agar bisa diindeks HNSW. Ganti 768 bila model embedding berbeda.
create table public.embeddings (
  item_id uuid primary key references public.memory_items (id) on delete cascade,
  model varchar(128) not null,
  vector vector(768) not null
);
create index on public.embeddings using hnsw (vector vector_cosine_ops);

create table public.passport_shares (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  source_item_id uuid references public.memory_items (id) on delete set null,
  shared_item_id uuid not null references public.memory_items (id) on delete cascade,
  masked_spans jsonb not null default '[]'::jsonb,
  approved_by uuid references public.users (id) on delete set null,
  approved_at timestamptz not null default now()
);

create table public.extraction_cursors (
  team_id uuid primary key references public.teams (id) on delete cascade,
  last_created_at timestamptz not null,
  last_message_id uuid not null
);

-- ───────────────────────────── Pemahaman ─────────────────────────────
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  kc_id uuid not null,
  item_id uuid not null,
  stem text not null,                                                -- DBML: `prompt`
  bloom_level smallint not null check (bloom_level between 1 and 3),
  reference_answer text not null,
  rubric jsonb not null default '[]'::jsonb,
  irt_a double precision not null default 1 check (irt_a > 0),
  irt_b double precision not null default 0,
  answerable boolean not null default true,
  prompt_version varchar(64),
  created_at timestamptz not null default now(),
  foreign key (team_id, kc_id) references public.knowledge_components (team_id, id) on delete cascade,
  foreign key (team_id, item_id) references public.memory_items (team_id, id) on delete cascade
);
create index on public.questions (team_id, kc_id);
create index on public.questions (item_id);

-- 07-review A3: simpan ai_grade dan human_grade terpisah untuk kalibrasi conformal.
create table public.check_attempts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  client_key text not null,
  answer text not null check (length(answer) between 1 and 4000),
  status public.attempt_status not null default 'grading',
  ai_grade smallint check (ai_grade between 0 and 2),
  sample_grades smallint[],
  uncertainty double precision check (uncertainty between 0 and 1),
  abstained boolean not null default false,
  lambda_used double precision,
  lambda_source varchar(16) check (lambda_source in ('heuristic', 'conformal')),
  human_grade smallint check (human_grade between 0 and 2),
  final_grade smallint check (final_grade between 0 and 2),
  graded_by public.grader_kind,
  ai_assisted boolean not null default false,
  feedback text,
  created_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (user_id, client_key)
);
create index on public.check_attempts (user_id, created_at);
create index on public.check_attempts (question_id);

create table public.mastery (
  user_id uuid not null references public.users (id) on delete cascade,
  kc_id uuid not null references public.knowledge_components (id) on delete cascade,
  p_mastery double precision not null check (p_mastery between 0 and 1),
  n_evidence integer not null default 0,
  last_evidence_at timestamptz,
  primary key (user_id, kc_id)
);

create table public.peer_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  attempt_id uuid not null unique references public.check_attempts (id) on delete cascade,
  explainer_id uuid not null references public.users (id) on delete cascade,
  learner_id uuid not null references public.users (id) on delete cascade,
  status varchar(8) not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

-- ───────────────────────────── Agent ─────────────────────────────
create table public.agent_answers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  agent public.agent_kind not null,
  question text not null,
  answer text not null,
  citations jsonb not null default '[]'::jsonb,
  taint public.taint_label not null,
  context_item_ids uuid[] not null default '{}',
  abstained boolean not null default false,
  posted_message_id uuid references public.messages (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ───────────────────────────── Infrastruktur ─────────────────────────────
create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  type varchar(64) not null,
  object_id uuid,
  payload jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz                                           -- 07-review B
);
create index on public.outbox_events (processed_at) where processed_at is null;

create table public.agent_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  event_id uuid not null references public.outbox_events (id) on delete cascade,
  relevance double precision not null check (relevance between 0 and 1),
  delivered boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);
create index on public.agent_inbox (user_id, delivered);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  kind varchar(64) not null,
  payload jsonb not null default '{}'::jsonb,
  status public.job_status not null default 'queued',
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  run_after timestamptz not null default now(),
  locked_by text,
  locked_at timestamptz,
  last_error text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Satu job antre per kunci. Job yang sedang berjalan boleh berdampingan dengan satu job antre baru.
create unique index jobs_queued_key on public.jobs (idempotency_key) where status = 'queued';
create index on public.jobs (run_after) where status = 'queued';

create table public.model_prices (
  id uuid primary key default gen_random_uuid(),
  version integer not null,
  provider varchar(64) not null,
  model varchar(128) not null,
  price_in_usd_per_mtok numeric(12, 6) not null check (price_in_usd_per_mtok >= 0),
  price_out_usd_per_mtok numeric(12, 6) not null check (price_out_usd_per_mtok >= 0),
  usd_idr numeric(12, 2) not null check (usd_idr > 0),
  fx_buffer numeric(6, 4) not null check (fx_buffer >= 1),
  margin numeric(6, 4) not null check (margin >= 0),
  f_call_idr numeric(12, 4) not null check (f_call_idr >= 0),
  effective_from timestamptz not null,
  unique (provider, model, version)
);

create table public.llm_calls (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete cascade,
  task varchar(32) not null,
  provider varchar(64) not null,
  model varchar(128) not null,
  prompt_version varchar(64),
  input_hash char(64) not null,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  latency_ms integer not null default 0,
  cost_idr bigint not null default 0,
  status varchar(16) not null,
  error text,
  response_text text,
  price_version_id uuid references public.model_prices (id),
  created_at timestamptz not null default now()
);
create index on public.llm_calls (task, input_hash, created_at desc);
create index on public.llm_calls (team_id, created_at);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,   -- 07-review A1
  entry_type public.ledger_entry_type not null,
  amount_idr bigint not null,
  tokens_in integer,
  tokens_out integer,
  model varchar(128),
  price_version_id uuid references public.model_prices (id),
  hold_id uuid,
  idempotency_key text,
  created_at timestamptz not null default now(),
  check (
    (entry_type in ('topup', 'release', 'refund') and amount_idr >= 0) or
    (entry_type in ('hold', 'charge') and amount_idr <= 0)
  ),
  unique (team_id, idempotency_key)
);
create index on public.credit_ledger (team_id, created_at);
create index on public.credit_ledger (hold_id);

-- 07-review A1 + C7: tanpa FK ke users (log tidak ikut terhapus), append-only via trigger.
create table public.audit_log (
  id bigint generated always as identity primary key,
  team_id uuid,
  actor_user_id uuid,
  actor_agent varchar(16),
  action varchar(64) not null,
  object_type varchar(64),
  object_id uuid,
  policy_decision public.policy_decision not null,
  reason text,
  at timestamptz not null default now()
);
create index on public.audit_log (team_id, at);

create function public.forbid_mutation() returns trigger language plpgsql as $$
begin
  raise exception 'audit_log bersifat append-only';
end $$;
create trigger audit_log_append_only before update or delete on public.audit_log
  for each row execute function public.forbid_mutation();

-- ───────────────────────────── Fungsi bantu ─────────────────────────────
create function public.is_member(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m where m.team_id = t and m.user_id = auth.uid()
  )
$$;

create function public.is_lead(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.team_id = t and m.user_id = auth.uid() and m.role = 'lead'
  )
$$;

create function public.shares_team_with(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships a join public.memberships b on a.team_id = b.team_id
    where a.user_id = auth.uid() and b.user_id = other
  )
$$;

create function public.ledger_balance(t uuid) returns bigint
language sql stable security definer set search_path = '' as $$
  select coalesce(sum(amount_idr), 0)::bigint from public.credit_ledger where team_id = t
$$;

-- Profil otomatis saat pengguna Supabase Auth dibuat.
create function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, 'anggota'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 07-review A2: hak hapus. M1, pesan pribadi, dan data pemahaman individu dihapus;
-- item tim dan pesan Ruang Tim dianonimkan oleh ON DELETE SET NULL.
create function public.erase_personal_data() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.memory_items where owner_id = old.id and scope = 'private';
  delete from public.messages where author_id = old.id and room = 'private';
  return old;
end $$;
create trigger users_erase_personal before delete on public.users
  for each row execute function public.erase_personal_data();

-- ───────────────────────────── RLS ─────────────────────────────
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.memberships enable row level security;
alter table public.invites enable row level security;
alter table public.messages enable row level security;
alter table public.memory_items enable row level security;
alter table public.memory_evidence enable row level security;
alter table public.memory_edges enable row level security;
alter table public.embeddings enable row level security;
alter table public.passport_shares enable row level security;
alter table public.extraction_cursors enable row level security;
alter table public.knowledge_components enable row level security;
alter table public.kc_contributors enable row level security;
alter table public.questions enable row level security;
alter table public.check_attempts enable row level security;
alter table public.mastery enable row level security;
alter table public.peer_requests enable row level security;
alter table public.agent_answers enable row level security;
alter table public.outbox_events enable row level security;
alter table public.agent_inbox enable row level security;
alter table public.jobs enable row level security;
alter table public.model_prices enable row level security;
alter table public.llm_calls enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.audit_log enable row level security;

-- Hak dasar. Klien tidak pernah mendapat akses ke tabel internal.
revoke all on all tables in schema public from anon, authenticated;
grant select, update (display_name, consent_explainback, consent_voice, consent_at) on public.users to authenticated;
grant select on public.teams, public.memberships to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.memory_items to authenticated;
grant update (status, content, ai_assisted, valid_from, valid_to, confirmed_by, confirmed_at)
  on public.memory_items to authenticated;
grant select on public.memory_evidence, public.memory_edges, public.embeddings, public.passport_shares
  to authenticated;
grant select, insert, update (name, criticality, merged_into) on public.knowledge_components to authenticated;
grant select on public.kc_contributors, public.questions to authenticated;
grant select, insert on public.check_attempts to authenticated;
grant update (human_grade, final_grade, graded_by, status, graded_at) on public.check_attempts to authenticated;
grant select on public.mastery to authenticated;
grant select, update (status) on public.peer_requests to authenticated;
grant select, insert on public.agent_answers to authenticated;
grant update (posted_message_id) on public.agent_answers to authenticated;
grant select, update (delivered) on public.agent_inbox to authenticated;
grant select on public.credit_ledger to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
revoke execute on function public.ledger_balance(uuid) from public;
grant execute on function public.ledger_balance(uuid) to service_role;

create policy users_read on public.users for select to authenticated
  using (id = auth.uid() or public.shares_team_with(id));
create policy users_update_self on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy teams_read on public.teams for select to authenticated using (public.is_member(id));
create policy memberships_read on public.memberships for select to authenticated
  using (public.is_member(team_id));

create policy messages_read on public.messages for select to authenticated using (
  public.is_member(team_id) and (room = 'team' or author_id = auth.uid())
);
create policy messages_insert on public.messages for insert to authenticated with check (
  author_id = auth.uid() and public.is_member(team_id)
);

create policy memory_read on public.memory_items for select to authenticated using (
  public.is_member(team_id) and (scope = 'team' or owner_id = auth.uid())
);
-- Klien hanya boleh membuat catatan pribadi (M1). Item tim dibuat worker/passport.
create policy memory_insert_private on public.memory_items for insert to authenticated with check (
  scope = 'private' and owner_id = auth.uid() and public.is_member(team_id)
);
create policy memory_update on public.memory_items for update to authenticated
  using (public.is_member(team_id) and (scope = 'team' or owner_id = auth.uid()))
  with check (public.is_member(team_id) and (scope = 'team' or owner_id = auth.uid()));

create policy evidence_read on public.memory_evidence for select to authenticated using (
  exists (select 1 from public.memory_items i where i.id = memory_evidence.item_id)
);
create policy edges_read on public.memory_edges for select to authenticated using (
  exists (select 1 from public.memory_items i where i.id = memory_edges.src_item_id)
  and (memory_edges.dst_item_id is null
       or exists (select 1 from public.memory_items i where i.id = memory_edges.dst_item_id))
);
create policy embeddings_read on public.embeddings for select to authenticated using (
  exists (select 1 from public.memory_items i where i.id = embeddings.item_id)
);
create policy passport_read on public.passport_shares for select to authenticated
  using (public.is_member(team_id));

create policy kc_read on public.knowledge_components for select to authenticated
  using (public.is_member(team_id));
create policy kc_insert on public.knowledge_components for insert to authenticated
  with check (public.is_member(team_id) and created_by = 'human');
create policy kc_update on public.knowledge_components for update to authenticated
  using (public.is_member(team_id)) with check (public.is_member(team_id));
create policy kc_contrib_read on public.kc_contributors for select to authenticated using (
  exists (select 1 from public.knowledge_components k where k.id = kc_contributors.kc_id)
);
create policy questions_read on public.questions for select to authenticated
  using (public.is_member(team_id));

create policy attempts_read on public.check_attempts for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.peer_requests p
             where p.attempt_id = check_attempts.id and p.explainer_id = auth.uid())
);
create policy attempts_insert on public.check_attempts for insert to authenticated with check (
  user_id = auth.uid() and public.is_member(team_id) and status = 'grading'
  and ai_grade is null and human_grade is null and final_grade is null
);
create policy attempts_peer_grade on public.check_attempts for update to authenticated using (
  exists (select 1 from public.peer_requests p
          where p.attempt_id = check_attempts.id and p.explainer_id = auth.uid() and p.status = 'open')
);

create policy mastery_read on public.mastery for select to authenticated using (user_id = auth.uid());

create policy peer_read on public.peer_requests for select to authenticated
  using (explainer_id = auth.uid() or learner_id = auth.uid());
create policy peer_update on public.peer_requests for update to authenticated
  using (explainer_id = auth.uid()) with check (explainer_id = auth.uid());

create policy answers_read on public.agent_answers for select to authenticated using (
  user_id = auth.uid() or (agent = 'team' and public.is_member(team_id))
);
create policy answers_insert on public.agent_answers for insert to authenticated with check (
  user_id = auth.uid() and public.is_member(team_id)
);
create policy answers_update on public.agent_answers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy inbox_read on public.agent_inbox for select to authenticated using (user_id = auth.uid());
create policy inbox_update on public.agent_inbox for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ledger_read on public.credit_ledger for select to authenticated
  using (public.is_lead(team_id));

-- Realtime (Supabase menghormati RLS untuk postgres_changes).
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.messages, public.memory_items, public.check_attempts, public.agent_inbox;
  end if;
end $$;
