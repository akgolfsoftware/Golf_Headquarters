# 07 — OPEN QUESTIONS + 10 NESTE HANDLINGER

---

## Åpne spørsmål (trenger Anders)

| ID | Spørsmål | Anbefaling | Blokkerer |
|----|----------|------------|-----------|
| Q1 | **L-faser:** CLAUDE.md sier utgått (AK-formel v2, 17 områder). HQ `canon-methodology.json` + `sg-principles` har fortsatt L-KROPP…L-AUTO. Hva er fasit for agenter i dag? | Erstatt L-fase som plan-driver med ak-formel-v2 JSON; arkiver L-fase til archive med merknad | plan-generering tillit |
| Q2 | **CS-nivåer:** drills-skjema har cs_min/max. Skal v1 alltid ha `null`? | Ja — null til du låser CS-skala | drill promote felter |
| Q3 | **ExerciseDefinition vs Masterbrain drills:** to kataloger. Policy A (operativ DB vs metodikk-fasit), B (kun Masterbrain), eller C (midlertidig)? | **A** med tydelig UI-label | plan-UI + drill-agent |
| Q4 | **Putting-faults:** vil du definere 3–8 feil nå, eller bare treningsprogram uten fault-katalog? | Start program (framework) FASIT; faults tom til du dikterer | putting-diagnose dybde |
| Q5 | **300 ft putting:** produktanbefaling til alle spillere, eller coach-only / elite? | Coach-only flagg; spillere får 1–50 ft stige i UI | PlayerHQ putt-plan |
| Q6 | **Heels-together (Dean Martin):** godkjennes som drill? | Ja som UTKAST-PUTT-002 hvis du bruker den i coaching | putt bank |
| Q7 | **Re-promote left_elbow_adduction m.fl.:** samme innhold som fjernet 31. jul, ny id `fs_*`? | Ja for FS-001…006 etter checklist | første bank-fyll |
| Q8 | **D001–D005 auto-extract:** forkaste eller omskrive? | Forkast som FASIT; low priority rewrite only if you recognize Mac's intent | støy |
| Q9 | **Kanonisk masterbrain-repo:** er `akgolfsoftware/masterbrain` fortsatt source of truth, med HQ kun sync? | Ja — rediger aldri fasit kun i HQ | dual stack |
| Q10 | **CIO YAML (23):** mappe til faults, eller la som raw research? | Raw only til du godkjenner mapping-tabell | unngå tredje feil-taxonomi |
| Q11 | **Ordbok 7 %:** prioritere full destillasjon av 75 transcripts nå? | Nei — etter drill guard + putting structure + 6 drills | token/tid |
| Q12 | **Short-game sibling:** egen brain nå eller etter putting? | Etter putting framework er FASIT | scope |

---

## Konflikter med CANON/MORAD (oppsummert)

1. **L-fase vs AK-formel v2** — se Q1 / inventory C1.  
2. **SG ARG → fullswing faults** — hypotese OK midlertidig; short-game brain mangler.  
3. **drill-forslag-agent invent** vs Masterbrain empty law.  
4. **rag-corpus** `morad-drill-bank-core.md` kan fortsatt beskrive gamle drills — L1 tom vinner, men prosa forvirrer. Arkiver eller banner «ikke fasit».  
5. **«Mac Malaska»** i second-brain sources — ryddes separat, ikke i Toshiba-pass.

---

## 10 neste handlinger for deg (Anders)

1. **Si ja til P0-kodefiks:** drill-forslag-agent skal stoppe når bank er tom (ingen Claude-oppdikt).  
2. **Svar Q1:** L-fase død eller lever? (én setning).  
3. **Svar Q3:** ExerciseDefinition-policy A/B/C.  
4. **Godkjenn putting-framework pillars** (speed→line, five stages, 1–300 program) som UTKAST→FASIT eller endre.  
5. **Kjør checklist på UTKAST-FS-001…006** — kryss av JA/NEI per drill (maks én time).  
6. **Kjør checklist på UTKAST-PUTT-001 og 002** — program vs drill, heels-together ja/nei.  
7. **Ikke** be AI om «fyll 28 drills» — avvis det hvis noen agent foreslår det.  
8. **Bekreft** at kanonisk fasit redigeres i masterbrain-repo (sync til HQ), ikke omvendt.  
9. **La Toshiba-video ligge** — ikke kopier 780G før disk-plan; knowledge er i de små mappene.  
10. **Etter 1–3 promote:** si ifra, så holdout/eval og putting-diagnose wires i HQ.

---

## Leveranseplassering

```
/Users/anderskristiansen/Developer/akgolf-hq/masterbrain-rebuild/
  00-SOURCE-INVENTORY.md
  01-MASTERBRAIN-ARCHITECTURE.md
  02-PUTTING-BRAIN.md
  03-DRILL-BANK-RESTART.md
  04-CANDIDATE-DRILLS.json
  05-AGENT-WIRING.md
  06-MIGRATION-PLAN.md
  07-OPEN-QUESTIONS.md
```

**Paths brukt:**  
- SOURCE: `/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH`  
- HQ: `/Users/anderskristiansen/Developer/akgolf-hq`  
- MASTERBRAIN_DIR: `.../src/lib/masterbrain`

**Ikke skrevet til `drills.json`.** Entities forblir `{}`.

---

## Kort konklusjon

Toshiba-mappa er et **enormt media-arkiv** + et **godt nok raw/knowledge-lag** for MORAD fullsving (feil, posisjoner, ordbok, 71 transkripsjoner, 1081 chunks, 6 Mac-drills i prosa).  

HQ Masterbrain er allerede et **delvis produksjons-OS** med harde lover — men **putting mangler**, **drill-bank er tom med vilje**, **L-fase i canon motsier din v2-beslutning**, og **én agent finner fortsatt på drills**.  

Masterbrain-rebuild = ikke «importer alt fra disken». Det er: **immutable raw → candidates → Anders promote → L1 fasit → hent-kunnskap ruting → never-invent i kode**.
