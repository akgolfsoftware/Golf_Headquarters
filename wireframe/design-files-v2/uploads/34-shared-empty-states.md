# AK Golf Platform — Shared — Empty-states-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/empty`
- **Arketype:** G — Other (katalog-grid)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/empty-states.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Empty-states-katalogen viser alle "ingen data ennå"-mønstre i plattformen. Brukes for å sikre konsistens — empty er **ikke en feil**, men en mulighet til å lære brukeren noe nytt eller anbefale neste steg. Hver empty har: ikon (ikke illustrasjon), 1 setning + 1 sub-setning, og 1–2 CTAs.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Når det ikke er noe å vise."*
- Subtitle: `12 empty-state-mønstre · 3 alvorlighets-grader`

### Filter-bar
- Chip: Type (First-time / Filter-no-result / All-done / Tier-locked / Error-fallback)

### Katalog-grid (3-kolonne)

Hvert kort:
- **Live empty-state-rendering** (faktisk komponent, ikke mockup)
- **Tittel** (Geist 14px medium): "First-time-spiller-list"
- **Type-pill**: First-time
- **Brukt i**: "/admin/elever når 0 spillere"
- **Spec**: ikon (Lucide Users) + tekst + CTA

12 mønstre:
1. **First-time** (helt ny bruker, 0 data) — venlig, "kom i gang →"
2. **Filter-no-result** (data finnes, filter gir 0) — "tilbakestill filter →"
3. **All-done** (positiv tilstand) — "Alt godkjent. Bra jobba!"
4. **Tier-locked** (Pro-feature) — blurred preview + oppgrader-CTA
5. **Coming-soon** (feature ikke deployet ennå) — "Vi jobber med dette →"
6. **Permission-denied** — "Du har ikke tilgang. Be admin om X →"
7. **Error-fallback** (data-fetch feilet) — "Kunne ikke laste. Prøv igjen →"
8. **Search-no-result** — "Ingen treff for 'X'. Prøv andre ord →"
9. **Time-window-empty** (periode-filter ga null) — "Velg bredere tidsvindu"
10. **Archived-only** (alt er arkivert) — "Ingen aktive. Vis arkiverte? →"
11. **Onboarding-step** (wizard-mellomstep) — "Snart klar. Fyll inn X →"
12. **Maintenance** (planlagt nedetid) — "Kommer tilbake kl 14:00"

### Right-rail: Regler
- "Aldri rød/destructive farge — empty er ikke feil"
- "Alltid 1 setning + 1 sub-setning + maks 1 CTA"
- "Bruk Lucide-ikon (24-48px), ALDRI illustrasjon"
- "First-time-state skal lære, all-done-state skal feire"

## Klikkbare elementer

| Element | States |
|---|---|
| Card | hover (lift) |
| Filter-chip | default, hover, selected |
| CTAs i empty-states (live) | klikker fungerer som demo |

## Empty / loading / error

- **Empty (filter null):** "Ingen empty-states matcher" (meta!)

## Ønsket output fra Claude Design

1. Lyst tema, full katalog
2. Mørkt tema, samme
3. Filter aktivt: Type=Tier-locked
4. Hover på en card
5. Mobil ≤640px — 1-kolonne grid

## Ikke-mål

- Ikke designe alle empty-states fra scratch (de finnes i sine respektive batches)
- Ikke implementere live tier-gate-flyt

## Når du er ferdig

Lim design-link tilbake til Claude Code.
