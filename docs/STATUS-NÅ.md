# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg. Detaljert skjermstatus bor i `docs/MASTER-SKJERMPLAN.md`; låste regler i `docs/platform/BUSINESS-RULES.md`; uavklarte beslutninger i `docs/AAPNE-SPORSMAAL.md`.

**Sist oppdatert:** 2026-06-14

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
- **Dokumentasjon ryddet (2026-06-14):** én kanon-inngang (`docs/platform/AGENT-BRIEF.md`), utdatert `PLATFORM.md` arkivert, konsept-ordbok flettet, døde brancher slettet.

## I arbeid / delvis
- **Resterende skjermer:** ~60 skjermer uten ferdig design var i Claude Design-pipeline (Spor A/C i MASTER-SKJERMPLAN). Status per skjerm: se planen.
- **Delvis mock i AgencyOS:** godkjenninger, økonomi/finance, innboks/meldinger, analytics — bygget UI, ikke full datakobling.
- **Foreldreportal (`/forelder`):** bygget (11 ruter), datakvalitet ikke fullverifisert.
- **Kjent regresjon (forenklingsplan 13. juni):** spiller kan ikke starte «dagens økt» (knapp fører til read-only side). Mobil-nav i AgencyOS er ennå ikke samlet med desktop-nav.

## Blokkert — 8 P0 før ekte/betalende brukere
Kilde: `docs/restanse-review-2026-06-13.md`. Disse må lukkes før reelle brukere slippes inn:

1. **Abonnements-/gratis-logikk matcher ikke løftene** — ingen kode setter PRO fra prøveperiode / coaching-pakke / gruppe. *(kode)*
2. **PRO-for-alle-kampanjen utløp 1. juni** — gatene er nå «kalde» og live; kvalifiserte gratis-brukere kan møte oppgrader-vegg nå. *(kode + beslutning)*
3. **Live Stripe-nøkler ligger i `.env.local`** — verifiser at lokal dev bruker TEST-nøkler, live kun i Vercel. *(panel + kode)*
4. **Soft-slettet konto kan fortsatt logge inn** — `deletedAt` sjekkes ikke i auth. GDPR-eksponering. *(kode, liten fiks)*
5. **Dataeksport: én flate er placeholder** — kan se ut som GDPR-eksport mangler. *(kode, liten fiks)*
6. **E-postleveranse ikke verifisert** (Resend SPF/DKIM for akgolf.no) — ellers havner signup/reset i spam. *(panel/DNS)*
7. **`NEXT_PUBLIC_APP_URL` feil i prod** (peker på Vercel-URL, ikke akgolf.no). *(panel)*
8. **Deploy-rutinen uavklart** — push til main = ikke live; kun manuell `vercel deploy --prod`. *(beslutning)*

> P1/P2 og «hvem gjør hva» (kode vs. dine paneler): se `docs/restanse-review-2026-06-13.md`.

## Verifisert vs. antatt
- **Verifisert** mot fil/kode denne økten: P0-lista, SG-kalibrering, deploy-fakta, dokument-hierarkiet, skjermtall fra MASTER-SKJERMPLAN.
- **Antatt / ikke re-verifisert her:** eksakt ferdig-prosent per resterende skjerm (følg MASTER-SKJERMPLAN), nøyaktig datakvalitet i foreldreportal og AgencyOS-mock-flater.
