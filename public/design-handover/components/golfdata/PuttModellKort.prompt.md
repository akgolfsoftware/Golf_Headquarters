# PuttModellKort

Innslagsprosent per PUTT-bånd mot Team Norway IUP-baseline. Putting **alltid i fot (ft)**. Hvert bånd: avstand → make-% (bar) → avvik i prosentpoeng (pp) mot baseline.

## Bruk
```jsx
<PuttModellKort baseline="Team Norway IUP" band={[
  { band: "0–3 ft",   pct: 98, baseline: 99 },
  { band: "3–6 ft",   pct: 74, baseline: 82 },
  { band: "6–10 ft",  pct: 41, baseline: 48 },
  { band: "10–20 ft", pct: 18, baseline: 20 },
]} />
```

## Domenefasit
Bånd ALLTID i fot. Avvik i prosentpoeng («+6 pp» / «−8 pp») via `DeltaIndikator`. Mot navngitt baseline (IUP). Tomt = onboarding.
