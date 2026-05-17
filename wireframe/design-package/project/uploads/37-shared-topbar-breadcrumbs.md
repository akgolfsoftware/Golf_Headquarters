# AK Golf Platform — Shared — Topbar + breadcrumbs

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/topbar`
- **Arketype:** G — Other (katalog-grid med live demos)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/topbar-breadcrumbs.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Topbar er den øverste horisontale baren på hver skjerm — innholder breadcrumbs (hvor er jeg?), global search, notifikasjoner, profil-meny. Forskjellig spec for CoachHQ vs PlayerHQ vs Web. Denne katalogen viser alle 4 varianter.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Øverst på siden."*
- Subtitle: `4 topbar-varianter · breadcrumbs auto-genereres fra route`

### Demo-grid (vertikalt stablet, brede demos)

4 mønstre:

1. **CoachHQ topbar**
   - Bredde: full
   - Innhold venstre: breadcrumbs (Hjem > Elever > Markus R)
   - Innhold midt: global search (Cmd+K trigger)
   - Innhold høyre: varslings-bjelle + profil-avatar (dropdown-meny)
   - Høyde: 56px
   - Bg: white (lys), card (mørk)

2. **PlayerHQ topbar (desktop)**
   - Innhold venstre: AK Golf-logo + sidebar-collapse
   - Innhold midt: blank
   - Innhold høyre: bjelle + avatar
   - Høyde: 64px

3. **PlayerHQ topbar (mobil)**
   - Innhold venstre: nav-tittel (per side, f.eks. "Trening")
   - Innhold høyre: bjelle + profil-ikon
   - Høyde: 48px
   - Sticky

4. **Web topbar (akgolf.no)**
   - Innhold venstre: AK Golf-logo
   - Innhold midt: nav-meny (Om / Tjenester / Kontakt)
   - Innhold høyre: "Logg inn" + "Book nå →"-CTA
   - Høyde: 72px (mer luft, marketing-feel)

### Breadcrumbs-spec

Auto-genereres fra route:
- `/admin/elever` → `Hjem > Elever`
- `/admin/elever/markus-r` → `Hjem > Elever > Markus R Pedersen`
- Hvert ledd er klikkbart utenom siste (current).
- Maks 5 nivåer; mellomledd kollapses til "..." på mobil.

### Right-rail: Regler
- "Breadcrumb-skiller: ` > ` (chevron-right ikon, muted)"
- "Current page i breadcrumb: foreground (ikke link)"
- "Cmd+K alltid trigger search-modal (cross-platform)"
- "Avatar-dropdown alltid samme items: Min profil / Innstillinger / Logg ut"

## KPI-strip — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Breadcrumb-ledd | default, hover (underline), klikk → navigate |
| Search-input | default, focus (ring), Cmd+K shortcut |
| Bjelle | default, hover, badge med count, klikk → varsler-dropdown |
| Avatar | default, hover, klikk → profil-dropdown |
| Logo | klikk → forside |

## Empty / loading / error

- **Bjelle empty:** ingen badge
- **Search empty:** "Søk på spillere, planer, økter..." placeholder

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 4 mønstre
2. Mørkt tema, samme
3. Search-modal (Cmd+K) åpen
4. Profil-dropdown åpen
5. Mobil ≤640px — alle topbars i mobil-form

## Ikke-mål

- Ikke implementere routing
- Ikke designe Cmd+K search-features (egen flate)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
