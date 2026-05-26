# Prompt 26 — Økt-detalj (planlagt)

## Hensikt
Vise alle detaljer for en planlagt økt før den starter — innhold, øvelser, mål, utstyr — slik at spilleren er forberedt.

## Trigger
Klikk på øktekort i kalender, treningsplan eller dashboard. URL: `/portal/tren/[sessionId]`.

## Layout
Standard portal-page, maks-bredde 880px. Header: økt-tittel + dato/tid + status-badge (Planlagt/Pågår/Fullført). Body: 4 seksjoner. Footer: Start økt (primary lime) når innen ±15min av starttid.

## Komponenter
- Status-badge: cream bg + forest text "Planlagt 14:00 i dag"
- Meta-row: type-chip, varighet, lokasjon (Lucide map-pin), coach (avatar 24)
- Mål-seksjon: 3 mål for økten med checkbox-style (ikke checkable her — kun visning)
- Plan-seksjon: tidslinje med blokker
  - 14:00 Oppvarming · 10 min
  - 14:10 Putting · 20 min
  - 14:30 Wedge 50–80m · 25 min
  - 14:55 Cool-down · 5 min
- Utstyr-liste: ikoner + navn (driver, 3 wedges, putter, alignment sticks, target-disks)
- Øvelser-aksordion: hver øvelse expandable med beskrivelse, video-thumbnail, antall reps
- Notat fra coach: cream-kort med italic-text "Husk å fokusere på tempo i bakswing — vi snakket om dette sist."
- Action-bar nederst:
  - Hvis økt-start innenfor ±15 min: `Start økt` (primary lime, stor)
  - Ellers: `Endre tid` (ghost) · `Avlys` (destructive ghost)

## Eksempel-data
- Økt-ID: s_5512
- Type: Privat coaching
- Tittel: "Wedge-presisjon 50–80m"
- Dato: 22.05.2026 kl 14:00–15:00
- Lokasjon: GFGK Performance Studio
- Coach: Hans Brennum
- Mål: ["Treff GIR 7/10 fra 60m", "Konsistens i tempo", "Identifisere mønster i misser"]
- Utstyr: Pitching wedge, Gap wedge, Sand wedge, Lob wedge, alignment sticks, 3 target disks
- Coach-notat: "Husk fokus på tempo — vi snakket om at backswing-tempo ble for kort sist."

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tid/dato), Instrument Serif italic (sparsom — coach-notat)
- Lucide-ikoner stroke 1.75 (clock, map-pin, target, play, x, edit)
- Norsk bokmål, ingen emojier

## Form-felter
Ingen.

## Submit / actions
- `Start økt` → routes til `/portal/(fullscreen)/live/[sessionId]/brief` (prompt-27)
- `Endre tid` → åpner reschedule-modal
- `Avlys` → åpner bekreftelses-modal (re-bruk batch 1 prompt-04 variant)

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Tidslinje med 4px lime venstrekant og prikker for hver blokk
- Norsk dato/tid
- A11y: aksordion med aria-expanded
