# Masterplan Bølge 5 — Polish-rapport (S15-16 final-pass)

Branch: `feat/masterplan-b5-polish`
Dato: 2026-05-16

## Sammendrag

Sweep gjennom `src/` etter åtte spesifiserte kategorier av visuelle/tekstuelle
polish-fiks. Ingen forretningslogikk er endret.

## Endringer per kategori

### 1. Norsk-tegn-sweep — 0 filer endret

Søkte etter fallback-mønstre (`Paagar`, `Naa`/`naa` i UI, `forste`, `kjore`,
`stoette`, `moete`, m.fl.). Alle treff på `naa`/`forste` er **variabelnavn**
(f.eks. `const naa = new Date()`, `const forste = punkter[0]`) — disse skal
per instruks IKKE røres. UI-strings i kodebasen bruker konsekvent ekte
æ/ø/å-tegn. Mønsteret "Pågår" forekommer korrekt med å. Ingen reelle
fallbacks funnet.

### 2. TURN-tekst kontrast — 0 endringer (verifisert)

- `bg-pyr-turn` er `#5E5C57` (mørk grå, ikke accent-grønn). På denne
  bakgrunnen er `text-white` korrekt — ikke et kontrastproblem.
- Søk etter `text-white` på `bg-accent`/`#D1F843` ga 0 treff i kode-stien.
  Eneste mulige unntak (`live-tapper-demo`) bruker `bg-accent/[0.08]` på
  mørk bakgrunn — tekstkravet gjelder ikke der.

### 3. Today-markør konsistens — verifisert, ingen endring

- `MonthView.tsx`: today rendres som `rounded-full bg-accent text-accent-foreground`
  rundt dato-nummer (`#D1F843`-sirkel). Korrekt.
- `WeekView.tsx`: today-header har `bg-primary text-primary-foreground`
  (`#005840`-bakgrunn). Today-kolonne får `bg-primary/5`. Korrekt.

### 4. LIVE-økt visuell signatur — 1 fil endret

- `SessionCard.tsx`: Oppgradert fra `ring-1 ring-accent` til
  `ring-2 ring-accent` (matcher spec 2px solid).
- Pulserende `bg-accent`-prikk og `NÅ`-badge er allerede på plass i
  både `SessionCard` og `WeekView`.
- `DayView.tsx` har ingen tidsbaserte økter (oversiktsvisning) — ingen
  LIVE-markør nødvendig.

### 5. Tapp-knapp aldri kuttet — ingen aktuell kode

I `src/app/portal/(fullscreen)/live/[sessionId]/live-shell.tsx` finnes
ingen synlige "Godkjent"-/"Bommet"-knapper — slag registreres via tap-zones
og tastatursnarveier. Footer-knappene (Pause/Avbryt/Start neste) har alle
`h-[72px]` og full bredde via flex.

**Issue for videre arbeid:** Hvis spec krever store synlige "Godkjent"/"Bommet"
tapp-knapper (min 180px), må disse legges til som ny UI — utenfor dette
polish-pass.

### 6. Border-radius konsolidering — 1 fil endret

- `live-tapper-demo/page.tsx`: `rounded-[20px]` → `rounded-2xl`.
- Søk etter `rounded-[12px]`, `rounded-[100px]`, `rounded-[8px]` ga 0 treff.

### 7. Off-system grønntoner — 0 endringer

Søk etter `#0F4A35`, `#00734D`, `#082616`, `#14231C`, `#2E8C6A` i
`src/**/*.{tsx,ts}` (ekskludert `globals.css`) ga 0 treff. Kodebasen
bruker konsekvent tokens.

### 8. PeriodeModal accordion-advarsler — verifisert

`PeriodeModal.tsx` har én kompakt footer-advarsel (`AlertCircle` + tekst) —
allerede én rad, ikke stor blokk. Konsistent med spec.

### 9. PlayerHQ sidebar-ikoner — verifisert

`src/components/portal/sidebar.tsx` bruker INGEN initial-bobler — kun
tekst-labels. Ikoner som finnes (`Plus`, `ChevronDown`) er allerede
Lucide React. Ingen endring nødvendig.

### 10. Test-verifisering

`npx tsc --noEmit` viser feil — alle pre-existing (manglende
`src/generated/prisma/client` i worktree fordi Prisma ikke er generert
her). De spesifikke filene jeg endret introduserer ingen nye type-feil.
Klassenavn-endringene er trygge i Tailwind v4.

## Filer endret

| Fil | Kategori | Endring |
|---|---|---|
| `src/components/shared/calendar/SessionCard.tsx` | LIVE-signatur | `ring-1` → `ring-2` |
| `src/app/live-tapper-demo/page.tsx` | Border-radius | `rounded-[20px]` → `rounded-2xl` |

## Issues funnet som krever videre arbeid

1. **Synlige tapp-knapper i live-session** — `live-shell.tsx` har ikke
   store "Godkjent"/"Bommet"-CTA-knapper. Hvis spec krever disse (180px
   standard / 80px advanced), må de designes inn separat.
2. **Pre-existing TS-feil** — `@/generated/prisma/client` mangler i
   worktree. Trolig løses ved `npx prisma generate` — utenfor dette
   polish-pass.
