# PORTING.md — kontrakt til Claude Code

> Overleveringskontrakt for porting av AK Golf HQ design­systemet til produksjon
> (Next.js App Router · React · Tailwind v4 · shadcn/ui-base). **Mål: diff til null
> visuelt avvik.** Kilde-HTML/CSS/JS i denne repo-strukturen er fasit; Code porter
> og diffe mot den. Denne fila er inngangen — les den før du rører kode.

---

## 1. Porting-rekkefølge (følg den strengt)

1. **Tokens** → Tailwind v4 `@theme`. `tokens/*.css` er kilden. Alle fire tema-matriser
   er semantiske aliaser (`--bg`, `--surface`, `--text`, `--signal`, `--axis-*`, …) under
   `:root`(=dark), `.dark`, `.light`. Map 1:1 til Tailwind-tokens; ikke gjenskap råverdier.
2. **Primitiver** → shadcn/ui-base. Map DS-core/forms/overlays til shadcn-primitiver (tabell §4).
   Behold DS-ens klassenavn/tokens; shadcn gir kun a11y-mekanikk + struktur.
3. **Kanon-komponenter** → domain/feedback/data-signatur. Disse bærer forretnings­reglene
   (validering, anbefalingskontrakt, AK-formel, signaturgeometri) — port dem eksakt, IKKE
   gjenoppfinn API-et. Props/varianter/tilstander står i hver `<Name>.d.ts`.
4. **Skjermer** — KOMPONERES fra `components/` per hver komponents `prompt.md`-kontrakt, og
   verifiseres mot tilstandsgalleriet (`guidelines/tilstander.html`) + `guidelines/tema-bevis.html`.
   Denne handoffen inneholder ingen ferdigbygde skjermer — komponentene + kontraktene ER fasiten.
   DEKNINGSKART.md sier hvilke ruter som er dekket via system / out-of-scope / gjenstår.

## 2. Diff-til-null-regelen

- Piksel-fidelitet mot kilde-HTML er akseptansekriteriet. Avvik i farge, spacing, radius,
  font, vekt, tracking = feil å rette, ikke «tolkning».
- Alle farger er tokens. **Ingen rå hex i komponenter/templates** (unntak: dokumenterte
  mørke-innfellinger som re-asserterer `.dark`-scope). Finner du rå hex ved porting → token.
- Tall: JetBrains Mono, tabulære sifre. Norske desimaler med komma, tusen med mellomrom.

## 3. IKKE bygg på nytt (eksplisitt)

- **Kalender-/periodiserings-subsystemet finnes allerede i repoet (57 filer).** Det skal
  **kanoniseres visuelt via tokens**, ikke re-designes. Bytt farger/spacing til token-verdier;
  behold struktur og logikk. DS-komponentene `DayStrip/AgendaRow/UkeKalender/MaanedKalender/
  Periodeplan/TidsGrid/Tidslinje/VisningsVelger` er den visuelle fasiten å matche mot.
- **Genererte filer:** `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` —
  aldri rediger; regenereres fra kilde.
- **Interne dev-ruter** (`/intern/komponenter/*`, `/dev-banekart`) = out-of-scope for design.
- **`uploads/`** = kilde-IA (produksjons-fasit fra eier). Les, ikke endre.

## 4. Komponent-deling + shadcn-basis (manifest på familienivå)

> Full per-komponent-API: hver `components/<group>/<Name>.d.ts` + `_ds_manifest.json`.
> «Deling»: **delt** = samme motor på tvers av flater · **flate** = flate-spesifikk.

| Familie | Nøkkelkomponenter | Deling | shadcn/ui-base |
|---|---|---|---|
| core | Button, Tag, Card, Eyebrow, Icon, **ThemeToggle** | delt | button, badge, card, (toggle-group for ThemeToggle) |
| forms | Input, Select, Combobox, DatePicker, Checkbox, Radio, Slider, Textarea, Toggle, SegmentedTabs, CodeInput, FormField | delt | input, select, combobox(cmdk), popover+calendar, checkbox, radio-group, slider, textarea, switch, tabs, — , form |
| overlays | Modal, Sheet, Drawer, Popover, Tooltip, Toast, Banner | delt | dialog, sheet, drawer(vaul), popover, tooltip, sonner, — |
| structure | Avatar, EmptyState, Skeleton, Accordion, Pagination, Divider, Stepper, FilterPills, KanbanKolonne | delt | avatar, —, skeleton, accordion, pagination, separator, —, —, — |
| data-viz | KpiTile, HeroTall, Progress, Pyramid, **PyramideFasett**, SGTrend, Radar, DataTable, BarChart, LoadChart, CompareChart, LengdeAvvik, Heatmap, PercentileBar, RingGauge, Sparkline, DeltaIndikator, StatStrip, PPositionRail | delt | table (DataTable); resten custom SVG/CSS på tokens |
| domain/kanon | ValidationChip/Group, AnbefalingsKort, AKFormelChip, Laeringstrapp, SpillerKort, OektKort, BookingKort, FakturaRad, VarselRad, SamtykkKort, DiffKort, BenchmarkBadge, FleksMerke, LFaseBadge, OppgaveKort, SGSplittKort | delt | bygger på core/forms; ingen egen shadcn-primitiv |
| trackman | DispersionPlot, TrajectoryPlot, KolleStatKort, TrackmanSammendrag | delt | custom SVG på tokens |
| calendar | DayStrip, AgendaRow, UkeKalender, MaanedKalender, Periodeplan, TidsGrid, Tidslinje, VisningsVelger | delt (motor) | custom; matche eksisterende 57-fil-subsystem |
| nav | NavRail (AgencyOS 54→244 hover) | flate (AgencyOS) | — |
| nav | BottomNav (5-tab) | flate (PlayerHQ) | — |
| marketing | FeaturedCard | flate (Marketing) | card |

## 5. Tema-modell (kontrakt)

- **Fire matriser:** PlayerHQ lys/mørk + AgencyOS mørk/lys. Én token-akse (`.light`/`.dark`
  på nærmeste scope), ikke fire separate paletter. AgencyOS default mørk, PlayerHQ default lys.
- **Lime-regelen (invariant):** lime finnes ALDRI på lys flate. Håndhevet i tokens
  (`--signal` re-mapper til forest i `.light`). Semantiske opp/ned på lys = mørke AA-toner.
- **Data-hero-innfelling:** mørk boks på lys flate = `class="dark"`-scope (lime tillatt der).
- **ThemeToggle** skriver `.light`/`.dark` + `data-theme` + `color-scheme` på target.
  Plassering: AgencyOS toppbar · PlayerHQ Meg › Innstillinger › Utseende.
- **AgencyOS-apper med hardkodet JS-`T`** (workbench-familien m.fl.): lys-variant lages ved å
  mutere `WBDATA.T/AX/AX_SOFT` til lys-matrisen FØR render (se `workbench-lys.html`). Ved
  porting: erstatt JS-`T` med token-lesing (`var(--*)`) så temaet følger scope automatisk.
- Kvalitetsgulv: `:focus-visible`, `prefers-reduced-motion`, `color-scheme` per tema, tabulære sifre.

## 6. Kanon-invarianter (må bestå etter porting)

- **Anbefalinger, aldri sperrer:** Innenfor anbefaling (`ren` — stille) / Avviker fra anbefaling
  (`myk` — synlig chip + klarspråk-forklaring) / Sterkt avvik (`hard` — tydeligere chip +
  coach-varsel-event). ID-ene `ren`/`myk`/`hard` er fagkoder og endres aldri; UI-språket er
  klarspråket over. Ordene «brudd»/«hardt»/«overstyr»/«krever begrunnelse» finnes ikke i UI —
  ingenting blokkeres, ingenting krever begrunnelse. Avvik informerer Plan-kvalitet; sterkt avvik
  varsler coach automatisk.
- **To-talls-regelen:** Plan-kvalitet (0–100) og Gjennomføring (%) er separate hero-tall.
- **Anbefalingskontrakten:** Hvorfor / Hva / Forventet effekt / Hvorfor nå + «Bruk forslag» (primær).
- **Terminologi:** FYS/TEK/SLAG/SPILL/TURN · Læringstrinn (Kropp/Arm/Kølle/Ball/Auto, aldri «L-fase») ·
  Situasjon M0–M5 (Innendørs/Range/Range med mål/Bane trening/Bane test/Turnering) · Press PR1–PR5
  (Rolig/Lett press/Skjerpet/Høyt press/Turneringsnerver) · Område (Tee/Innspill 200–50/Putting) ·
  koder (M2, PR3, L_BALL) kun i coach-flater og økt-ID · AgencyOS (aldri «CoachHQ») · «trening»
  (aldri «øving») · ingen emoji. AK-formelen (seks akser): Pyramide → Område → Læringstrinn → CS →
  Situasjon → Press; P-posisjoner = betinget TEK-felt, ikke akse.
- **Priser:** GRATIS · PRO 299 kr/mnd · PRO årlig 2690 kr. «ELITE» finnes ikke som tier.

## 7. Overleverings-artefakter (hva ligger hvor)

- **Tokens:** `styles.css` (entry) + `tokens/*.css` (fire matriser, oklch-semantikk).
- **Komponentmanifest:** `readme.md` (INDEX) + per-komponent `.d.ts` + `_ds_manifest.json`.
- **Diff-kontrakt (tema-bevis):** `guidelines/tema-bevis.html` (group «Tema»).
- **Tilstandsgalleri:** `guidelines/tilstander.html` — alle familier i alle tilstander, lys × mørk;
  verifikasjonsloopen for hver skjerm som komponeres.
- **Signaturgeometri:** `components/data/signatur.card.html` (Laeringstrapp + PyramideFasett, begge temaer).
- **Dekning + regler:** `DEKNINGSKART.md` (statuslukket) · `CLAUDE.md` (kanon + tema + filkart) · `readme.md`.
