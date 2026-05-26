# Design-prompt 17 — `/stats/quiz` — Golf-statistikk-quiz (viralitet)

> Les `00-master-brief.md`.

**Side:** `akgolf.no/stats/quiz` — interaktiv 5-10 spørsmåls-quiz
**Bruker:** Den nysgjerrige besøkende. Folk som vil teste seg selv. Delere.
**Hovedoppdrag:** Maksimal viralitet. Lavt friksjon, høyt morsomhetsnivå. Skap "hadde du gjettet det?"-øyeblikk.

---

## Datakilder

Statiske quiz-spørsmål (10-15 spørsmål, vi roterer):

```typescript
const QUIZ_SPORSMAL = [
  {
    sporsmaal: "Hvor stor andel av 3-meters putter synker PGA Tour-snittet?",
    valg: [
      { tekst: "65%", korrekt: false },
      { tekst: "82%", korrekt: true },
      { tekst: "94%", korrekt: false },
      { tekst: "75%", korrekt: false },
    ],
    forklaring: "Faktisk 82% — selv proffer bommer 1 av 5 fra 3 meter. Amatører tror tallet er høyere.",
    kilde: "PGA Tour 2024",
  },
  {
    sporsmaal: "Hvor langt driver gjennomsnittlig PGA Tour-spiller?",
    valg: [
      { tekst: "285 yds", korrekt: false },
      { tekst: "295 yds", korrekt: true },
      { tekst: "320 yds", korrekt: false },
      { tekst: "310 yds", korrekt: false },
    ],
    forklaring: "295 yards i snitt. Bryson DeChambeau og Cameron Champ ligger over 320.",
  },
  // ... osv
];

// Etter quiz, resultat:
const RESULTAT = {
  riktige: 7,        // 0-10
  totalt: 10,
  tid: 145,           // sekunder
  perKategori: { OTT: 3/3, APP: 2/3, ARG: 1/2, PUTT: 1/2 },
};
```

---

## Designoppdrag

**Filosofi:** Buzzfeed-style quiz med editorial AK Golf-vri. Hver skjerm er fokusert, animasjoner er belønningsbasert.

### 1. INTRO-SKJERM

```
GOLF-STATISTIKK QUIZ

Hvor mye vet du om proffene?

10 spørsmål · 3 minutter · Del resultatet

         [ START QUIZ → ]
```

- Eyebrow: "AK GOLF STATS · QUIZ"
- Stor headline (font-display, 60px, italic på "vet du")
- Sub-info i mono caps
- Liten illustrasjon: 4 mini-circles med "?", "✓", "?", "?" (representerer quiz-progresjon)
- Stor primær CTA

### 2. SPØRSMÅL-SKJERM (10 stk)

```
SPØRSMÅL 3 AV 10                          ⏱ 2:15

Hvor stor andel av 3-meters putter
synker PGA Tour-snittet?

    ┌─────────┐  ┌─────────┐
    │   65%   │  │   82%   │
    └─────────┘  └─────────┘
    ┌─────────┐  ┌─────────┐
    │   94%   │  │   75%   │
    └─────────┘  └─────────┘
```

- Topp-bar: progress (3/10) + tid
- Spørsmål: stor (font-display, 36px)
- 4 valg som store kort i 2x2 grid
- Hover: kort lifter + lime border
- Klikk: instant feedback (riktig = lime fill, feil = subtle red glow + viser riktig svar)

### 3. SVAR-FEEDBACK

Etter klikk på et svar:

```
✓ RIKTIG          (eller ✗ FEIL — riktig var 82%)

         82%

Selv proffer bommer 1 av 5 fra 3 meter. 
Amatører tror tallet er høyere.

PGA Tour 2024 · Broadie-data

         [ NESTE → ]
```

- Stor visuell feedback (lime checkmark eller red X)
- Stor mono prosent
- 2-linjes forklaring (editorial, ikke teknisk)
- Kilde i mono caps
- Auto-next etter 4 sekunder, ELLER klikk "Neste"

### 4. AVSLUTTNINGS-SKJERM

```
RESULTAT

Du fikk

7 / 10

Du er bedre enn 78% av nordmenn som har tatt
denne quizen.

PER KATEGORI:
  Drive: ●●● 3/3
  Approach: ●●○ 2/3
  Kort spill: ●○ 1/2
  Putting: ●○ 1/2

         [ Del resultatet → ]
         [ Prøv en venn ]
```

- BIG resultat (font-display, 120px)
- Sub: percentile-info
- Per-kategori breakdown med visuelle prikker
- 2 CTAer:
  - "Del" (åpner social media share-modal)
  - "Prøv en venn" (gir lenke å sende)

### 5. DELE-MODAL

```
DEL RESULTATET

📋 Kopier lenke      🔗
Get a friend to take the quiz, see their score.

📱 Twitter / X
"Jeg fikk 7/10 på AK Golf-statistikk-quizen. Klarer du å slå meg?
akgolf.no/stats/quiz/r/abc123"

📷 Instagram Stories
[Last ned 9:16 bilde med ditt resultat]
```

OG-bilde generert dynamisk: forest bakgrunn + BIG "7/10" + "Anders fikk 78% riktig" + AK Golf-logo.

### 6. UNDER RESULTATET — sterk mersalg

```
LIKER DU STATS? FØLG DINE EGNE.

PlayerHQ regner ut din egen SG automatisk. 
Da kan du ta quiz-en om DEG SELV.

         [ Prøv PlayerHQ gratis → ]
```

### 7. RELATERTE — andre quiz-typer

Footer-strip:
- "Prøv: Norske spillere-quiz" (kommer snart-link)
- "Prøv: Banehistorie-quiz"
- "Tilbake til stats hub →"

---

## Mobile-tilpasning

- Quiz er nesten identisk på mobile (designet er allerede portrait-friendly)
- 2x2 grid blir 2x2 (eller 1x4 hvis valg-tekstene er lange)
- Avslutning-skjerm: per-kategori-prikker stables

## Mikrointeraksjoner

- Velge-kort: hover lift 4px + lime border-glow
- Etter klikk: instant fill-animasjon (300ms) på valgte kort
- Riktig svar: lime check fader in + subtil "ding"-lyd (off by default)
- Feil svar: kort vibrasjon + viser riktig svar fader in
- Resultat-tall: count-up fra 0 til faktisk tall (1.2s)
- Per-kategori-prikker: fader in stagger 100ms

---

## Inspirasjon

1. **Buzzfeed quiz format** — chunked, en ting om gangen, delbart resultat
2. **Sporcle** — sport-specific quiz med stat-fokus
3. **Spotify-stil resultat-skjerm** — visuelt delbart, viralitet-fokus

## Output

- Intro-skjerm
- Spørsmål-skjerm (med variation for 4-svar vs 2-svar)
- Svar-feedback-skjerm (riktig vs feil)
- Resultat-skjerm
- Dele-modal
- OpenGraph-bilde-pattern
- Mobile-flow

---

## Implementasjon-notater

- Quiz lagret som JSON i `src/data/quiz-questions.json`
- Roteres månedlig (forskjellige spørsmål-sett)
- Resultat lagres NULL bak innlogging — anonymt, bare delbart via URL
- Hvis bruker logger inn: kobl resultat til konto → vises på `/stats/min-progresjon`
