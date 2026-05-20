# Prompt 13 — Vedlegg-galleri for tråd

## Hensikt
Vise alle vedlegg fra en meldingstråd i et oversiktlig galleri, så spilleren slipper å scrolle gjennom hele tråden for å finne et bilde eller en video.

## Trigger
Tre-prikker-meny i meldings-tråd → "Se alle vedlegg". URL: `/portal/coach/melding/[id]/vedlegg`.

## Layout
Full-page route. Header med "Tilbake til tråd"-link + tittel "Vedlegg fra Hans Brennum". Body: filter-bar + grid 4 kolonner (desktop) / 2 (tablet) / 1 (mobil) med kort.

## Komponenter
- Filter-chips: Alle · Bilder · Videoer · PDF · Andre
- Sort-select: Nyeste først / Eldste først / Størrelse
- Grid med vedleggs-kort:
  - Bilde: thumbnail full-bleed, hover viser tittel + dato overlay
  - Video: thumbnail med play-overlay (Lucide play), varighet-pill
  - PDF: ikon + filnavn + sider
  - Andre filer: filtype-ikon + navn
- Hvert kort har download-icon-knapp øverst høyre (vis ved hover)
- Klikk på kort åpner lightbox/full-screen viewer
- Empty state: "Ingen vedlegg i denne tråden ennå"

## Eksempel-data
- Tråd med Hans Brennum
- 14 vedlegg totalt:
  - 8 bilder (skjermbilder fra TrackMan, swing-stills)
  - 3 videoer (swing-analyse 0:24, 0:31, 0:18)
  - 2 PDF-er (treningsplan-mai.pdf 2 sider, hjemmeoppgaver.pdf 4 sider)
  - 1 audio-fil (taleopptak 1:42)
- Datoer: 12. mai – 19. mai 2026

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (filstørrelser/dato), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (play, download, file-text, file, music, image)
- Kort: radius 12px, aspect-ratio 1:1, bg-card, border-line
- Norsk bokmål, ingen emojier

## Form-felter
Ingen.

## Submit / actions
- Klikk på kort → lightbox (re-bruk prompt-15 fra batch 1)
- Download-ikon → direkte nedlasting med presigned URL
- Filter/sort → klient-side filtrering, ingen ny request

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Lazy-load thumbnails (loading="lazy")
- A11y: alt-tekst på alle bilder, button-elementer rundt klikkbare kort
- Norsk dato-format: `12. mai`
