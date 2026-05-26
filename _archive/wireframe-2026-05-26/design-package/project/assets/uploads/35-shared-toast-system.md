# AK Golf Platform — Shared — Toast-system

## Identitet

- **Produkt:** Shared / cross-cutting (designer/dev-referanse)
- **URL:** `/admin/design/toasts`
- **Arketype:** G — Other (live demo-katalog)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/toast-system.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Toast-systemet er den standardiserte måten å gi øyeblikksfeedback på handlinger — "Lagret", "Slettet", "Kunne ikke laste". Sentralt definert plassering (bunn-høyre desktop, bunn-midt mobil), 4 severity-typer, auto-dismiss etter 3-5 sek (eller permanent for kritiske). Denne katalogen er live-demo + spec.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Småfeedback fra systemet."*
- Subtitle: `4 toast-typer · auto-dismiss 3-5s · maks 3 stacked`

### Demo-seksjon (4 trigger-knapper)

4 store knapper, klikk for å fyre toast i ekte plassering:
1. `Vis success-toast` (accent)
2. `Vis info-toast` (primary)
3. `Vis warning-toast` (gold)
4. `Vis error-toast` (destructive)

Pluss spesial:
5. `Vis toast med action` (toast med "Angre →"-knapp)
6. `Vis toast med progress` (loading-toast som blir success når ferdig)
7. `Vis 3 toasts samtidig` (stack-test)

### Spec-seksjon

Tabell:
| Type | Farge | Ikon | Auto-dismiss | Eksempel |
|---|---|---|---|---|
| Success | accent (lime) | `CheckCircle` | 3s | "Plan lagret" |
| Info | primary (mørk grønn) | `Info` | 4s | "Synker GolfBox..." |
| Warning | gold | `AlertTriangle` | 5s | "Plan utløper om 3 dager" |
| Error | destructive | `XCircle` | Manuell (kryss for å lukke) | "Kunne ikke lagre" |

### Plasserings-spec

- **Desktop:** Bunn-høyre, 24px margin
- **Mobil:** Bunn-midt, 16px margin
- **Stacking:** maks 3 synlige, eldste forsvinner først
- **Animasjon:** Slide-in 200ms ease-out, slide-out 150ms

### Right-rail: Anti-patterns
- "Aldri toast for noe brukeren KAN gå glipp av (bruk modal hvis kritisk)"
- "Aldri toast med lang tekst (>2 linjer = bruk inline-message)"
- "Aldri 2 success rett etter hverandre (debounce eller bunt)"

## Klikkbare elementer

| Element | States |
|---|---|
| Demo-knapp | default, hover, klikk → toast vises i ekte plassering |
| Toast | default, hover (pause auto-dismiss), klikk action, swipe-to-dismiss (mobil), kryss-X |
| Action-knapp i toast | default, hover, klikk → handling utføres + toast forsvinner |

## Empty / loading / error

- N/A (alltid demo-bart)

## Ønsket output fra Claude Design

1. Lyst tema, demo-side med ingen aktive toasts
2. Lyst tema, med 1 success-toast synlig bunn-høyre
3. Lyst tema, 3 toasts stacked (success + info + warning)
4. Mørkt tema, samme stack
5. Toast med action ("Slettet — Angre →")
6. Mobil ≤640px — toast bunn-midt, full bredde

## Ikke-mål

- Ikke implementere toast-library (devs bruker react-hot-toast eller sonner)
- Ikke designe push-notifications (egen flate)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
