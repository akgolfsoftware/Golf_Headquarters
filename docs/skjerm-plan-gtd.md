# Skjerm-plan (GTD) — ferdigstille design på gjenstående skjermer

> Generert 15. juni 2026 fra `docs/MASTER-SKJERMPLAN.md`. GTD-strukturert (prosjekter → neste
> handlinger → kontekster → sekvens). **IKKE lanseringskritisk** — go-live går først; dette er
> den jevne design-jobben etterpå. GSD-filosofi: små verifiserte batcher i fersk kontekst.

---

## Sammendrag

**Gjenstår å ferdig-designe (Design = «–» eller «~»), eksklusive aliaser/dev/test:**

| Flate | Gjenstår | Herav @trenger-data | @langhale (lavpri) |
|---|---|---|---|
| **PlayerHQ** | ~109 | mesteparten | Analysere/SG-univers (~14), Talent (5), AI (5) |
| **AgencyOS** | ~95 (+8 alias hoppes) | mesteparten | Workspace (4), Talent (8), stats-mod (2) |
| **Auth** | 5–8 | nei (rene UI) | — |
| **Forelder** | ~12 | ja | hele seksjonen (utsatt etter lansering) |
| **Marketing** | 26 + stats-univers (8 blokker) | nei (statisk) / stats=ja | hele stats-universet |
| **System/felles** | 2–3 | nei | offline-side OK som den er |
| **SUM** | **~260 reelle skjermer** | | ~45 % er @langhale |

**Foreslått rekkefølge:** følg **Spor C** (1→10, se master-sekvens under). Kjernebruken (Coach+melding,
Booking, Mål, AgencyOS plan/stall) først; @langhale (Forelder, Marketing, stats-univers, Talent/Elite,
innstillings-haler) sist.

**Grovt estimat per batch** (maks 3 skjermer):
- `@bygg-fra-system` (ren UI, ingen ny datakobling): **~1 fokusert Claude Code-økt per batch**, ofte alle 3.
- `@trenger-data` (krever ny action/API/datamodell først): **~1–2 økter per batch** (datalag + skjerm).
- Hovedflyt-delen ≈ **~32 batcher**; @langhale-delen ≈ **~50 batcher**. Total ~80 batcher.
  Realistisk jevn-jobb-tempo: hovedflyten på **4–6 uker**, resten løpende etter behov.

---

## Hvordan lese denne (GTD + rammer)

- **PROSJEKT** = én flate-seksjon (Anders' regel). Hvert prosjekt har én **neste handling** (batch 1).
- **NESTE HANDLING** = en konkret batch på **maks 3 skjermer** (kvaliteten faller over det).
- En skjerm er **ferdig** når alle 6 hakene i `MASTER-SKJERMPLAN.md` er grønne
  (Design · Mob/Desk/iPad · Adresse · Flyt · Data · Funker). Oppdater hakene i SAMME commit.

**Rammer (gjelder hele planen):**
1. **Bygg fra det LÅSTE systemet** — `src/components/athletic/` + tokens i `globals.css`. `public/design-handover`
   er TOM (slettet 14. juni, backup i Drive). Ingen pixel-fasit finnes — bygg fra komponenter, ikke fra mockup.
2. **QA = brand-vokter-review, ikke pixel-diff.** Den gamle 5-stegs porting-gaten (screenshot → adversarial
   diff mot PNG) gjelder IKKE lenger. Ny gate per skjerm: bygg fra system → `brand-enforcer`-agent sjekker
   tokens/typografi/8pt/lucide/lime-disiplin/44px touch → fiks → oppdater haker.
3. **Gjenbruk alltid** athletic-mønstre (AthleticCard, KpiStrip, calendars/, lib-helpere). Bygg ikke på nytt.

---

## Kontekster (tags)

- **`@hovedflyt`** — kjernebruk («hva gjør JEG / hvem trenger MEG»). Høyest verdi.
- **`@bygg-fra-system`** — ren UI, ingen manglende datakobling. Raskest — kan kjøres i tette batcher.
- **`@trenger-data`** — mangler action/API/datamodell. Datalaget må på plass før eller sammen med skjermen.
- **`@langhale`** — lav prioritet: stats-universet, Elite/Talent-pakken, marketing, foreldreportal, aliaser.

---

## Master-sekvens (Spor C) → prosjekter

| Spor C | Innhold | Prosjekt(er) | Avhengighet å flagge |
|---|---|---|---|
| **1** | Coach-skuff + Meldingstråd | **P1** PlayerHQ·Coach | Meldings-arkitektur deles med AgencyOS — avklar modell FØR batch 2 |
| **2** | Booking komplett flyt | **P2** PlayerHQ·Booking | Booking-actions finnes (go-live); detalj-sider gjenstår |
| **3** | Mål-hub + Mål-bygger | **P3** PlayerHQ·Mål | Mål-modell finnes; leaderboard/milepæl = @langhale |
| **4** | Plan-detalj (AgencyOS) | **P4** AgencyOS·Planlegge | Workbench er fasit; plan-detalj bygger på den |
| **5** | Ny spiller + Tildel test | **P5** AgencyOS·Stall | TestAssignment-modell finnes (juni) |
| **6** | Forelder-portal | **P13** Forelder | @langhale — utsatt etter lansering |
| **7** | Auth sub-flyter | **P12** Auth | rene UI, ingen data |
| **8** | Innstillinger sub-sider | **P10** Innstillinger | delt backend (Stripe/innstillinger-API) — bygg API først |
| **9** | Marketing-sider | **P14** Marketing | statisk innhold, @langhale |
| **10** | Resterende sub-sider | P6–P9, P11, P15, P16 | stats-univers + Talent + AgencyOS-haler |

---

## ⚠ Datamodell-blokkere (løs FØR de berørte skjermene)

Disse skjermene kan ikke bli grønne på Data uten en DB-utvidelse. Behandle som egne forarbeider:

| Blokker | Berørte skjermer | Tag |
|---|---|---|
| **Shot-koordinater mangler** | Slag-for-slag, Shot-map/spredning | @trenger-data |
| **HoleScore (hull-for-hull) ikke i turnerings-scorecard** | Scorecard hull-for-hull, Bane-detalj-dybde | @trenger-data |
| **Live-scoring-dataflyt mangler** | Live turnerings-tracking | @trenger-data |
| **Meldings-/tråd-modell (delt PlayerHQ↔AgencyOS)** | Hele P1 Coach + AgencyOS Kommunikasjon | @trenger-data |
| **Stripe-flater (kort/faktura/oppgrader)** | Meg·abonnement-undersider | @trenger-data |
| **FYS-referanseformel (LÅST, avventer Anders)** | tester-resultatskjermer | bruk plassholder |

---

# PROSJEKTER

## P1 — PlayerHQ · Coach + Meldinger  ·  Spor C-1  ·  @hovedflyt @trenger-data
**18 skjermer.** Høyest beta-verdi. **Avhengighet:** meldings-/tråd-modellen deles med AgencyOS — avklar
den FØR batch 2, så bygges begge sider på samme kjerne.

- **NESTE HANDLING (batch 1):** Coach-hub `/portal/coach` · Coach-profil `/portal/coach/[coachId]` · Spørsmål til coach `/portal/coach/sporsmal/[id]`  `@bygg-fra-system`
- Batch 2 (kjerne-beta): Meldinger-innboks `/portal/coach/melding` · Ny melding `/portal/coach/melding/ny` · Meldingstråd `/portal/coach/melding/[id]`  `@trenger-data` ← krever meldings-modell
- Batch 3: Vedlegg `…/[id]/vedlegg` · Coach-planer `/portal/coach/plans` · Plan-detalj `…/plans/[planId]`
- Batch 4: Ny økt i plan · Perioder `…/plans/perioder` · Coach-øvelser `/portal/coach/ovelser`
- Batch 5: Ny øvelse · Rediger øvelse · Coach-videoer `/portal/coach/videoer`
- Batch 6: Coach-notater · Notat-detalj · Coach-AI `/portal/coach/ai`  (`@langhale` — AI-kobling)

## P2 — PlayerHQ · Booking  ·  Spor C-2  ·  @hovedflyt
**7 skjermer.** Booking-actions + Stripe finnes fra go-live; her gjenstår detalj-/bekreftelses-sidene.
Hub + wizard er `~` (delvis) → løft til ✓.

- **NESTE HANDLING (batch 1):** Booking-hub `/portal/booking` · Ny booking (wizard) `/portal/booking/ny` · Ny booking bekreft `/portal/booking/ny/bekreft`  `@bygg-fra-system`
- Batch 2: Booking-detalj `/portal/booking/[bookingId]` · Bekreftet `/portal/booking/bekreftet` · Coach-profil (booking) `…/coach/[coachId]`
- Batch 3: Anlegg-detalj (booking) `…/anlegg/[anleggId]`

## P3 — PlayerHQ · Mål (Planlegge)  ·  Spor C-3  ·  @hovedflyt
**5 skjermer.** Mål bor i Oversikt, redigeres i Workbench (låst). Leaderboard/milepæl = gamifisering (lavpri).

- **NESTE HANDLING (batch 1):** Mål-hub `/portal/mal` · Mål-bygger `/portal/mal/bygger` · Mål-detalj `/portal/mal/goal/[id]`  `@trenger-data`
- Batch 2: Milepæler `/portal/mal/milepaeler` · Leaderboard `/portal/mal/leaderboard`  `@langhale`

## P4 — AgencyOS · Planlegge  ·  Spor C-4  ·  @hovedflyt @trenger-data
**~15 reelle (4 alias hoppes: `/admin/plans/templates*` → redirect).** Plan-detalj bygger på coach-Workbench (fasit).

- **NESTE HANDLING (batch 1):** Plan-sentral `/admin/planlegge` · Plan-detalj `/admin/plans/[planId]` · Plan-mal detalj `/admin/plan-templates/[id]`  `@hovedflyt`
- Batch 2: Ny plan-mal · Rediger plan-mal · Drill-detalj `/admin/drills/[id]`
- Batch 3: Rediger drill · Teknisk plan `/admin/teknisk-plan` · Per spiller `…/[spillerId]`
- Batch 4: Turnering-detalj `/admin/tournaments/[id]` (~) · Ny turnering · Dubletter-rydd
- Batch 5: Økter `/admin/okter` · Videoer `/admin/videoer` · Opptak `/admin/recording`

## P5 — AgencyOS · Stall  ·  Spor C-5  ·  @hovedflyt @trenger-data
**17 skjermer** (Talent-undergruppe = @langhale, se P16). TestAssignment-modell finnes.

- **NESTE HANDLING (batch 1):** Stall-oversikt `/admin/stall` · Ny spiller `/admin/spillere/ny` · Tildel test `/admin/spillere/[id]/tildel-test`  `@hovedflyt`
- Batch 2: Spiller-detalj mobil `/admin/spillere/[id]` (~) · Profil `…/profil` · Plan-detalj `…/plan/[planId]`
- Batch 3: Rediger spiller `…/rediger` · Gruppe-detalj `/admin/grupper/[id]`
- (Talent-radar/discovery/kohort/region/ressurser/WAGR → **P16 @langhale**)

## P6 — PlayerHQ · Gjennomføre  ·  Spor C-10  ·  @hovedflyt
**17 skjermer.** Live-økt-sidene er `~`/data-koblet men trenger design-løft + e2e. NB anomali: Økt-detalj
`/portal/gjennomfore/[id]` har 5/6 haker grønne men Design=– → verifiser om bare designflagget henger igjen.

- **NESTE HANDLING (batch 1):** Kalender `/portal/kalender` · Ny økt (handlingsvalg) `/portal/ny-okt` · Økt-detalj `/portal/tren/[sessionId]`  `@bygg-fra-system`
- Batch 2: Live-økt drill-logger (~) · Live-økt score-tapper (~) · Live-økt aktiv (data-fiks)  `@trenger-data`
- Batch 3: Putte-lab (Data=–) · Break-tabell (Data=–) · Planlagt økt `…/[sessionId]/planlagt`  `@trenger-data`
- Batch 4: Ønsket økt `/portal/onskeligokt` · Ønsket økt bekreftet · Feiring `/portal/tren/feiring/[planId]`
- Batch 5: Tren (fullskjerm) `/portal/(fullscreen)/tren`  (alias-kalender `/portal/tren/kalender` = redirect, hopp)

## P7 — PlayerHQ · Planlegge (plan + tester, ekskl. Mål)  ·  Spor C-10  ·  @hovedflyt @trenger-data
**~13 skjermer** (Mål er P3; AI-skjermer = @langhale).

- **NESTE HANDLING (batch 1):** Teknisk plan liste `/portal/tren/teknisk-plan` · Teknisk plan detalj `…/[planId]` · Rediger periode `…/aarsplan/periode/[id]/rediger`  `@bygg-fra-system`
- Batch 2: Fys-plan liste `/portal/tren/fys-plan` · Fys-plan detalj/bygger `…/[planId]` · Turnering-detalj (~) `…/turneringer/[id]`
- Batch 3: Ny turnering `…/turneringer/ny` · Utfordringer `/portal/utfordringer` · Ny utfordring `…/ny`
- Batch 4: Utfordring-detalj · Test-katalog NGF `/portal/tren/tester/katalog` · Ny test `…/tester/ny`
- Batch 5: Ny egen test · Test live (fullskjerm) · Test oppsummering  `bruk FYS-plassholder`
- (AI: mål-bygger / foreslå-drill / foreslå-turnering → **P15/@langhale**)

## P8 — AgencyOS · Gjennomføre (daglig drift)  ·  Spor C-10  ·  @hovedflyt @trenger-data
**~10 reelle** (3 alias + 3 live-økt-coach funksjonelle uten design).

- **NESTE HANDLING (batch 1):** Daglig drift-hub `/admin/gjennomfore` · Økt-detalj `…/okter/[id]` · Ny booking `/admin/bookinger/ny`  `@hovedflyt`
- Batch 2: Kalender måned `/admin/kalender/maned` (Design ✓, løft haker) · Anlegg-detalj `/admin/anlegg/[id]` · Kapasitet `/admin/kapasitet`
- Batch 3: Fasilitet-detalj · Lokasjoner `/admin/locations` · TrackMan på tvers `/admin/trackman`
- Batch 4: Live-økt coach brief/aktiv/summary (design-løft på funksjonelle sider)

## P9 — AgencyOS · Oversikt + Workspace  ·  Spor C-10  ·  blandet
**14 skjermer.** Cockpit-kjernen er ✓; her er sekundær-flatene. Workspace (4) = @langhale.

- **NESTE HANDLING (batch 1):** Uka (kanban) `/admin/agencyos/uka` · Coaching-board `/admin/board` · Oppfølging `/admin/oppfolging`  `@bygg-fra-system`
- Batch 2: Oppgave-kø `/admin/queue` · Kommunikasjon-hub `/admin/kommunikasjon` · Reach `/admin/reach`  `@trenger-data` (meldings-modell, jf. P1)
- Batch 3: Caddie-aktivitet `…/caddie/aktivitet` · Daglig AI-brief `/admin/brief` · Økonomi-alias (rydd)
- Batch 4 (@langhale): Workspace-hub · Oppgave-detalj · Prosjekter · Notion-sync

## P10 — Innstillinger (PlayerHQ Meg + AgencyOS Admin)  ·  Spor C-8  ·  @trenger-data
**~44 skjermer.** Delt backend — **bygg API/actions FØR skjermene** (Stripe, innstillinger, GDPR, 2FA, e-postmaler).
Mange er nær-identiske former → kan batches tett når datalaget står.

- **NESTE HANDLING (batch 1) — PlayerHQ abonnement (Stripe-avhengig):** Oppgrader · Oppgrader-flyt · Avbestill  `@trenger-data`
- Batch 2: Nytt kort · Faktura-detalj · Mine bookinger `/portal/meg/bookinger`
- Batch 3: Innstillinger-undersider varsler/personvern/sikkerhet  (`personvern` finnes alt — verifiser)
- Batch 4: språk/anlegg/integrasjoner  · Batch 5: eksport/økter/2FA · Batch 6: feedback/help-artikkel/help-kategori/kontakt
- **AgencyOS Admin (22)** — egne batcher: Organisasjon-hub · Klubb-innstillinger · Integrasjoner → Settings (api/calendar/security/tilgang) → Team/Inviter → Audit-log(+detalj) → AI-agenter(+detalj) → E-postmaler(+rediger) → Profil/Hjelp/Design-godkjenning-flate

## P11 — AgencyOS · Innsikt  ·  Spor C-10  ·  @trenger-data
**~12 reelle** (3 alias hoppes; Test-detalj/Tildel-test er Design ✓ → bare Funker-e2e).

- **NESTE HANDLING (batch 1):** Innsikt-hub `/admin/analysere` · Analytics `/admin/analytics` · Runder på tvers `/admin/runder`  `@trenger-data`
- Batch 2: Foreslåtte tester `/admin/tester/foreslatte` · Godkjenning-detalj `/admin/godkjenninger/[id]` · Skader/tilstander `/admin/tilstander`
- Batch 3: Økonomi `/admin/okonomi` (~, løft mob/flyt) · Fasiter-benchmarks (~ løft) · Stats-oversikt `/admin/stats/overview`
- Batch 4 (@langhale): Stats-moderering `/admin/stats/moderering`

## P12 — Auth sub-flyter  ·  Spor C-7  ·  @bygg-fra-system
**5–8 skjermer.** Rene UI, ingen datakobling — raskeste prosjekt, gode «fyll-batcher».

- **NESTE HANDLING (batch 1):** Tilbakestill passord `/auth/reset-password` · Sjekk e-post `/auth/check-email` · Samtykke venter `/auth/samtykke-venter`  `@bygg-fra-system`
- Batch 2: Onboarding forelder `/auth/onboarding/forelder` · Foreldresamtykke (token) `/auth/guardian-consent/[token]`

## P13 — Forelder-portal  ·  Spor C-6  ·  @langhale @trenger-data
**~12 skjermer.** Bevisst utsatt etter lansering. Forelder-hjem/barn er `~` (delvis).

- **NESTE HANDLING (batch 1):** Forelder-hjem `/forelder` · Barn-oversikt `/forelder/barn` · Barn-detalj `…/[childId]`  (løft fra ~)
- Batch 2: Bookinger · Coach · Fakturaer · Batch 3: Økonomi · Samtykke · Ukerapport · Batch 4: Innstillinger · Varsler · Inviter (token)

## P14 — Marketing  ·  Spor C-9  ·  @langhale @bygg-fra-system
**26 core-sider.** Statisk innhold, ingen datamodell — kan batches tett, men lav prioritet (akgolf.no er separat redirect i dag).

- **NESTE HANDLING (batch 1):** Forside-løft `/(marketing)` · Priser `/priser` · PlayerHQ-salgsside `/playerhq`
- Resten i 3-er-batcher: tjeneste-sider (coaching/junior/coacher) → innhold (om-oss/cases/suksess/treningsfilosofi/faq/jobb/kontakt) → booking-flate (marketing-booking ×4) → blogg/anlegg/turneringer → juridisk (cookies/personvern/vilkår)

## P15 — Analyse + Stats-univers (PlayerHQ Analysere + Marketing stats + AI)  ·  Spor C-10  ·  @langhale
**~14 PlayerHQ SG-undersider + 8 marketing-stats-blokker + 5 AI-skjermer.** Funksjonelt/data-rikt men gammelt
design. Bygg som ÉN delt dashboard-template, ikke 14 separate — størst effekt per innsats.

- **NESTE HANDLING (batch 1):** Hull-analyse (~, Data ✓ → fullfør) · Metrikk-detalj `/portal/statistikk/[metric]` · Kølle-detalj `…/sg-hub/[club]`
- Resten i 3-er: SG-undersider (best-vs-now/utstyr/yardage/conditions/strategy) → coach-perspektiv-SG (×3) → slag-for-slag/bane-bibliotek/bane-detalj → marketing-stats-løft → AI-skjermene (krever AI-kobling)

## P16 — Talent / Elite (PlayerHQ Talent + AgencyOS Talent)  ·  Spor C-10  ·  @langhale
**5 PlayerHQ + 8 AgencyOS.** Bevisst parkert til **Elite Fase 2**. Ingen jobb før Anders åpner fasen.

- **NESTE HANDLING:** ingen nå — vent på Elite Fase 2-grønt lys. Når åpnet: Talent-hub-ene + Min plan/Mitt nivå/Roadmap først.

---

## Ikke design-jobb (hopp over / rydd)

- **Aliaser/redirects (~8 AgencyOS + et par PlayerHQ):** allerede rene redirect-stubs — Design=– er forventet,
  skal IKKE designes. Marker «N/A» i skjermplanen heller enn å batche.
- **Dev/intern (`/(internal)/*`, `/intern/komponenter/*`, `/demo*`, `/design-system*`):** ikke brukerskjermer.
- **Offline-side `/offline`:** funker som den er, trenger ikke v10.
- **Admin-rot `/admin` (gammel hjem):** skal erstattes/slettes, ikke pusses opp.

## Drop-off-merknad
«Tegnet, men ikke brukt»-lista i MASTER-SKJERMPLAN pekte på 15 PNG-er i `public/design-handover`. **Den mappa
er nå tom** (slettet 14. juni). De skjermene har ingen pixel-kilde lenger → bygges fra det låste systemet som
alt annet i denne planen. Komponent-delen av drop-off (voice-input, credit-indicator, season-timeline m.fl.)
er allerede bygd inn — ingen restanse der.

---

## Estimat-sammendrag

| Bolk | Prosjekter | ~Batcher | Tempo |
|---|---|---|---|
| **Hovedflyt** | P1–P11 (kjerne-batcher) | ~32 | 4–6 ukers jevn jobb etter go-live |
| **@langhale** | P13–P16 + innstillings-/marketing-haler | ~50 | løpende, ikke tidskritisk |
| **Blokkert** | datamodell-blokkere (6 stk) | forarbeid | løs før berørte Data-haker |

**Anbefalt start:** P1 batch 1 (Coach-hub-trioen, `@bygg-fra-system`) — høy verdi, ingen blokker, og avklar
meldings-modellen parallelt så P1 batch 2 + AgencyOS-kommunikasjon kan bygge på samme kjerne.

> Når du faktisk bygger: oppdater de 6 hakene i `MASTER-SKJERMPLAN.md` per skjerm i samme commit, og kjør
> `brand-enforcer`-review som gate (ikke pixel-diff). Verifiser løpende: `tsc --noEmit && npm run build`.
