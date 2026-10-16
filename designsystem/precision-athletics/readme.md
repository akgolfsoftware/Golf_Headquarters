# AK Golf — Precision Athletics Design System

A performance- and training-management system for golfers and coaches. Data-heavy, built with instrumental precision: calm like an instrument panel — clean, serious, sports technology. Optimised for both desktop planning and outdoor mobile use.

## Faste regler (gjelder alle skjermer)
1. **Primærknapp er grafitt `#141413` med hvit tekst.** Én primærhandling per flate. Se `guidelines/buttons.html`.
2. **Rust `#9B2415` er bare signal:** det som haster eller ødelegger (slett, trekk tilbake, avslutt), Live-pillen og tellere som krever coachens handling. **Høyst én rust på innholdsflaten** — bjellas tall teller med (Anders 28.09). En dialog er en egen flate: Slett, Trekk tilbake og Avslutt i en dialog kan være rust selv når bjella er rust.
3. **Farge betyr aksen og ingenting annet.** FYS · TEK · SLAG · SPILL · TURN eier kulørene. Øktkort: overflate-bunn med 4 px aksestripe til venstre (delt ved flere akser), vanlig tekstfarge. Fremdriftsstreker er grafitt. Grønt, gult og rødt bare som status, aldri pynt. Se `guidelines/farge.html`.
4. **Bare tokens.** Ingen hardkodede farger (hex, rgb, hsl) i skjermfiler — kun `var(--…)` fra `tokens/`.
5. **Ingen sidelengs rulling** i noen bredde (390 · 768 · 1024 · 1280 · 1440): `scrollWidth === clientWidth`. Tabeller blir kortrader, filtre og faner bryter linje.
6. **Fire tilstander på hver skjerm:** Data · Tom (tydelig neste handling) · Laster (mono-setning, ingen spinner) · Feil (hva gikk galt + Prøv igjen, feilkode i mono).
7. **«—» for manglende verdi,** aldri 0. Alle måltall har kilde og dato; estimat merkes «ESTIMAT».
8. **Bare demodata med oppdiktede navn.** Coach: Anders Kristiansen. Hovedspiller: Tobias Lindvik. Ingen ekte spillere eller elever. Spillere født 2008 eller senere vises aldri åpent uten samtykke; manglende fødselsår vises ikke. Under 16 år gir forelderen samtykket.
9. **Lyst tema er standard.** Natt (`data-theme="night"`) bare på Live-økt, slagteller, runde live og test (PH-04–08, PH-15) og valgfritt på AG-13 — alle skal også virke i lyst.
10. **Hurtigknapp og bjelle i begge skall** (`ui_kits/_shared/Hurtigknapp.jsx`, `AK_FAB.Hurtigknapp` og `AK_FAB.Bjelle`, montert én gang i skallet, aldri per skjerm; handlingene står i `ui_kits/_shared/ia.js`). PlayerHQ: Spør Caddie · Ny økt · Registrer runde · Start økt. AgencyOS: Ny økt i Workbench · Ny melding til spiller · Registrer runde · Spør Jarvis · Ny booking. Ikke på nattflater. Bjella står øverst og åpner innboksen. Tallet er grafitt; rust bare når innboksen har en sak som haster (Risiko, eller spørsmål fra spiller ubesvart over 24 t), og da teller det som skjermens ene rust (regel 2). Jarvis/Caddie forbereder og sender ingenting selv — alt som går til et menneske er et utkast.
11. **Golf:** kun brutto score, til par fra resultatet, SG med fortegn og komma, putting i fot, meter på bane, TrackMan-parametere på engelsk med stor forbokstav. Ord og statuser følger `guidelines/ordmaster.md`.

**Omfang.** Dette er designsystemet for selve AK Golf HQ: PlayerHQ (/portal), AgencyOS (/admin), forelder, innlogging, booking og statistikk. Team Norway og WANG har egne prosjekter. Markedssidene venter. Kodekontroll mot GitHub 27.09.2026: alle 74 skjermtyper har rute i koden; avvik og byggerekkefølge står i `overlevering/codex.md` §8. Komplett baneguide for PH-20 (ekte hullkart, kartgrunnlag, full banedatabase) kommer etter lansering og blokkerer ikke; PH-20 lanseres som mønster med eksempeldata. PH-18 etter-runden-gjennomgang (SG, putting, noter, manuell/annen app) er lanseringskrav.

**Products**
- **PlayerHQ** — the player's phone. Four tabs (I dag · Plan · Stats · Meg — IA 28.09.2026; Stats = Snittscore · Strokes Gained · Trening · Tester), bell top right, shared Hurtigknapp, plus two night-theme focus surfaces: **Live-økt** and **slagregistrering** (shot logging on the range/course).
- **AgencyOS** — the coach's desktop. NavRail 56px (>1024 px) or MenuBar + NavDrawer (≤1024 px), work surface, Inspector 340px (sheet on tablet/mobile). Cockpit · Innboks · Stall · Kalender · Workbench · Mer (IA 28.09.2026). Cockpit er startskjerm; Kø og oppfølging i Innboks; Caddie under Mer og i hurtigknappen; Innsikt fordelt til Stall, Spiller 360 og Stats. Bjelle øverst.

## Sources
- The written brief pasted into this project (style, fonts, radii, colours, five training axes, no emoji). **The brief is the ground truth.**
- The earlier AK Golf Academy design system (project `87aa23fb-8eac-4ca4-aaa0-7a636f4318ff`, readable at `/projects/87aa23fb-…/readme.md`): sand/graphite palette values, type scale, spacing, motion curves, content rules, logos and photography were taken from it. Where it conflicts with the brief (rust primary buttons, 999px buttons, petrol/indigo axis colours) **the brief wins** here.
- No codebase, Figma or production screenshots were supplied. UI kits are composed from the brief, not recreated from real screens.

## Index
| Path | What |
|---|---|
| `styles.css` | Eneste stilark å lenke. Bare `@import` |
| `tokens/` | fonts · colors (inkl. `[data-theme="night"]` og `--course-*`) · typography · spacing · layout · motion · base |
| `components/` | Komponentene (`<Name>.jsx` + `.d.ts` + `.prompt.md`), klasser i `components.css` |
| `skjermliste.md` | 74 skjermtyper fra appens ruter — fasit for ID, navn og ruter |
| `overlevering/` | **Overlevering til Codex:** `codex.md` (regler, tokens, komponenter, alle 74 skjermtyper med ruter, bredder og datebehov, uavklarte beslutninger, byggerekkefølge), `index.html` (samme innhold, lesbart), `tokens.css` (alle tokens i én fil, lyst og natt) |
| `oversikt.html` | Godkjenningsside: én rad per skjermtype (kode, navn, ruter, lenke, tilstander, åpne spørsmål, Port 7), uavklarte spørsmål øverst |
| `ui_kits/katalog.js` | Register over tegnede skjermer (`AK_KATALOG`: href, runde, `uavklart`, `demo`) |
| `ui_kits/playerhq/` | PH-01–26. `index.html` (katalog: skjerm · bredde · Lyst/Natt · tilstand), `screen.html` (vert), `parts.jsx`, `an-parts.jsx`, `screens/PH-*.jsx`, data-filer |
| `ui_kits/agencyos/` | AG-01–24. `katalog.html`, `screen.html`, `ag-parts.jsx` (skall, delt av alle portaler), `screens/AG-*.jsx`, `data-ag*.js`. `index.html` er det eldre kitet |
| `ui_kits/_shared/` | `screen.html` — felles vert for FO, AU, BK, GJ, SY og ST. `KitShell.jsx`, `data-pub.js`, **`ia.js`** (meny, faner, hurtigknapp, bjelle, plassering og «Utgår 28.09» — én kilde), **`Hurtigknapp.jsx`** (hurtigknapp + bjelle for begge skall) |
| `ui_kits/forelder/` | FO-01–06: `katalog.html`, `screens/`, `data-fo.js` |
| `ui_kits/konto/` | AU-01–06: `katalog.html`, `screens/` |
| `ui_kits/booking/` | BK-01–03: `katalog.html`, `screens/BK.jsx` |
| `ui_kits/statistikk/` | ST-01–06: `katalog.html`, `screens/`, `data-st.js` |
| `ui_kits/gfgk/` | GJ-01–02: `katalog.html`, `screens/GJ.jsx` |
| `ui_kits/system/` | SY-01: `katalog.html`, `screens/SY-01.jsx` |
| `ui_kits/epost/` | EP-01–06: `emails.js` (maler, demodata), `katalog.html` (e-post · mottaker · 390/600 · lyst/mørkt), `screen.html` (revisjon). EP-05-utkastet vises i AG-02 · E-postutkast |
| `ui_kits/marked/` | Markedsside (hovedknapp «Book time») |
| `ui_kits/toppidrett/` | Kildemateriale — råstoff, ikke egen app, ikke i revisjonen. Fordeling 28.09 i `skjermliste.md` og `oversikt.html` |
| `ui_kits/audit.html` | Revisjon av alle kits (se under) |
| `guidelines/` | Spesimenkort, `buttons.html`, `farge.html`, **`ordmaster.md`** |
| `assets/` | Logoer, bilder, `ak-vocabulary.js` (ordmasteren som data) |

## E-post — bevisst unntak fra token-regelen
E-postprogrammer støtter ikke CSS-variabler. `ui_kits/epost/emails.js` har derfor fargene skrevet rett inn, kopiert fra `tokens/colors.css`:
- Lyst: side `#e6e3dd` (sand-200) · kort `#ffffff` · flate `#faf8f3` (sand-100) · tekst `#141413` (graphite-900) · brødtekst `#2a2926` · dempet `#686560` · linje `#ddd9d1` · knapp `#141413` med `#ffffff` · lenke `#1d3557` (blue-800)
- Mørkt: side `#0c0d0c` · kort `#1b1c1a` · flate `#141513` · tekst `#faf8f3` · brødtekst `#cfcbc2` · dempet `#a9a59d` · linje `#2f302c` · knapp `#faf8f3` med `#141413`
- Rust `#9b2415` / `#d8553f` finnes bare som reserve; ingen e-post bruker rust. «Send» i coachens utkast er vanlig `Button variant="signal"` i AG-02.
Regler: 600 px, én kolonne, lesbar på 390 px, ingen bilder nødvendig, systemfonter som reserve, én grafitt hovedknapp per e-post, avsender AK Golf Academy · Bossumveien 6, 1605 Fredrikstad nederst, reservasjonslenke i EP-05 og EP-06.

## Kjøre revisjonen (audit.html)
Åpne `ui_kits/audit.html` i nettleseren. Den laster hver katalog i skjulte rammer, går gjennom alle skjermer × tilstander × bredder og måler:
- `scrollWidth === clientWidth` for dokument og `main`, elementer utenfor visningen og klipping
- høyst én rust (`.pa-btn--signal`, `.pa-count--signal`, `.pa-status--live`, `.pa-status--signal`) per skjerm
- nøyaktig én hurtigknapp og én bjelle i AgencyOS og på PlayerHQ-dagflater, ingen på nattflater og i andre portaler; bjellas tall er grafitt og teller som rust bare når en sak haster

Parametere: `?bad` viser bare avvik · `?only=PHQ,AG,FOAU,EP` velger kits (også `TOS,AOS,FOR,BOK,KONTO,SYS,MKT` for eldre kits) · `&ph=PH-11,PH-23`, `&ag=AG-01`, `&fo=ST-01` velger enkeltskjermer. Resultatet står øverst («ferdig · N tilfeller · M med avvik») og lagres i `localStorage["audit-result"]`. Hele kjøringen tar ca. 15 minutter. `&w=320,360,390,430,768,834,1024,1180,1280,1440` kjører alle kits i de ti sluttkontroll-breddene (e-post da i 320–600).

Each component has `<Name>.jsx`, `<Name>.d.ts` (props) and `<Name>.prompt.md` (usage).

Plan 28.09.2026 (runde 21): PH-10 er én flate med zoom År · Måned · Uke · Dag, lag for fysisk, turneringer, samlinger, opptatt tid og Google; PH-11 er «Rediger»; PH-WB-FYS/TURN er lag. Filer: `ui_kits/playerhq/plan-data.js`, `plan-parts.jsx`, `plan-sheets.jsx`, `screens/PH-11-rediger.jsx`. Nye tokens `--period-ferie`, `--period-restitusjon`.

Ny informasjonsarkitektur 28.09.2026 (runde 19): meny og faner for PlayerHQ og AgencyOS, hurtigknapp og bjelle i begge skall, «Analyse» → Stats, «Mål» → Målsetning, PH-12 → Velg treningsplan, PH-26 utgår — se `oversikt.html` og `ui_kits/_shared/ia.js`.

Fra testresultat til øvelse i økt + puttebånd 6 (27.09.2026): AG-15 testdetalj, PH-A07, AG-11 kilde — se `overlevering/test-til-okt-2026-09-27.md` og `codex.md` §15.

Teknisk plan og progresjon 27.09.2026: AG-10 utvidet + AG-TP-01, AG-TP-02, PH-TP-01 — se `overlevering/teknisk-plan-progresjon-2026-09-27.md` og `codex.md` §14.

Runde-registrering for SG 27.09.2026: PH-RD-01–09 og AG-RD-01–02 — se `overlevering/round-sg-registration-2026-09-27.md` og `codex.md` §12.

Workbench over uka, runde 33 (28.09.2026): årsplan som tekstbånd, veileder «Opprett årsplan», periode- og månedsskjema, uka arver timene fra måneden — PH-11-AR/NY/PER/PERSKJEMA/MND/MNDSKJEMA og AG-11-AR/NY/GRUPPE-AR/PER/PERSKJEMA/MND/MNDSKJEMA. Kode `ui_kits/_shared/WB3-ar.jsx`, se `skjermliste.md`.

Workbench fysisk plan + turnering, produksjonsklar 27.09.2026: se `overlevering/workbench-fys-turnering-2026-09-27.md` og `codex.md` §13.

Workbench fysisk plan og turneringsmodul 27.09.2026 (første versjon): AG-WB-FYS, AG-WB-TURN, PH-WB-FYS, PH-WB-TURN — se `codex.md` §11.

Better-ui-polering 27.09.2026: se `overlevering/better-ui-polish-2026-09-27.md` og `codex.md` §10.

## Components
Avatar · AxisBadge · Badge · Breadcrumb · Button · Card · Chart · Checkbox · ChoicePill · DataRow · DataTable · Dialog · FormField · Icon · IconButton · InlineAlert · Input · KeyValue · Metric · MenuBar · NavDrawer · NavRail · PageHeader · Pagination · Radio · SearchField · Segmented · SegmentedFilter · Select · Sheet · SideNav · State · StatusPill · Stepper · Switch · TabBar · Tabs · Timeline · Toast · Tooltip · TopBar

**Navigasjon og dra-og-slipp (27.09.2026):** ActionBar · BackBar · ConfirmDialog · ConflictSheet · DropZone · MoveSheet · SortableList · UndoToast — `components/interaction/`. Hver dra-flate har tastatur (Mellomrom, piler, Mellomrom) og «Flytt»-ark som alternativ.

**Analyse (27.09.2026):** AxisVolumeBars · ChartTable · DataQualityBadge · DistributionPlot · EmptyAnalysisState · EvidenceDrawer · FilterChips · InsightCard · PeriodSelector · SourceBadge · TrendChart — `components/analysis/`. Hvert måltall har kilde, periode, dato og n; hver graf har tabellalternativ; hver innsikt har minst én handling.

`ui_kits/_shared/ds-next.jsx` er generert fra disse to mappene og brukes bare til katalogene til `_ds_bundle.js` har dem.

**Added 26.09.2026:** `DataTable` (table → card rows under 760 px container width, sort, selected row = 2 px graphite inset, empty "—") · `Sheet` (bottom sheet ≤ 1024, Inspector 340 above; also the Drawer) · `FormField` (label, hint, error as text, PÅKREVD) · `Timeline` (mono timestamps) · `Chart` primitives `Sparkline` · `BarRow` (0-radius) · `GoalLine` · `ChartAxis` (mono ticks; axis colour classifies, never status) · `State` (`LoadingState` "Henter …", `EmptyState`, `ErrorState` + Prøv igjen) · `SearchField` · `Pagination` (wraps) · `Badge` (count) · `KeyValue` · `Breadcrumb` · `SegmentedFilter` (wraps) · `PageHeader` (actions wrap).

**Intentional additions** (no source inventory existed, so a standard set was authored): `Icon` (Lucide wrapper, so nobody hand-draws SVG), `AxisBadge` (the five axes from the brief), `Metric` (mono number + unit + source), `DataRow` (56px list row for players/sessions/shots), `Avatar` (player/coach rows), `ChoicePill` + `Stepper` (tactile one-tap choices and −/+ numbers for the adaptive exercise picker — no forms, no typing), `SideNav`/`TabBar`/`TopBar` (the two product shells).

## Content fundamentals
The authoritative source is **`guidelines/ordmaster.md`** (ord-, språk- og formelmaster, 25.09.2026) with a machine-readable copy in `assets/ak-vocabulary.js` (`window.AK_VOCAB`: areas, dimensions, P1–P10, statuses, TrackMan labels). When anything here disagrees, the master wins.

- **Norwegian (bokmål) in all UI.** TrackMan metrics keep English titles in title case (Club Speed, Smash Factor, Launch Angle). Docs and prop names in English.
- **Names and roles:** AK Golf HQ (platform) · PlayerHQ (player) · AgencyOS (coach — never "CoachHQ") · AgenticOS (agent workflows) · **Caddie** (the AI assistant). People: *spiller* (never elev/atlet/utøver), *coach / hovedcoach*, *forelder*. Tiers: **TALENT** (free) and **FULL** (299 kr/mnd · 2 690 kr/år) — never Pro/Premium/Plus.
- **Authorship:** Caddie suggests, the coach approves. "Caddie har laget utkastet. Du godkjenner før det publiseres." Never "magic".
- **Sentence case** everywhere; uppercase only for kickers and mono meta ("TRACKMAN · 24.09.2026"). Axis codes FYS TEK SLAG SPILL TURN and tiers TALENT FULL are always uppercase.
- **Buttons are verbs**, 2–3 words: *Start økt*, *Registrer slag*, *Legg til øvelse*, *Publiser til spiller*, *Avbryt*.
- **Only the listed statuses.** Økt: Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over. Plan: Utkast · Venter på spiller · Godtatt · Avvist · Aktiv · Arkivert. Publisering: Ikke publisert · Publiserer · Publisert · Trukket tilbake. Dagsform: Tung · Slapp · Ok · God · Topp. Never "Ferdig", never a bare dot.
- **Empty is "—", never 0.** Zero is a measurement.
- **Golf data:** brutto score always — "71 slag (−1)". Strokes Gained with explicit sign and comma (+1,2 / −0,4), categories OTT · APP · ARG · PUTT. Putting in feet (ft), shots and courses in metres. Player level A–K.
- **Numbers:** decimal comma (72,4), space as thousands separator (1 200 t), space before percent (84 %), true minus (−3,2°), 24h clock.
- **AK-formelen** names every exercise: PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS. Belastning means environment (Innendørs · Treningsområde · Bane · Konkurranse), never kilos. Motorikk exists only for fullsving. One technical dimension per exercise.
- **Units per area:** antall slag (fullsving, nærspill) · antall putter · antall hull · serier × repetisjoner @ kg + RIR 0–4 · intervallsegmenter + pulssone S1–S5 · minutter.
- **Forbidden → use:** Drill → Øvelse · Logge/føre → Registrere · Session/workout → Økt · Goal/Mål → Målsetning · Stats → Statistikk/Snitt (unntak: PlayerHQ-fanen Stats) · Analyse (fane) → Stats · Schedule → Plan/Kalender · Subscription → Abonnement · Kortspill → Nærspill · Netto → Brutto.
- **Shot registration:** on the range, only big tap targets (+1 slag, +5 slag, club from the bag) — gloves and wet fingers. On the course: hole 1–18, lie (Tee · Fairway · Rough · Sand), metres to the flag, putts in feet. TrackMan imports automatically.
- **No emoji. Ever.** Separators: middle dot `·`; absence: em dash `—`.
- Vibe: a calm instrument. Short, factual, no exclamation marks.

## Visual foundations
- **Colour.** Paper-and-ink. Sand surfaces (`#e6e3dd` page, `#faf8f3` flat, white card, `#f1eee8` sunken), hairline `#ddd9d1`. Ink is five graphites; no pure black. **Primary = graphite `#141413` with white text.** **Rust `#9B2415` is signal only** — destructive/urgent actions, the Live pill, counts needing coach action; max one per screen. Semantic ok/warn/info exist only as small status tints (`--ok` / `--ok-tint` for success). No hard-coded colours in kits — tokens only.
- **Training axes** (official values from the app codebase). Light: FYS `#788C5D` (ink `#63784A`) · TEK `#B8852A` (ink `#8A6316`) · SLAG `#2563EB` (ink `#1D4FD0`) · SPILL `#C46686` (ink `#9E4A67`) · TURN `#A32D2D`. Soft backgrounds are 13% alpha of the base (SPILL 16%) — tokens `--axis-*-soft`, consumed via `--axis-*-bg`. Night: FYS `#56C59A` · TEK `#E8A33D` · SLAG `#84A9FF` · SPILL `#D98AA3` · TURN `#F2908C`, text in the hue itself on a 16% soft background. Used as muted badges with a 6px dot, 4px bars on rows, session blocks (soft fill + 3px inset edge) and 0-radius chart fills. Axis colour classifies; it never signals status or fills a button.
- **Themes.** Light by default for planning/admin. `data-theme="night"` — deep night `#0c0d0c` page, `#1b1c1a` cards, sand ink — for Live-økt and slagregistrering outdoors. Primary inverts to sand with graphite text; axes switch to the official night hues.
- **Type.** IBM Plex Sans for all words (titles 600, body 400, buttons/labels 500). IBM Plex Mono with `tabular-nums` for every number: times, TrackMan angles, yards/metres, percentages. Scale 10 · 11 · 13 · 14 · 15 · 17 · 21 · 26 · 29 · 40 · 56 · 72 (72 = Live clock only).
- **Spacing.** 4/8 grid: 4 8 12 16 20 24 32 40 48 64 80. Card padding 16, row min-height 56, hit target 44 (56 outdoors/night).
- **Radius.** 8px cards, buttons, inputs. 12px modals. 999px badges and status pills. 0 on data marks and bars.
- **Cards.** White, 1px hairline, 8px, `0 1px 0` shadow. Kicker → title → body → mono footer with hairline. Hover darkens border to ink; never lifts or glows.
- **Borders & shadow.** Hairline first. Shadows almost absent: card `0 1px 0`, popover/toast `--shadow-pop`, modal `--shadow-modal`. No inner shadow, no coloured shadow, no glow. Selected rows: 2px graphite inset on the left.
- **Backgrounds.** Flat colour. No gradients, textures, patterns or illustrations. Photography only inside a card's content area (e.g. today's session), with `--scrim-photo` behind any text on it. No blur/glass.
- **Imagery.** The academy's own documentary photos: natural light, cool greens, warm low sun, people mid-work. Unfiltered — no duotone, grain or B&W. Never stock.
- **Hover.** Only under `(hover:hover) and (pointer:fine)`. Colour/border shifts: primary → graphite-700, secondary border → ink, ghost/rows → sunken fill.
- **Press.** `scale(.96)` at 150ms ease-out on buttons, pills and icon buttons; `.99` on cards; static (1) on night/Live and with reduced motion. No bounce. (Better-ui 27.09.2026.)
- **Surfaces.** Cards have no shadow — hairline only. Shadow = real elevation (popover, dropdown, toast, drag preview, sheet, dialog). Photos get a 1 px pure black 10 % outline (white 10 % at night).
- **Radius nesting.** Tight nesting (≤ 8 px padding): inner = outer − padding (`--radius-inner` 4 px in 8 px). 12–24 px padding: separate surfaces, both 8. Data marks 0.
- **Icons.** Lucide mask, stroke = size / 12: 18 px for regular text (1,5 px), 24 px for semibold/Live (2 px). State via currentColor/opacity.
- **Hit areas.** ≥ 44 px via invisible `::after` on sm buttons, pills, filters, segments. Night theme (= outdoors, Live) raises every control to 56 px: fields, selects, segments, icon buttons, sheet/dialog close, buttons, pills. `Stepper size="xl"` for outdoor steppers.
- **Transitions.** Exact properties only — never `all`. Theme switch suppresses all transitions for two frames (`.pa-theme-switching`).
- **Focus.** 2px outline, 2px offset, graphite on light and sand on night. Never removed, never animated. Sticky action bars keep the focused control visible (`main{scroll-padding-bottom}`); toasts sit above the bar.
- **Motion.** 150 press · 150 colour · 200 selection · 250 sheet. Curves: `--ease-out` (enter/exit), `--ease-in-out` (movement), `--ease-drawer` (sheets). Never ease-in, no springs. Loading = mono sentence ("Lagrer …"), no spinner or shimmer. Reduced motion drops transforms.
- **Planning hierarchy.** År → Periode → Måned → Uke → Økt is one surface, not five pages. Period types are graphite steps (`--period-grunn/spesial/turnering/evaluering`), never hues — hues belong to the axes. Remaining volume is colour-coded: ok (within 90–105 %), warn (under), rust (over budget).
- **Adaptive input (AK-formelen).** Pick the pyramid axis first; only that axis's fields appear, as ChoicePills and Steppers: område → P-posisjoner and motorikk (fullsving only) → one teknisk dimensjon (options depend on the area) → mengde in the area's own unit → belastning → press. TURN adds in two taps. No dropdown with fifty options, no free text for enumerable values.
- **Layout.** Fixed measures: TopBar/MenuBar 56, TabBar 64, NavRail 56, Inspector 340, content max 1200.
- **Responsive (revisjon 09.2026).** Zero horizontal scroll at 390 / 768 / 1024 / 1280 — no `overflow-x:auto` scrollers; wide tables become card rows below ~760 px content width, long text ellipsizes. Mobile <600: one column, 16 px page edge, 44 px targets. Tablet 600–1024: two columns, 24 px edge. PlayerHQ: top bar with bell + TabBar. AgencyOS: MenuBar (bell) + NavDrawer (48 px rows, Mer expands). Desktop >1024: NavRail 56 + content + inspector. Spacing 8 / 16 / 24; headers clamp 22–28 px, body 14, meta 11 mono caps; all numbers tabular. Audit harness: `ui_kits/audit.html`. Night surfaces hide the tab bar and have one full-width primary action.

## Iconography
- **Lucide** (`lucide-static@0.544.0` from unpkg), 2px outline on a 24 grid, loaded by `Icon` as a CSS mask so it takes `currentColor`. **Flagged substitution** — no icon set was supplied.
- Sizes: 16 meta/compact, 18–20 default, 22 tab bar.
- Locked glyphs: PlayerHQ `sun` `calendar-days` `chart-no-axes-column` `user`; AgencyOS `gauge` `inbox` `users` `calendar-days` `layers` `ellipsis`; bjelle `bell`; hurtigknapp `plus`.
- Icons never carry meaning alone — always a label or `aria-label`. No emoji, no unicode glyph icons, no icon fonts, no PNGs, no hand-drawn SVG.

## Brand marks
`logo-ak-golf-hq.svg` (+ `-negative`) for AgencyOS/PlayerHQ chrome; `logo-ak-golf-academy.svg` (+ `-negative`) for public material; `ak-golf-logo-ink.svg`, `logo-ak-golf-black-mono.svg`, `logo-ak-golf-mark-negative.svg` for the bare mark. Never redraw, recolour, invert with filters or outline. Use negative files on night. There is no separate PlayerHQ or AgencyOS logo — set the product name in Plex Sans 600 next to the mark.

## Fonts — flagged
IBM Plex Sans / Mono are loaded from **Google Fonts** (no binaries supplied). Send licensed files to self-host.

## Placeholders
All names, numbers and dates in `ui_kits/` are invented to show realistic density. Only cleared photos were copied (the old project flags `academy-08/09/39/42` as on hold and `academy-40` as deleted — do not use them).
