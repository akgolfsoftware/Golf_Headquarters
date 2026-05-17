# AK Golf HQ — Design System v1.0

> **Hva dette er:** Den eneste implementerbare sannheten for hvordan UI bygges i AK Golf HQ-plattformen. Levert i Refined-formatet (Universal Design System).
> **Sist oppdatert:** 2026-05-17
> **Eier:** Anders Kristiansen
> **Komplementerer:** `docs/design-resources/AK-GOLF-DNA.md` (strategi-laget)

---

## 1. Context og goals

### 1.1 Hva systemet skal løse
AK Golf HQ er foundation-laget for fire produkter: **PlayerHQ** (spiller, mobil-først), **CoachHQ** (admin, desktop-tung), **Foreldreportal** og **Marketing+booking**. Systemet skal: (1) gi visuell koherens på tvers, (2) eliminere AI-slop og shadcn-default, (3) håndheve WCAG 2.2 AA som standard, (4) redusere beslutninger — én korrekt måte for 80 % av tilfellene.

### 1.2 Brukere
| Persona | Kontekst | Implikasjon |
|---|---|---|
| Anders (CEO) | CoachHQ daglig, desktop + mobil | Datatetthet, hurtighet |
| Markus (trener) | CoachHQ mobil under økter | Touch ≥44px, ikke-modal |
| Spillere (10–80 år) | PlayerHQ mobil | Klar hierarki, store knapper |
| Foreldre | Forelderportal sjelden | Selvforklarende |
| GFGK-juniorer | PlayerHQ mobil | Moderne, ikke barnslig |

**Ikke i scope:** print-CSS, animasjonsbibliotek (Framer), i18n, per-klubb-tema.

---

## 2. Design tokens og foundations

### 2.1 Farger (semantiske tokens — ALDRI hex i kode)

Tokens lever i `src/app/globals.css:12-70`. All UI **må** referere via Tailwind-utility (`bg-primary`, `text-foreground`).

| Token | Lyst / Mørkt | Bruk |
|---|---|---|
| `background` | #FAFAF7 / #0F2A22 | Side-bakgrunn |
| `foreground` | #0A1F17 / #F5F4EE | Primær tekst |
| `card` | #FFFFFF / #163027 | Cards, paneler, popovere |
| `primary` | #005840 / #D1F843 | CTA, focus-ring, primær ikon |
| `primary-foreground` | #D1F843 / #0A1F17 | Tekst på `primary` |
| `accent` | #D1F843 / #D1F843 | Highlights, status, "ny" |
| `secondary` | #F1EEE5 / #1B3B30 | Sekundære knapper, chip-bg |
| `muted` | #F1EEE5 / #1B3B30 | Disabled, hover-bg |
| `muted-foreground` | #5E5C57 / #9D9C95 | Sekundær tekst, eyebrows |
| `destructive` | #A32D2D / #D45353 | Slett, feil |
| `border` | #E5E3DD / #2B4F42 | Alle borders |
| `input` | #E0DDD6 / #2B4F42 | Form-input border |
| `ring` | #005840 / #D1F843 | Focus-visible outline |

**Pyramide-farger** (`globals.css:106-117`) — kun trenings-domenet (FYS/TEK/SLAG/SPILL/TURN). Bruk `text-pyr-fys`, `bg-pyr-fys/10`. **Avatar-gradienter** (`globals.css:136-143`) — 8 deterministiske paletter, kun for avatar/gruppe-identitet.

### 2.2 Typografi

Tre fonter, lastet via `next/font/google` i `src/app/layout.tsx`. **Ingen andre fonter må importeres.**

| Bruk | Font | Vekt | Stil | Tailwind |
|---|---|---|---|---|
| Hero h1 (display) | Instrument Serif | 400 | italic | `font-display italic` |
| Section heading | Geist | 600 | regular | `font-semibold` |
| Body | Geist | 400 | regular | (default) |
| Caption / eyebrow | Geist Mono | 500 | uppercase, tracking 0.10em | `font-mono uppercase tracking-[0.10em]` |
| Tabulære tall (KPI) | Geist Mono | 600 | tabular-nums | `font-mono tabular-nums` |

**Type-skala (mobil → desktop):**

| Rolle | Klasse | Eksempel |
|---|---|---|
| display-xl | `text-[28px] sm:text-[40px] md:text-[56px]` | Hero hilsen ("Anders") |
| display-lg | `text-2xl md:text-4xl` | Page hero h1 |
| display-md | `text-xl md:text-3xl` | Seksjons-hero |
| headline | `text-lg md:text-2xl` | Stor card-tittel |
| subhead | `text-base md:text-xl` | Card-tittel |
| body | `text-sm md:text-base` | Standard tekst |
| body-sm | `text-xs md:text-sm` | Sekundær |
| caption | `text-[10px]` | Eyebrows, mono-labels |

**Regler:** Aldri konstant `text-5xl` på hero (bryter mobil). Maks én italic Instrument Serif-tekst per seksjon. Tall i tabeller alltid `font-mono tabular-nums`.

### 2.3 Spacing — 8pt grid (håndheves i kode-review)

Bruk multipler av 4px der grunnenheten er 8. Tillatte Tailwind-utilities:

| Verdi | Klasse | Bruk |
|---|---|---|
| 4px | `p-1`, `gap-1` | Kun ikon + tekst-mellomrom inne i pille |
| 8px | `p-2`, `gap-2` | Inline-elementer |
| 16px | `p-4`, `gap-4` | Card-padding, standard mellomrom |
| 24px | `p-6`, `gap-6` | Card-padding stor, seksjons-spacing |
| 32px | `p-8`, `gap-8` | Layout-padding, hero-spacing |
| 48px | `p-12`, `gap-12` | Mellomstor seksjons-divider |
| 64px | `p-16`, `gap-16` | Hero topp/bunn på desktop |

**Forbudt:** `p-3` (12), `p-5` (20), `p-7` (28), `p-9` (36), `p-11` (44).
**Unntak:** `gap-1.5` (6px) er tillatt for piller (badge-rad).

### 2.4 Border radius

`--radius: 1rem` (16px) i `globals.css:43`. Mapping:

| Klasse | Verdi | Bruk |
|---|---|---|
| `rounded-sm` | 8px | Badges, tags, små inputs |
| `rounded-md` | 12px | Inputs, sekundære knapper |
| `rounded-lg` | 16px | Cards (default), panels |
| `rounded-xl` | 16–20px | Hero-cards |
| `rounded-2xl` | 20–24px | Marketing-hero, feature-cards |
| `rounded-full` | pill | CTA primary, badges status, avatarer |

### 2.5 Skygger

Subtile. `shadow-none` default (cards har border), `shadow-sm` sticky headers/popovere, `shadow-md` card-hover, `shadow-lg` modaler. **Aldri** `shadow-xl`/`2xl`, custom RGBA, eller `drop-shadow` med farge.

### 2.6 Motion

| Bruk | Verdi |
|---|---|
| Standard | `transition-all duration-200` |
| Card hover | `hover:-translate-y-0.5 transition-all duration-200` |
| Modal | `duration-150 ease-out` |
| Reduced motion (påkrevd) | `motion-reduce:transition-none` |

**Forbudt:** transitions > 300ms i UI-chrome, parallax, autoplay-animasjoner.

---

## 3. Component rules

### 3.1 Button

**Anatomy:**
```
<button> ├── [LeadIcon?] ├── Label ├── [TrailIcon?] </button>
```

**Varianter (4 + størrelser):**

| Variant | Klasser | Bruk |
|---|---|---|
| `primary` | `bg-primary text-primary-foreground rounded-full px-5 py-2.5 font-medium` | Hoved-CTA (1 per skjerm) |
| `secondary` | `bg-secondary text-secondary-foreground border border-border rounded-md px-4 py-2` | Sekundær handling |
| `ghost` | `text-foreground hover:bg-muted rounded-md px-3 py-2` | Tertiær, inline |
| `destructive` | `bg-destructive text-destructive-foreground rounded-md px-4 py-2` | Slett, irreversibelt |

**Required states (alle varianter):**
- `default`: som spesifisert
- `hover`: `hover:opacity-90` (primary), `hover:bg-secondary/80` (secondary)
- `focus-visible`: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- `active`: `active:scale-[0.98]` (kun på primary)
- `disabled`: `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`
- `loading`: erstatt label med `<Loader2 className="animate-spin" size={16} />` + behold bredde via `min-w-[Npx]`

**Responsive:** Full bredde under `sm:` på primary CTA i mobile former (`w-full sm:w-auto`).

**Edge cases:**
- Lang label: aldri wrap, `truncate max-w-[200px]` + tooltip
- Ikon-only: aspect-square + `aria-label` påkrevd
- Touch-target: min 44×44px (sikres via `py-2.5` på `text-sm`)

### 3.2 Card

**Anatomy:**
```
<article role="region"> ├── [Header: title + actions]? ├── Content ├── [Footer]? </article>
```

**Varianter:**

| Variant | Klasser |
|---|---|
| `default` | `rounded-lg border border-border bg-card p-6` |
| `interactive` | `+ hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer` |
| `hero` | `rounded-2xl border border-border bg-card p-8 md:p-12` |
| `dashed` (empty) | `rounded-lg border border-dashed border-border bg-card/40 p-8` |

**States:** default, hover (interactive variant), focus-visible (`focus-visible:ring-2 focus-visible:ring-ring`), loading (`<LoadingSkeleton />` overlay).

**Responsive:** Padding skalerer `p-4 md:p-6 lg:p-8`. Grid-layout via parent (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).

**Edge cases:**
- Tomt: bruk `EmptyState`-komponenten i stedet for tom card
- Overflow: `overflow-hidden` + intern scroll med `overflow-y-auto max-h-[400px]`

**Faktisk eksempel:** `src/components/portal/exercise-card.tsx:11` — `rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

### 3.3 Input (text, number, select, textarea)

**Anatomy:**
```
<label> ├── Label-tekst (font-medium text-sm) ├── [Hint?] ├── <input/select/textarea> ├── [ErrorMessage?] </label>
```

**Klasser (alle input-typer):**
```
w-full rounded-md border border-input bg-background px-3 py-2 text-base
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent
disabled:opacity-50 disabled:cursor-not-allowed
aria-invalid:border-destructive aria-invalid:ring-destructive/30
```

**Required states:**
- `default`, `hover` (border darken), `focus-visible` (ring), `disabled`, `error` (via `aria-invalid="true"`)

**Regler:**
- **Alltid** `font-size: 16px` på input (`globals.css:160` — forhindrer iOS Safari zoom)
- Label-binding via `htmlFor` + `id` (aldri kun visuelt)
- Numeriske input: bruk `inputMode="numeric"` + `pattern="[0-9]*"` på mobil
- Required-felt: `<span aria-hidden="true" className="text-destructive">*</span>` etter label

**Responsive:** Full bredde under `sm:`. Form-grid: `grid grid-cols-1 sm:grid-cols-2 gap-4`.

**Edge cases:** Lang error-melding wrapper under input (`text-sm text-destructive mt-1`). Tom select: placeholder med `text-muted-foreground`.

### 3.4 Badge / Pill

**Anatomy:** `<span>` med tekst + optional ikon (size=12, strokeWidth=2).

**Varianter:**

| Variant | Klasser | Bruk |
|---|---|---|
| `default` | `bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em]` | Eyebrow, tag, kategori |
| `success` | `bg-primary/10 text-primary` (resten lik) | Aktiv, fullført |
| `warning` | `bg-pyr-spill/10 text-pyr-spill` | OBS, venter |
| `danger` | `bg-destructive/10 text-destructive` | Feil, kansellert |
| `accent` | `bg-accent text-accent-foreground` | "Ny", highlight |

**States:** default, hover (kun hvis interaktiv → ekstra `hover:opacity-80 cursor-pointer`).

**Regler:**
- Tekst alltid uppercase + mono — gjør status visuelt distinkt fra brødtekst
- Aldri lengre enn 14 tegn — bruk forkortelse
- Maks 3 badges på rad i tabell-celle

**Edge cases:** Lang label: `max-w-[120px] truncate` + tooltip.

### 3.5 PageHeader

Implementert i `src/components/shared/page-header.tsx:32`. Skal brukes på **alle** produksjons-pages.

**Anatomy:**
```
<header role="banner"> ├── <div> │   ├── [eyebrow: span font-mono uppercase]? │   ├── <h1 font-display>: titleLead + <em italic primary>{titleItalic}</em> + titleTrail? │   └── [sub: p text-sm muted-foreground]? └── [actions: div role="group"]? </header>
```

**Props:** `eyebrow?, titleLead?, titleItalic (required), titleTrail?, sub?, actions?`

**States:** Statisk komponent — ingen interaktive states på selve header.

**Responsive:** `flex-col gap-4 sm:flex-row sm:items-end sm:justify-between` — actions wrapper under tittel på mobil.

**Edge cases:** Lang `titleItalic` (>30 tegn): unngå — kortere er bedre. Hvis nødvendig, accept wrap.

### 3.6 EmptyState

Implementert i `src/components/shared/empty-state.tsx:20`. Brukes når liste/seksjon er tom.

**Anatomy:**
```
<div role="status" aria-live="polite"> ├── <div>[Icon size=24 strokeWidth=1.5]</div> ├── <h3 font-display><em italic primary>{titleItalic}</em> {titleTrail}</h3> ├── [sub: p text-sm muted-foreground]? └── [cta]? </div>
```

**Klasser:** `flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-8 py-16 text-center`

**Regler:**
- Ikon alltid Lucide, 24px, stroke 1.5
- Tagline: italic Instrument Serif kort (max 5 ord)
- Sub: max 1 setning (≤80 tegn) — forklar hva som skjer hvis bruker handler
- CTA-knapp: `primary` variant, kort verb ("Legg til økt")

**Edge cases:** Loading: bruk `<LoadingSkeleton />` i stedet (ikke EmptyState).

### 3.7 Table

**Anatomy:**
```
<table> ├── <thead sticky top-0 bg-card border-b border-border> │   └── <tr><th scope="col" font-mono uppercase>...</th></tr> ├── <tbody divide-y divide-border> │   └── <tr hover:bg-muted/40><td>...</td></tr>
```

**Klasser:**
- Wrapper: `overflow-x-auto rounded-lg border border-border bg-card`
- `<table>`: `w-full text-sm`
- `<th>`: `sticky top-0 bg-card px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground`
- `<td>`: `px-4 py-3 text-foreground`
- Numerisk kolonne: `text-right tabular-nums font-mono`

**Required states:**
- Row hover: `hover:bg-muted/40 cursor-pointer` (kun hvis raden klikkbar)
- Row selected: `bg-primary/5 border-l-2 border-l-primary`
- Sortable header: ikon `<ArrowUpDown size={12} />` etter label, `cursor-pointer hover:text-foreground`
- Loading: vis `<LoadingSkeleton rows={5} />` i tbody

**Responsive:**
- Desktop: full tabell
- Mobile (`<sm`): kollapse til card-stack ELLER horizontal scroll med `overflow-x-auto`
- Sticky første kolonne mobil: `sticky left-0 bg-card`

**Edge cases:** Tom: bruk `EmptyState` under tbody-row. Ekstremt lang celle: `max-w-[200px] truncate` + tooltip.

### 3.8 Modal / Dialog

**Anatomy:**
```
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title"> ├── <div className="overlay" /> ├── <div role="document"> │   ├── <header>: title + close-button (X) │   ├── <div>: content │   └── <footer>: cancel + confirm buttons </div>
```

**Klasser:**
- Overlay: `fixed inset-0 bg-black/40 backdrop-blur-sm z-40`
- Dialog: `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl bg-card p-6 shadow-lg`
- Mobile: `inset-x-0 bottom-0 rounded-t-2xl rounded-b-none w-full max-w-none translate-y-0 -translate-x-0 left-0 top-auto` (bottom-sheet)

**Required behavior:**
- **Focus trap** når åpen — fokus settes på første interaktive element
- **Esc** lukker
- Klikk på overlay lukker (kun hvis ikke destruktiv handling)
- Body får `overflow-hidden` mens åpen
- Når lukkes: fokus tilbake til triggeren

**States:** closed, opening (fade in 150ms), open, closing (fade out 100ms).

**Responsive:** Desktop = sentrert. Mobile = bottom-sheet med drag-handle (`<div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />`).

**Edge cases:**
- Form-modaler: submit-knapp disabled til form er gyldig
- Destruktive: bytt confirm-knapp til `destructive`-variant og krev eksplisitt klikk (ikke Enter-tast)
- Stacked modaler: forbudt — flatt UX, finn en annen løsning

---

## 4. Accessibility (WCAG 2.2 AA)

### 4.1 Testbare acceptance criteria

| Krav | Test | Pass-kriterium |
|---|---|---|
| Tekst-kontrast | Lighthouse | ≥ 4.5:1 normal, ≥ 3:1 ≥18px |
| UI-kontrast | manuelt | `border/bg` og `ring/bg` ≥ 3:1 |
| Focus-visible | Tab gjennom side | Synlig `ring-2 ring-ring ring-offset-2` |
| Touch-target | DevTools device | Min 44×44px |
| Keyboard | Test uten mus | Alle handlinger utløsbare, logisk tab-rekkefølge |
| Screen reader | VoiceOver | Ikoner har `aria-label`/`aria-hidden`; bilder har `alt` |
| Reduced motion | macOS Reduce Motion | `motion-reduce:transition-none` respekteres |
| Form labels | aXe | Hver input bundet via `htmlFor` |
| Heading-hierarki | aXe | Ingen hopp (h1 → h3) |
| Skip to content | Tab fra topp | Første tab-stop = "Hopp til hovedinnhold" |
| Live regions | manuelt | Toasts har `role="status" aria-live="polite"` |
| Modal focus trap | Tab inne i modal | Fokus sirkulerer innenfor modal |

### 4.2 Keyboard-mapping (standard)

| Tast | Handling |
|---|---|
| Tab / Shift+Tab | Naviger fremover/bakover |
| Enter | Aktiver knapp / lenke, send form |
| Space | Aktiver knapp / toggle checkbox |
| Esc | Lukk modal / popover / dropdown |
| Arrow up/down | Naviger i lister, select, menu |
| `/` | Åpne global søk (CoachHQ) |

### 4.3 ARIA-konvensjoner

- Knapper med kun ikon → `aria-label="Beskrivelse"`
- Dekorative ikoner → `aria-hidden="true"`
- Loading-spinner → `<Loader2 aria-label="Laster" />`
- Tomme states → `role="status" aria-live="polite"`
- Tabs → `role="tablist"` + `role="tab"` + `aria-selected`
- Tooltip → `aria-describedby` peker til tooltip-id

---

## 5. Content og tone

### 5.1 Språk-regler

- **Bokmål** med æ/ø/å — aldri ASCII-fallback
- **Dato:** `13. mai 2026` eller `13.05.26` (aldri amerikansk)
- **Tid:** 24t — `09:30` (aldri AM/PM)
- **Valuta:** `300 kr/mnd`, `1 250 kr` (mellomrom som tusen-skiller)
- **Antall:** mellomrom mellom tall og enhet — `3 økter`
- **Navn:** fornavn på hovedside, fullt navn i formelle kontekster

### 5.2 Stemme — direkte, konkret, ikke entusiastisk

| Do | Don't |
|---|---|
| "Du har 3 økter i dag." | "Hei der! 🎉 Du har 3 spennende økter!" |
| "Lagre" | "Lagre nå!" |
| "Slett spiller" | "Er du sikker? 😢" |
| "Sesjon startet kl 09:30." | "Yes! Sesjonen er i gang 🚀" |
| "Ingen treff." | "Beklager, vi fant dessverre ingenting :(" |
| "Markus mangler treningsplan." | "Oops! Det ser ut til at Markus ikke har en plan." |
| "Booking bekreftet." | "Booking bekreftet! Vi gleder oss til å se deg!" |
| "Fjern fra liste" | "Si farvel til denne!" |
| "Neste økt: 14:00 m/ Anders" | "Klar for neste runde? Anders venter kl 14:00!" |
| "Endring lagret." | "Endringer ble lagret med suksess!" |

### 5.3 Feilmeldinger

Format: **Hva skjedde** + **hva brukeren kan gjøre**.

- ✅ "Kunne ikke lagre. Sjekk nettforbindelsen og prøv igjen."
- ❌ "En feil oppsto. Vennligst prøv igjen senere."

### 5.4 Tom-state-tekst

Format: **kort italic tagline** + **hva som skjer hvis du handler**.

- ✅ titleItalic="Ingen økter ennå" / sub="Legg til første økt for å komme i gang."
- ❌ "Du har ingen økter. Vennligst opprett en ny økt for å begynne din reise."

### 5.5 Suksess-feedback

Subtilt — ingen "feiringer". Toast eller inline grønn check.

- ✅ "Lagret."
- ❌ "Suksess! Endringene dine er nå lagret 🎉"

---

## 6. Anti-patterns (DON'T)

| # | Forbud | Hvorfor | Alternativ |
|---|---|---|---|
| 1 | Hex-farger i kode (`#005840`) | Bryter dark mode + skaleringer | Bruk semantisk token: `bg-primary` |
| 2 | Emojier i UI-tekst (🎉, 😊, ✅) | Bryter premium-tone, dårlig screen-reader | Bruk Lucide-ikon (`<CheckCircle />`) |
| 3 | Flere enn 3 fonter | Bryter typografisk konsistens | Geist, Geist Mono, Instrument Serif — punkt |
| 4 | Annet ikon-bibliotek (Heroicons, Phosphor) | Brytt visuell konsistens | Kun `lucide-react` |
| 5 | Konstant `text-5xl` på hero | Knuser mobil-layout | Responsive: `text-2xl md:text-5xl` |
| 6 | `any` i TypeScript | Skjuler bugs, bryter type-sikkerhet | Definer interface eller bruk `unknown` |
| 7 | Inline-style for farger | Ikke skalerbart, ikke dark-mode-aware | Tailwind-utility + token |
| 8 | `<div onClick={...}>` for klikkbart | Mangler keyboard + a11y | Bruk `<button>` eller `<Link>` |
| 9 | Spacing-verdier `p-3`, `p-5`, `p-7` | Bryter 8pt-grid | Bruk `p-2`, `p-4`, `p-6` |
| 10 | Skygger som `shadow-2xl` | Ser ut som 2018-Material | Border-first design, max `shadow-md` |
| 11 | Amerikansk dato (`5/13/2026`) | Forvirrer norske brukere | `13. mai 2026` eller `13.05.26` |
| 12 | `as unknown as Type` på Prisma-JSON | Skjuler validation-hull | Zod `safeParse` |
| 13 | Float for valuta | Floating-point feil | `Int` i øre — `priceOre / 100` ved render |
| 14 | Animasjoner > 300ms | Føles laggy | Maks `duration-200` på chrome |
| 15 | Stacked modaler | Forvirrende a11y, dårlig UX | Flat ut til steg-flow eller drawer |
| 16 | Tooltip på touch-only | Skjult info på mobil | Vis info inline eller bruk popover |
| 17 | Autoplay video/audio | A11y-katastrofe + bandwidth | Krev klikk |
| 18 | `placeholder` som eneste label | Forsvinner ved input, dårlig SR | Alltid synlig `<label>` |
| 19 | `<img>` uten `alt` | Bryter WCAG | `alt="..."` eller `alt=""` (dekorativt) |
| 20 | Custom focus-outline (`outline-none` uten erstatning) | Knuser keyboard-navigasjon | Bruk `focus-visible:ring-2 ring-ring` |

---

## 7. QA-sjekkliste

### 7.1 Code review-sjekkliste (30 punkter)

**Tokens og styling (5)**
- [ ] Ingen hex-koder i `.tsx`
- [ ] Farger via semantic Tailwind-utility
- [ ] Spacing følger 8pt-grid (ingen `p-3/5/7/9`)
- [ ] Radius via `rounded-{sm,md,lg,xl,2xl,full}`
- [ ] Skygger maks `shadow-md` (unntak: modal `shadow-lg`)

**Typografi (5)**
- [ ] Hero h1 responsive (`text-Xxl md:text-Yxl`)
- [ ] Eyebrow bruker `font-mono uppercase tracking-[0.10em]`
- [ ] Tall i tabeller bruker `font-mono tabular-nums`
- [ ] Italic via `font-display italic` (ikke `<i>`)
- [ ] Ingen `<link>` eller `@import` for fonter

**Komponenter (5)**
- [ ] PageHeader øverst (ikke custom hero)
- [ ] EmptyState for tomme lister
- [ ] Lucide-ikoner med `strokeWidth={1.5}` for dekorative
- [ ] Ingen shadcn-default (`bg-zinc-*`)
- [ ] Card: `rounded-lg border border-border bg-card p-6`

**Tilstander (5)**
- [ ] Focus: `focus-visible:ring-2 ring-ring`
- [ ] Disabled: `opacity-50 cursor-not-allowed`
- [ ] Loading-state vises (skeleton eller spinner)
- [ ] Card hover: `hover:-translate-y-0.5 hover:border-foreground/20`
- [ ] Input error: `aria-invalid="true"`

**A11y (6)**
- [ ] Ikon-only knapper har `aria-label`
- [ ] Dekorative ikoner: `aria-hidden="true"`
- [ ] Inputs har bundet `<label htmlFor>`
- [ ] Modaler: `role="dialog" aria-modal="true" aria-labelledby`
- [ ] Heading-hierarki uten hopp
- [ ] Touch-targets min 44×44px

**Innhold (4)**
- [ ] Norsk bokmål med æøå
- [ ] Norsk datoformat
- [ ] Ingen emojier
- [ ] Feilmeldinger: hva + hva-å-gjøre

### 7.2 Pre-deploy-sjekkliste (10 punkter)

- [ ] `npx tsc --noEmit` — 0 type-feil
- [ ] `npm run build` — fullfører uten warnings
- [ ] `npx prisma validate` + `npx prisma generate`
- [ ] Lighthouse a11y-score ≥ 95 på minst én produksjons-rute
- [ ] aXe DevTools — 0 critical issues
- [ ] Test i Safari (iOS-simulator), Chrome, Firefox
- [ ] Test i 375px (iPhone SE), 768px (iPad), 1280px (laptop)
- [ ] Toggle dark mode — alle skjermer fungerer
- [ ] Test med tastatur kun (ingen mus)
- [ ] Test med VoiceOver / NVDA på minst hovedflyt

### 7.3 Per-skjerm-sjekkliste (15 punkter)

- [ ] PageHeader øverst med eyebrow + titleLead + titleItalic
- [ ] Maks én primary CTA per skjerm
- [ ] Maks én italic Instrument Serif-tekst per seksjon
- [ ] Mobile-layout testet (375px)
- [ ] Tablet-layout testet (768px)
- [ ] Desktop-layout testet (1280px)
- [ ] Tom-state har EmptyState
- [ ] Loading-state har skeleton
- [ ] Feil-state har inline melding
- [ ] Alle interaktive elementer har focus-ring
- [ ] Touch-targets ≥44px på mobil
- [ ] Sticky elementer fungerer ved scroll
- [ ] Bilder har `alt` eller `alt=""` (dekorative)
- [ ] Norsk språk konsistent
- [ ] Dark mode-toggle gir fungerende skjerm

---

## 8. Migration-notes (eksisterende komponenter)

### 8.1 Prioriteringsmatrise

| Prioritet | Område | Brudd | Innsats |
|---|---|---|---|
| P0 | `src/components/sg-hub/*` | Inline-stiler, manglende focus-states | 6 t |
| P1 | `src/components/admin/spillerliste-card.tsx` | Mangler `aria-label` på ikon-buttons | 1 t |
| P2 | `src/components/admin/calendar-week-grid.tsx` | Bør splittes i mindre komponenter | 4 t |
| P3 | `src/components/sg-hub/StrikeHeatmap.tsx` | Audit dark mode-farger | 2 t |

### 8.2 Vanlige migration-mønstre

**Hex → semantisk token:**
```diff
- <div className="bg-[#FFFFFF] text-[#0A1F17] border border-[#E5E3DD]">
+ <div className="bg-card text-card-foreground border border-border">
```

**Tom h2 → PageHeader:**
```diff
- <h2 className="text-2xl font-bold">Spillere</h2>
+ <PageHeader eyebrow="CoachHQ" titleLead="Aktive" titleItalic="spillere" />
```

**Tom liste → EmptyState:**
```diff
- {items.length === 0 && <p>Ingen treff.</p>}
+ {items.length === 0 && (
+   <EmptyState icon={Users} titleItalic="Ingen spillere" sub="Legg til første spiller for å komme i gang." />
+ )}
```

**Custom button → Tailwind-pattern:**
```diff
- <button style={{background: '#005840', color: 'white', padding: 12, borderRadius: 8}}>
+ <button className="rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
```

### 8.3 Hva som IKKE må røres uten beslutning

- `prisma/schema.prisma` — endringer krever migrasjon
- `src/app/globals.css:12-70` (token-blokken) — kun via design-beslutning
- `src/components/shared/page-header.tsx` — felles for alle pages
- `src/components/shared/empty-state.tsx` — felles for alle pages
- Stack-versjoner (Next 16, React 19, Tailwind v4, Prisma 7)

---

**Slutt på guide.** Referer til denne fila + `AK-GOLF-DNA.md` (strategi-laget) i alle design-prompter.
