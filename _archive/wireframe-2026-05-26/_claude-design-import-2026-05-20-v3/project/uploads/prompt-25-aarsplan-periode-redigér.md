# Prompt 25 — Årsplan periode rediger

## Hensikt
La spilleren (eller coach) endre detaljer på en periode i årsplanen: navn, datoer, fokus, mål, intensitet.

## Trigger
Klikk på periode i `/portal/tren/aarsplan` → "Rediger periode". URL: `/portal/tren/aarsplan/periode/[id]/redigér`.

## Layout
Slide-up sheet/full-page route. Header med periode-navn + tilbake-pil. Body: form i seksjoner. Sticky footer.

## Komponenter
- Periode-meta-form:
  - Navn (text)
  - Type-select: Forberedelse · Konkurranse · Restitusjon · Off-season
  - Farge-velger: lime, forest-dyp, cream-varm, muted (4 swatcher)
  - Start-dato + Slutt-dato (range-picker)
- Fokus-form:
  - Fokusområder-multiselect: Driver · Jernspill · Wedge · Putting · Mental · Fysisk · Kortspill
  - Mål for perioden (tagged-textarea — kan ha flere mål)
- Intensitet:
  - Volum-slider (1–10) — antall økter per uke
  - Belastning-slider (1–10) — fysisk intensitet
  - Konflikt-varsel hvis overlapper annen periode
- Vedlegg/notater:
  - Tilknyttede turneringer (multi-select fra turnerings-DB)
  - Coach-notat (textarea)
- Sticky footer: Slett periode (destructive ghost venstre) + Avbryt + Lagre

## Eksempel-data
- Periode-ID: p_2026_konk1
- Navn: "Konkurranse-blokk juni"
- Type: Konkurranse
- Farge: forest-dyp
- Start: 01.06.2026, slutt: 30.06.2026
- Fokus: Driver, Putting, Mental
- Mål: ["Top 10 NM Junior", "Sub-72 snitt i 4 runder"]
- Volum: 6, Belastning: 7
- Tilknyttede turneringer: NM Junior, GFGK Open
- Coach-notat: "Reduser teknisk fokus, hold form. Mer på-banen-trening."

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843, destructive #A32D2D)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (dato/tall), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (calendar, target, trending-up, palette, trash)
- Norsk bokmål, ingen emojier

## Form-felter
Som listet ovenfor. Alle datoer obligatoriske, fokusområder min 1.

## Submit / actions
- Lagre: PATCH `/api/portal/year-plan/periods/[id]` → toast + redirect
- Slett: åpner bekreftelses-modal → DELETE
- Avbryt: hvis dirty, "Forkast endringer?"-modal

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Range-picker: norsk dato `dd.mm.yyyy`
- Konflikt-deteksjon mot eksisterende perioder (klient-side visualisering)
- A11y: form valideringsmeldinger, aria-invalid
