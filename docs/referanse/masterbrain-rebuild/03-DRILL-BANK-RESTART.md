# 03 — DRILL BANK RESTART

**Beslutning (Anders 2026-07-31):** bank tømt.  
**Hard law:** ikke skriv 28 fake drills; ikke merge UTKAST til `drills.json` uten promote.  
**Nå:** `entities: {}` + `agent_regel` + `skjema_for_ny_drill` + `fjernede_navn`.

---

## 1. Hvorfor restart var riktig (bekreftet mot SOURCE)

| Problem | Evidens |
|---------|---------|
| Motstrid CS/pyramide | MANIFEST: 7/9 drills motsa morad-drill-bank-core.md |
| Referanser til spøkelser | 5 navn referert, aldri definert |
| Auto-extract navn | `knowledge_base_v1.json` D001–D005 er script-generert |
| App genererer likevel drills | `drill-forslag-agent.ts` finner på 5 drills via Claude/YouTube |

SOURCE `MORAD-DRILLS.md` (6 drills) er **ekte Mac-e-post-destillat**, men:
- mangler formelle IDs, pyramid_area, CS, target_faults som FASIT-felter
- navnene ble eksplisitt lagt i `fjernede_navn` — re-introduksjon krever ny validering, ikke «copy back»

---

## 2. Skjema (utvidet — produksjon)

Utvider dagens `skjema_for_ny_drill` + GOLF_AI `TEMPLATE_DRILL.yaml`:

```json
{
  "id": "fs_left_elbow_adduction",
  "version": "1.0.0",
  "status": "FASIT",
  "domain": "FULLSWING | PUTTING | SHORT_GAME | FYS | SPILL",
  "name": "Visningsnavn EN (Mac-term når den finnes)",
  "name_no": "Visningsnavn NO for PlayerHQ",
  "purpose": "Hva drillen retter (én setning)",
  "purpose_no": "...",
  "pyramid_area": "FYS | TEK | SLAG | SPILL | TURN",
  "cs_min": null,
  "cs_max": null,
  "cs_policy": "UNSET_UNTIL_ANDERS_DEFINES_CS",
  "target_faults": [],
  "target_putting_faults": [],
  "p_positions_trained": [],
  "setup": ["..."],
  "execution": ["..."],
  "feel": "",
  "feel_no": "",
  "duration_minutes": null,
  "reps": null,
  "equipment": [],
  "success_criteria": "",
  "success_criteria_no": "",
  "environment": ["range", "green", "sim", "home"],
  "references": {
    "model_players": [],
    "quotes": []
  },
  "source": [
    {
      "path": "absolute or repo-relative SOURCE path",
      "type": "email_md | kb_md | transcript_chunk | anders_original",
      "quote_span": "optional short quote"
    }
  ],
  "validated_by": "Anders Kristiansen",
  "validated_at": "YYYY-MM-DD",
  "promoted_from": "candidates/drills/UTKAST-FS-001.json",
  "never_invented": true
}
```

### Integrity rules

| Rule | Check |
|------|-------|
| R1 | `id` unique snake_case; prefix `fs_` / `putt_` / `sg_` / `fys_` |
| R2 | `domain=FULLSWING` ⇒ `target_putting_faults` empty; `p_positions_trained` ⊆ P1–P10 |
| R3 | `domain=PUTTING` ⇒ `target_faults` empty; `p_positions_trained` empty; `target_putting_faults` ⊆ putting-faults |
| R4 | `target_faults` ⊆ `faults.json.entities` |
| R5 | Minst én `source.path` som finnes (eller `anders_original` + dato) |
| R6 | `validated_by` + `validated_at` påkrevd for status FASIT |
| R7 | ID i `fjernede_navn` krever `repromote_rationale` felt |
| R8 | `cs_min/max` null tillatt; hvis satt må Anders ha låst CS-skala |
| R9 | Agent may only emit drill `id` present in entities with status FASIT |

JSON Schema-fil: `knowledge/schemas/drill.schema.json` (ny).

---

## 3. ID-konvensjon

| Prefix | Domain | Eksempel |
|--------|--------|----------|
| `fs_` | fullswing / MORAD | `fs_left_elbow_adduction` |
| `putt_` | putting | `putt_progressive_distance_ladder` |
| `sg_` | short game | `sg_wet_high_trajectory_pick` |
| `fys_` | physical | (ingen SOURCE-kandidater ennå) |
| `spill_` | on-course | (ingen) |

**Ikke** gjenbruk bare `left_elbow_adduction` uten prefiks — det kolliderer med gamle IDs i historikk/arkiv.

Midlertidige kandidat-IDs: `UTKAST-FS-001` (se `04-CANDIDATE-DRILLS.json`) — byttes ved promote.

---

## 4. Extraction pipeline (kandidater, ikke fasit)

```
1. Parse known sources (list in 00-inventory §6)
2. Emit candidates/drills/UTKAST-*.json
   - status: UTKAST
   - full source paths + quotes
   - confidence: high|medium|low
   - mapped_target_faults_hypothesis (optional)
3. Human (Anders) checklist → approve / edit / reject
4. scripts/promote-drill.py --id UTKAST-FS-001 --anders-ok
   - validates schema R1–R9
   - writes knowledge/entities/drills.json
   - appends CHANGELOG
   - never runs in CI without flag
5. sync:masterbrain → HQ
6. re-run holdout eval (drill_exists can score)
```

**Forbudt i pipeline:** LLM «generate 28 drills from methodology».

---

## 5. Anders validation checklist (per drill)

Kopier for hver UTKAST:

```
Drill UTKAST-ID: ________
[ ] Jeg kjenner igjen dette fra Mac / egen coaching (ikke AI-fantasi)
[ ] Navn er OK (EN + NO)
[ ] Purpose er riktig
[ ] Setup/execution er trygt og gjennomførbart
[ ] target_faults er riktige (eller tom med vilje)
[ ] domain riktig (FULLSWING/PUTTING/…)
[ ] Ingen P-posisjon på putting
[ ] CS: la stående null / eller sett eksplisitt
[ ] Source-path er korrekt
[ ] Godkjent til FASIT: JA / NEI / REDIGER FØRST
Signatur: Anders  Dato: ____
```

Batch-mål: **3–6 drills første runde**, ikke 28.

---

## 6. Agent empty-bank rule (må håndheves i kode)

### Masterbrain (`drills.json` — finnes)
> Så lenge entities er tom: agenten skal si at drill-banken er under oppbygging, og aldri finne på en drill selv.

### `hent-kunnskap` drill-forslag (finnes)
Returnerer TOM-melding — OK.

### **Brudd:** `drill-forslag-agent.ts`
Genererer navngitte drills via Claude/YouTube → CaddieDraft.

**Required fix (prioritet P0):**

```
IF masterbrain.drills.entities count == 0:
  - Do NOT call Claude to invent drills
  - Do NOT create CaddieDraft drill suggestions with invented names
  - Emit status: "MORAD/Masterbrain drill-bank TOM — venter validering"
  - Optional: allow ONLY promote-from-candidates UI for Anders
ELSE:
  - Propose ONLY ids from entities
  - YouTube may attach videoUrl to known id, never create new id
```

### ExerciseDefinition (DB)
Separat produktkatalog. Policy må velges (åpent spørsmål Q3 i 07):

| Policy | Betydning |
|--------|-----------|
| A (anbefalt) | ExerciseDefinition er **operativ øvelsesliste** for plan-UI; Masterbrain drills er **metodikk-drills**. Plan kan bruke ExerciseDefinition-IDs; «MORAD drill»-språk bare fra Masterbrain |
| B | All drill-foreslåing går kun via Masterbrain; ExerciseDefinition = speil etter promote |
| C | Midlertidig: plan bruker ExerciseDefinition; diagnose-agenter bruker Masterbrain empty-safe |

Uansett: **ingen** agent finner på tredje katalog.

---

## 7. Forhold til `fjernede_navn`

| Gruppe | Handling |
|--------|----------|
| `fantes_med_innhold` (9) | Kan re-promotes **kun** hvis SOURCE + Anders checklist; ny `fs_`-id anbefales |
| `kun_referert_aldri_definert` (5) | **Ikke** reintroduser uten full def + source |

Mapping gammelt → UTKAST (se 04):

| Gammelt id | UTKAST |
|------------|--------|
| left_elbow_adduction | UTKAST-FS-001 |
| three_momentum_transfer | UTKAST-FS-002 |
| spine_alignment_setup | UTKAST-FS-003 |
| right_arm_angle_maintenance | UTKAST-FS-004 |
| humeral_scapula_activation | UTKAST-FS-005 |
| knock_down_shot | UTKAST-FS-006 |
| hip_lead_drill, lag_retention_drill, pump_drill | ingen solid SOURCE-seksjon i MORAD-DRILLS.md — **ikke** i 04 før funnet |

---

## 8. drill-taxonomy.json (ny concept — ikke instances)

Taxonomy er **tags**, ikke drills:

```json
{
  "id": "drill-taxonomy",
  "version": "0.1.0",
  "domains": ["FULLSWING", "PUTTING", "SHORT_GAME", "FYS", "SPILL"],
  "pyramid_areas": ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
  "fullswing_fault_ids_ref": "entities/faults.json",
  "putting_fault_ids_ref": "entities/putting-faults.json",
  "p_positions": ["P1.0", "...", "P10.0"],
  "agent_regel": "Taxonomy begrenser lovlige feltverdier. Den inneholder ingen drill-navn."
}
```

---

## 9. Eval / rubrikk

- `drill_exists` forblir 0 til første promote
- Holdout ho-003/004/010: forvent «bank under oppbygging» som **korrekt** svar inntil bank finnes
- Etter første 3 FASIT-drills: legg holdout som krever eksakt id

---

## 10. Leveranse i denne runden

| Artefakt | Status |
|----------|--------|
| Schema + rules | dette dokumentet |
| Pipeline design | dette dokumentet |
| Checklist | §5 |
| UTKAST candidates | `04-CANDIDATE-DRILLS.json` |
| `drills.json` entities | **uendret tom** |

---

*Neste: `04-CANDIDATE-DRILLS.json`*
