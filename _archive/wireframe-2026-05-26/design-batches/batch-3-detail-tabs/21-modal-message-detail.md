# AK Golf Platform — Modal — MessageDetailModal

## Identitet

- **Type:** Modal (drawer-stil, høyrejustert 560px)
- **Åpnes fra:** Coach-detalj meldinger-tab · CoachHQ meldingsboks · Notifikasjon på ny melding
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/message-detail.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Quick-view av en meldings-tråd uten å åpne full meldingsboks-skjerm. Spilleren eller coach kan lese hele tråden, svare, og markere som lest.

## Layout

### Header
- Avatar 40px (samtalepartner) + grønn dot online
- Navn: `Anders Kristiansen` (Geist 16px) + sub `Hovedcoach · Online`
- `×`-lukk høyre

### Body (chat-tråd, scroll)

Chat-meldinger som cards:
- **Coach-meldinger** (venstre, default bg, 80 % bredde)
- **Spiller-meldinger** (høyre, lime bg, 80 % bredde)

Hver melding:
- Tekst (Geist 14px, line-height 1,5)
- Tidsstempel (JetBrains Mono 11px muted)
- Lest-status (✓ for sent, ✓✓ for lest) på spiller-side
- Vedlegg-thumbnail (hvis video/bilde) som klikkbar

Eksempel-meldinger (4 stk):

| Avsender | Tekst | Tid |
|---|---|---|
| Anders | "Hei Markus, hvordan gikk pitch-økten?" | i går 16:42 |
| Markus | "Bra! Følte konsistens på 75m, men 100m er fortsatt hit-and-miss" | i går 17:03 |
| Anders | "Skjønner. La oss kjøre 100m-fokus tirsdag 14:00. Booket allerede." | i går 17:05 |
| Anders | *Vedlegg: Pitch-demo 100m.mp4* | i dag 09:14 |

### Tema-banner (topp av body)
Liten chip-rad: `Tema: Plan` (klikkbar for å filtrere)

### Footer (input-rad)
- Tekstarea (auto-grow, max 160px)
- Vedlegg-knapp `+`
- `Send svar` lime CTA (disabled hvis tom)

## States

| State | Beskrivelse |
|---|---|
| Default | Pre-fyllt med tråd-historikk |
| Loading initial | Skeleton 4 meldinger |
| Empty (ny tråd) | "Vær først til å sende melding" |
| Send-loading | Spinner i CTA |
| Send-error | Inline rød "Kunne ikke sende. Retry" |
| New-message-incoming | Pulse + ny melding sliders inn fra bunnen |
| Coach-typing | "Anders skriver..." indikator (3 prikker pulse) |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover |
| Avatar | klikk → coach-detalj-skjerm |
| Vedlegg-thumbnail | klikk → VideoPlayerModal eller fullskjerm-bilde |
| Tema-chip | default, hover, klikk → filter |
| Tekstarea | default, focus (ring), with-text |
| `+` vedlegg | default, hover, file-picker |
| `Send svar` | disabled, default, hover, loading, success |
| Action-meny `...` (per melding) | klikk → Marker som lest / Slett / Rapporter |

## Eksempel-data

- **Tråd:** Mellom Markus R Pedersen og Anders K
- **Tema:** Plan
- **4 meldinger:** Spørsmål om pitch-økt + svar + booking-bekreftelse + video-vedlegg

## Ønsket output fra Claude Design

1. Lyst tema, default 4 meldinger
2. Mørkt tema, samme
3. Coach-typing-indikator aktiv
4. Send-loading-state
5. New-message-incoming pulse
6. Empty (ny tråd)
7. Mobil ≤640px — modal full-screen

## Ikke-mål

- Ikke designe full meldingsboks-skjerm (annen batch)
- Ikke designe compose-skjerm (pakke 15)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
