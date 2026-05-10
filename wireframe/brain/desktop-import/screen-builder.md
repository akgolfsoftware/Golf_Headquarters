# Skjermbygger — AK Golf HQ

Nar du bygger eller redesigner en skjerm, folg denne oppskriften:

## 1. Identifiser overflate
- PlayerHQ (lys, lime accent, fitness-premium)
- CoachHQ (lys, strukturert, profesjonell)
- Landing (mork hero, lyse seksjoner)

## 2. Layout-regler
- ALDRI uniform 3x1 grid — varier med asymmetriske splits (65/35, 2fr/1fr)
- La det viktigste innholdet fa mest plass
- Maks 1 featured kort per seksjon (accent-bg)
- Generos spacing mellom seksjoner (48-64px)
- Stram spacing inni kort (16-20px)

## 3. Kort-bruk
- Flush: inline-innhold uten wrapper
- Standard: hvit med border, 20px radius
- Featured: accent-bg eller storre, shadow-card-hover

## 4. Typografi per skjerm
- 1 hero-element i Inter Tight italic (greeting, hero-stat)
- Seksjonstittler i Inter Tight bold
- KPI i JetBrains Mono, stort
- Body i Inter 15px
- Labels i Inter 12px uppercase

## 5. Lime-bruk per skjerm
- Maks 3 lime-elementer synlige samtidig
- CTA-knapp + active pill + 1 featured element

## 6. Anti-patterns (sjekkliste)
- [ ] Ingen gradient-avatarer
- [ ] Ingen translateY(-3px) hover
- [ ] Ingen uniform grid (3x1 / 4x1 uten variasjon)
- [ ] Maks 2 eyebrows
- [ ] Maks 3 pill-varianter synlige samtidig
- [ ] Ingen ambient-glow
- [ ] Sterk typografisk kontrast mellom nivaer

## 7. States (alle skjermer)
- Normal (med data)
- Empty (EmptyState med CTA)
- Loading (skeleton)
- Error (feilmelding med retry)

## 8. Inspirasjon-patterns (bruk der relevant)
- Uke-pills (W1-W6) for navigasjon
- Streak-grid med fargede prikker
- Progress-bar med lime gradient-fill
- Venstre-stripe pa oktkort (pyramide-farge)
- Store +/- knapper for rep-logging
- Glassmorfisk overlay pa foto-bakgrunn
