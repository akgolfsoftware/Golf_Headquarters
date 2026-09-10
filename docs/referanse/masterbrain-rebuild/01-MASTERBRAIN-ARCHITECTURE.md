# 01 — MASTERBRAIN ARCHITECTURE

**Mål:** Ett versioned knowledge OS som alle AI-agenter i PlayerHQ + AgencyOS adlyder.  
**Ikke:** generisk chatbot, ikke dobbel skills-bibliotek, ikke prose-som-lov.

---

## 1. Hard laws (runtime)

| # | Law | Enforcement |
|---|-----|-------------|
| L1 | Fasit = kun `knowledge/` | `hentMasterbrainKunnskap` importerer bare derfra; RAG merket SUPPORT |
| L2 | Aldri finn på metodikk/drill/ID | Tom bank → hard message; unit tests; agent system prompts |
| L3 | Drill bank empty until Anders promotes | `drills.json.entities === {}` + status TOM |
| L4 | Putting er sibling, ikke P1–P10 | Egen oppgavetype + egne entities; ingen map putting→positions |
| L5 | SG→fault = hypotese | `diagnose_regel` alltid i sg-diagnose-blokk |
| L6 | Strukturert JSON for det agenter adlyder | Prose kun i rag-corpus |
| L7 | Ingen dual knowledge stack | Én masterbrain-repo → sync til HQ; ingen `src/lib/domain/rules` revival; ai/skills må kalle masterbrain |

---

## 2. Lagmodell

```
L0  MANIFEST.md                 ← les først; kart + hull + lover
L1  knowledge/                  ← FASIT (entities + concepts + schemas)
L2  rag-corpus/                 ← prose SUPPORT (pgvector)
L3  training-data/ + eval/      ← eksempler + holdout + rubrikk
L4  sync + embed                ← npm run sync:masterbrain; seed embeddings
L-1 raw/ (immutable)            ← SOURCE-kopi; aldri agent-law
L-2 candidates/                 ← UTKAST drills/concepts; aldri merge uten promote
L-3 archive/                    ← historikk; aldri les som kunnskap
```

### L0 — MANIFEST
- Oppdateres ved hver fasit-endring
- Inneholder: lovene, filtabell, hull, periodenavn-oversettelse, «hva appen leser»
- Agent bootstrap: «les MANIFEST før alt annet»

### L1 — knowledge/

```
knowledge/
  entities/
    positions.json          # P1.0–P10.0 (fullswing only)
    faults.json             # fullswing faults
    drills.json             # TOM → validated only
    ordbok.json             # MORAD terms
    putting-faults.json     # NY — sibling
    model-players.json      # NY optional
    short-game-faults.json  # NY later (ARG sibling)
  concepts/
    canon-methodology.json  # CANON — MÅ renses for utgåtte L-faser (se C1)
    drill-taxonomy.json     # NY — pyramid, skill, domain tags (ikke drill instances)
    putting-framework.json  # NY
    sg-principles.json      # SG + hypotese-map
    ltad-framework.json
    mikroperiodisering-og-tidsdimensjon.json
    upgame-dimensions.json
    short-game-wet.json     # NY optional concept
    ak-formel-v2.json       # NY — 17 områder (erstatter L-fase som plan-driver)
  schemas/
    drill.schema.json       # NY — JSON Schema for validate-on-write
    fault.schema.json
    putting-fault.schema.json
    concept-meta.schema.json
```

### L2 — rag-corpus/
Eksisterende mapper beholdes. Nye:

| Mappe | Kilde | Rolle |
|-------|-------|-------|
| `morad/` | allerede | fullswing prose |
| `putting/` | PUTTING-METHODOLOGY + e-post (destillert prose) | SUPPORT for putting-agent |
| `short-game/` | wet conditions, Seve | SUPPORT |
| `sg-trackman/`, `sg-baselines/`, `treningsvolum/`, `live/` | uendret | |

**Regel:** Ved motstrid vinner L1. RAG har aldri `agent_must_obey: true`.

### L3 — training-data/
- Utvid holdout med putting-caser (uten drill_exists til bank finnes)
- Rubrikk: `drill_exists` forblir 0 til bank > 0

### L4 — Sync/embed
| Pipeline | Input | Output | Auto? |
|----------|-------|--------|-------|
| `npm run sync:masterbrain` | sibling `../masterbrain` eller `MASTERBRAIN_PATH` | `src/lib/masterbrain/knowledge/` | ja i CI anbefalt |
| embed-script | `rag-corpus/**/*.md` + index.json | Supabase `knowledge_chunks` | **nei** i dag — må bli eksplisitt etter rag-endring |
| candidate promote | `candidates/drills/*.json` + Anders flag | `knowledge/entities/drills.json` | **aldri auto** |

### Anbefalt repo-layout (kanonisk kilde)

```
~/Developer/masterbrain/          # kanonisk git-repo (akgolfsoftware/masterbrain)
  MANIFEST.md
  knowledge/
  rag-corpus/
  training-data/
  raw/                            # immutable SOURCE extracts
  candidates/
  archive/
  scripts/
    extract-drill-candidates.py
    validate-fasit.py
    promote-drill.py              # krever --anders-ok token/flag

akgolf-hq/
  src/lib/masterbrain/            # SYNCED SPEIL + hent-kunnskap.ts + tests
  scripts/sync-masterbrain.ts
```

HQ skal **ikke** være stedet man redigerer fasit for hånd over tid — kun speil + TS-bro.

---

## 3. Transform-regler: SOURCE bucket → target

| SOURCE bucket | Transform | Target | Aldri |
|---------------|-----------|--------|-------|
| `KB/01 POSITIONS/*.md` | Felt-ekstraksjon: name, checklist items → JSON fields; diff mot positions | `raw/` + PR mot positions **kun** ved manglende felt | Dump hele MD til fasit |
| `KB/03 FAULTS` | Map til existing fault IDs; legg symptoms/correction hvis mangler | entities/faults | Nye fault-IDs uten Anders |
| `KB/04 MORAD-DRILLS` | Parse sections → candidate drill objects + source_path | `candidates/drills/` | drills.json |
| `KB/04 PUTTING-METHODOLOGY` | Pillars, stages, distance_program → structured | concepts/putting-framework.json | entities/positions |
| `KB/04 SHORT-GAME-WET` | assessment_questions[], setup_adjustments{} | concepts/short-game-wet.json eller rag | fullswing faults |
| `KB/05 TRANSCRIPTIONS` | Already covered by MORAD_DATA; skip dual ingest | — | re-transcribe |
| `KB/06 EXTRACTED` | Treat as draft; quote-level only | raw/extracted | ordbok overwrite |
| `KB/08 MODEL FRAMES` | Asset path registry only | media registry | agent prompts med 7000 jpg |
| `MORAD_DATA/02–04` | raw + rechunk for RAG | raw/transcripts + rag | fasit entities |
| `MORAD_DATA ordbok_v2` | Already → ordbok; only gap-fill | entities/ordbok | bulk invent definitions |
| `MORAD_DATA knowledge_base_v1` | drills/concepts → candidates with confidence=low | candidates/ | promote auto |
| `EMAIL PUTTING/TEKNIKK md` | Quote-preserve; extract drill steps with citations | candidates/ + raw/email | paraphrase without path |
| `EMAIL PDF` | OCR later; low priority | raw/email-pdf | |
| `GOLF_AI_PLATFORM CIO yaml` | Inventory + optional map table CIO→fault | raw/cio + research doc | replace faults.json |
| `GOLF_AI_PLATFORM TRACKMAN yaml` | Diff vs rag/truth-layer | research | blind overwrite sg-principles |
| Media 00–09 | Storage only; hash inventory | external volume / cold storage | embed whole video in RAG |

### JSON entity-mønster (alle L1-filer)

```json
{
  "version": "semver",
  "status": "FASIT | UTKAST | TOM",
  "updated": "YYYY-MM-DD",
  "source": ["path or human decision"],
  "description": "...",
  "agent_regel": "optional hard instruction string",
  "entities": { "id_snake": { ... } }
}
```

Concept-filer bruker `id` på rot + domenespesifikke nøkler (som i dag).

---

## 4. Sibling brains (samme OS, adskilt domain)

| Brain | Entities | Concepts | Oppgavetype | P1–P10? |
|-------|----------|----------|-------------|---------|
| Fullswing / MORAD | positions, faults, drills (FS), ordbok | canon, drill-taxonomy | sg-diagnose, drill-forslag, terminologi | ja |
| Putting | putting-faults, drills (PUTT domain) | putting-framework, sg putt map | **putting-diagnose** (ny) | **nei** |
| Short game (fase 2) | short-game-faults | short-game-wet, ARG map | arg-diagnose | nei |
| Plan / periodisering | — | canon, ltad, mikro, **ak-formel-v2** | plan-generering, periodisering | nei |

Cross-brain: SG-kategori ruter til riktig brain. Aldri «over_the_top» for putt-signal.

---

## 5. Versjonering og integrity

1. **Semver per fil** i JSON `version`.  
2. **`versjonsnokkel`** fra `hentMasterbrainKunnskap` logges på hver agent-kjøring.  
3. **`validate-fasit.py`:**  
   - JSON Schema  
   - drills.entities keys ⊆ allowed; target_faults ⊆ faults.entities  
   - putting drill target_faults ⊆ putting-faults only  
   - ingen drill-ID i fjernede_navn uten eksplisitt re-promote log  
   - sg_to_morad_faults IDs must exist in faults (except putt → putting-faults when filled)  
4. **Git:** fasit-endringer via PR; promote-drill = egen commit med `Promoted-by: Anders`.

---

## 6. Hva som allerede er «godt nok» i HQ (ikke bygg om)

- `positions.json`, `faults.json` (struktur + diagnose_regel)
- `sg-principles` APP-bånd + hypotese-språk (men fjern/erstatt L-fase override)
- `hent-kunnskap.ts` rutingmønster (utvid, ikke erstatt)
- `rag-corpus` SG/trackman/volum
- `training-data` holdout-mønster
- drills.json **tom-status + agent_regel + skjema** — behold, fyll entities senere

---

## 7. Hva som må bygges (gap vs oppdrag)

| Artefakt | Status |
|----------|--------|
| putting-framework.json | mangler |
| putting-faults.json | mangler |
| drill-taxonomy.json | mangler |
| drill-catalog.ts | mangler (kan være tynn wrapper over drills.json) |
| schemas/ | mangler |
| candidates/ + promote pipeline | mangler |
| putting-diagnose oppgavetype | mangler |
| ak-formel-v2 vs L-fase rens | **kritisk konflikt** |
| raw/ SOURCE ingest i masterbrain-repo | mangler |
| Fix drill-forslag-agent never-invent | **kritisk** |
| Dual stack ExerciseDefinition policy | udefinert |

---

## 8. Data flow (høy nivå)

```
Toshiba SOURCE ──extract──► masterbrain/raw/ + candidates/
                              │
Anders validate ──promote──► knowledge/ (FASIT)
                              │
                    sync:masterbrain
                              │
                              ▼
              akgolf-hq/src/lib/masterbrain/knowledge/
                              │
              hentMasterbrainKunnskap(oppgavetype)
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  plan-generering       sg-diagnose          putting-diagnose
  periodisering         drill-forslag        terminologi
        │                     │                     │
        └──────────► PlayerHQ / AgencyOS agents ───┘
                     (PlanAction, CaddieDraft, portal)
```

Player/runtime data (SG tall, TrackMan, video scores) kommer fra **DB/API**, ikke Masterbrain. Masterbrain er lov + språk + tillatte handlinger.

---

*Neste: `02-PUTTING-BRAIN.md`*
