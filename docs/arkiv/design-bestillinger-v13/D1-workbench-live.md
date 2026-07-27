# Claude Design-bestilling — D1-gap: Live-økt + Workbench-palette

> Skrevet 2026-07-06 (design-bølgeplan D1). Disse flatene har **genuint nye mønstre** som ikke
> finnes i v13-kit-et — de skal TEGNES i Claude Design mot kit-et, ikke improviseres i kode
> (skjermkomposisjons-kontrakten). Alt annet i Workbench komponeres direkte fra eksisterende
> komponenter og trenger INGEN bestilling.
>
> **Til Anders:** lim hver bestilling under inn i Claude Design-prosjektet som eier
> `public/design-handover/` (v13). Be om leveranse i samme format: skjerm-HTML + ev. nye
> komponenter som jsx + d.ts + prompt.md-triade.

## Felles kontekst (lim inn først i Claude Design-økten)

Plattform: AK Golf HQ. Design-system: v13 (forest #005840 / lime #D1F843, Familjen Grotesk +
Inter + JetBrains Mono, tokens i tokens/colors.css, lime aldri på lys flate). Eksisterende
komponenter som SKAL gjenbrukes der de passer: OektKort, LiveStatus, LFaseBadge, AKFormelChip,
TidsGrid, UkeKalender, KpiTile, RingGauge, Pyramid, Card, DataTable, Modal/Sheet/Drawer.
IA er LÅST til koden — rutene og databegrepene under kan ikke endres.

---

## Bestilling 1 — Live-økt spiller (3 skjermer: brief / aktiv / oppsummering)

Ruter: `/portal/(fullscreen)/live/[sessionId]/brief` → `/active` → `/summary`.
Mobil-først 390 px, fullskjerm (ingen bunn-nav). PlayerHQ = alltid lyst tema, MEN aktiv-skjermen
kan bruke mørk data-hero-innfelling (class="dark"-scope) for timer/fokus-sonen.

**Brief:** Spilleren står på rangen og skal i gang. Viser: øktnavn + L-fase (LFaseBadge),
dagens drills som sjekkliste (fra TrainingPlanSession → SessionDrill, med repstype + volum per
drill), AK-formel-chip, coach-notat hvis satt, én stor start-CTA. Maks 30 sek lesing.

**Aktiv:** Én drill om gangen. Stor timer/rep-teller (mono-tall), gjeldende drill med
mål (CS-target der det finnes), «neste opp»-hint, logg-knapper for repetisjoner
(treff/bom eller tall-input per repstype: TID / REPS / CS / TELLENDE), pause/hopp over/avslutt.
Fokus-modus: minimal chrome, tommel-vennlig nederst.

**Oppsummering:** Etter økt. Volum per pyramide-akse (Pyramid-komponenten), drills fullført
vs. planlagt, CS-resultater mot mål, opplevd innsats (RPE-velger 1–10), fritekst-notat,
del-med-coach-CTA. Feiring uten konfetti-støy — rolig premium.

**Datafelter (låst):** SessionDrill { drillId, navn, repstype: TID|REPS|CS|TELLENDE, volum,
csMin/csMax, rekkefølge }, TrainingPlanSessionLog { fullført, resultat, rpe, notat }.

---

## Bestilling 2 — Live-økt coach-speil (1 skjerm + varsel-tilstand)

Rute: `/admin/live/[sessionId]`. Desktop-først, AgencyOS (mørk default, må virke i lys).
Coachen følger 1–8 samtidige spillere i sanntid. Viser per spiller: LiveStatus-badge,
gjeldende drill + progresjon (x av y drills), siste loggede resultat, avvik-flagg (spiller
hoppet over drill / CS langt under mål). Klikk på spiller → sidepanel (Drawer) med full
drill-liste og mulighet til å sende kort melding («bra tempo», «senk kravet ett hakk»).
Ingen sperring — coach observerer og anbefaler, aldri låser.

---

## Bestilling 3 — Workbench Standardøkter-palette (venstre sidepanel)

Rute: `/portal/planlegge/workbench` (fane «Standardøkter») + coach-speilet
`/admin/spillere/[id]/workbench`. Kun coach ser paletten (spiller ser ikke PaletteSidebar).
Desktop-først. Venstre panel (~280 px) med søkefelt + kategori-filter (pyramide-akser) +
kort-liste av standardøkter/maler som DRAS inn i UkeKalender/TidsGrid til høyre.
Kort viser: navn, akse-farge-strek, varighet, L-fase-badge, drill-antall. Drag-affordance
(grip-håndtak). Tom-tilstand + lastetilstand. Gjenbruk OektKort-anatomien i kompakt variant.

---

## Leveransekrav (alle bestillinger)

1. Begge temaer der flaten krever det (AgencyOS lys+mørk; PlayerHQ lys + ev. mørk innfelling).
2. Alle tilstander: tom, laster, feil, hover/fokus, samt live-oppdatering (dataliv) der relevant.
3. Kun tokens — ingen nye farger. Nye komponenter leveres som triade (jsx + d.ts + prompt.md).
4. Norsk bokmål i all UI-tekst; terminologi fra ordboken (Nærspill, aldri «kortspill»).
5. Måltall med enhet og retning (12 m H, ikke «12»).
