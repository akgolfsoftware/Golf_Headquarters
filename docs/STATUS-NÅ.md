# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-07-15 (natt-økt: 9 PR-er levert og 8 merget til main — krasj-varsling ble ekte, siste mock i foreldreportalen fjernet, Workbench fikk touch/iPad-støtte, I8-klikkrevisjonen dekker nå 23 av 261 skjermer, fire AgencyOS/PlayerHQ-skjermer portet til v2 [TrackMan, Audit-log, Coach·Ny melding, Coach·Nytt spørsmål], og D1 [live/skjult-beslutningen] er tatt og utført. Se punktene under.)

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Skjerm-status** (autoritativ, 6 haker/skjerm + «Veien til 100%») | `docs/MASTER-SKJERMPLAN.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |

Historiske bygg-spor (SKJERM-STATUS, SKJERM-BYGGEPLAN, BYGGELOGG-FLAGG, KONFLIKTER) er flyttet til `docs/arkiv/` — ikke bygg mot dem.

---

## Kort sagt
Appen er **deployet og kjører** på `akgolf-hq.vercel.app`. Kjernen (PlayerHQ + AgencyOS) er bygget, og en stor P2/P3/I0/I3/I8-runde (14. juli) rettet ytelse, en sikkerhetslekkasje i booking-tilgjengelighet, la til kalenderhendelser, og fant/fjernet flere «ser klikkbar ut men gjør ingenting»-knapper på de 10 viktigste skjermene. **Den er IKKE klar for betalende/ekte brukere ennå.** Betaling starter etter plan **1. august** (flyttet fra 1. juli av Anders 2026-06-24) — koden gir bevisst alle PRO gratis frem til da. Booking går midlertidig via **Acuity** (`akgolfgroup.as.me`) til den innebygde HQ-bookingen lanseres.

**Rettet 2026-07-14:** «Delvis mock i AgencyOS»-linjen under var utdatert — Innboks, Godkjenninger, Økonomi og Analytics bruker alle ekte Prisma-data i dag (verifisert direkte i koden), ikke placeholder-tall. Flyttet til «Ferdig/solid».

## Ferdig / solid (verifisert)
- **Deployet live:** prod på `akgolf-hq.vercel.app`. Push til `main` deployer AUTOMATISK (git-integrasjon fikset 10/7) — kjør ALDRI `vercel deploy --prod` manuelt.
- **PlayerHQ – 5 hovedskjermer:** mobil-paritet 0 avvik mot fasit (Hjem, Planlegge, Gjennomføre, Analysere, Meg).
- **PlayerHQ – datatilkobling:** 8 prioriterte skjermer koblet til ekte Prisma-data (SG-Hub, Runder, TrackMan, Statistikk, Booking-hub+ny, Drills, Workbench-sheets, Live-summary).
- **Workbench (lanserings-hub):** 7 hub-faner (tek/seson/maler/std/gantt/uke/okt), Maler «Bruk» → TrainingPlanSession+V2, publiser DRAFT→PENDING_PLAYER, SeasonPlan+TournamentEntry+TrainingSessionV2 i uke/Gantt, GroupSchedule i innsikt, `/portal/tren/*` redirects, turnerings-fellesmelding → GroupMember. Design-gate 0 udokumenterte avvik. **230/230** tester + tsc + build grønt.
- **AgencyOS:** Fase 3 desktop (~26 nav-skjermer) på paritet + Fase 4 mobil (M1–M3) flettet inn.
- **SG-motor:** alle 4 kategorier kalibrert (Broadie OTT/APP/ARG + Team Norway IUP PUTT), 168/168 tester grønne.
- **Benchmark-autosync:** DataGolf-fasiter auto-oppdateres mandager 08:00, godkjenning på `/admin/tester/benchmarks`.
- **Testbatteriet ende-til-ende (15. juni, deployet):** server-side scoring-motor (riktig formel per test, PEI=nærhet÷lengde) · fullskjerm scorekort · korrekt progresjon for alle 30 tester · ekte coach-analyse + benchmark-nivåer + FYS-gate + coach-notater · `TestAssignment`-modell (prod-migrasjon kjørt) m/ coach↔spiller-tildeling + varsling · forbedrings-loop (svakeste→drill via `loadWeaknessSignals`). Verifisert: 193/193 lib-tester, tsc, build, røyk-sjekk. Gjenstår: e2e-nettlesertest av 3 coach-test-skjermer (Funker-haken `~`).
- **Dokumentasjon ryddet (2026-06-14):** én kanon-inngang (`docs/platform/AGENT-BRIEF.md`), utdatert `PLATFORM.md` arkivert, konsept-ordbok flettet, døde brancher slettet.
- **AgencyOS-datakobling (re-verifisert 2026-07-14):** Innboks (`loadDailyBrief`/`loadInnboksSammendrag`), Godkjenninger (ekte `PlanAction`-kø), Økonomi (ekte `Payment`/`Subscription`-aggregering), Analytics (`/admin/analyse`, 15 ekte Prisma-spørringer) — alle ekte data, ingen placeholder-tall.
- **14. juli-runden:** query-diett + sikkerhetsfiks i booking-tilgjengelighet, kalenderhendelser (ferie/stengt anlegg blokkerer faktisk booking), full lenke-sveip av hele appen (0 dødlenker), klikk-revisjon av de 10 viktigste skjermene (300+ knapper sjekket, 6 reelle «ser klikkbar ut, gjør ingenting»-feil funnet og rettet, inkl. en falsk «→»-lenke-komponent brukt 20+ steder).
- **Natt til 15. juli-runden (9 PR-er, 8 merget):** krasj-varsling er nå ekte (UI-teksten «vi har blitt varslet» løy før — global-error/error kaller nå faktisk `logError`→Slack/e-post); siste mock-side i foreldreportalen (`/forelder/coach`) koblet til ekte data (10/11 forelder-ruter nå bekreftet ekte); I8-klikkrevisjonen utvidet fra 10 til 23 av 261 skjermer (2 nye dødlenker funnet og rettet: Kalender «Be om økt», AgencyOS «Ny booking»); Workbench (spiller + coach) migrert fra native HTML5 drag-and-drop til `@dnd-kit` — touch/iPad skal nå fungere (venter på Anders' egen enhetstest, se PR #32); fire skjermer portet fra Claude Design til produksjon (AgencyOS TrackMan + Audit-log, PlayerHQ Coach·Ny melding + Coach·Nytt spørsmål, sistnevnte to fant og fikset 2 til døde knapper på veien); **MASTER-SKJERMPLAN.md verifisert og rettet mot faktisk kode** (flere skjermer var alt ferdige uten at dokumentet fulgte med); **D1 (live/skjult) avklart og utført** — kun 2 av de 16 opprinnelige kandidatene hadde fortsatt et ekte demo-varsel (AgencyOS Live/Mission Control, PlayerHQ Talent), begge nå fjernet fra menyen; nytt funn: `/portal/ny-okt` har INGEN ekte database-lagring (kun midlertidig nettleser-state) — Anders har bedt om at dette bygges som ekte funksjon, egen jobb, ikke startet ennå.

## I arbeid / delvis
- **Resterende skjermer — tallet «~60» var feil.** Fersk revisjon av det levende Claude Design-prosjektet (natt til 15. juli, `DEKNINGSKART.md`+`SKJERMPLAN-GJENSTAENDE.md` lest direkte) fant at det reelle design-gapet er MYE mindre: av 387 skjermer er nesten alle enten allerede designet eller «dekket via system» (kan bygges direkte av eksisterende komponenter, ingen ny mockup nødvendig). Gjenstår som EKTE nye designoppgaver: 3 PlayerHQ-skjermer (live-tapper, break-tabell, putte-laboratoriet) + en aldri-gjort triage av Marketing (P2/P3, ~59 skjermer) og resten av Auth. Fortsettelses-prompt til Claude Design er skrevet og levert til Anders, men ikke limt inn ennå.
- **Klikk-testing dekker nå 23 av 261 nåbare skjermer** (utvidet natt til 15. juli, I8 bølge 3 — se PR #30). De resterende ~238 er kun sjekket for døde lenker (adresser), ikke for knapper/skjema som ikke gjør noe.
- **Foreldreportal (`/forelder`):** 10 av 11 ruter bekreftet ekte data. Siste mock (`/forelder/coach`) fikset natt til 15. juli (PR #31).
- **AgencyOS-porting til v2 pågår, bølge for bølge:** 6 skjermer portet i natt (Talent-familien var alt ferdig fra før; TrackMan og Audit-log nye; PlayerHQ-siden fikk Coach·Ny melding + Coach·Nytt spørsmål). AgencyOS-sporet er nå tømt for trygge kandidater uten ny design — videre porting venter på Claude Design-fortsettelsen over. PlayerHQ wizard-familien har 7 gjenstående kandidater som IKKE kan porte 1:1 (design matcher ikke faktisk funksjon — se `docs/AAPNE-SPORSMAAL.md`).
- **`/portal/ny-okt` mangler ekte lagring** — kun midlertidig nettleser-state, ingen Prisma-persistering. Anders har bedt om at dette bygges som ekte funksjon (2026-07-15). Ikke startet.
- **Kjent regresjon (forenklingsplan 13. juni):** ~~spiller kan ikke starte «dagens økt»~~ **LØST 2026-06-25** — Start økt lenker nå til `/portal/live/…` (V2 + plan-økter fra Workbench i Gjennomføre). Mobil-nav i AgencyOS er ennå ikke samlet med desktop-nav.

## Blokkert — P0 før ekte/betalende brukere
Detaljert status: listen under. Betaling åpner **1. august** — koden gir bevisst gratis tilgang til alle frem til da (`gratisForAlle()` i `src/lib/feature-flags.ts`, `BETALING_STARTER = 2026-08-01`, bekreftet fortsatt aktivt 14. juli).

### Nytt, verifisert direkte mot databasen 2026-07-14 — det største hullet
- **31 spillere registrert, 0 har noensinne logget inn.** (`User.lastLoginAt` er `null` for alle 31 PLAYER-rader.) Ingen kan bruke appen før de faktisk kommer inn — dette er trolig det ENESTE som virkelig hindrer lansering i praksis, uavhengig av kode. Krever: velkomst-e-post/aktiveringsflyt til de 31, og at Resend-leveransen (se under) faktisk fungerer så e-posten kommer frem.
- **0 push-varsel-abonnement registrert.** Ingen har fått spørsmålet om varsler ennå (motoren er bygget, ingen har samtykket).
- 31 aktive `Subscription`-rader, 18 spillere med PRO-tier — stemmer med at alle er gratis-PRO frem til 1. august, ikke et avvik.

### Løst i kode — trenger kun bekreftelse
1. ~~**Abonnements-/gratis-logikk**~~ — **LØST.** `resolveTier()` i `src/lib/feature-flags.ts` implementerer alle fire gratis-veiene (lanserings-vindu, coaching-pakke, gruppemedlemskap, 30-dagers prøveperiode). Dekket av tester. Gammel påstand «ingen kode setter PRO» er utdatert.
2. ~~**PRO-for-alle-kampanjen «kald»**~~ — **IKKE ET PROBLEM.** `gratisForAlle()` gir alle PRO frem til `BETALING_STARTER` (1. august). Ingen «kald vegg» før da. (Dato bekreftet til 1. august av Anders 2026-06-24.)
4. ~~**Soft-slettet konto kan fortsatt logge inn**~~ — **LØST.** `getCurrentUser.ts:23` returnerer `null` når `deletedAt` er satt.

### Gjenstår (kode)
5. ~~**Dataeksport: eksport-stub forvirrende**~~ — **LØST.** `/portal/meg/innstillinger/eksport/page.tsx` redirecter nå til personvern-siden (ekte `exportUserData`-flyt). Ingen «kommer snart»-stub igjen. *(verifisert 2026-06-28)*

### Krever Anders (panel/DNS/beslutning)
3. **Live Stripe-nøkler** — verifiser at `.env.local` har TEST-nøkler, live kun i Vercel. *(Stripe + Vercel-panel)* — ikke re-verifisert denne økten (miljøfil-tilgang blokkert av sikkerhetsgrunner).
6. **E-postleveranse** — Resend SPF/DKIM for akgolf.no ikke verifisert; signup/reset kan havne i spam. *(DNS + Resend-panel)*
7. **`akgolf.no` peker IKKE til appen i det hele tatt** — **nytt funn 2026-07-06**: domenet redirecter 100 % til `https://akgolfgroup.as.me/` (Acuity) på DNS-/registrar-nivå, før Vercel/Next.js ser forespørselen (`vercel domains inspect akgolf.no` bekrefter domenet ikke er tilknyttet dette Vercel-prosjektet). Konsistent med at Booking bevisst går via Acuity midlertidig — men betyr at `NEXT_PUBLIC_APP_URL`-verdien i prod ikke kan bekreftes fra utsiden, og at noen må aktivt peke `akgolf.no` til Vercel-prosjektet når dere er klare til å gå live på eget domene. *(DNS/registrar-panel)*
8. ~~**Deploy-rutinen uavklart**~~ — **AVKLART 2026-07-05.** Deploy er nå eksplisitt manuelt: en tidligere lokal shell-funksjon som auto-deployet til prod på hver `git push` er deaktivert, og GitHub Actions-workflowen (`deploy.yml`) er endret fra automatisk push-trigger til `workflow_dispatch` (manuell trigger fra Actions-fanen eller `gh workflow run`). Push til main deployer ikke lenger noe sted automatisk.
9. **Spiller-aktivering** — 31 spillere, 0 innlogginger (verifisert 2026-07-14, se over). Trenger en aktiverings-e-post-flyt sendt av deg + at punkt 6 (Resend) er ordnet først, ellers havner e-posten aldri frem. *(din utsendelse + Resend-panel)*
10. ~~**Live/skjult-beslutning ikke tatt**~~ — **LØST 2026-07-15.** Fersk revisjon fant at kun 2 av de 11 opprinnelige kandidatene fortsatt hadde et ekte demo-varsel (Økonomi/Caddie-AI/«Ny spiller» var alt blitt ekte data siden 14. juli). Live/Mission Control og PlayerHQ Talent fjernet fra menyen (PR #37, ikke merget ennå).

## Verifisert vs. antatt
- **Verifisert** mot fil/kode/database denne økten (2026-07-14): spiller-/push-tall (direkte database-spørring), at Innboks/Godkjenninger/Økonomi/Analytics bruker ekte data, at betalings-vinduet (1. august) fortsatt er aktivt i koden.
- **Verifisert mot fil/kode tidligere økt (17. juni):** P0-lista for øvrig, SG-kalibrering, deploy-fakta, dokument-hierarkiet, skjermtall fra MASTER-SKJERMPLAN.
- **Antatt / ikke re-verifisert her:** Stripe-nøkkelstatus og Resend-DNS-status (krever paneltilgang jeg ikke har i denne økten), eksakt ferdig-prosent per resterende skjerm (følg MASTER-SKJERMPLAN), nøyaktig datakvalitet i foreldreportal.
