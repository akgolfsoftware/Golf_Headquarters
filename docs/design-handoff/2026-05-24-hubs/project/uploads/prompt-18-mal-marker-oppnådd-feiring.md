# Prompt 18 — Marker mål oppnådd (feiring)

## Hensikt
Feire når en spiller når et mål — emosjonell belønning, deling, og oppfordring til neste mål.

## Trigger
Auto når et resultat-mål passerer terskelen (system-trigger), eller manuelt via "Marker som oppnådd"-knapp på mål-kort. URL: `/portal/mal/goal/[id]/marker-oppnådd`.

## Layout
Full-screen overtak (modal som dekker hele viewport) med confetti-bakgrunn (sparsom SVG). Sentrert kort 520px. Header med stor trofé-ikon (Lucide trophy 64px lime). Tittel "Du klarte det!" i Instrument Serif italic.

## Komponenter
- Confetti: 12–18 sparsomme SVG-trekanter/sirkler i forest/lime/cream som faller (CSS animation, ikke avhengig av JS)
- Trofé-ikon stor (Lucide trophy) i lime-fylt sirkel forest-ring
- Tittel "Du klarte det!" — Instrument Serif italic 40px
- Underoverskrift: "Du nådde målet ditt"
- Mål-kort: tittel, hva du oppnådde, dato startet → dato fullført, antall dager
- Statistikk-rad: 3 kolonner med JetBrains Mono tall
  - Tid brukt: 128 dager
  - Sessions logget: 47
  - HCP-endring: -2,1
- Delings-rad: 3 knapper — Del på Instagram-story / Send til coach / Kopier lenke
- Primary CTA: `Sett nytt mål` (lime)
- Secondary: `Lukk` (ghost)

## Eksempel-data
- Markus R.P.
- Mål: "Få handicap til +5,0"
- Startet: 12.01.2026
- Oppnådd: 19.05.2026
- Antall dager: 127
- Sessions: 47
- HCP-endring: +3,5 → +5,6 (overskredet med 0,6)
- Coach: Hans Brennum (auto-varslet)

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall), Instrument Serif italic ("Du klarte det!" — sentralt)
- Lucide-ikoner stroke 1.75 (trophy, share, copy, plus)
- Norsk bokmål, ingen emojier
- Confetti i AK Golf-paletten, ikke regnbue

## Form-felter
Ingen — kun feiring og deling.

## Submit / actions
- "Sett nytt mål" → routes til mål-bygger (prompt-32 AI eller manuell)
- "Del på Instagram" → genererer story-bilde
- "Send til coach" → POST i meldings-tråd: "Jeg klarte målet!"
- "Lukk" → marker som oppnådd i DB

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- CSS-only confetti (keyframes)
- Reduce-motion: confetti skjules ved `prefers-reduced-motion: reduce`
- Norsk dato
- A11y: dialog-rolle, focus på primary CTA, esc lukker
