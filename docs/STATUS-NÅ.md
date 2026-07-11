# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-07-10 (v2 MERGET til main + live i prod · Workbench-flytpakke + stats-pakke levert · baneguide-design pågår — full funksjons-/planliste: `docs/funksjoner-og-plan-2026-07-10.md`)

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
Appen er **deployet og kjører** på `akgolf-hq.vercel.app`. Kjernen (PlayerHQ + AgencyOS) er bygget og i stor grad portet fra designfasiten. **Den er IKKE klar for betalende/ekte brukere ennå** — 1 av 8 opprinnelige P0-punkter avklart denne økten (deploy-rutine), 6 gjenstår (se nederst), pluss et nytt funn (akgolf.no peker ikke til appen). Betaling starter etter plan **1. august** (flyttet fra 1. juli av Anders 2026-06-24). Booking går midlertidig via **Acuity** (`akgolfgroup.as.me`) til den innebygde HQ-bookingen lanseres.

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

## I arbeid / delvis
- **Resterende skjermer:** ~60 skjermer uten ferdig design var i Claude Design-pipeline (Spor A/C i MASTER-SKJERMPLAN). Status per skjerm: se planen.
- **Delvis mock i AgencyOS:** godkjenninger, økonomi/finance, innboks/meldinger, analytics — bygget UI, ikke full datakobling.
- **Foreldreportal (`/forelder`):** bygget (11 ruter), datakvalitet ikke fullverifisert.
- **Kjent regresjon (forenklingsplan 13. juni):** ~~spiller kan ikke starte «dagens økt»~~ **LØST 2026-06-25** — Start økt lenker nå til `/portal/live/…` (V2 + plan-økter fra Workbench i Gjennomføre). Mobil-nav i AgencyOS er ennå ikke samlet med desktop-nav.

## Blokkert — P0 før ekte/betalende brukere
Detaljert status: listen under (re-verifisert mot kode 17. juni). Betaling åpner **1. august** — koden gir bevisst gratis tilgang til alle frem til da (`gratisForAlle()` i `src/lib/feature-flags.ts`).

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

## Verifisert vs. antatt
- **Verifisert** mot fil/kode denne økten: P0-lista, SG-kalibrering, deploy-fakta, dokument-hierarkiet, skjermtall fra MASTER-SKJERMPLAN.
- **Antatt / ikke re-verifisert her:** eksakt ferdig-prosent per resterende skjerm (følg MASTER-SKJERMPLAN), nøyaktig datakvalitet i foreldreportal og AgencyOS-mock-flater.
