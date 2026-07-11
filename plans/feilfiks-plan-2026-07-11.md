# Feilfiks-plan — komplett gjennomgang 11. juli 2026

**Kilde:** Full review av redesign/v2 med 6 parallelle granskere (sikkerhet, forretningslogikk,
PlayerHQ, AgencyOS, marketing/auth/forelder, regel-konsistens) + mekaniske sjekker.
**Baseline (alt grønt før fiksing):** tsc 0 feil · eslint 0 feil · build OK · 362/362 enhetstester OK.
**npm audit:** 3 high + 8 moderate sårbarheter i avhengigheter (fix tilgjengelig).

Regel for gjennomføring: én bølge om gangen, verifiser (tsc + lint + relevante tester + i
nettleser der det er UI) og commit per bølge. Ingen bølge er ferdig uten verifikasjonsbevis.

---

## Bølge 1 — P0: Inntekt og kundekommunikasjon (kritisk)

### 1.1 Døde kjøps-CTA-er på markedssidene
- `src/components/marketing/v2/MarkedPriserV2.tsx:120-126,192,212` — lokal `MCta` er ren `<span>`
  uten href/onClick. «Kom i gang gratis» og «Velg Pro» gjør ingenting.
- Samme mønster: `MarkedCoachingV2.tsx:120-126,217,238,256` («Book en samtale») og
  `MarkedPlayerHQV2.tsx:130-136,264,286,287` («Prøv gratis i én måned», «Se priser»).
- **Fiks:** bruk delt `MCta` fra `marked-ramme.tsx` (som har href) eller legg href-prop på de
  lokale kopiene. Koble til `/auth/signup`, `/booking`, `/priser`.
- **Verifiser:** klikk hver CTA i nettleser (mobil + desktop) → riktig destinasjon.

### 1.2 Stripe-kjøpsknapp er aldri montert
- `src/components/marketing/subscribe-button.tsx` (eneste vei til `/api/stripe/checkout`) brukes
  0 steder. «Velg Pro»-kjøp kan ikke gjennomføres.
- **Fiks:** monter `<SubscribeButton plan="pro">` på `/priser` (og ev. relevant portal-side) for
  innloggede; utloggede sendes til signup med retur.
- **Verifiser:** klikk → Stripe Checkout-side åpnes (testmodus).

### 1.3 Innboks lyver om «Sendt» ved feilet e-postsending
- `src/lib/innboks/actions.ts:100-140` — `sendGodkjentSvar` setter `status: "SENDT"` +
  `sendtAt` selv når Resend-kallet feiler eller API-nøkkel mangler. Knappen låses
  (`InnboksEpostV2.tsx:148`) så coachen kan ikke prøve igjen. Kundesvar forsvinner stille.
- **Fiks:** `status: sendtReelt ? "SENDT" : "UTKAST_KLART"` (behold utkast, sett ikke sendtAt),
  la knappen være aktiv ved feil, vis meldingen tydelig.
- **Verifiser:** enhetstest for begge utfall + manuell test uten RESEND_API_KEY.

---

## Bølge 2 — P1: Coach-arbeidsflyt lagrer/viser feil (AgencyOS)

### 2.1 «Merk fullført» i Handlingssenter lagrer ikke
- `src/components/admin/v2/AdminHandlingssenterV2.tsx:217-219` — kun lokal state, ingen
  server-action. Reload → oppgaven er «uferdig» igjen.
- **Fiks:** ny server-action som oppdaterer `OppgaveCache`, kall + `router.refresh()`.

### 2.2 «Mine»-filteret viser utildelte oppgaver
- Samme fil `:200,206` — matcher `o.spiller === "Alle"` (fallback for UTILDELTE), ikke
  innlogget coach. **Fiks:** send coach-navn/id som prop fra `handlingssenter/page.tsx` og
  sammenlign mot faktisk tildeling.

### 2.3 Fire-and-forget-mutasjoner uten feil-UI
- `AdminBookingerV2.tsx:119-146` (bekreft/avvis enkelt + masse) og `InnboksEpostV2.tsx:113-117`
  (arkiver) — feil svelges, coachen får ingen tilbakemelding, ingen `router.refresh()`.
- **Fiks:** try/catch + feilmelding + refresh. Mal: `AdminGodkjenningerV2.tsx:91,104-105`.

### 2.4 Død «Ny oppgave»-knapp
- `AdminHandlingssenterV2.tsx:233` — CTAPill uten onClick. **Fiks:** koble eller fjern til den
  er klar (ingen dekorative knapper i prod).

---

## Bølge 3 — P1: Spillerflater viser/lagrer feil (PlayerHQ)

### 3.1 Live-økt: stille datatap ved nettfeil
- `src/components/portal/v2/LiveOktV2.tsx:412-448` — feil fra `completeDrill` fanges med
  console.error; drill markeres «done» og `completeSession` kalles likevel. Reps på range
  forsvinner uten at spilleren ser det.
- **Fiks:** ved feil: ikke marker done, ikke fullfør økt; vis feil + la spilleren prøve igjen
  (mønster: `feil`-state i `WorkbenchV2Sheets.tsx`).

### 3.2 Hardkodet «Øyvind Rohjan» for alle brukere
- `src/components/portal/v2/DataGolfV2.tsx:200,309` — demo-navn i overskrift som ren streng.
  **Fiks:** `spillerNavn`-prop fra `datagolf/page.tsx` (mønster: HjemV2/GjorV2).

### 3.3 Signup selger coaching-pakker som app-abonnement (kanon-brudd)
- `src/components/portal/v2/SignupV2.tsx:53-77,608-621` (+ gammel `signup-form.tsx:17-51,88-102`)
  — PakkeVelger viser Performance/Performance Pro med pris som om det var abonnement; valget
  lagres i metadata som ingen leser, tier blir uansett GRATIS. Bruker tror hen har kjøpt noe.
- **Fiks:** fjern PakkeVelger fra signup (kun rolle + kontaktinfo). Coaching-pakker bestilles
  separat (som `MarkedPriserV2` sin hjelpetekst allerede sier).

---

## Bølge 4 — P1: Plan-motor og tallfeil (forretningslogikk)

### 4.1 Dagens turnering forsvinner etter midnatt UTC
- `src/lib/plan-engine/load-signals.ts:35,61-63` — `gte: now` mot dato-uten-klokkeslett;
  på turneringsdagen etter kl. 00 UTC utløses aldri taper-regelen (kutt FYS ≤7 dager).
- Samme mønster duplisert i: `load-workbench.ts:279`, `plan-revision.ts:198-199`,
  `daily-brief.ts:251-252`, `week-suggest.ts:109-110`, `plan-builder/index.ts:202-203`
  (+ sjekk turnering-agent).
- **Fiks:** én delt helper `startAvDagOslo(now)` og bytt alle 7 stedene. Enhetstest med
  turnering «i dag» kl. 13 norsk tid.

### 4.2 Delvis SG-input vrir treningsfokus mot feil område
- `src/lib/workbench/sg-gap.ts:48-60` — manuell input med kun én kategori utfylt brukes
  eksklusivt; svakeste reelle område (fra runder) ignoreres, og `adapt-template` vrir økter feil.
- **Fiks:** bruk input-raden kun når alle 4 kategorier er utfylt; ellers suppler fra runde-snitt.
  Enhetstest for delvis rad.

---

## Bølge 5 — P1: Sikkerhetsherding (feller, ikke aktive hull)

### 5.1 `loadLiveSession` stoler på innsendt `isCoach`
- `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts:164` — auth/rolle må utledes internt
  (kall `requireConsentingUser()` som søsterfunksjonen `verifyAccess`), ikke tas som parameter.

### 5.2 Analyse-actions tar rå `userId` uten intern guard
- `src/app/portal/analysere/actions.ts:160-556` — 9 eksporterte «use server»-funksjoner.
  Trygt i dag (kun Server Component-kallere), men én fremtidig klient-import = IDOR på all
  spillerdata. **Fiks:** intern guard i hver funksjon (spilleren selv eller COACH/ADMIN).

### 5.3 Slett usikret, ubrukt mlegacy-booking-kode
- `src/app/(marketing)/(mlegacy)/booking/actions.ts:35-189` — `cancelBooking`/`rescheduleBooking`
  uten auth/eierskap (kan refundere fremmed booking hvis noen kobler dem). Ubrukt i dag.
  **Fiks:** slett funksjonene; behold kun `createBookingCheckout`.

### 5.4 Avhengighets-sårbarheter
- `npm audit`: high i hono, undici, ws (+ 8 moderate). Alle har fix.
- **Fiks:** `npm audit fix` (uten --force), deretter full verifikasjon (tsc/build/tester).
  NB: versjons-policy sier ikke oppgrader uten beslutning — kjøres som egen commit så den
  kan rulles tilbake, og hoved-versjoner røres ikke.

---

## Bølge 6 — P2: Småfeil og polish (samlet opprydding)

1. Døde footer-lenker på alle markedssider — `marked-ramme.tsx:127-133` (+ duplikat i
   `MarkedPriserV2.tsx:84-88`): gjør om til ekte lenker (/coaching, /playerhq, /priser,
   /booking, /personvern).
2. Signup mister `next`-param (dyp lenke → mister destinasjon) — legg til som i login.
3. `window.confirm` ved oppsigelse — `abonnement/avbestill/avbestill-buttons.tsx:13`:
   bytt til appens bekreft-modal (mønster: BekreftOverlay i LiveOktV2).
4. `setTimeout` uten cleanup — `MegHelseV2.tsx:213`, `MegUtstyrsbagV2.tsx:224`.
5. Workbench `valgtId` følger ikke back/forward — `WorkbenchV2.tsx:429`: les searchParams i effekt.
6. Stille avkutting ved 400 spillere / 200 oppgaver — `stallen-data.ts:272`,
   `workbench/page.tsx:55-61`, `handlingssenter/page.tsx:91`: vis «viser N av X» eller paginer.
7. Caddie `persistToolMessage` uten samtale-eierskapssjekk — `api/caddie/approve/route.ts:112-131`.
8. Ordbok-brudd: `"KORTSPILL"` → `"NÆRSPILL"` — `src/app/onboard/coach/coach-wizard.tsx:49`.
9. Stale «CoachHQ» i 7 kode-kommentarer (translate-taxonomy, benchmark-sync, approval-executor,
   globals.css, shared/index, admin/search, oauth-callback) — ren tekstrydding.
10. Skjørheter i plan-motor: `adapt-template.ts:174-181` (tom join-fallback),
    `map-template-week.ts:77-87` (klokkeslett kan passere 24), `okt-detalj-data.ts:208`
    (unødvendig cast fjernes).

---

## Avklaringer som trenger Anders (IKKE fiks uten svar)

- **A1:** Skal coach-avlyst økt (CANCELLED) telle som avvik i spillerens plan-etterlevelse?
  (`compliance.ts:25-29` — i dag ja; kan straffe spilleren for sykdom/vær.)
- **A2:** Signup uten pakkevalg (bølge 3.3) — bekreft at dette er ønsket flyt før fjerning.
- **A3:** Uferdige TODO-flyter: klubb-onboarding lagrer ikke klubbdata
  (`onboard/klubb/actions.ts:88`), Stripe Connect mangler (`klubb-wizard.tsx:675`),
  push-varsler ikke implementert (`push.ts:67`), ukeprogresjon teller tester som 0
  (`get-week-progress.ts:104`). Skal disse bygges ferdig, skjules, eller vente?
- **A4:** Sekundære demo-navn i roster/leaderboard-lister (Emma Berg, Jonas Lie m.fl.) —
  trolig tilsiktet «flere spillere»-design; bekreft eller gi ny navneliste.
- **A5:** `npm audit fix` innebærer små versjonsbump i avhengigheter — OK?

## Verifikasjon per bølge (fast)
```bash
npx prisma validate && npx tsc --noEmit && npm run lint && npm test && npm run build
```
+ nettleser-verifikasjon (375px + desktop) for alle UI-endringer, og e2e der flyten er dekket.

## Nye varige regler (legges i CLAUDE.md/gotchas når bølgene er ferdig)
- Server actions skal aldri ta `userId`/`isCoach` som rå parameter — auth utledes alltid internt.
- Turneringsdato-filtre: aldri `gte: now` rått — bruk delt start-av-dag-helper (Oslo).
- Mutasjoner fra `useTransition`: alltid try/catch + feil-UI + `router.refresh()`.
- Lokale kopier av delte komponenter (MCta-mønsteret) skal beholde interaktivitet — sjekk
  prop-signatur mot kanonisk versjon før commit.
