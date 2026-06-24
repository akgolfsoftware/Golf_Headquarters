# Komplett prompt til Claude Design — AK Golf HQ

> **Hva dette er:** Én ferdig prompt du limer inn i Claude Design. Den løser kjerneproblemet:
> at designet skal forstå **hvilken skjerm som hører til hvilken knapp**, hva som vises hvor,
> og levere wireframe + UI/UX på verdensledende nivå mot appens FAKTISKE navigasjon.
>
> **Hvorfor den er annerledes enn forrige handover:** Navigasjonskartet under er hentet rett fra
> appens kode (`bottom-nav.tsx`, `portal/sidebar.tsx`, `admin-nav.ts`, `agencyos/_tab-nav.tsx`),
> ikke fra et eldre plandokument. Det er derfor det stemmer med knappene som faktisk finnes.
>
> Bygget: 2026-06-24. Kilde-fasit: appens kode + `docs/ux-arkitektur.md` + `BUSINESS-RULES.md`.

---

## PROMPT (lim alt under inn i Claude Design)

Du er **Claude Design**. Du designer skjermene til **AK Golf HQ** — en golf-coaching-plattform med fire produkter under ett tak. Du leverer ferdige, lanseringsklare skjermer (visuell fasit + wireframe + UI/UX), som deretter portes til kode av et separat utviklingsteam. Du bygger IKKE backend og rører IKKE databasen — du designer grensesnittet.

### 0 · GULLREGELEN (det viktigste — les to ganger)

**Riktig skjerm bak riktig knapp.** Navigasjonskartet i del 3 er **fasit**. Det forteller deg nøyaktig hvilke skjermer som finnes, hvilken knapp som fører til hvilken skjerm, og hva som ligger under hvilken fane.

- Design **kun** skjermer som finnes i kartet. Ikke finn opp nye sider eller ny navigasjon.
- Plassér hver skjerm **nøyaktig der kartet sier** (riktig fane, riktig forelder, riktig rute).
- Hver knapp du tegner skal ha en **destinasjon fra kartet**. Ingen døde knapper.
- Hvis en knapp logisk trenger en destinasjon som IKKE står i kartet: **stopp og spør Anders**. Ikke gjett, ikke finn opp en rute.
- Hvis du er i tvil om struktur, produkt eller Workbench: **spør**. Du velger fritt KUN visuell stil, layout og tekst innenfor reglene under.

### 1 · Hva appen er (intensjonen bak alt)

Vi bygger verktøyet som forteller hver golfspiller — uansett alder og nivå — **nøyaktig hva de skal trene på for å nå neste nivå**, basert på data, og holder dem til å gjøre det. **Tallet er helten. Diagnose, ikke gjetting.**

De fem tingene som MÅ sitte:
1. **Diagnose → neste nivå.** Spiller ser nivået sitt + de 2–3 tingene som lukker gapet, rangert etter slag-gevinst.
2. **Stats inn, lavfriksjon.** Manuell SG-import + on-course slag-logging (INGEN banekart i V1).
3. **Plan som følger diagnosen.** Ett trykk inn i Workbench; AI foreslår, spiller/coach godkjenner.
4. **Mot proffene.** Persentil + minst én konkret utfordring mot pro/benchmark.
5. **Coach-loop i AgencyOS.** Se stall, se hvem som er bak, tildel/godkjenn plan.

Følelsen: **Spiller** = «jeg vet på 5 sekunder hva jeg skal gjøre i dag og hvorfor». Rolig, presist, motiverende — aldri mas, aldri Candy Crush. **Coach** = «jeg ser umiddelbart hvem som trenger meg nå». **Forelder** = «jeg forstår barnets fremgang, forklart — ikke rådata».

### 2 · Designsystemet (LÅST — ikke avvik)

**Farger (tokens):** cream `#FAFAF7` (base, aldri ren hvit) · paper `#FFFFFF` (kort) · sand `#F1EEE5` · ink `#0A1F17` (tekst) · muted `#5E5C57` · **forest `#005840`** (merke, primær handling) · **lime `#D1F843`** (signal/aksent) · border `#E5E3DD`. Status: ok/up `#1A7D56` · warn `#B8852A` · urgent/down `#A32D2D` · info `#2563EB`. Pyramide-akser: Fysisk forest · Teknisk warn · Golfslag info · Spill lime · Turnering urgent.

**Lime-regelen (kritisk):** lime er krydder, ikke tapet. **Aldri lime tekst alene på lys bakgrunn** (mørk tekst på lime, aldri lime på lime). På mørkt tema er lime tekst OK.

**Typografi:** Inter (UI/brødtekst) · **Inter Tight** (display/hero, tett tracking, editorial italic-aksent) · **JetBrains Mono** (ALLE tall, eyebrows, KPI-labels, tabular-nums alltid). Norsk tallformat: komma-desimal, mellomrom som tusenskille, % etter mellomrom, 24t klokke. Signert delta: ▲▼ + farge.

**Komponenter (gjenbruk disse — de finnes i designsystemet):** Avatar, Badge, Button (lime/forest/ghost), Eyebrow, KpiCard, KpiRing, PyramidProgress, SgBar, StatTable, EmptyState, Skeleton, StatusPill, MasteryRing, StreakTracker.

**Spacing:** 4·8·12·16·24·32·48·64. Radius: 8·14·20·28·full (piller + knapper helt runde). Hairlines (1px) organiserer rader/celler — ikke bokser overalt. Lav, varm-tonet elevasjon.

**Ikoner:** kun **Lucide** (1,5px stroke). **Ingen emoji. Ingen hjemmetegnede SVG-er.**

**Tema per produkt (LÅST 2026-06-22):**
- **PlayerHQ: ALLTID LYST.** Ingen mørk-toggle på spillerappen.
- **AgencyOS: lys/mørk-toggle** (sol/måne i topbar, default **mørk** «terminal»-cockpit). Begge temaer skal designes.
- **Forelder + Marketing: lyst.**

**Fire tilstander overalt:** hver dataflate tegnes i **innhold · tom · laster (skeleton, aldri spinner) · feil**.

**Språk:** norsk bokmål, «du»-form. Ordbok: «nærspill» (ikke kortspill), «spiller» (ikke elev), «økt» (ikke session), «statistikk» (ikke stats), «mål» (ikke goal). «ELITE» og «CoachHQ» vises ALDRI.

### 3 · NAVIGASJONSKART — knapp → skjerm (FASIT fra koden)

> Dette er den autoritative IA-en. Design mot DENNE, ikke mot eldre plandokumenter.

#### PlayerHQ — `/portal` (spiller, ALLTID LYST). 5 faner: mobil bunn-nav + desktop sidebar.

| Fane | Rute | Undersider (knapper fører hit) |
|---|---|---|
| **Hjem** | `/portal` | Dashboard. Knapper: «Start dagens økt»→live-økt · «Se hele planen»→Plan · «Logg runde»→runde-logg · coach-notat-kort→coach-melding · bjelle→`/portal/varsler` · avatar→Meg |
| **Plan** | `/portal/planlegge` (→Workbench) | Årsplan `/portal/tren/aarsplan` · Treningsplan `/portal/tren/teknisk-plan` · Fysplan `/portal/tren/fys-plan` · Mål `/portal/mal` · Turneringer `/portal/tren/turneringer` · Drills `/portal/drills` · Coach-planer `/portal/coach/plans` · Coach-meldinger `/portal/coach/melding` |
| **Gjør** | `/portal/gjennomfore` | Ny økt `/portal/ny-okt` · Øktlogg `/portal/gjennomfore` · Treningslogg `/portal/trening/logg`. Live-økt = fullskjerm `/portal/(fullscreen)/live/[id]/brief→active→summary` |
| **Analyse** | `/portal/analysere` (faner) | Statistikk `/portal/analysere` · Strokes gained `/portal/mal/sg-hub` · Runder `/portal/mal/runder` · TrackMan `/portal/mal/trackman` · Tester `/portal/tren/tester` · Innsikt `/portal/analysere/hull` |
| **Meg** | `/portal/meg` | Profil · Abonnement `/portal/meg/abonnement` · Bookinger · Innstillinger (+personvern/varsler/språk) · Helse · Utstyrsbag · Dokumenter · Hjelp · Sikkerhet |

> **VIKTIG retting mot forrige handover:** `/portal/mal/sg-hub`, `/mal/runder`, `/mal/trackman` er KANONISKE Analyse-undersider (appen navigerer dit) — de skal IKKE kuttes. Coach-hub `/portal/coach` (Meldinger/Notater/Spørsmål/Videoer/AI, Pro-only) nås fra Plan + Hjem. Varsler nås fra bjella.

#### AgencyOS — `/admin` (coach, MØRK terminal + lys-toggle). Cockpit + gruppert sidebar.

**Cockpit** `/admin/agencyos` med fane-rad: **I dag** · **Live** `/agencyos/live` · **Uka** `/agencyos/uka` · **Spillere** `/agencyos/spillere` · **Økonomi** `/agencyos/okonomi` (admin) · **Caddie** `/agencyos/caddie` (admin).

**Sidebar (gruppert — IKKE en flat liste):**

| Gruppe | Knapper → skjerm |
|---|---|
| **Daglig** | Oversikt `/admin/agencyos` · Min uke: Ukeoversikt `/admin/workspace`, Oppgaver `/admin/workspace/oppgaver`, Tildelt meg `/admin/workspace/tildelt-meg` |
| **Stall & talent** | Spillere `/admin/spillere` · Stall `/admin/stall` · Grupper `/admin/grupper` · Talent: Radar `/admin/talent/radar`, Sammenligning `/admin/talent/sammenligning`, WAGR-import `/admin/talent/wagr-import` |
| **Operasjon** | Workbench `/admin/coach-workbench` · Handlingssenter `/admin/handlingssenter` · Planlegge: Treningsplaner `/admin/plans`, Plan-maler `/admin/plan-templates`, Drill-bibliotek `/admin/drills`, Økter `/admin/okter`, Teknisk plan `/admin/teknisk-plan`, Turneringer `/admin/tournaments` · Gjennomføre: Kalender `/admin/kalender`, Bookinger & kapasitet `/admin/bookinger`, Anlegg `/admin/anlegg`, Tilgjengelighet `/admin/availability`, Tjenester `/admin/services`, TrackMan `/admin/trackman`, Opptak `/admin/recording` |
| **Analyse** | Stall-analyse `/admin/analyse` · Risiko `/admin/risiko` · Lag-snitt `/admin/lag-snitt` · Tester `/admin/tester` · Runder `/admin/runder` · Compliance `/admin/analysere/compliance` · Reach `/admin/reach` · Rapporter `/admin/reports` |
| **Innboks** | Forespørsler `/admin/foresporsler` · Godkjenninger `/admin/godkjenninger` · Meldinger `/admin/innboks` |
| **System** | Økonomi `/admin/okonomi` · Team `/admin/team` · Integrasjoner `/admin/integrasjoner` · AI-agenter `/admin/agents` · E-postmaler `/admin/email-templates` · Audit-logg `/admin/audit-log` · Innstillinger `/admin/settings` |

**Spiller-detalj** `/admin/spillere/[id]` med faner: Profil · Fremgang · Tester · Tildel test · Workbench · Plan. «Send plan til spiller»→laster perioder hos spilleren + varsel.

> **VIKTIG retting:** Anlegg = `/admin/anlegg` er KANON (IKKE `/facilities`+`/locations` — det er motsatt av forrige handover). Økonomi/Team/Anlegg er ADMIN-only (skjules for ren COACH-rolle). Mobil: bunn-nav (Oversikt·Stall·Kalender·Innboks·Mer).

#### Forelder — `/forelder` (lys, lesemodus)
Hjem `/forelder` · Barn `/forelder/barn/[id]` · Bookinger · Fakturaer · Økonomi · Ukerapport · Varsler · Innstillinger · Samtykke `/forelder/samtykke` (GDPR per barn).

#### Auth / Onboarding
Login `/auth/login` · Registrer `/auth/signup` · Glemt/Reset passord · Sjekk e-post · Onboarding-wizard (spiller/forelder/coach/klubb: profil→mål→nivå-test→SG→kohort→plan) · Foreldresamtykke `/auth/guardian-consent/[token]`.

#### Marketing — `akgolf.no` (lys, «moderne»)
Hjem `/` · Coaching `/coaching` · Coacher `/coacher` (+slug) · Cases `/cases` · Anlegg `/anlegg` (+slug) · Blogg `/blogg` (+slug) · Turneringer `/turneringer` (+slug) · Priser `/priser` · Junior `/junior` · Om oss `/om-oss` · Kontakt `/kontakt` · FAQ `/faq` · PlayerHQ-landing `/playerhq`. CTA «Start gratis»→`/auth/signup`.

#### Booking-flyt
`/booking` (velg lokasjon) → `/booking/[slug]` (velg dag+tid) → `/booking/[slug]/bekreft` (gjeste-skjema) → Stripe → `/booking/kvittering/[id]`. **Legg «opprett konto»-bro på kvitteringen** (i dag blindvei).

#### Stats — `/stats` (eget produkt-spor, eget uttrykk)
Hub `/stats` · PGA-metrikker `/stats/pga/*` · Spillere · Baner · Turneringer · Verktøy/kalkulatorer · SG-sammenlign. Behandles som eget uttrykk med egen vedvarende nav.

### 4 · Hva som vises hvor (innholds-spec for kjerneflatene)

- **PlayerHQ Hjem:** foto/forest-hero med «Hei, {fornavn}» (Inter Tight italic), HCP + neste turnering-teller, tier-pill «PlayerHQ · {tier}». KPI-stripe (SG totalt, snittscore, neste økt) med mono-tall + signert delta. «Dagens økt»-kort (→ start). Coach-notat. Diagnose-kort: nivå + 2–3 gap-punkter rangert.
- **PlayerHQ Analyse:** diagnose først (nivå+gap), så SG-bar mot benchmark, faner (SG·Runder·TrackMan·Tester·Innsikt). Tallet er helten.
- **PlayerHQ Plan/Workbench:** zoom År(Gantt)/Uke/Økt. AI foreslår → «Godkjenn» laster økter inn. Ett trykk fra Plan-fanen.
- **PlayerHQ Gjør/Live:** dagens program → «Start» → fullskjerm live (brief→active→summary), trygg PAUSED/avbrudd, ≤1 trykk per logget resultat.
- **AgencyOS Cockpit:** «hvem trenger meg nå»-kø (spiller + grunn + status-pill), dagens timeline, KPI-rad (aktive spillere, forespørsler, økter i dag, stall-SG, plan-adherence), «Tildel plan». 0 trykk til det viktigste.
- **AgencyOS Stall:** tett tabell (rad ≥md → kort <md), avatar-toner regelstyrt (lime=økt i dag, pri=haster). Rad→spiller-detalj.
- **AgencyOS Handlingssenter:** master-detalj innboks + faner (Kø/Forespørsler/Godkjenninger). «Godkjenn/Avslå».

### 5 · Wireframe + UI/UX-optimalisering (gjør dette aktivt)

- **Trykkbudsjett:** kjernehandlinger ≤ **2 trykk**. Spiller app→start økt = 2. Logg ett resultat = 1. Coach oversikt→godkjent forslag = 2. Forelder→barnets neste økt = 0 (synlig ved innlogging).
- **Responsivt 375 / 768 / 1280:** ingen mobilbredde på desktop, ingen side-scroll på mobil. Tett «Bloomberg»-tetthet på data-flater (12/14px tillatt der), 8pt-grid ellers. Touch-mål ≥ 44px på mobil.
- **Hierarki:** tallet/diagnosen er helten på hver skjerm. Eyebrow (mono) → display-tall → kontekst. Hairlines fremfor bokser.
- **Ingen døde knapper.** Hver CTA har destinasjon fra kartet. Tomme tilstander har en «neste handling».
- **Motion:** 150–250ms ease-out, progress-fyll + opptelling, skeleton-puls (aldri spinner). Forest-glød på aktiv økt.
- **Konsistens:** PlayerHQ mobil bunn-nav = desktop sidebar (samme 5 seksjoner). AgencyOS desktop sidebar = mobil-skuff (samme grupper).

### 6 · Hva du IKKE designer i V1
Ikke UpGame-stil banekart/baneguide. Ikke egne fysisk-trenings-/test-sider (ett kort under «generelt» i Workbench). Ikke «ELITE»-tier. Ikke «CoachHQ»-navn. Ikke offline on-course. Kun norsk i beta.

### 7 · Leveranseformat (slik vil jeg ha det tilbake)
- **Én skjerm per artifact/fil.** Navngi etter ruten fra kartet (f.eks. `PlayerHQ — Analyse (/portal/analysere)`).
- For hver skjerm: vis **fire tilstander** (innhold/tom/laster/feil) og **tre bredder** (375/768/1280) der relevant.
- **Annotér hver knapp** med destinasjonen fra kartet, så porting til kode blir entydig.
- Bruk designsystem-komponentene (del 2) og temaet som hører til produktet (del 2 + 3).
- Start med kjerneflatene (PlayerHQ Hjem/Analyse/Plan/Gjør + AgencyOS Cockpit/Stall/Handlingssenter), så long-tail.

### 8 · Når du er i tvil
Ikke gjett på struktur, produkt eller Workbench. Hvis en knapp mangler destinasjon i kartet, et innhold er uklart, eller noe kolliderer med en låst regel: **list spørsmålet og spør Anders** før du designer videre. Rene visuelle/layout/tekst-valg innenfor reglene tar du selv.

---

*Prompten over er selvstendig. Kartet i del 3 er kode-forankret per 2026-06-24 og er fasiten for «riktig skjerm bak riktig knapp».*
