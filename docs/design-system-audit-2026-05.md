# Designsystem-audit — AK Golf HQ

**Reviewer:** Senior design- og brand-direktør
**Dato:** Mai 2026
**Scope:** `akgolf-hq` monorepo + medfølgende pakke "AK Golf HQ Design System (5).zip" + "Stats (1).zip"
**Komponenter gjennomgått:** 152 i kodebase (athletic 40, ui 15, v2 34, shared 63) + 83 preview-kort + 4 UI-kits
**Issues funnet:** 14
**Helsescore:** **62 / 100** (godt fundament, alvorlig drift i implementeringen)

---

## TL;DR — den ene strukturelle feilen

Du har ikke ett designsystem. Du har **fire parallelle implementeringer av samme intensjon**, og de er ikke synkroniserte.

| Lag | Hvor | Hva er det |
|---|---|---|
| **Kanonisk spec** | `.../skills/ak-golf-hq-design/colors_and_type.css` + `README.md` | Den låste sannheten — fysiske farger, font-stack, pyramide-akser, regler |
| **Runtime-tokens** | `src/app/globals.css` | HSL-trippel + `@theme inline` for Tailwind — men inneholder **dobbelt sett pyramide-tokens med ulik semantikk** |
| **Athletic-bibliotek** | `src/components/athletic/` | Branded komponenter, brukt av kun 44 av 392 sider (11 %) |
| **V2-bibliotek** | `src/components/v2/` + `src/styles/v2/patterns.css` | Nyere komponenter med egen pattern-stilfil — overlapper athletic |

Spec-en er stram. Implementeringen lekker. Du har 1 558 hardkodede hex-verdier på tvers av 154 filer mens specen sier "aldri hardkode". Det er en signaltap-feil, ikke et CSS-problem.

---

## 1 · Diagnose før polish

### 1.1 Token-konflikt i `globals.css` (BLOKKER — fiks først)

Filen definerer pyramide-aksene i to inkompatible sett, i samme `@theme`-blokk, med 8 linjers mellomrom:

```css
/* Linje 145–149 — utility-tokens (gamle) */
--color-pyr-fys:   #005840;
--color-pyr-tek:   #1A7D56;   ← TEK = teal/grønn
--color-pyr-slag:  #D1F843;
--color-pyr-spill: #B8852A;
--color-pyr-turn:  #5E5C57;   ← TURN = grå

/* Linje 153–157 — "v2-tokens" (matcher spec) */
--pyr-fys:   #005840;
--pyr-tek:   #B8852A;         ← TEK = ochre  (KORREKT per spec)
--pyr-slag:  #2563EB;
--pyr-spill: #D1F843;
--pyr-turn:  #A32D2D;         ← TURN = rød   (KORREKT per spec)
```

Den kanoniske specen (`colors_and_type.css` i skill-pakken) sier eksplisitt: TEK=ochre, SLAG=blå, TURN=rød. CLAUDE.md i pakken understreker: *"Bruk rå hex (mode-invariant), ikke semantiske aliaser."*

Resultat: én pyramide rendret med `--color-pyr-*` og en annen med `--pyr-*` viser **forskjellige farger for samme akse**. Det er den verste klassen feil i et datavisualiserings-DS — den lyver om dataen.

**Anbefaling:** Slett `--color-pyr-*`-settet umiddelbart. La `--pyr-*` (mode-invariant rå hex per spec) være eneste sannhet. `design-tokens.ts` har den feile (gamle) settet — fiks der også.

### 1.2 Tre overlappende komponentbibliotek

Du har bygget den samme komponenten tre ganger:

```
src/components/athletic/   → AthleticButton, AthleticBadge, AthleticCard, KpiStrip
src/components/v2/         → cards/, hero/, data/, shell/, modals/
src/components/shared/     → page-header, modal, detail-shell, mobile-bottom-nav
src/components/ds/         → tab-bar (alene)
src/components/ui/         → shadcn-primitiver, men UTEN Button/Dialog/Sheet
```

`ui/` mangler Button — derfor finnes Button bare i `athletic/`. Resultat: 328 native `<button>`-tags i .tsx, kun 202 importer av `AthleticButton`. Mer enn halvparten av knappene i appen er ustylte primitiver. Det er der lekkasjen av hardkodet `bg-[#xxx]` (50 treff) og `text-[#xxx]` (24 treff) bor.

**Anbefaling:** Konsolider til to mapper, ikke fire:
- `ui/` — shadcn-primitiver inkl. Button, Dialog, Sheet, Popover, DropdownMenu, Toast, Command, Accordion (du mangler 8 grunnleggende)
- `branded/` (eller behold `athletic/`) — Hero, KPI-strip, FeaturedCard, PyramidProgress, ActionList — det som faktisk er AK-DNA

Migrer `v2/` inn i `branded/` og slett mappen. `shared/` er ren utility — flytt funksjonelle ting til `lib/components/` og slett resten. `ds/tab-bar.tsx` er én fil og hører hjemme under `ui/tabs/`.

### 1.3 Brudd på "ingen serif italic"-regelen

Spec-en er entydig: *"Inter Tight italic er signaturen. Aldri serif italic."* Fem filer bryter:

```
src/app/portal/booking/[bookingId]/page.tsx:139      → font-serif italic
src/app/portal/booking/[bookingId]/page.tsx:240      → font-serif italic
src/app/portal/meg/abonnement/avbestill/page.tsx:64  → font-serif italic
src/app/portal/meg/abonnement/avbestill/page.tsx:91  → font-serif italic
src/app/portal/tren/turneringer/[id]/turnering-client.tsx:1843 → --tdc-font-serif
```

Dette er ikke noise. Det er **din branding-aksent** — den ene tingen som skiller deg fra hver SaaS-mal i bransjen. Hvert serif-treff koster deg signaturen.

### 1.4 Tier-spec — to ulike pyramide-systemer i `design-tokens.ts`

`src/lib/design-tokens.ts`:

```ts
export const pyramidColors = {
  fys: "#005840",
  tek: "#1A7D56",     ← feil per spec
  slag: "#D1F843",    ← feil per spec  
  spill: "#B8852A",   ← feil per spec
  turn: "#5E5C57",    ← feil per spec
} as const;
```

Charts som leser fra denne fila bruker derfor det gamle (feile) settet. Spec-en sier ochre/blå/lime/rød — kodebasen sier teal/lime/ochre/grå. **Datafargene lyver.**

### 1.5 8pt-grid-brudd: 54 treff på p-3/p-5/p-7

Specen kaller det "forbudt" og "håndheves i kode-review". Du har 54 treff på tvers av 20+ filer — inkludert produksjonssider som `(marketing)/page.tsx`, `(marketing)/coaching/page.tsx`, `auth/forgot-password/forgot-form.tsx`, og hele wizard-flowen i `portal/ny-okt`. Det er nok til at det ikke kan kalles enkelttilfeller — det er en regel som ikke er håndhevet.

**Anbefaling:** Legg inn ESLint-regel i prosjektet — `eslint-plugin-tailwindcss` med custom blocklist for `p-3`, `p-5`, `p-7`, `p-9`, samme for `m-`, `gap-`, `space-y-`, `space-x-`. CI-feiler ved brudd. Uten håndhevelse er regelen kosmetikk.

---

## 2 · Token-dekning (de viktige tallene)

| Kategori | Definert | Hardkodede treff i kode | Status |
|---|---|---|---|
| **Farger** | 28 semantiske + 5 pyramide × 2 sett (dupl.) + ~35 brand-prim. | **1 558 hex i .tsx/.ts/.css over 154 filer** | Kritisk drift |
| **Spacing** | 8pt-grid (7 trinn) | **54 brudd på p-3/p-5/p-7** | Mønster, ikke uhell |
| **Typografi** | 3 fonter — Inter / Inter Tight / JetBrains | 5 `font-serif`-treff, 17 `font-sans-serif`-treff | Brudd på "låst" |
| **Ikoner** | Lucide kun | 669 lucide-imports, 0 alternative biblioteker | Korrekt |
| **Radii** | 6 trinn (8/12/16/20/24/full) | Stort sett OK, men `rounded-xl`/`rounded-2xl` mappes til 12/16 i Stats-pakken (avvik) | Inkonsistent |

**De 194 unike hex-verdiene** fordeler seg slik:
- 14 er kanoniske brand-tokens (forventet å se i SVG-charts)
- ~30 er gradient-utvidelser (avatar-1 til avatar-8, brand-primary-hover, accent-soft, etc. — alle DEFINERT, men brukt utenfor utility-mappingen)
- **~150 er reelt drift** — `#001489`, `#001510`, `#28C840`, `#1DB954`, `#4285F4`, `#3B82F6`, `#22C55E`, `#16A34A`, etc. Dette er Tailwind-default-blå, Spotify-grønn, Apple-blå, Google-fargene. **Dette er ikke ditt brand.**

Topp-hex-brukerne:
- `#88B45A` (13 treff) — finnes ikke i specen. Er det "spill" på turneringer? Skal det erstattes med `--pyr-spill` (#D1F843)?
- `#003A2A` (50 treff) — ikke i tokens, men brukes i `linear-gradient` for forest-til-mørkforest. Bør være `--brand-primary-deep` (allerede definert som #003B2A, 1 punkt unna). **Velg én.**

---

## 3 · Komponent-komplettering

| Komponent | States | Variants | Docs | Score |
|---|---|---|---|---|
| AthleticButton | 5 variants, hover, disabled, focus-ring | OK | Mangler størrelse-spec dokumentert | 8/10 |
| AthleticBadge | 6 variants | OK | OK | 9/10 |
| AthleticCard | OK | Få variants | OK | 7/10 |
| Hero | OK | OK | OK | 8/10 |
| KpiStrip | OK | OK | OK | 9/10 |
| PyramidProgress | OK | **Bruker feil pyramide-tokens** | OK | 5/10 |
| Calendars (11 stk) | Variabel | Variabel | Mangler | 6/10 |
| Data-viz (11 stk) | Variabel | Variabel | Mangler | 6/10 |
| Input/Textarea/Select | OK | OK | Mangler error-state-spec | 7/10 |
| **Button (ui/)** | **MANGLER** | — | — | **0/10** |
| **Dialog/Modal (ui/)** | **MANGLER** | — | — | **0/10** |
| **Toast (ui/)** | **MANGLER** | — | — | **0/10** |
| **Sheet (ui/)** | **MANGLER** | — | — | **0/10** |
| **DropdownMenu (ui/)** | **MANGLER** | — | — | **0/10** |
| **Popover (ui/)** | **MANGLER** | — | — | **0/10** |

Du mangler seks shadcn-primitiver som er forutsetning for at den produksjonsklare delen av appen kan oppføre seg konsekvent. Du har en `shared/modal.tsx` — det er sannsynligvis derfor `Dialog` ikke er installert — men da har du et eget mønster som ikke peker mot et standard, og det øker vedlikeholdskostnaden.

---

## 4 · Brand-strategi — det jeg vil si rett ut

### Det som funker
- **Forest + lime + cream-paletten** er sterk. Den er gjenkjennelig, den er sport-faglig (Tour-grønn, ikke SaaS-grønn), den klarer både premium-coaching-vibe og data-tetthet samtidig. Det er sjelden.
- **Inter Tight italic på `<em>`** er den ene signaturen som gir produktet personlighet uten å bli søtt. Den fungerer både på *"Hvor langt slår de egentlig?"* og på *"PGA Tour-snittet er 48 %"*. Beskytt den.
- **Eyebrow-mønsteret** (mono · 10px · 0.12em tracking · UPPERCASE) er instrumentpanel-typografi som binder hele systemet sammen visuelt. Bra valg.
- **CLAUDE.md-strukturen i designpakken** — refinement-prosessen med "3 og 3 skjermer, diagnose før polish" — er en av de bedre interne designprosess-dokumentene jeg har sett. Den disiplinen er din konkurransefordel.

### Det som er svakt
- **Lime brukes som dekor**, ikke som signatur. 99 hex-treff på `#D1F843` direkte i .tsx/.ts. Specen sier *"kommer i biter — en knapp, en dot, en linje under en aktiv tab"*. Sett en regel: lime kun via `bg-accent` eller `text-accent`, aldri som arbitrary class. Lime brukt for ofte slutter å være signal — den blir bare grønnaktig.
- **"Editorial sport-analytics"** er den sterkeste posisjonen jeg har sett for et golfcoaching-produkt. Men "DataGolf møter The Athletic" er en intern setning — det dukker aldri opp i kundens hode. Den må manifestere seg som ett konkret element kunden husker. Forslag: lim *italic-aksenten* til hver eneste hero-overskrift i produktet, uten unntak. Det er din "Bloomberg-orange" — en mikrosignatur som er din.
- **Fire moduler, ett designsystem** — bra ambisjon, men `ui_kits/booking/` mangler `Components.jsx` og `Screens.jsx` som playerhq/coachhq har. Booking er underutviklet i specen, og det matcher at booking-flyten i kodebasen er der jeg fant flest font-serif-brudd. Hvis booking er konverteringsmotoren (det er det), er det stedet kvaliteten må være høyest.

### Det som er forvirrende
- **`Stats (1).zip`** introduserer et helt nytt verktøy (`/stats/*` — turneringer, PGA stats, norsk spillerbase, SG-sammenlign) **og en egen `styles.css` med samme tokens redefinert**. Designsystemet sier "én kilde til sannhet" — her er en femte kopi. Stats-pakken har også tier-badges (college/wagr/norsk) med farger som ikke finnes i den kanoniske specen: `#2A6FDB` (info-blå), `#BE3D3D` (avvik fra `#A32D2D`), `#E59E3D` (avvik fra `#B8852A`). Disse er nære-men-ikke-like. Det er den verste typen drift — den ser riktig ut, så ingen fikser den.
- **`v2/`** er ikke datert eller forklart noe sted. Hvis det er nyere generasjon som skal erstatte `athletic/`, si det og legg en migrasjonsplan. Hvis det er en parallell ide som ble igjen, kill den. Slik den står nå tvinger den deg til å velge mappe hver gang du bygger noe nytt.

---

## 5 · Prioriterte handlinger (de 3 tingene du gjør først)

1. **Slett `--color-pyr-*`-settet i `globals.css` og fiks `pyramidColors` i `design-tokens.ts`.** La `--pyr-*` per spec være eneste sannhet. Sjekk hver kompont som leser fra `pyramidColors` for visuelle endringer (charts vil bytte farger — det er meningen). **Tidsestimat: 2 timer.** **Impact: stopper at dataene lyver.**

2. **Bygg ut `ui/`-mappen med de seks manglende primitivene fra shadcn:** Button, Dialog, Sheet, Popover, DropdownMenu, Toast. Migrer `AthleticButton`-varianter inn som `Button`-varianter via `cva`. Slett `shared/modal.tsx` etter migrering. **Tidsestimat: 1 dag.** **Impact: reduserer overflateareal og gjør det fysisk umulig å skrive 328 ustylte `<button>`.**

3. **Legg inn ESLint-regel som blokkerer `p-3/p-5/p-7/p-9`, `font-serif`, og `bg-[#xxx]`/`text-[#xxx]` arbitrary-classes.** CI-feiler ved brudd. **Tidsestimat: 3 timer.** **Impact: stopper drift før den oppstår — den eneste skalerbare måten å holde et DS rent på.**

---

## 6 · Det neste laget (når 1–3 er gjort)

4. Skriv en `docs/design-system/components/` per komponent — variant-tabell, do/don't, prop-spec. 12 komponenter er nok til å fange 80 % av bruken.
5. Konsoliderer `v2/` inn i `athletic/` (eller omvendt). En navnerom, ikke to.
6. Fjern Stats sin egen `styles.css` — la den ligge under samme `globals.css` som resten.
7. Audit av `dark`-mode: 7 `dark:`-treff i hele kodebasen sier at dark mode er ikke ekte ferdig. Bestem deg: enten cancel og fjern dark-tokens fra spec, eller dedikér en runde til å gjøre dem ekte.
8. Touch-target-audit på mobile flater (44px-regel) — pakken sier "ikke alltid håndhevet". Stikkprøvebasert gjennomgang av PlayerHQ + Booking på iPhone-bredde.

---

## 7 · Det jeg ville ha gjort hvis dette var min plattform

Jeg ville ikke ha bygget både `athletic/` og `v2/` parallelt. Jeg ville ha valgt `athletic/`-navnet (det er på-merket og selvforklarende), satt det som **eneste branded-bibliotek**, og brukt 1 uke på å migrere v2-komponentene inn. Etter det ville jeg ha låst designsystemet på en versjon (v3.0), tagget det i git, og kjørt en **stop-the-line-regel**: ingen ny side går ut uten å bruke `athletic/` + `ui/` primitiver. Hver `font-serif`, hver `bg-[#xxx]`, hvert `p-3` blokkeres i CI.

Spec-en din er allerede bedre enn 90 % av designsystemene jeg har sett i SaaS. Problemet er ikke at den er feil — det er at den ikke håndheves. Designsystemer dør ikke av dårlige farger; de dør av at det er enklere å hardkode `#88B45A` enn å finne riktig token. Du må gjøre det motsatt-enklere.

---

**Slutt på rapport.**
