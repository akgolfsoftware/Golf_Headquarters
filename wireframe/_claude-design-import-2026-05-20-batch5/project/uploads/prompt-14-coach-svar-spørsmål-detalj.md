# Prompt 14 — Coach-svar på spørsmål (detalj)

## Hensikt
Vise et spesifikt coach-svar på et spørsmål spilleren stilte, isolert fra meldingstråd. Brukes når spilleren stiller "Spørsmål til coach" via dedikert flyt (ikke fri-tekst-melding).

## Trigger
`/portal/coach/spørsmål/[id]` — fra varsel "Hans har svart på spørsmålet ditt" eller fra spørsmåls-liste.

## Layout
Standard portal-page, maks-bredde 720px. Header: "Spørsmål til coach". Body: spørsmåls-kort øverst (cream bg), svar-kort under (lime accent bar venstre), reaksjons-rad nederst.

## Komponenter
- Spørsmåls-kort: spillerens spørsmål med avatar, tidsstempel, kategori-chip
- Svar-kort: coachens svar med avatar, tidsstempel, body. Lime venstrekant 4px.
- Vedlegg under svar (hvis noen): inline thumbnails
- Reaksjons-rad: "Hjelp dette deg?" + emoji-toggle (thumbs-up / thumbs-down — bruk Lucide-ikoner, ikke emoji)
- "Still oppfølgings-spørsmål" CTA: åpner compose (prompt-11)
- Relaterte spørsmål nederst: 3 kort med liknende spørsmål andre har stilt

## Eksempel-data
- Spørsmål ID: q_8842
- Markus spurte 17.05 kl 18:22:
  - Kategori: "Teknikk"
  - "Hvordan vet jeg om jeg har riktig grep-trykk når jeg drive-r?"
- Hans Brennum svarte 18.05 kl 09:14:
  - "Et godt utgangspunkt er 4 av 10 — fast nok til kontroll, løst nok til at håndleddene kan jobbe..."
  - 380 ord, 2 vedlegg (illustrasjon.jpg, demo-video.mp4)
- Markus har markert som "Hjalp"
- Relaterte spørsmål: 3 stk om grep, balanse, tempo

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (body), JetBrains Mono (tid), Instrument Serif italic (kategori-chip "Teknikk")
- Lucide-ikoner stroke 1.75 (thumbs-up, thumbs-down, message-circle, link)
- Norsk bokmål, ingen emojier

## Form-felter
- Reaksjon: thumbs-up / thumbs-down toggle
- Oppfølgings-spørsmål kommer fra compose

## Submit / actions
- Reaksjon: PATCH `/api/portal/questions/[id]/reaction` (auto)
- Oppfølgings-spørsmål → prompt-11 med pre-utfylt mottaker
- Relatert spørsmål-klikk → ny `/portal/coach/spørsmål/[id]`

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Vedlegg-thumbnails 80x80 radius 8
- A11y: aria-pressed på thumbs-toggle
- Norsk dato/klokke
