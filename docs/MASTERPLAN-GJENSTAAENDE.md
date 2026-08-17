# MASTERPLAN — alt som gjenstår (17.08.2026)

**Rolle:** den ENE samlede gjenstående-planen på tvers av alle spor. Skrevet under
plan-oppryddingen 17.08 (78 utgåtte dokumenter slettet, status målt mot `main` @ `1f3e127`
og fem parallelle kodekartlegginger — ikke antatt). Erstatter `COMPLETE-REMAINING-PLAN.md`,
`REMAINING.md` og `gjenstaaende-plan-2026-07-31.md` (alle slettet — git-historikk).

**Underplaner denne peker på (ikke dupliserer):**
`docs/port/PORTPLAN.md` (port-rekkefølgen) · `docs/port/masterplan-lansering-2026-08-12.md`
(lanserings-fasene) · `docs/plan-agenticos-jarvis-2026-08-17.md` (AI-laget) ·
`docs/plan-baneguide-sg-app-2026-08-16.md` i PR #514 (SG-appen) ·
`docs/platform/stripe-cutover-sjekkliste.md` (betaling).

---

## STEG 0 — Akutt (denne uka, før alt annet)

| # | Oppgave | Eier | Status/kilde |
|---|---|---|---|
| 0.1 | **Merge PR #490 — WANG PII-fiks.** `/team-wang` (inkl. coach + IUP-vurderinger av mindreårige) er åpen uten innlogging siden 15.08. #490 gjør fellessiden navnefri og sperrer coach igjen. #406 lukkes som overflødig | **Anders (ja) + agent** | PR #490 klar |
| 0.2 | ~~Rotér `SCREENTEST_PASSWORD`~~ **GJORT av Anders 17.08.2026.** Verifisert samme dag: `signoff-gallery.mjs` logger inn og fotograferer igjen (96 av 98 bilder OK). **Rest:** `screentest-parent@akgolf.test` sto ikke i rotasjonsskriptet, så foreldreportalen (`B2-forelder`) feiler fortsatt på innlogging. Skriptet er rettet — kjør det én gang til for å få forelder-brukeren med | **Anders** | `scripts/roter-screentest-passord.ts` |
| 0.3 | **Behandle PR-køen:** #549 (S3-port, trenger skjermbilde-gate) · #547 (Jarvis maskinrom) · #542 (innganger til 13 skjulte flater) · #534 + #514 (SG-grunnmur + plan) | Anders + agent | Åpne PR-er |
| 0.4 | **Talent-gate-verifisering i prod:** gaten var inert til 17.08 (#537/#541) — kjør kontrakttestene mot prod og bekreft at TALENT-profil faktisk stoppes utenfor allowlisten | Agent | `tests/` fra #539 |

## STEG 1 — Lansering P0 (uendret spor, fasene i masterplan-lansering-12.08)

| # | Oppgave | Eier |
|---|---|---|
| 1.1 | Resend DKIM for `send.akgolf.no` | **Anders (panel)** |
| 1.2 | `akgolf.no` DNS → Vercel | **Anders (panel)** |
| 1.3 | Stripe live-nøkler + webhook-sjekk (13 event-typer) — testmodus komplett 16.08 (#538); følg `stripe-cutover-sjekkliste.md` | **Anders (panel)** |
| 1.4 | Google Calendar re-kobling (tokens PAUSED) | **Anders (panel)** |
| 1.5 | **Ekte spiller-e-poster inn** (dry-run 13.08: 14 «ok» gikk til syntetiske adresser) + aktiverings-e-post til de 13 spillerne uten auth/invitasjon | Anders + agent |
| 1.6 | Push-opt-in: motor + banner finnes, 0 abonnementer — verifiser i prod etter aktivering | Agent |
| 1.7 | **Betalings-cutover 1. september:** `BETALING_STARTER` slår av `gratisForAlle()` automatisk — verifiser uken før at TALENT-gaten + Stripe-flyten oppfører seg riktig for ikke-betalende | Agent (verifisering) |

## STEG 2 — Designporten til 100 % (detaljer: PORTPLAN + PAPER-ZIP-CHECKLIST)

Status 17.08: **40/88 rader signert · 44 bygget-uventer-signering · 4 ubygget (2 blokkert) ·
0/72 varianter kvittert.** Signering er flaskehalsen, ikke bygging.

| # | Oppgave | Blokkert av |
|---|---|---|
| 2.1 | **Sign-off-fabrikken: UBLOKKERT 17.08.2026** og kjørt første runde — 48 skjermer fotografert (app+fasit, m390 lys+mørk, d1280) og samlet i ÉN mobilvennlig signeringsside (`scripts/signoff-side.mjs` → artifact med avkryssing + kopierbar liste). **Gjenstår: Anders krysser av.** Verktøykjeden er nå `signoff-gallery.mjs` (bilder) → `signoff-side.mjs` (side) — kjør begge per bølge. **Tre begrensninger målt i bildene:** (a) de 11 AgencyOS-radene kan ikke signeres før S1 — appen har 6 rail-punkter med gamle navn (Cockpit/Stall), fasiten 4 med nye (Konsoll/Spillere); (b) d1280-kolonnen er ugyldig for 43 av 49 skjermer der `fasitM === fasitD`, fordi fasiten da ofte er tegnet for 430 px — signer desktop kun der en egen `-desktop.html` finnes; (c) testbrukeren mangler data i inneværende uke, så app-siden viser tom tilstand mot fasitens fylte. `SCREENS` dekker dessuten 49 av 88 aktive rader og **0 av 72 variantrader** — køen bør utledes fra `PAPER-ZIP-CHECKLIST.md` + `PP-W*-VARIANTS.md` | Ingen |
| 2.2 | **W4-variantene (38 ruter) kvitteres** — alle 8 maler er signert; ingen ekstern blokkering. NB: rett PP-W4-dokumentets «Ny booking (clay)»-linjer først (A3-brudd) | Ingen |
| 2.3 | **PP-B-resten:** montér `Composer` i `V2Shell` (0 kallsteder i dag — alle desktop-flater skal arve) · fullfør clay-sweepen (44 filer med `enTing`) · B4 chrome-rest-verifisering | Ingen |
| 2.4 | **Fem frie sesjoner:** S3 (#549 åpen) · S9 booking-ny · S17 turneringer · S22 AgenticOS-hub · S23 agent-detalj — 25 ruter uten nye avklaringer | Ingen |
| 2.5 | **PORTPLAN §A1: 10 beslutninger fra Anders** (talent-hub vs redirect, godkjenninger, booking-steg, årsplan-fane, coach-tråd, Stripe Elements, help, utstyr-URL, digest-URL, PP-A-formalitet) — låser opp B2/B3-sesjonene | **Anders** |
| 2.6 | **W5-designbestilling:** 38 marketing/auth/forelder-ruter stryker én-linje-testen fordi DESIGN mangler (bl.a. auth-skallet som blokkerer alle 13 auth-ruter) — bestill fra Claude Design | Anders + designer |
| 2.7 | **De 4 ubygde:** D2 booking→faktura (ublokkert siden 15.08 — kan bygges nå) · D4 test→drill (venter ~20 testers område-backfill: `docs/testomrader-forslag-2026-08-15.md`) · D1 Workbench F4 (venter DB-ja) · wang-logg-inn (venter #490 + OTP-beslutning) | Delvis Anders |
| 2.8 | **W7-stats** (~45 `/stats/*`-ruter): egen bølge, blokkert av PR-F-plasseringen (se steg 4.4) | 2.5/PR-F |
| 2.9 | **Vaktene F1–F8:** kun F4 (bredde-gate) er levert; F2 (clay-gate i CI) hindrer at 2.3-sweepen eroderer | Etter 2.3 |
| 2.10 | **Jarvis-skjermene 5–12** (8 stk., fasit klar) — eget spor, se `plan-agenticos-jarvis-2026-08-17.md` fase J1 | Ingen |

## STEG 3 — Funksjoner og datakobling (punkt 3 i bestillingen)

| # | Oppgave | Kilde |
|---|---|---|
| 3.1 | **TalentHQ leser `testNivaaer`:** syncen (T4) skriver feltet, ingen skjerm leser det. Minste inngrep er målt: feltet ligger allerede i minne på `mitt-niva/page.tsx:59` (findUnique uten select) — legg `testNivaaerSchema.safeParse()` på det og send som prop. **BLOKKERT av PORTPLAN §A1.2** (skal talent-huben bygges eller bli redirect?) — ikke bygg ut flaten før svaret. NB: `milepaeler` fra samme synk VISES allerede (min-plan + roadmap) | Kartlegging 17.08 |
| 3.2 | ~~Talent-gate-asymmetrien~~ **FIKSET 17.08.2026** — `if (!FEATURES.TALENT) notFound()` lagt på huben, samme gate som de fire underskjermene | Kartlegging 17.08 |
| 3.3 | **Testbatteri-ark i Workbench:** `/portal/tren/tester` lovte det i copy (#542 rettet teksten ærlig); selve arket i `WorkbenchV2Sheets` gjenstår (beslutning 04.08, design i `workbench-mobil.html`) | beslutninger.md |
| 3.4 | **SG-appen AP0–AP6:** merge #514 (planen) + #534 (AP0-grunnmuren — én SG-sannhet, ellipse-speilbuggen fikset). Deretter Føring 2.0 → baneguide-MVP → referansestige → analyse → coach-flater | PR #514/#534 |
| 3.5 | **Banedata:** runde-flatene faller tilbake på manuell par/lengde fordi `CourseDefinition` mangler hulldata — fortsett OSM-importen + rette-editor (fase 2 i baneguide-planen) | Kartlegging 17.08 |
| 3.6 | **Pyramidefordeling:** overskrivingsfeilen er **FIKSET 17.08.2026** — `plan-action-executor.ts` setter nå kun `targetAllocation` når feltet er `null` (den dokumenterte «ikke satt»-tilstanden), så et periodebytte aldri overskriver et menneskes valg. Gjenstår fra `docs/plan-egen-pyramidefordeling-2026-08-02.md`: selve UI-et der spilleren setter sin egen. NB funnet underveis: `applyPyramidSuggestion()` (`target-allocation.ts:48`) er død produksjonskode — kun kalt fra tester | Verifisert 17.08 |
| 3.7 | **Live-økt-rest:** offline-kø for drill-reps + DB-persist (i dag sessionStorage) | STATUS-NÅ (eldre) |
| 3.8 | ~~Enhetstest for `protocol.ts`~~ **FIKSET 17.08.2026** — `src/lib/portal-tester/protocol.test.ts`, 18 assertions over normaliseringsreglene som før kun sto i filhodet | Kartlegging 17.08 |

## STEG 4 — DataGolf + turneringsresultater (punkt 4)

**Operativt i dag (målt):** 5 DataGolf-cronjobber (schedule daglig · live hvert 10. min ·
skills/approach/putt ukentlig) + GolfBox timesvis + GJGT daglig + sync-vaktbikkje mandager.
Sammenligningsverktøyene (`/stats/sg-sammenlign` mot PGA, `/stats/sammenlign-spillere`
head-to-head, `/portal/analysere/datagolf` for spilleren) kjører alle mot ekte data.

| # | Oppgave |
|---|---|
| 4.1 | ~~Turnerings-dedupe: retningsfeilen fra 18.07~~ **AVKREFTET 17.08.2026 ved kodemåling.** `dedupeTournaments()` (`scripts/dedupe-tournament-data.ts:151-159`) sorterer på datascore først, og bruker NGF kun som tiebreaker ved likt score — regnet gjennom for alle fire tilfeller, retningen er korrekt. Uttrykket (`? -1 : 0`-diff i stedet for `Number(...)`) leses lett som en bug, men er det ikke. **Ingen fiks nødvendig.** Ekte funn i samme fil i stedet: `dedupePlayers()` (del A) sletter kilderader HARDT (`:106`) mens del B gjør reversibel soft-merge — vit det før noen kjører `--apply` |
| 4.2 | **GJGT gir kun deltakerlister, ikke resultater** — avklar om resultat-scraping skal bygges (live-scoring er JS-drevet; ToS-gråsone står i `turnering-datakilder.md`) |
| 4.3 | **Prod-blokkerte `/stats`-prototyper:** 10 prefikser + `aargang/[aar]` redirectes i prod (`STATS_PROTOTYPE_PREFIXES` i `proxy.ts`) — bygg ferdig eller fjern rutene |
| 4.4 | **PR-F: DataGolf-plassering i PlayerHQ** — 04.08-beslutningen sier skjermene skal inn; kun analyse-fanen er flyttet (T6). Anders velger: egen flate vs. flere faner i Analyse → deretter W7-stats-bølgen |
| 4.5 | **`syncPgaPuttDistance` er ikke DataGolf** (hardkodet Broadie-tabell) og `syncPgaApproach` bruker kalibrerte konstanter + GIR-heuristikk — dokumentér i UI-kildemerking eller erstatt med ekte feed |
| 4.6 | **Historikk-importen** (`import-norske-turneringer.ts`, 2016–2026) krever lokale filer — flytt til Supabase Storage om den skal kunne kjøres igjen |
| 4.7 | Åpne datakilde-hull (bevisst): dame-tourene, college/Clippd, Nordic Golf League — egne beslutninger i `turnering-datakilder.md` |

## STEG 5 — Skjermer for alle funksjoner (punkt 5)

- Dekningen ER tegnet for alt in-scope (79 fasit + 12 Jarvis + maler for 164 ruter) —
  gapet er ikke design-mangel men (a) signering (steg 2.1), (b) W5-design (2.6),
  (c) 25 rader som stryker én-linje-testen og trenger A1-svar (2.5).
- **#542** åpner inngangene til 13 ferdigbygde men usynlige flater (AI-verktøy, talent,
  putteverktøy, gapping, ukesdigest, leaderboard) — merge + skjermbilde-gate.
- Skjermbilde-gaten (CLAUDE.md §Skjermarbeid) gjelder hver eneste skjerm-PR — ingen unntak.

## STEG 6 — TalentHQ / WANG / Team Norway 100 % operativ (punkt 6)

**Testformler — status: fungerer og er testet.** `test-scoring.ts` (15 ScoringKind, server =
fasit) · SG-motoren (Broadie + Team Norway IUP PUTT fra Ref-arket 2025) · `fys-score.ts` v1
(stall-relativ — **FYS-formelen står bevisst som plassholder til Anders låser referanseverdier**,
og UI-et merker det ærlig) · ak-kategori/spiller-kategori. 21 CANON-protokoller synlige for
spiller (T5-avklaringen).

**Scorekortføring — status: komplett i to systemer.** Test-scorekortet
(`scorekort-klient.tsx`, fasit `playerhq-test-gjennomfor.html`, live `TestSession`-scoring)
og runde-scorekortet (live + etterregistrering, hull/slag, SG server-side, fasiter
`playerhq-runde-live/logg.html`). Begge venter kun på pixel-signering (steg 2.1).

| # | Gjenstår |
|---|---|
| 6.1 | TalentHQ: les `testNivaaer` (3.1) + gate-fiks (3.2) + Anders' beslutning hub-vs-redirect (PORTPLAN §A1) |
| 6.2 | WANG: PII-fiksen #490 FØRST (steg 0.1) · deretter B4 (coach-siden: beholde eller inn i AgencyOS?) og B5 (skole-/foreldredata: modelleres eller demo?) — 18 av 22 skjermer i `plan-design-wang-arsplan.md` venter på de to svarene |
| 6.3 | WANG demo-rester: `wang-plan.ts` har fortsatt hardkodet KM-matrise, timeplan, TESTS-datoer — byttes til live-data etter B5 |
| 6.4 | Team Norway: ingen egen flate (bevisst) — baseline i SG-motoren ✅, protokollvariant B ✅, ekstern lesetilgang med samtykke (T8) ✅. Gjenstår kun: rydd død `PuttModell`-komponent i `datavis.tsx` |
| 6.5 | **Fysiske tester:** finnes i PlayerHQ (`/portal/fysisk` + fys-plan) med ærlige hull (ingen spøkelsesverdier). Admin har INGEN egen FYS-flate — kun akser i plan/analyse. Avklar med Anders om egen admin-FYS-skjerm skal bestilles (designbestilling i så fall) |
| 6.6 | FYS-formelen: lås referanseverdier når Anders gir grønt lys (beslutningen «FYS avventer» står) |
| 6.7 | Skoletidsbekreftelse (D6) og ukesrapport (D3) er bygget — inn i signeringsbølgene |

## STEG 7 — PlayerHQ som inngang + gratis-nivået (punkt 7)

**Planen fra 16.08 er IMPLEMENTERT** (A-sporet + T-sporet + gate-fiksene 17.08):
PlayerHQ er innloggingen; gratis/låst profil = **TALENT-nivået** i `resolveTilgang`
(fail-closed i `requirePortalUser`), TalentHQ-registrering via `?kilde=talenthq` (T3),
abonnement 299/mnd eller 2 690/år, FULL automatisk ved kjøp/gruppe.

| # | Gjenstår |
|---|---|
| 7.1 | **Presiseringsspørsmål til Anders (én linje):** 17.08-formuleringen var «gratis KUN tester + DataGolf-sammenligning». Den vedtatte TALENT-listen (BUSINESS-RULES 16.08) åpner OGSÅ stats-/analyse-LESING, SG-/runderegistrering, talent-flatene, booking av enkelttimer og konto. Skal noe av dette strammes inn, eller står 16.08-listen? **Ingen kode endres før svar** — 16.08-listen er fasit inntil da |
| 7.2 | Verifiser gaten i prod (steg 0.4) + at oppgraderingsveien (låst flate → kjøp) konverterer |
| 7.3 | Cutover-testen 1. september (steg 1.7) — TALENT-brukere skal IKKE miste testene/DataGolf når `gratisForAlle` slås av |

## STEG 8 — AgenticOS + Jarvis (punkt 8)

Egen plan: **`docs/plan-agenticos-jarvis-2026-08-17.md`** (fase J1–J3 + beslutningene J-A–J-D).
Kort: 8 Jarvis-skjermer igjen (design klart) · godkjenninger + konsollpanel inn i AgenticOS ·
samle `godkjennSak` · Telegram-kø · registry-løft (13→57 agenter synlige) · Jarvis-masterplanen
inn i repoet · `/meg` inn i IA-en.

## STEG 9 — Øvrige funksjoner (punkt 9)

| # | Område | Gjenstår |
|---|---|---|
| 9.1 | Masterbrain | Drill-seed er tømt — Masterbrain rebuild + Putting brain (eget spor, `masterbrain-rebuild/06-MIGRATION-PLAN.md`) |
| 9.2 | Onboarding | Nivåplasserings-quiz (bølge 6-rest) — profil-wizard finnes, quiz mangler |
| 9.3 | Booking offentlig | PP-1.7 var låst til Acuity-avviklingen — `akgolf.no` viser nå plattformen (#431); verifiser hele offentlig booking-flyt ende-til-ende før lansering |
| 9.4 | AI Coach (bølge 7) | Bevisst utsatt til loopen produserer gjennomføringsdata |
| 9.5 | e2e | 427 spiller-tester hoppes over i CI (mangler `E2E_TEST_USER_*`/`E2E_COACH_*`-secrets) — sett dem etter passord-rotasjonen (0.2) |
| 9.6 | Tripletex | Integrasjon fortsatt ikke bygget (`.claude/rules/admin-tripletex.md` — REST-API med les-tilgang er planen; agentene forbereder manuelt i dag) |
| 9.7 | CSP-chunk-støyen i prod | Kjent, bevisst åpen (03.08-målingen) — ta ved anledning, ikke som lanseringsblokker |

---

## Samlet beslutningskø til Anders (alt på ett sted)

1. **#490-merge (PII — haster)** + team-wang-tilgangen varig åpen eller sperret igjen.
2. Rotér `SCREENTEST_PASSWORD` (låser opp all signering).
3. PORTPLAN §A1 — de 10 portbeslutningene (én økt).
4. PR-F: DataGolf/stats-plassering i PlayerHQ.
5. WANG B4 + B5.
6. Freemium-presiseringen (7.1 — én linje).
7. Jarvis J-A–J-D (`plan-agenticos-jarvis-2026-08-17.md`).
8. FYS-referanseverdier (når klar — ingen hast, plassholder er ærlig).
9. D4-backfill: områdekoder for resten av testdefinisjonene.
10. KommandoTask vs. Notion-cache.
11. #514-planen (SG-app) — ja/nei/endringer, så #534 kan merges.
