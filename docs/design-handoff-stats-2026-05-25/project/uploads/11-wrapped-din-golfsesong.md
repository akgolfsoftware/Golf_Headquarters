# Design-prompt 11 — `/stats/wrapped/[slug]` — Din golfsesong (Spotify Wrapped-stil)

> Les `00-master-brief.md`.

**Side:** Årlig "Din golfsesong 2026"-rapport, generert per spiller, **mest delbare element vi har**
**Bruker:** Spilleren selv (mottar lenken via e-post/SoMe) og delere
**Hovedoppdrag:** Bygge viralitet og merkevarekjennelse. Hver delt lenke = gratis annonsering. Mål: 5 000+ delinger per sesong.

---

## Datakilder

Per spiller (`PublicPlayer` slug), beregn:

```typescript
const WRAPPED = {
  spiller: { navn, fodselsAr, klubb, slug, tier },
  sesong: 2026,

  // Hovedtall
  antallTurneringer: 14,
  totalRunder: 41,
  snittScore: 73.2,
  besteRunde: { score: 65, turnering: "Srixon Tour 5 — Bærum GK", dato },
  besteTopp10: 3,                // antall topp-10-finishes
  forbedringFraIfjor: -2.4,      // negativ = forbedret

  // Engasjements-tall
  klubberSpilt: ["Bærum GK", "Oslo GK", "GFGK", ...],   // unike klubber
  lengsteRundeStreak: 8,         // dager med runde

  // Vinnerrunden (fun fact)
  beste3PuttUnnga: "8 av 41 runder uten 3-putt",

  // Kontekst
  rankingINasjon: 47,            // av alle norske med data
  rankingIAldersgruppe: 12,      // av jevnaldrende

  // Sammenligning
  ligneSpiller: "Tilsvarer Kris Ventura i 2018", // hentet fra historisk DB

  // Delbarhet
  delLenke: "https://akgolf.no/stats/wrapped/anders-kristiansen-1985",
};
```

---

## Designoppdrag

**Filosofi:** Spotify Wrapped + Strava Year in Sport. Slide-baserte sider, en wow-fakta per skjerm. Designet for å oppleves vertikalt (mobile-first), men også fungere på desktop.

### Layout-paradigme: SLIDES, ikke seksjoner

Hele opplevelsen er en serie "slides" (à la Instagram Stories) som spiller automatisk eller bla med pil-tastatur/swipe.

**Slide-flyt (10 slides):**

```
0. INTRO — "Din golfsesong 2026, [Navn]"
1. RUNDER — "Du spilte 41 runder"
2. SNITT — "Med en snittscore på 73.2"
3. BESTE — "Beste runde: 65 på Bærum GK"
4. KLUBBER — "Du spilte på 8 forskjellige baner"
5. UTVIKLING — "Du forbedret deg 2.4 strokes fra i fjor"
6. STREAK — "Lengste streak: 8 dager på rad med runde"
7. RANKING — "Topp 47 av 1 547 norske spillere"
8. SAMMENLIGNING — "Spillingen din ligner Kris Ventura i 2018"
9. AVSLUTTNING — "Klar for 2027?" + CTA
```

### Detaljert design per slide

**Generelt:** Hver slide er fullscreen (eller full-bredde min-h-screen card på desktop), forest eller lime bakgrunn, BIG mono tall + 1-linjes editorial tekst.

**SLIDE 0 — INTRO**
- Bakgrunn: lyseforest gradient
- Logo i topp (subtil)
- Eyebrow: "DIN GOLFSESONG"
- BIG year: "2026" (font-display, 200px, italic lime)
- Spiller-navn under (font-display, 48px)
- "Klikk for å starte →"

**SLIDE 1 — RUNDER**
- BIG number: "41"
- Sub: "Du spilte 41 runder i 2026"
- Liten kontekst-fakta: "Det er 8 flere enn i fjor. Norske amatører spiller 28 i snitt."

**SLIDE 2 — SNITT**
- BIG: "73.2"
- Sub: "Sesongsnitt — brutto"
- Kontekst: "Det tilsvarer HCP 9.5. Norge-snittet for menn er HCP 18."

**SLIDE 3 — BESTE RUNDE**
- Lite "Beste runde"-card med:
  - Dato i mono caps
  - Turnering-navn
  - BIG MONO score
  - "-7"-badge for to-par
- "Du hadde 28 putter den runden — Tour-snitt er 28.5 ✨"

**SLIDE 4 — KLUBBER**
- Liste-grid med 8 klubblogo-placeholder eller bare navn
- Kart-visualisering: Norge med pinner på besøkte klubber (subtil)
- "Du var på 8 baner. Mest spilte: Bærum GK (12 runder)."

**SLIDE 5 — UTVIKLING**
- BIG: "−2.4"
- Sub: "Strokes forbedring fra 2025"
- Mini-graf: snittscore over de siste 3 år
- "Det er bedre enn 78% av spillerne i din aldersgruppe."

**SLIDE 6 — STREAK**
- BIG: "8 dager"
- Sub: "Lengste runde-streak"
- Liten 14-dagers kalender-grafikk som highlightere streaken
- "I løpet av sommer-finalsen — turneringer rygg-i-rygg."

**SLIDE 7 — RANKING**
- BIG: "Topp 47"
- Sub: "av 1 547 norske spillere"
- Mindre: "#12 av 142 i din aldersgruppe (1985-årgang)"

**SLIDE 8 — SAMMENLIGNING**
- Bilde/initial av ligne-spilleren
- "Spillingen din ligner Kris Ventura i 2018"
- Sub-context: 1-2 setninger om hvorfor (snittscore, alder, turneringsvolum)
- Hvis vi vil være kreative: "Kris ble pro 2 år etter dette. Din neste sesong er kritisk."

**SLIDE 9 — AVSLUTTNING + CTA**
- "Klar for 2027?"
- 3 valg som store knapper:
  - "Del på X / Instagram" (primær)
  - "Prøv PlayerHQ — logg hver runde"
  - "Se hele profilen min"
- Diskret footer: "Generert {dato}"

### Delbarhet — OpenGraph + Instagram Stories

KRITISK at hver slide kan eksporteres som 9:16 bilde for Instagram Stories.

- Generere via `next/og` — én slide per `/api/og/wrapped/[slug]/[slide]`-route
- Hver slide-bilde har:
  - Forest/lime bakgrunn (varierer)
  - BIG tall
  - Spillernavn nederst
  - AK Golf-logo nederst-høyre
  - URL-tag: "akgolf.no/stats/wrapped"

### Navigasjon

- Topp-bar progress (dots eller bars som Stories)
- Pil venstre/høyre på desktop
- Swipe på mobile
- Auto-play (3 sek per slide) som default, med pause-knapp
- "Pause"-knapp øverst-høyre
- "Hopp til slutten"-link

### Audio (optional stretch)

- Hver slide har subtil bakgrunns-lyd (golf-claps, ambient course-lyd)
- Mute-toggle øverst-høyre
- Default: av (krever klikk for å aktivere)

---

## Mobile-tilpasning

Mobile er HOVEDDISPLAY for denne siden. Designe primært for portrait 9:16.

- Hver slide tar full skjerm
- Swipe horisontalt for å bla
- Hold for å pause autoplay
- Stor "Del"-knapp nederst som flyter
- Tap-zone for å gå forover (høyre halvdel) og bakover (venstre halvdel)

## Mikrointeraksjoner

- Slide-transition: fade + slide-up (300ms)
- BIG numbers: count-up animation (800ms) ved slide-enter
- Lime accent: subtil pulse på key elements
- Klubb-grid: hver klubb fader inn med stagger 100ms

---

## Inspirasjon

1. **Spotify Wrapped** — slide-paradigme, BIG numbers, fargede bakgrunner per slide
2. **Strava Year in Sport** — sport-spesifikk, "din historie"
3. **Apple Activity Year in Review** — minimal, fokus på 1 stat per skjerm
4. **Wrapped.spotify.com 2024** — viralt design med delbare snippets

## Output

- Komplett 10-slide sketch (alle slides)
- Mobile-portrait som hovedformat
- Desktop-fallback (full-width card)
- Instagram Stories-eksport-bilde (1 eksempel)
- Mikrointeraksjons-storyboard

---

## Implementasjon-notater

- Genereres on-demand: når brukeren første gang besøker `/stats/wrapped/[slug]`, beregner vi alle tall server-side og cacher (revalidate: 86400 = 24t)
- Tilgjengelig 31. desember hvert år, sendes ut via e-post til alle som er i databasen
- For spillere som ikke vil ha den: opt-out via mailto

## Stretch — interaktiv Q&A

Etter slide 3, før slide 4: "Gjettlek — hva tror du beste runden var?" med 3 valg. Spilleren får quiz-feeling.
