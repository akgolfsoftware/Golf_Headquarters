# Design-prompt 08 — `/stats/sg-sammenlign/start` onboarding-skjema

> Les `00-master-brief.md`.

**Side:** `akgolf.no/stats/sg-sammenlign/start` — auth-protected wizard
**Bruker:** Akkurat signed-up bruker, første gang i tool-en
**Hovedoppdrag:** Få brukeren gjennom 2 steg på < 60 sekunder uten å føle seg overveldet.

---

## Datakilder

```typescript
// Topp 100 PGA Tour-spillere sortert etter sgTotal:
const REF_SPILLERE: Array<{
  dgPlayerId: number;
  name: string;
  country: string | null;
  sgTotal: number;
  year: number;
}> = [ ... ];

// Bruker:
const user = { name, email };
```

To input-modi:
- **Modus A: "Bruk snittscore"** (default) — vi estimerer SG fra Broadie
  - Felt: snittScore (60-140), antallRunder (1-500)
- **Modus B: "Egne SG-tall"** — bruker har TrackMan/manuelt
  - Felt: sgOtt, sgApp, sgArg, sgPutt (hver -10 til +10)

---

## Designoppdrag

**Filosofi:** Wizard-feel, en ting om gangen. Føles luftig, ikke som et skjema-monster.

### Layout-paradigme: "ettermondag"

Hele siden er én skjerm, ingen scroll på desktop. På mobile kan det scrolles, men hvert steg har clear "fokus"-område.

```
┌────────────────────────────────────────┐
│  ← Tilbake                              │
│                                         │
│            EYEBROW: STEG 1 AV 2         │
│            Velg referansespiller        │
│                                         │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  ◇ Rory McIlroy                  │   │
│  │  Northern Ireland · SG +2.34     │   │
│  │  ▾                               │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ELLER VELG FRA TOPP 100 ↓              │
│                                         │
│                                         │
│       [ Tilbake ]    [ Neste → ]        │
│                                         │
└────────────────────────────────────────┘
```

### 1. Top-bar — diskret breadcrumb

- "← Tilbake til SG-sammenligning" venstre
- Steg-indikator høyre: "1 av 2"

### 2. Steg 1 — Velg referansespiller

Sentral fokus. Brukeren gjør én ting: velg spiller.

**Layout:**
- Eyebrow: "STEG 1 AV 2"
- Headline: "Velg din *referansespiller*"
- Sub: "Topp 100 på PGA Tour etter Strokes Gained. Velg en du er nysgjerrig på."

**Spiller-velger — to varianter:**

**Variant A: Featured + søk**
- Stort spillerkort i sentrum (current selection)
  - Avatar (initial eller foto)
  - Navn (font-display 32px)
  - Land + ranking + SG
- Søke-input under: "Søk etter spiller..."
- Autocomplete med topp 10 hits

**Variant B: Combobox + grid**
- Combobox med autocomplete
- Under: 8-12 quick-pick spillere som kort (de mest populære — Rory, Scottie, Viktor Hovland osv.)
- Klikk på quick-pick → fyller comboboxen + viser "✓ valgt"

**Anbefaling:** Variant B. Bruker ser straks at det er mange valg.

**Navigasjon:**
- "Neste →"-knapp deaktivert til en spiller er valgt
- Tab → fokuserer Neste-knappen
- Enter → submitter

### 3. Steg 2 — Legg inn dine tall

**Layout:**
- Eyebrow: "STEG 2 AV 2"
- Headline: "Legg inn *dine tall*"

**Modi-velger — tab-bar:**

```
[ Bruk snittscore ]  Jeg har egne SG-tall
   ↑ default
```

**Tab "Bruk snittscore" (default):**
- 2 store input-felter horisontalt:
  - **Snittscore (brutto)** — 64px mono input, default "78". Slider under for finjustering (60-140).
  - **Antall runder** — mindre, default 20
- Real-time feedback: "Med 78 i snittscore er du ca HCP 8. Tour-ekvivalent: ca 82 på PGA-bane."

**Tab "Egne SG-tall":**
- 4 felt i 2x2 grid:
  - SG: OTT
  - SG: APP
  - SG: ARG
  - SG: PUTT
- Hvert felt: label + mono input (24px) + lite "?" som åpner tooltip ("Off The Tee — SG på drives")
- Range: -10 til +10
- Default: 0 for alle
- Total under: "SG Total: -1.30" (auto-beregnet)

**Navigasjon:**
- "← Tilbake til steg 1" venstre
- "Se min sammenligning →" høyre (primær, stor)

### 4. Submit-loading-state

Etter klikk på "Se min sammenligning":
- Knapp viser spinner + "Beregner ..."
- Hele siden får liten lime-overlay (subtil progressbar bar øverst som beveger seg)
- Etter ~1.5s redirect til resultatside (det er hyggelig at det tar litt — gir følelse av at noe skjer)

### 5. Help-strøk (alltid synlig)

Liten "?"-knapp nederst-høyre som åpner en sidepanel/modal:

- "Hvor finner jeg mine SG-tall?"
- "Hva er forskjellen mellom OTT og APP?"
- "Hvor presist er estimering-en?"

### 6. Fail-state

Hvis server-action returnerer feil (f.eks. ref-spiller ikke funnet):
- Toast nederst-høyre eller inline alert øverst
- Tekst: "Noe gikk galt. Prøv igjen, eller velg en annen spiller."
- Lenke: "Rapportér feil" (mailto)

---

## Mobile-tilpasning

- Quick-pick grid blir 2x3 (6 spillere)
- Snittscore-input + antall-runder stables vertikalt
- 2x2 SG-grid blir 4 stablede felter
- Help-panel blir bottom-sheet i stedet for side-panel

## Mikrointeraksjoner

- Spiller-velger: når en spiller velges, kortet får lime-glow og scale 1.02 (300ms)
- Snittscore-slider: mens du drar, viser instant HCP-beregning + Tour-ekvivalent
- Tab-bytte: smooth color transition (200ms)
- Submit-knapp: pil flytter 4px høyre på hover

---

## Inspirasjon

1. **stripe.com/onboarding** — wizard med tydelige steg, mye luft
2. **typeform.com** — én ting om gangen, fokusert
3. **linear.app/create-issue-modal** — keyboard-vennlig, lett combobox

## Output

- Komplett 2-stegs flyt (sketch)
- Spiller-velger i 2 varianter (A + B) — vi bestemmer hvilken etter sketch
- Modi-tab i isolasjon
- Mobile-flow
