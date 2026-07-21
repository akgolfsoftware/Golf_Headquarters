# Natt-brief — overnight/cherny-workbench-design

**Startet:** 2026-07-20 · **Branch:** `overnight/cherny-workbench-design`  
**Bar:** Cherny (kode/sikkerhet) + verdensklasse UI + AK-formel + SG/TrackMan-bro

## Fasit i natt (P0)

1. Workbench (spiller + coach) — formel-chips first-class  
2. Shell PHQ / AOS  
3. Hub (hjem / stall der relevant)  
4. Analyse-bro: SG-gap → «Planlegg dette» → Workbench  
5. Designsystem-dokumentasjon / Claude Design synk  

## Parkert (F1–F7 — ikke natt)

ny-okt DB · Gantt multi/undo · full drill-formel · offline · AI uke · landing v3 · aktiver 31 spillere

## Autonomi

GJØR: design, visuell port, bro-CTA, tester, commits, draft PR  
IKKE: merge main, destruktiv migrering, endre pris/tilgang/«aldri sperre»

---

## Domene-selvtest (obligatorisk)

### 1. Seks AK-akser + UI-bro
Pyramide FYS/TEK/SLAG/SPILL/TURN · Område · Læringstrinn (DB 5 L_*, UI 3 steg via `ak-formel-visning`) · CS50–100 · M0–M5 · PR1–5 (UI 4 press-nivåer). Motor forblir finkornet.

### 2. GRUNN vs TURNERING
GRUNN: FYS/TEK opp, SPILL/TURN ned. TURNERING: SPILL/TURN opp, FYS/TEK ned. Anbefaling, ikke sperre for spiller.

### 3. SG
OTT/APP/ARG/PUTT · positiv = bedre · ARG = **nærspill** · PUTT IUP (1 m ≈ 1,13) · putt-avstand i **fot** i UI · Broadie for OTT/APP/ARG.

### 4. Bias vs spredning
Bias = snitt side (sikte/face). Spredning = σ (treff/volum). To ulike AK-resepter.

### 5. Svak ARG → Workbench
Default map: ARG → pyramide **SLAG**, område **Nærspill** (`optimal-session` / SG_TO_PYRAMID). Land i uke-økt med lav CS + relevant M. CTA: Workbench.

### 6. M/PR-badge
Range ≠ turnering. Uten badge er sammenligning ugyldig.

### 7. Anbefaling vs hard invariant
Spiller: klarspråk-chip. Hard CANON kan stoppe ugyldig lagring i motor — aldri «overstyr»-språk mot spiller.

---

## Sikkerhet (Workbench)

- Publish/load: eierskap spiller / coach-tilgang  
- `sanitizeAkFormel` før DB  
- Ingen secrets i commits  

## Leveranser underveis

- [x] Branch  
- [x] NATT-BRIEF  
- [x] AnalysereV2: Planlegg-dette-bro fra nesteFokus  
- [ ] Claude Design hi-fi Workbench/analyse-bro  
- [ ] Shell polish om gap  
- [ ] Verify + NATT-RAPPORT + draft PR  
