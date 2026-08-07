# 06 — MIGRATION PLAN

**Mål:** Fra Toshiba SOURCE + delvis HQ-speil → produksjonsklar Masterbrain uten å bryte hard laws.  
**Ikke i scope:** flytte 780G video til Mac; finne på drills; auto-promote.

---

## Fase A — Sikring og truth (1–2 dager)

| Steg | Handling | Verify |
|------|----------|--------|
| A1 | Bekreft SOURCE montert; ta inventory snapshot (00-fil er snapshot 2026-08-07) | path exists |
| A2 | Opprett/klone kanonisk `~/Developer/masterbrain` hvis ikke (git akgolfsoftware/masterbrain) | git status clean after pull |
| A3 | Kopier **immutable raw** (små filer only): e-post md (86), KB md uten frames, MORAD_DATA 02/03/04 + terminology json, GOLF_AI CORE yaml | checksum list |
| A4 | **Ikke** kopier backend/venv, MODEL FRAMES 6927 jpg, 370G MORAD video | disk ok |
| A5 | P0-fix: `drill-forslag-agent` empty-bank guard | unit/integration test |
| A6 | Dokumenter C1 L-fase vs AK-formel v2 for Anders (stopp plan-generering på L-fase hvis han bekrefter utgått) | beslutning i 07 |

**Exit A:** raw inne, ingen agent finner på drills.

---

## Fase B — Fasit-gap (struktur uten dikt)

| Steg | Handling | Verify |
|------|----------|--------|
| B1 | Legg `knowledge/schemas/drill.schema.json` (+ fault, putting-fault) | validate script |
| B2 | Opprett `putting-framework.json` fra 02-doc (status UTKAST) | Anders review |
| B3 | Opprett `putting-faults.json` tom entities + diagnose_regel | hent-kunnskap safe |
| B4 | Opprett `drill-taxonomy.json` | |
| B5 | Opprett `candidates/drills/` + legg inn 04-CANDIDATE-DRILLS som split files | not in entities |
| B6 | Utvid `hent-kunnskap` med putting-diagnose | tests grønne |
| B7 | Oppdater MANIFEST hull + nye filer | |
| B8 | `npm run sync:masterbrain` → HQ speil | tsc/test |

**Exit B:** putting sibling finnes som struktur; bank fortsatt tom; agenter trygge.

---

## Fase C — Anders validation sprint (menneske)

| Steg | Handling | Verify |
|------|----------|--------|
| C1 | Review UTKAST-FS-001…006 med checklist (03 §5) | 0–6 godkjent |
| C2 | Review UTKAST-PUTT-001…002 (program vs drill) | beslutning |
| C3 | Reject/park D001–D005 (low confidence) or rewrite | |
| C4 | Promote godkjente via script → drills.json | entities count N>0 |
| C5 | Valgfritt: 3–5 putting-faults på Anders' ord | putting-faults entities |
| C6 | Beslut CS-policy (null forever for v1 vs later) | |
| C7 | Beslut L-fase: slett fra canon / erstatt ak-formel-v2 | canon status |

**Exit C:** minst 3 FASIT fullswing drills **eller** eksplisitt «fortsatt tom med vilje».

---

## Fase D — RAG og embeddings

| Steg | Handling | Verify |
|------|----------|--------|
| D1 | Re-chunk 1081 lecture chunks til rag-corpus/morad-lectures/ (eller behold jsonl pipeline) | index.json oppdatert |
| D2 | Legg putting prose SUPPORT (destillert, ikke raw email dump) | |
| D3 | Fix 3 manglende index-entries (MANIFEST) | 99=99 |
| D4 | Re-embed → Supabase knowledge_chunks | sample query |
| D5 | **Ikke** stol på Toshiba 37M embeddings.jsonl uten re-embed | |

**Exit D:** RAG = support only; L1 uendret.

---

## Fase E — Agent + produkt

| Steg | Handling | Verify |
|------|----------|--------|
| E1 | Wire putting-diagnose til SG PUTT crisis | e2e |
| E2 | Plan-generering: ExerciseDefinition policy A/B documented in code comments + MANIFEST | |
| E3 | Holdout eval etter first drills | score drill_exists > 0 for drill caser |
| E4 | AgencyOS godkjenning: CaddieDraft kun FASIT drill ids | |
| E5 | PlayerHQ: empty-bank NO string | |

**Exit E:** production agents obey Masterbrain.

---

## Fase F — Media / cold storage (senere)

| Steg | Handling |
|------|----------|
| F1 | Inventory hash for video (dedupe DVD triples) |
| F2 | Flytt cold archive off 92%-full disk or expand |
| F3 | Model frames: selective P1–P10 heroes only to CDN if needed for UI |
| F4 | Vision pipeline later — out of knowledge-OS critical path |

---

## Risiko-register

| Risiko | Mitigering |
|--------|------------|
| Disk full mid-copy | Only small knowledge files; no video copy in A–E |
| Dual masterbrain (HQ edit vs repo) | Edit only in masterbrain repo; HQ=sync |
| Anders overflow (ADHD) | Max 6 drills first validation batch |
| L-fase residual in rag-corpus | Flag rag morad files; L1 wins but clean prose later |
| ExerciseDefinition vs Masterbrain confusion | Policy doc + separate UI labels |
| Source path with special chars (O´Grady) | Store paths carefully; prefer repo-relative after copy |

---

## Rollback

- drills.json promote: git revert single commit  
- Agent guard: feature flag `MASTERBRAIN_DRILL_INVENT_BLOCK=1` default on  
- Putting files: delete UTKAST concepts without touching fullswing  

---

## Avhengigheter

```
A5 (guard) ──independent──► can ship before any putting work
B2–B6 putting structure ──► E1
C1–C4 drill promote ──► E3 eval
C7 L-fase ──► plan-generering trust
D4 embed ──► chat quality only, not law
```

---

*Neste: `07-OPEN-QUESTIONS.md`*
