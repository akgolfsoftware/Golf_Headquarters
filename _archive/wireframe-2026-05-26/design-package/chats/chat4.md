# Golf Progression Framework

_Started 2026-05-15 10:44 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "AK Golf HQ_Main"
Current date is now May 15, 2026
</system-info>

<pasted_text name="Pasted text (488 lines)">
# Claude Code Prompt — Komplett planleggingsflyt

# Branch: feature/treningskalender

# Dekker: Årsplan · Periodisering · Månedsplan · Ukeplan · Øktplan

# Versjon: 1.0 — 2026-05-15

-----

Les i denne rekkefølgen før du skriver én linje kode:

1. WORKLOG.md
1. docs/component-library.md
1. references/design-system.md              ← farger, tokens, radius, grid
1. lib/portal/training/ak-taxonomy.ts       ← alle parametere
1. lib/portal/training/periode-constraints.ts ← pyramide-defaults, TAK, validering
1. components/admin/coachhq-dark/           ← primitiver (autoritativ)
1. prisma/schema.prisma                     ← TrainingSessionV2, TrainingDrillV2

Opprett worktree:
cd ~/Developer/akgolf
git worktree add akgolf-planlegging feature/treningskalender

Du er i feature/treningskalender.

═══════════════════════════════════════════════════════════════════
OVERORDNET LAYOUT — GJELDER ALLE SKJERMER
═══════════════════════════════════════════════════════════════════

Shell: CoachHQDarkShell. Aldri MCLayout.
Bakgrunn: #0A1F18. Innholdsflate: #0D2E23. Kort: #0D2E23 med border #1a3d2e.

HOVED-LAYOUT er alltid tre soner:
[CoachHQSidebar 56px+200px] [PlanSidebar 280px] [Innhold flex-1]

PlanSidebar er ny — persistent på tvers av alle planleggingsskjermer.
Innhold-sonen bytter seg ut per visning (årsplan/måned/uke/økt).

PLANLEGG-NAVIGASJON (under Planlegg i CoachHQSidebar):
Kalender          → /admin/kalender           (standard landing)
Treningsplaner    → /admin/treningsplaner      (eksisterende)
Maler             → /admin/maler              (eksisterende)
Kapasitet         → /admin/kapasitet          (eksisterende)

VISNINGSVELGER (øverst i innhold-sonen, alltid synlig):
[ ÅR ] [ MÅNED ] [ UKE ] [ DAG ]
Aktiv tab: #D1F843 tekst + underline. Inaktiv: #A5B2AD.
Tastatursnarvei: 1=ÅR, 2=MÅNED, 3=UKE, 4=DAG.

SPILLER-KONTEKST (øverst til høyre, alltid synlig):
Avatar + navn på valgt spiller. Dropdown for å bytte.
“Alle spillere” viser aggregert visning.

═══════════════════════════════════════════════════════════════════
PLANSIDEBAR (components/shared/calendar/PlanSidebar.tsx)
═══════════════════════════════════════════════════════════════════

Persistent sidebar til venstre for innholdet. Bredde: 280px.
Bakgrunn: #0A1F18 med #1a3d2e border til høyre.

Seksjon 1 — MINI-KALENDER
3-månedersvisning. Klikk på dato → hopp dit i aktiv visning.
Dager med planlagte økter: prikk i pyramide-farge under datoen.
Turneringsdatoer: diamant-ikon ♦ i #D1F843.

Seksjon 2 — SPILLER-TOGGLES (kun CoachHQ)
Liste over alle aktive spillere med avatar + navn.
Toggle per spiller. Aktiv = farget dot. Inaktiv = grå.
Maks 8 synlig — scroll for resten.

Seksjon 3 — PYRAMIDE-FILTER
Checkbox per nivå: FYS · TEK · SLAG · SPILL · TURN.
Fargekodet etter pyramide-systemet.
“Alle” toggles hele listen av/på.

Seksjon 4 — KAPASITETS-LOAD
Tittel: “Uke [nr] — [spiller]”
Stor horisontal bar: planlagt min / TAK-min.
Farge: grønn (<80%) · gul (80–99%) · rød (100%+) · alarm (120%+)
Under baren: “[planlagtMin] / [TAKmin] min — [status-tekst]”
Klikk → utvidet daglig fordeling (7 mini-barer for ukedagene).
Oppdateres live ved endringer i kalendervisningen.

Seksjon 5 — MYELIN-TRACKER
Tittel: “Treningshelse”
Komprimert: vis 3 rødeste/grå treningsområder.
Hvert element: farget prikk + område-navn + “X dager siden”.
Farger: grønn 0–7 · gul 8–14 · oransje 15–21 · rød 22–30 · grå 30+.
Klikk på rød → quick-add popover med det området forhåndsvalgt.
“Vis alle” toggle → ekspandert liste over samtlige treningsområder.

Seksjon 6 — PERIODEINFO (vises kun når spiller er valgt)
Aktiv periode: navn + type-badge (GRUNN/SPES/TURN med farge).
Pyramide-default: horisontale segmenter [FYS][TEK][SLAG][SPILL][TURN].
CS-maks + L-faser tillatt.
“Dager til neste turnering: X” i gul tekst hvis <21 dager.

═══════════════════════════════════════════════════════════════════
SKJERM 1 — ÅRSPLAN (ÅR-VISNING)
Fil: app/admin/(authed)/kalender/page.tsx + AarsplanView.tsx
═══════════════════════════════════════════════════════════════════

GANTT-DIAGRAM
Y-akse: én rad per spiller (avatar + navn til venstre, 160px bred).
X-akse: 52 uker, jan–des. Uke-numre øverst, månedsnavn under.
Rad-høyde: 48px. Mellomrom: 4px.

PERIODEBLOKKER
Rektangler fyller uke-span. Border-radius: 8px.
Farger: GRUNN #003B2A · SPESIALISERING #005840 · TURNERING #D1F843.
Tekst: periodenavn + varighet i uker. Hvit/mørk etter kontrast.
Tooltip på hover: navn, dato fra–til, varighet, pyramide-default (tuple).

OPPRETTE PERIODEBLOKK
Klikk og dra over uker i en spillerrad → oppretter blokk.
Slipper → modal åpnes:
- Periodetype: GRUNN / SPESIALISERING / TURNERING (radio, fargekodet)
- Startdato + sluttdato (forhåndsutfylt fra drag)
- Spiller (forhåndsvalgt fra rad)
- Pyramide-override (valgfritt — viser default, kan justeres)
- [ Avbryt ] [ Opprett periode ]
Validering: ingen overlapp for samme spiller. Feilmelding inline.

TURNERINGSDATOER
Diamant-ikon ♦ i spillerraden på turneringsdato. Farge: #D1F843.
7 dager før: tynn gul ramme rundt uken.
“Legg til turnering”-knapp i toolbar → datepicker + navn.

TOOLBAR (over Gantt)
[ + Ny periode ] [ + Legg til turnering ] [ Eksporter ] [ Innstillinger ]
Sesong-velger (rullegardin): 2025/2026 · 2026/2027.
Zoom: uker (standard) / kvartaler / måneder.

MINI-PYRAMIDEVISNING PER RAD
Lengst til høyre i hver spillerrad: 5 vertikale søyler (FYS–TURN).
Viser gjennomsnittlig pyramidefordeling for aktiv periode.

═══════════════════════════════════════════════════════════════════
SKJERM 2 — PERIODISERING (inline i årsplan + sidebar)
Ingen egen rute — vises i PlanSidebar + periodemodal
═══════════════════════════════════════════════════════════════════

Periodisering har ingen egen skjerm. Den fremstilles to steder:

A) PERIODEMODAL (åpnes ved klikk på eksisterende blokk i Gantt)
To kolonner:
Venstre: redigeringsskjema (type, datoer, pyramide-override).
Høyre: constraints-panel (auto-beregnet fra periode-constraints.ts):

PYRAMIDE-DEFAULT
5 horisontale segmenter med prosenter og farger.
Redigerbar: klikk på segment → number input. Sum må = 100.
Reset-knapp returnerer til A–K-default.

VOLUM-TAK
To linjer: “P-fase-grense: X min/uke” og “Periodetype-grense: Y min/uke”.
Effektiv TAK: min(X, Y) i større tekst med farget bakgrunn.

TILLATTE L-FASER
Chips: grønne = tillatt, røde = ikke tillatt i perioden.

CS-MAKS
Stor sirkulær gauge: 0–100 %, linje ved periodetype-maks.

ADVARSLER
Eventuelle konflikter med eksisterende planlagte økter i perioden.
“3 økter bruker L-AUTO — ikke tillatt i grunnperioden. Vis økter →”

B) PLANSIDEBAR SEKSJON 6 (periodeinfo for løpende uke)
Se PlanSidebar-spec ovenfor.

═══════════════════════════════════════════════════════════════════
SKJERM 3 — MÅNEDSPLAN (MÅNED-VISNING)
Fil: components/shared/calendar/MonthView.tsx
═══════════════════════════════════════════════════════════════════

RUTENETT
5 rader × 7 kolonner. Rad-høyde: dynamisk (min 120px).
Dag-header: ukedagnavn + dato. Grå for helg.
I dag: #005840 bakgrunn på dag-header.

ØKT-CHIPS PER DAG
Maks 3 synlige chips per dag. “+X til” link for resten.
Chip: fargekodet etter primær pyramide-kode + økt-tittel (truncated).
Bredde: full dag-bredde minus 8px padding. Høyde: 24px. Radius: 6px.
Praksistype-badge: liten tag nederst til høyre på chipen
(B=blokk, R=random, K=konkurranse, S=spill-test).

QUICK-ADD
Klikk på tom dag-flate → liten popover (240px bred):
Tittel (input, autofokus)
Varighet (minutter, stepper)
Pyramide (fargede radio-knapper)
Praksistype (4 ikoner — velg én)
[ Avbryt ] [ Lagre ]
Lagre → økt opprettes, chip vises umiddelbart (optimistisk oppdatering).

PYRAMIDE-FORDELING (øverst i måneden)
5-segment horisontal bar over rutenettets fulle bredde.
Viser planlagt fordeling (%) vs. periode-default (%).
Avvik > ±10 %: segmentet pulserer svakt (Framer Motion).
Tooltip: “TEK: planlagt 32 % · anbefalt 35 % · avvik −3 %”

UKEMAL-KOPIERING
Høyreklikk på ukenummer til venstre for raden → kontekstmeny:
“Merk som baseuke”
“Kopier struktur til →” (velg antall uker frem)
“Kopier alt (inkl. driller) til →”
“Lim inn baseuke her”
Baseuke markert med tynn gul venstrekant (#D1F843) på hele raden.

TURNERINGSMARKØRER
Turneringsdatoer: diamant ♦ øverst til høyre i dagtellen + gul tekst.
Uken med turnering: gul venstrekant på hele ukeraden.

═══════════════════════════════════════════════════════════════════
SKJERM 4 — UKEPLAN (UKE-VISNING)
Fil: components/shared/calendar/WeekView.tsx
═══════════════════════════════════════════════════════════════════

GRID
7 kolonner (man–søn) + 1 tidslinje-kolonne (60px) til venstre.
Tidslinjen: 06:00–22:00, én linje per time (64px høyde).
I dag-kolonne: #005840 header, svak grønn bakgrunn på cellen.

ØKT-BLOKKER
Plasseres av startTime + endTime. Maks bredde = kolonnebredde − 8px.
Overlappende økter deles horisontalt (Google Kalender-mønster).
Innhold: tittel + varighet + praksistype-badge + pyramide-fargekant.
Dra-og-slipp: flytt til annen dag/tid. Validering ved slipp.

QUICK-ADD
Klikk på tom time-slot → popover med tittel, varighet, pyramide, praksistype.
Klikk og dra på tom slot → oppretter økt med definert start/slutt.

GJENTAKELSE-INDIKATOR
Gjentakende økter: liten sirkelpil-ikon (ti-repeat, 12px) øverst til høyre på blokk.
Hover: tooltip “Ukentlig — mandag. Endre: kun denne · fremtidige · alle.”

KAPASITETS-LOAD-BAR
Under tidslinje-headeren: tynn horisontal bar (full bredde, 6px høy).
Fargekodet mot TAK. Tooltip: planlagtMin / TAKmin.

MYELIN-VARSLER
Topp av innhold-sonen: kompakt banner hvis ≥1 treningsområde er rødt.
“Bunker er ikke trent på 28 dager. Forslag: 15-min repetisjonsøkt.”
Klikk på forslag → quick-add med Bunker forhåndsvalgt.

TURNERINGSDATO I UKE
Turneringsdag: gul kolonne-header + diamant-ikon.
7-dagerslås-banner øverst hvis uke er innenfor 7 dager:
“Turneringslås aktiv — pyramide låst til TURN-default.”
Coach kan overstyre: “Lås opp manuelt” -knapp.

═══════════════════════════════════════════════════════════════════
SKJERM 5 — ØKTPLAN (SESSION EDITOR MODAL)
Fil: components/shared/calendar/SessionEditor.tsx
components/shared/calendar/DrillEditor.tsx
═══════════════════════════════════════════════════════════════════

Åpnes som modal (full-screen overlay, mørk bakgrunn #0A1F18cc).
To-kolonne layout:
Venstre (400px): økt-metadata
Høyre (flex-1): drill-liste

─── VENSTRE: ØKT-METADATA ───────────────────────────────────────

Tittel (stor input, 24px font, placeholder “Navn på økt”)

PRAKSISTYPE-VELGER
4 store kort i 2×2 grid:
BLOKK      — ikon: ti-stack-2        — tekst: “Repetisjon, innlæring”
RANDOM     — ikon: ti-shuffle        — tekst: “Variasjon, automatisering”
KONKURRANSE — ikon: ti-trophy        — tekst: “Press, challenge games”
SPILL-TEST — ikon: ti-golf           — tekst: “Transfer til bane”
Aktiv: #005840 bakgrunn + #D1F843 ikon. Inaktiv: #1a3d2e.

ØKT-INFO (rader):
Dato + klokkeslett (datepicker + timepicker)
Varighet: auto-sum fra driller (ikke redigerbar direkte) + override-toggle
Spiller (dropdown)
M-miljø (MMiljo dropdown med ikon per alternativ)

GJENTAKELSE
Toggle: “Gjentakende økt” (av/på).
Åpner RecurrenceSelector-komponent:
Ingen · Daglig · Ukentlig [ukedager] · Annenhver uke · Månedlig · Tilpasset
“Rediger gjentakende: kun denne / fremtidige / alle” (vises kun ved redigering).

NOTAT
Textarea (3 rader), placeholder “Notater til spilleren…”

PERIODECONSTRAINTS-PANEL (kompakt, under notat)
Liten infobox: aktiv periodetype + effektiv TAK + L-faser tillatt.
Rød varselboks hvis øktens innhold bryter constraints.

─── HØYRE: DRILL-LISTE ──────────────────────────────────────────

Header: “Driller” + auto-sum (total min + ant. driller) + [ + Legg til drill ]

Drill-kort (én per drill, sorterbar med dra-og-slipp):

KOLLAPS-HEADER (alltid synlig):
Drag-handle (ti-grip-vertical) | Drill-nummer | Drill-navn
Pyramide-farget dot | Komponentfokus-chip | Varighet | Slett-ikon
Pil ned/opp for å ekspandere

EKSPANDERT INNHOLD (DrillEditor.tsx):

Rad 1 — Basis:
Navn (input) | Varighet min (stepper) | Repetisjoner (stepper, valgfritt)

Rad 2 — Pyramide + Område:
Pyramide: 5 fargede pill-knapper (FYS/TEK/SLAG/SPILL/TURN)
Treningsområde: gruppert dropdown (Tee / Innspill / Nærspill / Putting)

Rad 3 — Tekniske parametere:
L-fase: 5 pill-knapper L-KROPP→L-AUTO (rød border hvis ikke tillatt i periode)
CS-nivå: horisontal slider CS50→CS100 med farget track
M-miljø: icon-grid (M0–M5 med ikon og kort label)
PR-press: 5 pill-knapper PR1–PR5

Rad 4 — Deep Practice:
componentFocus: 7 pill-knapper (Setup/Takeaway/Backswing/Transition/Downswing/Impact/Follow-through)
slowMotionMode: toggle med tekst “Saktemodusmodus (20 % hastighet)”
P-posisjoner: multi-select chips fra P_POSISJONER (collapsible, valgfritt)
LIFE-kode: dropdown (valgfritt)

Rad 5 — Suksessrate (kun etter gjennomføring):
successRate: stor slider 0–100 %. Vises kun ved logg-modus.
challengePointStatus: chip (FOR LETT / OPTIMAL / FOR VANSKELIG / IKKE LOGGET)
grønn/gul/rød bakgrunn. Hint-tekst under.

Notat: textarea (2 rader)

EMPTY STATE — ingen driller:
Illustrasjon (golf-tee-ikon, 48px) + “Ingen driller ennå”
Primær knapp: “Legg til første drill”
Sekundær knapp: “Hent fra mal”

─── FOOTER (modal-bunn, full bredde) ────────────────────────────
Venstre: [ Slett økt ] (rød outline-knapp)
Høyre: [ Avbryt ] [ Lagre som utkast ] [ Publiser til spiller ]
Lagre som utkast: #1a3d2e bakgrunn, hvit tekst.
Publiser: #005840 bakgrunn, #D1F843 tekst.

═══════════════════════════════════════════════════════════════════
SKJERM 6 — DAG-VISNING (DAG-VISNING)
Fil: components/shared/calendar/DayView.tsx
═══════════════════════════════════════════════════════════════════

Enklere variant av UKE-visning, én kolonne.
Tid-grid 06:00–22:00. Brede økt-blokker (100% kolonnebredde − 32px padding).
Økt-blokk viser: tittel + praksistype + antall driller + pyramide-fargeindikator.
Øverst: dato-header med ukedag + pyramid-fordeling for dagen (5-segment bar).

═══════════════════════════════════════════════════════════════════
DELTE KOMPONENTER
═══════════════════════════════════════════════════════════════════

components/shared/calendar/
CalendarShell.tsx          — tre-panel layout, visningsvelger, spiller-kontekst
PlanSidebar.tsx            — persistent sidebar (seksjon 1–6)
MiniCalendar.tsx           — 3-mnd mini-kalender
MyelinTracker.tsx          — myelin-helse, fargestatus, quick-add-kobling
CapacityLoadBar.tsx        — TAK-bar med terskler
AarsplanView.tsx           — Gantt-diagram (ÅR)
MonthView.tsx              — 5×7 rutenett (MÅNED)
WeekView.tsx               — 7-kolonne grid (UKE)
DayView.tsx                — enkolonne grid (DAG)
SessionCard.tsx            — økt-chip/blokk (brukes av alle visninger)
SessionEditor.tsx          — modal: økt-metadata + drill-liste
DrillEditor.tsx            — inline expander per drill
RecurrenceSelector.tsx     — rrule-velger
CalendarNav.tsx            — ← → piler + i-dag + datepicker
QuickAddPopover.tsx        — hurtig-legg-til popover
PeriodeModal.tsx           — opprett/rediger periodeblokk + constraints-panel
PyramideBar.tsx            — horisontale segmenter, gjenbrukbar
PraksistypeBadge.tsx       — BLOKK/RANDOM/KONKURRANSE/SPILL-TEST chip
TurneringMarker.tsx        — diamant-ikon med tooltip

═══════════════════════════════════════════════════════════════════
SERVER ACTIONS
═══════════════════════════════════════════════════════════════════

app/admin/(authed)/kalender/actions.ts:

// Periodeblokker
createPeriode(data: CreatePeriodeInput): Promise<TrainingPlan>
updatePeriode(id, data, scope): Promise<TrainingPlan>
deletePeriode(id): Promise<void>
getPerioderForSpiller(studentId, sesong): Promise<TrainingPlan[]>

// Sesoner
getSessionsForRange(startDate, endDate, studentIds?): Promise<TrainingSessionV2[]>
createSession(data): Promise<{ session: TrainingSessionV2, advarsler: string[] }>
updateSession(id, data, scope: “one”|“future”|“all”): Promise<TrainingSessionV2>
deleteSession(id, scope): Promise<void>

// Kapasitet + Myelin
getCapacityLoad(studentId, weekStart): Promise<CapacityLoadResult>
getMyelinStatus(studentId): Promise<MyelinStatusResult>

// Drill-logging
logDrillSuccess(drillId, successRate, notes?): Promise<DrillLogV2>
getChallengePointStatus(drillId): Promise<ChallengePointStatus>

// Baseuke
saveBaseuke(weekStart, studentId): Promise<void>
copyBaseuke(fromWeekStart, toWeekStart, studentId, mode: “struktur”|“full”): Promise<void>

═══════════════════════════════════════════════════════════════════
ANIMASJONER (Framer Motion)
═══════════════════════════════════════════════════════════════════

Modal inn:        scale 0.96→1, opacity 0→1, duration 0.18s ease-out
Modal ut:         scale 1→0.96, opacity 1→0, duration 0.14s
Visningsbytte:    opacity 0→1, y 8→0, duration 0.2s
Drill-ekspander:  height animasjon, duration 0.2s ease
Chip hover:       scale 1→1.02, duration 0.1s
Drag-over dag:    bakgrunn #005840/20, border #005840 dashed

═══════════════════════════════════════════════════════════════════
TOMME STATES
═══════════════════════════════════════════════════════════════════

Ingen periodeblokker i årsplan:
Ikon: ti-calendar-plus (48px, #2A7D5A)
Tekst: “Ingen perioder planlagt for [spiller] i [sesong]”
Knapp: “Opprett første periode”

Ingen økter i uke:
Ikon: ti-beach (48px, #2A7D5A) — hvileuke-stemning
Tekst: “Ingen øvelseøkter denne uken”
Knapp: “Planlegg økt” + “Kopier forrige uke”

Ingen driller i økt:
Se drill-liste spec ovenfor.

═══════════════════════════════════════════════════════════════════
REGLER
═══════════════════════════════════════════════════════════════════

- CoachHQDarkShell alltid. Aldri MCLayout.
- Maks 300 linjer per fil — splitt i underkomponenter.
- Alle UI-tekster på norsk bokmål.
- Alle parameter-verdier fra ak-taxonomy.ts — null hardkodede strings.
- Alle constraints fra periode-constraints.ts — null hardkodet periodelogikk.
- TAK-beregning og constraint-validering kun server-side (actions.ts).
- date-fns for all datohåndtering. Aldri moment/dayjs.
- rrule for gjentakelseslogikk.
- Framer Motion for alle animasjoner — aldri CSS transitions direkte.
- Lucide React for ikoner — aldri andre ikonbiblioteker.
- Inter font — aldri andre fonter.
- Border-radius: 8px knapper · 12px kort · 20px pills.
- Optimistisk UI ved quick-add: oppdater state før server-kall, rollback ved feil.
- Alle nye komponenter inn i docs/component-library.md.
- Oppdater WORKLOG.md etter ferdig arbeid.

Commit: feat: komplett planleggingsflyt (årsplan/periode/måned/uke/økt)

═══════════════════════════════════════════════════════════════════
OUTPUT — OPPRETT DISSE FILENE I DENNE REKKEFØLGEN
═══════════════════════════════════════════════════════════════════

1. components/shared/calendar/PyramideBar.tsx
1. components/shared/calendar/PraksistypeBadge.tsx
1. components/shared/calendar/TurneringMarker.tsx
1. components/shared/calendar/CalendarNav.tsx
1. components/shared/calendar/MiniCalendar.tsx
1. components/shared/calendar/CapacityLoadBar.tsx
1. components/shared/calendar/MyelinTracker.tsx
1. components/shared/calendar/QuickAddPopover.tsx
1. components/shared/calendar/RecurrenceSelector.tsx
1. components/shared/calendar/PlanSidebar.tsx
1. components/shared/calendar/SessionCard.tsx
1. components/shared/calendar/DrillEditor.tsx
1. components/shared/calendar/SessionEditor.tsx
1. components/shared/calendar/PeriodeModal.tsx
1. components/shared/calendar/AarsplanView.tsx
1. components/shared/calendar/MonthView.tsx
1. components/shared/calendar/WeekView.tsx
1. components/shared/calendar/DayView.tsx
1. components/shared/calendar/CalendarShell.tsx
1. app/admin/(authed)/kalender/page.tsx
1. app/admin/(authed)/kalender/actions.ts
1. prisma/migrations/[timestamp]_treningskalender_v2/migration.sql
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="AK Golf HQ_Main (design system)">
[Design System] This project uses the **AK Golf HQ_Main** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

    Explore it to find what you need:
    - Always copy out the fonts and colors you need
    - For prototypes and designs, always copy out any relevant components
    - If the design system contains existing mocks of products, and you were asked to design or prototype something similar, copy and fork those mocks to start your design. This helps you make high-quality designs.
    
    Explore it quickly to find relevant UI kits (e.g. mocks of existing products you can copy and fork)

Full system at `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/`. Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# AK Golf HQ — Design System

A complete brand + UI system for **AK Golf HQ**, a Norwegian golf training and coaching platform. The product helps amateur and serious golfers train smarter through personalized programs, while giving coaches tools to manage players, schedules, and analytics.

## Source materials

This system was built from two uploaded references — **v2 is the current spec**:

- `uploads/design-system-v2.md` — **current Sprint 0 spec** (Den gjeldende). Token-list + UX rules + anti-AI rules + tier system + pyramide colors + forbidden legacy tokens. Authoritative when v1 conflicts.
- `uploads/branding-style-guide.html` — visual rendering of all tokens (logos, type, components, motion). Use as visual cross-reference.

**Source-of-truth hierarchy** (per v2): `branding-style-guide.html` → `design-system.md` → `globals.css` → this design system. Heritage Grid (M3) tokens are **DEPRECATED**.

No codebase, no Figma URL, and **no logo SVG files** were attached. The style guide referenced filenames like `logos/ak-golf-logo-primary-on-light.svg` but the actual files are missing — see the **Caveats** section below.

## Products represented

The system serves three surfaces. Names below are the ones used inside the brand guide:

1. **PlayerHQ** — the player-facing app. Light theme on warm cream `#FAFAF7`. White sidebar with primary-green active state. Editorial italic greeting at top (*"Onsdag, Markus. To dager siden sist."*). Training plans, bookings, stats, profile.
2. **CoachHQ** — the coach-facing app. **Dark rail** (`#061210`) with five icon-only nav slots, plus a light cream secondary nav. Lime accent for active rail items. Dashboard, players, schedule (timeplan), analytics, programs.
3. **Landing** — marketing pages. Pure black hero (`#0A0A0A`), white display type, lime CTA. Used for the entrypoint and any high-impact dark moment.

## File index

| Path | What it is |
|---|---|
| `README.md` | This file. Brand context + foundations + iconography. |
| `colors_and_type.css` | All design tokens as CSS variables, plus semantic type classes. |
| `SKILL.md` | Cross-compatible skill manifest for Claude Code / Agent Skills. |
| `assets/logos/` | 7 wordmark variants + 1 favicon mark. **Placeholders** — see Caveats. |
| `preview/` | Card-sized HTML files registered to the Design System tab. |
| `ui_kits/player-hq/` | PlayerHQ UI kit — interactive dashboard recreation. |
| `ui_kits/coach-hq/` | CoachHQ UI kit — coach dashboard with dark rail. |
| `ui_kits/landing/` | Marketing landing page recreation. |
| `uploads/branding-style-guide.html` | Original style guide (visual reference). |
| `uploads/design-system-v2.md` | **Current Sprint 0 spec** — authoritative tokens + rules. |

---

## CONTENT FUNDAMENTALS

### Language

The product is **Norwegian (Bokmål)** first. UI strings, navigation labels, and all in-app copy are written in Norwegian. Examples lifted from the style guide:

- Greeting: *"Onsdag, Markus. To dager siden sist."* (editorial italic — observation, not address)
- Nav: *Dashboard, Treningsplan, Bookinger, Statistikk, Profil* (PlayerHQ); *Spillere, Timeplan, Analyser, Programmer* (CoachHQ)
- Drill names: *Putting drill, Nærspill-økt, Ukentlig mål*
- Tagline: *"Tren smartere. Spill bedre."*
- Hero copy: *"AK Golf gir deg personlig treningsplan, data-drevet coaching og verktøyene du trenger for å ta spillet ditt til neste nivå."*
- CTA: *"Kom i gang"*

When generating new copy, write in Norwegian Bokmål by default. Use English only for international/marketing surfaces if explicitly asked.

### Tone & voice

- **Editorial, not chummy.** Per anti-AI rule #9: **never** use *"Welcome back, [Name]!"* or *"God morgen, Henrik"*. Instead, write contextual italic fragments that **observe** rather than greet.
- **Maks 1 italic-element per skjerm.** Reserve italic Inter Tight for the single editorial moment.
- **Coach-like.** Direct, action-oriented, focused on improvement.
- **Confident but not loud.** No exclamation marks, no emoji, no hype words.
- **Du-form for the user.** Norwegian "du" — informal, direct.
- **Sentence case for everything.** Headings, button labels, nav items, pill labels.
- **No emoji.** None of the source materials use emoji; do not introduce them.

### Editorial greeting examples

The greeting should feel like a sentence overheard, not a welcome banner:

| Surface | Example | Why |
|---|---|---|
| PlayerHQ Hjem | *"Onsdag, Markus. To dager siden sist."* | Observation about cadence, not address. |
| PlayerHQ Hjem (fresh) | *"Klar for putte-økt?"* | Situation-specific cue. |
| CoachHQ Dashboard | *"Onsdag morgen. 38 spillere venter."* | State of the day, not "Hi coach!". |
| Stats screen | *"Sju runder denne måneden."* | Reflective, sets context. |

### Examples

| Bra (good) | Unngå (avoid) |
|---|---|
| Onsdag, Markus. To dager siden sist. | God morgen, Henrik 👋 / Welcome back! |
| Tren smartere. Spill bedre. | 🏌️ Level up your game! |
| Du har 3 økter igjen denne uken | You've got 3 sessions left this week, friend! |
| Putting drill — 25 % | Putting Drill — 25% Complete ✓ |
| Kom i gang | Get Started Now → |

### Numerics

- **JetBrains Mono with `tabular-nums`** for KPIs, deltas, percentages, dates, scores.
- Decimal separator follows Norwegian convention: comma in display strings (e.g. `12,4`) but the style guide samples actually use a period (`12.4`) — match the source exactly when in doubt.
- Positive deltas show in **status-success green** (e.g. `+2.3`); never in lime.

---

## VISUAL FOUNDATIONS

### Colors

The palette is **deep forest green + warm cream + a single lime accent**. Lime is the brand's signature — used sparingly and never on large fills.

- **Brand**: Forest green `#005840` (primary), Lime `#D1F843` (accent), Accent-on `#0A1F18` (text on lime).
- **Surface**: A warm cream system — `#FAFAF7` (body), `#F5F2EA` (sand/inset), `#FFFFFF` (cards). The cream is *intentionally* warm — never use pure neutral grays for surfaces.
- **Ink**: `#0A1F18` (a near-black with a green undertone, never pure `#000`), `#5E5C57`, `#9C9990`, `#C4C0B8`.
- **Status**: Forest-toned greens for success (not lime!), warm ochre for warning, brick red for danger.
- **Dark surfaces**: `#0A0A0A` for landing hero, `#061210` for the CoachHQ rail.

See `colors_and_type.css` for the full list.

### Typography

Three families, all from Google Fonts — **no font substitutions needed**.

- **Inter Tight** — display family. Used for headings, hero, section titles. The brand signature is **italic Inter Tight 36px** for editorial greetings (*"Onsdag, Markus. To dager siden sist."*).
- **Inter** — body and UI. 15px regular for prose, 14px medium for buttons, 12px medium uppercase with `0.04em` tracking for labels.
- **JetBrains Mono** — KPIs, numbers, deltas, code. Always with `font-variant-numeric: tabular-nums`.

Letter-spacing is **negative** for display sizes (`-0.02em` to `-0.03em`) and **positive** (`0.04em`) for uppercase labels.

### Spacing & layout

- 4px base. Most padding lands at 12 / 16 / 20 / 24 / 32 / 48px.
- Page-level horizontal padding is **48px** on desktop, dropping to 20px on mobile.
- Sections separate via 56px vertical padding + a hairline `--line-soft` divider, not heavy backgrounds.
- Grids use generous `gap` (16–24px); never margin hacks. Always flex/grid with explicit gap.

### Backgrounds

- **No gradients on surfaces.** The only gradient in the system is the lime progress-fill (`#D1F843 → #C2EE2F`).
- **No hand-drawn illustrations.** No textures, no patterns.
- **No full-bleed photography in the style guide.** The system is type- and component-driven; if hero imagery is needed, expect crisp golf course or training environment photos with cool/neutral grading (placeholders OK until provided).
- The dark hero (`#0A0A0A`) is **flat black**, not a gradient.

### Corners & shape

- **20px** for cards (`--radius-card`). The system's defining radius — soft but not pillowy.
- **12px** for buttons and interactive controls (`--radius-control`).
- **10px** for small inset chips/icons in the dark rail.
- **8px** for tight elements (motion-spec chip, tag chip).
- **100px** (pill) for badges, week-pills, progress-track.
- **50%** circle for avatars and streak dots.

### Borders

- Hairline `1px solid --line` (`#E5E3DD`) on cards and most surfaces.
- `--line-soft` (`#EFEDE6`) for hairline dividers between sections.
- Borders are warm (slightly cream) to match the surface system, never cool gray.
- The CoachHQ rail uses **no border**, just contrasting fill against the cream nav.

### Shadows & elevation

Two-stop shadow system, both very soft:

- `--shadow-card`: resting state. `0 1px 3px rgba(10,31,24,0.06), 0 1px 2px rgba(10,31,24,0.04)`.
- `--shadow-card-hover`: lifted state. `0 4px 12px rgba(10,31,24,0.08), 0 2px 4px rgba(10,31,24,0.04)`.

Note the alpha is keyed to **`rgba(10,31,24, …)`** — the ink color, not pure black. This keeps shadows feeling warm.

The lime "today" streak dot uses a 3px **outer glow** in `--accent-fill` instead of a drop shadow:
```css
box-shadow: 0 0 0 3px var(--accent-fill);
```

### Motion

A small, opinionated motion vocabulary. **One easing. Three durations.**

- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (sharp ease-out). Used for *everything*. No bounces, no springs, no overshoots.
- **Durations**: `120ms` (micro: hover, color swaps), `200ms` (short: shadow tweens, route hints), `320ms` (large: card entrance, page transitions).
- **Card entrance**: fade + 20px slide-up.
- **No looping animations**, no skeleton shimmers in the source — though shimmers would fit (use the cream tonality).

### Hover states

- **Primary button**: shifts to `--brand-primary-hover` (darker forest).
- **Accent button**: shifts to `--brand-accent-hover` (slightly more saturated lime).
- **Ghost button**: gains `--surface-alt` background and `--ink-disabled` border.
- **Sidebar item**: gains `--surface-alt` background.
- **Primary button extra polish**: at hover, gains a soft glow `0 4px 16px rgba(0,88,64,0.2)`.

### Press / active states

- Buttons **scale to 0.97** with 120ms transition. This is the only "interactive" transform in the system.
- No color change on press; the scale alone signals it.

### Transparency & blur

- Lime is used as **transparency** in three tiers: `0.12`, `0.25`, `0.30` for `--accent-bg`, `--accent-fill`, `--sidebar-coach-active` respectively.
- Forest green appears as transparency in `--sidebar-player-active` (`rgba(0,88,64,0.08)`).
- **No `backdrop-filter: blur()`** in the source. The system favors solid surfaces.

### Cards

Three-tier hierarchy:

1. **Flush** — transparent background, no border, no shadow. For inline content that doesn't need separation.
2. **Standard** — white fill, `1px --line` border, `--shadow-card`. The default.
3. **Featured** — `--accent-bg` (12% lime tint) fill, `1px --line` border, `--shadow-card-hover`. For CTAs and highlighted cards.

All three: `--radius-card` (20px), 24px padding.

### Lime usage rules (critical)

The single most-violated rule. **Lime is for accent, not fill.**

✅ **Riktig (right)** — CTA buttons, active pills, today's streak dot, progress-bar fill, positive deltas (+2.3).

❌ **Feil (wrong)** — Large background fills, body text in lime, every badge in lime, gradients with lime, icons in lime (use primary green instead), logos placed on lime (no variant has enough contrast).

---

## ICONOGRAPHY

### System

The brand uses **[Lucide](https://lucide.dev)** icons exclusively. Stroke `1.75`, round line caps, round line joins. No icon font, no sprite, no custom illustrations.

```
stroke-width: 1.75
stroke-linecap: round
stroke-linejoin: round
fill: none
```

### Sizes

- **18px** — standard inline (sidebar items, button leading icon, list bullets).
- **20px** — section headers, dark-rail nav (CoachHQ).
- **24px** — hero, large CTA, page-level icons.

### Color

Icons are stroked in `currentColor` and inherit text color. Common pairings:

- `--ink` — default UI icons.
- `--ink-muted` — secondary affordances.
- `--brand-primary` — active sidebar item (PlayerHQ).
- `--brand-accent` — active rail icon (CoachHQ dark rail).
- `#FFFFFF` (with 0.5 alpha) — inactive dark-rail icons.

### Loading

For prototypes inside this system, load Lucide via the official CDN:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="calendar"></i>
<script>lucide.createIcons();</script>
```

Or for static SVG inline use, copy from <https://lucide.dev/icons>.

### What is *not* used

- **No emoji.** Anywhere.
- **No Unicode pictographs** (★ ✓ ✗ ➜). Use real Lucide icons for check, cross, arrow, star.
- **No mixed icon sets.** Don't pair Lucide with Heroicons, Phosphor, etc.
- **No filled-style icons.** All Lucide icons used are stroke-only.

---

## PYRAMIDE COLORS — training-layer system

Five official AK Golf training layers with their own color tokens. Used in `PyramideRinger` (5 nested arcs) and pyramide-progress-bars on session cards.

| Layer | Token | Hex | Meaning |
|---|---|---|---|
| **FYS** | `--pyr-fys` | `#005840` | Fysisk fundament (physical foundation) |
| **TEK** | `--pyr-tek` | `#1A7D56` | Teknikk (technique) |
| **SLAG** | `--pyr-slag` | `#D1F843` | Slagprogresjon (shot progression) |
| **SPILL** | `--pyr-spill` | `#B8852A` | Banespill (course play) |
| **TURN** | `--pyr-turn` | `#5E5C57` | Turnering (tournament) |

These colors are **only** used inside the pyramide system. Don't repurpose `--pyr-spill` (ochre) as a generic warning color — use `--status-warning` for that.

---

## TIER SYSTEM (PlayerHQ)

| Tier | Accent | Token | Use |
|---|---|---|---|
| **Gratis** | Neutral gray | `--tier-gratis` (`#9C9990`) | Default. Basic features only. |
| **Pro** | Primary green | `--tier-pro` (`#005840`) | Most-common paid tier. |
| **Elite** | Accent lime | `--tier-elite` (`#D1F843`) | Top-tier. |

**Tier-gating pattern.** Locked features render at **40% opacity** with a Lucide `Lock` icon and a CTA: *"Oppgrader til Pro"* / *"Oppgrader til Elite"*.

---

## NORWEGIAN UX CONVENTIONS

- **Language:** Bokmål with æ, ø, å spelled correctly throughout.
- **Decimal separator:** comma — `78,5` not `78.5`. (The branding-style-guide samples occasionally use a period; v2 spec wins — use comma.)
- **Date:** *"7. mai 2026"* (long) or `07.05.26` (short).
- **Time:** 24-hour — `14:00`, never `2:00 PM`.
- **Fractions over percent:** prefer *"12/16 økter"* to *"75 %"* for completion counts.
- **No emoji** — Lucide icons only.

---

## ANTI-AI RULES (must follow)

These guardrails prevent the system from drifting into generic LLM-design territory. From v2 spec:

1. **Flat avatar colors.** No gradients on avatars — use solid brand fills with white initials.
2. **Asymmetric grid layouts.** Avoid uniform 3×1 / 4×1 grids; mix column spans.
3. **No `translateY(-3px)` hover on everything.** Reserve lift for cards that genuinely warrant it.
4. **Max 1–2 eyebrows per screen.** Don't pill-spam.
5. **Varied section layouts on landing.** Alternate split / centered / full-width — don't repeat the same hero pattern down the page.
6. **Reduced pill density.** Pills are precious; use one or two per row, not five.
7. **No ambient-glow decorations.** No blurred lime blobs floating behind heroes.
8. **Stronger typographic contrast** between hierarchy levels.
9. **Never** *"Welcome back, [Name]!"* — use the italic editorial greeting (*"God morgen, Henrik"*).

---

## FORBIDDEN LEGACY TOKENS (Heritage Grid M3 — DEPRECATED)

Reject any of these and use the replacement instead.

| Forbidden | Replacement |
|---|---|
| `#154212` (Heritage primary) | `#005840` (`--brand-primary`) |
| `#d2f000` (Heritage accent) | `#D1F843` (`--brand-accent`) |
| `#fdf9f0` (Heritage surface) | `#FAFAF7` (`--surface`) |
| `#1c1c16` (Heritage on-surface) | `#0A1F18` (`--ink`) |
| DM Sans | Inter / Inter Tight |
| Material Symbols | lucide-react |
| `--hg-*` tokens | (removed entirely) |
| `--color-portal-*` tokens | (removed entirely) |

---

## Caveats & known gaps

- **Logo files are wordmark placeholders.** The original style guide referenced 7 SVGs in `logos/` but those files were not uploaded. I generated typographic wordmarks ("AK·GOLF") in Inter Tight using the brand colors. **Please upload the real logo files** (any of: SVG, AI, PNG @2x) to `assets/logos/` and they will drop in cleanly — filenames already match the references.
- **No codebase or Figma was provided.** UI kits are recreations from the style guide screenshots/component definitions, not from production code. Component layouts (especially data tables, filter UIs, modals, settings pages) are inferred and should be cross-checked.
- **Norwegian copy.** All UI strings are in Bokmål, lifted from or matched to the style guide. If the product also has English/other locales, please share those strings.
- **Photography & illustrations.** The style guide has none — UI kits use solid surfaces and avatar initials. If hero photos exist (course shots, player portraits) please upload them.

---

## How to use this system

1. **For prototypes / mocks** — link `colors_and_type.css`, drop in Lucide via CDN, use the JSX components in `ui_kits/<surface>/` as starting points.
2. **For production code** — read `colors_and_type.css` for tokens; copy variable names verbatim. Match the type ramp, motion vocabulary, and lime-usage rules.
3. **For slide decks / external materials** — pull logos from `assets/logos/`, use forest green + cream + lime, set headings in Inter Tight italic for warm/personal moments.

When in doubt, refer to `uploads/branding-style-guide.html` — it is the single source of truth.

</design-system-guide>

CSS tokens: the guide may describe tokens in prose, but the exact `--*` names are defined in the design system's stylesheet(s) (`/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/assets/tokens.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/coachhq-A/wizard.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/coachhq-shell.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/colors_and_type.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/modal-shell.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/playerhq-shell.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/screens/_shared/arketype-e.css`, `/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/screens/_shared/arketype-f-player.css`, and 11 more). The 140 custom properties it defines are:

--accent, --accent-bg, --accent-fill, --accent-hover, --accent-on, --accent-soft, --border, --brand-accent, --brand-accent-hover, --brand-accent-on, --brand-primary, --brand-primary-deep, --brand-primary-dk, --brand-primary-hover, --brand-primary-soft, --canvas, --card, --coach-nav-active, --coach-nav-bg, --coach-rail-bg, --coach-rail-ink, --danger, --danger-bg, --duration-large, --duration-micro, --duration-short, --e-bg, --e-bg-soft, --e-border, --e-deep, --e-fg, --e-gold, --e-green, --e-grey, --e-lime, --e-muted, --e-muted-2, --e-pyr-fys, --e-pyr-slag, --e-pyr-spill, --e-pyr-tek, --e-pyr-turn, --e-red, --e-surface, --e-surface-2, --ease-out, --font-body, --font-display, --font-mono, --font-sans, --font-tight, --g-accent, --g-bg, --g-bg-alt, --g-card, --g-danger, --g-fg, --g-line, --g-line-soft, --g-muted, --g-primary, --g-primary-hover, --g-subtle, --g-success, --g-warning, --ink, --ink-disabled, --ink-muted, --ink-subtle, --landing-hero-bg, --landing-hero-text, --line, --line-soft, --nav-active, --nav-bg, --paper, --phase-base, --phase-comp, --phase-prep, --phase-specific, --phase-taper, --pyr-fys, --pyr-slag, --pyr-spill, --pyr-tek, --pyr-turn, --r-button, --r-card, --r-input, --r-pill, --radius-btn, --radius-card, --radius-chip, --radius-control, --radius-input, --radius-pill, --radius-tight, --rail-bg, --shadow-accent-glow, --shadow-card, --shadow-card-hover, --shadow-pop, --shadow-rim, --shadow-soft, --sidebar-coach-active, --sidebar-coach-nav-bg, --sidebar-coach-rail-bg, --sidebar-player-active, --sidebar-player-bg, --sidebar-player-border, --space-1, --space-10, --space-12, --space-16, --space-2, --space-3, --space-4, --space-5, --space-6, --space-8, --status-danger, --status-danger-bg, --status-success, --status-success-bg, --status-warning, --status-warning-bg, --success, --success-bg, --surface, --surface-alt, --surface-card, --tier-elite, --tier-gratis, --tier-pro, --tracking-base, --tracking-label, --tracking-snug, --tracking-tight, --warning, --warning-bg

Only use `var(--*)` names from that list. Never guess a token name — an unresolved `var()` silently falls back to the browser default.

For assets and UI kits beyond the guide: `read_file("/projects/019e12b0-1611-742c-9eb1-1bc889c034bd/<path>")` and `copy_files` to bring them into the current project.
</attached-skill>

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: questions_v2]_

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: copy_files]_

_[tool: run_script]_

Now let me build the shared CSS with the dark planning shell + PlanSidebar.

_[tool: write_file]_

## Assistant

_[tool: write_file]_

_[tool: write_file]_

Now let me build the Year/Gantt view (Skjerm 1).

_[tool: show_html]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: write_file]_

The year view looks great. Now the Month view.

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: get_webview_logs]_

_[tool: view_image]_

_[tool: str_replace_edit]_

I see a hero spacing issue in index. Let me fix it.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

Looks great. Let me verify the Session editor modal.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: update_todos]_

_[tool: done]_

All views render well. Let me finalize.

_[tool: fork_verifier_agent]_

Klart — komplett planleggingsflyt levert i 6 hi-fi mockups på mørk CoachHQ-shell (#0A1F18).

**Filene:**
- `index.html` — landing med live mini-previews + tastatursnarveier
- `01-aarsplan.html` — Gantt over 52 uker × 5 spillere · klikk-og-dra perioder · turneringsdiamanter
- `02-maanedsplan.html` — 5×7 rutenett · pulserende pyramide-strip · ukemal-kontekstmeny + quick-add popover
- `03-ukeplan.html` — 7-kolonne timegrid · live nå-økt · myelin- og turneringsbanner · TAK-bar
- `04-dagsplan.html` — enkolonne timegrid · prominent live-økt-kort med drill-logg
- `05-oktplan-modal.html` — to-kolonne overlay · praksistype 2×2 · drill-liste med én ekspandert (alle 5 rader inkludert deep practice + suksessrate)
- `06-periode-modal.html` — periode-redigering + constraints-panel (TAK, L-faser, CS-gauge, advarsler)

PlanSidebar (280 px) deles på tvers av alle 4 visningene med alle 6 spec'd seksjoner. Tast `1` `2` `3` `4` for å bytte visning, `ESC` lukker modaler.

**Neste:** koble til `actions.ts` + Prisma, og legge til dnd-kit for drag-and-drop. Ingen funksjonell logikk her — bare visuell spec.

## User

PYRAMIDE (5 nivåer, bunn til topp)
FYS → TEK → SLAG → SPILL → TURN
Farge følger pyramide-metaforen: dyp skogsgrønn (FYS) til lime (TURN).

FYS – Fysisk: styrke, power, mobilitet, stabilitet
TEK – Teknikk: bevegelsesmønster, posisjoner, sekvens
SLAG – Golfslag: slagkvalitet, avstand, nøyaktighet
SPILL – Spill: strategi, banehåndtering, scoring
TURN – Turnering: mental prestasjon, konkurransefokus


TRENINGSOMRÅDER (4 grupper)
Tee: TEE – Tee Total
Innspill: INN200 (200+ m) · INN150 (150–200 m) · INN100 (100–150 m) · INN50 (50–100 m)
Nærspill: CHIP · PITCH · LOB · BUNKER
Putting: PUTT0-3 · PUTT3-5 · PUTT5-10 · PUTT10-15 · PUTT15-25 · PUTT25-40 · PUTT40+

L-FASER (teknisk progresjon)
L-KROPP → L-ARM → L-KØLLE (CS50) → L-BALL (CS50–60) → L-AUTO (CS70–100)

CS-NIVÅER (innsatsprosent, starter på 50 %)
CS50 (minimum balltrening) · CS60 (konsistens) · CS70 (konkurranselignende) · CS80 (høy intensitet) · CS90 (nær-maksimal) · CS100 (maksimal)

M-MILJØ (treningsarena)
M0 Off-course · M1 Innendørs · M2 Range · M3 Øvingsfelt · M4 Bane trening · M5 Bane turnering

PR-PRESS (ytre press)
PR1 Ingen · PR2 Selvmonitorering · PR3 Sosial · PR4 Konkurranse · PR5 Turnering

P-POSISJONER (14 punkter i svingens anatoml)
P1.0 Address → P2.0 Takeaway → P3.0 Mid-Backswing → P4.0 Topp → P4.5 Transition midt → P5.0 Transition → P5.5 Shallowed → P6.0 Delivery → P6.1 Release-punkt → P6.5 Pre-impact → P7.0 Impact → P8.0 Release → P9.0 Follow-through → P10.0 Finish

LIFE-KODER (personlig utvikling)
LIFE-SELV (selvledelse) · LIFE-SOS (sosial) · LIFE-EMO (emosjonell) · LIFE-KAR (karakter) · LIFE-RES (resiliens)

SPILLERKATEGORIER A–K
A Verdenselite (< 68, 18–22 år) → B Nasjonal elite → C Nasjonal U21 → D Regional elite → E Regional U18 → F Klubbspiller sr. → G Klubbspiller jr. → H Rekrutt senior → I Rekrutt junior → J Nybegynner sr. → K Nybegynner jr. (100+, 8–11 år)

ØKT-ID FORMAT
[Pyramide]_[Område]_[L-fase]_[CS]_[M-miljø]_[PR-press]_[P-posisjon]_[LIFE]
Eksempel: SLAG_TEE_L-AUTO_CS80_M2_PR3

## Assistant

_[tool: grep]_

_[tool: grep]_

Takk — flere av parameterne mine var fri-tekst, ikke kanoniske. La meg oppdatere mockup-ene til riktig taxonomi (L-faser, P-posisjoner, treningsområde-koder, M-miljø).

_[tool: grep]_

_[tool: grep]_

Klart. Jeg fikser L-faser, P-posisjoner, treningsområde-koder, M-miljø-labels og legger inn spillerkategori-merket på alle relevante steder.

_[tool: run_script]_

La meg gjøre alle taxonomi-fiksene med ett skript.Now let me fix the P-posisjoner, treningsområde-koder, M-miljø-labels og legge inn spillerkategori (A–K).

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

The atomic batch fails due to one edit's encoding. Let me do them one-by-one.Now let me beef up the other views with treningsområde-koder, spillerkategori, and a small taxonomy reference card in the PlanSidebar for easy lookup.

_[tool: run_script]_

Now let me add a small persistent **Taxonomi-kortet** to the PlanSidebar in each view (so the codes are always visible) and add spillerkategori to the spiller-list. Also add a treningsområde-section to the pyramide filter.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: done]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: fork_verifier_agent]_

Oppdatert med korrekt AK-taxonomi:

- **L-faser:** L-KROPP → L-ARM → L-KØLLE → L-BALL → L-AUTO (rettet overalt — i ukeplan, dagsplan, øktplan-modal og periode-modal)
- **P-posisjoner:** Alle 14 punkter (P1.0 Address → P10.0 Finish) som pills i drill-editor, med riktige aktive (P1.0/P6.5/P7.0/P8.0)
- **Treningsområde-koder:** TEE · INN200 · INN150 · INN100 · INN50 · CHIP · PITCH · LOB · BUNKER · PUTT0-3 … PUTT40+ — synlig som ny seksjon i PlanSidebar + brukt i alle drill- og økt-meta-linjer
- **M-miljø:** Tooltips (Off-course / Innendørs / Range / Øvingsfelt / Bane trening / Bane turnering) og koder brukt eksplisitt
- **Spillerkategori A–K:** Badge ved hvert spillernavn i PlanSidebar (Markus = B, Eline = E, Astrid = C, Sondre = F, Henrik = F, Jakob = B)
- **Taxonomi-referansekort:** Nytt mini-kort nederst i PlanSidebar — alltid synlig oversikt over L/CS/M/PR-skalaer + LIFE-koder + økt-ID-format `[PYR]_[OMR]_[L]_[CS]_[M]_[PR]` med et live eksempel
- **Øktnavn i tittel:** "Press-utfordring · PUTT0-3" + rad med fargekodede parameter-pills (SLAG · PUTT0-3 · L-KØLLE · CS80 · M3 · PR4 · LIFE-RES · B-A-lag)

## User

Verifier agent check completed

## Assistant

_[tool: run_script]_

Fikset — kategori-badgen vises nå kun i PlanSidebar-listen, ikke i spillerkonteksten øverst til høyre. Resten av taxonomi-oppdateringen er klar og verifisert.

## User

Jeg øsnker dette designet i lys tema

## Assistant

_[tool: snip]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: done]_

Lys tema er på plass. Toggle (L/D) er øverst til høyre på hver visning, lagres i localStorage. Mørk shell (rail) beholdes per CoachHQ-mønster — alt annet flippes til varm krem.

_[tool: fork_verifier_agent]_

Lys tema er nå standard på alle 6 visninger + index. Forventer verifier-rapport.

## User

Verifier agent check completed

## Assistant

_[tool: snip]_

Lys tema verifisert og levert på alle 6 visninger + index. Toggle øverst til høyre (L/D) lagres i localStorage — du kan veksle når som helst.

## User

Save as standalone HTML: 01-aarsplan.html

## Assistant

_[tool: snip]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: super_inline_html]_

_[tool: delete_file]_

_[tool: copy_files]_

_[tool: str_replace_edit]_

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: delete_file]_

_[tool: present_fs_item_for_download]_

Ferdig — 929 KB, alt inkludert (fonter, CSS, tema). Fungerer offline.

