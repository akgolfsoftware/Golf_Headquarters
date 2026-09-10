# 00 — SOURCE INVENTORY

**SOURCE_DIR:** `/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH`  
**Verifisert lesbar:** ja (2026-08-07)  
**Total størrelse:** ~796 GB (disken 931 GB, 81 GB ledig, 92 % full)  
**HQ_DIR:** `/Users/anderskristiansen/Developer/akgolf-hq`  
**MASTERBRAIN_DIR (sync-speil):** `${HQ_DIR}/src/lib/masterbrain`  
**Språk i kildemateriale:** primært engelsk (Mac-e-poster, DVD-forelesninger, transkripsjoner); norsk i prosjekt-docs og delvis destillert ordbok.

---

## 1. Toppnivå — størrelse og klasse

| Path | Size | Domain | Quality | Masterbrain target | Notes |
|------|------|--------|---------|--------------------|-------|
| `02 - MORAD/` | 370G | FULLSWING/MORAD + MEDIA | C (rå video) | `raw/media/morad/` (ikke fasit) | Årsmappa 2011–2016 + Main; overlapp med 01/05 |
| `01 - MAC OGRADY SCHOOL/` | 228G | FULLSWING/MORAD + MEDIA | C | `raw/media/school/` | 2011–2014; massivt MOV/JPG |
| `05 - REFERENCE MATERIAL/` | 82G | blandet | B–C | se under | Inkl. lectures + e-post (gull) |
| `00 - DVD_RIPS/` | 37G | MEDIA | C | `raw/media/dvd/` | VOB/IFO; delvis duplisert i `morad-dvd-folder-2/`, `morad_dvd_import/` |
| `09 - ARCHIVE/` | 36G | NOISE/MEDIA | C | ignore / archive only | Backup-Oct-2013 |
| `04 - MAC OGRADY SWINGS/` | 3.6G | MEDIA + MODEL | B | `raw/media/model-swings/` | Referansesvinger |
| `03 - ANDERS SWING ANALYSIS/` | 2.1G | MEDIA (personlig) | B | `raw/media/anders-personal/` — **ikke** agent-fasit | PII; coaching-historikk for Anders |
| `08 - MODEL SWINGS/` | 885M | MEDIA | B | `raw/media/model-swings/` | |
| `MORAD_DATA/` | 723M | DATA + ORDBOK + pipeline | A–B | se §2 | **Viktigste bearbeidede lag** |
| `07 - SKYPE SESSIONS/` | 705M | MEDIA + MENTAL | B | `raw/media/skype/` | 2013 audionote |
| `backend/` | 365M | NOISE (kode/venv) | — | ikke Masterbrain | Gammel FastAPI-app |
| `10 - KNOWLEDGE BASE/` | 96M | FULLSWING + PUTTING + ORDBOK + MEDIA frames | A–B | se §2 | **Primær kunnskapsmappe** |
| `06 - DOCUMENTS/` | 7.9M | NOISE/docs | C | `raw/docs/` | PDF-historikk + prosjektplaner |
| `GOLF_AI_PLATFORM/` | 1.0M | DATA/SG/TrackMan + CIO scaffold | B | `raw/platform-scaffold/` → selektiv transform | 23 CIOs YAML; ikke validert som fasit |
| Rot-filer (m4v, md, jsx) | ~30M | NOISE / legacy app | C | ignore for knowledge OS | Stier peker fortsatt til `Masterfolder 2026` |

---

## 2. Knowledge-kjerne (det som faktisk kan bli Masterbrain)

### 2.1 `10 - KNOWLEDGE BASE/` (96M, ~7 035 filer)

| Path | Type | Domain | Quality | Masterbrain target | Notes |
|------|------|--------|---------|--------------------|-------|
| `01 - POSITIONS/*.md` (2) | MD EN | FULLSWING | B | `raw/morad/positions-md/` → felt-diff mot `knowledge/entities/positions.json` | Address + stance; prosa, ikke 289 målefelt |
| `02 - ANATOMY/*.md` (7) | MD EN | FULLSWING + MENTAL | B | `raw/morad/anatomy-md/` → candidate concepts | Inkl. MENTAL-GAME, NEUROLOGICAL-TIMING |
| `03 - COMMON FAULTS/COMMON-SWING-FAULTS.md` | MD EN | FULLSWING | **A** | allerede speilet i HQ `faults.json` (6→10) | Kilde for 6 av 10 HQ-feil |
| `04 - DRILLS/MORAD-DRILLS.md` | MD EN | DRILLS | **B (kandidat, ikke fasit)** | UTKAST → `candidates/drills/` | **6 drills** — matcher `fjernede_navn` i drills.json |
| `04 - DRILLS/PUTTING-METHODOLOGY.md` | MD EN | PUTTING | **A (rammeverk)** | `knowledge/concepts/putting-framework.json` (ny) | 1–300ft, 5 stages, ball speed→line; **ingen named drill-IDs** |
| `04 - DRILLS/SHORT-GAME-WET-CONDITIONS.md` | MD EN | SHORT_GAME | **A (teknikk)** | `knowledge/concepts/short-game-wet.json` (ny) ELLER rag-corpus | 6 assessment Qs + Seve-fix; ikke P1–P10-map for putting |
| `05 - MODEL GOLFERS/REFERENCE-PLAYERS.md` | MD EN | FULLSWING | B | `knowledge/entities/model-players.json` (ny) | |
| `05 - TRANSCRIPTIONS/*.md` (75) | MD EN | FULLSWING/SHORT_GAME/MEDIA | B | `raw/transcripts/kb-md/` + RAG | Overlapp med MORAD_DATA/03_transcripts |
| `06 - EXTRACTED CONCEPTS/*.json` (4) | JSON | ORDBOK/FULLSWING | B–C | `raw/extracted/` — **ikke** fasit uten validering | 12 terms i glossary (tynt); mac_quotes |
| `06 - TERMINOLOGY/MORAD-POSITIONS.md` | MD EN | ORDBOK | B | diff mot positions.json | |
| `07 - TRANSCRIPTS/*.txt` (2) | TXT | MEDIA | C | raw only | |
| `08 - MODEL FRAMES/` (~6 927 jpg) | IMG | MEDIA | B | `raw/media/model-frames/` — UI/vision, ikke agent-law | P1.0–P10 folders |
| `INDEX.md` | MD EN | — | B | docs | |

### 2.2 `MORAD_DATA/` (723M, ekskl. scripts 633M)

| Path | Type | Domain | Quality | Masterbrain target | Notes |
|------|------|--------|---------|--------------------|-------|
| `01_inventory/` | CSV/MD | DATA | B | raw inventory | |
| `02_processed/reference_lectures_normalized/` (71) | JSON | FULLSWING | **A** | `raw/transcripts/normalized/` | Normaliserte forelesninger |
| `03_transcripts/` (~314 json + batch) | JSON | FULLSWING | A | raw + RAG corpus source | 71 ref lectures + batch_output |
| `04_chunks/reference_lectures_chunks.jsonl` | JSONL | FULLSWING | **A** | `rag-corpus/` via re-chunk + re-embed | **1 081 chunks** |
| `05_embeddings/*.jsonl` | JSONL ~37M | DATA | B | re-embed til Supabase `knowledge_chunks` | Gammel embedding; ikke stolt på i HQ i dag |
| `06_terminology/morad_ordbok_v2.json` | JSON | ORDBOK | **A** | allerede destillert → HQ `ordbok.json` (75 terms) | 74 terms + categories |
| `06_terminology/morad_ordbok.json` | JSON | ORDBOK | C | archive | v1 duplikat |
| `06_terminology/knowledge_base_v1.json` | JSON | DRILLS + FULLSWING | **C (auto-ekstrahert)** | candidates only | **5 drills D001–D005** + 36 concepts + 7 diagnostic rules — **ikke validert** |
| `06_terminology/knowledge_graph.json` | JSON | DATA | C | research only | |
| `06_terminology/term_frequency*.csv` | CSV | ORDBOK | B | ordbok-utvidelse pipeline | |
| `06_ontology/`, `07_swing_analysis/`, `09_outputs/` | empty | — | — | — | Tomme |
| `scripts/` | 633M | NOISE | — | ikke kopier | Inkl. venv/deps |

### 2.3 E-post Mac O'Grady (gullkilde)

**Path:** `05 - REFERENCE MATERIAL/05 - EMAIL CORRESPONDENCE/` (~86 filer, 5.8M)

| Klasse | Eksempler | Domain | Quality | Target |
|--------|-----------|--------|---------|--------|
| PUTTING | `PUTTING_Drills_1-300ft-Half-Decade-Mastery.md`, `PUTTING_Drills_1000-Putts-Dean-Martin-Heels-Together.md` | PUTTING + DRILLS (UTKAST) | **A** | putting-framework + candidate drills |
| TEKNIKK/DRILL | `TEKNIKK_Elbow_Adduction-Drill-Paris-Dreams.md`, `TEKNIKK_Elbow_Adduction-Knock-Down-Shots.md`, `TEKNIKK_Arm-Speed_*`, `TEKNIKK_Shoulder-Plane_*`, `TEKNIKK_Extensions_*`, `TEKNIKK_Short-Game_*` | FULLSWING / SHORT_GAME / DRILLS | **A** | raw + candidate drills |
| MORAD system | `MORAD_System_Explanation-To-John-Overview.md`, `Gmail - Re_ THE MORAD CONCEPTS _...pdf` | FULLSWING | A | raw → concept distill |
| MENTAL | `INSPIRASJON_*`, `ROY-KIM_Psychology_*` | MENTAL | B | rag-corpus/mental/ (prose) |
| PDF-tråder | 33+ Gmail PDFs | blandet | B | OCR/raw; ikke fasit dump |
| FAMILIE/logistikk | `FAMILIE_*`, travel | NOISE | C | ignore for agents |

### 2.4 `GOLF_AI_PLATFORM/` (1.0M)

| Path | Domain | Quality | Target | Notes |
|------|--------|---------|--------|-------|
| `CORE_INTELLIGENCE/canonical_objects/*.yaml` (23) | FULLSWING + SHORT_GAME | **C som fasit** / B som scaffold | `raw/cio/` → **ikke** merge til faults uten Anders | Duplikate CIO-navn (`LOWPOINT`/`LOW_POINT`, `POSTURE`/`POSTURE_CONTROL`) |
| `CONFIG/runtime/TRACKMAN_*.yaml` | DATA/SG/TrackMan | B | diff mot HQ truth-layer / rag-corpus | |
| `CONFIG/schemas/TEMPLATE_DRILL.yaml` | DRILLS | B | innspill til drill-schema | Enklere enn HQ `skjema_for_ny_drill` |
| `DECISION_ENGINE/*` | DATA | C | research | Python-scaffold |
| `cio_short_game_system.yaml` | SHORT_GAME | B | short-game sibling concept | Putting ≠ short game |

---

## 3. Klassifiseringssammendrag

| Domain | Hvor det finnes | Modenhet for Masterbrain |
|--------|-----------------|--------------------------|
| FULLSWING/MORAD | KB anatomy/faults/positions, transcripts, ordbok, e-post TEKNIKK | **Høy** — allerede delvis i HQ fasit |
| PUTTING | PUTTING-METHODOLOGY.md + 2 e-poster; **0** i HQ fasit | **Medium råstoff, null fasit** |
| SHORT_GAME | SHORT-GAME-WET, Seve transcripts, cio_short_game | **Medium** — ikke sibling-strukturert |
| FYS | nesten tomt på SOURCE (CANON/LTAD bor i HQ) | Bruk HQ `ltad-framework` |
| PLAY / SPILL / banestrategi | nesten tomt | Hull (MANIFEST hull #8) |
| MENTAL | MENTAL-GAME.md, INSPIRASJON e-post | Prose/RAG only |
| PERIODIZATION/LTAD | ikke på SOURCE; i HQ concepts | Allerede i HQ |
| DATA/SG/TrackMan | GOLF_AI_PLATFORM + HQ sg-principles/rag | HQ er lengre frem |
| DRILLS | MORAD-DRILLS (6), kb_v1 (5), e-post putting/teknikk | **Kun UTKAST** |
| ORDBOK | ordbok_v2 (74) ≈ HQ (75) | Delvis (7 % av chunks destillert) |
| MEDIA | ~780G video/frames | raw only |
| NOISE | backend venv, duplikate DVD-stier, archive | ignore |

---

## 4. Duplikater

| Duplikatsett | Stier | Handling |
|--------------|-------|----------|
| DVD-mapper | `00 - DVD_RIPS/`, `morad-dvd-folder-2/`, `morad_dvd_import/`, deler av `MORAD_DVD_IMPORT` | Behold én kanonisk raw-sti; ikke triple-ingest |
| Transkripsjoner | `10 - KB/05 - TRANSCRIPTIONS` (md) vs `MORAD_DATA/03_transcripts` (json) vs `ak-second-brain/raw/morad-*` (ifølge MANIFEST) | **Én raw-kilde:** prefer `MORAD_DATA/02_processed` + `03_transcripts` (strukturert). MD i KB er lesevennlig speil |
| Ordbok | `morad_ordbok.json` vs `v2` vs HQ `ordbok.json` vs `processed/rules/morad-ordbok.md` | HQ `knowledge/entities/ordbok.json` er fasit; SOURCE v2 er kilde; processed/rules er **forbudt** (MANIFEST) |
| Feil | `COMMON-SWING-FAULTS.md` vs HQ `faults.json` | HQ utvidet (10 vs 6); SOURCE er undergruppe |
| Drills (fjernet) | `MORAD-DRILLS.md` 6 navn = HQ `fjernede_navn.fantes_med_innhold` | Forventet — bank tømt med vilje |
| Stinavn | README/CLAUDE peker på `Masterfolder 2026` | Stale; faktisk mappe er `MORAD_AI_GOLF_COACH` |

---

## 5. Motsetninger / konflikter (kritisk)

| # | Konflikt | Evidens | Konsekvens for Masterbrain |
|---|----------|---------|----------------------------|
| C1 | **L-faser i HQ fasit vs AK-formel v2** | `canon-methodology.json` + `sg-principles.diagnostic_logic.l_fase_override` bruker L-KROPP…L-AUTO. Anders CLAUDE.md (03.08.2026): L-faser **ENDRET, skal ikke brukes**. AK-formel v2 = 17 områder | **Åpen fasit-feil.** Agent som følger HQ i dag kan generere L-fase-plan. Må avklares før plan-generering stoles på |
| C2 | **Drill-agent finner på drills** | `src/lib/agents/drill-forslag-agent.ts` ber Claude generere 5 drills (ev. fra YouTube) → CaddieDraft. Masterbrain `drills.json` er TOM og sier «aldri finn på» | Hard law brutt i app-kode. Agent må hard-stoppe når bank er tom |
| C3 | **To drill-verdener** | Masterbrain MORAD-drills (tom) vs `ExerciseDefinition` i DB (app-katalog) vs YouTube-genererte utkast | MANIFEST/hent-kunnskap forklarer skillet, men produkt-UX blander. Dual stack-risiko |
| C4 | **SG→fault for ARG bruker fullswing-feil** | `arg: [poor_spine_alignment, casting]` — hypotese OK, men short-game har egne feil i e-post/Seve | Ikke mappe ARG til P1–P10 som diagnose; trenger short-game fault sibling senere |
| C5 | **PUTT-array tom** | `sg_to_morad_faults.putt: []` — korrekt for MORAD, men ingen putting-faults | Putting-brain mangler (MANIFEST hull #2) |
| C6 | **knowledge_base_v1 drills er auto-named** | D001–D005 laget av extraction-script med chunk-IDs | **Aldri** merge til `drills.json` uten Anders-validering |
| C7 | **CIO vs faults** | 23 CIOs overlapper delvis med 10 faults, men annen ID-taxonomi | Én entity-modell i Masterbrain; CIO forblir raw/scaffold til mapping godkjent |
| C8 | **«Mac Malaska» attribusjon** | MANIFEST: rettet i ordbok, feil kan leve i second-brain | Ordbok-pipeline må attribueres Mac O'Grady |
| C9 | **CS-nivåer uavklart** | drills-skjema har `cs_min`/`cs_max`; Anders: spør før CS brukes i noe nytt | Ikke fyll CS i nye drills uten beslutning |
| C10 | **processed/rules i HQ** | MANIFEST: utdaterte kopier | Aldri les som fasit |

---

## 6. Alt som ser ut som drills (flagget)

| Kandidat-ID (midlertidig) | Navn (kilde) | SOURCE path | Status |
|---------------------------|--------------|-------------|--------|
| UTKAST-FS-001 | Left Elbow Adduction Drill | `10 - KNOWLEDGE BASE/04 - DRILLS/MORAD-DRILLS.md` + e-post Paris-Dreams | UTKAST; i fjernede_navn |
| UTKAST-FS-002 | Three Momentum Transfer Timing Drill | MORAD-DRILLS.md + e-post 2015-06-22 Momentum | UTKAST |
| UTKAST-FS-003 | Spine Alignment Setup Drill | MORAD-DRILLS.md + e-post Harry Mission | UTKAST |
| UTKAST-FS-004 | Right Arm/Clubshaft Angle Maintenance | MORAD-DRILLS.md | UTKAST |
| UTKAST-FS-005 | Humeral-Scapula Activation Drill | MORAD-DRILLS.md | UTKAST |
| UTKAST-FS-006 | Knock-Down Shot Practice (Seve) | MORAD-DRILLS.md + TEKNIKK_Elbow_Adduction-Knock-Down | UTKAST |
| UTKAST-FS-007…011 | D001–D005 (Elbow Flexion Chip, Three Lines Photo, Right Arm 45°, Squat-to-Finish, Shaft-on-Hips) | `MORAD_DATA/06_terminology/knowledge_base_v1.json` | UTKAST auto; lavere tillit |
| UTKAST-PUTT-001 | 1–300ft progressive distance (100 putts/dist) | PUTTING-METHODOLOGY.md + PUTTING_Drills_1-300ft…md | UTKAST putting **program**, ikke single drill |
| UTKAST-PUTT-002 | 1000 putts + heels-together pendulum (Dean Martin) | PUTTING_Drills_1000-Putts-Dean-Martin…md | UTKAST putting |
| — | Drill Selection Guide table i MORAD-DRILLS.md | samme fil | Mapping fault→drill; bare gyldig etter bank-validering |

**Regel:** Ingen av disse er i `drills.json`. Se `04-CANDIDATE-DRILLS.json`.

---

## 7. Eksisterende HQ Masterbrain (respektér)

| Forventet av oppdrag | Finnes? | Status |
|----------------------|---------|--------|
| `MANIFEST.md` | ja | 2026-07-31 |
| `canon-methodology.json` | ja | v3.5 — **L-fase-konflikt C1** |
| `drill-taxonomy.json` | **nei** | mangler |
| `putting-framework.json` | **nei** | mangler |
| `sg-principles.json` | ja | putt: [] |
| `faults.json` | ja | 10 entities |
| `positions.json` | ja | P1–P10 |
| `putting-faults.json` | **nei** | mangler |
| `drills.json` | ja | **TOM**, entities {} |
| `hent-kunnskap.ts` | ja | 5 oppgavetyper; **ingen putting-diagnose** |
| `drill-catalog.ts` | **nei** | mangler (logikk ligger i drills.json + hent-kunnskap) |
| `ordbok.json` | ja | 75 terms |
| `ltad-framework.json` | ja | |
| `mikroperiodisering-og-tidsdimensjon.json` | ja | delvis |
| `upgame-dimensions.json` | ja | |
| `rag-corpus/` | ja | ~99 md; 3 ikke i index |
| `training-data/` | ja | holdout 20/25 uten drill |

---

## 8. Hva SOURCE **ikke** er

- Ikke CANON v3.5-kilde (det er AK-internt / HQ)
- Ikke LTAD/periodisering-kilde
- Ikke produksjons-SG baselines (HQ rag-corpus)
- Ikke ferdig drill-bank
- Ikke putting-fault-katalog
- Ikke «den eneste» Masterbrain — det er **råmateriale + tidlig pipeline** mot et system som allerede delvis lever i HQ

---

## 9. Anbefalt ingest-prioritet (fra inventory)

1. **Ikke rør** 780G media før storage-plan (disk 92 % full).  
2. **Kopier raw immutable:** e-post-md (86), KB md (pos/faults/drills/putting/short), MORAD_DATA 02/03/04, ordbok_v2.  
3. **Diff** SOURCE faults/positions/ordbok mot HQ fasit — lukk hull, ikke overskriv.  
4. **Bygg putting-framework** fra PUTTING-METHODOLOGY + 2 e-poster (prose → JSON fields).  
5. **Drill UTKAST** fra §6 — valideringskø for Anders.  
6. **Re-chunk/embed** 1 081 chunks inn i HQ rag-pipeline (ikke gjenbruk 37M jsonl blindt).  
7. **Blokker** dual stacks: drill-forslag-agent + ExerciseDefinition vs Masterbrain.

---

*Neste fil: `01-MASTERBRAIN-ARCHITECTURE.md`*
