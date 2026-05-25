# 06 — Interactions & Animations

Alle animasjoner og micro-interactions med eksakt timing.

---

## Duration tokens

| Token | ms | Bruk |
|---|---|---|
| `duration-instant` | 0 | Layout-shifts (ingen anim) |
| `duration-fast` | 120 | Hover, focus |
| `duration-base` | 220 | Default (modaler, slides) |
| `duration-medium` | 280 | Bottom-sheets (mobile) |
| `duration-slow` | 400 | Hero-overganger |

## Easing

| Token | Curve | Bruk |
|---|---|---|
| `ease-out` | cubic-bezier(0, 0, 0.2, 1) | Default (90% av animasjoner) |
| `ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Tab-bytte, kontinuerlig |
| `ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Subtle bounce (CTAer) |

---

## Modal-animasjoner

### Modal åpne (desktop)
```css
animation: modalOpen 220ms ease-out forwards;

@keyframes modalOpen {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Backdrop */
animation: fadeIn 200ms ease-out forwards;
```

### Modal lukke
```css
animation: modalClose 180ms ease-in forwards;
```

### Bottom-sheet (mobile)
```css
animation: sheetSlideUp 280ms ease-out forwards;

@keyframes sheetSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

---

## Slide-in panels

### Drill-detail-panel (480px høyre side)
```css
animation: slideInRight 220ms ease-out forwards;

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### Sidebar (mobile)
```css
animation: slideInLeft 220ms ease-out forwards;
```

---

## Card-interaksjoner

### Hover på interactive card
```css
.card-interactive {
  transition: transform 160ms ease-out, box-shadow 160ms ease-out, border-color 160ms ease-out;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--ring);
}
```

### Hub-card lift (Pyramide-inspirert)
```css
.hub-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -8px rgba(10, 31, 23, 0.10);
  border-color: hsl(var(--primary) / 0.4);
}
```

---

## Live-indikatorer

### Pulserende dot ("NÅ"-marker)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.pulse-dot {
  animation: pulse 1.5s ease-in-out infinite;
}
```

### Live-økt indicator
```css
@keyframes liveIndicator {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--success) / 0.4); }
  50% { box-shadow: 0 0 0 8px hsl(var(--success) / 0); }
}

.live-indicator {
  animation: liveIndicator 2s ease-out infinite;
}
```

---

## Toast-animasjoner

### Toast appear (top-right)
```css
animation: toastSlideIn 300ms ease-out forwards;

@keyframes toastSlideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

### Toast dismiss (auto etter 4s)
```css
animation: toastSlideOut 300ms ease-in forwards;
animation-delay: 4s;
```

---

## Tab-bytte

```css
.tab-content-enter {
  opacity: 0;
  transform: translateX(10px);
}

.tab-content-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
```

---

## Wizard-steg-overgang

```css
.wizard-step-enter {
  opacity: 0;
  transform: translateX(50px);
}

.wizard-step-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 220ms ease-out, transform 220ms ease-out;
}
```

---

## Skeleton shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
```

---

## Hjelp-popup ("?")

### Åpne
```css
animation: helpPopupOpen 200ms ease-out forwards;

@keyframes helpPopupOpen {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
```

---

## Button-interaksjoner

### Primary button (hover)
```css
.btn-primary {
  transition: filter 120ms ease-out, transform 120ms ease-out;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### Loading-state
- Disable + opacity-70
- Skift ut tekst med spinner (Lucide Loader2 + rotate animation)

---

## Page transitions

**INGEN page-transitions.** Direkte navigering. Føles tregt med transitions.

Unntak:
- Tabs (på samme side) → 150ms fade
- Wizard-steg → 220ms slide-x
- Modal/sheet → 220-280ms

---

## Touch-interaksjoner (mobile)

### Tap-feedback
```css
.tappable:active {
  transform: scale(0.97);
  transition: transform 80ms ease-out;
}
```

### Swipe-to-dismiss (modaler, toasts)
- Vertikal drag > 100px = lukk
- Med spring-back animasjon ved release

---

## Focus-indikatorer

### Keyboard focus
```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
}
```

**Aldri** `outline: none` uten erstatning.

---

## Scroll-indikatorer

### Smooth scrolling
```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

### Sticky scroll-shadow (på topbars)
```css
.topbar.scrolled {
  box-shadow: 0 1px 3px rgba(10, 31, 23, 0.05);
  border-bottom-color: hsl(var(--border));
}
```

---

## Reduced motion (a11y)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Respekter alltid brukerens motion-preferanser.

---

## Overordnede regler

1. **Ingen overdrevne animasjoner.** Premium-stil = subtilt.
2. **Aldri vis lasting under 200ms.** Ingen spinner trengs.
3. **Loading > 200ms:** vis skeleton, ikke spinner.
4. **Loading > 2s:** vis spesifikk loading-melding (eks: "Genererer plan ...")
5. **Hover-effekter kun på desktop.** Mobile bruker `:active`.
6. **All motion må respektere `prefers-reduced-motion`.**
