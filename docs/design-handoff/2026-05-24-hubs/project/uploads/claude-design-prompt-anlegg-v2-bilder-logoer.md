# Claude Design-prompt v2 — Anlegg/Samarbeidsklubber (oppdatert med bilder og logoer)

Bruk dette som tillegg til den første prompten. Fokus: bruk riktige bilder og logoer.

---

## Bilder per side

### Side 1 — Miklagard Golf
- **Hero:** `miklagard-hero.jpg` — luftfoto av hele banen fra drone (gylden høst, grønne fairways, bunkers)
- **Galleri (kontaktseksjon):** `miklagard-2.jpg` — dramatisk solnedgang bak bunkers og fairway, klubbhuset synes i bakgrunnen
- **Logo:** `miklagard-logo.png` — kremfarget "MIKLAGARD GOLF / For de store slagene" — vises på mørk grønn bakgrunn i CTA-banner

### Side 2 — Gamle Fredrikstad GK
- **Hero:** `gfgk-hero2.jpg` — rød flaggstang på green, overdekkede standplass-rekker i bakgrunnen
- **Galleri (kontaktseksjon):** `gfgk-2.jpg` — Kongsten fort (middelalderborg på bergknaus) tårner over golfbanen — dramatisk grå himmel
- **Logo:** `gfgk-logo.png` — fargerik gul/rød/turkis ridder-figur — vises på mørk grønn bakgrunn i CTA-banner

---

## Logoplassering

I CTA-banneret (mørk grønn bakgrunn `#005840`):
- Logo sentrert øverst i banneret, `opacity: 0.85`
- Miklagard: `width: 200px` — kremfarget logo synes godt på grønn bakgrunn
- GFGK: `width: 80px` (høyere logo-format, kun ikondelen) — fargerik, kompakt

---

## Oppdatert layout med logoer

```
CTA-banner (bg: #005840):
  [LOGO sentrert]
  eyebrow: "AK GOLF ACADEMY" (lime #D1F843, mono font)
  h2: "Vi trener her. Bli med." (hvit + italic lime)
  body: "AK Golf Academy holder til på [Klubbnavn]..."
  [Knapp: "Se tilgjengelige tider" — lime]
  [Link: "Se alle anlegg" — hvit/dempet]
```

---

## Stitch-prompt (lim inn direkte)

```
Oppdater designet for samarbeidsklubber-sidene med riktige bilder og logoer.

MIKLAGARD GOLF:
- Hero: luftfoto drone (gylden høst, bunkers, fairways, beige rough)
- Galleri: solnedgang bak store bunkers med klubbhus i bakgrunnen
- CTA-banner: kremfarget tekstlogo "MIKLAGARD GOLF / For de store slagene" sentrert øverst, opacity 85%

GAMLE FREDRIKSTAD GK:
- Hero: rød flaggstang på green, drivingrange-rekker bak
- Galleri: middelalderborg (Kongsten fort) på bergknaus over golfbanen, dramatisk overskyet himmel
- CTA-banner: fargerik ridder-ikon (gul/rød/turkis) sentrert øverst i banneret

GENERELT:
- Logoen i CTA-banner vises FØR eyebrow-teksten
- Bakgrunn for logoer er alltid mørk grønn (#005840) — ingen hvit boks rundt
- Tone: premium, rolig, lite tekst
- Vis desktop + mobil for begge sidene
```
