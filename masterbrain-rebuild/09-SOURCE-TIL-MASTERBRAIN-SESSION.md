# SOURCE → MASTERBRAIN — sesjonsdokument for AK Golf HQ

**Versjon:** 1.0 · **Dato:** 2026-08-07  
**Formål:** Komplett oversikt over data på ekstern disk, hva som allerede lever i Masterbrain/HQ, og hvordan arkivet implementeres inn i Masterbrain uten å bryte hard laws.  
**Bruk:** Les denne først i en HQ-sesjon om AI Coach / Masterbrain / Toshiba-arkivet.

---

## 0. Hurtigstart for neste agent / sesjon

| Felt | Verdi |
|------|--------|
| **SOURCE (ekstern disk)** | `/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH` |
| **Størrelse SOURCE** | ~796 GB (disk ~931 GB, ~81 GB ledig, ~92 % full) |
| **HQ repo** | `~/Developer/akgolf-hq` |
| **Masterbrain i HQ (sync-speil)** | `src/lib/masterbrain/` |
| **Kanonisk Masterbrain-repo** | `akgolfsoftware/masterbrain` (søsken-mappe `../masterbrain` ved sync) |
| **Designpakke** | `akgolf-hq/masterbrain-rebuild/` (00–09) |
| **Invent-guard (kode)** | PR #382 — `erMasterbrainDrillBankTom()` stopper drill-forslag + fabrikk |
| **Drill-bank status** | `drills.json` → `entities: {}` (TOM med vilje) |

### Hard laws (aldri bryt)

1. Fasit = kun `knowledge/` under Masterbrain. `rag-corpus/` er støtte, ikke lov.  
2. Finn aldri på metodikk, drill-navn eller drill-IDs.  
3. Drill-bank fylles bare med Anders-validerte drills.  
4. Putting er sibling brain — ikke mappe putting-feil til P1–P10.  
5. SG → feil = hypotese, ikke diagnose (video / sikte / taktikk).  
6. Det agenter adlyder = strukturert JSON, ikke lang prosa.  
7. Ingen dobbel skills-bibliotek utenfor Masterbrain.

### Målbildet (én setning)

AI-coach som **kloner Anders som coach** (MORAD/CANON/dømmekraft), med **ubegrenset kunnskapsdybde** fra arkivet — uten å late som den vet noe som ikke finnes i fasiten.

---

## 1. Hva er Masterbrain i dag (HQ)

### 1.1 Lag

```
src/lib/masterbrain/
├── MANIFEST.md                 ← les først (lover, hull, kart)
├── hent-kunnskap.ts            ← ruter oppgavetype → fasit-blokker
├── drill-bank.ts               ← invent-guard (TOM bank)
├── index.ts                    ← eksport + masterbrain-objekt
├── knowledge/                  ← FASIT (JSON)
│   ├── entities/
│   │   ├── positions.json      ← P1.0–P10.0
│   │   ├── faults.json         ← 10 fullswing-feil
│   │   ├── drills.json         ← TOM
│   │   └── ordbok.json         ← 75 termer
│   └── concepts/
│       ├── canon-methodology.json
│       ├── ltad-framework.json
│       ├── sg-principles.json
│       ├── mikroperiodisering-og-tidsdimensjon.json
│       └── upgame-dimensions.json
├── rag-corpus/                 ← prosa SUPPORT (embeddes til Supabase)
│   ├── morad/  sg-trackman/  sg-baselines/  treningsvolum/  live/
│   └── index.json
├── training-data/              ← eksempler + holdout-eval
└── processed/rules/            ← UTDATERT — ikke les som fasit
```

### 1.2 Hva appen leser

| Vei | Innhold | Auto-sync? |
|-----|---------|------------|
| `npm run sync:masterbrain` | `knowledge/` → HQ-speil | Ja (skript) |
| Embedding-skript | `rag-corpus/` → `knowledge_chunks` (pgvector) | Nei — manuelt etter endring |
| `hentMasterbrainKunnskap(oppgavetype)` | Statisk JSON-import i runtime | — |

### 1.3 Oppgavetyper i dag

| Oppgavetype | Brukes til | Fasit |
|-------------|------------|-------|
| `plan-generering` | Ukeplan, økter | CANON, mikro, LTAD |
| `sg-diagnose` | SG → hypoteser | SG, faults, positions |
| `drill-forslag` | Drill-anbefaling | drills (TOM-melding), faults |
| `periodisering` | Periode/deload | CANON, mikro |
| `terminologi` | Fagspråk | ordbok, positions |
| `putting-diagnose` | **mangler** | — |

### 1.4 Kjente hull i fasiten (MANIFEST)

| Hull | Status |
|------|--------|
| Drill-bank tom | Bevisst |
| Putting-kunnskap | Mangler sibling |
| L-faser i CANON vs AK-formel v2 (17 områder) | **Konflikt** — avklar med Anders |
| CS-nivåer | Uavklart — ikke bruk i nytt uten spørsmål |
| Ordbok | ~7 % destillert (75 av ~1081 segmenter) |
| Turneringsforberedelse, banestrategi, livskontekst | Tynt / mangler |

### 1.5 Mangler som SOURCE kan hjelpe med

| Mål-fil | Finnes i HQ? | SOURCE kan fylle? |
|---------|--------------|-------------------|
| `putting-framework.json` | Nei | Ja (PUTTING-METHODOLOGY + e-post) |
| `putting-faults.json` | Nei | Delvis (prinsipper; faults må Anders definere) |
| `drill-taxonomy.json` | Nei | Delvis (tags fra eksisterende) |
| `drills.json` entities | Tom | Ja som **UTKAST** → promote |
| Ordbok utvidelse | 75 terms | Ja (transcripts + ordbok_v2) |
| RAG lecture chunks | Delvis (morad md) | Ja (1081 chunks i MORAD_DATA) |

---

## 2. Ekstern disk — komplett oversikt

**Root:** `/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH`  
**Total:** ~796 GB  
**Språk:** Primært engelsk (Mac/video); norsk i prosjekt-docs og delvis ordbok.  
**Merk:** Eldre README/CLAUDE peker på `Masterfolder 2026` — mappa heter nå `MORAD_AI_GOLF_COACH`.

### 2.1 Toppnivå — størrelse og rolle

| Mappe / fil | Størrelse | Type innhold | Masterbrain-rolle |
|-------------|-----------|--------------|-------------------|
| `02 - MORAD/` | **370 GB** | Video 2011–2016 + Main | **Raw media** — ikke fasit |
| `01 - MAC OGRADY SCHOOL/` | **228 GB** | Skoleopptak 2011–2014 | Raw media |
| `05 - REFERENCE MATERIAL/` | **82 GB** | Lectures, instruction, historikk, **e-post** | Raw + **gull e-post** (lite) |
| `00 - DVD_RIPS/` | **37 GB** | VOB/IFO DVD-rips | Raw media (duplisert flere steder) |
| `09 - ARCHIVE/` | **36 GB** | Backup okt 2013 | Archive only |
| `04 - MAC OGRADY SWINGS/` | 3.6 GB | Mac referansesvinger | Raw / model media |
| `03 - ANDERS SWING ANALYSIS/` | 2.1 GB | Personlig sving + sesjoner med Mac | Raw personlig (PII) — ikke agent-fasit |
| `08 - MODEL SWINGS/` | 885 MB | Modell-svinger | Raw media |
| `MORAD_DATA/` | **723 MB** | Pipeline: transcripts, chunks, embeddings, ordbok | **Viktigste bearbeidede lag** |
| `07 - SKYPE SESSIONS/` | 705 MB | Skype 2013 (audionote) | Raw / senere transkripsjon |
| `backend/` | 365 MB | Gammel FastAPI-app + venv | **Ikke** Masterbrain |
| `10 - KNOWLEDGE BASE/` | **96 MB** | Strukturert KB + frames | **Primær kunnskapsmappe** |
| `06 - DOCUMENTS/` | 7.9 MB | PDF/plan | Raw docs |
| `GOLF_AI_PLATFORM/` | 1.0 MB | 23 CIO YAML + TrackMan-scaffold | Raw scaffold — ikke auto-fasit |
| Rot (m4v, jsx, md) | ~30 MB | Legacy app / briefing | Støy for knowledge OS |

### 2.2 Klassifisering av alt innhold

| Domene | Finnes på disk? | Hvor | Modenhet for Masterbrain |
|--------|-----------------|------|---------------------------|
| **FULLSWING / MORAD** | Ja | KB, MORAD_DATA, video 01/02/05, e-post TEKNIKK | Høy — delvis allerede i HQ |
| **PUTTING** | Ja (lite men sterkt) | PUTTING-METHODOLOGY, 2 e-poster | Medium råstoff, **null** HQ-fasit |
| **SHORT GAME** | Ja | SHORT-GAME-WET, Seve/short game transcripts, CIO short_game | Medium |
| **ORDBOK / terminologi** | Ja | ordbok_v2, extracted concepts, KB terminology | Delvis i HQ (75 terms) |
| **DRILLS** | Ja (kandidater) | MORAD-DRILLS (6), kb_v1 (5 auto), e-post | Kun UTKAST |
| **DATA / SG / TrackMan** | Delvis | GOLF_AI_PLATFORM YAML | HQ rag er lengre frem |
| **FYS / LTAD / periodisering** | Nei (nesten) | — | Allerede i HQ concepts |
| **MENTAL** | Delvis | MENTAL-GAME.md, INSPIRASJON-e-post | RAG-prosa |
| **PLAY / banestrategi** | Nei | — | Hull |
| **MEDIA (video/frames)** | Ja (~780 GB) | 00–09 | Raw / cold storage |
| **NOISE** | Ja | backend, archive, duplikate DVD-stier | Ignore |

---

## 3. Kunnskaps-kjernen på disken (det som faktisk skal inn)

### 3.1 `10 - KNOWLEDGE BASE/` (~96 MB)

| Undermappe | Innhold | Kvalitet | → Masterbrain |
|------------|---------|----------|---------------|
| `01 - POSITIONS/` | 2 md (address, stance) | B | `raw/` + diff mot `positions.json` (ikke overwrite) |
| `02 - ANATOMY/` | 7 md (upper/lower, torso, neck, clubshaft, neuro, mental) | B | `raw/` → eventuelle concept-felter |
| `03 - COMMON FAULTS/` | 6 feil i md | **A** | Allerede speilet/utvidet til 10 i `faults.json` |
| `04 - DRILLS/MORAD-DRILLS.md` | **6 Mac-drills** | B (kandidat) | `candidates/drills/` — **ikke** drills.json uten promote |
| `04 - DRILLS/PUTTING-METHODOLOGY.md` | 1–300 ft, 5 stages, speed→line | **A** | `knowledge/concepts/putting-framework.json` |
| `04 - DRILLS/SHORT-GAME-WET-CONDITIONS.md` | Vått near-green system | **A** | concept eller rag `short-game/` |
| `05 - MODEL GOLFERS/` | Reference players | B | `entities/model-players.json` (valgfritt) |
| `05 - TRANSCRIPTIONS/` | ~75 md | B | Speil av lectures; prefer MORAD_DATA JSON |
| `06 - EXTRACTED CONCEPTS/` | 4 JSON (glossary 12 terms, quotes, by position/topic) | B–C | raw; ikke overskriv ordbok |
| `06 - TERMINOLOGY/` | MORAD-POSITIONS.md | B | diff |
| `07 - TRANSCRIPTS/` | 2 txt | C | raw |
| `08 - MODEL FRAMES/` | ~6 927 JPG, P1–P10-mapper | B (media) | media registry / vision — ikke agent-law |
| `INDEX.md` | Kart | — | docs |

### 3.2 `MORAD_DATA/` (~723 MB, ekskl. scripts 633 MB)

| Lag | Størrelse | Innhold | → Masterbrain |
|-----|-----------|---------|---------------|
| `01_inventory/` | 9 MB | CSV/inventory | raw inventory |
| `02_processed/` | 13 MB | 71 normaliserte lectures | `raw/transcripts/normalized/` |
| `03_transcripts/` | 28 MB | Transcripts + batch | `raw/transcripts/` |
| `04_chunks/` | 2.3 MB | **1 081** semantic chunks (jsonl) | Re-chunk → `rag-corpus/` + re-embed |
| `05_embeddings/` | 37 MB | Gamle vektorer | **Ikke** stol blindt — re-embed i HQ |
| `06_terminology/morad_ordbok_v2.json` | ~190 KB | **74 terms** + categories | Kilde til HQ ordbok (75) |
| `06_terminology/knowledge_base_v1.json` | ~47 KB | 36 concepts, **5 auto-drills**, 7 diag rules | **candidates only** (lav tillit) |
| `06_terminology/term_frequency*.csv` | — | Frekvens | ordbok-pipeline |
| `00_raw`, `06_ontology`, `07_swing_analysis`, `09_outputs` | tomme | — | — |
| `scripts/` | 633 MB | Pipeline + deps | **Ikke** kopier til Masterbrain |

**Transkripsjonsstatus (jan–feb 2026):** 71 lectures, 0 feil, ~74k segmenter, 1 081 chunks.

### 3.3 E-post Mac O'Grady (gull, lite volum)

**Path:**  
`05 - REFERENCE MATERIAL/05 - EMAIL CORRESPONDENCE/`  
(~86 filer, ~5.8 MB — md + pdf)

| Klasse | Eksempler | → Masterbrain |
|--------|-----------|---------------|
| **Putting** | `PUTTING_Drills_1-300ft-Half-Decade-Mastery.md`, `PUTTING_Drills_1000-Putts-Dean-Martin-Heels-Together.md` | putting-framework + UTKAST putt-drills |
| **Teknikk / drills** | `TEKNIKK_Elbow_Adduction-*`, `TEKNIKK_Arm-Speed_*`, `TEKNIKK_Shoulder-Plane_*`, `TEKNIKK_Extensions_*`, `TEKNIKK_Short-Game_*` | candidates + raw quotes |
| **MORAD system** | `MORAD_System_Explanation-To-John-Overview.md`, MORAD CONCEPTS PDF | raw → concept distill |
| **Mental** | `INSPIRASJON_*`, psychology | rag-corpus/mental/ |
| **PDF-tråder** | 33+ Gmail PDF | OCR senere; lav prioritet |
| **Familie/logistikk** | `FAMILIE_*` | ignore for agenter |

### 3.4 `GOLF_AI_PLATFORM/` (~1 MB)

| Innhold | Merknad | → Masterbrain |
|---------|---------|---------------|
| 23 CIO YAML (alignment, impact, path, face, short_game, …) | Delvis overlapp med faults; duplikate navn | `raw/cio/` — mapping-tabell før merge |
| `TEMPLATE_DRILL.yaml` | Enkelt skjema | innspill til drill.schema |
| TrackMan runtime YAML | Authority / confidence | diff mot HQ truth-layer / rag |
| Python decision engine | Scaffold | research, ikke fasit |

### 3.5 Media-arkiv (ikke knowledge-OS-kritisk path)

| Mappe | Ca. | Bruk senere |
|-------|-----|-------------|
| DVD / school / MORAD Main | 600+ GB | Transkripsjon av det som mangler tale; vision samples |
| Model frames | ~7k JPG | UI / pose reference |
| Anders personal | 2.1 GB | Personlig coaching-historikk — ikke multi-player fasit |
| Skype | 705 MB | Transkripsjon for «Anders + Mac»-stemme |

**Disk 92 % full:** ikke kopier video til Mac uten cold-storage-plan. Knowledge-implementasjon trenger bare **små filer** (md/json/jsonl).

### 3.6 Duplikater å unngå

| Sett | Handling |
|------|----------|
| DVD: `00 - DVD_RIPS` ≈ `morad-dvd-folder-2` ≈ `morad_dvd_import` | Én kanonisk raw-sti |
| Transcripts: KB md vs MORAD_DATA json vs second-brain raw | Prefer `MORAD_DATA/02–04` |
| Ordbok v1/v2 vs HQ ordbok vs `processed/rules` | HQ `knowledge/entities/ordbok.json` er fasit |
| 6 MORAD-DRILLS = navn i `fjernede_navn` | Forventet — re-promote krever ny validering |

---

## 4. Drill-kandidater (UTKAST — ikke fasit)

Full JSON: `masterbrain-rebuild/04-CANDIDATE-DRILLS.json`

### 4.1 Høy tillit (Mac-e-post / MORAD-DRILLS.md)

| UTKAST-ID | Navn | Domene |
|-----------|------|--------|
| UTKAST-FS-001 | Left Elbow Adduction | FULLSWING |
| UTKAST-FS-002 | Three Momentum Transfers | FULLSWING |
| UTKAST-FS-003 | Spine Alignment Setup | FULLSWING |
| UTKAST-FS-004 | Right Arm/Clubshaft 110° | FULLSWING |
| UTKAST-FS-005 | Humeral-Scapula Activation | FULLSWING |
| UTKAST-FS-006 | Knock-Down (Seve) | FULLSWING |
| UTKAST-PUTT-001 | Progressive 1–300 ft | PUTTING (program) |
| UTKAST-PUTT-002 | Heels-together pendulum + volume | PUTTING |

### 4.2 Lav tillit (auto-extract knowledge_base_v1)

D001–D005 (Elbow Flexion Chip, Three Lines Photo, Right Arm 45° P7, Squat-to-Finish, Shaft-on-Hips) — **ikke** promote uten omskriv + Anders.

### 4.3 Promote-regel

```
SOURCE → candidates/ → Anders checklist → promote-script → knowledge/entities/drills.json
                                                              → sync:masterbrain → HQ
```

Aldri: LLM «lag 28 drills» · auto-merge · write drills.json uten signatur.

---

## 5. Hvordan implementere SOURCE → MASTERBRAIN

### 5.1 Målarkitektur (lag)

```
L-1  raw/              Immutable SOURCE-kopi (små filer)
L-2  candidates/       UTKAST drills/concepts (venter Anders)
L0   MANIFEST.md       Kart + lover + hull
L1   knowledge/        FASIT — entities + concepts + schemas
L2   rag-corpus/       Prosa SUPPORT
L3   training-data/    Eksempler + holdout
L4   sync + embed      HQ speil + Supabase vectors
```

**Kanonisk redigering:** masterbrain-repo.  
**HQ:** speil + `hent-kunnskap.ts` + invent-guards.  
**Aldri** rediger fasit bare i HQ over tid.

### 5.2 Transform-matrise (SOURCE bucket → target)

| SOURCE | Transform | Target | Forbudt |
|--------|-----------|--------|---------|
| KB positions md | Felt-ekstraksjon, diff | raw + PR til positions om hull | Dump hele md til fasit |
| KB faults md | Allerede i faults.json | — | Nye fault-IDs uten Anders |
| MORAD-DRILLS.md | Parse seksjoner → candidate JSON | candidates/drills/ | drills.json direkte |
| PUTTING-METHODOLOGY + 2 e-poster | Pillars, stages, distance_program | concepts/putting-framework.json | P1–P10 mapping |
| SHORT-GAME-WET | assessment Qs + setup table | concept eller rag/short-game | fullswing fault IDs |
| MORAD_DATA 02–04 | Behold struktur; re-chunk for RAG | raw/transcripts + rag | entities uten destillasjon |
| ordbok_v2 | Gap-fill mot HQ ordbok | entities/ordbok.json | bulk invent definitions |
| knowledge_base_v1 drills | confidence=low candidates | candidates/ | auto-promote |
| E-post TEKNIKK/PUTTING md | Quote + steps + path citation | candidates + raw/email | parafrasere uten kilde |
| E-post PDF | OCR kø | raw/email-pdf | |
| CIO yaml | Inventory + optional CIO→fault map | raw/cio | erstatte faults.json |
| 780 GB video | Cold storage; selektiv transkripsjon | external | embed hele filer i RAG |
| backend/ | ignore | — | |

### 5.3 Nye L1-filer som må opprettes

| Fil | Innhold | Første status |
|-----|---------|---------------|
| `concepts/putting-framework.json` | Pillars, distance bands, 5 stages, agent_regel | UTKAST → Anders → FASIT |
| `entities/putting-faults.json` | diagnose_regel + tom entities (eller Anders-definerte) | TOM entities OK |
| `concepts/drill-taxonomy.json` | Tillatte domains/tags — ingen drill-navn | FASIT |
| `schemas/drill.schema.json` | Validering ved promote | — |
| `concepts/ak-formel-v2.json` | 17 områder (erstatter L-fase som plan-driver) | **krever Anders** |
| `concepts/short-game-wet.json` | Valgfritt | UTKAST |

### 5.4 Sibling brains

| Brain | Entities | Concepts | Oppgavetype | P1–P10? |
|-------|----------|----------|-------------|---------|
| Fullswing/MORAD | positions, faults, drills (FS), ordbok | canon, taxonomy | sg-diagnose, drill-forslag, terminologi | Ja |
| Putting | putting-faults, drills (PUTT) | putting-framework | **putting-diagnose** (ny) | **Nei** |
| Short game (senere) | short-game-faults | short-game-* | arg-diagnose | Nei |
| Plan | — | canon, ltad, mikro, ak-formel-v2 | plan-generering, periodisering | Nei |

### 5.5 Implementasjonsfaser (rekkefølge)

#### Fase A — Sikring (1–2 dager) ✅ delvis gjort

| Steg | Status |
|------|--------|
| A1 Inventory SOURCE | ✅ 00 + dette 09 |
| A2 Invent-guard i kode | ✅ PR #382 (drill-forslag + fabrikk) |
| A3 Kopier små raw-filer til masterbrain/raw | ⏳ |
| A4 Ikke kopier video/venv | ⏳ policy |

#### Fase B — Struktur uten dikt

| Steg | Handling |
|------|----------|
| B1 | Schemas for drill/fault/putting-fault |
| B2 | putting-framework.json (fra SOURCE) status UTKAST |
| B3 | putting-faults.json tom + diagnose_regel |
| B4 | drill-taxonomy.json |
| B5 | candidates/ med 04-CANDIDATE split |
| B6 | `hent-kunnskap` + `putting-diagnose` |
| B7 | MANIFEST oppdateres |
| B8 | `npm run sync:masterbrain` |

#### Fase C — Anders validation (menneske)

| Steg | Handling |
|------|----------|
| C1 | Checklist UTKAST-FS-001…006 |
| C2 | Checklist PUTT-001/002 |
| C3 | Reject/park D001–D005 |
| C4 | Promote godkjente → drills.json |
| C5 | Valgfritt: putting-faults på Anders' ord |
| C6 | CS-policy (null i v1?) |
| C7 | L-fase vs AK-formel v2 |

#### Fase D — RAG

| Steg | Handling |
|------|----------|
| D1 | Re-chunk 1081 lectures inn i rag-pipeline |
| D2 | Putting prose SUPPORT (destillert) |
| D3 | Fix 3 manglende index-entries |
| D4 | Re-embed → Supabase `knowledge_chunks` |

#### Fase E — Agenter + produkt

| Steg | Handling |
|------|----------|
| E1 | putting-diagnose på SG PUTT |
| E2 | Policy ExerciseDefinition vs Masterbrain drills |
| E3 | Holdout etter første drills |
| E4 | CaddieDraft kun FASIT ids |

#### Fase F — Media (senere)

Selektiv transkripsjon av manglende audio; model-frame heroes; cold storage for 780 GB.

### 5.6 Dataflyt i produksjon (mål)

```
Toshiba SOURCE
    │ extract (små filer)
    ▼
masterbrain/raw/ + candidates/
    │ Anders promote
    ▼
masterbrain/knowledge/          ← FASIT
    │ npm run sync:masterbrain
    ▼
akgolf-hq/src/lib/masterbrain/knowledge/
    │ hentMasterbrainKunnskap(oppgavetype)
    ▼
┌───────────────┬────────────────┬─────────────────┐
│ plan-generering│ sg-diagnose   │ putting-diagnose│
│ periodisering  │ drill-forslag │ terminologi     │
└───────┬───────┴───────┬────────┴────────┬────────┘
        ▼               ▼                 ▼
   AgencyOS         PlayerHQ          Live / analyse
   (godkjenning)    (portal plan)     (tone + diagnose)

Spillerdata (SG, TrackMan, video scores) kommer fra DB — ikke Masterbrain.
Masterbrain = lov + språk + tillatte handlinger.
```

### 5.7 Coach-klone: video + din stemme (langsiktig)

| Kilde | Gir klonen |
|-------|------------|
| Mac lectures / e-post / MORAD-DRILLS | Faglig DNA (MORAD) |
| Transkripsjoner + ordbok | Fagspråk med sitater |
| Dine coaching-sessions (Notion / voice pipeline) | **Din** beslutningsstil |
| CANON / AK-formel / LTAD i HQ | Systemet du allerede eier |
| SG + TrackMan i app | Diagnose-signaler |
| Eval holdout + dine godkjenninger | Bevis mot dikt |

**Video alene = arkiv.**  
**Video → destillert fasit + din stemme + hard laws = ubegrenset coach-hjerne under din kontroll.**

Se også: `08-COACH-CLONE-VISION.md`.

---

## 6. Kritiske konflikter (må avklares)

| ID | Konflikt | Anbefaling |
|----|----------|------------|
| C1 | L-faser i HQ CANON vs AK-formel v2 (L-faser utgått) | Anders bestemmer; plan-agenter kan ellers feile |
| C2 | ExerciseDefinition (DB) vs Masterbrain drills | Policy A: DB = operativ liste; Masterbrain = metodikk-drills |
| C3 | Fabrikk/drill-agent invent | ✅ fikset når bank tom; når bank full: kun FASIT-ids |
| C4 | rag `morad-drill-bank-core.md` kan beskrive gamle drills | Banner «ikke fasit» / arkiver |
| C5 | CIO vs faults to taxonomier | CIO forblir raw til mapping godkjent |
| C6 | Disk 92 % full | Kun små-fil ingest |

---

## 7. Filkart — hele masterbrain-rebuild-pakken

| Fil | Innhold |
|-----|---------|
| `00-SOURCE-INVENTORY.md` | Phase 0 tabell, duplikater, drill-flagg |
| `01-MASTERBRAIN-ARCHITECTURE.md` | L0–L4, transform-regler |
| `02-PUTTING-BRAIN.md` | Sibling putting design + JSON-utkast |
| `03-DRILL-BANK-RESTART.md` | Schema, promote, checklist |
| `04-CANDIDATE-DRILLS.json` | 11 UTKAST med SOURCE-paths |
| `05-AGENT-WIRING.md` | Oppgavetyper, guards, PlayerHQ/AgencyOS |
| `06-MIGRATION-PLAN.md` | Fase A–F |
| `07-OPEN-QUESTIONS.md` | Q1–Q12 + 10 handlinger for Anders |
| `08-COACH-CLONE-VISION.md` | Bekreftet målbilde |
| **`09-SOURCE-TIL-MASTERBRAIN-SESSION.md`** | **Dette dokumentet — sesjonsfasit** |

Speil (dokumenter): `~/Documents/Claude/masterbrain-rebuild/`

---

## 8. Sjekkliste for «fortsett sesjon»

```
[ ] SOURCE montert?  ls "/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH"
[ ] Les denne fila (09) + MANIFEST i src/lib/masterbrain/
[ ] PR #382 status (invent-guard)
[ ] Ikke skriv til drills.json uten Anders promote
[ ] Putting: bygg framework fra SOURCE (fase B2) før nye faults
[ ] Avklar C1 L-fase før mer plan-generering-tillit
[ ] Første promote: maks 3–6 drills (FS-001…006)
[ ] Video: ikke bulk-copy — disk full
```

---

## 9. Anbefalt neste implementasjonssteg (prioritert)

1. Merge PR #382 hvis CI grønn.  
2. Kopier e-post-md + KB md + MORAD_DATA 02/03/04/terminology til `masterbrain/raw/` (små filer).  
3. Skriv `putting-framework.json` (UTKAST) fra PUTTING-METHODOLOGY + e-post.  
4. Tom `putting-faults.json` + `putting-diagnose` i hent-kunnskap.  
5. Anders validerer 3–6 fullswing UTKAST.  
6. Re-embed 1081 chunks når raw er trygt i repo.  
7. Først da: utvide «coach-klone» med din coaching-voice-pipeline.

---

## 10. Én-sides sammendrag

| | |
|--|--|
| **På disken** | ~796 GB: mest video; **verdifull kunnskap** ligger i ~100 MB KB + ~90 MB pipeline + ~6 MB e-post |
| **Allerede i HQ** | positions, 10 faults, ordbok 75, CANON, LTAD, SG, rag SG/volum — **drills tom**, **putting mangler** |
| **Implementasjon** | raw → candidates → Anders promote → knowledge/ → sync → hent-kunnskap → agenter |
| **Aldri** | Invent drills · dump video i fasit · putting i P1–P10 · dual skills utenfor Masterbrain |
| **Mål** | Coach-klone av Anders + ubegrenset destillert arkiv under hard laws |

---

*Dokumentet er basert på lesbar SOURCE 2026-08-07 og HQ Masterbrain på samme dato. Ved tvil: verifiser path på disk, ikke gjett.*
