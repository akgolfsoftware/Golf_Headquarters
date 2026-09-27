# Status for årsplan-motoren i AK Golf HQ

*Dato: 26. september 2026*
*Forankring: Anders Kristiansens trenerbeslutninger for standard årsplan for 16-årig junior (1250 timer).*

Dette dokumentet oppsummerer de seks lukkede hullene i AK Golf HQs treningsmotor. Alle endringer er gjennomført og sikret med separate, isolerte commits og full database- og enhetstestdekning.

---

## 1. Oversikt over de 6 oppgavene

| Oppgave | Hva ble bygget | Fil / Område | Commit | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Én definisjon av A–K-skalaen** | Én autoritativ skala for spillernivå: **A = World Elite (<68)** til **K = Nybegynner (100+)**. Synkronisert på tvers av masterbrain, Caddie-veileder, AI-planlegging og tester. Ingen duplikate definisjoner. | `src/lib/domain/ak-kategori.ts`, Masterbrain, Caddie | `a9dd6314d` | Fullført |
| **2. Uken som reelt objekt** | Egen `WeekPlan`-modell i Postgres for ukeplanlegging. Uketyper (`UTVIKLING`, `TURNERING`, `AVLASTNING`, `TEST`, etc.), treningsnotater (`TEKNIKK_UKE`, `VOLUM_UKE`), timebudsjett per pyramide og belastningstak. Bygget `WeekPlanEditor` og ukesoverskrift i AgencyOS Workbench. | `prisma/schema.prisma`, `WeekPlanEditor.tsx`, `WorkbenchUke.tsx` | `e29205fe9` | Fullført |
| **3. Opplevd anstrengelse (sRPE) på økt** | Lagt til `perceivedEffort` (1–10 Borg CR-10) og `actualMinutes` på `WorkbenchSession`. Foster-metoden: Varighet (min) × Anstrengelse (1–10) = Belastningspoeng. Spiller trykker 1–10 i PlayerHQ `OktArk`, coach ser og justerer i `SessionInspector` og `WorkbenchUke`. | `src/lib/domain/workbench/load.ts`, `OktArk.tsx`, `SessionInspector.tsx` | `d52690a6e` | Fullført |
| **4. Repetisjonstelling i Live (nærspill & putt)** | Utvidet `SessionBallLog` med `area`, `category` og `repetitionType`. Live-tapperen har nå tre faner: **Full sving** (køller fra bag), **Nærspill** (Chip, Pitch, Lob, Bunker) og **Putting** (Kort <3m, Mellom 3–10m, Lengde >10m), pluss hastighetsvalg (Full fart, Lav fart, Tørrsving). | `reps.ts`, `tapper-shell.tsx`, `actions.ts`, schema | `508c61d8e` | Fullført |
| **5. Årsvolum og 6 belastningsvarsler** | Fremdrift mot 1250-timers målet for toppsatsende juniorer og 6 ikke-blokkerende veiledningsvarsler for coach: 1) Akutt:kronisk belastning >15%, 2) Full sving +10% over forrige uke, 3) 4 uker på rad med økende belastning, 4) 3 røde dager på smerte/egensjekk, 5) Søvn <8 timer 3 netter på rad, 6) Årsvolum >5% bak banen. | `src/lib/domain/workbench/warnings.ts`, `operations.ts` | `b1e444056` | Fullført |
| **6. Strokes Gained mot spillerens eget nivå** | PGA Tour er tydelig merket som referanse. Spillerens egen baseline regnes ut fra de siste opptil 20 rundene. Strenge pålitelighetsterskler håndheves: <8 runder = for lite grunnlag, ~12 runder for utslag og innspill, ~24 runder for nærspill og putting. Verifisert mot reell spiller i databasen. | `src/lib/domain/sg-mot-seg-selv.ts`, tester | `60d3a85e6` | Fullført |

---

## 2. Feltveiledning for Anders (Hva betyr dette i hverdagen?)

### A–K-skalaen (Kategori)
- **Hva du ser:** Hver spiller har én offisiell kategori fra A til K. A er spillere i verdenseliten med snittscore under 68 slag, mens K er nybegynnere med score over 100.
- **Hvorfor det er viktig:** Verken Caddie, Jarvis eller treningsplanleggeren kan nå gjette eller bruke motstridende kategorier. Alle forslag bygger på samme målestokk.

### Ukeplanlegging i Workbench
- **Hva du ser:** Øverst i ukesvisningen i Workbench ser du nå en uke-etikett (f.eks. «Utviklingsuke», «Turneringsuke» eller «Avlastning») og temalapper (f.eks. «Teknikk-uke», «Testuke»).
- **Hva du kan gjøre:** Klikk på uke-knappen for å sette mål for uken: timer per pyramide (Fysikk, Teknikk, Slagtrening, Spill, Turnering), repetisjonsmål (tørrsving, full fart, putting) og et øvre belastningstak.

### Belastningsstyring (sRPE)
- **Hva spilleren gjør:** Når spilleren fullfører en økt på telefonen (`OktArk`), trykker de på et tall fra 1 (Veldig lett) til 10 (Maksimalt), og bekrefter faktisk tid i minutter.
- **Hva du ser som coach:** Økten får umiddelbart beregnet belastningspoeng (f.eks. 90 minutter × 6 i anstrengelse = 540 poeng). I Workbench ser du ukens samlede belastning og snittanstrengelse. Ingenting blokkerer hvis spilleren ikke har tastet inn; feltet forblir ærlig tomt.

### Live-tapper med nærspill og putting
- **Hva spilleren gjør:** På rangen eller treningsgreenen åpner spilleren slagtelleren. De kan enkelt veksle mellom tre faner:
  - **Full sving:** Køllene fra spillerens egen bag (Driver, 7-jern, Wedger osv.).
  - **Nærspill:** Chip, Pitch, Lob og Bunker.
  - **Putting:** Kortputt (<3m), Mellomputt (3–10m) og Lengdeputt (>10m).
- **Hurtigvalg for fart:** Spilleren kan velge om de slår med «Full fart», «Lav fart» eller gjør «Tørrsving». Hvert trykk vibrerer lett og teller opp. «Angre»-knappen fjerner nøyaktig det siste slaget som ble trykket.

### 6 veiledende belastningsvarsler
Ingen av varslene låser eller stopper systemet. De fungerer som en oppmerksom assistent for coachen:
1. **Akutt:kronisk belastning:** Varsler hvis ukens belastning øker med mer enn 15 % sammenlignet med snittet de siste fire ukene.
2. **Full sving-volum:** Varsler hvis antall full-sving-slag hopper over 10 % fra forrige uke.
3. **Akkumulert tretthet:** Varsler hvis belastningen har økt fire uker på rad uten pause (signal om å planlegge en roligere uke).
4. **Smerte / egensjekk:** Varsler umiddelbart hvis spilleren har tre dager med rød status (smerte/ubehag) den siste uken.
5. **Søvnunderskudd:** Varsler hvis spilleren har sovet under 8 timer tre netter på rad.
6. **Årsvolum (1250-timers banen):** Varsler hvis akkumulert treningstid ligger mer enn 5 % bak banen mot 1250 timer.

### Strokes Gained mot eget nivå
- **Problemet som ble løst:** Unge spillere mister ofte motet av å se rå PGA Tour-tall (f.eks. -3.5 eller -6.0 mot verdens beste spillere).
- **Løsningen:** Appen viser nå tallene **side om side**:
  1. *PGA Tour-referanse:* Viser det absolutte nivået mot scratch/tour.
  2. *Egen 20-runders baseline:* Spillerens eget historiske snitt.
  3. *Endring mot eget nivå:* Viser om spilleren er foran (+) eller bak (-) sin egen standard på de siste rundene.
- **Terskelregler:**
  - Under 8 runder: Systemet sier ærlig «For lite grunnlag».
  - 12 runder: Tilstrekkelig for utslag og innspill.
  - 24 runder: Nødvendig for nærspill og putting fordi disse områdene har naturlig høyere svingninger fra runde til runde.

---

## 3. Verifisering på ekte spiller i databasen

Beregningen av Strokes Gained mot eget nivå ble testet mot den mest aktive spilleren i utviklingsdatabasen (**Øyvind Rohjan**, 14 runder):

```text
======================================================
SPILLER: Øyvind Rohjan (14 runder i databasen)
======================================================

Status: OK
Konklusjon: Spilleren presterer over egen baseline (+1.56 slag mot eget 14-runders snitt).
Grunnlag: Spillerens egen baseline bygger på siste 14 runder. Sammenlignet mot siste 3 runder.

SIDE-OM-SIDE SAMMENLIGNING:
---------------------------------------------------------------------------------------------------------
Område        | Siste 3 runder (PGA Tour) | Egen 14-runders baseline | Relativt til eget nivå | Pålitelighet
---------------------------------------------------------------------------------------------------------
Total         |                     +1.48 |                    -0.08 |                  +1.56 | Statistisk pålitelig baseline (14 runder).
Utslag (OTT)  |                     +0.31 |                    -0.08 |                  +0.39 | Statistisk pålitelig baseline (14 runder).
Innspill (APP)|                     +0.68 |                    +0.21 |                  +0.47 | Statistisk pålitelig baseline (14 runder).
Nærspill (ARG)|                     +0.24 |                    +0.01 |                  +0.23 | Innledende tall (har 14/24 runder pga. høy varians i nærspill/putting).
Putting (PUTT)|                     -0.10 |                    -0.07 |                  -0.03 | Innledende tall (har 14/24 runder pga. høy varians i nærspill/putting).
---------------------------------------------------------------------------------------------------------
PGA Tour referanse: PGA Tour (Scratch/Tour-nivå)
```

Funn:
- Utslag og innspill er merket som **Statistisk pålitelig** (14 runder ≥ 12).
- Nærspill og putting er ærlig merket som **Innledende tall** fordi de krever ~24 runder før tilfeldig støy er filtrert bort.

---

## 4. Arkitektonisk renhet

1. **Ingen nye sesjonstabeller:** Alt arbeid er skrevet mot den etablerte `WorkbenchSession`-modellen.
2. **Ingen ødelagte migrasjoner:** Hver databaseendring er lagt til som nye, additive kolonner med egne migrasjonsfiler (`20260926170000_week_plan_model`, `20260926180000_session_effort`, `20260926190000_session_ball_log_reps`).
3. **Full bakoverkompatibilitet:** Tidligere lagrede økter og enkle slagtellinger fortsetter å fungere uten datatap.
4. **TruthLayer-prinsippet overholdes 100 %:** Verken belastningspoeng, årsbaner eller SG-tall fabrikkeres dersom grunnlagsdata mangler. Systemet oppgir alltid hvor mange runder eller dager vurderingen hviler på.
