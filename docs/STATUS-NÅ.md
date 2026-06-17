# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg. Detaljert skjermstatus bor i `docs/MASTER-SKJERMPLAN.md`; låste regler i `docs/platform/BUSINESS-RULES.md`; uavklarte beslutninger i `docs/AAPNE-SPORSMAAL.md`.

**Sist oppdatert:** 2026-06-17

---

## Kort sagt
Appen er **deployet og kjører** på `akgolf-hq.vercel.app`. Kjernen (PlayerHQ + AgencyOS) er bygget og i stor grad portet fra designfasiten. **Den er IKKE klar for betalende/ekte brukere ennå** — det står 8 P0-blokkerere igjen (se nederst). Betaling starter etter plan **1. juli**. Booking går midlertidig via **Acuity** (`akgolfgroup.as.me`) til den innebygde HQ-bookingen lanseres.

## Ferdig / solid (verifisert)
- **Deployet live:** prod på `akgolf-hq.vercel.app`. (NB: push til `main` deployer IKKE automatisk — kjør `vercel deploy --prod`.)
- **PlayerHQ – 5 hovedskjermer:** mobil-paritet 0 avvik mot fasit (Hjem, Planlegge, Gjennomføre, Analysere, Meg).
- **PlayerHQ – datatilkobling:** 8 prioriterte skjermer koblet til ekte Prisma-data (SG-Hub, Runder, TrackMan, Statistikk, Booking-hub+ny, Drills, Workbench-sheets, Live-summary).
- **AgencyOS:** Fase 3 desktop (~26 nav-skjermer) på paritet + Fase 4 mobil (M1–M3) flettet inn.
- **SG-motor:** alle 4 kategorier kalibrert (Broadie OTT/APP/ARG + Team Norway IUP PUTT), 168/168 tester grønne.
- **Benchmark-autosync:** DataGolf-fasiter auto-oppdateres mandager 08:00, godkjenning på `/admin/tester/benchmarks`.
- **Testbatteriet ende-til-ende (15. juni, deployet):** server-side scoring-motor (riktig formel per test, PEI=nærhet÷lengde) · fullskjerm scorekort · korrekt progresjon for alle 30 tester · ekte coach-analyse + benchmark-nivåer + FYS-gate + coach-notater · `TestAssignment`-modell (prod-migrasjon kjørt) m/ coach↔spiller-tildeling + varsling · forbedrings-loop (svakeste→drill via `loadWeaknessSignals`). Verifisert: 193/193 lib-tester, tsc, build, røyk-sjekk. Gjenstår: e2e-nettlesertest av 3 coach-test-skjermer (Funker-haken `~`).
- **Dokumentasjon ryddet (2026-06-14):** én kanon-inngang (`docs/platform/AGENT-BRIEF.md`), utdatert `PLATFORM.md` arkivert, konsept-ordbok flettet, døde brancher slettet.

## I arbeid / delvis
- **Resterende skjermer:** ~60 skjermer uten ferdig design var i Claude Design-pipeline (Spor A/C i MASTER-SKJERMPLAN). Status per skjerm: se planen.
- **Delvis mock i AgencyOS:** godkjenninger, økonomi/finance, innboks/meldinger, analytics — bygget UI, ikke full datakobling.
- **Foreldreportal (`/forelder`):** bygget (11 ruter), datakvalitet ikke fullverifisert.
- **Kjent regresjon (forenklingsplan 13. juni):** spiller kan ikke starte «dagens økt» (knapp fører til read-only side). Mobil-nav i AgencyOS er ennå ikke samlet med desktop-nav.

## Blokkert — P0 før ekte/betalende brukere
Kilde og detaljert status: `docs/redesign-2026-06/P0-status.md` (re-verifisert mot kode 17. juni). Betaling åpner **1. juli** — koden gir bevisst gratis tilgang til alle frem til da (`gratisForAlle()` i `src/lib/feature-flags.ts`).

### Løst i kode — trenger kun bekreftelse
1. ~~**Abonnements-/gratis-logikk**~~ — **LØST.** `resolveTier()` i `src/lib/feature-flags.ts` implementerer alle fire gratis-veiene (lanserings-vindu, coaching-pakke, gruppemedlemskap, 30-dagers prøveperiode). Dekket av tester. Gammel påstand «ingen kode setter PRO» er utdatert.
2. ~~**PRO-for-alle-kampanjen «kald»**~~ — **IKKE ET PROBLEM.** `gratisForAlle()` gir alle PRO frem til `BETALING_STARTER` (1. juli). Ingen «kald vegg» før da. Bekreft kun at 1. juli-datoen er riktig.
4. ~~**Soft-slettet konto kan fortsatt logge inn**~~ — **LØST.** `getCurrentUser.ts:23` returnerer `null` når `deletedAt` er satt.

### Gjenstår (kode)
5. **Dataeksport: eksport-stub forvirrende** — GDPR-eksporten virker i `/portal/meg/innstillinger/personvern`, men den separate `/portal/meg/innstillinger/eksport` er en «kommer snart»-stub. Fix: redirect stub → personvern-siden. *(liten fiks, kan gjøres nå)*

### Krever Anders (panel/DNS/beslutning)
3. **Live Stripe-nøkler** — verifiser at `.env.local` har TEST-nøkler, live kun i Vercel. *(Stripe + Vercel-panel)*
6. **E-postleveranse** — Resend SPF/DKIM for akgolf.no ikke verifisert; signup/reset kan havne i spam. *(DNS + Resend-panel)*
7. **`NEXT_PUBLIC_APP_URL` feil i prod** — peker på Vercel-URL, ikke akgolf.no. *(Vercel-panel)*
8. **Deploy-rutinen uavklart** — push til main = ikke live; kun manuell `vercel deploy --prod`. *(beslutning)*

> Detaljer, kode-stier og anbefalt rekkefølge: `docs/redesign-2026-06/P0-status.md`.

## Verifisert vs. antatt
- **Verifisert** mot fil/kode denne økten: P0-lista, SG-kalibrering, deploy-fakta, dokument-hierarkiet, skjermtall fra MASTER-SKJERMPLAN.
- **Antatt / ikke re-verifisert her:** eksakt ferdig-prosent per resterende skjerm (følg MASTER-SKJERMPLAN), nøyaktig datakvalitet i foreldreportal og AgencyOS-mock-flater.
