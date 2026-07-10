# Baneguide — designplan (referanse-oversatt til AK Golf v2)

**Dato:** 10. juli 2026 · **Status:** til godkjenning hos Anders (mockups bygges i Claude
Design `ui_kits/v2/baneguide-*` etter denne planen — design → system → prod).
**Referanser:** Anders' 5 bilder (GOLFX hull-skjerm, Golfio-dashboard, Pebble Beach-dashboard,
Emerald Palm hull-detalj, Kalo-dashboard) + Mobbin: Slopes (Mapbox full-bleed + bottom-sheet),
AllTrails (rute på satellitt), FocusFlight (mørkt kart + faner).
**Kanon:** retning C «Presis» · T-tokens (bg #0D0E0D, forest #005840, lime #D1F843) ·
Familjen Grotesk display / Inter UI / mono for måltall · Lucide · norsk bokmål ·
domenefasit `ak-designekspert/references/trackman-dispersion.md`.

## Prinsippet: referansenes STRUKTUR, AK-s SPRÅK

Fra referansene tar vi komposisjonen: kartet er helten (full-bleed), chrome flyter over,
hull-velger-pill nederst, bottom-sheet/side-panel for data. Fra AK tar vi alt visuelt:
nær-svart flater, lime som ÉN accent-jobb per skjerm, mono-tall med enhet+retning,
ærlige tomtilstander. Ingen drone-render, ingen fiktive «AI Tip»-kort (designes først når
innsikts-motoren finnes — ærlighetsregelen).

## De tre vanskeligste beslutningene (med anbefaling)

1. **Full-bleed vs. kart-i-kort.** ANBEFALT: full-bleed. Mobil: kartet fyller alt innhold
   under V2Shell-toppen; chrome flyter (tilbake-knapp, hull-pill, sheet). Desktop: kartet
   fyller innholdskolonnen, høyre-panel 320 px (Golfio-mønsteret) i stedet for bottom-sheet —
   sheet på desktop er en mobil-idé på feil flate.
2. **Ellipse-standard.** ANBEFALT: **80 %-ellipsen (≈1,28σ)** som primær — det er
   DECADE-standarden coachingen bruker for sikte. Punktene vises alltid; 1σ/2σ-ringer
   droppes fra UI (matten beholdes i motoren). Terskel: < 5 slag → kun punkter + forklaring.
3. **Avstandskjede uten slag-data.** ANBEFALT: statiske avstandsmarkører beregnet fra
   geometrien (50/100/150 m fra green langs senterlinjen, GOLFX-stil pills) — ærlig fordi de
   er avledet av ekte CourseHole-GPS. Når spilleren har plottede slag på hullet, byttes
   kjeden til SPILLERENS punkter (Emerald Palm-stil).

## Skjerm 1 · Banekart-oversikt `/portal/baneguide/[baneId]`

Jobben: «velg hull — og se hvor mine data bor på banen» på 5 sekunder.

- **Full-bleed satellitt** over hele banen (dagens CourseMap, polygoner fra map-colors.ts).
- **Flytende topprad** (over kartet, venstre): tilbake-chevron + `Caps` «Baneguide» +
  banenavn i Familjen Grotesk + `MikroMeta` «9 hull · par 34».
- **Hull-markører på kartet:** nummererte prikker (dagens .ak-hole-marker) — hull MED
  slag-data får lime ring; uten data: nøytral. Tap → skjerm 2.
- **Bottom-sheet (mobil) / høyre-panel (desktop):** `Rad`-liste per hull — nummer-sirkel,
  «par 4 · 222 m», trailing `StatusPill` «12 slag» (lime-tone kun når data finnes) eller
  `MikroMeta` «ingen slag». Øverst i panelet: 3 `KpiFlis` — Hull kartlagt · Runder på banen ·
  Slag plottet (ekte tall).
- **Tilstander:** uten geometri → `TomTilstand` map-pin «Banen er ikke kartlagt ennå»;
  uten token → dagens fallback-kort (mørk variant); laster → skeleton-flate i T.panel2.
- Accent-jobben: hull-radene/markørene MED data. Alt annet er nøytralt.

## Skjerm 2 · Hull-detalj `.../hull/[nr]` (signaturskjermen)

Jobben: «hvor lander slagene mine på dette hullet — og hva gjør jeg med det» på 5 sek/30 sek.

- **Full-bleed satellitt for hullet**, rotert så spilleretningen peker OPP (tee nederst,
  green øverst — GOLFX/Emerald Palm; Mapbox `bearing` fra tee→green-vektoren).
- **Avstandskjede:** stiplet senterlinje tee→green; pills per beslutning 3 over
  (mono, «150 m»-stil). Med plottede slag: spillerens kjede — nummererte punkter +
  stiplede segmenter + avstands-pills («222 m» carry per segment der distanser finnes).
- **Dispersjon på kartet:** 80 %-ellipse (lime kant, 8 % fyll) over landingspunktene for
  valgt segment/kølle. Legende nederst til venstre på kartet: prikk + «80 % av slagene».
- **Hull-velger-pill** nederst sentrert (referansenes sterkeste grep): `‹  PAR 4 · HULL 7 · HCP 12  ›`
  — HULL-tallet stort i Familjen Grotesk, chevrons navigerer `?nr=` (samme hull-liste som skjerm 1).
  Dette er skjermens ENE lime-element (aktiv tilstand).
- **Bottom-sheet (mobil) / høyre-panel (desktop):**
  - `PillTabs`: Utslag · Innspill · Putt (URL `?type=`, som i dag).
  - `KpiFlis`-grid (2×2): **Bias «4 m V»** · **Spredning «±9 m»** · **Snitt carry «212 m»** ·
    **N slag «12»**. Bias og spredning ALLTID adskilt; laterale tall ALLTID meter + V/H
    (domenefasit — fortegn alene er designfeil).
  - Innsiktslinje (`InnsiktChip`): regelbasert klartekst fra ekte tall («Du mister mest til
    venstre — 4 m systematisk bias»), KUN når N ≥ 5. Ingen AI-kort før motoren finnes.
  - Kølle-chips: kun køller som HAR data på hullet (`?kolle=`); aldri full køllemeny.
- **Tilstander:** 0 slag → punktfri, «Ingen utslag plottet — plott slag for å se spredningen»
  + CTA til plotting; 1–4 slag → punkter uten ellipse + «N av 5 slag — minst 5 for
  spredningsellipse»; uten geometri → som skjerm 1.

## Skjerm 3 · Plotte-modus `/portal/mal/runder/[id]/plott` (fullskjerm)

Jobben: plotte en hel runde på under 3 minutter, med tommel, ute på banen eller i sofaen.

- **Fullskjerm mørk modus** (tapper-familien): kart + trådkors fast i senter — panorér
  kartet under trådkorset (Slopes-presisjon, bedre enn tommel-tap).
- **Bunn-linje (thumb-zone):** stor lime **«Sett punkt»** (min 56 px) + «Hopp over» ghost +
  «Bruk min posisjon» (crosshair-ikon, geolocation; avslag gir rolig norsk melding).
- **Fremdrift øverst:** mono «HULL 7 · SLAG 2 AV 4» + tynn fremdriftslinje; hull-bytte
  auto-advancer når hullets slag er plottet.
- **Valgfri siktelinje (UpGame-grepet):** før slag 1 per hull: «Sett sikte (valgfritt)» —
  ett ekstra tap som lagrer targetX/Y; ellipsen måles da mot intensjon. Hopp over = mål
  mot green-senter.
- **Slagmarkører:** nummererte, dragbare (dragend = korriger posisjon); aktivt punkt i
  T.up-grønn, lagrede i lime. Kjede-linje stiplet.
- **Tilstander:** runde uten bane-kobling / bane uten geometri → ærlig forklaring + lenke
  til SlagWizard; lagring feiler → toast + punktet forblir «ulagret»-markert (ring).
- SlagWizard får samme kartsteg innebygd (samme komponent, `ShotPlotter`).

## Skjerm 4 · Biblioteket `/portal/baneguide` (finnes — kun justering)

Beholdes som i dag (allerede retning C). Én endring: radene lenkes hele (ekte `<a>`,
cmd-klikkbare — samme regel som stall-kortene fikk) og «Kommer»-pill for baner uten geometri.

## Mobil/desktop-kontrakt

| Flate | Mobil (≤ md) | Desktop (lg+) |
|---|---|---|
| Skjerm 1 | Full-bleed + bottom-sheet (snap 30/70 %) | Kart fyller kolonnen + 320 px høyre-panel |
| Skjerm 2 | Full-bleed + hull-pill + sheet | Samme + panel høyre; hull-pill forblir nederst på kartet |
| Skjerm 3 | Fullskjerm (bygget mobil-først) | Samme layout, sentrert maks-bredde 720 px kart |

Touch-mål ≥ 44 px overalt; BunnNav skjules i plotte-modus (fullskjerm-gruppe, som tapper).

## Craft-regler (gjelder alle fire)

- Kart-chrome: flytende elementer på `color-mix(in srgb, T.bg 72%, transparent)` med blur —
  aldri solide kort som dekker kartet.
- Lime har ÉN jobb per skjerm: skjerm 1 = data-hull, skjerm 2 = hull-pillen, skjerm 3 = «Sett punkt».
- Alle måltall i mono med enhet; laterale alltid «m V»/«m H».
- Kartfargene: `src/lib/baneguide/map-colors.ts` (dokumentert canvas-unntak) — godkjennes samtidig.
- Ingen fabrikerte tall i mockups: mockup-data merkes eksplisitt som eksempeldata i kit-fila.

## Leveranse-rekkefølge

1. **Mockups i Claude Design** (`ui_kits/v2/baneguide-oversikt.jsx`, `baneguide-hull.jsx`,
   `baneguide-plott.jsx`) — mobil + desktop per skjerm → Anders godkjenner/justerer.
2. Bygg C3 (skjerm 1+2 i v2, atomisk flytt+slett av legacy-treet) → C4 (ellipse) → C5 (plotting).
3. Bane-import (C2, ~10 Østfold-baner) kjøres parallelt — uavhengig av design.

## Ikke i denne runden (bevisst)

AI-tips-kort (venter innsikts-motor) · vær/vind-kort (ingen værkilde) · pin-posisjon per
runde (egen modell senere) · coach-skjermene (egen fase) · drone-/3D-visning (uærlig pynt).
