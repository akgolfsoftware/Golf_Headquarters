-- supabase-meg/migrations/0002_semantic_memory.sql
-- Fase 2: semantisk minne + kunnskaps-indeksering.
-- Kjøres i Meg-Supabase SQL Editor (IKKE via Prisma).
-- Embedding-dimensjon = 512 (Voyage voyage-3-lite). Endres denne, må kolonnene endres.

create extension if not exists "vector";

-- Destillerte langtidsminner (komprimert fra me_log/me_conversation).
create table public.me_memory (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  content     text not null,
  kind        text not null default 'fact' check (kind in
              ('fact','preference','person','goal','summary')),
  tags        text[] not null default '{}',
  source_ref  text,
  embedding   vector(512)
);
create index me_memory_created_at_idx on public.me_memory (created_at desc);
create index me_memory_embedding_idx on public.me_memory
  using hnsw (embedding vector_cosine_ops);

-- Indekserte kunnskaps-biter fra ak-brain + second-brain (Mac-jobb upserter hit).
create table public.me_knowledge (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  vault         text not null check (vault in ('ak-brain','ak-second-brain')),
  rel_path      text not null,
  chunk_index   integer not null default 0,
  content       text not null,
  content_hash  text not null,
  embedding     vector(512),
  unique (vault, rel_path, chunk_index)
);
create index me_knowledge_hash_idx on public.me_knowledge (content_hash);
create index me_knowledge_embedding_idx on public.me_knowledge
  using hnsw (embedding vector_cosine_ops);

-- Semantisk søk i minner. Returnerer topp-N etter cosine-likhet.
create or replace function public.match_me_memory(
  query_embedding vector(512),
  match_count int default 5
)
returns table (id uuid, content text, kind text, tags text[], similarity float)
language sql stable
as $$
  select m.id, m.content, m.kind, m.tags,
         1 - (m.embedding <=> query_embedding) as similarity
  from public.me_memory m
  where m.embedding is not null
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

-- Semantisk søk i kunnskap. Returnerer topp-N etter cosine-likhet.
create or replace function public.match_me_knowledge(
  query_embedding vector(512),
  match_count int default 5
)
returns table (id uuid, vault text, rel_path text, content text, similarity float)
language sql stable
as $$
  select k.id, k.vault, k.rel_path, k.content,
         1 - (k.embedding <=> query_embedding) as similarity
  from public.me_knowledge k
  where k.embedding is not null
  order by k.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS: deny-all. Kun service-role (server-side + Mac-jobb) når dataene.
alter table public.me_memory enable row level security;
alter table public.me_knowledge enable row level security;
-- Ingen policies = ingen tilgang for anon/authenticated. Service-role bypasser RLS.
