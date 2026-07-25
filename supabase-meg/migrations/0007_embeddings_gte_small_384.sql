-- supabase-meg/migrations/0007_embeddings_gte_small_384.sql
-- Bytter embeddings fra Voyage voyage-3-lite (512 dim, krevde betalingskort) til
-- Supabase innebygd gte-small (384 dim, gratis, kjører i Edge Function «embed»).
-- Kjøres i Meg-Supabase SQL Editor (IKKE via Prisma).
--
-- me_knowledge TØMMES og re-indekseres fra Mac (scripts/meg-index.sh) — hash-basert
-- skip-logikk ville ellers hoppet over alle uendrede biter og latt embeddings stå tomme.
-- me_memory har aldri fått embeddings skrevet (ingen kode skriver dem ennå) — kolonnen
-- bytter bare dimensjon.

drop index if exists me_memory_embedding_idx;
drop index if exists me_knowledge_embedding_idx;

truncate table public.me_knowledge;

alter table public.me_memory
  alter column embedding type vector(384) using null::vector(384);
alter table public.me_knowledge
  alter column embedding type vector(384) using null::vector(384);

create index me_memory_embedding_idx on public.me_memory
  using hnsw (embedding vector_cosine_ops);
create index me_knowledge_embedding_idx on public.me_knowledge
  using hnsw (embedding vector_cosine_ops);

-- Argument-typen endres (vector(512) -> vector(384)) — create or replace ville laget
-- en overload, så gamle funksjoner droppes eksplisitt først.
drop function if exists public.match_me_memory(vector, int);
drop function if exists public.match_me_knowledge(vector, int);

create function public.match_me_memory(
  query_embedding vector(384),
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

create function public.match_me_knowledge(
  query_embedding vector(384),
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
