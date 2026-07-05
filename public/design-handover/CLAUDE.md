# AK Golf HQ — prosjektinstrukser

## Korrekt terminologi (gjelder ALLE flater + retting av eksisterende skjermer)
Bruk alltid de kanoniske begrepene. Ikke finn opp egne akser/ord. Dette gjelder også når
eksisterende skjermer endres — rett feil terminologi når du er innom.

### Pyramide-aksene (disiplin-budsjett / treningsfordeling) — KANONISK 5
`FYS` (fysisk) · `TEK` (teknikk) · `SLAG` (slag) · `SPILL` (spill) · `TURN` (turnering).
- Rendres apex→base: TURN øverst, FYS fundament.
- Egne faste farger: CSS `--axis-{fys|tek|slag|spill|turn}` / JS `AX.FYS…AX.TURN` (`workbench-data.js`).
- **ALDRI** bruk `MEN`/`MENTAL`/`TAK` som pyramide-/budsjett-akse — det finnes ikke i `AX` (gir undefined farge).
- All `fordeling`/`budsjett` SKAL bruke disse 5 nøklene.

### Strokes Gained-akser (SG) — 4
`OTT` (off the tee) · `APP` (approach) · `ARG` (around the green) · `PUTT`.
- Fargemapping (token-kanon): OTT→FYS-farge · APP→SLAG · ARG→SPILL · PUTT→TURN.
  (`--sg-ott/app/arg/putt` i `tokens/data-viz.css`.)

### Periodisering (makro-faser)
Base · Forberedelse · Spesialisering · Taper · Peak · Overgang. Ukesblokk = **mikrosyklus**.

### Anbefalinger (CANON) — aldri sperrer
Tilstander (fagkode = ID i kode/data, endres aldri — UI = klarspråk):
**Innenfor anbefaling** (`ren` — stille, ingen markering) · **Avviker fra anbefaling** (`myk` — synlig chip + klarspråk-forklaring) · **Sterkt avvik** (`hard` — tydeligere chip + coach-varsel-event).
Ordene «brudd», «hardt», «overstyr» og «krever begrunnelse» er UTFASET i all UI-tekst: **ingenting blokkeres, ingenting krever begrunnelse.** Avvik påvirker Plan-kvalitet som informasjon; sterkt avvik varsler coach automatisk.
**Plan-kvalitet** = 0–100 score. **ACWR** = acute:chronic workload ratio (soner: trygg/varsel/over).
**CS-nivå** = køllehastighet-nivå (CS50–CS100), brukt på drills.

### Situasjon-aksen (M0–M5) — fagkode = ID, UI = klarspråk
| Kode (ID) | Klarspråk (UI) |
|---|---|
| M0 | Innendørs |
| M1 | Range |
| M2 | Range med mål |
| M3 | Bane trening |
| M4 | Bane test |
| M5 | Turnering |

Aksen heter **«Situasjon»** i UI. Koder (M2) vises KUN i coach-flater og økt-ID; spiller/forelder ser kun klarspråk.

### Læringstrinn — 5 (kobles til CS-progresjon; koder alltid uten æøå)
| Kode (ID) | Klarspråk (UI) | Beskrivelse |
|---|---|---|
| L_KROPP | Kropp | Kroppen lærer bevegelsen |
| L_ARM | Arm | Armene kobles på bevegelsen |
| L_KOLLE | Kølle | Svingtrening med kølle — uten ball |
| L_BALL | Ball | Ballkontakt i kontrollert fart |
| L_AUTO | Auto | Automatisert under press |

Etiketten er «LÆRINGSTRINN» (aldri «L-fase» i synlig tekst — «fase» er reservert periodisering).
Spillervisning bruker trapp-språket: «Trinn 3 av 5».

### Klarspråk-tabellen (KANON) — fagkode er ID og endres aldri; UI-label/verdinavn er klarspråk
| Akse (koder) | UI-navn | Verdinavn (klarspråk) |
|---|---|---|
| Miljø M0–M5 | **Situasjon** | Innendørs · Range · Range med mål · Bane trening · Bane test · Turnering |
| Press PR1–PR5 | **Press** | Rolig · Lett press · Skjerpet · Høyt press · Turneringsnerver |
| L-fase L_KROPP…L_AUTO | **Læringstrinn** | Kropp · Arm · Kølle · Ball · Auto |
| Treningsområde (ARENA) | **Område** | Tee · Innspill 200–50 · Putting |

Regel: koder (M2, PR3, L_BALL) kun i coach-flater og økt-ID — aldri i spiller-/forelderflaten.

### AK-formelen — seks akser (KANON)
**Pyramide → Område (ARENA) → Læringstrinn → CS → Situasjon (M) → Press (PR).**
P-posisjoner (P1–P10) er et **betinget TEK-felt**, ikke en akse.

### Tolags-språk + faste regler (fra hovedbrief 2. jul 2026)
- Coach ser kode + navn; spiller ser KUN klarspråk. CS omtales som «% av din maksfart» i spillerflaten.
- ALDRI «øving» — alltid «trening». Aldri emoji.
- **To tall, aldri blandet:** PLAN-KVALITET (0–100) og GJENNOMFØRING (%) er separate hero-tall.
- **Anbefalingskontrakten:** hvert AI-forslag viser Hvorfor / Hva / Forventet effekt / Hvorfor nå; «Bruk forslag» er primærhandling.
- **Anbefalinger, aldri sperrer:** systemet forklarer avvik og foreslår AI-fiks, men blokkerer aldri en handling og krever aldri begrunnelse.
- Kanon-invarianter merkes «invariant», husregler «husregel».
- Priser: GRATIS · PRO **300 kr/mnd** · ingen årsabonnement. **RETTET 2026-07-06:** forrige versjon av
  denne linjen sa «299 kr/mnd · 2690 kr/år (rett 300→299 i demoer)» — det var feil vei. 300 kr/mnd er
  den låste, godkjente prisen (Anders' beslutning 2026-06-22, se produksjonsrepoets
  `docs/platform/BUSINESS-RULES.md`). 299/2690 var aldri en ekte beslutning — se rettelse under
  «Repo-kanon-forsoning».
- Demo-personer: spiller Øyvind Rohjan, coach Anders Kristiansen. Coach-flaten heter alltid AgencyOS — legacy-navnet er forbudt i alt innhold.
- Avvik: begge roller kan planlegge utenfor anbefaling; sterkt avvik varsler coach automatisk. Avvik vises i Plan-kvalitet som informasjon — aldri sperre, aldri begrunnelseskrav.
- Dagslys-krav (PlayerHQ mobil): kritisk data ≥ 7:1 kontrast, brødtekst ≥ 15–16 px.

### Spiller-DNA (eget skill-fingeravtrykk, IKKE pyramiden)
6-akset radar: Teknikk · Fysikk · Mental · Taktikk · Nærspill · Putting. Distinkt konstrukt fra
pyramide-budsjettet og SG — ikke bland nøklene.

### Øvrig fast vokabular
Stall · spiller · økt · drill · mikro-/makrosyklus · turneringsspor (NM-spor) · WAGR · hcp ·
Workbench · Inspektør · plan-kvalitet · klarspråk (spiller/forelder, ingen IDer/overstyr).

## Flate-navn
AgencyOS (mørk, desktop coach) · PlayerHQ (lys/mørk, mobil spiller) · Forelder · Marketing · Auth.

## Repo-kanon-forsoning (3. jul 2026) — status + backlog
Brukeren limte inn produksjons-repoets designguide + ordbok som styrende kanon; «go with defaults» → repo vinner, staget migrering (tokens først). Enige om alt vesentlig (fonter, Lucide 1,5px, ingen emoji, pill-knapper, lime-som-ett-anker-filosofi, Øyvind Rohjan/Anders Kristiansen, mono-tall, ærlige «—»-tomtilstander).
- ✅ GJORT: mørk neutral-rampe CSS → near-black (samsvar med JS `T`/repo). Verifisert cockpit.
- ✅ GJORT (3. jul): pyramide-aksepalett → repo forest/ochre/blå/lime/rød. Koordinert CSS `--axis-*` (data-viz.css, dark+lys) + JS `AX`/`AX_SOFT` (workbench-data.js). SPILL=lime bevisst bekreftet av bruker. Fargeblind-backup består: DispersionPlot bruker form+farge, pyramide/bar har 3-bokstavs akse-etikett. Verifisert: workbench session-kort. NB lys-SPILL: lime-fyll #D1F843, men -text = mørk oliven #55680A (aldri lime-tekst på lys).
- ✅ GJORT (3. jul): Abonnement — verifisert kanon-kompatibelt, ingen kodeendring nødvendig. Alle demoer bruker allerede GRATIS/PRO (to nivåer, ikke tiers), 299 kr/mnd (+2690 kr/år i structure.card), og null ELITE-lekkasje i UI (`ab`/`tier`='PRO'|'GRATIS'; okonomi PAKKER 299/0; forelder/styring/forside/okonomi). «300» i ordboken er et stale rettskrivings-eksempel; «rett 300→299» er allerede utført. Coaching-pakker (Performance/Drop-in) er eksplisitt merket «ikke app-nivåer» — ikke abonnementsnivåer. Prosjekt-canon (workbench-masterplan + PORTING) bekrefter 299/2690, ingen ELITE. VALGFRI polish: synlig copy → «Pro»/«Gratis» (ordbok). RETTET (3. jul, display-label-map, enum-DATA 'PRO'/'GRATIS' beholdt som lookup-nøkler/sammenligning): okonomi PAKKER-navn + TX-chip (TIER_LBL), styring ab-chip (abLbl), forelder tier-badge ×2 (TIER_LABEL), structure.card-FAQ, FakturaRad-eksempel. PlayerHQ («Pro-spillere») + marketing (OfferRow «Pro»/«Gratis») brukte allerede riktig form.
- ❌ RETTET 2026-07-06: linjen over (3. jul) konkluderte feil. «300» i ordboken var IKKE stale — det er
  den ekte, låste prisen. Denne kit-fila hadde selv funnet på 299/2690 og «verifiserte» det mot sin
  egen feilaktige antakelse i stedet for mot produksjonsrepoets `BUSINESS-RULES.md`. Riktig kanon:
  **300 kr/mnd, ingen årlig, ingen 2690.** Alle steder i dette kit-et som viser 299 eller 2690
  (structure.card, okonomi PAKKER, TIER_LBL osv.) skal rettes til 300/ingen-årlig ved neste
  gjennomgang av kit-et — ikke bare denne dokumentasjonslinjen.
- ✅ GJORT (3. jul): Spillerkategori — verifisert kanon-KORREKT, ingen endring. Ordboken: NGF-kat A–L A=verdenselite (OWGR topp 150)→K–L junior; SPILLERKATEGORIER A–K A=aspirerende Tour→E=nybegynner→J/K=junior — dvs. **A=høyest**. Alle demoer stemmer allerede (structure.card «A er høyest», drills-data «A=mest avansert/elite…K=nybegynner», phq-meg/analyse «Kategori A»=Øyvind=elite). Backlog-notatet «repo A=nybegynner→K=tour» var FEILLEST mot ordboken — forkastet; «Kat. A = Øyvind» er korrekt.
- ✅ GJORT (3. jul): Terminologi/ordbok — «Kortspill»→«Nærspill» fullført. Taksonomi-labels → SG-kategori OTT «Tee-slag»/APP «Innspill»/ARG «Nærspill»/PUTT «Putting» (workbench-data SG_AXES + rettet lokal SG_AXES i marketing/stats.jsx), DNA-radar + talent-pentagon + styring-vekt + compliance-type. Runde 2 (3. jul): ALLE brukersynlige «Kortspill/kortspill»→«Nærspill/nærspill» i produkt-/demokode — drill/økt-navn (workbench SESSIONS+STDOKTER, forelder, kalender card+app, grupper, godkjenninger-øktblokker, stall `neste`), mål-strenger «… innenfor 8 m» (workbench mål+P6, utviklingsplan, phq-meg), coach-ekspertise-tags (coaching+booking) og vurderingsprosa/notater (spillere-data, talent-data). Datanøkler `KORT`/`KORT_SPILL` uendret (verifisert 14→14, 5→5); ranges bruker allerede tankestrek. IKKE rørt: kanon-/spec-docs (uploads/) + migreringslogg (bevisst — dokumenterer overgangen). Bundle regenereres ved turn-slutt. **m→fot: RETTET 2026-07-06 — Anders bekreftet direkte: «Alle putter skal være ft. Evt meter som forklaring.»** Anbefalingen under (fra 3. jul, «lukk m→fot som kanon=meter») var feil og motsa linje 139 i samme fil («putting alltid fot»). Fasit nå: putt-avstand vises i **fot** som primærenhet i all UI; meter kan vises som forklaring/sekundærverdi der det er nyttig, ikke som standard. `PUTT0_3…PUTT40P`-datanøklene kan beholde meter-baserte grenseverdier internt (det er datakilden, ingen re-kalibrering) — det er kun VISNINGEN som skal være fot. m→fot-migreringen i kit-ets synlige tekst («innslagsprosent 5 m» osv.) bør derfor fullføres, ikke lukkes som meter. ranges tankestrek-audit: bestått på alt berørt.
- ✅ GJORT (3. jul): SG→farge-mapping — implementert + verifisert, ingen kodeendring. `--sg-ott/app/arg/putt` (tokens/data-viz.css) = var(--axis-fys/slag/spill/turn); komponenter (SGTrend, SGSplittKort) leser tokenene, JS KAT_FARGE/plans-app speiler OTT→FYS·APP→SLAG·ARG→SPILL·PUTT→TURN, tokenene registrert i _adherence. Bevisst divergens fra repoets rå semantiske mapping (OTT→forest/APP→success/ARG→warning/PUTT→lime): prosjektet gjenbruker den repo-forkede akse-paletten, jf. CLAUDE.md SG-seksjon (linje 16–17). Backlog-item lukket.

## Token-lås (Repo-kanon forsonet 3. jul 2026 — CSS reconciled to production)
Mørk base = varm near-black (repo, «IKKE grønn»): base #0A0B0A · kort #171817 · hevet #1E1F1D · tekst #F0F0F0 · muted #A6A8A3 ·
lime #D1F843 (KUN signal, aldri dekor) · forest #005840. Lys base = kald kritt #F7F7F4, blekk #101613.
(Historikk: gran-mørk «Retning A» var kun i CSS-tokens; AgencyOS JS-paletten `T` i workbench-data.js var allerede near-black — CSS ble 3. jul brakt i samsvar med JS/repo. Reversibelt i tokens/colors.css graphite-rampe.)
JetBrains Mono (tall) · Familjen Grotesk (display) · Inter (UI/body, basis 15px / 16px mobil).
✅ GJORT (3. jul, Fase 6.3): display-font forsonet til kanon. ui_kit-shellene brukte hardkodet `DISP='Inter Tight'` — en font som IKKE lastes av fonts.css og IKKE står i _adherence-allowlist (kun Inter/Familjen Grotesk/JetBrains Mono), så display-tekst falt til Inter-fallback mens DS-komponentene (var(--font-display)) rendret Familjen Grotesk = to fonter i samme system. Migrert `Inter Tight,Inter,…` → `Familjen Grotesk,Inter,…` i 23 shell-filer (32 forekomster, AgencyOS + PlayerHQ lys/mørk). readme.md + SKILL.md rettet (navnga «Inter Tight» som DS-font — stale; nå Familjen Grotesk). uploads/*-repo-provenance urørt (dokumenterer prod-Next-appen, som faktisk bruker Inter Tight). ADVARSEL: ikke reverser til Inter Tight uten å laste den i fonts.css + legge den i allowlist.
Alle verdier bor i tokens/*.css — aldri hardkod hex i komponenter/templates.
Navnestandard: norsk er default for komponentnavn (KolleStatKort-mønsteret); engelsk kun for etablerte tekniske begreper (BarChart, DataTable). Nye komponenter følger dette.
Lys variant: aldri lime på lys flate (håndhevet i tokens: `--signal` re-mappes til forest i `.light`-scope); data-hero = mørke innfellinger (bruk `class="dark"`-scope i tokens/colors.css — re-asserterer mørke aliaser, lime tillatt der); primær CTA forest m/ lime tekst.
Eyebrow-disiplin (håndhevet 3. jul 2026): seksjons-eyebrows/SectionTitle er NØYTRALE (muted) — de er struktur, ikke signal. Delt `Eyebrow` i `spillere-ui.jsx` defaulter nå `T.muted`. Lime på eyebrow beholdes KUN som bevisst signalmoment: AI-stemme (sparkles), fullført/oppsummering-suksess, overstyrt-fremheving, og fremhevingskort (NM-hovedmål m/ trophy). Alt annet = muted.

## Motion + dataliv (bevegelsesregler)
Kanon-motion: 120–320 ms · `cubic-bezier(0.2,0,0,1)` · ingen bounce · entrances ≤ 8 px translate ·
`prefers-reduced-motion` respekteres overalt · null dekorative loops (en skjerm er levende når data
ankommer, ikke når noe blinker). Alle varigheter/kurver bor i tokens (`--dur-*`, `--ease-*`).
✅ GJORT (3. jul, Fase 6.1): to-lags dybde. `tokens/spacing.css` — `--shadow-popover`/`--shadow-sheet` oppgradert fra én til TO lag (nær kontakt + fjern ambient); ny `--shadow-raised` for aktive/drag-kort. Fjern-laget ≈ gammel enkelverdi (kontinuitet). DS-overlays (Modal/Sheet/Popover/Toast/Combobox) løftes automatisk via tokenene; Fase-4 drag-state (workbench-zones) + workbench-modal peker nå på `var(--shadow-*)` i stedet for ad-hoc rgba. Fortsatt: separasjon = surface+border først, skygge kun på løftede flater.
**Dataliv-baren fra Premium-referansen gjelder alle nye skjermer: tall teller opp, grafer tegnes inn, alt reagerer.**

## Tema-fullføring + signatur (Fase 2–3, 3. jul 2026)
- **Fire tema-matriser komplette** i tokens: PlayerHQ lys/mørk + AgencyOS mørk/lys — via `.light`/`.dark`-scope (colors.css) + akse/SG/fase per tema (data-viz.css). Alt semantisk; lime-signal mapper til forest i lys-matrisene.
- **ThemeToggle** (`components/core/ThemeToggle.jsx`): System · Lys · Mørk, følger `prefers-color-scheme`, skriver `.light`/`.dark` + data-theme + color-scheme på et mål. Nøytral (aldri lime). Plassering: AgencyOS toppbar (default mørk) · PlayerHQ Meg › Innstillinger › Utseende (default lys).
- **Signaturgeometri = to motiv-komponenter:** `Laeringstrapp` (domain, Trinn 1–5) + `PyramideFasett` (data — 5-lags fasett, apex→base TURN→FYS, høyde ∝ %). Begge token-drevet → begge temaer. Regel: data-bundet/didaktisk, aldri bakgrunnsmønster. Signatur-kort: `components/data/signatur.card.html`.
- **Tema-bevis-ark** (`guidelines/tema-bevis.html`, group «Tema») = diff-kontrakt: kjernebiblioteket i begge temaer + anbefalingstilstandene (Innenfor anbefaling / Avviker fra anbefaling / Sterkt avvik) + to-talls-regelen. Null rå farger.
- **Referanse for skjermbygging:** skjermer KOMPONERES fra `components/` per `prompt.md`-kontraktene og verifiseres mot tilstandsgalleriet (`guidelines/tilstander.html`) + tema-beviset. All tema-styring via token-scope (`.light`/`.dark`) — aldri JS-paletter.
- **Opprydding (Fase 1):** `spillere.html`/`grupper.html` + `spillere-app.jsx`/`grupper-app.jsx` slettet (erstattet av `stall.html`, som gjenbruker `spillere-data/ui/tabs/plan/rediger` + `grupper-data`). Ingen inline-hex i templates.
- **Bildekart (Fase 3):** `guidelines/bildekart.html` (group «Tema») = den kuraterte kontrakten for hvor foto får være. Foto KUN på: marketing hero + closing-CTA, auth-bakgrunn, onboarding-steg, forelder-topp, FeaturedCard, PlayerHQ-hjem-hero (mørkt kort). ALDRI på: datatabeller, cockpit, workbench, kalendere, empty states. Behandling: foto bak mørk gradient / i mørke kort på dark, forest-scrim på lys, aldri i konkurranse med data. Ekte foto i dag: `assets/imagery/peak-misty.png` + `strength-training.png`; der motiv mangler brukes stripete plassholder + mono-motiv (aldri hånddtegnet illustrasjons-SVG).

## Eksport
Distribuert eksport = kun kanonisk lag (tokens/, components/, styles.css, guidelines/, CLAUDE.md, DEKNINGSKART.md, SKILL.md). uploads/, screenshots/, scraps/ og ui_kits/ skal aldri med i eksport.

## Spredning vs. lengdeavvik (komponentvalg)
Spredning side (carry × side, TrackMan) = `trackman/DispersionPlot` (kanonisk; side i meter, negativ=venstre/positiv=høyre). Lengdeavvik fra mål (+langt/−kort) = `data/LengdeAvvik`. Aldri bland aksene.

## Design-skills (skills/)
Fem installerte skills — les `skills/README.md` for roller og presedens. Kort:
- `skills/frontend-design/SKILL.md` — kreativ kvalitet per skjerm (Anthropic). Bruk ved hver ny skjerm/flate.
- `skills/web-design-guidelines/GUIDELINES.md` — kvalitetsgate (Vercel). Sjekk hver leveranse mot regelverket.
- `skills/composition-patterns/SKILL.md` — komponent-APIer (Vercel). Bruk ved nye komponenter/DC-props.
- `skills/ui-ux-pro-max/SKILL.md` — inspirasjonskilde, IKKE kanon.
- `skills/impeccable/SKILL.md` — anti-mønster-vakt (absolute bans gjelder alltid).
- `skills/ak-terminologi/SKILL.md` — terminologi-/rettskrivingsfasit for all norsk UI-tekst; `skills/ak-terminologi/ordbok.md` = full ordbok (CANON v3.5, lagt inn 3. jul). Kanon-konflikter BESLUTTET (Anders): **A = beste kategori** (kit korrekt, ordbokens A=nybegynner forkastet) · **CS50–CS100** (seks nivåer, ikke CS20–100) · **putting alltid fot, meter kun som forklaring** (bekreftet på nytt 2026-07-06) · **300 kr/mnd, ingen årlig** (RETTET 2026-07-06 — ordbokens «300» var korrekt hele tiden, dette kit-ets «299 kr» var feilen, ikke omvendt). Nærspill/innspill forblir meter.
- `skills/ak-designekspert/SKILL.md` — senior design-/TrackMan-analytiker-persona (beslutningshierarki, premium-dom). Lagt inn 3. jul; rettet mot kanon ved innlegging (CoachHQ→AgencyOS, dark-bg #0A0B0A, Familjen Grotesk). Kanonisk skill i produksjonsrepoet: `.claude/skills/ak-designekspert` (v5, 6 referanser).
Komponentarbeid følger `skills/KOMPONENTPLAN.md` (pipeline + faser); kalender-spesifikt: `skills/KALENDERPLAN.md`; TrackMan-spesifikt: `skills/TRACKMANPLAN.md`; siste audit: `skills/AUDIT-2026-07-02.md`.
PRESEDENS: Terminologi + token-lås i denne fila vinner alltid over skills. Token-paletten (mørk base + lime signal) er et låst brandvalg — skillsenes «AI-refleks»-advarsler om mørk+acid-green brukes på layout/typografi/copy, ikke paletten.
HOVEDBRIEF-avgjørelser (2. jul 2026, se `skills/HOVEDBRIEF-PLAN.md`): Fase 0 avgjort som Retning A (grunnlov v2-audit): gran-mørk + kritt-lys + Familjen Grotesk. Eksisterende komponenter er grunnlaget for de fem Fase 2-familiene.
