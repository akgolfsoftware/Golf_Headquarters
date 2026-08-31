# MASTERPLAN — alt som gjenstår (17.08.2026, konsolidert 30.08.2026, status-avkryssing 31.08.2026)

> **Konsolidert 30.08.2026:** dette dokumentet er nå DEN gjeldende, eneste plandokumentet i
> repoet. Alt reelt gjenstående arbeid fra 26 aktive plandokumenter (inkludert
> `LANSERINGSPLAN-KOMPLETT-2026-08-27.md` og `natt/LAUNCH-PLAN-FULL-2026-08-25.md`,
> som tidligere var oppgitt som overstyrende) er flettet inn i STEG-tabellene under — se
> særlig STEG 10–14. De opprinnelige dokumentene er slettet (git-historikken bevarer dem i
> full detalj); denne fila er nå eneste sted å lete etter gjenstående arbeid. Design:
> Train-lock er fasit for ALLE produktskjermer (Anders 25.08) — alle Paper-port-rader under
> er historikk/supersedert.

**Rolle:** den ENE samlede gjenstående-planen på tvers av alle spor. Skrevet under
plan-oppryddingen 17.08 (78 utgåtte dokumenter slettet, status målt mot `main` @ `1f3e127`
og fem parallelle kodekartlegginger — ikke antatt), utvidet 30.08 med gjenstående arbeid fra
26 flere plandokumenter (se STEG 10–14).

**Underplaner denne peker på (ikke dupliserer):**
`docs/arkiv/paper-port/PORTPLAN.md` (supersedert 25.08 — arkivreferanse) ·
`docs/baneguide-produktdokument-2026-08-02.md` (produktspec for SG-appen/baneguide — referanse,
se STEG 13) · `docs/jarvis-shortcut.md` (driftshåndbok for Jarvis-snarveien) ·
`docs/platform/stripe-cutover-sjekkliste.md` (betaling) ·
`docs/beslutningsgrunnlag/` (måletall og fullt underlag bak beslutningene i `.claude/rules/beslutninger.md`).

---

## STEG 0 — Akutt (denne uka, før alt annet)

| # | Oppgave | Detalj |
|---|---|---|
| 0.12 | ~~Skjermbilde-gaten for AgencyOS blokkert~~ **LØST 30.08.2026 (Anders: «opprett testbruker»).** `scripts/seed-screentest-coach.ts` kjørt mot prod — `coachtest@akgolf.test` finnes igjen (ADMIN-rolle) med 38 demo-spillere, 4 grupper, 16 bookinger, 4 forespørsler og 3 godkjenninger. Idempotent; alle demo-rader gjenkjennes på `*@stall.akgolf.test` og `demo-stall-*` og kan fjernes igjen. Passordet er `SCREENTEST_PASSWORD` i `.env.local` — uendret, aldri lest av agenten. Gaten er kjørt for 15.1 | Løst |


| # | Oppgave | Eier | Status/kilde |
|---|---|---|---|
| 0.1 | ~~Merge PR #490 — WANG PII-fiks~~ **GJORT — #490 er MERGET (verifisert 31.08.2026).** Fellessiden er navnefri, coach sperret igjen, #406 lukket. Rest: team-wang-tilgangen varig åpen eller sperret igjen (beslutningskø 13) | — | Merget |
| 0.2 | ~~Rotér `SCREENTEST_PASSWORD`~~ **GJORT av Anders 17.08.2026.** Verifisert samme dag: `signoff-gallery.mjs` logger inn og fotograferer igjen (96 av 98 bilder OK). **Rest:** `screentest-parent@akgolf.test` sto ikke i rotasjonsskriptet, så foreldreportalen (`B2-forelder`) feiler fortsatt på innlogging. Skriptet er rettet — kjør det én gang til for å få forelder-brukeren med | **Anders** | `scripts/roter-screentest-passord.ts` |
| 0.3 | **Behandle PR-køen.** ~~#549 · #547 · #542 · #534 + #514~~ — alle fem MERGET (verifisert 31.08.2026). **Gjeldende åpne kø per 31.08:** #704 (Plan, STEG 15.9) · #700 (SG-stigen som beslutning, rører denne fila) · #662 (agenticos-fikser) · #657 (PX-4, konflikt) · #656 (PX-3, konflikt) | Anders + agent | Åpne PR-er |
| 0.4 | **Talent-gate-verifisering i prod:** gaten var inert til 17.08 (#537/#541) — kjør kontrakttestene mot prod og bekreft at TALENT-profil faktisk stoppes utenfor allowlisten | Agent | `tests/` fra #539 |
| 0.5 | ~~`npm run verify` er rødt — avhengighetsmismatch~~ **UTDATERT, målt 30.08.2026.** `eslint-config-next` og `next` står begge på 16.3.1; lint på `ForelderSamtykkeV2.tsx` er grønn og full `npm run verify` gir exit 0 med null advarsler. Blokkeringen finnes ikke lenger | — | Verifisert 30.08.2026 |
| 0.6 | ~~Fullfør PR + merge for doc-konsolideringen~~ **GJORT — men via en annen vei enn planlagt (verifisert 30.08.2026).** PR #671 ble LUKKET uten merge og grenen `claude/grilling-runde6-2026-08-30` er borte; innholdet kom likevel inn i main gjennom #673, og `e6635bcf2` ryddet 26 døde doc-lenker etterpå. Ingenting gjenstår | — | Verifisert 30.08.2026 |
| 0.7 | ~~**Barnevern: 1 655 mindreårige lå åpent** på stats-sidene med navn og fødselsår~~ **GJORT 30.08.2026, PR #675.** Felles predikat `src/lib/stats/offentlig-spiller.ts` på fem innganger (`/stats/spillere`, `[slug]` inkl. `generateMetadata`, `/stats/sok`, `/api/stats/search`, `/stats/wrapped`). Aldersgulv 19 år (kun år i basen, ikke dato), DataGolf-proffer unntatt per svar 3, nedre grense 1900 mot søppeldata. Målt: 6 976 synlige mot 8 602 før. **#675 er MERGET (verifisert 31.08.2026)** | — | Merget |
| 0.8 | ~~**TruthLayer: `/stats/wrapped` diktet opp fødselsår**~~ **GJORT 30.08.2026, PR #675.** `birthYear ?? 1990` ga 3 598 spillere feil fødselsår. Årskull-boksen utelates nå når året mangler. **Merget** | — | Merget |
| 0.9 | ~~**DataGolf-attribusjon manglet på alle offentlige sider**~~ **GJORT 30.08.2026, PR #675.** «Powered by Data Golf» lagt i `StatsRamme` (dekker alle ~45 rutene, ny rute kan ikke glemme den) + spillerens DataGolf-kort. **Merget** | — | Merget |
| 0.10 | ~~**CSS-kommentar brøt appen**~~ **GJORT 30.08.2026, PR #675.** `--tl-*/TL` på linje 44 i `train-lock-tokens.css` avsluttet kommentaren for tidlig (83 starter mot 84 avslutninger). Dev-serveren svarte 500 på hver side; prodbygget slapp det gjennom som kun en advarsel selv om lys-blokken står rett etter bruddet. Innført i #667 | — | PR #675 |
| 0.11 | ~~**`/stats/aargang` bak innlogging**~~ **GJORT 30.08.2026, PR #679.** Sperret i `src/proxy.ts` (`erAargangHub`) — siden er verken slettet eller tømt, den ligger nå på gratis-konto-laget per datakartleggingens svar 1. `offentligSpillerFilter()` hjalp ikke her: siden aggregerer antall per fødselsår, så kohort-strukturen ER det som skjules. Verifisert i koden 30.08 | — | PR #679 |
| 0.12 | **`/stats/wrapped`: resten av de fabrikkerte tallene.** Utover fødselsåret (0.8) viser siden hardkodet nasjonal ranking (47 av 1 547), aldersgrupperanking (12 av 142), «spillingen din ligner Kris Ventura», putte-tall (28) og streak (5) som om de var målt. Samme TruthLayer-brudd som 0.8, men bredere — enten hentes ekte tall, eller slidene fjernes | Agent | Funnet 30.08 under 0.8 |

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
| 2.1 | **Sign-off-fabrikken: UBLOKKERT 17.08.2026** og kjørt første runde — 48 skjermer fotografert (app+fasit, m390 lys+mørk, d1280) og samlet i ÉN mobilvennlig signeringsside (`scripts/signoff-side.mjs` → artifact med avkryssing + kopierbar liste). **Gjenstår: Anders krysser av.** Verktøykjeden er nå `signoff-gallery.mjs` (bilder) → `signoff-side.mjs` (side) — kjør begge per bølge. **RETTET 18.08.2026 — rail-retningen sto feil her.** Første formulering påsto at appen hadde «gamle navn (Cockpit/Stall)» og fasiten «nye (Konsoll/Spillere)». Det er motsatt: A1-beslutningen (16.08) gjorde **fase2-railen gjeldende** — Cockpit · Innboks · Kalender · Stall · Plan · Innsikt · Oppsett — og den er implementert i `shell.tsx:100-108` (PR #500). Det er **fase1-fasitene** som er utgått. **Appen er riktig; fasiten er gammel.** **Åtte målte årsaker til at første galleri-runde så ubrukelig ut (18.08) — fire var feil i verktøyet, ikke i skjermene:** (1) appen ble tatt som fullside (opptil 2385 px) mot fasitens ene skjermflate (730 px); (2) fasiten fikk aldri satt `data-theme`, så den sto i lys også i mørk-runden; (3) mørk-bildet hadde **ingen fasit i det hele tatt** — kun appen, presentert som sammenligning; (4) demo-tilstandsvelgeren («Suksess/Tom/Laster/Feil») sto midt i fasitbildet. **Alle fire rettet i `signoff-gallery.mjs`.** Gjenstår: (5) 11 AgencyOS-rader måles mot fase1-fasiter hvis rail er vedtatt bort, og **det finnes ingen fase2-motstykker** for konsoll/innboks/spillere/kalender/ak-stigen/live-session — designbestilling, ikke kodejobb; (6) `B4-live` peker på feil flate (checklisten sier selv at `/admin/agencyos/live` er Mission Control, ikke live-session); (7) testbrukeren mangler data denne uka, så appen viser tom tilstand mot fasitens fylte — `scripts/seed-screentest-komplett.ts` løser det, men skriver mot prod; (8) fase2-admin-fasitene har ingen mobilvisning, så m390 måles mot en klemt desktopfasit. `SCREENS` dekker dessuten 49 av 88 aktive rader og **0 av 72 variantrader** — køen bør utledes fra `PAPER-ZIP-CHECKLIST.md` + `PP-W*-VARIANTS.md` | Ingen |
| 2.2 | **W4-variantene (38 ruter) kvitteres** — alle 8 maler er signert; ingen ekstern blokkering. NB: rett PP-W4-dokumentets «Ny booking (clay)»-linjer først (A3-brudd) | Ingen |
| 2.3 | **PP-B-resten:** montér `Composer` i `V2Shell` (0 kallsteder i dag — alle desktop-flater skal arve) · fullfør clay-sweepen (44 filer med `enTing`) · B4 chrome-rest-verifisering | Ingen |
| 2.4 | **Frie sesjoner:** ~~S3~~ (#549 MERGET 31.08) · S9 booking-ny · S17 turneringer (delvis dekket av 15.6-konsolideringen — verifiser rest) · S22 AgenticOS-hub · S23 agent-detalj | Ingen |
| 2.5 | **PORTPLAN §A1: 10 beslutninger fra Anders** (talent-hub vs redirect, godkjenninger, booking-steg, årsplan-fane, coach-tråd, Stripe Elements, help, utstyr-URL, digest-URL, PP-A-formalitet) — låser opp B2/B3-sesjonene | **Anders** |
| 2.6 | **W5-designbestilling: DELVIS UBLOKKERT 30.08.2026.** 38 marketing/auth/forelder-ruter stryker én-linje-testen fordi DESIGN mangler (bl.a. auth-skallet som blokkerer alle 13 auth-ruter). Etter beslutningen «TEGN SKJERMEN FØR DU BYGGER DEN» (30.08) tegnes disse i økten som Claude Design-canvas etter oppskriften i 2.11 — ingen ekstern designer trengs. Anders godkjenner tegningen, ikke bestiller den. Gjenstår hans ja per skjerm | Anders (godkjenning per canvas) |
| 2.7 | **De 4 ubygde:** D2 booking→faktura (ublokkert siden 15.08 — kan bygges nå) · D4 test→drill (venter ~20 testers område-backfill — forslaget lå i `testomrader-forslag-2026-08-15.md`, slettet 30.08, se git-historikk for detaljene) · D1 Workbench F4 (venter DB-ja) · wang-logg-inn (venter #490 + OTP-beslutning) | Delvis Anders |
| 2.8 | **W7-stats** (~45 `/stats/*`-ruter): egen bølge, blokkert av PR-F-plasseringen (se steg 4.4) | 2.5/PR-F |
| 2.9 | **Vaktene F1–F8:** kun F4 (bredde-gate) er levert; F2 (clay-gate i CI) hindrer at 2.3-sweepen eroderer | Etter 2.3 |
| 2.10 | **Jarvis-skjermene 5–12** (8 stk., fasit klar) — eget spor, se STEG 12 (fase J1) | Ingen |
| 2.11 | **Canvas-først som fast arbeidsmåte** (`.claude/rules/beslutninger.md` §TEGN SKJERMEN FØR DU BYGGER DEN, Anders 30.08.2026). Hver skjermrad i denne planen får et tegne-steg FØR kode: canvas med Mac 1440 + mobil 390, lys + mørk, tom tilstand, ekte norsk tekst, verdier lest fra `src/styles/train-lock-tokens.css`. Arbeidsfilene bor i `designsystem/canvas/<skjerm>/`, oppskrift i `designsystem/canvas/README.md`. **Ferdig når** hver skjermrad som starter, har en godkjent canvas-URL notert. Første canvas levert: Kø (15.1). Skjermbilde-gaten (04.08) gjelder uendret ETTER bygging | Ingen |

## STEG 3 — Funksjoner og datakobling (punkt 3 i bestillingen)

| # | Oppgave | Kilde |
|---|---|---|
| 3.1 | **TalentHQ leser `testNivaaer`:** syncen (T4) skriver feltet, ingen skjerm leser det. Minste inngrep er målt: feltet ligger allerede i minne på `mitt-niva/page.tsx:59` (findUnique uten select) — legg `testNivaaerSchema.safeParse()` på det og send som prop. **BLOKKERT av PORTPLAN §A1.2** (skal talent-huben bygges eller bli redirect?) — ikke bygg ut flaten før svaret. NB: `milepaeler` fra samme synk VISES allerede (min-plan + roadmap) | Kartlegging 17.08 |
| 3.2 | ~~Talent-gate-asymmetrien~~ **FIKSET 17.08.2026** — `if (!FEATURES.TALENT) notFound()` lagt på huben, samme gate som de fire underskjermene | Kartlegging 17.08 |
| 3.3 | **Testbatteri-ark i Workbench:** `/portal/tren/tester` lovte det i copy (#542 rettet teksten ærlig); selve arket i `WorkbenchV2Sheets` gjenstår (beslutning 04.08, design i `workbench-mobil.html`) | beslutninger.md |
| 3.4 | **SG-appen AP0–AP6:** ~~merge #514 + #534~~ **BEGGE MERGET (verifisert 31.08.2026)** — AP0-grunnmuren er inne. Gjenstår AP1–AP6: Føring 2.0 → baneguide-MVP → referansestige → analyse → coach-flater. Full arbeidspakke-tabell + beslutningskø + baneguide-kjøreplanen: **STEG 13**. NB: #700 (åpen PR) registrerer SG-stigen som beslutning | PR #700 åpen |
| 3.5 | **Banedata:** runde-flatene faller tilbake på manuell par/lengde fordi `CourseDefinition` mangler hulldata — fortsett OSM-importen + rette-editor (fase 2 i baneguide-planen) | Kartlegging 17.08 |
| 3.6 | **Pyramidefordeling:** overskrivingsfeilen er **FIKSET 17.08.2026** — `plan-action-executor.ts` setter nå kun `targetAllocation` når feltet er `null` (den dokumenterte «ikke satt»-tilstanden), så et periodebytte aldri overskriver et menneskes valg. Gjenstår: selve UI-et der spilleren setter sin egen — full 10-stegs plan i **STEG 14.1**. NB funnet underveis: `applyPyramidSuggestion()` (`target-allocation.ts:48`) er død produksjonskode — kun kalt fra tester | Verifisert 17.08 |
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
- **#542** (innganger til 13 skjulte flater) er MERGET (verifisert 31.08.2026) — gjenstår kun
  skjermbilde-gate på de berørte flatene.
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
| 6.2 | WANG: ~~PII-fiksen #490~~ MERGET (steg 0.1, 31.08) · deretter B4 (coach-siden: beholde eller inn i AgencyOS?) og B5 (skole-/foreldredata: modelleres eller demo?) — 18 av 22 skjermer i `plan-design-wang-arsplan.md` venter på de to svarene |
| 6.3 | WANG demo-rester: `wang-plan.ts` har fortsatt hardkodet KM-matrise, timeplan, TESTS-datoer — byttes til live-data etter B5 |
| 6.4 | Team Norway: ingen egen flate (bevisst) — baseline i SG-motoren ✅, protokollvariant B ✅, ekstern lesetilgang med samtykke (T8) ✅. Gjenstår kun: rydd død `PuttModell`-komponent i `datavis.tsx` |
| 6.8 | **TN-betalt spillerabonnement (Anders 30.08.2026, i økt).** Spillerlisens-beslutningen (`beslutninger.md`) sier TN/WANG betaler for spillerens abonnement — teknisk grunnlag mangler i dag (`Subscription.userId` er alltid brukeren selv, ingen sponsor-felt, ingen org-Stripe-kunde). Kartlagt i `docs/kartlegging-teamnorway-wang-playerhq.md` §5–6. Forslag skissert i samtalen 30.08: TN får egen Stripe-kunde med setbasert abonnement (antall = aktive `GroupMember`, synket ved inn/ut av gruppen), og spillerens `Subscription`/tilgang merkes «betalt av gruppe» i stedet for «betalt selv». **Krever eksplisitt regel mot dobbeltbetaling**: overtar TN regningen, må spillerens ev. private abonnement stoppes automatisk, ikke bare vises ved siden av. Ikke bygg før design er skrevet ut i detalj (felt/tabeller/Stripe-flyt) og godkjent |
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

De 12 Jarvis-skjermene, godkjenninger/konsollpanel-konsolideringen, `godkjennSak`-samlingen,
Telegram-kø-visningen og registry-løftet (13→57 agenter synlige) er **LEVERT** (PR-kjeden
#532/#546/#547, verifisert 17.08 og igjen i T12-porten). Kun **J-D (KommandoTask vs.
Notion-cache)** står fortsatt åpen — se beslutningskø nederst. Kjerne-Jarvis' gjenstående
steg (kø-rytme, anrop+kalendervakt, personlig cockpit, stemme) og hele Familie-OS-sporet
(helt nytt, ikke startet): **STEG 12**.

## STEG 9 — Øvrige funksjoner (punkt 9)

| # | Område | Gjenstår |
|---|---|---|
| 9.1 | Masterbrain | Drill-seed er tømt — Masterbrain rebuild + Putting brain (eget spor, `masterbrain-rebuild/06-MIGRATION-PLAN.md`) |
| 9.2 | Onboarding | Nivåplasserings-quiz (bølge 6-rest) — profil-wizard finnes, quiz mangler |
| 9.3 | Booking offentlig | PP-1.7 var låst til Acuity-avviklingen — `akgolf.no` viser nå plattformen (#431); verifiser hele offentlig booking-flyt ende-til-ende før lansering |
| 9.4 | AI Coach (bølge 7) | Bevisst utsatt til loopen produserer gjennomføringsdata |
| 9.5 | e2e | 427 spiller-tester hoppes over i CI (mangler `E2E_TEST_USER_*`/`E2E_COACH_*`-secrets) — sett dem etter passord-rotasjonen (0.2) |
| 9.6 | Tripletex | Integrasjon fortsatt ikke bygget (`.claude/rules/admin-tripletex.md` — REST-API med les-tilgang er planen; agentene forbereder manuelt i dag) |
| 9.8 | Foreldre booker for barnet | **Full booking-opprettelse fra forelderportalen** (ikke bare forespørsel) — grillingen 11.2, bygges **etter 1. september**. Forelderen er ofte den som faktisk administrerer juniorens timer, og booking av enkelttimer ligger i gratisnivået. I dag er `src/app/forelder/bookinger/` kun en lesevisning (verifisert 30.08: ingen opprettelses-flyt). Gjenbruk booking-flyten fra `/portal/booking` med forelder-scope (`src/lib/auth/booking-scope.ts`). Kilde: `.claude/rules/beslutninger.md` §GRILLINGEN RUNDE 2 |
| 9.7 | CSP-chunk-støyen i prod | Kjent, bevisst åpen (03.08-målingen) — ta ved anledning, ikke som lanseringsblokker |

## STEG 10 — Lanseringsplan-rest 27.–30.08 (Player-porten, lys-pass, piksel-nærhet, cutover)

Flettet inn fra `LANSERINGSPLAN-KOMPLETT-2026-08-27.md` og `natt/PIKSELPLAN-2026-08-28.md`
(begge slettet 30.08 — innholdet under er alt som var reelt gjenstående på slettetidspunktet).

| # | Oppgave | Detalj |
|---|---|---|
| 10.1 | **P-bølgen (Player-porten), fire sesjoner:** P1 Meg-familien (~19 underruter: innstillinger, abonnement+faktura, bookinger, profil, utstyr, 2fa, varsler) · P2 Analyse-familien (mal/runder+trackman, analysere+historikk, gameplan, drills) · P3 Tren+planlegge+resten (tester/turneringer/fys-plan/teknisk-plan, planlegge/workbench, booking, venner, kalender, varsler, coach, utenfor-banen, ai/foreslå-drill) · P4 Live-løypa+gjennomføring (live-rutene, gjennomfore/[id], offline-siden). Alle fire: tokens portet (#631), men fasit-1:1-port + skjermbilde-gate gjenstår |
| 10.2 | **AD-1 Admin-rest:** spillere/[id]-detaljrest (fremgang/analyse/tester/turnering-kobling), `runder`, `teknisk-plan`, `queue`, `brief`, `innboks-epost` (PII-vurdering i økten), `bookinger/[id]` (hvis ikke tatt i T7), `analysere/compliance`, `tester/foreslatte` |
| 10.3 | **F1 Forelder-helporten:** alle 9 seksjoner + `barn/[childId]` til Train-lock med lys+mørk (T4-beslutning 26.08). Mandagstelling-bugen (`hentForelderUkerapport`) er fikset — fasit-1:1-porten gjenstår |
| 10.4 | **C8 Lys-pass:** 8 nøkkelskjermer (I dag, Plan-uke, TM-detalj, Workbench-uke, Kalender-uke, Live runde, Gate, Login) + mekanisk avledet lys der tegnet fasit mangler. KUN `data-v2-tema`. Rydd død `PuttModell`-komponent samtidig. Kjøres SIST, aldri parallelt — rører manges filer |
| 10.5 | **C10 DataGolf+økonomi:** kode LEVERT — skjermbilde-gate gjenstår |
| 10.6 | **T12 visuell-rest (AgenticOS/Jarvis):** IA levert (#630), AO-00/01-piksel likeså (#628). Gjenstår: AO-12a–e start-/pause-/avvist-dialoger (krever start-status i data) · AO-06/07 project-ark og task-ark (krever project/task-modell utover Notion-cache — se J-D) · piksel-diff mot `.dc.html` + skjermbilde-gate · fjern død `AdminAgenticosHubV2` (Paper-hub, ubrukt) |
| 10.7 | **W5-auth:** 15 auth-ruter er funksjonelle men mangler tegnet fasit (låst lys). Krever designbestilling fra Anders — ikke smoke-blokker, kan gå etter lansering |
| 10.8 | **V1 Betalings-cutover-verifisering:** test-clock-løypen (8 steg, `docs/platform/stripe-cutover-sjekkliste.md`), talent-gate i prod (kontrakttestene fra #539 — aldri kjørt mot prod), A1-indeks-scriptet (`--dropp-gammel-indeks` — udokumentert om kjørt), push-opt-in i prod |
| 10.9 | **V2 Full smoke + release:** Del 3-kriteriene + samlet ende-til-ende-smoke klikket av MENNESKE (inkl. TM-steget + godta/avvis), offentlig booking ende-til-ende, e2e-secrets i CI (427 spillertester hoppes over i dag — se 9.5), vedlikeholdsmodus-av-plan for `akgolf.no` |
| 10.10 | **PIKSELPLAN — piksel-nærhet til Train-lock for ALLE skjermer** (opprettet 28.08, målt 30.08: **114/204 fasitfiler sitert, 90 igjen**). Gjenstår: **PX-3** (TM+TE, PR #656, konflikt, ikke løst) · **PX-4** (Player-workbench/runde/gate, PR #657, konflikt, ikke løst) · **PX-6** (AgencyOS-resten, PR #668 — MERGET 31.08; sitering inne, skjermbilder fortsatt ikke tatt) · **PX-7** (tilstander/brekk, delvis levert — **B2** iPad/Mac topp-tab-brekk for PH-01/04/05/10/17 (5 filer) IKKE bygget: fasiten krever en annen navigasjonsform enn dagens `V2Shell`-ikonrail, bør planlegges som egen IA-økt, ikke en tilstand/brekk-bølge · **B4** lys-på-B2 er avledet gap av samme · **GAP-1**s tom-tilstander (Tom uke / Ingen aktiv runde / Velg en spiller / Ingen ledige luker) IKKE bygget (krever ekte tom-datasjekk per flate) · **GAP-2**s Runtimes-nede/Integrasjoner-reauth IKKE bygget (krever ny helse-/utløpsmodell) · **MAT-01** FYS-hero-bilde finnes ikke i koden, anti-scope · **TM-03/12/13/14** ikke åpnet). Metode (les `.dc.html` aldri hukommelse, siter fasiten i toppkommentar, `node scripts/maal-fasit-dekning.mjs` for fremdriftstall) og full session-prompt-mal ligger i git-historikken. **Lærdom 30.08 (ikke gjenta):** to par av PX-6/PX-7 ble kjørt av to økter samtidig på hver sin gren og måtte manuelt slås sammen (#667, #668) — én PX-bølge er én økt; sjekk `gh pr list` før du starter en ny |

## STEG 11 — TalentHQ-innflytting i AK Golf HQ (Bølge N)

Flettet inn fra `natt/BOLGE-N-TALENTHQ-INN-2026-08-26.md` (slettet 30.08). Grunnlag:
Anders' beslutning 26.08 (sju punkter, se `beslutninger.md`). **N1/N2/N3/N5 er LEVERT**
(pipelines flyttet til eget repo `akgolfsoftware/ak-golf-pipelines`, data-bro `src/lib/dashboard-data/`,
PEI-motor `src/lib/domain/pei/`, Team Norway som kanonisk gruppe — alle i PR #605).

**Gjennomføringsrekkefølge (steg 2–10 av 10):**

| # | Rad | Hva gjenstår | Avhenger av |
|---|---|---|---|
| 2 | N4 | `test_shots` + attestering. **RETTET 30.08.2026 — den gamle teksten stemte ikke.** Koden ER i main (`src/lib/domain/test-shot.ts`, `src/lib/actions/test-shot-actions.ts`, `scripts/n4-add-testshot-table.ts`, schema-endringen), og testene finnes (`src/lib/domain/test-shot.test.ts`). Grenen inneholdt ingenting main manglet. **Eneste reelle gjenstående: DDL-en er ikke kjørt mot prod** — `information_schema` har null tabeller som matcher `test_shot` (målt 30.08). Kjør `scripts/n4-add-testshot-table.ts` mot `DIRECT_URL` per gotcha-mønsteret for additive endringer. **Krever Anders' ja** (DB-endring) | N3 |
| 3 | N6 | Kvitter Nordic League-pipelinen — den FINNES ALLEREDE i `ak-golf-pipelines` (`nordic-league-sync.yml`, cron 04:00 UTC) — ikke bygg på nytt, bare verifiser siste kjøring + rader | N1 |
| 4 | N7 | Fasit: organisasjonsflaten. **RETTET 30.08.2026 — Team Norway tegnes IKKE i Train-lock.** TN-skjermene følger Claw-brandingen (`designsystem/team-norway/`, Claude Design `a03bf94a`): navy `#012B5D` + rød `#D70232`, Schibsted Grotesk + IBM Plex Mono, lys flate, mørk kun som rolle. Se `.claude/rules/beslutninger.md` §TEAM NORWAY-SKJERMENE DESIGNES I CLAW-BRANDINGEN. **WANG-flatens stil er uavklart** — se beslutningskøen punkt 22. Dekningsgrad-kortet («4 av 11 med profil») obligatorisk på TN | N-D1, N-D2 |
| 4 | N7b | **Tegn om `templates/tn-workdesk/TnBatch1.dc.html`** — TN-01 Hjem, TN-02 Gruppe/spillerliste og TN-03 Spiller-ark er tegnet i Train-lock mørk (`#000000`, Poppins, rail 232px, verifisert 30.08) og må gjøres om i Claw-stil. Bestillingen ligger klar i `designsystem/team-norway/prompt-batch-2.md` | N7 |
| 4 | N8 | Fasit: trenerens føringsskjerm — det ekte skjermgapet: én trener fører mange spillere gjennom samme protokoll på testdag. Tre arketyper (port/tall/stige) + PEI-varianten | N7 |
| 5 | N9 | Bygg organisasjonsskall + Oversikt per N7. Utvid `/innsyn` (eller ny rute per N-D1) | N7, N5 |
| 6 | N10 | Bygg testdag og føring per N8. PEI fra N3, skriver til `test_shots` fra N4, attestering | N8, N4 |
| 7 | N11 | Uttak (TN) + kartlegging (WANG) — `selection_criteria`/`selection_scores`/`wang_recruit_flags` tas i bruk, karaktermatrise. **Uttak er alltid underlag — appen konkluderer aldri** (jf. `.claude/rules/wang-toppidrett.md`) | N9 |
| 8 | N12 | Analyse + DataGolf inn i PlayerHQ: AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt, DataGolfProfil, TruthLayer på ekte `dg_*` via N2. Tre motorer aldri blandet. **DataGolf-attribusjon** («Data powered by DataGolf», lisenskrav) lagt inn — lukker D5 | N2, N1 |
| 9 | N13 | Talent-skjermene ferdig + `/innsyn` Train-lock. `/portal/talent/mitt-niva` leser allerede `testNivaaer` (delvis levert). Gjenstår: L-fase-navn ut av `roadmap`, `/innsyn` ferdig portet, admin-talent parkert eller inn i org-flaten | N2 |
| 10 | N14 | **Arkiver `akgolfsoftware/talenthq`** — kun etter at N1 har kjørt grønt mot prod i minst én uke OG N9–N13 er inne. Fjern Vercel-prosjektet, skriv høstingslogg | N1, N9–N13 |

**Låste beslutninger (Anders):** N-D1 egen organisasjonsflate for WANG/TN, aldri under AgencyOS
(«Det skal være egne skjermer. Ikke under AK Golf agency.») · N-D2 TN-rød kun på logo
og skinne, aldri som statusfarge (kolliderer med `--tl-danger`). **Verdien er RETTET 30.08.2026 fra
`#D50431` til `#D70232`** (målt fra logofilen) — se `beslutninger.md` §TN-RØDT LÅST TIL `#D70232` · N-D3 PEI = `resultat ÷ lengde`,
lavere er bedre (samme som eksisterende `test-scoring.ts`) · N-D4 Python-pipelines i eget repo
`akgolfsoftware/ak-golf-pipelines`, aldri skrevet om til TypeScript · N-D5 ~23 av 70 gamle
talenthq-skjermer skal med (Team Norway ×7, Testføring ×6, Analyse ×4, DataGolf ×3, WANG ×3 —
full liste i git-historikken); resten er dekket bedre i akgolf-hq allerede.

**Det som ikke skal skje:** ikke arkiver talenthq før N1 har kjørt grønt ≥1 uke og N9–N13 er
inne (stopper DataGolf-tilførselen til prod) · ikke bygg videre i `ak-golf-talenthq` · ikke skriv
Python-pipelines om til TypeScript · ikke skru på Prisma `multiSchema` · ikke høst GolfBox/Olyo/
Østlandstour/college/SG-baselines (dekket bedre i akgolf-hq allerede).

## STEG 12 — Jarvis / Familie-OS (gjenstående)

Flettet inn fra `jarvis-masterplan.md` (slettet 30.08). Kjerne-Jarvis steg 1–4 (sak-kø,
innsamlere, triage-agent, godkjenning fra Meg-boten) er i drift.

**DEL A — kjerne-Jarvis, steg 5–8 gjenstår:**

| # | Steg | Innhold |
|---|---|---|
| 5 | Anrop + kalender-vakt | Ubesvarte anrop (fra Mini) blir saker i køen; kalender-agent (freebusy finnes) flagger konflikt, manglende reisetid, avtale uten varsel |
| 6 | Rytmen på køen | Morgenbrief åpner med kø-status, innboksblokkene (11:30/16:00) blir kø-gjennomgang, kveldsjournal melder restanse |
| 7 | Personlig cockpit | `/meg`-flaten med «Én ting nå» (Paper-fasit, `AiDispatchPanelV2`-mønster). Skjermbilde-gate 390px+1280px, lys/mørk |
| 8 | Stemme | Morgenbrief og kø-status som lyd (TTS). Sist, valgfritt |

**DEL B — Familie-OS, 5 steg, HELT NYTT (ikke startet).** Prinsipp: barnas data forlater
ALDRI Mac Mini — familie-boten kjører lokalt (LaunchAgent, ikke Vercel-webhook) med
`hermes3:8b` (installert, ubrukt i dag) som hjerne. Claude brukes kun ved voksen-sak, anonymisert.

| # | Steg | Innhold |
|---|---|---|
| F1 | Familie-boten | Egen Telegram-bot, EGET token (barna skal aldri ha tilgang til Meg/de 26 verktøyene). Roller `familie-voksen`/`familie-barn`. I gruppechat MÅ identitet leses fra avsenderens `from.id`, ikke `chat.id` |
| F2 | Familiekalenderen | Delt Google-kalender «Familie» + hvert medlems egen via `GoogleCalendarSubscription` (visIKalender-flagget). «Når er pappa ferdig?» svares KUN med ledig/opptatt fra Anders' jobbkalendere — aldri detaljer om kunder/spillere |
| F3 | Hendelser fra melding | «Fotballkamp lørdag 12:00» → forslag om kalenderoppføring, BEKREFT-flyt (barn-forslag bekreftes av voksen). Aldri auto-innlegging |
| F4 | Familielogistikk-vakten | Kveldsmelding kl. 20:00: morgendagens logistikk, kollisjoner mellom foreldrenes kalendere |
| F5 | Familieminne | Egen `subject`-isolert loggtabell (IKKE golf-DB, IKKE Meg-tabellene, IKKE ak-brain/ak-second-brain — familiens minne bor hos familien) |

Regler (ufravikelige): AI foreslår → menneske godkjenner → system utfører, aldri auto-send/
auto-kalender · barnas meldinger kun lokalt · «når er pappa ferdig»-svar er ledig/opptatt, aldri
kalenderinnhold · én sak → én flate · ingen nye MCP-servere/plattformer.

## STEG 13 — SG-app / Baneguide i PlayerHQ (AP0–AP6)

Flettet inn fra `plan-baneguide-sg-app-2026-08-16.md` og `baneguide-kjoreplan-2026-08-02.md`
(begge slettet 30.08). Produktspec/designspesifikasjon for baneguiden er beholdt som referanse i
`docs/baneguide-produktdokument-2026-08-02.md` (ikke slettet). Mål: egen SG-data-app i PlayerHQ,
UpGame-inspirert men selvstendig løst (aldri kopiering — samme problemklasse, egen implementasjon).
Fordelen fremfor UpGame: treningen kobles til plan/Workbench, ikke løsrevet fra spillerens nivå.

**Arbeidspakker (grov innsats ~35–40 kodeøkter, mange små PR-er over uker):**

| Pakke | Innhold |
|---|---|
| AP0 | Grunnmur: én SG-selector (`hentSpillerSg`, beregnede runder primært, `BrukerSgInput` kun fallback) · `SgBaseline`-semantikkfeil rettes (`sg_gained` feilaktig lagret som `expectedStrokes`) · enhetstester for `dispersion.ts`/`aggregateSg`/`sg-gap` (i dag utestet) · bro `Round.baneId` → `CourseDefinition` · doc-rettelser |
| AP1 | **Føring 2.0 — planens hjerte:** «kartet er skjemaet», som UpGame. Én føringsmodell (posisjonskjeden utvides, legacy slag-wizard fryses og avvikles). Kart-modus i `/runde/logg` + `/runde/live`. Avstander/lie avledes automatisk, aldri tastet (manuell overstyring alltid mulig). Putt-flyt (+/− stepper). Intensjon (target-punkt) + mental-rating tas i bruk (feltene finnes). Tre nivåer, ærlig merket: Hurtig total · Hull for hull · Slag for slag (kun sistnevnte gir SG) |
| AP2 | Baneguide MVP «Live på banen» — kjøreplanen under gjennomføres som den står, pluss to UpGame-tillegg: pin-justering per runde, gameplan-target forhåndsutfylt fra sikte |
| AP3 | SG-motor 2.0: ny tabell `SgReferanse` (nivå × kategori × distansebucket × lie — PGA Top 40, Broadie scratch, AK-kategori, egen historikk), interpolasjon mellom buckets, lie-justering (CANON #8), SG per slag/hull persisteres, AK-kategori-referanseverdier kalibreres av Anders |
| AP4 | Analyse-flatene: lukk C5-bølgens skjermer · rute-sanering (putte-lab/gapping → kanonisk `/portal/analysere/`-adresse) · Insights-flate («sterkeste/svakeste 3», peker alltid på handling) · ny statistikk fra slagkjeden (proximity, miss-retning, opp-og-ned, snittscore per par-type) · «Min bag» per-kølle-dispersion · referansevelger · DataGolf-flate der PR-F lander |
| AP5 | Coach-flatene (AgencyOS): samme SG-selector som spiller · `/admin/spillere/[id]/baneguide` lesevisning · gameplan-etterlevelse i rundeoppsummeringen · gruppebilde WANG/GFGK (aggregater, aldri sanntidsposisjon) |
| AP6 | Tester/practice-sløyfen — avgrenset, koblingspunkt notert (putte-lab mates av både runder og puttetester) |

**Beslutninger til Anders (PB1–PB10, kompakt):** PB1 DataGolf i PlayerHQ — egen flate eller
dybde under Analyse (anbefalt: dybdefane) · PB2 Analyse-huben 5 vs. 3 faner (anbefalt: fasitens 3)
· PB3 referansestigen — nivåer og default (anbefalt: spillerens AK-kategori) · PB4 Freemium —
låses SG-detalj/spredning bak PRO? · PB5 baneguide-B1–B6 (navn, GPS auto-bekreft, kart som
default, m.m.) · PB6 putt-break-registrering (anbefalt: nei i første runde) · PB7 DB-endringene
i `SgReferanse`+`Shot.sg` godkjennes samlet · PB8 legacy slag-wizard avvikles når Føring 2.0 er
signert · PB9 kanonisk adresse for gapping/putte-lab (`/portal/analysere/`) · PB10 UpGame-import
løftes frem i WANG-onboarding.

**Baneguide-kjøreplanen (Fase 1 MVP, 7 økter à maks 2 t, egen gren per økt):**
Økt 1 geometri+GPS-hook (ren logikk) → Økt 2 banedata-pakke+offline-cache → Økt 3
CourseMap-utvidelser (GPS-prikk, rotasjon, slagmarkør) → **★ FELT-TEST go/no-go** (Anders,
ikke en kodeøkt, Onsøy anbefalt bane) → Økt 4 kart-føring i RundeLoggKlient (den store) →
Økt 5 offline slag-kø+synk / Økt 6 gameplan-overlay+kølle/planB (eneste DB-endring i Fase 1) /
Økt 7 offline-fallback+sluttverifisering → pilot. Ingen nye dependencies i Fase 1; SG-motoren
røres ikke.

## STEG 14 — Diverse fra konsoliderte plandokumenter

| # | Oppgave | Detalj |
|---|---|---|
| 14.1 | **Pyramidefordeling — spilleren setter egen fordeling (steg 3–10 av 10, steg 1–2 fikset 17.08, se 3.6):** domenelag `settEgenFordeling()` i `src/lib/training/target-allocation.ts` (normaliser sum 100, zod, CANON-avvik som varsel — ingen sperre) · server action for spilleren (kilde `SPILLER`) · spillerskjerm i Workbench (fem skyveknapper/talefelt, `AkseFordelingsBar` live forhåndsvisning, «Tilbakestill til periodens forslag») · samme redigering på coach-siden i AgencyOS (kilde `COACH`) · `allocationForPeriod()` blir et forslag til skjermen i stedet for å skrive rett til planen · skjermbilde-gate · full verify+PR |
| 14.2 | **Testdekning-rest:** steg 1–7 (E2E-credentials-kobling, testglobb utvidet, `sg-hub`-mattetester, auth-guard avvis-tester, cron-secret+zod på API-grenser, dato-hjelper+workbench-sveip, GDPR/booking/Stripe-regresjon) er alle **LEVERT**. Steg 8 er delvis: `docs/testing.md` er rettet, men **skip-gate-scriptet** (`scripts/check-test-skip.mjs`, feiler CI hvis en «må-kjøre»-spec rapporterer skip) er IKKE bygget — hører sammen med 9.5 (venter på Anders' e2e-secrets) |
| 14.3 | **AK-formel v3-struktur** (dokumentert 03.08.2026, aldri kjørt i kode): full struktur for pyramide → område → delferdighet → betinget P-posisjon-slot → motorikk/belastning/press, pluss praksisform-felt (BLOKK/SERIELL/VARIABEL). **Status uklar etter 18.08-beslutningen** (alle treningsregler låst opp, se `beslutninger.md`) — **avklar med Anders** om v3-strukturen fortsatt skal implementeres som fast datamodell, eller om formelen nå er en fri merkelapp uten fast struktur/migrasjon. Ved videreføring: 13 åpne punkter (innspill-navnekonvensjon, putt-bøttegrenser m/meter→fot-migrering, P-format `P1.0` vs `P1`, m.fl.) må avklares først — full liste i git-historikken. **Ikke migrer Prisma-enums uten Anders' eksplisitte ja** |
| 14.4 | **AK Golf Intelligence-konsolidering** (kartlagt 27.06.2026, ikke verifisert på nytt siden — reverifiser status før videre arbeid, spesielt siden `ak-golf-pipelines` nå er eget repo per N-D4). Mål: samle DataGolf/WAGR/turnering-proff/kohort/college/SG-benchmarks i ak-golf-intelligence, HQ leser via API i stedet for å synke selv. SG-benchmark-lesing ER koblet (2026-07-31). **Blokkerende beslutning (§6.6 i kildedokumentet):** Intelligence sitt `dashboard`-schema var tomt — tre veier ble skissert (kjør Intelligence-pipelines mot delt DB / engangsmigrer HQ-data inn / snu retning, la HQ være master). Ikke koble flere HQ-lesere til Intel-API-et før dette er avklart på nytt |
| 14.5 | **Treningsplanlegger WANG/GFGK Junior** (spec 07.07.2026 — verifiser om fortsatt aktuelt/prioritert før arbeid startes). Tre jobber: **A** — gjør gruppe→spiller-utsending pålitelig: kjent feil i `src/lib/workbench/merge-week-sessions.ts:69-70` (dedupliserer på `id` i stedet for `generertFraId`, dobbelttelling av speilede økter → feil timetall/«på plan»-prosent), manglende transaksjoner i `v2-sync.ts`/`coachDuplicateWeek`/`apply-template-actions.ts`. **B** — åpne, delbare gruppe-sider for WANG+GFGK uten innlogging (kun felles gruppedata: tider/kalender/samlinger/turneringer/tester — ALDRI personlige spillerdata, PII-mindreårige-regelen). **C** — koble `gfgkjunior.no` til den datadrevne siden (repoet er ikke lokalisert ennå) |
| 14.6 | **Workbench/kalender-konsolideringsforslag** (analyse 18.08.2026, **IKKE vedtatt av Anders** — kun forslag). Fant 12 parallelle kalender/tidslinje-implementasjoner i `src/` med 3 ulike tidsrastre, mot designsystemets étt-motor-mønster. Forslag: konsolider til 3 delte motor-komponenter (`TidsGrid`/`DagStripe`/`ÅrsTidslinje`) som alle flater komponerer tynt oppå — coach-workbench bygges da på ny på spillerens motor i stedet for å reparere en fasit som ble avviklet 03.07. **Krever Anders' beslutning om omfang/rekkefølge før noe kodes** — sjekk først om T-bølgens Train-lock-porting allerede har gjort deler av dette moot |
| 14.7 | **Mindre åpne spørsmål** (fra flere kilder, ikke dekket over): **Team-wang-tilgangen** («åpen pr nå» siden 15.08) må enten bekreftes varig eller sperres igjen i `src/proxy.ts` — én linje fra Anders. **`/kommando`** kan ikke slettes før `/admin/workspace` er databakket med ekte `KommandoTask`-data (henger sammen med J-D under). **Mission Control** (personlig innboks-dashboard) sin plassering må avklares nå som `/admin/agencyos/live` er en ekte Live-tavle (funnet under T9-porten). **Drift-agenticos-resten:** skal marketing/rapporter ha egen inngang fra AgenticOS-huben eller egne fasiter? Skal `meg/dispatch`+`meg/morgenbrief` redirecte til `/admin/brief`? |

---

## STEG 15 — Én inngang per funksjon (konsolideringen, beslutning 6.9)

**Kilde:** `.claude/rules/beslutninger.md` §GRILLINGEN RUNDE 6, punkt 6.9 (Anders 30.08.2026).
Fullt underlag: `docs/beslutningsgrunnlag/grillingen-runde6-2026-08-30.md`.
**Målt tilstand:** `docs/arkitektur-kartlegging-2026-08-30.md` — 245 ekte skjermer, 36 uten vei
inn, 107 adresser allerede gjort om til veivisere.

**Regelen:** hver funksjon har nøyaktig én adresse. Det som i dag er egne sider blir faner
eller paneler inne i den ene siden. **Ingen funksjonalitet fjernes; alle gamle adresser blir
redirects.** Anders avviste kutt som mål — målet er én inngang, ikke færre funksjoner.

**Rekkefølge:** 15.1 og 15.2 først (de er de to Anders faktisk møter hver dag). Resten kan tas
i vilkårlig rekkefølge, én funksjon per økt, én PR per funksjon. Hver PR: redirects på plass +
`npm run verify` grønt + skjermbilde-gate (mobil 390px + desktop 1280px, lys og mørk).

**LÆRDOM FRA 15.1 OG 15.2 — sjekk dette i HVER gjenstående rad:** en komponent som var en HEL SIDE tar med seg sitt eget hode OG sin egen navigasjon inn i fanen. Kø fikk to identiske pillerader (ni piller før første sak på 390px); Oppgaver fikk tre stablede navigasjonsrader. Begge ble først synlige i skjermbilde-gaten, ikke i `verify`. Løsningen begge steder: en `somFane`/`hode`-prop som lar siden eie overskriften og fjerner komponentens gamle tabbrad. Regn med å måtte gjøre det per komponent.

**Status 31.08.2026: 7 av 13 LEVERT OG MERGET** (15.1, 15.2, 15.3, 15.5, 15.6, 15.7, 15.10) ·
15.9 levert i åpen PR #704 · gjenstår å bygge: 15.4 Kalender, 15.8 Analyse, 15.11 Stall-lista,
15.12 talent-flyttingen, 15.13 de 36 uten vei inn.

**ALLE TRETTEN ER TEGNET (30.08.2026).** Retningsutkast for hele konsolideringen:
https://claude.ai/code/artifact/581d1668-c627-42eb-a59c-1ba40bfe3751 — arbeidsfiler i
`designsystem/canvas/agencyos-ia/`. **Hver rad under venter nå på Anders' ja til tegningen**,
ikke på ny utredning. Får en rad ja, tegnes den ferdig (lys + tom tilstand) i sin egen
bygge-PR, jf. `.claude/rules/beslutninger.md` §TEGN SKJERMEN FØR DU BYGGER DEN.

| # | Funksjon (én adresse) | Slås sammen fra | Merknad |
|---|---|---|---|
| 15.1 | ~~**Kø**~~ **LEVERT OG MERGET 30.08.2026 (PR #689).** Skjermbilde-gaten kjørt mot ekte data — to feil funnet og rettet der: agent-fanene viste 530 (PlanAction-totalen) mot faktiske 23/12, og kilde-filteret hadde samme pille-stil som fanene, som ga ni piller før første sak på 390px. Canvas: `designsystem/canvas/ko/` | `admin/godkjenninger`, `admin/agenticos/godkjenn`, `admin/agenticos/ko`, `admin/tester/foreslatte`, `admin/tournaments/dubletter`, `admin/queue` | Kø = alt som krever Anders i dag: e-post, SMS, forespørsler, tilbakemeldinger, oppfølginger, godkjenninger (6.2). `admin/queue` (spiller-signaler) er IKKE Kø — flyttes til Stall (6.6) |
| 15.2 | ~~**Oppgaver**~~ **LEVERT OG MERGET 30.08.2026 (PR #694).** `/admin/oppgaver` med tre faner: Prosjekter · Rutiner · Tildelt meg. Redirects fra `/admin/workspace`, `/workspace/prosjekter`, `/workspace/oppgaver` og `/admin/handlingssenter`. **Ny modell `DriftRutine`** — beslutning 6.6 krever rutiner merket «kan automatiseres»/«må gjøres fysisk», og ingenting i basen dekket det (`RecurringPattern` er treningsøkter per elev). Additiv DDL via `scripts/add-drift-rutiner-2026-08-30.ts`, idempotent med `--rollback`, kjørt mot prod. **Tilgang:** `/admin/workspace/prosjekter` gatet på ADMIN alene — fanen arver det, en coach ser to faner. **Avvik fra denne tabellen (bevisst):** `/admin/workspace/notion` er Notion-TILKOBLINGEN, altså en integrasjon — den hører i 15.3 Oppsett og beholder adressen til da. **Gjenstår:** tabellen er tom (0 rutiner). Anders' faste rutiner står i `.claude/rules/` (ballplukking torsdag, vaskeliste Mulligan, lønnssjekkliste den 3., sportssjefsmøte onsdag) og kan seedes når han sier ifra. Canvas: `designsystem/canvas/agencyos-ia/Oppgaver.dc.html` |
| 15.3 | ~~**Oppsett**~~ **LEVERT OG MERGET 31.08.2026 (PR #698).** `/admin/oppsett` med åtte faner: Akademi · Klubb · Kalender · Tilgang · Sikkerhet · Integrasjoner · API · Perioder. Redirects fra alle åtte gamle adresser. `/admin/settings` var selv en mini-hub (fem rader via `?rad=`) — Tilgang og Klubb ble EGNE faner her, så Akademi-fanen viser nå kun Akademi/Varsler/Konto (`AdminOppsettHubTrainLock` filtrerer de to radene med `somFane`, ingenting fjernet). Tilgang-fanens indre Roller/Per-trener-valg flyttet fra `?fane=` til `?visning=` (kollisjon med toppnivå-fanen). `npm run verify` grønt, 1944/1944 tester, skjermbilde-gate kjørt (mobil 390px + desktop 1280px, lys og mørk, alle 8 faner) — ingen doble hoder. Canvas: `designsystem/canvas/agencyos-ia/Oppsett.dc.html` | `admin/settings` + `/api`, `/calendar`, `/periode-navn`, `/security`, `/tilgang`, `admin/klubb/innstillinger`, `admin/integrasjoner` | Faner i én side |
| 15.4 | **Kalender** | `admin/kalender`, `admin/kalender/lag`, `admin/kalender/hendelse/ny`, `admin/agencyos/uka`, `admin/stall/dag` | Sjekk mot 14.6 (kalender-motor-konsolideringen) før arbeid — de kan gjøre hverandre moot |
| 15.5 | ~~**Jarvis**~~ **LEVERT OG MERGET 31.08.2026 (PR #701).** `/admin/jarvis` med fire faner: Kø · Prosjekter · Skills · Runtimes. Redirects fra `admin/agenticos`, `/projects`, `/runtimes`, `/skills`. **`admin/agenticos/ko` og `admin/agenticos/godkjenn` er IKKE med** — de flyttet allerede til `/admin/ko` i 15.1 (fanene «agentko»/«agentgodkjenn»); å ta dem inn her igjen ville gitt to steder for samme innhold. `/admin/agents/[agentId]` (agent-detaljarket) er heller ikke en av de fire. Hele `/meg`-familien (inkl. `meg/dispatch`+`meg/morgenbrief`) er urørt — utenfor omfang, uavklart spørsmål i 14.7. De fire fane-komponentene (Cockpit/Projects/Runtimes/Skills) var allerede bygget som tab-innhold under `AgenticosSkall` — ingen egne sidehoder, så `somFane`-mønsteret fra 15.1/15.2/15.6 var ikke nødvendig. Tilgang uendret: alle fire arver `requireCapability(Capability.USE_AGENTS)` fra kildesidene, låst av `src/lib/admin/jarvis/faner.test.ts` + `admin-capability-kontrakt.test.ts`. Canvas: `designsystem/canvas/agencyos-ia/Jarvis.dc.html`. **Verifisert:** tsc, eslint, `npm test` (1960/1960), `check-action-auth`/`check-token-gap`/`check-critical-imports`/`check-ingen-paper`/`check-doc-lenker`, `npm run build` — alle grønt. **Rest etter merge:** skjermbilde-gate (mobil/desktop, lys/mørk) er ikke dokumentert kjørt — kjør den mot prod/preview som etterkontroll |
| 15.6 | ~~**Turnering**~~ **LEVERT OG MERGET 31.08.2026 (PR #699).** `/admin/turnering` med fire faner: Alle · Mine spillere · Dubletter · Kart. Redirects fra `admin/tournaments`, `admin/tournaments/dubletter`, `admin/turnering-kart`. **`admin/tournaments/ny` er IKKE en fane** — CTA-en «Ny turnering» i toppen peker fortsatt dit (uendret opprettelsesskjema), per instruks. **Ny fane «Alle»** — fantes ikke som admin-visning før; full søkbar/paginert liste over hele turneringsbasen (`lastAlleTurneringer`, 50/side), unngår `_count`-på-stor-relasjon-fellen (gotchas.md) ved å telle påmeldte kun for de 50 viste idene. **«Mine spillere»** er den gamle `/admin/tournaments`-visningen (stallens egne påmeldinger) flyttet ORDRETT inn som fane, med `somFane`-prop på `AdminTurneringerTrainLock` for å skjule dens eget hode/CTA (samme lærdom som 15.1/15.2). Dubletter-verktøyet (`MergeDubletterListe` + `lastDubletter`) deles med Kø — Kø sin dubletter-fane peker nå `gammelHref` til `/admin/turnering?fane=dubletter` og virker uendret. Canvas: `designsystem/canvas/agencyos-ia/Turnering.dc.html`. **Verifisert:** tsc, eslint, 22 node-tester (faner.ts + oppdatert ko/faner.test.ts), samt `check-action-auth`/`check-token-gap`/`check-critical-imports`/`check-ingen-paper`/`check-doc-lenker` — alle grønt. **Rest etter merge:** skjermbilde-gate (mobil/desktop, lys/mørk) er ikke dokumentert kjørt — kjør den mot prod/preview som etterkontroll |
| 15.7 | ~~**Kommunikasjon**~~ **LEVERT OG MERGET 31.08.2026 (PR #702).** `/admin/kommunikasjon` med fire faner: Innboks · Utkast · Sendt · Maler. Redirects fra `admin/innboks` (+ `?filter=varsler` videreført, brukt av `/admin/varsler`), `admin/innboks-epost`, `admin/email-templates`. **`/meg` er IKKE flettet inn, med vilje** — den er en frittstående Jarvis-chat-app (tråd/composer/artefaktpanel), ikke en enkel innboks-flate, og STEG 14.7s spørsmål («skal meg/dispatch + meg/morgenbrief redirecte til /admin/brief?») er fortsatt uavklart. Canvas viser kun de fire fanene over — ingen av dem mapper til `/meg`. `/meg`, `/meg/dispatch`, `/meg/morgenbrief` står urørt og krever egen avklaring før noen sammenslåing vurderes. **Utkast/Sendt er ETT statusfilter på samme `InnboksEpost`-tabell** (samme mønster som Turneringes «Alle»/«Mine spillere»), ikke to kilder — og er fortsatt ADMIN-alene (arvet fra `/admin/innboks-epost`); en COACH som ber om de to fanene faller tilbake til standardfanen «Innboks». Canvas: `designsystem/canvas/agencyos-ia/Kommunikasjon.dc.html`. **Verifisert:** tsc, eslint, 1961 node-tester (inkl. ny `faner.test.ts`), `check-action-auth`/`check-token-gap`/`check-ingen-paper`/`check-doc-lenker` grønt. `check-critical-imports` feiler i denne worktreen på 5 filer VI IKKE HAR RØRT — årsak verifisert: `node_modules/esbuild/bin/esbuild` mangler i worktreen (ENOENT), ikke en kodefeil. **Rest etter merge:** skjermbilde-gate (mobil/desktop, lys/mørk) er ikke dokumentert kjørt — kjør den mot prod/preview som etterkontroll |
| 15.8 | **Analyse** | `admin/analyse`, `admin/analyse/stall`, `admin/analysere/compliance` | Innhold styres av beslutning «INNSIKT PER SPILLER — de fire spørsmålene» (30.08) |
| 15.9 | ~~**Plan**~~ **LEVERT OG MERGET 31.08.2026 (PR #704).** `/admin/plan` — canvasen (Plan.dc.html) har INGEN faneraden de andre STEG 15-radene har, så dette er en enkel hub uten `?fane=`-modul: seks rader (Ukemaler/Treningsprogram/Månedsplaner/Standardøkter/Øvelsesbank/nytt: Teknisk plan) lenker videre til `/admin/plan/maler` og `/admin/plan/teknisk` (1:1-flyttet innhold). `admin/plan-templates/ny`, `/[id]`, `/[id]/rediger` er UENDRET på sine gamle adresser (samme mønster som Turnering 15.6 sin `/ny`). «Planlegge er ett trykkpunkt til Workbench» (beslutning 21.07) er urørt. **Rest etter merge:** skjermbilde-gate er ikke dokumentert kjørt — kjør den mot prod/preview som etterkontroll. | `admin/planlegge`, `admin/plan-templates` (+`/ny`), `admin/teknisk-plan` | «Planlegge er ett trykkpunkt til Workbench» (beslutning 21.07) gjelder fortsatt |
| 15.10 | ~~**Hjem**~~ **LEVERT OG MERGET 31.08.2026 (PR #703).** `/admin/agencyos` er nå to Train-lock-kort — Kø (gjenbruker `lastGodkjenninger`/`koTelling`, samme tall som `/admin/ko`) øverst, «I dag» (full øktliste, ikke bare nå/neste) under. `/admin/brief` redirecter hit. Canvas: `designsystem/canvas/agencyos-ia/Hjem.dc.html` + `HjemMobil.dc.html`. **Ikke med videre** (dokumentert i `TrainLockCockpit.tsx`-hodet, ikke fjernet stille): agentenes-anbefalinger/AI-dispatch-status (duplikat av Kø-kortet og av Jarvis `/admin/agenticos`), «krever oppmerksomhet»/KPI-strip/nyligste runder (canvasens undertekst sier ordrett at avvik og fremgang nås via Stall — naturlig hjem er 15.11, ikke bygget ennå), AI-brief-avsnittet (Anthropic-generert tekst — ikke i canvasen). Print/eksport (`kind="brief"`) er bevart som sekundære handlinger i headeren. `AGENCYOS_SKALL_TABS`/`AGENCYOS_UNDER_MEG`/`AGENCYOS_NAV` er urørt. Skjermbilde-gate kjørt av hovedsesjonen mot isolert worktree (mobil+desktop, lys+mørk) — PASS på alle fire; én hydration-mismatch (`navigator.onLine` i useState-initializer) funnet og rettet før merge (`useSyncExternalStore`). | `admin/agencyos` (Konsoll), `admin/brief` (Daglig brief) | Kø øverst, dagens plan under (6.5). **Mobilflate først** — Anders skanner den stående på treningsfeltet mellom økter (6.1) |
| 15.11 | **Stall-lista slankes** | — | Raden viser: navn, neste økt, siste aktivitet, én varsel-prikk. SG-form, plan-etterlevelse, hcp, pakke og skyldig beløp flyttes inn i spillerkortet (6.5). Prikk: fylt = trenger deg, åpen = følg med, ingen = på planen |
| 15.12 | **`/admin/talent/*` ut av AgencyOS** | — | Talent-flatene skal bo under `/innsyn` (beslutning 26.08). Ikke en sammenslåing — en flytting |
| 15.13 | **De 36 skjermene uten vei inn** | — | Etter 15.1–15.12: gå gjennom lista i `docs/arkitektur-kartlegging-2026-08-30.md` og gi hver enten en inngang eller en redirect. Ingen skjerm skal stå igjen uten vei inn |

**Ikke i denne konsolideringen:** PlayerHQ. Beslutning 6.9 gjelder AgencyOS. Kartleggingen
30.08 målte at «Analyse» i spillerappen har 17 innganger og «Meg» 34 undersider — det er samme
sykdom, men **krever egen beslutning fra Anders** før noe slås sammen. Legges i beslutningskøen
under.

---

## STEG 16 — Datagrunnlag, kjønn og måling (beslutninger 30.08)

**Kilde:** `.claude/rules/beslutninger.md` §DATAKARTLEGGING, §GRILLINGEN RUNDE 2, §PRODUKTRETNING.
Måletall: `docs/beslutningsgrunnlag/datakartlegging-2026-08-30.md`.

**Hvorfor dette står samlet:** alt under er grunnlaget analysene hviler på. Bygges en analyse på
feil kolonne, er tallet feil for alle som ser det etterpå — og TruthLayer-prinsippet (PRODUKTRETNING
pkt. 7) sier at alt appen påstår om et menneske skal kunne spores til en måling med dato og kilde.

| # | Oppgave | Detalj |
|---|---|---|
| 16.1 | ~~**Til-par-grunnlaget — ett view**~~ **VIEWET ER LEVERT (PR #679, `scripts/lag-topar-grunnlag-2026-08-30.ts`).** Målt i basen 30.08: `dashboard.mv_topar_grunnlag` har **123 257 rader**, 8 538 spillere, 2014–2026, fersk til i dag. **0** rader uten til-par, **0** utenfor 55–130, **0** dublettgrupper på (spiller, turnering). Leser `scoreToPar` (`prisma/schema.prisma:2985`), aldri par fra `public.baner`. **Gjenstår to ting:** (a) **ingen kode leser viewet** — `grep` på `mv_topar_grunnlag` i `src/` gir null treff, så det er foreløpig en niende analyse uten skjerm (se 16.7); (b) **ingen oppfriskning** — det finnes ingen cron for `refresh materialized view concurrently`, så snapshotet fryser på 30.08 og blir gradvis feil. Legg refresh i en cron-rute før noen skjerm kobles på | Verifisert i basen 30.08.2026 |
| 16.2 | **Kjønn som felt (svar 2, fire trinn).** Uten kjønn er enhver kullsammenligning villedende for halve gruppen | (a) felt i datamodellen — finnes ikke i `prisma/schema.prisma` i dag (verifisert 30.08) · (b) manuell utfylling for Anders' egne spillere (WANG, GFGK, Academy) umiddelbart · (c) utledning fra klassekode som **eksplisitt merket** supplement — dekker 26,4 % og gir 200 jenter mot 2 066 gutter, altså systematisk skjevt · (d) ekte kilde via NGF/GolfBox som mål. Additiv DDL via `db execute`-mønsteret (`.claude/rules/gotchas.md`) — **ikke** `migrate dev`/`db push`/`migrate deploy` |
| 16.3 | **Bruksmåling — daglig aktiv (grillingen 1.7, «bygges nå»).** Aktivering og frafall må måles fra dag én av betalt drift, ikke gjettes | Én rad per bruker per aktiv dag (userId + dato), skrevet ved innlasting av `/portal`. Ingen tredjepartsverktøy, ingen cookies. Kort i AgencyOS: «X brukte appen i går / denne uka / ikke åpnet på 30 dager». **Delvis bygget allerede:** `src/components/admin/v2/AdminReachV2.tsx:69` har en `DagligAktivitet`-komponent — men den har **null importører** og ingen datakilde. Gjenbruk komponenten, bygg tabellen og koblingen |
| 16.4 | **Identitetslaget trinn 0 (~½ dag).** Billigere enn antatt | Eksakt navnematch treffer 2 486 av 4 873 ekte navn (51 %) og dekker 59,9 % av resultatradene; kun **3** er tvetydige. Løfter `mv_canonical_players` fra 47 til ~2 500. **Nordic League er allerede koblet:** alle 22 529 rader har `dg_id`, og joinen virker på `dg_events.event_id` (172/172 treff), ikke `dg_events.id` (0 treff) — 50 arrangementer kan dateres med én UPDATE |
| 16.5 | **`player_source_matches.birth_year` fylles (~2 t).** Utfylt i 0 av 124 rader i dag | Fylles den, får kohort-progresjonen 313 treff umiddelbart. To av de åtte ferdigbygde analysene i `src/lib/dashboard-data/` er tomme kun av denne grunnen |
| 16.6 | **Klubb og klassekode sluttes å kastes i scraperen.** Én pipeline-endring, to gevinster | `src/lib/scrapers/golfbox.ts:223` parser `ClubName` i zod-skjemaet og forkaster det i mappingen; samme mønster for klasse. Gir både klubbdimensjonen (`mv_club_aggregates` har i dag 46 rader med **én unik verdi: «Øst»** — det er region, ikke klubb) og ekte brutto-garanti via nettokode-hvitlista |
| 16.7 | **De åtte ferdige analysene får skjerm.** `src/lib/dashboard-data/` har 15 zod-validerte lesefunksjoner mot åtte materialiserte views, med tester og **null importører fra skjermkode** | Koble dem. **Unntak: `mv_cohort_baselines` skal IKKE vises før den er rettet** — J19 2025 har snitt 155,3 og p90 241,8, altså flerrundetotaler behandlet som enkeltrunder. Henger sammen med N12 (STEG 11) |
| 16.8 | **`source_registry.yaml` lukkes.** 16 kilder finnes i turneringsdata, kun 4 er registrert | Tolv kilder henter uten registrert lisens-/GDPR-grunnlag. Bryter pipeline-repoets egen regel 2. Arbeidet hører i `akgolfsoftware/ak-golf-pipelines` |
| 16.9 | **Feltstyrke-justert score — grunnvalutaen for norsk juniorgolf.** Kilde: `.claude/rules/beslutninger.md` §SG-STIGEN. **Skjermen er tegnet:** `designsystem/canvas/innsikt/` (https://claude.ai/code/artifact/1b8c837e-9fbe-4f3e-8427-789978a17afc) — canvas-gaten fra 30.08 er dermed passert for 16.9–16.11 når Anders har godkjent den | Bygg på `dashboard.mv_topar_grunnlag` (16.1, 123 257 rader): spillerens til-par mot **feltsnittet i samme turnering**, ikke mot par og aldri mot plassering. Krever minstekrav til feltstørrelse (settes ved bygging, oppgis i UI) og at nettokode-hvitlista fra 16.6 er på plass før tallet vises bredt. Uten dette er ingen sammenligning gyldig på tvers av bane, tee, klasse og år. **Forutsetning som må måles først:** 16.1-viewet har ingen oppfriskning — legg cron for `refresh materialized view concurrently` før noe kobles på |
| 16.10 | **SG-stigen — kalibrering mot ekte DataGolf-SG via Nordic League-broen.** Selve konkurransefortrinnet | Alle **22 529 Nordic League-rader har `dg_id`** (målt 30.08), og `dashboard.dg_rounds` + `dg_round_sg` har komplett SG på **962 208 runder**. Spillere med data på begge sider gir omregningen fra feltstyrke-justert norsk score til SG-skala. Joinen virker på `dg_events.event_id`, **ikke** `dg_events.id` (172/172 mot 0 treff — samme felle som 16.4). **Ferdig når:** omregningen er målt på et navngitt utvalg, spennet er oppgitt, og `src/lib/stats/sg-estimator.ts` (Broadie-tabell, sju hardkodede rader) ikke lenger er referansen. Estimatet fra sg-estimator merkes **estimat** i UI inntil da. Avhenger av 16.4 (identitetslaget) og 16.9 |
| 16.11 | **Aldersbaner for proffer — «slik lå de da de var 17».** Godkjent for spillerflaten i PRODUKTRETNING pkt. 4 | `dg_players.birth_year` + `dg_rounds` (PGA 1983–2026) gir kurve per alder for alle 3 569 proffene, ikke bare de to kjente. Leses via `src/lib/dashboard-data/` (16.7). **Gjelder gutter:** alle 26 tourer i lageret er herretourer — mangelen skal sies på skjermen, ikke skjules. Aldersaksen starter på 16 år (under er stigen ikke monoton, tee-effekt) |

**Ikke bygg (fra samme beslutning):** plassering som persentil · par påført fra baneregisteret ·
aldersstige under 16 år · sesongform som populasjonskurve · regionkart presentert som nasjonalt ·
banevanskelighetsindeks per bane · kohort-persentil til spiller/forelder/åpen flate · odds,
prognoser, fantasy · **opprykkseffekt som ett tall** (ikke robust — se avsnittet over).

**Opprykksanalysen er IKKE åpen lenger — den skal ikke bygges som tall (målt 30.08.2026).**
Spørsmålet var «ett nivå eller flere per spiller-år». Målingen viser at valget mellom de to
definisjonene ikke er problemet: **juniorer forbedrer seg hvert år uansett nivå**, så en
opprykkseffekt uten kontrollgruppe er aldersutvikling forkledd som opprykk. Med nivåstigen
REGIONTOUR → OSTLANDS → OLYO → SRIXON → NORGESCUP (rekkefølgen er bekreftet av feltstyrken:
snitt til-par 13,64 · 10,55 · 10,41 · 8,76 · 6,32) ble det målt: opprykkere −1,64 slag, **men de
som ble på samme nivå −1,13 og de som rykket ned −1,14**. Netto opprykkseffekt er altså ~0,5
slag, ikke 2 — og trekkes alderen inn, **skifter den fortegn**: +1,99 ved 14 år, −1,08 ved 16,
−1,16 ved 18, med bare 10–96 spillere per alderstrinn. Effekten er ikke robust. Å publisere
«+2,10» eller «+2,27» ville vært TruthLayer-brudd uansett hvilken definisjon som vant.
**Konsekvens:** ingen opprykksanalyse bygges nå; den flyttes til «Ikke bygg»-lista under.
Ønsker Anders den likevel senere, kreves kontrollgruppe (samme nivå) og aldersjustering, og
tallet må oppgis med usikkerhet — ikke som ett tall.

---

## STEG 17 — Team Norway Workdesk (TN-bølgen)

**Kilde:** `.claude/rules/beslutninger.md` §TEAM NORWAY-WORKDESK (Anders 30.08.2026).
**Rekkefølge:** **etter bølge N-kjernen (STEG 11)** — Anders' punkt 4. Lansering 1. sep og bølge N
går først. WANG-elevene onboardes i september uavhengig av dette (PlayerHQ, ikke Workdesk).

**Målet:** TN-siden blir et komplett arbeidsområde som erstatter Messenger-grupper, e-post og
Word/Excel. Bygger på org-flate-grunnmuren fra bølge N (N7/N9) og samtykke-stakken
(`src/lib/auth/ekstern-leser-scope.ts`, verifisert 30.08).

**Låst:** dataansvar = **AK Golf eier alt** (Anders valgte bort «organisasjonen eier»-modellen).
Hver TN-spiller/forelder samtykker direkte til AK Golf. Må avtalefestes når lisensavtalen kommer
i 2027. Forretningsmodell: gratis pilot 2026/27 → **spillerlisenser** fra 2027, ikke plattformleie
(se §FORRETNINGSMODELL: SPILLERLISENSER) — sies høyt fra start.

| # | Oppgave | Detalj |
|---|---|---|
| 17.1 | **Poster, ikke chat** | Trener poster til gruppe og til enkeltspiller, med video, bilder, lenker og vedlegg (flybilletter, hotellreservasjoner). **Ingen fri chat.** 1:1-poster til mindreårige skal være sporbare og synlige for forelder (idrettens åpenhetsprinsipp) — det er et krav til datamodellen, ikke en UI-detalj |
| 17.2 | **Dokumenter med lesekvittering** | Fildeling per gruppe, «12 av 14 har åpnet uttakskriteriene», og «sist oppdatert»-merking |
| 17.3 | **Delte testprotokoller på tvers av AK Golf, WANG og TN** | En protokoll opprettes én gang og deles. **Driftsmodellen SKAL spesifiseres i planen (Anders eksplisitt).** Anbefalt: versjonerte protokoller som låses ved første bruk — resultater peker på versjonen, endring gir ny versjon, eierorganisasjonen endrer, delte mottakere bruker. Henger sammen med N8/N10 (STEG 11) |
| 17.4 | **Pilot høsten 2026** | Anders + 2–5 navngitte TN-trenere får konto, tilgang kun til egne grupper; spillere inn via samtykke. **Bevis på én samling før utrulling** |
| 17.5a | **Landskapsanalyse — delen som kan bygges NÅ** (ikke blokkert, målt 30.08) | `dashboard.mv_topar_grunnlag` bærer allerede turneringer per år, spillere per år, deltakelser og nivå (`kilde`). Målt 2018→2026: 187→177 turneringer, 1 989→2 984 spillere, 10 705→13 212 deltakelser. **Advarsel som MÅ følge tallet:** juniorer U19 hopper 328 (2024) → 1 006 (2025) — det er kildesammensetningen som endrer seg (OLYO kom inn), ikke virkeligheten. Derfor sies volumtall til NGF som **+24,3 % målt på OLYO alene**, aldri flerkilde-tallet |
| 17.5b | **Klubbdimensjonen** — «hvilke klubber har flest spillere per klasse» | **Blokkert av 16.6.** `mv_club_aggregates` har i dag 46 rader med én unik verdi, «Øst» — det er region, ikke klubb. Klubbnavnet finnes i GolfBox-svaret og kastes i scraperen |
| 17.5c | **Regionsdimensjonen** | **Kan ikke bygges som nasjonalt bilde.** Alle seks regioner i datagrunnlaget er kun OLYO — et regionkart ville framstilt én kilde som hele Norge. Står allerede på «Ikke bygg»-lista i STEG 16 |
| 17.5d | **Lenker per turnering** | **Blokkert: `dashboard.tournament_links` er tom (0 rader, målt 30.08).** Det er denne MD-fila fra Anders skal fylle — se beslutningskøen punkt 20. Merk at 17.5a IKKE venter på den; lenkene er berikelse, ikke grunnlag |
| 17.6 | **TN-branding — LEVERT 30.08.2026** | Brandingsystemet foreligger: Claude Design «Claw Design — Team Norway Golf» (`a03bf94a`), speilet i `designsystem/team-norway/` (112 filer, 10 ferdige skjermmaler). **Sperren «tegner ingenting før det foreligger» er dermed løftet.** TN-rød er `#D70232`, ikke `#D50431` — kun på logo og skinne, aldri status (status bruker `#C2352B`). Utestående: ekte vektorlogo fra NGF, se beslutningskøen punkt 23 |

---

## Samlet beslutningskø til Anders (alt på ett sted)

1. ~~#490-merge~~ **MERGET 31.08.** Gjenstår kun: team-wang-tilgangen varig åpen eller sperret igjen (= punkt 13).
2. Rotér `SCREENTEST_PASSWORD` (låser opp all signering).
3. PORTPLAN §A1 — de 10 portbeslutningene (én økt).
4. PR-F: DataGolf/stats-plassering i PlayerHQ.
5. WANG B4 + B5.
6. Freemium-presiseringen (7.1 — én linje).
7. Jarvis J-A–J-D (se STEG 12).
8. FYS-referanseverdier (når klar — ingen hast, plassholder er ærlig).
9. D4-backfill: områdekoder for resten av testdefinisjonene.
10. KommandoTask vs. Notion-cache (J-D).
11. ~~#514-planen (SG-app)~~ **LUKKET — #514 og #534 er begge MERGET (31.08).** SG-beslutningene som gjenstår er PB1–PB10 i STEG 13, pluss åpen PR #700.
12. W5-auth: bestille tegnet designfasit for de 15 auth-rutene? (STEG 10.7)
13. Team-wang-tilgangen: bekreftes varig åpen (navnefri) eller sperres igjen? (STEG 14.7)
14. Mission Control: hvor bor det personlige innboks-dashboardet nå som `/admin/agencyos/live` er en ekte Live-tavle? (STEG 14.7)
15. AK-formel v3-strukturen (STEG 14.3): fortsatt ønsket som fast datamodell etter 18.08-opplåsingen, eller skrotes til fordel for frie merkelapper?
16. Workbench/kalender-konsolideringsforslaget (STEG 14.6): omfang og rekkefølge, eller avvist?
17. AK Golf Intelligence-konsolideringen (STEG 14.4): fortsatt ønsket retning, gitt at pipelinene nå ligger i eget repo?
18. **PlayerHQ-konsolideringen (STEG 15, siste avsnitt):** beslutning 6.9 gjelder AgencyOS. Skal samme regel — én inngang per funksjon — også gjelde spillerappen? Målt 30.08: «Analyse» har 17 innganger, «Meg» har 34 undersider.
19. ~~Nivådefinisjonen i opprykksanalysen~~ **LUKKET 30.08.2026 — krever ingen beslutning fra Anders.** Målt i basen: effekten er ikke robust (skifter fortegn med alder, 10–96 spillere per trinn), og valget mellom de to definisjonene endrer den ikke. Opprykksanalysen er flyttet til «Ikke bygg» i STEG 16. Vil Anders ha den likevel, må den bygges med kontrollgruppe og aldersjustering — og oppgis med usikkerhet, ikke som ett tall.
20. **MD-fila med turneringer og lenker (STEG 17.5d):** blokkerer nå KUN lenkene, ikke hele landskapsanalysen. 17.5a kan bygges i dag. `dashboard.tournament_links` er tom (0 rader) — det er den MD-fila skal fylle. **Trenger fortsatt Anders.**
21. **Klubbdimensjonen (16.6 → 17.5b):** krever kun én pipeline-endring, ingen beslutning — men prioriteringen er Anders'. Uten den finnes ikke «hvilke klubber har flest spillere», som var et av de fire spørsmålene i TN-Workdesk punkt 7.
22. **WANG-flatens stil (STEG 11 N7):** Team Norway er avgjort (Claw, 30.08). WANG er ikke. Tre muligheter: WANG beholder sitt eget system (`src/styles/wang-tokens.css`, `.wang-tp` — enpalett lys, 10 skjermer i produksjon), WANG porter til Train-lock som N7 opprinnelig sa, eller WANG får samme behandling som TN med et eget merkevaresystem. N7 kan ikke ferdigstilles for WANG før dette er svart. **Trenger Anders.**
23. **Ekte vektorlogo fra NGF (STEG 17.6):** dagens TN-logo er en PNG beskåret fra en JPEG med kompresjonsartefakter. `#D70232` er målt fra den, så en ekte vektorfil ville gjort fargen endelig og skalerbar. NGFs kontaktpunkt står under «Grafisk utforming / visuell profil» på golfforbundet.no. **Trenger Anders** — det er hans relasjon til forbundet.
24. **Hvem ser SG-stigen (STEG 16.10)?** Kalibrert plassering på proff-skalaen ligger mellom to vedtak: kohort-persentil er coach-only (PRODUKTRETNING pkt. 3), mens «veien til de som lyktes» er godkjent for spillerflaten (pkt. 4). En SG-stige er nærmere pkt. 4, men den rangerer også indirekte. **Trenger Anders** — bygges coach-only inntil han sier noe annet.
