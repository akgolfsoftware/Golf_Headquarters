# Plan: alle skjermer til Train-lock (ny plan, 09.09.2026)

Erstatter ikke STEG 20 som historikk (PR-er og leveranser der står), men er en ny, egen
plan fra bunnen — bestilt av Anders 09.09.2026, som samtidig opphevet «FULL før resten»-
pausen fra samme dag for akkurat dette sporet.

**Målt i økt (09.09.2026), `git log`/kode, ikke gjettet:**
- 153/219 Train-lock-tegninger sitert fra kode.
- Kun **11 av 219** faktisk pikselmålt i sign-off-riggen (7 klargjort, ikke kjørt).
- 190 Train-lock-siteringer i 180 `.tsx`-filer — **155 av dem uten Rigg/Avvik-linje**
  (siteringen er ikke bevist, kun påstått).
- **81 filer siterer fortsatt Paper** — et slettet designsystem (CLAUDE.md: «Paper skal
  ett hundre prosent bort», 30.08.2026). Disse er ikke Train-lock-skjermer i praksis,
  uansett hva de ellers gjør.
- 12 kjente kontrastbrudd i lys modus — godkjent unntak (Vei A, 03.09), ikke feil å rette.
- Marketing (22 sider) porter til AK Golf-masteren, IKKE Train-lock (CLAUDE.md invariant 2,
  beslutning 04.09) — utenfor denne planens skop, unntatt `/booking` (Train-lock, alltid vært).
- `/team-norway/*` porter til Claw, WANG-merket til eget system — utenfor denne planens skop.
  Der de deler skjerm med produktet (Analyse/DataGolf for TN), er det Train-lock med skinn —
  DEKKES av denne planen.

## Definisjon av «ferdig» per skjerm (uendret prinsipp, gjentas fordi det er lett å glemme)

En skjerm er IKKE ferdig fordi koden siterer en `.dc.html`. Ferdig krever:
1. Filhode med Fasit + Rigg + ev. Avvik (PORTING.md §0b-konvensjonen).
2. Ingen Paper-import (`T`, `--p-*`) — kun `--tl-*`/`TL`.
3. Riggrad i `tests/visual/skjerm-mapping.ts`, kalibrert (ikke bare klargjort).
4. Skjermbilde 390px + 1280px, lys + mørk, sett av Anders (skjermbilde-gaten, 04.08).
5. `npm run verify` grønn.

## De ti stegene

1. **Rydd opp restene fra forrige runde før noe nytt startes.** Fase 1 økt 6 (nattlig
   måling) ligger ferdig men upushet i worktree `.claude/worktrees/fase1-okt6` —
   fullfør og PR den, eller forkast bevisst. Sweep-grenen
   `feat/steg-19-6-19-7-kontrast-tallhero` (150 filer, upassert PR) — gjennomgå mot
   Vei A-regelen (aldri fjern opp/ned-informasjon, flytt den til et par som består) og
   enten fullfør som PR eller forkast. Ingen ny fase starter med to halvferdige grener
   liggende.
   *Verify: `git branch -a` viser ingen av de to som «hengende»; enten PR opprettet eller
   grenen slettet med begrunnelse.*

2. **PlayerHQ — lanseringskjeden** (innlogging → I dag → Plan → gjennomfør økt → Analyse
   → Meg/abonnement). Dette er skjermene en ekte spiller faktisk går gjennom hver uke.
   Skjermfamilier: PH-01, PH-04–PH-09, PH-17, PH-19, WB (spiller), ME-03/ME-04, B1/B3,
   KA-04, auth. Mål: alle disse har Rigg-linje kalibrert, ingen Paper-import, skjermbilde
   sett av Anders.
   *Verify: `node scripts/check-fasit-sitering.mjs` viser 0 uten Rigg/Avvik for denne
   listen; skjermbilder sendt og godkjent.*

3. **AgencyOS — lanseringskjeden** (Stall → Workbench → Kø → Jarvis → Meg, AX-01-skallet).
   Dette er Anders' egen daglige flate. Skjermfamilier: AX-01-hullene, WB-01/03/06,
   S3-01–03/AG-08 (spiller 360), AG-03/AG-04/AG-10, demo-sløyfe.
   **Avhenger av beslutningskø-punkt 32 (coach-meny: AX-01 vs. prototypens fem faner)** —
   still spørsmålet FØR denne fasen bygges, ikke underveis.
   *Verify: samme som steg 2, for denne listen.*

4. **De 81 filene som fortsatt siterer Paper — reell re-port, ikke bare token-bytte.**
   Dette er den skjulte gjelden: en fil kan «se Train-lock ut» og likevel importere `T`
   eller `--p-*` et sted. Kjør `grep -rl "from .*paper\|--p-" src/` (eller
   tilsvarende) for å få listen, sorter etter skjermfamilie, og porter hver — samme
   ferdig-krav som over. Prioriter skjermer fra steg 2–3 som allerede er i bruk daglig.
   *Verify: 0 treff på Paper-import i `src/` (skript `check-ingen-paper.mjs` i
   `npm run verify` skal allerede stoppe nye, men eksisterende må ryddes eksplisitt).*

5. **Resten av PlayerHQ** (bulk, ~28 gjenstående skjermfamilier per 05.09-tellingen —
   tell på nytt ved fasestart): booking-skjermer, GP/BO/TU/RU-serien, spillerens
   Workbench-rester (P-02–P-07, WB-05), DG-10–17 DataGolf-spillerverktøy (fasit synket
   08.09). Bulk-sign-off i grupper à 3 skjermer per økt, hver med egen gate.
   *Verify: hver gruppe har Rigg-linje + skjermbilde-godkjenning før neste gruppe starter.*

6. **Resten av AgencyOS + AgenticOS.** A-serien (inspektørpanel, drill-felt, drag,
   måned), AG-huber, AO-paneler, KA-01/02/05, GAP-1/2, omtegning av AG-03/AG-04/AO-01
   mot AX-01.
   *Verify: samme mønster.*

7. **Forelder.** FO-01–FO-10 i lys+mørk, `barn/[childId]`-canvas, `side-tilstand.tsx`
   uten AK Golf-tokens (den skal bruke Train-lock, ikke merkelaget), security-review
   av delingsflater.
   *Verify: samme mønster + at ingen forelderdata lekker på tvers av barn (RLS-sjekk).*

8. **iPad som tredje skall.** Samle `TL_BREKK` ett sted, ett skall i `shell.tsx`, gå
   gjennom de ~45 filene med egen iPad-ramme og fold dem inn i det ene skallet.
   *Verify: iPad-visning (768–1024px) testes på minst 5 representative skjermer per flate.*

9. **Full pikselverifisering — lukk gapet mellom 190 siteringer og 11 kalibrerte.**
   Kjør riggen på ALLE Train-lock-siterte skjermer, ikke bare de nye fra steg 2–8. Dette
   er separat fra å bygge nye skjermer — det er å bevise at det som allerede står der
   faktisk stemmer. Nattlig måling (worktree fra steg 1) er verktøyet.
   *Verify: `tests/visual/fasitdekning-baseline.json` og kalibrert-tallet i riggen
   dekker ≥95 % av siterte skjermer.*

10. **Sluttgate: hele produktet, ingen unntak.** `npm run verify` grønn, 0 Paper-
    siteringer i `src/`, 0 usiterte fasiter uten begrunnelse i SCREEN-INDEX §Kjente hull,
    alle 12 kjente kontrastbrudd fortsatt kun de godkjente (ingen nye), skjermbilde-gate
    kjørt på et representativt utvalg fra hver flate (PlayerHQ/AgencyOS/Forelder) på nytt
    — for å fange regresjoner fra de foregående ni stegene, ikke bare enkeltskjermer i
    isolasjon.
    *Verify: én samlet PR-beskrivelse (eller retro i `docs/feillogg.md`) som viser
    før/etter-tallene fra steg 1–9.*

## Åpne beslutninger som blokkerer enkeltsteg (ikke hele planen)

Disse må Anders svare på når vi når fasen — å vente på alle nå ville forsinket steg 1–2
unødig:
- **Steg 3:** kø-punkt 32 (AX-01 vs. prototypens fem faner).
- **Steg 5:** kø-punkt 27 (Ø18/A-15 årsplan — hvilken canvas er fasit).
- **Steg 6:** kø-punkt 33 (forsiden — «Reisen» vs. kitet, blokkerer marked-sporet, ikke
  Train-lock, men nevnes fordi PR #798 står åpen).

## Uendret utenfor skop

Marketing (unntatt `/booking`), `/team-norway/*` egne skjermer (Claw), WANG-merket
(eget system). Disse porter til andre fasiter — ikke Train-lock — og røres ikke av
denne planen.
