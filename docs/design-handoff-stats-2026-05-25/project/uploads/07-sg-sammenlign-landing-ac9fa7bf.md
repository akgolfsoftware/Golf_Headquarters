# Design-prompt 07 — `/stats/sg-sammenlign` SG-sammenligning landing

> Les `00-master-brief.md`.

**Side:** `akgolf.no/stats/sg-sammenlign` — den mest "selgende" siden, drives signup
**Bruker:** Spillere som har hørt om Strokes Gained men ikke helt forstår, eller som vil leke med tall
**Hovedoppdrag:** På 8 sekunder skal brukeren tenke "OK, dette må jeg prøve." Hovedmål: konvertering til signup.

---

## Datakilder

Statisk innhold + 1 dynamisk: er bruker innlogget?

```typescript
const erInnlogget: boolean;
// Conditional CTA: "Start" vs "Lag konto"
```

---

## Designoppdrag

Dette er den **mest spektakulære** siden i hele Stats-produktet. Den må demonstrere verdi visuelt før brukeren leser ett ord.

### 1. Hero — kraftig emotionell hook

**Headline-strategi:** Spørsmål brukeren ikke kan unngå.

```
Sammenligna deg med
Rory McIlroy.
```

- Hver av de to linjene er BIG (Inter Tight, 80-100px på desktop)
- "Rory McIlroy" i italic + lime (eller alternativ proff hvis vi vil rotere på pageload — Scottie Scheffler, Viktor Hovland, etc.)
- Eyebrow over: mono caps lime "SG-SAMMENLIGNING"
- Sub: 2 setninger som setter konteksten
- 2 CTA-er:
  - "Start gratis sammenligning →" (primær, stor)
  - "Logg inn" (sekundær, mindre)
- Footnote: "Krever gratis konto · Ingen kredittkort · 60 sek"

**Visuell:** Bakgrunns-elementet er en **forhåndsgenerert radar-grafikk** som "dummy"-eksempel — viser en bruker (forest) vs Rory (lime stiplet) i radar-form. Animert subtilt på pageload (4 punkter trekker seg utover fra senter).

### 2. "Slik fungerer det" — 3-stegs visuell forklaring

Etter hero, før konvertering. Kritisk for å bygge tillit.

```
01 ─────────── 02 ─────────── 03
Velg          Legg inn       Få analyse
referanse     SG-tall        + estimat
```

- 3 horisontale kort
- Mono nummer i lime
- Lucide-ikon (Trophy, Target, Sparkles)
- Tittel (font-display)
- 2-linjers tekst
- **Mikro-skisse** i hvert kort som viser hva som skjer:
  - Steg 01: Lite spillervalg-dropdown med 3 navn
  - Steg 02: 4 sliders med tall
  - Steg 03: Mini-radar med 2 polygoner overlapping
- Connector-strek mellom kortene (horisontal lime-streket linje)

### 3. "Hva du kan finne ut" — visuelle eksempler

Ny editorial-seksjon — vi viser eksempler på output, ikke bare forklarer.

3-4 fiktive cases som visualiseres:

**Case A: "Du er på HCP 12"**
- Min header: "Eksempel — bruker på HCP 12"
- Liten radar (200x200) med dummy-data
- Tekst-block: "Ditt største gap er innspill (-1.8). Putting er overraskende sterk (-0.4). Du er ca P30 på PGA Tour."

**Case B: "Du er scratch"**
- Tekst-block: "Du taper kun 2 strokes mot Tour-snittet — alle 4 områder er nær Tour-nivå. Største gap er drive distance (-0.6)."

**Case C: "Du er HCP 25"**
- "Du er på et tidlig nivå — størst gap er ARG (-2.1). Et fokus her gir raskest forbedring."

Hver case i sin egen card. Layout: 2-kolonne på desktop, stack på mobile.

### 4. "Hva er Strokes Gained?" — undervisende seksjon

Spillere som ikke kjenner SG må forstå før de prøver.

- Eyebrow: "INTRO"
- Headline: "Hva er *Strokes Gained*?"
- 4 mini-kort på en rad, hver med:
  - Stor SG-tag som heading: "SG: OTT", "SG: APP", "SG: ARG", "SG: PUTT"
  - 1-linjes forklaring
  - Lite Lucide-ikon
- Under: Editorial-text om Broadie + at PGA Tour-snittet er definert som 0

Layout: Cards har varm-secondary bakgrunn. Litt mindre fremtredende enn hero, men leselig.

### 5. "Trust signals" — social proof

Liten strøk under "Hva er SG":

- "Bygger på Mark Broadie-forskning ("Every Shot Counts", 2014)"
- "Data fra PGA Tour ShotLink-statistikk"
- "Brukt av AK Golf Academy-coacher"
- 3 logoer eller liten footer-block

### 6. Mersalg #1 — etter forklaringen

Forest-bakgrunn. Tema: "Når du har forstått SG, vil du logge dine egne."

- Headline: "Når du ser *gapet*, vil du lukke det."
- Tekst: "PlayerHQ regner ut din egen SG automatisk hver gang du logger en runde. Se trend over tid, få AI-coach-tips for å lukke svakhetene."
- CTA: "Prøv PlayerHQ gratis"

### 7. FAQ — kort men nyttig

Kort accordion eller bare statisk tekst. 4-5 spørsmål:

- "Trenger jeg å ha egen SG-data?"  → "Nei, vi estimerer fra snittscoren din om du ikke har."
- "Hvor presist er estimat-en?"  → "Det er en grov pekepinn basert på Broadie-data. Ikke eksakt, men nyttig for nivå-sammenligning."
- "Krever det innlogging?"  → "Ja, gratis konto. Ingen kredittkort. Tar 60 sekunder."
- "Hva skjer med dataen min?"  → "Vi lagrer den knyttet til kontoen din. Du kan slette når som helst."

### 8. Stor CTA i bunn

Forest-bakgrunn (omslutter "klar?"-momentet).

- Headline: "Det tar *60 sekunder*."
- Sub: "Gratis konto. Vi sender ingen spam. Etterpå kan du oppgradere til PlayerHQ for å logge runder."
- BIG CTA: "Lag gratis konto →"
- Liten sosial proof: "300+ har allerede prøvd"

---

## Mobile-tilpasning

- Hero: navn-linje 2 linjer i stedet for 1 (mindre font 56px)
- Bakgrunns-radar: blir mindre, eller skjules på mobile
- 3-stegs forklaring: stables, connector-strek blir vertikal
- Cases: stables til 1-kolonne
- SG-mini-kort: 2x2 grid

## Mikrointeraksjoner

- Bakgrunns-radar: subtil pulsering (lime-prikker vises og forsvinner i loop)
- Hero CTA: pil flytter seg 6px høyre på hover + lime-shadow vises
- 3-stegs-mikro-skisser: animeres i når i view (slider beveger seg, radar tegner)
- "Hva er SG?"-kort: hover gir liten scale + lime icon-color-shift

---

## Inspirasjon

1. **stripe.com/products/checkout** — visuelt demoer av produktet før konvertering
2. **linear.app/method** — illustrert "slik fungerer det" med micro-skisser
3. **trackmangolf.com/get-started** — golf-spesifikk konvertering, bruker SG-språket

## Output

- Komplett page-sketch
- Hero i isolasjon (3 varianter med ulike proffer)
- 3-stegs-mikro-skisser i detalj
- 3 case-cards
- Komplett mobile flow
