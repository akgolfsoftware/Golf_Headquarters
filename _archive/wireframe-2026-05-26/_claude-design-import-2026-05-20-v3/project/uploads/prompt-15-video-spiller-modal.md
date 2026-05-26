# Prompt 15 — Video-spiller fullscreen modal

## Hensikt

I `/portal/coach/videoer` (i dag stub 53 linjer) klikker Markus en video-thumbnail og fullskjerm-spiller åpnes med kapittel-navigering, side-by-side ("før/etter"), og kommentartråd til coachen.

## Trigger

Klikk på video-card i `/portal/coach/videoer`.

## Layout

- Fullscreen-modal (`fixed inset-0`), mørk bakgrunn `#0F2A22`, `p-0`.
- Topp-bar 64 px høy, cream tekst:
  - X-knapp venstre
  - Tittel midten: "Iron contact — 17. mai" Inter Tight 16 px
  - Høyre: Lucide Share2, Bookmark, Download
- Hoved-spillerlerret (16:9 sentrert, max-width 1280 px):
  - HTML5 video-element
  - Kontroll-overlay (kun ved hover): play/pause, scrub, timestamp JetBrains Mono, hastighet (0.25× / 0.5× / 1× / 2×), fullscreen
- Sidepanel høyre 360 px:
  - Tabs: "Kapitler" / "Notater" / "Coach"
  - Kapitler: liste med timestamp + tittel
  - Notater: Markus' egne notater per tidspunkt
  - Coach: meldinger fra coach knyttet til tidspunkt + "Send svar"-felt
- Bunn-bar 48 px: progress-bar tabular nums + speed-pills

## Komponenter

- Custom video player, `Tabs`, `Button`, `Textarea`
- Lucide: X, Play, Pause, FastForward, Rewind, Maximize, Volume2, Bookmark, Share2, Download, MessageSquare

## Eksempel-data

```
Video: "Iron contact analyse"
Coach: Anders K
Lengde: 4:32
Kapitler: 0:00 Setup, 1:12 Backswing, 2:34 Impact, 3:50 Follow-through
Coach-melding på 2:34: "Se hvordan hoften åpner seg for tidlig"
```

## Branding-krav

- Mørk modal-bakgrunn forest-mørk, lime aksent på progress.
- JetBrains Mono for timestamps og hastighet.
- Norsk bokmål.

## Tilstander

- **Loading**: lime spinner sentrert.
- **Feil**: destructive-banner med retry.
- **Mobil**: sidepanel blir bunn-drawer.
