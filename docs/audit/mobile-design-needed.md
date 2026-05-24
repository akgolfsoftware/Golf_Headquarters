# Mobile design needed — beta-prep 2026-05-25

Sider som krever ny design eller bredere refaktor, dvs. ikke kan fikses med
inline mobile-utilities. Spor A og B legger til her — IKKE overskriv.

## Spor B — PlayerHQ booking/coach/meg/analysere

- `/portal/booking/anlegg/[anleggId]` — "Tilgjengelighet"-gridden (80px+7×1fr) er ubrukbar på iPhone 393px. Trenger redesign: vertikal liste med dato-velger + tider for valgt dag, ELLER swipe-able dag-kolonner. Midlertidig fiks: overflow-x-auto + min-w-[640px] (krever horisontal scroll).

### Spor B status — beta-prep 2026-05-25
Fikset ~70 sider inline (mx-auto + px-4/sm:px-6 + min-h-11 på touch-targets):
- Alle booking-flyt-sider (booking, booking/ny, bekreft, [bookingId], coach/[coachId], anlegg/[anleggId], onskeligokt, ny-okt)
- Coach-modul (coach hub, notes, ovelser, plans, ai, videoer, melding/[id]-chat, [coachId], sporsmal)
- Meg-modul alle sub-sider (innstillinger × 8, sikkerhet + 2fa, abonnement × 5, bookinger + reschedule, foreldre, utstyrsbag, dokumenter, feedback, helse + symptom/ny, help × 4, profil/rediger)
- Analysere (statistikk + [metric] + sammenlign, mal hub + alle 10 sub-moduler)
- Varsler + reach

## Spor A — PlayerHQ trenings-flyt

- `/portal/tren/aarsplan` — `AarsplanInteraktiv` viser horisontal jan-des tidslinje med periode-blokker og turneringspins. Krever fundamental redesign for mobile: enten vertikal måned-liste med scrollable perioder eller swipe-able månedskort. Gantt-visualiseringen er ubrukelig under 768px.
- `/portal/(fullscreen)/tren` (Workbench Unified) — Stor 3-pane layout med 7 seksjoner (sidebar + hero + gantt + workbench-pane + mål-tracker + insight + trackman). Har innebygd responsive med sidebar-drawer, men fortsatt komplekst på iPhone 393. Trenger dedikert mobile-view eller PWA-mode for trenings-økt selv på iPhone.
- `/portal/(fullscreen)/test/[testId]/live` og `/summary` — Bruker delt `planlegge-v2/styles.css` med custom CSS. Steg-card layout med "5-slag tabell" er trang på 393px. Mobile-overrides for `.live-*` er lagt inn nå, men `step-card`-strukturen og 5-slag-tabellen krever ny design (vertikal stack vs. matrise).
- `/portal/tren/teknisk-plan/[planId]` — Plan-builder med høyre sidebar (Plan-sammendrag + TM-mål + Pyramide + Coach-activity). Responsive på 1100px (sidebar stack), men `.tp-p-head` grid (24px+56px+1fr+auto+24px) er trang på 393px. Burde re-designes som vertikalt kort uten flerlinje-grid.
- `/portal/tren/aarsplan/periode/[id]/rediger` — Edit-skjema for periode (ikke i partisjon, men bevisst nevnt for kontekst).

## Spor C — CoachHQ /admin/*

- `/admin/agencyos` — `CoachHome` Hero har god responsive baseline (font-display 3xl→4xl sm), men hovedlayoutet er kun definert som `space-y-6` uten 2/3-kolonne på desktop. Burde få en lg:grid-cols-[2fr_1fr] for å bedre utnytte 1440px-bredde i timeline + brennende-tasks.
- `/admin/spillere/[id]/rediger` — Hardkodet hex-palett gjennomsyrer hele siden (#E5E3DD, #FAFAF7, #005840, #D1F843, etc.) — krever bredere refaktor for å bytte til tokens, ikke bare inline mobile-fix.
- `/admin/spillere/[id]/profil` — Samme hex-problem. Inneholder 5-akset radar + DNA-rader som krever ny mobile-design (radar er kvadratisk og fungerer dårlig på smal iPhone).
- `/admin/spillere/[id]/plan/[planId]` — Drill-liste med 6-kolonne grid (`grid-cols-[20px_32px_1fr_auto_auto_auto]`) fungerer på desktop og iPad landscape, men trenger fundamentalt vertikal redesign for iPhone — kortvisning per drill med stacked metadata, ikke tabellrad.
- `/admin/availability` — 7-kolonne uke-layout brytes til 2-kolonne på sm. Mobile ser flere kort under hverandre — fungerer, men ineffektiv på iPhone. Vurder ukentlig vertikal liste i stedet.
- `/admin/calendar` — Hovedkalender-grid (CalendarWeekGrid) skjuler sidebar på <lg. Selve uke-gridden krever horisontal scroll på iPad portrait. Burde ha dag-vy som default på iPhone (allerede tilgjengelig via toggle), men ingen auto-switch ved smal viewport.
- `/admin/plans/new` (PlanWizard) — Mange wizard-steg med komplekse sub-layouts (pyramide-allokering med ranges, drill-templates med grid). Generelt OK responsive, men hele wizard-stien trenger UX-pass på iPhone for å unngå overskygging av "Forrige/Neste"-knapper med sticky bottom-area.
- `/admin/reports` — Stub uten implementert design. Når faktiske rapporter implementeres, må tabeller bygges responsive fra start (overflow-x-auto + min-width).
- `/admin/notion-oppgaver` — Stub-side med EmptyState. Når faktisk innhold legges til må mobile-layout designes.

