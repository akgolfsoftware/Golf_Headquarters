# 07 — Tilgjengelighet (WCAG 2.1 AA)

Plattformen må være tilgjengelig for skjermlesere, tastatur og brukere med ulike behov.

---

## ARIA

### Icon-only buttons
```tsx
// ❌ BAD
<button><X className="h-4 w-4" /></button>

// ✅ GOOD
<button aria-label="Lukk modal"><X className="h-4 w-4" /></button>
```

### Klikkbare divs (unngå hvis mulig)
```tsx
// ❌ BAD
<div onClick={handleClick}>Trykk</div>

// ✅ BETTER — bruk button
<button onClick={handleClick}>Trykk</button>

// ✅ ALTERNATIVE — div må ha alt
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === "Enter" && handleClick()}
>
  Trykk
</div>
```

### Modaler
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Tittel</h2>
  <p id="modal-description">Beskrivelse</p>
</div>
```

### Form-felter
```tsx
<label htmlFor="email">E-post</label>
<input id="email" type="email" aria-required="true" />

// Med feilmelding
<input
  id="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">Ugyldig e-post</span>
)}
```

### Tabs
```tsx
<div role="tablist" aria-label="Spillerdetaljer">
  <button role="tab" aria-selected={activeTab === "idag"}>I dag</button>
  <button role="tab" aria-selected={activeTab === "plan"}>Plan</button>
</div>

<div role="tabpanel" aria-labelledby="tab-idag">
  {content}
</div>
```

### Toast/Alert
```tsx
<div role="alert" aria-live="polite">
  Lagret.
</div>

// Kritisk
<div role="alert" aria-live="assertive">
  Kunne ikke lagre. Sjekk internett.
</div>
```

### Loading-state
```tsx
<button disabled aria-busy="true" aria-label="Lagrer ...">
  <Loader2 className="animate-spin" />
  Lagrer ...
</button>
```

### Dekorative ikoner
```tsx
<Calendar aria-hidden="true" />  // Brukes med tekst
<Calendar aria-label="Kalender" />  // Alene som indikator
```

---

## Tastatur-navigasjon

### Tab-rekkefølge
- Logisk: top-to-bottom, left-to-right
- Skip-to-content-link øverst på siden
- Modaler: focus-trap (Tab loops innen modal)
- Esc lukker modaler

### Snarveier
| Tastetrykk | Handling |
|---|---|
| `Tab` | Neste fokuserbart element |
| `Shift+Tab` | Forrige fokuserbart |
| `Enter` | Aktiver knapp/lenke |
| `Space` | Toggle checkbox/switch |
| `Esc` | Lukk modal/popover |
| `⌘K` (Ctrl+K) | Åpne global søk |
| `Arrow keys` | Naviger i lister/menus |

### Focus management
```tsx
// Når modal åpner: flytt fokus til første interaktive element
useEffect(() => {
  if (open) {
    firstInputRef.current?.focus();
  }
}, [open]);

// Når modal lukkes: flytt fokus tilbake til trigger
useEffect(() => {
  if (!open) {
    triggerRef.current?.focus();
  }
}, [open]);
```

---

## Heading-hierarki

**Regel:** h1 → h2 → h3 (ingen hopp som h1 → h3)

Per side:
- 1× h1 (side-tittel, ofte i Hero)
- 2-4× h2 (section-headings)
- 5-15× h3 (sub-section-headings)
- h4-h6 sjelden brukt

```tsx
<DetailShell title={<h1>Spiller-detalj</h1>}>
  <section>
    <h2>Statistikk</h2>
    <h3>Strokes Gained</h3>
    <h3>HCP-utvikling</h3>
  </section>
  <section>
    <h2>Coaching-historikk</h2>
    <h3>Siste 5 økter</h3>
  </section>
</DetailShell>
```

---

## Kontrast

**Mål:** WCAG 2.1 AA

| Type | Min-ratio |
|---|---|
| Vanlig tekst | 4.5:1 |
| Stor tekst (18px+) | 3:1 |
| UI-komponenter | 3:1 |
| Decorative | 0 (ingen krav) |

**Sjekk per token-kombinasjon:**
- `foreground` (#0A1F17) på `background` (#FAFAF7) → ~17:1 ✅
- `muted-foreground` (#5E5C57) på `background` → ~6.5:1 ✅
- `primary` (#005840) på `background` → ~8:1 ✅
- `primary-foreground` (#D1F843) på `primary` (#005840) → ~4.8:1 ✅
- `accent` (#D1F843) på `accent-foreground` (#0A1F17) → ~13:1 ✅

Alle tokens passerer AA. Dark mode (når aktivert) er også verifisert.

---

## Form-feilmeldinger

**Hvor:**
- Inline under feltet (ikke kun toast)
- Inline-error har `role="alert"` + `aria-describedby` på inputen

**Tekst:**
- Norsk bokmål
- Konkret (eks: "Minst 8 tegn", ikke "Ugyldig")
- Hjelpsom (eks: "Bruk e-post-format som navn@eksempel.no")

---

## Skip-to-content

På alle layout-shells:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Hopp til hovedinnhold
</a>

<main id="main-content">
  {children}
</main>
```

---

## Screen reader-only tekst

Bruk for kontekstuelle hjelpetekster:
```tsx
<button>
  <X aria-hidden="true" />
  <span className="sr-only">Lukk modal</span>
</button>
```

---

## Tilgjengelighets-spesifikke komponenter

### VisuallyHidden
```tsx
<span className="sr-only">
  {/* synlig for skjermleser, skjult visuelt */}
</span>
```

### LiveRegion
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {liveMessage}
</div>
```

Brukes for dynamiske oppdateringer (eks: "5 nye varsler", "Lagret klokken 14:32").

---

## Berøringsmål (mobile)

**Minimum:** 44×44 CSS pixels (Apple HIG + WCAG)

```tsx
// ❌ for liten
<button className="h-8 w-8"><X /></button>

// ✅ riktig
<button className="h-11 w-11"><X /></button>

// ✅ alternativ — utvidet hit-area med padding
<button className="h-8 w-8 p-0 relative">
  <span className="absolute -inset-2.5" aria-hidden />
  <X />
</button>
```

---

## Fargeblindhet

**Aldri** bruk farge som eneste indikator. Kombiner alltid:

- ❌ Bare rød = feil
- ✅ Rød + ikon (AlertCircle) + tekst ("Feil")

- ❌ Bare grønn dot = aktiv
- ✅ Grønn dot + "Aktiv"-label

---

## Animasjon

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Verifisering

For hver side:
1. **Tab gjennom** alle interaktive elementer — logisk rekkefølge
2. **Screen reader-test** (VoiceOver på macOS, NVDA på Windows)
3. **Lighthouse a11y-score** ≥ 95
4. **axe DevTools** kjør på siden — 0 critical issues
5. **Skift-ikke-museknapp-test** — gjør hele flyten med tastatur

---

## Hjelp-popup ("?")

Spesielle krav:
```tsx
<button
  type="button"
  aria-label="Hva er Strokes Gained?"
  aria-haspopup="dialog"
  aria-expanded={open}
  onClick={openPopup}
>
  <HelpCircle aria-hidden="true" />
</button>

<div role="dialog" aria-modal="false">
  <h3>Strokes Gained (SG)</h3>
  <p>...</p>
  <button aria-label="Lukk forklaring">×</button>
</div>
```

Esc lukker. Klikk utenfor lukker. Tab kommer ut av popup på samme element.
