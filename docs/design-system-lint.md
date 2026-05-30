# Designsystem-lint — kort referanse

ESLint-regelen `no-restricted-syntax` håndhever fire designsystem-regler. Definert i `eslint.config.mjs`. Bakgrunn: `docs/design-system-audit-2026-05.md`.

## Hva blokkeres

| Regel | Treff på | Eksempel som feiler |
|---|---|---|
| 1. Hardkodet hex som hel string | `"#005840"`, `"#D1F843"` | `color="#005840"` |
| 2. Arbitrary hex i Tailwind className | `bg-[#xxx]`, `text-[#xxx]`, `border-[#xxx]`, `ring-[#xxx]`, `fill-[#xxx]`, `stroke-[#xxx]`, `from/via/to-[#xxx]`, `shadow-[#xxx]` | `<div className="bg-[#005840]" />` |
| 3. Off-grid spacing | `(p\|m\|px\|py\|mx\|my\|mt\|mb\|ml\|mr\|pt\|pb\|pl\|pr\|gap\|space-x\|space-y)-[3579]` | `<div className="p-3" />` |
| 4. font-serif | `\bfont-serif\b` | `<em className="font-serif" />` |

## To strenghet-nivåer

| Scope | Severity | Effekt |
|---|---|---|
| `src/components/ui/**` | **error** | CI feiler. Ny kode må være ren. |
| Resten av `src/**` | **warning** | CI passerer. Editor highlighter rødt. lint-staged blokkerer på endrede filer. |

Når M4-cleanup-rundene er ferdige (R7 i `docs/design-system-plan-2026-05.md`), promoteres warn → error globalt.

## Hvordan unngå brudd

### Vanlig vei
- Bruk Tailwind semantic-tokens: `bg-primary`, `text-foreground`, `border-border`, `ring-ring`.
- Pyramide-akser: `bg-pyr-fys`, `text-pyr-tek` (henter fra `--pyr-*`).
- Spacing: `p-2/4/6/8/10/12/16` (8/16/24/32/40/48/64 px).
- Italic-signatur: `<em className="font-display italic text-primary">egentlig</em>` — **aldri** `font-serif`.

### Tre legitime unntak

Charts, SVG-fyll, og data-viz trenger noen ganger eksakt rå hex (f.eks. mode-invariant pyramide-akser i en custom canvas). Disable med begrunnelse:

```tsx
// eslint-disable-next-line no-restricted-syntax -- pyramide-akser må være mode-invariant per spec
const PYRAMID_COLORS = ["#005840", "#B8852A", "#2563EB", "#D1F843", "#A32D2D"];
```

Andre legitime unntak:
- Tredjeparts-brand-farger i partner-logoer (SVG fill) — ikke vårt designsystem, disable.
- Animasjons-keyframes med tidsbasert opacity-rgba — disable.

**Ulegitime:** "Det ser bedre ut" eller "ingen tid". Da må du finne riktig token.

## Hvordan finne nærmeste token

| Du har | Bytt til |
|---|---|
| `#005840` | `bg-primary` / `text-primary` / `border-primary` |
| `#D1F843` | `bg-accent` / `text-accent` |
| `#FAFAF7` | `bg-background` |
| `#FFFFFF` (kort) | `bg-card` |
| `#0A1F17` (tekst) | `text-foreground` |
| `#5E5C57` (sekundær) | `text-muted-foreground` |
| `#F1EEE5` | `bg-secondary` / `bg-muted` |
| `#E5E3DD` | `border-border` |
| `#1A7D56` | `text-success` |
| `#B8852A` | `text-warning` / `text-pyr-tek` |
| `#A32D2D` | `text-destructive` / `text-pyr-turn` |
| `#2563EB` | `text-info` / `text-pyr-slag` |

Hvis fargen din ikke står i tabellen, er den ikke i tokens — velg nærmeste eller spør før du legger til en ny token.

## CI + pre-commit

- **CI** (`npm run lint`): feiler på errors. Med dagens warn-scope passerer den selv med 320+ eksisterende drift-warnings.
- **lint-staged** (`eslint --max-warnings 0` på endrede filer): blokkerer commits som introduserer drift. Hver fil du rører må fikse driften før commiten går gjennom.
- **Editor**: VS Code med ESLint-extension viser rødt på treff i sanntid.

## Når M4 er ferdig

Fjern `warn`-scopet, behold kun `error`-scopet, og bytt til glob `src/**/*.{ts,tsx}` med `error`. Da kan ingen ny drift komme inn — verken via PR eller direkte til main.
