# Prompt 21 — Legg til runde manuelt

## Hensikt
La spilleren registrere en runde som ikke kom via GolfBox-synk (f.eks. utenlandsk bane, vennegolf, treningsrunde).

## Trigger
CTA `Legg til runde` på `/portal/mal/runder`. URL: `/portal/mal/runder/legg-til`.

## Layout
Full-page route, maks-bredde 720px. Header med "Tilbake" + tittel. Body: form-grupper. Sticky footer på mobil.

## Komponenter
- Form-seksjon 1 — Bane: søkbar bane-velger (autocomplete fra norsk + internasjonal bane-DB), Tee-velger (Hvit/Gul/Blå/Rød), Slope/CR-felter (auto-fyllt)
- Form-seksjon 2 — Score: Hull-grid 18 ruter (par-tall pre-utfylt, score-input), eller raskt totalt-felt
- Form-seksjon 3 — Kontekst: dato, været (chips: sol/skyet/regn/vind), spilltype (single/foursome/scramble/comp/practice), partner-navn (tags)
- Form-seksjon 4 — Stats (valgfritt, kollapsbar): FIR%, GIR%, Putts/hull, Sand-saves, Penalties
- Form-seksjon 5 — Notater: textarea 500 tegn, "Telle på HCP?"-toggle
- Sticky footer: Avbryt + Lagre runde

## Eksempel-data
- Bane: Larvik GK
- Tee: Hvit
- Slope: 134, CR: 71,5, Par: 72
- Dato: 18.05.2026
- Vær: sol, lett vind
- Type: practice
- Partner: Tim, Espen
- Score hull for hull: total 73 (+1)
- FIR: 11/14 (78%)
- GIR: 13/18 (72%)
- Putts: 30
- Notat: "God runde, kun ett trippel-bogey på 14."
- Tell på HCP: ja

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (score/tall), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (map-pin, sun, cloud, cloud-rain, wind, users, edit)
- Norsk bokmål, ingen emojier

## Form-felter
- `bane_id` UUID required
- `tee` enum required
- `dato` date required
- `score_per_hull` int[18] required (eller `score_total` int)
- `var` enum optional
- `spilltype` enum required
- `partnere` string[] optional
- `fir_treff`, `fir_total`, `gir_treff`, `gir_total`, `putts` int optional
- `notat` text optional max 500
- `tell_pa_hcp` boolean default true

## Submit / actions
- POST `/api/portal/rounds` → redirect til `/portal/mal/runder/[id]` med suksess-banner
- Auto-beregner over-par, score-vs-CR, stableford-poeng
- Hvis `tell_pa_hcp = true`: send til GolfBox-sync-kø

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Hull-grid: 18 input felter med par-tall visning over score-felt
- Norsk dato + tall
- A11y: tab gjennom 18 hull i logisk rekkefølge
