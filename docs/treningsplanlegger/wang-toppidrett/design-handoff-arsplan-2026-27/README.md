# Handoff: WANG Toppidrett Fredrikstad — Årsplan 2026/27 (fellesside golf)

## Oversikt
En delbar lesevisning for elever, foresatte og trenere ved WANG Toppidrett Fredrikstad
(gruppen Toppidrett golf, 14 elever, VG1–VG3 samlet). Siden samler hele treningsåret:
årshjul uke 34 → uke 24, periodisering («pyramiden»), månedsplan, den faste treningsuken,
øktplaner med kompetansemål per trinn, skolens timeplan/skolerute/prøveplaner, en
kalender (tidslinje/uke/måned/år) og en foreldrefane med fredagens ukessammendrag.

Målet med porteringen: **samme design, i kode** — deretter legges reelle data inn
(se `DATA-KONTRAKT.md`).

## Om designfilene
Filene i `design/` er **designreferanser skrevet i HTML** — en prototype som viser
tilsiktet utseende og oppførsel, ikke produksjonskode som skal kopieres rett inn.
Oppgaven er å **gjenskape designet i kodebasens eksisterende miljø**
(`akgolfsoftware/Golf_Headquarters`, Next.js/React + Tailwind/CSS-variabler) med
kodebasens etablerte mønstre og komponenter. HTML-en er sannhet for **utseende,
innhold og oppførsel** — ikke for filstruktur eller rammeverk.

Prototypen er skrevet i et internt «Design Component»-format (`.dc.html`): markup i
`<x-dc>` med inline styles + en logikklasse (`class Component extends DCLogic`) med
`renderVals()` som returnerer data til template-hullene `{{ ... }}`. Les den som:
template = JSX, `renderVals()` = derived state/props, `state = {...}` = React state.
`support.js` er kun prototype-runtime og skal **ikke** portes.

## Fidelity
**Høy fidelity (hifi).** Farger, typografi, spacing, radius, skygger og all copy er
endelige og hentet fra designsystemet «WANG Treningsplattform» (WANG Designmanual 2021).
Gjenskap pikselnært med kodebasens eksisterende komponenter der de finnes; bruk tokenene
i `design-tokens/` som kilde for alle verdier. Ingen nye farger skal innføres.

---

## Informasjonsarkitektur

Sticky header (høyde ~56 px, `rgba(255,255,255,0.92)` + `backdrop-filter: blur(12px)`,
1 px bunnlinje `--border-subtle`) med WANG-logo til venstre og fire pill-faner til høyre.
Aktiv fane = fylt navy pille (`--wang-navy`, hvit tekst); inaktiv = transparent med
`--text-primary`. Fanebytte scroller til topp.

| Fane | Seksjoner (ankere) | Hero |
|---|---|---|
| Trening | `#arsplan`, `#periodisering`, `#manedsplan`, `#ukeplan`, `#oktplaner` | Ja (navy hero + gruppebånd) |
| Skole | `#skoleplan`, `#kompetansemaal`, `#prover` | Nei |
| Kalender | `#kalender` | Nei |
| Foreldre | `#ukessammendrag`, `#foreldremoter`, `#praktisk` | Nei |

Under hver fane ligger en rad med sekundære ankerlenker (pill, `--neutral-50`-bakgrunn,
12,5 px/700). Nederst på alle faner: kontaktkort («Spørsmål om planen?») og navy footer
med crest, tittel og «Sammen lykkes vi» i mint.

Maks innholdsbredde: **1160 px**, sidepadding `clamp(16px, 4vw, 28px)`.
Seksjonspadding topp: `clamp(36px, 6vw, 56px)`.

---

## Skjermer og seksjoner

### Hero (kun Trening-fanen)
- Bakgrunn: `linear-gradient(160deg, color-mix(in srgb, var(--wang-navy) 82%, white) 0%, var(--wang-navy) 55%, color-mix(in srgb, var(--wang-navy) 82%, black) 100%)`, hvit tekst.
- Dekor: to sirkler øverst til høyre, `border: 1.5px solid var(--wang-mint)`, `opacity: .2`, 420 px og 250 px, `pointer-events: none`.
- Label (t-label, mint): «WANG Toppidrett Fredrikstad · Toppidrett golf».
- H1: «Årsplan 2026/27» — Montserrat 800, `clamp(30px, 6.5vw, 52px)`, line-height 1.05.
- Ingress: `clamp(15px, 2.2vw, 17px)`, `rgba(255,255,255,0.78)`, maks 620 px.
- Gruppebånd nederst (`rgba(255,255,255,0.06)`): «Gruppen» (17/700) + «14 elever · VG1–VG3 samlet · 16–19 år» + «Man · ons · fre 08:00–10:00 · Gamle Fredrikstad GK» + mint «Sammen lykkes vi» høyrejustert.

### 01 Årsplan (`#arsplan`)
Seksjonshode-mønsteret som gjentas i alle seksjoner: 34×34 px squircle (radius 12) med
`--tint-navy`-bakgrunn og nummer i `--wang-navy` (Montserrat 800/14) + t-label i
`--wang-teal-text`, deretter H2 `clamp(24px, 4.2vw, 34px)`/700/1.1 og ingress
`clamp(14.5px, 2vw, 16.5px)`/1.6 i `--text-secondary`, maks 640–660 px.

Innhold: hvitt kort med 11 månedskolonner (`grid-template-columns: repeat(11, 1fr)`).
Hver måned er en knapp med søyle hvis høyde er 40 px (aktiv) / 30 px (inaktiv) og farge
fra periodefasen; opacity 1 / 0,42. Hover eller klikk på en måned oppdaterer detaljkortet
under (fase, tema, aktiviteter) — `onMouseEnter` peker, `onMouseLeave` nullstiller.
Periodekortene under er utvidbare (åpen periode vises med nøkkelpunkter og øktrad).

Fasefarger (brukes konsekvent overalt):
| Fase | Navn | Farge | Tint |
|---|---|---|---|
| TURN | Turnering | `--cat-orange` | `--tint-orange` |
| GRUNN | Grunnperiode | `--wang-teal` (tekst: `--wang-teal-text`) | `--tint-teal` |
| SPES | Spesialisering | `--cat-blue` | `--tint-blue` |
| TEST | Testuke | `--cat-purple` | `--tint-purple` |
| FERIE | Ferie | `--neutral-400` | `--tint-gray` |

### 02 Periodisering — «Pyramiden» (`#periodisering`)
Pill-velger GRUNN/SPES/TURN (aktiv = navy fylt). Under: fem akserader
(TEK, SLAG, SPILL, TURN, FYS) i grid `minmax(84px,120px) 1fr` med prosentsøyle,
minutter (norsk format: «1,5 t») og forklaring. Prosentene **beregnes** fra planlagte
øvelser + planlagt egentrening (`beregnPyramide()`), ikke hardkodet. Bytte av pille
re-animerer blokken (`wangFadeUp` 320 ms `cubic-bezier(.22,1,.36,1)` via `key`).

### 03 Månedsplan (`#manedsplan`)
Vertikal tidslinje, 11 måneder. Hver måned: månedskort (kort navn + år), fasechip, tema,
og hendelsesrader fargekodet etter type — trening `--wang-teal`, konkurranse
`--cat-orange`, test/prøve `--cat-purple`, skole/ferie `--cat-blue`. Legend over.

### 04 Ukeplan (`#ukeplan`)
Kort med mint-topplinje: «VG1–VG3 samlet · 3 økter/uke · 6 timer» + «Skoleåret 2026/27».
Tre rader (mandag/onsdag/fredag, 08:00–10:00) med felles øktmal. Fotnote i
`--neutral-50`: individuell FYS/egentrening etter periodens pyramide.

### 05 Øktplaner (`#oktplaner`)
Kort per periode (auto-fit grid, min 290 px) med venstre/topp fargestripe i fasefargen,
øktkode-chips per øvelse (`pyramide_område_motorikk_belastning_press`), reps, varighet,
teknikkdimensjon og mål per trinn (VG1/VG2/VG3 eller valgt trinn).
Fotnote: faste regler (ny teknikk starter i kropp/arm, minimum CS50, KPI + dagbok,
testuker overtar hele økten).

### Skole: 01 Timeplan (`#skoleplan`)
Klassepiller VG1A/VG1B/VG2A/VG2B/VG3A/VG3B + «Kontaktlærer: …».
Timeplanrutenett i Apple Kalender-stil: tidskolonne + fem dagkolonner, timelinjer,
blokker plassert absolutt etter start/slutt. **Under ~700 px** (`erSmal`) vises
dagpiller og kun én dag av gangen — ingen horisontal scroll.
Under: «Skolerute 2026/27» (måned / tekst / uke) og «Foreldremøter · <klasse>».
Fotnote: 192 skoledager (84 høst, 107 vår) + oppstartsdag med overnatting for VG1.

### Skole: 02 Kompetansemål (`#kompetansemaal`)
Udir-mål gruppert per trinn: Toppidrett 1–3 (IDR05-02) og kroppsøving (KRO01-05)
side om side, med fagkode og ingress per trinn.

### Skole: 03 Prøver og eksamen (`#prover`)
Trinnpiller + rader (uke, tittel, detalj) fra skolens prøveperioder/eksamen.

### Kalender (`#kalender`)
Pill-velger **Tidslinje · Uke · Måned · År** (standardvisning er en prop, default Tidslinje)
+ typelegend (Økt og samling, Test, Skole og ferie, Merkedag).
Uke/måned/år bruker designsystemets `CalendarView`. Hendelseschips er `EventChip`.
Under rutenettet: «Valgt dag»-kort som lister dagens hendelser som knapper med
type-chip, tid, tekst og «→»-CTA som hopper til planen bak hendelsen.

**Viktige regler som er rettet i designet og MÅ bevares i koden:**
1. Hendelseschips **brytes over flere linjer** (`white-space: normal`, `overflow-wrap: anywhere`, `height: auto`, radius 10 px, padding 3/8 px) — tekst skal aldri klippes. Cellene vokser i høyde.
2. Rutenettet er `repeat(7, minmax(0, 1fr))` med `min-width: 0` på alt inni — ingen horisontal scroll.
3. Hver golføkt er merket med **pyramideaksen**, aldri generisk «golføkt»: `TEK-økt`, `SLAG-økt`, `SPILL-økt`, `TURN-økt`, `FYS-økt` + sted («GFGK» ute, «Treningslokalet» inne fra uke 44 til uke 13). Akse per ukedag følger periodens fordeling: GRUNN `[TEK, FYS, TEK]`, SPES `[SLAG, SPILL, TEK]`, TURN `[SPILL, TURN, SLAG]`, TEST `[TEK, SLAG, SPILL]`.
4. Etiketter er korte nok til å leses i en 100 px celle (f.eks. «Østlandstour 9 · Mørk Open», «Eksamen uke 21–22», «Olyo KP3 · Mjøsen GK · frist 2. sep»).

### Foreldre: 01 Ukessammendrag (`#ukessammendrag`)
Publiseres **hver fredag** av treneren.
- Tom tilstand (default i dag): kort med `--tint-teal`-bakgrunn, ingen skygge, «Første sammendrag kommer fredag <neste fredag beregnet fra dagens dato>» + forklaring (publiseres senest kl. 16).
- Siste rapport: navy hero-kort (samme gradient som hero, radius 26 px, padding `clamp(22px,3.4vw,32px)`): mint label «Uke {uke} · {datoer}», periode høyrejustert, målsetning i Montserrat 700 `clamp(18px,2.8vw,24px)`, fokus-chips (`rgba(255,255,255,0.12)`, radius 999), to kolonner («Gjennomført» som liste, «Høydepunkt» + «Neste uke»), trenernavn i mint nederst.
- Tidligere uker: hvitt kort med rader «Uke N» + målsetning + «Les»/«Skjul»-knapp (høyde 40 px, 1,5 px kant) som utvider gjennomført + neste uke.

### Foreldre: 02 Foreldremøter (`#foreldremoter`)
Ett kort per trinn (auto-fit, min 280 px), `height: 100%` så radene blir like høye,
3 px topplinje i trinnfargen (VG1 `--wang-teal-text`, VG2 `--cat-blue`, VG3 `--wang-navy`),
trinnnavn 17/800 i trinnfargen, antall møter høyrejustert med **korrekt entall/flertall**
(«1 møte» / «4 møter»), møtedatoer som rader med 1 px skillelinje, og temateksten festet
i bunnen (`margin-top: auto`). Alle møter kl. 17:00 på WANG Toppidrett Fredrikstad.

### Foreldre: 03 Praktisk (`#praktisk`)
Seks infokort (treningstider, sted, kontakt, turneringer, fravær og sykdom, utstyr) +
kort med «Fri, ferie og planleggingsdager» som rutenett av `--neutral-50`-brikker
(måned · uke + tekst) fra skoleruta.

---

## Interaksjoner og oppførsel
- **Fanebytte**: setter `fane`, scroller til topp. Kun Trening-fanen har hero.
- **Ankerlenker**: `scroll-behavior: smooth`, `section[id] { scroll-margin-top: 76px }`. Hopp fra kalenderhendelse til plan setter fane + scroller til anker med −70 px offset (60 ms delay etter fanebytte).
- **Trinnvelger** (Alle trinn / VG1 / VG2 / VG3) styrer mål og kompetansemål; bytte re-animerer blokken via `key`.
- **Månedspeker** i årshjulet: hover og klikk peker, mouse-leave nullstiller.
- **Periodekort**: klikk åpner/lukker (én åpen om gangen).
- **Kalender**: piller for visning, pil-navigasjon og «I dag»; klikk på dag velger dag; DS-komponentene har tastaturnavigasjon (piltaster/Enter) og `aria-live` på periodelabel.
- **Ukesrapport**: «Les»/«Skjul» per tidligere uke, én åpen om gangen.
- **Animasjon**: `wangFadeUp` (opacity 0→1, translateY 12px→0) 260–320 ms `cubic-bezier(.22,1,.36,1)` ved fane-/valgbytte. Alt bak `prefers-reduced-motion: reduce` (varighet 0,01 ms).
- **Responsivt**: alle grid er `auto-fit`/`minmax`, faner brytes over flere linjer, timeplanen faller tilbake til én dag om gangen under ~700 px, `body { overflow-x: hidden }` — designet skal ikke scrolle horisontalt på noen bredde.
- **Touch**: alle knapper og piller minimum 40–48 px høyde.

## State
| State | Default | Styrer |
|---|---|---|
| `fane` | `'trening'` | aktiv fane (`trening` \| `skole` \| `kalender` \| `foreldre`) |
| `trinn` (prop `trinn`) | `'Alle trinn'` | mål og kompetansemål |
| `pyr` | `'GRUNN'` | valgt periode i pyramiden |
| `apenP` | `'TURN'` | åpent periodekort |
| `pekM` | `null` | pekt måned i årshjulet |
| `klasse` | første klasse | valgt klasse i timeplanen |
| `kalValg` / `kalVisning` / `kalDato` / `kalAar` / `valgtDag` | Tidslinje / Uke / 18.08.2026 / 2026 | kalenderen |
| `apenRapport` | `null` | utvidet tidligere ukesrapport |

Props (tweaks) i dag: `trinn` (enum), `kalender` (enum: standard kalendervisning),
samt egentreningsminutter (`egenGrunn` 180, `egenSpes` 80, `egenTurn` 40,
`turneringSnitt` 120) som går inn i pyramideberegningen.

## Designtokens
Bruk `design-tokens/` som kilde (samme filer som designsystemet):
`colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`, `motion.css`, `styles.css`.

Kjerneverdier: navy `#17446F`, teal `#2E857D`, mint `#49CA9F`, teal-tekst (AA) `#226F67`,
oransje `#F47B20`, blå `#007DB1`, lilla `#7F1975`, rosa `#D12A5C`, gul `#FCD700`,
app-bakgrunn `#F4F6F8`, kort `#FFFFFF`, tekst `#1E293B` / `#475569`, kantlinje `#E9EDF1`.
Skygge: `0 8px 24px rgba(23,68,111,0.08)`. Radius: kort 20–28 px, chips/piller 999 px,
squircle-ikoner 12–14 px. Fonter: **Montserrat** 500–800 (overskrifter, tall, labels) og
**Quattrocento Sans** 400/700 (mengdetekst). Tall alltid tabular + norsk formatering
(mellomrom som tusenskiller, komma som desimaltegn, «6 %»).
Labels: 12 px uppercase, letter-spacing ~0.05em. **Ingen emoji** — Lucide-ikoner.
Casing: setningsbokstav i tekst, men klassenavn alltid **store bokstaver**: VG1, VG2, VG3,
VG1A, VG1B, VG2A, VG2B, VG3A, VG3B.

## Assets
`design/assets/wang-logo-horizontal.svg` (header, 36 px høy) og
`design/assets/wang-crest.svg` (footer, 38 px høy) — ekte vektorlogo fra skolen via
designsystemet. Beskyttet sone: 1× luft rundt, 1,5× under. Ingen fotografier brukes.

## Filer i denne pakken
```
design/WANG Arsplan 2026-27.dc.html   Designreferansen (all markup, styling, logikk)
design/ukesrapporter.js               Datafil for fredagens ukessammendrag (tom liste i dag)
design/ds-base.js, design/support.js  Prototype-runtime — SKAL IKKE PORTES
design/assets/                        Logo-SVG-er
design-tokens/                        Farger, typografi, spacing, motion, base (kilde for verdier)
DATA-KONTRAKT.md                      Datastrukturene siden trenger, felt for felt
```

## Kilder i kodebasen (`akgolfsoftware/Golf_Headquarters`, branch `main`)
- `docs/treningsplanlegger/wang-toppidrett/arshjul-2026-2027.md`
- `docs/treningsplanlegger/wang-toppidrett/kompetansemaal-toppidrett-vg.md`
- `docs/treningsplanlegger/wang-toppidrett/oktmal.md`
- `src/app/team-wang/_data/hent-wang-gruppe.ts`
- `src/lib/gruppe-kalender/wang-turneringer.ts`
- `designsystem/paper/templates/playerhq-planlegge/PlayerhqPlanlegge.dc.html`

Timeplan, skolerute, prøveplaner og foreldremøter kommer fra skolens egne PDF-er
(ikke repoet) og er transkribert inn i designet — se `DATA-KONTRAKT.md`.
