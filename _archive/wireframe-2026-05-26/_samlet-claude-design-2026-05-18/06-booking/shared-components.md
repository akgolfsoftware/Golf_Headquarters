# Shared Components — Booking Export

Komponent-mapping fra HTML-design til React. Lister hvilke komponenter `akgolf-booking` trenger, og hva som kan kopieres direkte fra `akgolf-hq`.

## Komponenter som finnes i `akgolf-hq` og kan kopieres direkte

Disse er allerede bygget og testet i `akgolf-hq` — kopier `.tsx`-fila inn i `akgolf-booking/src/components/` og oppdater imports.

| Komponent | Sti i akgolf-hq | Beskrivelse |
|---|---|---|
| `BookSessionModal` | `src/components/modaler/BookSessionModal.tsx` | Eksisterende booking-modal — referanse for ny 3-stegs flyt |
| `RescheduleBookingModal` | `src/components/modaler/RescheduleBookingModal.tsx` | Reschedule-modal — bruk som utgangspunkt |
| `EmptyState` | `src/components/shared/empty-state.tsx` | Tomtilstand (ingen ledige tider, ingen coaches) |
| `LoadingSkeleton` | `src/components/shared/loading-skeleton.tsx` | Skeleton for loading-states (steg2-loading, confirmation-loading) |
| `PageHeader` | `src/components/shared/page-header.tsx` | Topp på fullsides booking-skjermer |
| `Calendar` | `src/components/shared/calendar/` | Kalender-velger for booking-kalender |
| `ViewModeContext` + `ViewModeToggle` | `src/components/shared/` | Lyst/mørkt-toggling (testet) |
| `NumberSpinner` | `src/components/shared/number-spinner.tsx` | Antall-velger (gruppe-størrelse, deltakere) |
| `ProKampanjeBanner` | `src/components/shared/pro-kampanje-banner.tsx` | Upgrade-prompt for Locked-state |
| `AKGolfLogo` | `src/components/shared/ak-golf-logo.tsx` | Header-logo |

## Komponenter som må bygges i `akgolf-booking`

Disse er nye eller booking-spesifikke og må implementeres fra HTML-mønstrene i `designs/`.

### `Button`-varianter

Knapp-mønstre identifisert i modal-C:

| Variant | Tailwind-klasser | Bruk |
|---|---|---|
| `primary` | `bg-primary text-primary-foreground rounded-full px-6 py-3` | Hovedhandling: "Bekreft booking", "Velg tid" |
| `secondary` | `bg-secondary text-secondary-foreground rounded-full px-6 py-3` | Sekundær: "Tilbake", "Avbryt" |
| `ghost` | `text-foreground hover:bg-muted rounded-full px-4 py-2` | Diskret: "Lukk", "Endre" |
| `accent` | `bg-accent text-accent-foreground rounded-full px-6 py-3` | Locked-CTA: "Oppgrader til Pro" |
| `destructive` | `bg-destructive text-destructive-foreground rounded-full px-4 py-2` | "Avlys booking" |

Lag som `src/components/ui/button.tsx` med `cva`-varianter (shadcn-mønster). Bruk Lucide-ikoner ved behov (`<ArrowRight />`, `<Check />`, `<X />`).

### `Card`-mønstre

Tre kort-varianter brukes konsekvent i booking-modalene:

1. **Booking-summary-card** (`bg-card border border-border rounded-2xl p-6`) — sammendrag av booking i steg 3 og confirmation
2. **Time-slot-card** (`bg-card border border-border rounded-lg p-4 hover:border-primary`) — klikkbart tidsvalg i steg 2
3. **Coach-card** (`bg-card border border-border rounded-xl p-6`) — coach-profil med bilde, navn, spesialisering

Lag som `src/components/ui/card.tsx` med sub-komponenter: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

### `TierGate`-komponent (NY — kritisk for Locked-state)

Wrapper-komponent som dekker booking-flyten basert på brukerens tier:

```tsx
type TierGateProps = {
  required: "free" | "pro";
  userTier: "free" | "pro";
  children: ReactNode;
  // Når userTier < required, vis upgrade-prompt i stedet for children
};
```

- `free`-bruker som prøver å booke en gratistjeneste → render `children`
- `free`-bruker som prøver å booke pro-tjeneste → render `<UpgradePrompt />` (med CTA til `/abonnement`)
- `pro`-bruker → render `children` alltid

Designreferanse: `01-book-session-steg1-locked.html`.

### `StegIndikator` (NY)

3-stegs progress-indikator for booking-flyten. Brukes i toppen av Book Session-modalen:

```tsx
type StegIndikatorProps = {
  totalt: number;       // 3
  naavaerende: number;  // 1, 2 eller 3
  labels?: string[];    // ["Velg type", "Velg tid", "Bekreft"]
};
```

Visuelt: tre prikker eller streker, aktiv = `bg-primary`, fullført = `bg-primary opacity-50`, kommende = `bg-muted`. Designreferanse: synlig øverst i alle `01-book-session-steg*.html`.

### `CreditsCounter` (NY — for Pro-tier)

Liten badge som viser gjenværende credits denne måneden:

```tsx
type CreditsCounterProps = {
  brukt: number;
  totalt: number;  // 2 for Performance, 4 for Pro
};
```

Designreferanse: synlig i `01-book-session-steg1-pro.html`. Bruk JetBrains Mono for tallene (`font-mono tabular`).

### `TidsVelger` (NY)

Grid-basert tidsvelger som viser ledige slots gruppert per dag.

- Hver slot: 24h-tid (`14:30`), varighet (`60 min`), pris/credits
- Loading-state: skeleton (se `01-book-session-steg2-loading.html`)
- Mobile: scrollable horizontalt per dag

### `FasilitetsTabs` (NY)

Tab-navigasjon for Facility Detail-modalen (oversikt / tider / utstyr / anmeldelser). Bygg på Radix Tabs eller egen lett implementering.

## Tokens og CSS

- Kopier IKKE rå CSS-filer fra `tokens/` inn i `akgolf-booking/src/`. I stedet:
  - Bruk `akgolf-hq/src/app/globals.css` som mal — alle 18 semantiske tokens er allerede definert der
  - `akgolf-booking` skal speile det samme tokensystemet (CLAUDE.md i `akgolf-hq` er sannhet)
- `tokens/`-mappa i denne eksporten er kun referanse-materiale for å se hva designeren hadde i hodet

## Avhengigheter (kopier til `akgolf-booking/package.json`)

Samme som `akgolf-hq`:

- `next@16`, `react@19`, `typescript`, `tailwindcss@4`
- `lucide-react` (ikoner)
- `clsx` + `tailwind-merge` (for `cn()`)
- `class-variance-authority` (for `cva` i Button)
- `next/font/google` (Inter, Inter Tight, JetBrains Mono)
- `@radix-ui/react-tabs` (FasilitetsTabs) — valgfritt, kan også bygges custom

## Anbefalt port-rekkefølge

1. Tokens + `globals.css` (kopier fra `akgolf-hq`)
2. `Button`, `Card`, `cn()`-util
3. `StegIndikator`, `CreditsCounter`, `TierGate` (booking-spesifikke primitiver)
4. `BookSessionModal` (porter de 7 HTML-statene)
5. `RescheduleBookingModal` (5 states)
6. `FacilityDetailModal` (6 states)
7. `BookingConfirmation` (3 states)
8. Fullsides booking-skjermer (`screens-booking/`)
