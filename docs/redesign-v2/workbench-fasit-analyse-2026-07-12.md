# Workbench-fasiten (agencyos-kitet) — analyse og gap mot dagens skjerm

Kilde: Anders' opplastede offline-eksport av Claude Design-prosjektet
(2026-07-12). Fasit-filene er ekstrahert til
`docs/redesign-v2/fasit-agencyos-workbench/` (17 filer — KUN referanse,
importeres aldri). Anders' instruks: **«Vi må tilbake til den retningen.»**

## Nøkkelinnsikt

Dagens `WorkbenchV2` ble komponert fra `ui_kits/v2/wb.jsx` — en ENKLERE
generasjon. Fasiten i `ui_kits/agencyos/workbench-*` er den RIKE workbenchen
(97k app + 131k zones + 46k composer + egne årsplan/måned/økt/mobil/diff/
coldstart/tester-moduler). Retningen er den samme (mørk, presis), men
informasjonsarkitekturen er dypere.

## Fasitens Workbench-anatomi

1. **Topbar:** spillervelger (coach) · zoom `År / Måned / Uke / Økt` ·
   plan-status (DRAFT→…) · Publiser (med **diff-modal** før publisering —
   workbench-diff.jsx: før/etter-endringer coach godkjenner).
2. **Tre soner** (workbench-zones.jsx):
   - **Bibliotek** (venstre, ~200px): maler + økter, dras inn i canvas.
   - **Uke-canvas** (midt): tidslinje med full DnD (onDrop/onDragStart).
   - **Inspektør** (høyre, ~286px): valgt økt i dybde — redigering, drills,
     kobling til mål/fokus.
3. **Kontekst-paneler** (bunn — MANGLER HELT i dag): **Belastning/ACWR-sone**
   (ACWR: 109 forekomster i bundelen!), konflikter, turnering-nedtelling —
   coachens «konsekvens-visning» av uka han bygger.
4. **Statuslinje** (48px bunn): sone-status/varsler.
5. **Zoom-nivåene er EGNE MODULER:**
   - `workbench-arsplan.jsx`: periodeblokker (GRUNN/SPES/TURN) + peak-uker +
     turneringer på tidslinje — REDIGERBAR årsplan (ikke bare lesing som i dag).
   - `workbench-maaned.jsx`: månedsgrid (dagens MndNivaa er en forenklet variant).
   - `workbench-okt.jsx`: økt-nivået med DRILLS (blokker/rekkefølge) — dagens
     «Økt»-zoom er bare en agenda-liste.
6. **Composer** (workbench-composer.jsx, 46k): bygge-flyten for økter/uker
   (langt rikere enn dagens NyOktArk).
7. **Coldstart** (workbench-coldstart.jsx): førstegangs-/tom-tilstand med
   onboarding-løype (dagens «Ingen sesongplan» er en blindgate mot dette).
8. **Mobile-variant** (workbench-mobile.jsx, 61k) + **workbench-rail** (30k).

## Navigasjons-fasiten (agencyos-nav-data.js)

Tre grupper (+ AI-Caddie):
- **Planlegging:** Cockpit · Triage · Workbench · Kalender · Plans ·
  Utviklingsplan · Fysisk program · Drill-bibliotek
- **Oppfølging:** Stall · **Stall-tidslinje** (= årshjulet! sesong/faser/
  turneringer/peak per spiller — Å2 i planen) · Analyse · TrackMan ·
  Talent Coach · Turneringer
- **Drift:** Live-økt · Innboks · Godkjenninger · Økonomi · Organisasjon · Styring

Avvik mot dagens rail: Workbench skal være EGEN nav-post; «Uka»/«Booking» er
ikke toppnivå i fasiten (Kalender dekker agenda/uke/drag/peek); gruppene
heter Planlegging/Oppfølging/Drift.

## Gap-liste (dagens WorkbenchV2 → fasit), prioritert

| # | Gap | Fasit-modul |
|---|---|---|
| G1 | Kontekst-paneler (Belastning/ACWR + konflikt + turnering) mangler helt | workbench-zones |
| G2 | Publiser-diff (før/etter-godkjenning) mangler — Publiser sender blindt | workbench-diff |
| G3 | Årsplan-zoom er lese-liste; fasit = redigerbare periodeblokker + peak | workbench-arsplan |
| G4 | Økt-zoom er agenda; fasit = driller/blokker i økta | workbench-okt |
| G5 | Inspektør-sonen: dagens «Balanse» er tynnere (I6-redigeringen er et steg) | workbench-zones |
| G6 | Composer-flyten vs dagens enkle NyOktArk | workbench-composer |
| G7 | Coldstart-løype ved tom plan/sesong | workbench-coldstart |
| G8 | Nav-grupper/Workbench som egen post | agencyos-nav-data |
| G9 | Stall-tidslinje (årshjulet, Å2) — finnes som ferdig fasit-app | stall-tidslinje-app |
| G10 | Triage-flate under cockpit | triage-app |

## Rekkefølge (foreslått — designregelen: fasit → system → prod)

1. G8 nav-justering (liten) + G7 coldstart (fjerner dagens blindgate)
2. G1 kontekst-paneler + G5 inspektør (kjerneopplevelsen)
3. G3 årsplan-redigering (kobles Å1/Å2 — trenger gruppe-årsplan-tabellen)
4. G2 publiser-diff · G4 økt-drills · G6 composer
5. G9 stall-tidslinje som egen flate · G10 triage

> Regel: hver G-pakke bygges 1:1 mot fasit-fila (som golfdata-porten i v13),
> med ekte data og ærlige tomrom — aldri improvisert UI.
