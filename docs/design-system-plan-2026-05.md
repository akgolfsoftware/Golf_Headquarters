# Designsystem-plan — AK Golf HQ

**Bygget på:** `docs/design-system-audit-2026-05.md`
**Dato:** Mai 2026
**Mål:** Bringe implementeringen i samsvar med specen, gjøre drift fysisk umulig, lukke 4-mapper-problemet.
**Totalt estimat:** 5 arbeidsdager fordelt på 5 milepæler.

---

## Milepæl-oversikt

| # | Milepæl | Estimat | Blokkerer | Når levert |
|---|---|---|---|---|
| **M1** | Sannhet i tokens | 0,5 dag | Alt nedstrøms | Dag 1 morgen |
| **M2** | Bygg ut `ui/`-primitiver | 1 dag | M3, M5 | Dag 1–2 |
| **M3** | Håndhev via ESLint + CI | 0,5 dag | M4 (cleanup) | Dag 2 |
| **M4** | Cleanup-runder (3 og 3) | 2 dager | — | Dag 3–4 |
| **M5** | Konsolidering: én branded-mappe | 1 dag | — | Dag 5 |

---

## M1 — Sannhet i tokens (BLOKKER, gjøres først)

**Problem:** To inkompatible pyramide-sett i samme `globals.css`. `design-tokens.ts` har det feile (gamle) settet. Charts viser ulike farger for samme akse.

### Steg

1. **`src/app/globals.css` — slett gammelt `--color-pyr-*`-sett** (linje 145–164). Behold kun `--pyr-*` per spec og deres `-track`-varianter, men map dem til Tailwind-utilities slik:
   ```css
   /* I @theme inline-blokken */
   --color-pyr-fys:   var(--pyr-fys);
   --color-pyr-tek:   var(--pyr-tek);
   --color-pyr-slag:  var(--pyr-slag);
   --color-pyr-spill: var(--pyr-spill);
   --color-pyr-turn:  var(--pyr-turn);
   ```
   Da kan komponenter fortsatt bruke `bg-pyr-fys` som utility, men kilden er én.

2. **`src/lib/design-tokens.ts` — oppdater `pyramidColors`:**
   ```ts
   export const pyramidColors = {
     fys:   "#005840",  // forest
     tek:   "#B8852A",  // ochre
     slag:  "#2563EB",  // blue
     spill: "#D1F843",  // lime
     turn:  "#A32D2D",  // red
   } as const;
   ```

3. **Sjekk alle PyramidProgress + chart-bruk visuelt.** Charts vil bytte farger. Det er meningen. Verifiser at legend-tekstene fortsatt matcher fargene.

4. **Commit:** `fix(design-tokens): consolidate pyramid color tokens to spec`

**Output:** Én sannhet for pyramide-farger. Stoppe at dataene lyver.

---

## M2 — Bygg ut `ui/`-primitiver

**Problem:** Mangler 6 grunnleggende shadcn-primitiver. 328 native `<button>`-tags i kodebasen.

### Steg

1. **Installer manglende primitiver via shadcn CLI:**
   - `Button` (med `cva` for varianter)
   - `Dialog`
   - `Sheet`
   - `Popover`
   - `DropdownMenu`
   - `Toast` (Sonner-basert)

2. **Migrer `AthleticButton`-varianter inn i `Button`** som varianter:
   ```ts
   const buttonVariants = cva("...", {
     variants: {
       variant: { lime, primary, secondary, "ghost-light", "ghost-dark" },
       size:    { sm, md, lg },
     },
   });
   ```
   Eksportér både `Button` og `buttonVariants` fra `ui/button.tsx`. Behold `AthleticButton` som re-export i 2 uker, deretter slett.

3. **Slett `src/components/shared/modal.tsx`** og migrer call-sites til `ui/dialog.tsx`.

4. **Oppdater `ui/index.ts`** med de nye eksportene.

5. **Commit:** `feat(ui): add Button, Dialog, Sheet, Popover, DropdownMenu, Toast primitives`

**Output:** Det er ikke lenger mulig å bygge en knapp uten å ta stilling til variant.

---

## M3 — Håndhev via ESLint + CI

**Problem:** Spec sier "håndheves i kode-review" — men 54 brudd på 8pt-grid og 5 serif-treff sier at det ikke skjer.

### Steg

1. **Installer:** `eslint-plugin-tailwindcss` + `@typescript-eslint/eslint-plugin` (har du sikkert).

2. **Legg til regelfil `eslint-rules/design-system.js`** med blocklist:
   ```js
   // Forbudte Tailwind-classes
   const FORBIDDEN_CLASSES = [
     /\b(p|m|gap|space-y|space-x|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr)-[3579]\b/,
     /\bfont-serif\b/,
     /\bbg-\[#[0-9a-fA-F]{3,8}\]/,
     /\btext-\[#[0-9a-fA-F]{3,8}\]/,
     /\bborder-\[#[0-9a-fA-F]{3,8}\]/,
   ];
   ```

3. **CI-feiler ved brudd.** Legg `npm run lint` som påkrevet steg i GitHub Actions.

4. **Unntak-mekanisme:** Tillat `// eslint-disable-next-line design-system/no-arbitrary-hex` med påkrevd kommentar — ingen disable uten begrunnelse.

5. **Commit:** `chore(lint): block hardcoded hex, off-grid spacing, font-serif`

**Output:** Drift kan ikke skje uten at noen aktivt skriver et eslint-disable. Det er nok friksjon.

---

## M4 — Cleanup-runder (3 og 3, som refinement-prosessen din)

**Problem:** 1 558 hex-treff, 54 spacing-brudd, 5 serif-treff. Kan ikke fikses i én PR uten å introdusere regresjon.

### Strategi: følg din egen refinement-modell — 3 filer per runde, diagnose før polish.

| Runde | Filer | Fokus |
|---|---|---|
| **R1** | `portal/booking/[bookingId]/page.tsx`, `portal/meg/abonnement/avbestill/page.tsx`, `portal/tren/turneringer/[id]/turnering-client.tsx` | Fjern `font-serif`. Erstatt med `font-display italic`. |
| **R2** | `portal/booking/anlegg/[anleggId]/page.tsx`, `portal/booking/page.tsx`, `portal/meg/abonnement/kort/ny/kort-form.tsx` | Migrer `#003A2A`-gradient til `--brand-primary-deep` (#003B2A). Velg én. |
| **R3** | `portal/tren/turneringer/[id]/turnering-client.tsx` (CSS-blokken, linje 1820+) | Slett `--tdc-*`-aliasene. Inline med standard tokens. |
| **R4** | `(marketing)/page.tsx`, `(marketing)/coaching/page.tsx`, `(marketing)/booking/page.tsx` | 8pt-grid: alle p-3/p-5/p-7 → nærmeste 8pt. |
| **R5** | `portal/ny-okt/wizard.tsx`, `portal/analysere/page.tsx`, `portal/gjennomfore/page.tsx` | Wizard-flowen, samme spacing-cleanup. |
| **R6** | `auth/bankid/page.tsx`, `auth/forgot-password/forgot-form.tsx`, `auth/logget-ut/page.tsx` | Auth-cleanup. |
| **R7** | De 5 admin-koblinger-filene | 8pt-grid. |

Etter R7 er ESLint på, og restbruddene oppdages automatisk. Resten gjøres on-demand når sider blir rørt.

### Format per runde (matcher refinement-13-malen)
- Diagnose-tabell: hva er strukturelt galt
- Levert: filer + ✓-changes
- Ikke gjort: utenfor scope
- Filer: lenker

**Output:** De høyest-trafikkerte sidene (marketing + portal + booking) er i samsvar med spec.

---

## M5 — Konsolidering: én branded-mappe

**Problem:** `athletic/`, `v2/`, `shared/`, `ds/` konkurrerer.

### Beslutning (anbefalt)

Behold **`athletic/`** som eneste branded-bibliotek. Begrunnelse: navnet er signatur, det er det `colors_and_type.css` i pakken referer til, og 40 komponenter er allerede der.

### Steg

1. **Migrer `v2/` inn i `athletic/`** kategorivis:
   - `v2/hero/` → `athletic/hero/` (slå sammen med eksisterende `hero.tsx`)
   - `v2/cards/` → `athletic/cards/`
   - `v2/data/` → `athletic/data/` (eksisterer)
   - `v2/shell/` → `athletic/shell/` (ny)
   - `v2/itinerary/` → `athletic/itinerary/` (ny)
   - `v2/modals/` → bruker `ui/dialog.tsx` etter M2
   - `v2/editorial/` → `athletic/editorial/` (ny)

2. **Migrer `v2/patterns.css` inn i `globals.css`** eller behold som `src/styles/patterns.css`. **Ikke** ha "v2"-navnet i filer fremover — vi har ikke en v1 lengre.

3. **Tøm `shared/`:** Funksjonelle utility-komponenter (`ViewModeContext`, `analytics-loader`, `cookie-banner`, `cmd-palette`, `notification-bell`, `mobile-bottom-nav`) blir værende eller flyttes til feature-mapper. Designkomponenter (`page-header`, `modal`, `overview-card`, `overview-shell`, `detail-shell`) migreres til `athletic/`.

4. **Slett `ds/tab-bar.tsx`** — flytt til `ui/tabs.tsx` som ny variant.

5. **Oppdater `CLAUDE.md`-mappestrukturen** for å reflektere virkeligheten etter migrering.

6. **Commit:** `refactor(components): consolidate v2 + shared into athletic + ui`

**Output:** Når en utvikler bygger noe nytt, har de to mapper å velge mellom (`ui/` for primitiver, `athletic/` for branded). Ikke fire.

---

## Etter M5 — løpende vedlikehold

- **Dokumentér 12 hovedkomponenter** i `docs/design-system/components/`: AthleticButton, AthleticBadge, AthleticCard, Hero, FeaturedCard, KpiStrip, PyramidProgress, ActionList, QueueList, DayCal, Dialog, Sheet. Hver fil: variant-tabell, do/don't, prop-spec, kode-eksempel.
- **Dark-mode-beslutning:** 7 `dark:`-treff i kodebasen sier at dark mode er ikke ekte. Enten kanseller og fjern dark-tokens, eller dediker en runde til å gjøre det ekte.
- **Touch-target-audit (44px-regel)** på PlayerHQ + Booking på iPhone-bredde.
- **Stats-pakken (`Stats (1).zip`):** Hvis dette skal inn i monorepoet, må den ikke ha egen `styles.css`. Den må bruke `globals.css`. `#BE3D3D` → `#A32D2D`, `#E59E3D` → `#B8852A`. Bestem deg på dag 1.

---

## Beslutninger jeg trenger fra deg før M1

1. **Pyramide-spec — bekreft:** TEK=ochre (#B8852A), SLAG=blå (#2563EB), TURN=rød (#A32D2D)?
   *Anbefaling: ja, per kanonisk spec i skill-pakken.*

2. **Stats — skal det inn i `akgolf-hq`-monorepoet, eller leve som separat prosjekt under `/stats/*`?**
   *Anbefaling: inn i monorepoet, deler globals.css. Egen styles.css er femte kopi av tokens — kill den.*

3. **`v2`-navnet — behold "v2" eller migrer til `athletic/`?**
   *Anbefaling: migrer til `athletic/`. Vi har ikke en v1 lengre. "v2" er en forvirring som gjør hver fremtidig endring tyngre.*

---

## Det jeg ville startet med på mandag

**M1 (½ dag) + start M3 (linting) i parallell.** M1 stopper at dataene lyver — det er den dyreste feilen. M3 stopper at nye sider drifter videre mens M4 cleanes opp. M2 (ui-primitiver) kan kjøres som egen fokus-økt på tirsdag.

Hvis du kun har én dag denne uka: gjør M1. Det er én commit, 2 timers arbeid, og den fikser den eneste designsystem-feilen som faktisk er skadelig for produktet.
