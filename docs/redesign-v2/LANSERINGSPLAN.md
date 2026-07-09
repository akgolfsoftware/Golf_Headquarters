# LANSERINGSPLAN — AK Golf HQ v2 til beta (autoritativ)

Skrevet 10. juli 2026. Dette er den ENE planen fra ferdig design til beta med ekte brukere.
Detaljer: `byggeplan.md` (kode), `beta-readiness.md` (gap), `neste-steg-fase6.md` (spor).
Utgangspunkt: **designet er ferdig** (20 skjermer + Workbench, dommer ≥9). **Appen kjører
allerede** på `akgolf-hq.vercel.app` med gammelt design — v2 er en ny drakt oppå en app som virker.

Legende: **[JEG]** = jeg koder autonomt · **[DU]** = kun Anders (DNS/paneler/beslutning/invitasjoner).

---

## VALGT STRATEGI (Anders 10. juli): LANSER BETA I DAG på dagens app → rull v2 inn løpende

Appen kjører allerede (`akgolf-hq.vercel.app`) med ~400 bygde ruter (gammelt design). Vi
lanserer beta på DEN i dag, og ruller v2-designet inn bølge for bølge etterpå, styrt av en
strukturert endrings-backlog. v2-antallet skjermer er IKKE en blokker for lansering i dag.

### DEL 1 — LANSER I DAG (beta på dagens app)
**[JEG] i dag:**
- **Røyktest** alle kjerneflyter ende-til-ende mot prod/lokalt: signup → onboarding → plan →
  økt → analyse; coach: planlegg → publiser → spiller godtar. List kritiske 500/feil.
- **Feedback-kanal:** enkel in-app «Meld feil/ønske»-lenke (→ e-post/Notion) på alle flater.
- **Beta-data:** IKKE slett demo før du bekrefter — verifiser at beta-puljen har det de trenger
  (egne spillere/coacher opprettet, tjenester/baner for booking). Seed kun det som mangler.
- **Deploy-klargjøring:** verifiser build grønt, `vercel deploy --prod` klar (manuell trigger).
**[DU] i dag (det bare du kan — kortest vei til brukere):**
- **Beta-pulje:** velg en liten kjent gruppe (dine egne spillere + coacher). Opprett/inviter dem.
- **Adresse:** bruk `akgolf-hq.vercel.app` for beta NÅ (domene/e-post kan vente — se under).
- **Booking:** Acuity funker allerede (`akgolfgroup.as.me`) — bruk den til innebygd er klar.
- **E-post/domene:** trengs først når beta åpnes for ukjente/selvregistrering. For en kjent
  intern pulje du inviterer manuelt kan det vente. Sett i gang SPF/DKIM parallelt.
**Milepæl M0: BETA LIVE i dag** for en kjent pulje på vercel-URL, feedback-kanal på plass.

### RØYKTEST 10. juli — BESTÅTT (begge sider lanseringsklare)
Testet mot kjørende app, ekte innlogging spiller (`screentest`) + coach (`coachtest`):
- **Spiller:** Hjem/Plan/Gjør/Analysere/Meg/Mål/Booking/Teknisk-plan — alle 200, innhold, 0 feil.
- **Coach:** Cockpit/Spillere/Workbench/Kalender/Bookinger/Varsler/Tester/Grupper — alle 200, 0 feil.
- **Ingen kritiske blokkere.** «unsafe-eval»-konsollfeil = dev-artefakt (borte i prod).

### HURTIG-FIKS-BACKLOG (ikke-blokkere — fiks før eller rett etter lansering)
1. **[DU-beslutning]** Post-login lander alle på `/portal` (coach må klikke til `/admin`).
   Bevisst i dag (coach kan òg være spiller). Skal coach/admin rutes rett til `/admin/agencyos`?
   → hvis ja, 5-min fiks i `login-form.tsx` (mønsteret finnes i `samtykke-venter/page.tsx`).
2. **[JEG]** Kosmetisk konsoll-pageerror på cockpit (`AdminHubRedirect` performance.measure
   negativ timestamp, `src/app/admin/page.tsx`) — ufarlig, ryddes.
3. `/portal/gjennomfore` + `/admin/kalender`+`/admin/grupper` tynne (tom-tilstand/mock) — verifiser tilsiktet.

### DEL 2 — Strukturert endringsplan (etter lansering)
- **Feedback-backlog:** all beta-tilbakemelding samles ett sted (Notion/issues), trieres
  ukentlig i tre bøtter: (a) hurtig-fiks (samme dag), (b) v2-bølge (planlagt), (c) senere/vurder.
- **v2-utrulling bølge for bølge** UNDER beta (rekkefølge under), preview per bølge → [DU] ok → deploy.
- **Ukentlig rytme:** samle feedback → prioriter → bygg (hurtig-fiks + neste v2-bølge) → deploy → gjenta.

---

## v2-UTRULLING (Del 2 — ruller inn under beta, ikke blokker for lansering)
- **[DU]** Godkjenn v2-designet (rekkefølgen under starter da).

## FASE 1 — Fundament [JEG] (1 økt, ingen synlig endring)
- Branch `redesign/v2`. Golden masters (fasit-bilder). Port v2-tokens (`src/styles/v2-tokens.css`
  + `src/lib/v2/tokens.ts`) og alle komponenter til `src/components/v2/` (TypeScript, 1:1).
- «?»-hjelpetekster ett sted. Konsistens-vakt inn i `npm run verify`.
- Grønt: prisma/tsc/build. **Milepæl M1: fundament grønt.**

## FASE 2 — Bygg kjerne-flatene i v2 [JEG] (bølge for bølge, Vercel-preview per bølge → [DU] godkjenner)
- **Bølge 1 — PlayerHQ:** Hjem · Plan · Gjør/Live · Analysere (5 faner, TrackMan per kølle) ·
  Meg · Kalender · Økt. **Milepæl M2: spilleren har hele appen i v2.**
- **Bølge 2 — Workbench (+ de to du krevde):** tidslinje-kalender, palett, Balanse-panel, DnD,
  gjentakelse, publiser · **fysisk logging** (vekt×reps/tonnasje/pulssoner) · **utviklings-
  plan-merge** (talent + P1–P10 til én plan). **Milepæl M3: coach planlegger i v2, spiller logger fysisk.**
- **Bølge 3 — AgencyOS-kjerne:** Cockpit · Stall · Triage · Kalender (serier) · Grupper
  (egentrening). **Milepæl M4: coach-hverdagen i v2.**
Hver bølge: 1:1 fra mockup, ekte data, «?»+ordbok, verify+tester grønt, skjermbilde-diff ≈ 0,
designdom ≥9, MASTER-SKJERMPLAN oppdatert. **← Beta-minimum er nådd etter M4 + Fase 3–4.**

## FASE 3 — Datamodell-tillegg [JEG] (additivt, parallelt m/ Fase 2)
- `Milestone` (utviklingsplan-merge) · fysisk-logging-felter på `FysOvelseRad` + økt-total ·
  ferdigstill innebygd booking (HQ har den alt — ikke flytt akgolf-booking inn).
- Alle via `CREATE TABLE/ADD COLUMN IF NOT EXISTS` i tsx mot DIRECT_URL → `prisma generate`.
  ALDRI migrate dev/db push. Zod på JSON. **Milepæl M5: data-laget klart for de nye funksjonene.**

## FASE 4 — Funksjonell beta-klargjøring (blandet)
**[JEG]:**
- Datakoble AgencyOS-mock-flater beta faktisk treffer (godkjenninger/innboks der relevant).
- Verifiser foreldreportal-datakvalitet. Rydde demo-data → seed ekte beta-grunndata (baner,
  tjenester, grupper, coach-profiler). Enkel feedback-kanal (in-app lenke → Notion/e-post).
- Røyktest ALLE kjerneflyter ende-til-ende: signup → onboarding → plan → økt → analyse;
  coach: planlegg → publiser → spiller godtar. Null 500 på hovedveiene.
**[DU] (kun du kan):**
- **E-post:** sett opp Resend SPF/DKIM for domenet (ellers havner signup/reset i spam). *Blokker.*
- **Domene:** pek `app.akgolf.no` (eller behold `akgolf-hq.vercel.app`) til Vercel-prosjektet.
- **Booking:** bestem Acuity midlertidig vs. innebygd HQ-booking til beta.
- **Beta-brukere:** velg og invitér første pulje (spillere + coacher).
- **Stripe:** ikke en beta-blokker (gratis for alle til 1. aug) — bare bekreft live-nøkler i Vercel før betaling åpner.
**Milepæl M6: e-post virker, domene peker, beta-data seedet, alle flyter røyktestet.**

## FASE 5 — Beta-lansering
- **[JEG]** Deploy til prod (`vercel deploy --prod`), røyktest på prod, sjekk feilrapportering.
- **[DU]** Slipp inn beta-brukerne. **Milepæl M7: BETA LIVE.**
- **[JEG]** Under beta: rull resterende v2-bølger ut (øvelsesbank/booking-UI/DataGolf/tester/
  marketing), fiks feil fra beta-feedback fortløpende, bølge for bølge til main + deploy.

## FASE 6 — Etter beta (senere, ikke nå)
- Betaling åpner **1. august** (Stripe live, `gratisForAlle()` slutter).
- **AI-golf-coach** (agent-ekspertene + video-analyse) — bygges på lærdom fra ekte bruk.

---

## Kritisk sti (kortest vei til beta)
FASE 0 (godkjenn) → M1 fundament → **Bølge 1+2+3** (PlayerHQ + Workbench + AgencyOS-kjerne)
→ M5 data-tillegg → **[DU] e-post + domene + beta-brukere** → M6 klargjøring → **M7 BETA LIVE**.
Alt annet (øvelsesbank-UI, marketing, betaling, AI-coach) ruller etter beta er live.

## Det bare DU trenger å gjøre (samlet — start disse når som helst)
1. Godkjenn designet.
2. Resend SPF/DKIM for e-post.
3. Domene → Vercel (eller bruk vercel-URL for beta).
4. Beslutt booking (Acuity vs innebygd).
5. Velg + invitér beta-brukere.
Resten er koding jeg kjører autonomt, bølge for bølge, med preview til deg per bølge.
