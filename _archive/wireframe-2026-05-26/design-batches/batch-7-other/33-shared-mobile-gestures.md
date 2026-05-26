# AK Golf Platform — Shared — Mobile gestures-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/gestures`
- **Arketype:** G — Other (katalog-grid med animerte demos)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/mobile-gestures.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Mobile-gestures-katalogen viser alle touch-baserte interaksjoner i plattformen — swipe-to-dismiss, pull-to-refresh, long-press, pinch-to-zoom (på charts), swipe-mellom-tabs. Med animasjonseksempler så designere/devs kan se hvordan det skal føles. Mobile-first-prinsippet betyr at PlayerHQ især skal jobbe sømløst med disse.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Berøring som fungerer."*
- Subtitle: `9 gestures · alle med haptic feedback`

### Demo-grid (2-kolonne, animerte)

Hvert kort har **animert demo** (autoplay loop):

1. **Swipe-to-dismiss** (toast/notif)
   - Demo: notifikasjon glir ut til høyre med fade
   - Threshold: 50% av bredde
   - Haptic: light impact ved release

2. **Pull-to-refresh**
   - Demo: dra liste ned, spinner åpenbarer seg
   - Threshold: 80px
   - Haptic: medium impact ved trigger

3. **Long-press** (context-menu)
   - Demo: trykk og hold på en card → context-menu
   - Threshold: 500ms
   - Haptic: medium ved trigger

4. **Swipe-tabs** (PlayerHQ tab-bar)
   - Demo: swipe horisontalt mellom Hjem/Tren/Mål/Meg
   - Threshold: 30% av bredde
   - Haptic: light ved tab-bytte

5. **Pinch-to-zoom** (charts)
   - Demo: 2 fingre på chart, zoom inn
   - Min/max zoom: 1x-5x

6. **Swipe-actions** (list-rad)
   - Demo: swipe rad venstre → "Slett"-knapp åpenbarer seg
   - Swipe høyre → "Marker som ferdig"

7. **Drag-to-reorder** (kanban-cards)
   - Demo: long-press på card → drag til ny posisjon
   - Haptic: light ved hver drop-zone-hover

8. **Edge-swipe** (tilbake-navigasjon)
   - Demo: swipe fra venstre kant → tilbake
   - Aktiv på alle detail-views

9. **Bottom-sheet drag** (modaler)
   - Demo: dra modal ned for å lukke
   - Threshold: 30% av høyde

### Right-rail: Regler
- "Alltid haptic feedback hvis device støtter (ignorer hvis user har disabled)"
- "Aldri block scroll for gestures (alltid additive, ikke replace)"
- "Visuell hint ved første gang (toast 'Swipe for å lukke' med X)"

## Klikkbare elementer (på selve katalog-siden)

| Element | States |
|---|---|
| Demo-card | hover (start animasjon eller restart), klikk → expand til full-screen demo |
| Restart-knapp | klikk → restart animasjon |

## Empty / loading / error

- N/A (statisk katalog)

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 9 gestures
2. Mørkt tema, samme
3. Hover på en demo-card med restart-knapp synlig
4. Full-screen demo av "Swipe-to-dismiss"
5. Mobil ≤640px — 1-kolonne, demos blir touch-able for ekte test

## Ikke-mål

- Ikke implementere haptic feedback (devs gjør det)
- Ikke designe selve gesture-libraries

## Når du er ferdig

Lim design-link tilbake til Claude Code.
