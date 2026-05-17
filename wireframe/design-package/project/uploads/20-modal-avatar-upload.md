# AK Golf Platform — Modal — AvatarUploadModal

## Identitet

- **Produkt:** Shared (brukes fra både CoachHQ og PlayerHQ)
- **URL:** Modal — åpnes fra `/admin/profil`, `/meg/profil`, og evt. `/admin/team`
- **Arketype:** F — Settings + profile (modal-variant)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/avatar-upload.html` (lag ny)
- **Audit:** finnes ikke ennå

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

AvatarUpload-modalen håndterer last-opp + crop + lagre av profilbilde. Brukes både av Anders (coach-profil) og Markus (spillerprofil). Skal være rask og forutsigbar — drag-drop, crop til kvadrat, preview på rund avatar, lagre.

## Layout — UNIKT for denne modalen

Modal centrert, max-bredde 560px, max-høyde 80vh.

### State 1: Tom (drop-zone)

- Header: "Last opp profilbilde" + close-X
- Stort drop-zone-område (400x300):
  - Dashed border (2px, accent på hover)
  - Lucide `ImagePlus`-ikon (48px, muted)
  - Tekst: "Slipp bilde her, eller klikk for å velge"
  - Sub-tekst: "PNG eller JPG, min 256x256, maks 5 MB"
- Action-bar bunn: `Avbryt` (ghost)

### State 2: Crop (etter opplasting)

- Header: "Crop bildet ditt"
- Stort crop-område (square 360x360):
  - Bilde med drag/zoom (react-easy-crop eller tilsvarende)
  - Crop-guide (rund overlay viser hvordan det vil se ut som avatar)
  - Zoom-slider under: 1x → 3x
- Side-panel høyre: Live preview (3 størrelser):
  - Stor (140x140) — på profil-side
  - Medium (40x40) — i tabell
  - Liten (24x24) — i meldinger
- Action-bar bunn: `Tilbake` (ghost) | `Lagre` (primary)

### State 3: Lagrer

- Crop-område fade-out
- Sentrert spinner + "Lagrer bilde…"
- Progress-bar (0–100%)

### State 4: Suksess

- Green checkmark animert
- Tekst "Profilbilde oppdatert!"
- Modal lukkes etter 1.5 sek
- Toast bekrefter på underliggende side

### State 5: Feil

- Rød ikon `AlertCircle`
- Feilmelding (per type):
  - "Filen er for stor (8 MB). Maks 5 MB."
  - "Filtype ikke støttet (HEIC). Bruk PNG eller JPG."
  - "Bildet er for lite (180x180). Min 256x256."
  - "Nettverksfeil. Prøv igjen →"
- "Prøv igjen"-knapp

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Drop-zone | default, hover (border accent), drag-over (bg accent/10), drop |
| Filvelger (klikk drop-zone) | åpner OS file dialog |
| Crop-area drag | cursor: move, drag aktiv |
| Zoom-slider | default, drag-thumb |
| "Lagre" | default, hover, loading (spinner i knapp) |
| "Tilbake" | default, hover, klikk → tilbake til drop-zone state |
| Close-X | default, hover, klikk → confirm hvis dirty ("Du har ulagrede endringer") |

## Empty / loading / error

- **Drag fra utenfor browser:** Drop-zone får accent-border + "Slipp her"
- **Upload pågår:** Progress-bar 0–100% (ekte fra Supabase Storage)
- **Server-error:** Toast "Lagring feilet på server. Prøv igjen."
- **Bilde for skarpt komprimert:** Warning "Bildet ble komprimert til 1MB for raskere lasting"

## Tekniske noter (for Claude Design — kontekst, ikke design)

- Lagres i Supabase Storage bucket `avatars/`
- Genererer 3 størrelser server-side (Sharp): 140, 40, 24 px
- URL skrives til `User.avatarUrl` i Prisma
- Eksisterende avatar slettes etter 24 timer (grace-periode for cache)

## Ønsket output fra Claude Design

1. State 1 (tom drop-zone) lyst tema
2. State 2 (crop-modus) lyst tema med live-preview-panel
3. State 3 (lagrer) med progress-bar
4. State 5 (feil — for stor fil)
5. State 1 mørkt tema
6. Mobil ≤640px — modal full bredde, crop-area takler touch (pinch-zoom)

## Ikke-mål

- Ikke designe gallery-multiple-upload (egen modal)
- Ikke designe AI-bakgrunn-fjerning (Pro-feature, framtidig)
- Ikke designe avatar-historikk (forrige bilder)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
