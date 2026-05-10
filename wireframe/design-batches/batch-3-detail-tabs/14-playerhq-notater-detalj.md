# AK Golf Platform — PlayerHQ — Notat-detalj

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/notes/:id`
- **Arketype:** C — Detail + tabs (4 tabs, notat med tråd)
- **Tier-gating:** **Pro**
- **HTML-referanse:** `wireframe/screen-deck/playerhq/notater-detalj.html`
- **Audit:** `wireframe/audit/playerhq-notater-detalj.md`
- **Tilhørende modaler:** `RelatedNotesModal`, `LinkSessionModal`, `ActionableItemsModal`, `ShareWithParentModal`, `VideoPlayerModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spilleren leser et coach-notat etter en økt. Notatet kan ha actionable items (sjekkliste), video-vedlegg, og relaterte notater. Spilleren kan markere som lest, kommentere, og dele med foresatte.

## Header-blokk — UNIKT

- **Avatar:** 56px med Anders K + tag "Coach"
- **H1:** `Pitch 50-100m: konsistens-fokus` (Geist 24px, ikke italic — notat-tittel skal være lesbar)
- **Subtittel:** `Skrevet av Anders K · 8. mai 16:42 · Knyttet til økt 8. mai 14:00`
- **Stat-pills (4):** `0 ganger lest` · `3 relaterte notater` (klikk → RelatedNotesModal) · `Knytt til økt 09.05` (klikk → LinkSessionModal) · `2 actionable` (klikk → ActionableItemsModal)
- **Primary CTA:** `Marker som lest` (lime, blir `Markert som lest ✓` etter klikk)
- **Sekundær:** `Del med foresatte` (åpner ShareWithParentModal)

## Tab-strip (4 tabs)

| Tab | Innhold |
|---|---|
| **Notatet** (default) | Notat-tekst med highlights |
| **Relaterte** | 3 relaterte notater |
| **Kommentarer** | Tråd mellom spiller og coach |
| **Vedlegg** | Video + PDF + bilder |

## Layout — Notatet-tab (default)

### Notat-body (8-col)
- Tekstblokk i Geist 16px (line-height 1,7)
- Actionable-tekst med gul markering (Lucide `Highlighter`-ikon ved siden av): "[ ] Tren 4×15min pitch fra 75m hver dag denne uka" + "[ ] Logg refleksjon etter hver runde"
- Quote-blokker fra coach: italic Instrument Serif, accent venstre-border

### Sidebar (4-col)
- Knyttet til økt-card (klikkbar → økt-skjerm)
- Coach-info: Anders K avatar + "Send svar →"
- Tags: TEK · SLAG · pitch-konsistens

## Layout — Kommentarer-tab

Tråd-design:
- Hver kommentar = card (avatar + navn + dato + tekst)
- Spiller-kommentarer høyrejustert (lime bg)
- Coach-kommentarer venstrejustert (default bg)
- Bunn: tekstarea + `Send svar` CTA

## Layout — Vedlegg-tab

Grid 3-kol:
- **Video-thumbnail:** "Pitch-demo 75m.mp4" + duration + Lucide `Play`-overlay → klikk → VideoPlayerModal
- **PDF:** "TPI-rapport 8mai.pdf" + ikon
- **Bilde:** "Setup-foto" + thumbnail

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Marker som lest` CTA | default, hover, success-flash, after-state (`Markert ✓`) |
| `Del med foresatte` | default, hover, modal-trigger |
| Action-strip-pill (4 stk) | default, hover, klikk → modal |
| Video-thumbnail | default, hover (play-overlay), klikk → VideoPlayerModal |
| Kommentar-card | default, hover (subtle bg-shift) |
| `Send svar` CTA i kommentar-tab | default, hover, loading, success-toast |
| Relaterte-notat-rad | klikk → andre notat-detalj |

## Empty / loading / error

- **Empty Vedlegg:** "Ingen vedlegg på dette notatet"
- **Empty Relaterte:** "Ingen relaterte notater funnet"
- **Empty Kommentarer:** "Vær først til å kommentere"
- **Lest-state:** Banner endrer fra "Ulest" (warning) til "Lest 8. mai 17:03" (muted)
- **Loading:** Skeleton notat-body + sidebar

## Eksempel-data

- **Notat:** "Pitch 50-100m: konsistens-fokus"
- **Coach:** Anders Kristiansen
- **Spiller:** Markus Roinås Pedersen
- **Dato:** 8. mai 2026 16:42
- **Knyttet økt:** 8. mai 14:00 TEK 1:1
- **Actionable:** 2 (4×15min pitch + logg refleksjon)

## Ønsket output fra Claude Design

1. Lyst tema, Notatet-tab default (ulest)
2. Mørkt tema, samme
3. Lest-state (banner endret)
4. Tab-bytte til Kommentarer (med 3 meldinger)
5. Tab-bytte til Vedlegg (video-thumbnail synlig)
6. ActionableItemsModal åpen
7. Mobil ≤640px — sidebar stables under body

## Ikke-mål

- Ikke designe `VideoPlayerModal`, `ShareWithParentModal` (egne pakker)
- Ikke designe coach-notes-list (i batch 2)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
