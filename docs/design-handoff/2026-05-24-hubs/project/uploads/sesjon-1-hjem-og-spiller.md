# SESJON 1 · Hjem-sider + Spiller-detalj-flyt

**5 skjermer · 14 timer implementering · høyest impact**

Lim inn HELE denne fila som første prompt i en ny Claude Design-canvas.

---

## Kontekst

AK Golf HQ-plattformen er Anders Kristiansens golf-coaching-system. To portaler:
- **PlayerHQ** (`/portal/*`) — spillerens lyse, varme arbeidsflate (lys tema)
- **CoachHQ** (`/admin/*`) — coachens kontroll-senter med mørk forest-sidebar

Disse 5 skjermene må matche siste pixel-perfekte design fra tidligere bundles (testmodul, planlegge, workspace, ai-modaler). De brukes daglig — entry-point for begge portaler + Anders' viktigste verktøy.

## Design-tokens (eksakt match)

- Forest primary: `#005840`, dark `#003A2A`
- Accent lime: `#D1F843`, deep `#BFE933`, soft `rgba(209,248,67,0.35)`
- Surface: `#FAFAF7`, card `#FFFFFF`, line `#E5E3DD`
- Ink: `#0A1F17`, muted `#5E5C57`, subtle `#9C9990`
- Success: `#2C7D52`, warn: `#B8852A`, danger: `#A32D2D`
- Pyramide-farger: FYS `#005840` · TEK `#1A7D56` · SLAG `#D1F843` · SPILL `#B8852A` · TURN `#5E5C57`
- Fonts: Inter (body), Inter Tight (display), **Instrument Serif** italic (ett-ord-italic i hero), JetBrains Mono (tabular-nums)
- Radius: 16px (cards), 999px (pills), 8-12px (knapper)
- 8pt-grid spacing

## Mønstre å gjenbruke

- **Hero**: eyebrow (mono caps) + tittel "Lead-ord *italic-ord*" + sub (mono med dot-separator)
- **KPI-row**: 4 celler, første "featured" (forest gradient + lime tall)
- **Status-pill**: små mono-pills med dot-prefix (ontrack/atrisk/done)
- **CoachHQ-sidebar**: mørk forest #0F2A22 med lime aktive-strek venstre, 6-seksjons IA
- **Card-styling**: hvit bg, border #E5E3DD, 16px radius, padding 20-24px

---

# SKJERM 1 · `/portal` — PlayerHQ Workbench (spillerens hjem)

**Lever 3 desktop-varianter + 1 mobile-mockup.**

### Variant A — Stack-layout (klassisk, anbefalt utgangspunkt)

**Topp:**
- MiniTopbar med eyebrow "PLAYERHQ · {dato}" venstre + player-chip (avatar+navn+HCP) høyre + ViewMode-toggle
- Hero med spiller-avatar XL (klikkbar → /portal/meg) + "God morgen, *Markus*" (Instrument Serif italic) + HCP-pill + tier-pill (PRO/GRATIS)
- Wetter-chip topp-høyre med live puls hvis utendørs-økt planlagt i dag

**KPI-strip (4 celler):**
- **Featured** (forest gradient): Snittscore 67,3 · lime tall · "+3,2 mnd"
- Neste turnering: "OLYO LARVIK · om 14 dg"
- Tester-progresjon: "12/36 · 33%"
- HCP-trend: 4,8 ned-sparkline med "↓ 0,4 i mai"

**Dagens fokus-card (priority, lime accent venstre):**
- Header: "Du har 2 ting i dag"
- Expandable rader:
  - 14:00 · Drill-økt putt-fokus · 20 min · Mulligan Studio
  - 17:00 · Faktura-frist · sjekk Stripe

**Pyramide-uke-strip (7 dager Man-Søn):**
- Per dag: drill-prikker fargekodet (FYS/TEK/SLAG/SPILL/TURN)
- "I dag"-markør med lime border

**Coach-ping-banner** (vises kun hvis ulest melding):
- Lime accent + "Anders skrev: 'Sjekk start-linja før lunsj'" + "Svar →"-CTA

**Hovedinnhold (2-kol):**
- Venstre kol (65%):
  - **Aktiv plan-card**: "Vinter 2026 · grunntrening" italic + progress-bar + "Åpne plan →"
  - **Neste milepæl-card**: "HCP 3,8 innen 14. juli" + sparkline + dager igjen
- Høyre kol (35%):
  - **Aktivitet-feed**: siste 5 events (økt/test/runde/coach-melding) som mini-rader

**Bunn-CTA:**
- "Start dagens økt" (lime, full bredde)
- "Ny økt fra plan" (ghost)

### Variant B — 3-kol command-center
- Venstre (30%): aktiv plan + neste milepæl + aktivitet-feed
- Midt (40%): dagens fokus + brenner-tasks + pyramide-strip
- Høyre (30%): live-data (Garmin puls hvis koblet / TrackMan-status / vær)

### Variant C — Magazine-stil
- Stort cover-bilde (banen) som hero-bakgrunn
- "God morgen, *Markus*" som overlay tekst
- Stats-row som overlay nederst
- 2-kol grid cards under

**Mobile (Variant A):**
- Hero stacker vertikalt
- KPI-strip 2x2 grid
- Pyramide-uke-strip blir horizontal scroll
- Bunn-nav (5 ikoner)

---

# SKJERM 2 · `/admin/agencyos` — CoachHQ Hjem (Anders' kommando-senter)

**Lever 3 desktop-varianter + 1 mobile-mockup.**

### Variant A — Operations cockpit (anbefalt)

**Topp:**
- CoachHQ-sidebar venstre (6 seksjoner: Oversikt aktiv · Stall · Planlegge · Gjennomføre · Innsikt · Admin)
- Topbar med breadcrumb "CoachHQ / Hjem"

**Hero:**
- "God morgen, *Anders*" (Instrument Serif italic) — bryt linja: "Du har 4 økter i dag og 3 ting som brenner"
- Eyebrow "MANDAG 23. MAI · UKE 21"

**KPI-strip (4 celler):**
- Featured: "Aktive økter i dag" — 4 (lime)
- "Påmeldte denne uka" — 28 spillere
- "Brennende oppgaver" — 3 (rød tone)
- "Stall-helse-score" — 87% (med sparkline)

**I dag-tidslinje (sentralt):**
- Vertikal tidslinje 08:00-20:00
- Økt-cards plassert på riktig tidspunkt:
  - 09:00 · Markus R.P. · 60 min putt-fokus · Mulligan
  - 11:00 · Sofie L. + Henrik T. · 90 min gruppe · GFGK
  - 14:00 · Test-batteri Julia K. · 30 min · TrackMan
  - 16:00 · Ada N-B. · Privat 60 min · Mulligan
- Tom-cells med "+ Quick-add"-hover

**Brennende oppgaver-card (rød accent venstre):**
- 3 tasks som krever handling i dag:
  - "Avklare TrackMan-leie sommer 2026 · I dag 17:00"
  - "Send faktura Mulligan · I dag"
  - "Svare Olyo Tour om sponsor · I dag"

**Stall-overview-strip:**
- 6 mini-spiller-cards (avatar + navn + status-prikk)
- Status: aktiv (grønn) / skadet (rød) / permisjon (gul)
- Klikk → /admin/spillere/[id]

**Workspace-quick-strip (lime accent):**
- 3 oppgaver fra Notion-workspace
- "Åpne workspace →"-CTA

**Aktivitet-strøm (nederst, 2-kol):**
- Venstre: Siste meldinger (3-4 fra spillere)
- Høyre: Siste godkjenninger + påmeldinger

### Variant B — KPI-tunge dashboards
- Stort heatmap topp: uka time-for-time med drill-tetthet
- Side-by-side cards: økter-i-dag (vertikalt) + tomorrow-prep
- Hover-tooltips med detalj

### Variant C — Magazine-stil
- Hero med fokus-quote (Mac O'Grady-citat)
- 2x2 grid med varierte kort-størrelser (asymmetrisk Bento)

**Mobile (Variant A):**
- Tidslinje blir 1-kol med store touch-targets
- KPI-strip 2x2
- Bunn-nav (4 ikoner: Hjem · Stall · Plan · Mer)

---

# SKJERM 3 · `/admin/spillere/[id]` — Spiller-detalj hovedside

**Lever 2 desktop-varianter + 1 mobile.**

### Variant A — Tab-basert (anbefalt)

**Hero:**
- Stor avatar venstre + navn "Markus R. *Pedersen*" (Instrument Serif italic på etternavn)
- Pills: A1 (cohort) · HCP 4,8 · WAGR 2 142 · Aldersgruppe 17 år · PRO
- Action-knapper høyre: "Send melding" · "Tildel test" · "Ny økt" · "..."-meny

**5 tabs (lime accent active):**
- Profil (default)
- Plan
- Tester · 12/36
- Analyse
- Notater

**4-celle KPI-strip under tabs:**
- HCP-trend (sparkline + tall): 4,8 ↓ 0,4
- SG-total: −1,6 (forest)
- Tester gjort: 12/36
- Neste økt: "I dag 14:00 · Putt"

**Tab-innhold (Profil):**
- **Personalia-card**: 2-kol fact-grid (navn, fødselsdato, klubb, telefon, e-post, postadresse, sertifiseringer)
- **Forelder/verge-card**: 1-3 cards med Stripe-betaler-flagg
- **Aktivitet-tidslinje** (siste 30 dager): økter/tester/meldinger som events på vertikal linje
- **Coach-notater-card** (italic Instrument Serif): nyeste 3 notater fra Anders
- **Bunn-CTA-bar**: 4 store knapper (Send melding / Tildel test / Ny økt / Be om permisjon)

### Variant B — Split-view (uten tabs)
- Venstre 60%: personalia + forelder + spiller-DNA + mål
- Høyre 40%: aktivitet-feed + coach-notater + quick-actions

**Mobile:**
- Hero stacker, action-knapper blir 2-rad
- Tabs blir horizontal scroll
- Sub-cards 1-kol full bredde

---

# SKJERM 4 · `/admin/spillere/[id]/profil` — Spiller-profil detaljside

**Lever 1 desktop-variant + 1 mobile.**

**Sub-hero:**
- Breadcrumb-pill "← Tilbake til Markus R. Pedersen"
- Tittel "Spiller-*profil*" (italic)
- "Rediger"-knapp høyre

**Sections (vertikal stack):**

**1. Personalia (2-kol fact-grid):**
- Fullt navn, fødselsdato, alder, kjønn
- Telefon, e-post, postadresse
- Klubb-tilhørighet, klubb-nummer, hjemmeklubb
- Sertifiseringer (PGA, NGF), coaching-historikk

**2. Forelder/verge (1-3 cards):**
- Per card: navn + avatar + relasjon + telefon + Stripe-betaler-flagg
- "+ Legg til forelder"-CTA

**3. Spiller-DNA (5-akset radar):**
- Pentagon med FYS/TEK/SLAG/SPILL/TURN-akser
- 2 overlay: spillerens snitt (lime) + cohort-snitt (grå dotted)
- Tooltip per akse med detalj

**4. Aktive mål (3 mål-cards horisontalt):**
- Per card: type-pill (Resultat/Prosess/Atferd) + tittel + progress-ring + deadline

**5. Skader/permisjoner-historikk:**
- Tabell med rader: type · fra/til · beskrivelse · status
- Tom-state hvis ingen

**6. Coachens vurdering (Instrument Serif italic blokk-quote):**
- "Markus har stor teknisk progresjon, men trenger fortsatt mental robusthet i turnerings-press. Fokus til vinter: pre-shot rutine 7 sek + putting under 2,5m."
- Signatur: Anders Kvam · oppdatert 21. mai

---

# SKJERM 5 · `/admin/spillere/[id]/rediger` — Rediger spiller

**Lever 1 desktop-variant + 1 mobile.**

**Hero:**
- Breadcrumb "← Markus R. Pedersen · Rediger"
- Tittel "Rediger *spiller*"
- Sticky save-bar topp-høyre (skjules ned ved scroll): Lagre (lime, primary) + Avbryt (ghost)

**Form-layout (2-kol):**

**Venstre kol (60%):**
- **Personalia-seksjon:**
  - 2-kol form-grid: fornavn, etternavn, fødselsdato, kjønn, telefon, e-post, klubb-nr, hjemmeklubb
  - Inline validering (rød border + tekst under hvis feil)
- **Adresse-seksjon:**
  - Gate, postnr, sted, land
- **Coaching-seksjon:**
  - Cohort-dropdown, HCP-tall, ambisjon, Mac O'Grady-faze, life-kode
- **Notater (textarea, expanding):**
  - "Interne notater (kun coach ser dette)"

**Høyre kol (40%):**
- **Endrings-historikk (sticky):**
  - Tabell med rader: "21.05 14:23 · Endret HCP fra 5.2 → 4.8 · av Anders"
  - Filter: alle / siste 30 dg / mine endringer
- **Foreldre-quick-edit:**
  - 1-3 cards som kan klikkes for å åpne inline-edit-modal

**Footer:**
- Sticky save-bar med Lagre/Avbryt + "Slett spiller"-knapp (rød ghost, krever bekreftelse)

**Mobile:**
- 1-kol layout
- Sticky save-bar bunn (fixed)
- Endrings-historikk blir collapsible accordion

---

## LEVER

**Total artboards:** ~20 artboards på én Claude Design-canvas
- Skjerm 1 (Workbench): 3 desktop + 1 mobile
- Skjerm 2 (Coach hjem): 3 desktop + 1 mobile
- Skjerm 3 (Spiller-detalj): 2 desktop + 1 mobile
- Skjerm 4 (Spiller-profil): 1 desktop + 1 mobile
- Skjerm 5 (Rediger spiller): 1 desktop + 1 mobile

**Separate `.jsx`-filer per skjerm (anbefalt):**
- `s1-playerhq-workbench.jsx`
- `s2-coachhq-hjem.jsx`
- `s3-spiller-detalj.jsx`
- `s4-spiller-profil.jsx`
- `s5-rediger-spiller.jsx`

**Felles `shared.jsx`** for primitives som brukes på flere skjermer:
- HeroBlock (eyebrow + italic-tittel + sub)
- KpiStrip (4-celler med featured-first)
- StatusPill (ontrack/atrisk/done varianter)
- TabBar (lime accent)

---

## Arkitektur-notat (for coding agent)

**Eksisterende tokens:**
- Globale design-vars: `src/app/globals.css` (forest, lime, etc.)
- Athletic primitives: `src/components/athletic/*`
- Workspace primitives: `src/components/workspace/primitives.tsx`

**Bytte rute:**
- /portal/page.tsx — erstatter dagens lazy-loaded shell
- /admin/agencyos/page.tsx — erstatter dagens agencyos-side
- /admin/spillere/[id]/page.tsx — eksisterer, må refaktoreres
- /admin/spillere/[id]/profil/page.tsx — opprette ny
- /admin/spillere/[id]/rediger/page.tsx — opprette ny (mangler iflg audit)

**Sample-data brukes inntil:**
- Aktivitet-feed (kan bruke eksisterende `Notification` + `Booking` + `TestResult` queries)
- Spiller-DNA-radar (bruk `User.preferences.spillerDna` JSON-felt — finnes allerede)
- Aktiv plan-card (`TrainingPlan.findFirst({ status: "ACTIVE" })`)

**Behold:**
- Auth: `requirePortalUser()` på alle ruter
- `export const dynamic = "force-dynamic"`
- Sidebar (allerede oppdatert med 6-seksjons IA)
