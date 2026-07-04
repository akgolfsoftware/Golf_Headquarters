# NesteFokusKort

Dommen, ikke grafen. Peker ut største SG-lekkasje og anbefalt treningsområde i klarspråk — komponenten som selger abonnementet. Verdikt = helten (display-font, øverst), SG-tapet = bevis under, primærhandling nederst.

## Bruk
```jsx
<NesteFokusKort
  akse="PUTT"
  omrade="Putting innenfor 6 ft er største lekkasje"
  sgTap="−1,2"
  baseline="Team Norway IUP"
  begrunnelse="Du taper mest på de korte puttene. Én økt i uka lukker mesteparten av gapet."
  formelAkse="SLAG_PUTT"
  benchmark="Tour-snitt: +0,3 slag"
  nivaa="elite"
  handlingTekst="Legg inn putting-økt"
  onHandling={leggInnOkt}
/>
```

## Progressiv dybde (én kodevei)
`nivaa` gater lag via `NIVA[nivaa]` — aldri tre koderetninger:
- **nybegynner** — kun verdikt + SG-tap + handling. Ett budskap, én handling.
- **ovet** — + klarspråk-begrunnelse.
- **elite** — + benchmark mot tour + fagkode-chip («Tren SLAG_PUTT»).

## Domenefasit
- SG alltid m/ fortegn, én desimal, enheten «slag», ALLTID mot navngitt `baseline`. Gevinst/tap via `DeltaIndikator` (--up/--down) — aldri lime.
- Akse-klarspråk: OTT «Tee-slag» · APP «Innspill» · ARG «Nærspill» · PUTT «Putting». Fagkode kun fra «elite».

## Tilstander
`loading` (Skeleton) · `tomt` (onboarding: «Spill din første runde for å se Strokes Gained») · normal. CTA: hover/active/focus-visible (WCAG, 44px).

## Komponerer
`DeltaIndikator` (SG-tallet). Dupliserer ingen viz — dette er verdikt-laget, ikke en graf.
