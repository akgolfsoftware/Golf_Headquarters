# Markedssidene → Master AK Golf — gjennomføringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle 22 markedssider under `src/app/(marketing)/` står på AK Golf-masteren (verkstedpalett, IBM Plex, instrumentlag, masterens komponenter), og de to gamle stilsystemene (`--mk-*`, `pk-*`/`--mkit-*`) er slettet med vakt.

**Architecture:** Token-filene importeres uendret fra `designsystem/ak-golf/tokens/` (generert fra `tokens.json`, voktet av `scripts/ak-golf-tokens.mjs`) inn i én CSS-fil som kun lastes av markedslayouten. Masterens JSX-komponenter portes til TSX i `src/components/marketing/ak/` med samme navn og props. Skallet (nav + bunn) bygges om først, så alle sider får ny ramme i én PR; deretter porteres sidene én om gangen etter canvas → bygg → audit → skjermbilde-gate.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (`@theme inline`), `next/font/google`, Playwright, Node test runner (`npm test`).

**Spec:** `docs/superpowers/specs/2026-09-04-marked-ak-golf-port-design.md`

## Global Constraints

- Kun `src/app/(marketing)/` og `src/components/marketing/` røres. `/stats/*`, `/booking/*` (åpen), `/portal`, `/admin`, `/forelder`, `/team-norway` røres ALDRI. Ingen `--ak-*` i produktskjermer.
- Ingen `--tl-*`-verdi endres. Ingen `--ak-*`-verdi kopieres inn i `src/` — de importeres fra `designsystem/ak-golf/tokens/`.
- `semantikk.css` importeres IKKE (fem navn kolliderer med produktet: `--font-display`, `--radius-card`, `--radius-pill`, `--text-faint`, `--text-muted`). `grunnlag.css` importeres IKKE rått (setter `body`/`h1`/`a` globalt) — den gjenskapes scopet under `.ak-marked`.
- Fonter: IBM Plex Sans Condensed 600/700, IBM Plex Sans 400/500/600, IBM Plex Mono 400/500. Kun på markedsflaten. Produktet beholder Poppins.
- Lys er standard. Ingen tema-bryter på markedsflaten (`tema-default.ts` låser landingssidene lyse).
- Aldri `any` i TypeScript. Aldri emoji. Ingen nye npm-avhengigheter.
- Språk: norsk bokmål. TrackMan-parametere på engelsk med stor forbokstav. MORAD nevnes aldri. Ingen sitater/vitnesbyrd. Ingen utropstegn i skjermtekst.
- Logo rendres alltid fra fil i `public/logos/` (masterens filnavn), aldri gjenskapt i markup.
- Hver PR: `npm run verify` grønt før merge. Skjermbilde 390 + 1440 fra Vercel-preview sendt i samtalen for hver side.
- Git: egen gren per PR fra `origin/main`, stage navngitte filer (aldri `git add -A`), commit-melding på norsk, `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` på slutten.

---

## Filstruktur

**Nye filer**
- `src/styles/ak-golf.css` — importerer masterens token-filer + scopet grunnlag. Eneste inngang.
- `src/styles/ak-golf-grunnlag.css` — `grunnlag.css` scopet under `.ak-marked`.
- `src/components/marketing/ak/Logo.tsx`, `Knapp.tsx`, `IkonKnapp.tsx`, `Merkelapp.tsx`, `Toppnav.tsx`, `Mobilmeny.tsx` — porter av masterens komponenter (PR 1). Senere: `Kort.tsx`, `Fotokort.tsx`, `Talleblokk.tsx`, `Faktarad.tsx`, `Instrumentflate.tsx`, `Maalestokk.tsx`, `Akkordeon.tsx`, `Ikon.tsx`, `Felt.tsx`, `TomTilstand.tsx` — i den side-PR-en som først trenger dem.
- `src/components/marketing/ak/index.ts` — samler eksportene.
- `src/lib/__tests__/marketing/ak-golf-css.test.ts` — vokter importlisten i `ak-golf.css`.
- `tests/e2e/marked-ak-golf.spec.ts` — røyk: rendrer uten konsollfeil, ingen horisontal overflow, 390 + 1440.

**Endrede filer**
- `src/app/(marketing)/layout.tsx` — laster fonter + `ak-golf.css`, wrapper `.ak-marked`.
- `src/app/globals.css` — én `@import` av `tailwind-theme.css`; `--mk-*`-verdier pekes om til `--ak-*` (bro, slettes i siste PR).
- `src/styles/marked-kit.css` — `--mkit-*` pekes om til `--ak-*` (bro, slettes i siste PR).
- `src/components/marketing/landing/MarkedNav.tsx`, `MarkedFot.tsx` — bygges om.
- `src/components/stats/stats-big-radar.tsx:139-140` — `--mk-olive` → `--ak-fag`.

---

## PR 1 — Fundamentet

### Task 1: Token-inngangen `ak-golf.css`

**Files:**
- Create: `src/styles/ak-golf.css`
- Create: `src/styles/ak-golf-grunnlag.css`
- Test: `src/lib/__tests__/marketing/ak-golf-css.test.ts`

**Interfaces:**
- Produces: CSS-variablene `--ak-*` (se `designsystem/ak-golf/tokens/*.css`) og klassene `.ak-marked`, `.ak-maalt`, `.ak-etikett`, `.ak-trykk`, `.ak-kommer`, `.ak-snurre`, `.ak-rutenett`. Alle senere tasks bruker disse.

- [ ] **Step 1: Skriv testen som vokter importlisten**

```ts
// src/lib/__tests__/marketing/ak-golf-css.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROT = path.resolve(import.meta.dirname, "../../../..");
const les = (p: string) => readFileSync(path.join(ROT, p), "utf8");

describe("ak-golf.css — masterens tokens inn på markedsflaten", () => {
  const css = les("src/styles/ak-golf.css");

  it("importerer token-filene i masterens rekkefølge, uten fonter/semantikk/grunnlag", () => {
    const imports = [...css.matchAll(/@import\s+"([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(imports, [
      "../../designsystem/ak-golf/tokens/farge.css",
      "../../designsystem/ak-golf/tokens/type.css",
      "../../designsystem/ak-golf/tokens/rom.css",
      "../../designsystem/ak-golf/tokens/bevegelse.css",
      "../../designsystem/ak-golf/tokens/instrument.css",
      "../../designsystem/ak-golf/tokens/samspill.css",
      "./ak-golf-grunnlag.css",
    ]);
  });

  it("kopierer ingen hex-verdi inn i src — tokens leses fra masteren", () => {
    assert.equal(/#[0-9a-fA-F]{6}\b/.test(css), false);
  });

  it("scopet grunnlag rører aldri body, html eller :root", () => {
    const g = les("src/styles/ak-golf-grunnlag.css");
    assert.equal(/^\s*(body|html|:root)\s*\{/m.test(g), false);
    assert.match(g, /\.ak-marked\s*\{/);
  });
});
```

- [ ] **Step 2: Kjør testen, se den feile**

Run: `npx tsx --test src/lib/__tests__/marketing/ak-golf-css.test.ts`
Expected: FAIL — `ENOENT … src/styles/ak-golf.css`

- [ ] **Step 3: Skriv `ak-golf.css`**

```css
/* src/styles/ak-golf.css
   AK Golf-merket på markedsflaten. ENESTE inngang — lastes av
   src/app/(marketing)/layout.tsx, aldri av globals.css.

   Token-filene importeres UENDRET fra masterens speil (designsystem/ak-golf/),
   generert fra tokens.json av scripts/ak-golf-tokens.mjs. Ingen verdi
   kopieres hit. Rekkefølgen er masterens (designsystem/ak-golf/styles.css).

   Utelatt med vilje:
   - fonter.css: Google-Fonts-@import. Fontene lastes med next/font i layouten.
   - semantikk.css: --text-muted, --font-display m.fl. kolliderer med produktet.
   - grunnlag.css: setter body/h1/a globalt. Gjenskapt scopet i ak-golf-grunnlag.css.

   Gjelder MERKET (marked). Produktskjermer bruker Train-lock (--tl-*). */

@import "../../designsystem/ak-golf/tokens/farge.css";
@import "../../designsystem/ak-golf/tokens/type.css";
@import "../../designsystem/ak-golf/tokens/rom.css";
@import "../../designsystem/ak-golf/tokens/bevegelse.css";
@import "../../designsystem/ak-golf/tokens/instrument.css";
@import "../../designsystem/ak-golf/tokens/samspill.css";
@import "./ak-golf-grunnlag.css";
```

- [ ] **Step 4: Skriv `ak-golf-grunnlag.css`** (innholdet i `designsystem/ak-golf/tokens/grunnlag.css`, scopet)

```css
/* src/styles/ak-golf-grunnlag.css
   designsystem/ak-golf/tokens/grunnlag.css scopet under .ak-marked.
   Masterens fil setter body/h1/a globalt — i Next er all CSS global og ville
   truffet /portal ved klientnavigasjon. Reglene er de samme, selektorene
   er prefikset. Endres masteren, endres denne. */

.ak-marked {
  background: var(--ak-grunn);
  color: var(--ak-tekst);
  font-family: var(--ak-sans);
  font-size: var(--ak-t-17);
  line-height: var(--ak-lh-normal);
  -webkit-font-smoothing: antialiased;
  text-wrap: pretty;
}

.ak-marked *,
.ak-marked *::before,
.ak-marked *::after { box-sizing: border-box }

.ak-marked h1, .ak-marked h2, .ak-marked h3, .ak-marked h4 {
  font-family: var(--ak-display);
  font-weight: var(--ak-v-700);
  letter-spacing: var(--ak-sp-titt);
  line-height: var(--ak-lh-tett);
  margin: 0;
}
.ak-marked h1 { font-size: var(--ak-t-48); letter-spacing: var(--ak-sp-display); line-height: var(--ak-lh-display) }
.ak-marked h2 { font-size: var(--ak-t-34) }
.ak-marked h3 { font-size: var(--ak-t-26) }
.ak-marked h4 { font-size: var(--ak-t-21) }
.ak-marked p { margin: 0; max-width: var(--ak-lesebredde) }

.ak-marked a { color: var(--ak-signal); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; transition: color var(--ak-fart-rask) var(--ak-kurve) }
.ak-marked a:hover { color: var(--ak-tekst); text-decoration-color: var(--ak-signal) }
.ak-marked a:active { color: var(--ak-signal-fyll) }

/* Fokusringen vinner over alt — eneste !important i systemet (12-bevegelse.md). */
.ak-marked :where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--ak-signal) !important;
  outline-offset: 2px !important;
  border-radius: 2px;
}

/* Alt som er målt. Mono, tabellsiffer, aldri kursiv. */
.ak-marked .ak-maalt {
  font-family: var(--ak-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'zero' 1;
}

/* Caps-etikett. Kun mono, kun tre ord eller mindre. */
.ak-marked .ak-etikett {
  font-family: var(--ak-mono);
  font-size: var(--ak-t-11);
  font-weight: var(--ak-v-500);
  letter-spacing: var(--ak-sp-vid);
  text-transform: uppercase;
  color: var(--ak-dempet);
}
.ak-marked[data-ak-flate="mork"] .ak-etikett { letter-spacing: var(--ak-sp-vidt) }

.ak-marked ::selection { background: var(--ak-signal); color: var(--ak-signal-tekst) }
```

- [ ] **Step 5: Kjør testen, se den passere**

Run: `npx tsx --test src/lib/__tests__/marketing/ak-golf-css.test.ts`
Expected: PASS, 3 tester.

- [ ] **Step 6: Lagre**

```bash
git add src/styles/ak-golf.css src/styles/ak-golf-grunnlag.css src/lib/__tests__/marketing/ak-golf-css.test.ts
git commit -m "feat(marked): AK Golf-tokens inn på markedsflaten — én inngang, importert fra masteren"
```

---

### Task 2: Fonter, skall-wrapper og Tailwind-klasser

**Files:**
- Modify: `src/app/(marketing)/layout.tsx`
- Modify: `src/app/globals.css` (én linje ved linje 678–687, ved de andre token-importene)

**Interfaces:**
- Produces: `<div className="ak-marked …">` rundt alt marked-innhold, med `--ak-display`, `--ak-sans`, `--ak-mono` satt til next/font-variablene. Tailwind-klasser `bg-ak-grunn`, `text-ak-tekst`, `font-ak-display`, `text-ak-17`, `p-ak-4`, `rounded-ak-sm` osv. (fra `tailwind-theme.css`).

- [ ] **Step 1: Legg Tailwind-temaet inn i globals.css**

Etter linjen `@import "../styles/team-norway-tokens.css";` (linje 686) legg til:

```css
/* AK Golf-merket (marked). Kun @theme-aliasene — selve --ak-*-verdiene lastes
 * av src/styles/ak-golf.css i (marketing)/layout.tsx, aldri her. Klassene er
 * ak-prefikset og kolliderer ikke med produktet. */
@import "../../designsystem/ak-golf/tokens/tailwind-theme.css";
```

- [ ] **Step 2: Skriv om markedslayouten**

Erstatt hele `src/app/(marketing)/layout.tsx` med:

```tsx
import { headers } from "next/headers";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";

import "@/styles/ak-golf.css";
import { PlausibleScript } from "@/components/marketing/plausible";
import { MarkedFot } from "@/components/marketing/landing/MarkedFot";
import { MarkedNav } from "@/components/marketing/landing/MarkedNav";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";

/**
 * TOPP-layout for markedssidene.
 *
 * Siden 04.09.2026 er fasiten AK Golf-masteren (`designsystem/ak-golf/`,
 * speil av Claude Design-prosjektet 3e5c851c). Layouten laster merkets
 * tokens (`ak-golf.css`) og fonter (IBM Plex-familien) og legger `.ak-marked`
 * rundt innholdet — alt under er merket, ingenting utenfor er det.
 * Spec: docs/superpowers/specs/2026-09-04-marked-ak-golf-port-design.md.
 *
 * Skallet (MarkedNav + MarkedFot) eies fortsatt her — ett skall for alle
 * landingssider (siden 20.08.2026, da fire ulike menyer ble målt på samme
 * nettsted).
 *
 * UNNTAK — flater som tegner sitt eget skall og ville fått DOBBELT her:
 *  - `/stats/*` (~45 ruter): eget produkt, egen mørk MRamme, egen bølge (W7).
 *  - `/booking` KUN når den innebygde bookingen er åpen: Train-lock-flate
 *    (Anders 28.08.2026) med egen topplinje. Pauset booking er en vanlig
 *    landingsside og får skallet.
 */

const plexCondensed = IBM_Plex_Sans_Condensed({
  variable: "--font-ak-display",
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-ak-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ak-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const FONT_KLASSER = `${plexCondensed.variable} ${plexSans.variable} ${plexMono.variable}`;

/* Masterens type.css setter --ak-display m.fl. med rene fontnavn. Her pekes de
 * til next/font-variablene, så fontene lastes selvhostet og uten layout-hopp. */
const FONT_VARS = {
  "--ak-display": "var(--font-ak-display), 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
  "--ak-sans": "var(--font-ak-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  "--ak-mono": "var(--font-ak-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
} as React.CSSProperties;

const EGET_SKALL = ["/stats"];

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = (await headers()).get("x-pathname") ?? "";
  const erBookingFlate = path === "/booking" || path.startsWith("/booking/");
  const harEgetSkall =
    EGET_SKALL.some((p) => path === p || path.startsWith(`${p}/`)) ||
    (erBookingFlate && (await kanBrukeInnebygdBooking()));

  if (harEgetSkall) {
    return (
      <>
        <PlausibleScript />
        {children}
      </>
    );
  }

  return (
    <>
      <PlausibleScript />
      <div
        className={`ak-marked ${FONT_KLASSER} flex min-h-screen flex-col`}
        style={FONT_VARS}
      >
        <MarkedNav />
        <main className="flex-1">{children}</main>
        <MarkedFot />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Sjekk at tsc og bygg går**

Run: `npx tsc --noEmit 2>&1 | tail -5`
Expected: ingen feil.

Run: `npm run dev` i bakgrunnen, åpne `http://localhost:3000/` og se i DevTools at `<div class="ak-marked …">` har `font-family` som starter med `__IBM_Plex_Sans_…` og at `getComputedStyle(document.querySelector('.ak-marked')).getPropertyValue('--ak-grunn')` gir `#E8E4DC`. Sjekk at `/portal` (innlogget) IKKE har `--ak-grunn` på `body` etter hard reload.

- [ ] **Step 4: Lagre**

```bash
git add "src/app/(marketing)/layout.tsx" src/app/globals.css
git commit -m "feat(marked): IBM Plex via next/font + .ak-marked-skall + Tailwind ak-*-klasser"
```

---

### Task 3: Komponentene skallet trenger (Logo, Knapp, IkonKnapp, Merkelapp, Toppnav, Mobilmeny)

**Files:**
- Create: `src/components/marketing/ak/Logo.tsx`
- Create: `src/components/marketing/ak/Knapp.tsx`
- Create: `src/components/marketing/ak/IkonKnapp.tsx`
- Create: `src/components/marketing/ak/Merkelapp.tsx`
- Create: `src/components/marketing/ak/Toppnav.tsx`
- Create: `src/components/marketing/ak/Mobilmeny.tsx`
- Create: `src/components/marketing/ak/index.ts`

**Interfaces:**
- Produces:
  - `Logo({ variant?: LogoVariant; hoyde?: number; klaring?: boolean; prioritet?: boolean })`
  - `Knapp({ variant?: "primaer" | "sekundaer" | "tekst"; storrelse?: "sm" | "md" | "lg"; pill?; fullBredde?; deaktivert?; laster?; ikon?; href?; onClick?; children })` — rendrer `next/link` når `href` starter med `/`.
  - `IkonKnapp({ merkelapp: string; variant?: "stille" | "fylt"; storrelse?: number; aktiv?; deaktivert?; onClick; children })`
  - `Merkelapp({ variant?: "junior" | "academy" | "hq" | "organisasjon" | "produkt" | "fag" | "noytral"; fylt?; children })`
  - `Toppnav({ lenker: Lenke[]; aktiv?: string; handling?: ReactNode; onMeny: () => void })` — `Lenke = { href: string; tekst: string }`
  - `Mobilmeny({ apen: boolean; lenker: Lenke[]; aktiv?: string; handling?: ReactNode; onLukk: () => void })`
- Kilde for hver: `designsystem/ak-golf/components/<kategori>/<Navn>.jsx` — samme props, samme inline-verdier. Avvik fra masteren: `<a>` → `next/link` for interne lenker, `<img>` → `next/image` med kjent bredde/høyde-forhold, `mobil`-prop erstattet av CSS-brekkpunkt der masteren bruker den til layout.

- [ ] **Step 1: Logo.tsx**

```tsx
import Image from "next/image";
import type { CSSProperties } from "react";

/* Logoen rendres ALLTID fra fil (public/logos/, masterens filnavn). Aldri
   gjenskapt i markup, aldri farget om. Kilde: components/merke/Logo.jsx. */

const FILER = {
  "primaer-lys": "ak-golf-logo-primary-on-light.svg",
  "primaer-mork": "ak-golf-logo-primary-on-dark.svg",
  "hvit-mork": "ak-golf-logo-white-on-dark.svg",
  "hvit-mono": "ak-golf-logo-white-mono.svg",
  "sort-mono": "ak-golf-logo-black-mono.svg",
  "signal-mono": "ak-golf-logo-primary-mono.svg",
  kvadrat: "ak-golf-merke-kvadrat.svg",
} as const;

export type LogoVariant = keyof typeof FILER;

/* Ligaturen er ca. 1,16:1 (bredde:høyde) i alle primær-filene; kvadratet er 1:1. */
const FORHOLD: Record<LogoVariant, number> = {
  "primaer-lys": 1.16,
  "primaer-mork": 1.16,
  "hvit-mork": 1.16,
  "hvit-mono": 1.16,
  "sort-mono": 1.16,
  "signal-mono": 1.16,
  kvadrat: 1,
};

export function Logo({
  variant = "primaer-lys",
  hoyde = 40,
  klaring = false,
  prioritet = false,
  style,
}: {
  variant?: LogoVariant;
  hoyde?: number;
  klaring?: boolean;
  prioritet?: boolean;
  style?: CSSProperties;
}) {
  const h = Math.max(hoyde, 24);
  return (
    <Image
      src={`/logos/${FILER[variant]}`}
      alt="AK Golf"
      width={Math.round(h * FORHOLD[variant])}
      height={h}
      priority={prioritet}
      style={{
        height: h,
        width: "auto",
        display: "block",
        flex: "0 0 auto",
        maxWidth: "100%",
        objectFit: "contain",
        padding: klaring ? h / 2 : 0,
        ...style,
      }}
    />
  );
}
```

- [ ] **Step 2: Knapp.tsx**

```tsx
"use client";

import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/* Hover, trykk og snurre ligger i tokens/samspill.css (.ak-trykk) — ikke her.
   Kilde: components/handling/Knapp.jsx. */

type Variant = "primaer" | "sekundaer" | "tekst";
type Storrelse = "sm" | "md" | "lg";

const BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--ak-r-2)",
  fontFamily: "var(--ak-sans)",
  fontWeight: "var(--ak-v-500)" as CSSProperties["fontWeight"],
  lineHeight: 1,
  border: "1px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  minHeight: "var(--ak-treff)",
};

const STORRELSER: Record<Storrelse, CSSProperties> = {
  sm: { fontSize: "var(--ak-t-15)", padding: "0 var(--ak-r-4)", minHeight: 36 },
  md: { fontSize: "var(--ak-t-17)", padding: "0 var(--ak-r-5)" },
  lg: { fontSize: "var(--ak-t-21)", padding: "0 var(--ak-r-6)", minHeight: 56 },
};

/* Hviletilstand inline; hover-verdiene sendes som custom properties som
   samspill.css leser. Hver farge finnes fortsatt bare ett sted. */
type ToneStil = CSSProperties & Record<`--ak-h-${"bg" | "kant" | "tekst"}`, string>;

const TONER: Record<Variant, ToneStil> = {
  primaer: {
    background: "var(--ak-signal-fyll)",
    color: "var(--ak-signal-tekst)",
    borderColor: "transparent",
    "--ak-h-bg": "var(--ak-signal)",
    "--ak-h-kant": "transparent",
    "--ak-h-tekst": "var(--ak-signal-tekst)",
  },
  sekundaer: {
    background: "transparent",
    color: "var(--ak-tekst)",
    borderColor: "var(--ak-linje-hard)",
    "--ak-h-bg": "var(--ak-grunn-senk)",
    "--ak-h-kant": "var(--ak-linje-hard)",
    "--ak-h-tekst": "var(--ak-tekst)",
  },
  tekst: {
    background: "transparent",
    color: "var(--ak-signal)",
    borderColor: "transparent",
    padding: "0 var(--ak-r-2)",
    textDecoration: "underline",
    textDecorationThickness: 1,
    textUnderlineOffset: 4,
    "--ak-h-bg": "transparent",
    "--ak-h-kant": "transparent",
    "--ak-h-tekst": "var(--ak-tekst)",
  },
};

export function Knapp({
  variant = "primaer",
  storrelse = "md",
  pill = false,
  fullBredde = false,
  deaktivert = false,
  laster = false,
  ikon,
  href,
  onClick,
  children,
  className,
  style,
  type = "button",
}: {
  variant?: Variant;
  storrelse?: Storrelse;
  pill?: boolean;
  fullBredde?: boolean;
  deaktivert?: boolean;
  laster?: boolean;
  ikon?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  const av = deaktivert || laster;
  const s: CSSProperties = {
    ...BASE,
    ...STORRELSER[storrelse],
    ...TONER[variant],
    borderRadius: pill ? "var(--ak-hjorne-pill)" : "var(--ak-hjorne-sm)",
    width: fullBredde ? "100%" : undefined,
    opacity: av ? 0.42 : 1,
    cursor: av ? "not-allowed" : "pointer",
    ...style,
  };
  const klasse = ["ak-trykk", className].filter(Boolean).join(" ");
  const innhold = (
    <>
      {laster ? <span className="ak-snurre" aria-hidden="true" /> : ikon}
      {children}
    </>
  );

  if (href && !av) {
    const Tag = href.startsWith("/") ? Link : "a";
    return (
      <Tag
        href={href}
        style={s}
        className={klasse}
        data-ak-variant={variant}
        onClick={onClick}
      >
        {innhold}
      </Tag>
    );
  }
  return (
    <button
      type={type}
      style={s}
      className={klasse}
      data-ak-variant={variant}
      disabled={av}
      aria-disabled={av || undefined}
      aria-busy={laster || undefined}
      onClick={av ? undefined : onClick}
    >
      {innhold}
    </button>
  );
}
```

- [ ] **Step 3: IkonKnapp.tsx**

```tsx
"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/* Kilde: components/handling/IkonKnapp.jsx. */

type ToneStil = CSSProperties & Record<`--ak-h-${"bg" | "kant" | "tekst"}`, string>;

export function IkonKnapp({
  merkelapp,
  variant = "stille",
  storrelse = 44,
  aktiv = false,
  deaktivert = false,
  onClick,
  children,
  className,
  style,
}: {
  merkelapp: string;
  variant?: "stille" | "fylt";
  storrelse?: number;
  aktiv?: boolean;
  deaktivert?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const tone: ToneStil =
    variant === "fylt"
      ? {
          background: "var(--ak-signal-fyll)",
          color: "var(--ak-signal-tekst)",
          borderColor: "transparent",
          "--ak-h-bg": "var(--ak-signal)",
          "--ak-h-kant": "transparent",
          "--ak-h-tekst": "var(--ak-signal-tekst)",
        }
      : {
          background: aktiv ? "var(--ak-grunn-senk)" : "transparent",
          color: "var(--ak-tekst)",
          borderColor: aktiv ? "var(--ak-linje-hard)" : "var(--ak-linje)",
          "--ak-h-bg": "var(--ak-grunn-senk)",
          "--ak-h-kant": "var(--ak-linje-hard)",
          "--ak-h-tekst": "var(--ak-tekst)",
        };
  return (
    <button
      type="button"
      aria-label={merkelapp}
      aria-pressed={aktiv || undefined}
      disabled={deaktivert}
      aria-disabled={deaktivert || undefined}
      onClick={onClick}
      className={["ak-trykk", className].filter(Boolean).join(" ")}
      style={{
        width: storrelse,
        height: storrelse,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--ak-hjorne-sm)",
        cursor: deaktivert ? "not-allowed" : "pointer",
        border: "1px solid transparent",
        opacity: deaktivert ? 0.42 : 1,
        ...tone,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Merkelapp.tsx**

```tsx
import type { CSSProperties, ReactNode } from "react";

/* Kilde: components/melding/Merkelapp.jsx. */

const VARIANTFARGER = {
  junior: "var(--ak-v-junior)",
  academy: "var(--ak-signal)",
  hq: "var(--ak-v-hq)",
  organisasjon: "var(--ak-v-org)",
  produkt: "var(--ak-v-produkt)",
  fag: "var(--ak-fag)",
  noytral: "var(--ak-dempet)",
} as const;

export type MerkelappVariant = keyof typeof VARIANTFARGER;

export function Merkelapp({
  variant = "noytral",
  fylt = false,
  children,
  style,
}: {
  variant?: MerkelappVariant;
  fylt?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const farge = VARIANTFARGER[variant];
  return (
    <span
      className="ak-maalt"
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 var(--ak-r-2)",
        fontSize: "var(--ak-t-11)",
        fontWeight: "var(--ak-v-500)" as CSSProperties["fontWeight"],
        letterSpacing: "var(--ak-sp-vid)",
        textTransform: "uppercase",
        borderRadius: "var(--ak-hjorne-sm)",
        border: `1px solid ${fylt ? "transparent" : farge}`,
        background: fylt ? farge : "transparent",
        color: fylt ? "#FFFFFF" : farge,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Toppnav.tsx** (masterens `mobil`-prop erstattet av Tailwind-brekkpunkt `md` = 768, masterens `--ak-bp-tablet`)

```tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { IkonKnapp } from "./IkonKnapp";
import { Logo } from "./Logo";

/* Kilde: components/navigasjon/Toppnav.jsx. Lys variant (marked er lys).
   Høyde 80 på Mac, 64 på mobil. Aktiv lenke får 2 px signal-strek nederst. */

export type Lenke = { href: string; tekst: string };

export function Toppnav({
  lenker,
  aktiv,
  handling,
  onMeny,
}: {
  lenker: Lenke[];
  aktiv?: string;
  handling?: ReactNode;
  onMeny: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "var(--ak-grunn)",
        borderBottom: "1px solid var(--ak-linje)",
      }}
    >
      <div
        className="mx-auto flex h-16 items-center gap-ak-6 px-ak-4 md:h-20 md:px-ak-6"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <Link
          href="/"
          aria-label="AK Golf, til forsiden"
          style={{ display: "block", textDecoration: "none", flex: "0 0 auto" }}
        >
          {/* Masteren: 26 px på mobil, 32 på Mac. To instanser, én synlig. */}
          <span className="md:hidden"><Logo hoyde={26} prioritet /></span>
          <span className="hidden md:block"><Logo hoyde={32} prioritet /></span>
        </Link>

        <nav className="hidden flex-1 gap-ak-5 md:flex" aria-label="Hovedmeny">
          {lenker.map((l) => {
            const her = l.href === aktiv;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={her ? "page" : undefined}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  height: 80,
                  fontSize: "var(--ak-t-15)",
                  fontWeight: 500,
                  color: her ? "var(--ak-tekst)" : "var(--ak-dempet)",
                  textDecoration: "none",
                }}
              >
                {l.tekst}
                {her && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -1,
                      height: 2,
                      background: "var(--ak-signal)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <span className="flex-1 md:hidden" />
        <div className="hidden md:block">{handling}</div>
        <div className="md:hidden">
          <IkonKnapp merkelapp="Åpne meny" onClick={onMeny}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </IkonKnapp>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Mobilmeny.tsx**

```tsx
"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import { IkonKnapp } from "./IkonKnapp";
import { Logo } from "./Logo";
import type { Lenke } from "./Toppnav";

/* Kilde: components/navigasjon/Mobilmeny.jsx. Masteren bruker position:absolute
   inne i en relativ ramme; her er den fixed under sticky-headeren (64 px) og
   låser dokumentrullen mens den er åpen — samme oppførsel som dagens
   MarkedNav, som var laget for nettopp det. */

export function Mobilmeny({
  apen,
  lenker,
  aktiv,
  handling,
  onLukk,
}: {
  apen: boolean;
  lenker: Lenke[];
  aktiv?: string;
  handling?: ReactNode;
  onLukk: () => void;
}) {
  useEffect(() => {
    document.documentElement.style.overflow = apen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [apen]);

  if (!apen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meny"
      className="ak-kommer fixed inset-0 z-40 flex flex-col md:hidden"
      style={{ background: "var(--ak-grunn)" }}
    >
      <div
        className="flex h-16 items-center justify-between px-ak-4"
        style={{ borderBottom: "1px solid var(--ak-linje)" }}
      >
        <Logo hoyde={26} />
        <IkonKnapp merkelapp="Lukk meny" onClick={onLukk}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </IkonKnapp>
      </div>
      <nav className="flex flex-1 flex-col py-ak-4" aria-label="Hovedmeny">
        {lenker.map((l) => {
          const her = l.href === aktiv;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onLukk}
              aria-current={her ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--ak-r-3)",
                minHeight: 56,
                padding: "0 var(--ak-r-4)",
                textDecoration: "none",
                borderBottom: "1px solid var(--ak-linje)",
                fontFamily: "var(--ak-display)",
                fontWeight: 600,
                fontSize: "var(--ak-t-26)",
                letterSpacing: "var(--ak-sp-titt)",
                color: "var(--ak-tekst)",
              }}
            >
              {her && <span aria-hidden="true" style={{ width: 3, height: 24, background: "var(--ak-signal)" }} />}
              {l.tekst}
            </Link>
          );
        })}
      </nav>
      {handling && <div className="p-ak-4">{handling}</div>}
    </div>
  );
}
```

- [ ] **Step 7: index.ts**

```ts
export { Logo, type LogoVariant } from "./Logo";
export { Knapp } from "./Knapp";
export { IkonKnapp } from "./IkonKnapp";
export { Merkelapp, type MerkelappVariant } from "./Merkelapp";
export { Toppnav, type Lenke } from "./Toppnav";
export { Mobilmeny } from "./Mobilmeny";
```

- [ ] **Step 8: tsc + lint**

Run: `npx tsc --noEmit 2>&1 | tail -5 && npx eslint --quiet src/components/marketing/ak`
Expected: ingen feil. Vanlig felle: `fontWeight: "var(--ak-v-500)"` krever cast, som vist; `--ak-h-*` custom properties krever `ToneStil`-typen, som vist.

- [ ] **Step 9: Lagre**

```bash
git add src/components/marketing/ak
git commit -m "feat(marked): masterens Logo, Knapp, IkonKnapp, Merkelapp, Toppnav og Mobilmeny portet til TSX"
```

---

### Task 4: Skallet — MarkedNav og MarkedFot etter kitet

**Files:**
- Modify: `src/components/marketing/landing/MarkedNav.tsx` (hele fila)
- Modify: `src/components/marketing/landing/MarkedFot.tsx` (hele fila)

**Interfaces:**
- Consumes: `Toppnav`, `Mobilmeny`, `Knapp`, `Logo`, `Merkelapp` fra `@/components/marketing/ak`.
- Produces: `MarkedNav()` og `MarkedFot()` uten props, som før — layouten er uendret.

- [ ] **Step 1: MarkedNav.tsx**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { Knapp, Mobilmeny, Toppnav, type Lenke } from "@/components/marketing/ak";

/**
 * MarkedNav — ENESTE header på landingssidene.
 *
 * Fasit: `Toppnav` + `Mobilmeny` i AK Golf-masteren, brukt slik
 * `ui_kits/markedsside/Deler.jsx` bruker dem. Fem lenker og ÉN handling —
 * «Book kartleggingsøkt» — som gjentas med samme ord i toppnav, hero og
 * avslutning (kitets README). «Logg inn» ligger i bunnen, ikke her: menyen
 * skal selge én ting.
 */

const LENKER: Lenke[] = [
  { href: "/coaching", tekst: "Coaching" },
  { href: "/junior", tekst: "Junior" },
  { href: "/priser", tekst: "Priser" },
  { href: "/om-oss", tekst: "Om oss" },
  { href: "/kontakt", tekst: "Kontakt" },
];

export function MarkedNav() {
  const [apen, setApen] = useState(false);
  const sti = usePathname();
  const aktiv = LENKER.find((l) => sti === l.href || sti.startsWith(`${l.href}/`))?.href;
  const handling = (
    <Knapp storrelse="sm" href="/booking">
      Book kartleggingsøkt
    </Knapp>
  );

  return (
    <>
      <Toppnav lenker={LENKER} aktiv={aktiv} handling={handling} onMeny={() => setApen(true)} />
      <Mobilmeny
        apen={apen}
        lenker={LENKER}
        aktiv={aktiv}
        onLukk={() => setApen(false)}
        handling={
          <Knapp fullBredde href="/booking" onClick={() => setApen(false)}>
            Book kartleggingsøkt
          </Knapp>
        }
      />
    </>
  );
}
```

- [ ] **Step 2: MarkedFot.tsx** (kitets `Bunn`, utvidet med lovpålagte lenker og innlogging — kitet har bare tre sider, HQ har over tjue)

```tsx
import Link from "next/link";

import { Logo, Merkelapp } from "@/components/marketing/ak";

/**
 * MarkedFot — ENESTE footer på landingssidene.
 *
 * Fasit: `Bunn` i `ui_kits/markedsside/Deler.jsx` (tre kolonner: merke,
 * Tilbud, Kontakt). Kitet har tre sider; HQ har over tjue, og vilkår,
 * personvern og cookies MÅ være nåbare — derfor en fjerde kolonne «Mer» og
 * en juridisk rad nederst. Ingenting annet er endret fra kitet.
 */

const TILBUD = [
  { href: "/coaching", tekst: "Coaching" },
  { href: "/junior", tekst: "Junior Academy" },
  { href: "/priser", tekst: "Priser" },
  { href: "/kontakt", tekst: "Kontakt" },
];

const MER = [
  { href: "/playerhq", tekst: "AK Golf HQ" },
  { href: "/mulligan", tekst: "Mulligan Indoor Golf" },
  { href: "/coacher", tekst: "Coacher" },
  { href: "/anlegg", tekst: "Anlegg" },
  { href: "/treningsfilosofi", tekst: "Slik trener vi" },
  { href: "/turneringer", tekst: "Turneringer" },
  { href: "/blogg", tekst: "Blogg" },
  { href: "/faq", tekst: "Spørsmål og svar" },
  { href: "/jobb", tekst: "Jobb hos oss" },
  { href: "/auth/login", tekst: "Logg inn" },
];

const JURIDISK = [
  { href: "/vilkar", tekst: "Vilkår" },
  { href: "/personvern", tekst: "Personvern" },
  { href: "/cookies", tekst: "Informasjonskapsler" },
];

const lenkeStil = { fontSize: "var(--ak-t-15)", color: "var(--ak-tekst)", textDecoration: "none" } as const;

export function MarkedFot() {
  return (
    <footer style={{ borderTop: "1px solid var(--ak-linje)", background: "var(--ak-grunn)" }}>
      <div
        className="mx-auto grid gap-ak-6 px-ak-4 py-ak-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-ak-6 md:py-ak-7"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <div>
          <Logo hoyde={32} />
          <p style={{ marginTop: "var(--ak-r-4)", fontSize: "var(--ak-t-15)", color: "var(--ak-dempet)", maxWidth: "34ch" }}>
            AK Golf Academy drives av Anders Kristiansen — golfcoach, sportssjef i Gamle Fredrikstad Golfklubb og coach ved WANG Toppidrett Fredrikstad.
          </p>
          <div className="mt-ak-4 flex flex-wrap gap-ak-2">
            <Merkelapp variant="junior">Junior Academy</Merkelapp>
            <Merkelapp variant="hq">AK Golf HQ</Merkelapp>
            <Merkelapp variant="produkt">Skarpnord</Merkelapp>
          </div>
        </div>

        <nav className="flex flex-col gap-ak-3" aria-label="Tilbud">
          <span className="ak-etikett">Tilbud</span>
          {TILBUD.map((l) => (
            <Link key={l.href} href={l.href} style={lenkeStil}>{l.tekst}</Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-ak-3" aria-label="Mer">
          <span className="ak-etikett">Mer</span>
          {MER.map((l) => (
            <Link key={l.href} href={l.href} style={lenkeStil}>{l.tekst}</Link>
          ))}
        </nav>

        <div className="flex flex-col gap-ak-3">
          <span className="ak-etikett">Kontakt</span>
          <a href="mailto:post@akgolf.no" className="ak-maalt" style={{ fontSize: "var(--ak-t-15)", color: "var(--ak-tekst)", textDecoration: "none" }}>
            post@akgolf.no
          </a>
          <span style={{ fontSize: "var(--ak-t-15)", color: "var(--ak-dempet)" }}>Vi svarer innen én virkedag.</span>
          <span style={{ fontSize: "var(--ak-t-13)", color: "var(--ak-svak)" }}>Gamle Fredrikstad GK, Fredrikstad</span>
        </div>
      </div>

      <div
        className="mx-auto flex flex-col gap-ak-3 px-ak-4 pb-ak-5 md:flex-row md:items-center md:justify-between md:px-ak-6"
        style={{ maxWidth: "var(--ak-sidebredde)", fontSize: "var(--ak-t-13)", color: "var(--ak-dempet)" }}
      >
        <span>AK Golf Group AS</span>
        <div className="flex flex-wrap gap-x-ak-5 gap-y-ak-2">
          {JURIDISK.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "var(--ak-dempet)", textDecoration: "none" }}>{l.tekst}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

E-postadressen: kitet skriver `post@akgolf.no`, dagens footer `akgolfgroup@gmail.com`. **Sjekk med Anders hvilken som er i drift før merge** — bruk kitets inntil svar, og noter i PR-teksten.

- [ ] **Step 3: Se det**

Run: `npm run dev`, åpne `/`, `/coaching`, `/vilkar` på 390 og 1440. Meny åpner/lukker, aktiv lenke får rød strek, bunnen har fire kolonner på Mac og én på mobil. Ingen konsollfeil.

- [ ] **Step 4: Lagre**

```bash
git add src/components/marketing/landing/MarkedNav.tsx src/components/marketing/landing/MarkedFot.tsx
git commit -m "feat(marked): skallet etter kitet — Toppnav/Mobilmeny med fem lenker og én handling, Bunn med fire kolonner"
```

---

### Task 5: Broen — gamle tokens peker på masteren til sidene er portert

**Files:**
- Modify: `src/app/globals.css:290-316` (`--mk-*`-blokken)
- Modify: `src/styles/marked-kit.css:44-102` (`--mkit-*`-blokken)
- Modify: `src/components/stats/stats-big-radar.tsx:139-140`
- Test: `tests/e2e/marked-ak-golf.spec.ts`

**Interfaces:**
- Produces: alle 22 sider viser verkstedpaletten og IBM Plex uten at sidekoden er rørt. Broen SLETTES i Task 8.

- [ ] **Step 1: Skriv røyktesten**

```ts
// tests/e2e/marked-ak-golf.spec.ts
import { expect, test } from "@playwright/test";

import { expectNoConsoleErrors, gotoAndWait } from "./_helpers";

/**
 * Markedsflaten på AK Golf-masteren: hver side rendrer uten konsollfeil,
 * uten horisontal overflow, med merkets grunnfarge og font, på 390 og 1440.
 * Mønster: scripts/check-ak-golf-kits.mjs (samme måling på kitene).
 * Utvid SIDER etter hvert som sider porteres — alle 22 skal stå her til slutt.
 */

const SIDER = ["/", "/coaching", "/junior", "/priser", "/om-oss", "/kontakt", "/vilkar"];
const BREDDER = [390, 1440] as const;

for (const sti of SIDER) {
  for (const bredde of BREDDER) {
    test(`${sti} på ${bredde}: masterens palett, ingen overflow`, async ({ page }) => {
      await page.setViewportSize({ width: bredde, height: 900 });
      const stopp = expectNoConsoleErrors(page);
      await gotoAndWait(page, sti);

      const skall = page.locator(".ak-marked").first();
      await expect(skall).toBeVisible();

      const maalt = await skall.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          grunn: cs.getPropertyValue("--ak-grunn").trim().toUpperCase(),
          font: cs.fontFamily,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      expect(maalt.grunn).toBe("#E8E4DC");
      expect(maalt.font).toMatch(/IBM_Plex_Sans|IBM Plex Sans/);
      expect(maalt.overflow).toBe(false);
      stopp();
    });
  }
}
```

- [ ] **Step 2: Kjør den, se hva som feiler**

Run: `npx playwright test tests/e2e/marked-ak-golf.spec.ts --project=chromium`
Expected: `--ak-grunn` og font passerer allerede (Task 2). Overflow kan feile på sider der gammelt innhold ikke tåler nytt skall — noter, rett i side-PR-en, ikke her. Målet med testen nå er å låse skall og tokens.

- [ ] **Step 3: Pek `--mk-*` på masteren** (erstatt linje 290–316 i `globals.css`)

```css
  /* BRO (04.09.2026): --mk-* peker på AK Golf-masteren til hver markedsside er
   * portert til --ak-* direkte. Blokken SLETTES i siste PR i
   * docs/superpowers/plans/2026-09-04-marked-ak-golf-port.md. Ikke bygg nytt mot --mk-*. */
  --mk-bg: var(--ak-grunn);
  --mk-surface: var(--ak-ark);
  --mk-soft: var(--ak-grunn-senk);
  --mk-soft-hover: var(--ak-linje);
  --mk-border: var(--ak-linje);
  --mk-hairline: var(--ak-linje-hard);
  --mk-inverse: var(--ak-tekst);

  --mk-fg: var(--ak-tekst);
  --mk-ink-soft: var(--ak-dempet);
  --mk-muted: var(--ak-dempet);
  --mk-mid: var(--ak-svak);

  --mk-ink: var(--ak-tekst);
  --mk-ink-2: var(--ak-tekst);

  --mk-cta: var(--ak-signal-fyll);
  --mk-on-cta: var(--ak-signal-tekst);
  --mk-cta-hover: var(--ak-signal);

  --mk-accent: var(--ak-signal);
  --mk-accent-fg: var(--ak-signal);
  --mk-accent-soft: var(--ak-signal-myk);

  --mk-olive: var(--ak-fag);
  --mk-sky: var(--ak-v-hq);
```

og `--font-mk-serif` (linje 343) til `var(--ak-sans)`. `--mk-*` leses på `:root` mens `--ak-*` også står på `:root` (fra `farge.css`) — broen virker på markedsflaten. På `/stats` (utenfor `.ak-marked`, men `ak-golf.css` er lastet av samme layout) virker den også.

- [ ] **Step 4: Pek `--mkit-*` på masteren** (erstatt verdiene linje 44–102 i `marked-kit.css`, behold navnene)

```css
  --mkit-bg: var(--ak-grunn);
  --mkit-surface: var(--ak-ark);
  --mkit-soft: var(--ak-grunn-senk);
  --mkit-soft-hover: var(--ak-linje);
  --mkit-surface-warm: var(--ak-grunn-senk);
  --mkit-border: var(--ak-linje);
  --mkit-hairline: var(--ak-linje-hard);
  --mkit-inverse: var(--ak-tekst);
  --mkit-fg: var(--ak-tekst);
  --mkit-ink-soft: var(--ak-dempet);
  --mkit-muted: var(--ak-dempet);
  --mkit-mid: var(--ak-svak);
  --mkit-text-tertiary: var(--ak-dempet);
  --mkit-cta: var(--ak-signal-fyll);
  --mkit-on-cta: var(--ak-signal-tekst);
  --mkit-cta-hover: var(--ak-signal);
  --mkit-accent: var(--ak-signal);
  --mkit-accent-soft: var(--ak-signal-myk);
  --mkit-accent-fg: var(--ak-signal);
  --mkit-on-accent: var(--ak-signal-tekst);
  --mkit-up: var(--ak-ok);
  --mkit-dn: var(--ak-feil);
  --mkit-info: var(--ak-v-hq);
  --mkit-shadow: var(--ak-loft-2);
  --mkit-focus: var(--ak-signal);
  --mkit-logo-mark: var(--ak-tekst);
  --mkit-logo-dot: var(--ak-signal);
  --mkit-accent-deep: var(--ak-signal-fyll);
  /* … */
  --mkit-ui: var(--ak-sans);
  --mkit-disp: var(--ak-display);
  --mkit-body: var(--ak-sans);
  --mkit-mono: var(--ak-mono);
  /* typeskala */
  --mkit-text-hero: var(--ak-t-hero);
  --mkit-text-section: var(--ak-t-seksjon);
  --mkit-text-prose-lg: var(--ak-t-21);
  --mkit-text-prose: var(--ak-t-17);
  --mkit-text-nav: var(--ak-t-15);
  --mkit-text-eyebrow: var(--ak-t-11);
  /* rom: s1–s9 = --ak-r-1 … --ak-r-9 (identiske tall, pek likevel) */
  --mkit-s1: var(--ak-r-1); --mkit-s2: var(--ak-r-2); --mkit-s3: var(--ak-r-3);
  --mkit-s4: var(--ak-r-4); --mkit-s5: var(--ak-r-5); --mkit-s6: var(--ak-r-6);
  --mkit-s7: var(--ak-r-7); --mkit-s8: var(--ak-r-8); --mkit-s9: var(--ak-r-9);
  --mkit-r: var(--ak-hjorne-md);
  --mkit-r-md: var(--ak-hjorne-lg);
  --mkit-r-pill: var(--ak-hjorne-pill);
```

Linjene mellom (kommentarer, evt. andre `--mkit-*` som ikke står i listen over — det er 53 navn totalt) beholdes; sjekk med `grep -oE -e '--mkit-[a-z0-9-]+:' src/styles/marked-kit.css | sort -u` at hver får en `var(--ak-…)`-verdi eller er bevisst uendret (kun tall som `--mkit-…-lh`).

- [ ] **Step 5: stats-big-radar** — bytt `var(--mk-olive)` (to steder, linje 139–140) til `var(--ak-fag)`. Fila ligger under `/stats`, som laster samme layout, så `--ak-fag` finnes. Noter i MASTERPLAN 18.33 at W7 skal gi stats sin egen verdi.

- [ ] **Step 6: Kjør røyk + verify**

Run: `npx playwright test tests/e2e/marked-ak-golf.spec.ts --project=chromium`
Expected: PASS på alle 14.

Run: `npm run verify > "$SCRATCH/verify.log" 2>&1; tail -30 "$SCRATCH/verify.log"`
Expected: grønt. Faller `check-token-gap.mjs` på IBM Plex Sans (den vokter Poppins/Lora/Mono som eneste fonter): utvid vakten med de to nye Plex-familiene **kun for filer under `src/app/(marketing)/`** og skriv hvorfor i vaktens kommentar — ikke skru den av.

- [ ] **Step 7: Lagre**

```bash
git add src/app/globals.css src/styles/marked-kit.css src/components/stats/stats-big-radar.tsx tests/e2e/marked-ak-golf.spec.ts
git commit -m "feat(marked): bro fra --mk-*/--mkit-* til masteren + røyktest på 390/1440"
```

---

### Task 6: PR 1 ut, registrering i MASTERPLAN og beslutninger

**Files:**
- Modify: `docs/MASTERPLAN-GJENSTAAENDE.md` (STEG 18: ny rad 18.33)
- Modify: `.claude/rules/beslutninger.md` (ny beslutning øverst under «september 2026»)
- Modify: `docs/STATUS-NÅ.md`

- [ ] **Step 1: Skjermbilder** — Vercel-preview av grenen: `/`, `/coaching`, `/vilkar` på 390 og 1440. Send i samtalen med `SendUserFile`. Si tydelig at innholdet på sidene fortsatt er gammelt; det er skall + palett + font som er nytt.

- [ ] **Step 2: Kjør `/beslutning`** med denne teksten:

> **MARKEDSSIDENE PORTERES TIL MASTER AK GOLF — ALLE 22, FULL PORT (Anders 04.09.2026, i økt):** de 22 markedssidene under `src/app/(marketing)/` bygges om til AK Golf-masteren (`designsystem/ak-golf/`): verkstedpalett, IBM Plex, instrumentlag, masterens komponenter. Anders valgte full port framfor fargebytte og hybrid. Rekkefølge og løkke: `docs/superpowers/specs/2026-09-04-marked-ak-golf-port-design.md` + `docs/superpowers/plans/2026-09-04-marked-ak-golf-port.md`. **Utenfor:** `/stats/*` (W7), `/booking` åpen (Train-lock, 28.08), produktet (invariant 2, «tokens aldri» 03.09). Lys er standard; ingen bryter. Forside-konflikten (Reisen vs kitet) avgjøres når Anders ser begge. `ak-golf-website` er ikke lenger fasit for landingssidene — masteren er. **Arbeidet:** MASTERPLAN STEG 18.33.

MASTERPLAN-raden 18.33 skal ha side-tabellen fra spec §3 som sjekkliste med «Ikke startet» per rad, og lenke til planen.

- [ ] **Step 3: PR** via `/pr` (krever grønn verify). Tittel: `feat(marked): Master AK Golf inn på markedsflaten — fundament (tokens, fonter, skall, bro)`. Kropp: hva som er nytt, hva som bevisst er gammelt, e-postspørsmålet fra Task 4, `check-token-gap`-utvidelsen hvis gjort. Avslutt med `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

- [ ] **Step 4: `pr-review-toolkit`** på PR-en, rett funn, merge, slett gren.

---

## PR 2–19 — Én side om gangen

### Task 7 (gjentas per rad i tabellen under): Port av én side

Kjøres 18 ganger. Rekkefølgen er bindende (spec §3). Hver runde er egen gren fra `origin/main` og egen PR.

| Runde | Side(r) | Kilde | Nye komponenter som må portes først |
|---|---|---|---|
| 1 | `/` | `ui_kits/markedsside/Deler.jsx` | Kort, Fotokort, Talleblokk, Faktarad, Instrumentflate, Maalestokk, Akkordeon |
| 2 | `/junior` | `ui_kits/markedsside/JuniorDeler.jsx` | (sjekk JuniorDeler for flere) |
| 3 | `/coaching` | canvas | — |
| 4 | `/priser` | canvas | Tabell |
| 5 | `/om-oss` | canvas | Initialer |
| 6 | `/kontakt` | canvas | Felt, Velger, Avkrysning |
| 7 | `/coacher`, `/coacher/[slug]` | canvas | — |
| 8 | `/anlegg`, `/anlegg/[slug]` | canvas | — |
| 9 | `/turneringer`, `/turneringer/[slug]` | canvas | Tabell, Paginering, Faner |
| 10 | `/blogg`, `/blogg/[slug]` | canvas + `ui_kits/dokument/brevark.html` | Brodsmuler |
| 11 | `/playerhq` | canvas | — |
| 12 | `/mulligan` | canvas | — |
| 13 | `/treningsfilosofi` | canvas | — |
| 14 | `/cases` | **beslutning først** (sitatforbudet 01.09) | — |
| 15 | `/faq` | canvas | Akkordeon |
| 16 | `/jobb` | canvas | — |
| 17 | `/suksess` | canvas | TomTilstand |
| 18 | `/cookies`, `/personvern`, `/vilkar` | `ui_kits/dokument/brevark.html` | Brodsmuler |

**Files (per runde):**
- Create: `designsystem/canvas/marked-<side>/Main.dc.html`, `Mobil.dc.html`, `canvas.json` (hopp over i runde 1–2: kitet er tegningen)
- Create: `src/components/marketing/ak/<Komponent>.tsx` for hver ny komponent i kolonnen over — portert fra `designsystem/ak-golf/components/<kategori>/<Komponent>.jsx` med samme props (typer fra `.d.ts` ved siden av), lagt til i `index.ts`
- Create: `src/components/marketing/ak-sider/<Side>AK.tsx` — sidens seksjoner (mønster: én fil per side, seksjoner som funksjoner i fila, som kitets `Deler.jsx`)
- Modify: `src/app/(marketing)/<side>/page.tsx` — bytt import til den nye komponenten. Behold `metadata`, dataloadere og `generateStaticParams` uendret.
- Delete: den gamle `Marked<Side>V2.tsx` **i samme PR** når ingen andre importerer den (`grep -rn "Marked<Side>V2" src`).
- Modify: `tests/e2e/marked-ak-golf.spec.ts` — legg sidens sti(er) i `SIDER`.

**Interfaces:**
- Consumes: alt i `@/components/marketing/ak`, tokens `--ak-*`, klasser `ak-*`.
- Produces: `<Side>AK()` som rendrer hele siden under skallet. Dataloaderne i `page.tsx` sender samme props som før til den nye komponenten — les den gamle komponentens props-type og gjenbruk den ordrett.

- [ ] **Step 1: Les kildene.** Den gamle komponenten (props, hvilke data siden får), `designsystem/ak-golf/guidelines/tekstkonsept.md` for siden (runde 1–6) eller dagens tekst (runde 7–18), `guidelines/10-forbudt.md`, `guidelines/11-instrumentet.md`, og kit/komponent i kolonnen «Kilde».

- [ ] **Step 2: Canvas (runde 3–18).** Bruk `design`-skillen. To artboards: Mac 1440 og mobil 390, lys. Ekte tekst; tall som ikke er målt i basen merkes «(eksempel)». Regler fra kitets README: én handling per side («Book kartleggingsøkt» der siden selger, ellers sidens ene handling), ett instrumentelement per seksjon, ett fremhevet tall per side, variantfarge som hel flate (≥ 18 %) eller ikke i det hele tatt. Lagre filene i `designsystem/canvas/marked-<side>/`, publiser, **send URL-en i samtalen**. Vent på Anders' ja. **Stopp her til det kommer.**

- [ ] **Step 3: Port komponentene** i kolonnen «Nye komponenter». Åpne `.jsx` + `.d.ts` i masteren, skriv TSX med samme props og samme inline-verdier, `next/link`/`next/image` der masteren har `<a>`/`<img>`. Komponenter som tegner måling (`Talleblokk`, `Faktarad`, `Spredning`, `Tidsserie`) **krever `kilde` og `dato` som props og rendrer ingenting uten** — det er masterens regel, behold den. Legg til i `index.ts`.

Run: `npx tsc --noEmit 2>&1 | tail -5 && npx eslint --quiet src/components/marketing/ak`
Expected: grønt. Lagre: `git add src/components/marketing/ak && git commit -m "feat(marked): <Komponenter> portet fra masteren"`.

- [ ] **Step 4: Skriv røyktesten først** — legg sidens sti(er) i `SIDER` i `tests/e2e/marked-ak-golf.spec.ts`. Kjør den mot dev-serveren: den skal passere allerede (skallet er der), men nå låser den at den nye siden ikke får overflow.

- [ ] **Step 5: Bygg siden** i `src/components/marketing/ak-sider/<Side>AK.tsx` etter canvasen/kitet. Seksjoner som funksjoner, `Seksjon`-wrapper som i kitet:

```tsx
function Seksjon({ senket = false, rutenett = false, children, id }: { senket?: boolean; rutenett?: boolean; children: ReactNode; id?: string }) {
  return (
    <section
      id={id}
      className={rutenett ? "ak-rutenett py-ak-9 md:py-ak-10" : "py-ak-9 md:py-ak-10"}
      style={{ background: senket ? "var(--ak-grunn-senk)" : "transparent" }}
    >
      <div className="mx-auto px-ak-4 md:px-ak-6" style={{ maxWidth: "var(--ak-sidebredde)" }}>{children}</div>
    </section>
  );
}
```

(`Seksjon` legges i `src/components/marketing/ak/Seksjon.tsx` i runde 1 og gjenbrukes.) Aldri `--mk-*`, `pk-*`, `TL`, `T`, `--tl-*`. Aldri hex. Foto fra `public/brand/foto/` etter `designsystem/ak-golf/foto/katalog.md` — bruk `renset/`-versjonen der den finnes (sponsorlogo fjernet).

- [ ] **Step 6: Koble inn** i `page.tsx`, slett den gamle komponenten når ingen importerer den lenger.

Run: `npx tsc --noEmit 2>&1 | tail -5 && npx playwright test tests/e2e/marked-ak-golf.spec.ts --project=chromium`
Expected: grønt.

- [ ] **Step 7: `/impeccable audit`** på siden (kjørende dev-server). Rett alt utenom funn som ber om annen font, farge, radius eller avstand enn masteren — de avvises med henvisning til `designsystem/ak-golf/`. Deretter `review-animations` hvis siden har bevegelse (masteren: kun `.ak-kommer`, ingen sprett, ingen skala fra 0).

- [ ] **Step 8: Lagre og PR.** `npm run verify` grønt. Commit: `feat(marked): <side> portet til Master AK Golf`. PR via `/pr`. Vercel-preview: skjermbilde 390 + 1440, **send i samtalen**. Legg canvas-URL og skjermbilder side om side i PR-teksten. `pr-review-toolkit`, rett funn.

- [ ] **Step 9: Anders' ja på skjermbildet → merge, slett gren.** Oppdater raden i MASTERPLAN 18.33 til «Levert (PR #…)». Uten ja: ingen merge.

**Runde 1, særregel (forsiden):** bygg `ForsideAK.tsx` og koble den til en midlertidig rute `src/app/(marketing)/forside-ak/page.tsx` (`robots: noindex` i metadata) i stedet for å bytte `page.tsx`. Send skjermbilder av `/` (Reisen) og `/forside-ak` (kitet) side om side. Anders velger. Valgt kit: `page.tsx` byttes til `ForsideAK`, `forside-ak/` og `MarkedForsideReise.tsx` + `forside-reise.css` + `MarkedForside.tsx` slettes. Valgt Reisen: `ForsideAK` slettes, Reisen får masterens tokens/komponenter i en egen liten PR, og spec §3 rad 1 rettes. Ingen av delene slettes før valget er tatt.

**Runde 14, særregel (cases):** før canvas, les `MarkedCasesV2.tsx` og `src/app/(marketing)/cases/page.tsx`. Finnes det sitater eller vitnesbyrd, legg to valg for Anders i samtalen: (a) «Slik leser du tallet» — én måling per case, med dato og kilde, ingen sitater; (b) slett siden med `redirect("/coaching")` i `page.tsx`. Ingen canvas før valget.

---

## PR 20 — Opprydding og vakter

### Task 8: Slett de gamle systemene, utvid vakten, rett dokumentasjonen

**Files:**
- Delete: `src/styles/marked-kit.css`, `src/components/marketing/v2/kit/PkPrimitives.tsx`, `PkShell.tsx`, alle gjenværende `src/components/marketing/v2/Marked*V2.tsx` som ikke er `MarkedBooking*`/`MarkedStats*`/`Stats*`, `src/components/marketing/landing/MarkedForside.tsx` (hvis ikke allerede slettet i runde 1)
- Modify: `src/app/globals.css` — slett `--mk-*`-blokken (Task 5 step 3), `@theme`-aliasene `--color-mk-*` og `--font-mk-serif`
- Modify: `src/components/system/side-tilstand.tsx` — importerer `marked-kit.css`; port den til `ui_kits/feilside/index.html` (masterens 404/500) med `--ak-*`, eller flytt dens tokens inn i en egen `src/styles/side-tilstand.css` hvis feilsidene skal vente. **Anbefalt: port til feilside-kitet** — det er én skjerm og masteren har den tegnet.
- Modify: `scripts/check-ingen-paper.mjs`
- Modify: `CLAUDE.md` invariant 2 (setningen «Marketing/landingssider har egen fasit (ak-golf-website) og omfattes ikke»), `src/app/(marketing)/layout.tsx` (kommentar), `.claude/rules/arkitektur.md` (Marketing-raden)
- Test: `src/lib/__tests__/marketing/ingen-gamle-marked-tokens.test.ts`

- [ ] **Step 1: Skriv testen som vokter at de gamle systemene er borte**

```ts
// src/lib/__tests__/marketing/ingen-gamle-marked-tokens.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROT = path.resolve(import.meta.dirname, "../../../..");

describe("check-ingen-paper.mjs vokter også de gamle markedssystemene", () => {
  it("stopper --mk-, --mkit- og pk-/mk-klasser i src", () => {
    const skript = path.join(ROT, "scripts/check-ingen-paper.mjs");
    const ut = execFileSync("node", [skript], { cwd: ROT, encoding: "utf8" });
    assert.match(ut, /OK: ingen Paper-rester/);
  });
});
```

(Testen passerer bare når `src/` faktisk er ren — den er porten for hele PR-en.)

- [ ] **Step 2: Utvid vakten.** I `scripts/check-ingen-paper.mjs`, etter `--p-`-sjekken, legg til:

```js
    // Markedssidene (04.09.2026): --mk-*/--mkit-* og Tailwind-klassene mk-*/pk-*
    // var Paper-tidens to markedssystemer. Slettet etter porten til AK Golf-
    // masteren (docs/superpowers/specs/2026-09-04-marked-ak-golf-port-design.md).
    const mk = s.match(/--mk(?:it)?-[a-z0-9-]+/g);
    if (mk) {
      funn.push(`${rel} — gamle marked-tokens: ${[...new Set(mk)].slice(0, 4).join(", ")}`);
    }
    if (/\.(tsx|ts)$/.test(e.name)) {
      const kl = s.match(/\b(?:bg|text|border|font|hover:bg|hover:text|hover:border)-mk-[a-z0-9-]+|\bpk-[a-z0-9-]+/g);
      if (kl) {
        funn.push(`${rel} — gamle marked-klasser: ${[...new Set(kl)].slice(0, 4).join(", ")}`);
      }
    }
```

og i feilmeldingen: «Bruk --tl-* / TL (produkt) eller --ak-* / ak-* (marked) i stedet».

- [ ] **Step 3: Kjør testen, se den feile** — Run: `npx tsx --test src/lib/__tests__/marketing/ingen-gamle-marked-tokens.test.ts`. Expected: FAIL med listen over filer som fortsatt har `--mk-`/`--mkit-`/`pk-`.

- [ ] **Step 4: Slett og rett** til listen er tom. `grep -rn -e "--mk-\|--mkit-\|pk-\|mk-bg\|mk-fg" src` skal gi null treff utenom `src/components/stats/` (W7 — legg `src/components/stats/` og `src/app/(marketing)/stats/` som eksplisitt unntak i vakten med kommentar «til W7», så vakten ikke blir skrudd av for hele repoet).

- [ ] **Step 5: Kjør testen, se den passere.** Deretter `npm run verify`.

- [ ] **Step 6: Dokumentasjon.** CLAUDE.md invariant 2: bytt setningen om ak-golf-website til: «Marketing/landingssider (`/`, `(marketing)/*` unntatt `/stats` og åpen `/booking`) følger **AK Golf-masteren** (`designsystem/ak-golf/`), ikke Train-lock. Vakt: `scripts/check-ingen-paper.mjs`.» Samme i `arkitektur.md` Marketing-raden. Lukk STEG 18.8 og 18.33 i MASTERPLAN. Oppdater `docs/STATUS-NÅ.md`.

- [ ] **Step 7: Lagre, PR, review, merge.**

```bash
git add scripts/check-ingen-paper.mjs src/lib/__tests__/marketing/ingen-gamle-marked-tokens.test.ts src/app/globals.css CLAUDE.md .claude/rules/arkitektur.md docs/MASTERPLAN-GJENSTAAENDE.md docs/STATUS-NÅ.md
git rm src/styles/marked-kit.css src/components/marketing/v2/kit/PkPrimitives.tsx src/components/marketing/v2/kit/PkShell.tsx
git commit -m "chore(marked): --mk-*/--mkit-*/pk-* slettet, vakt utvidet, fasit-referanser rettet til AK Golf-masteren"
```

---

## Selvsjekk mot spec

- §2.1 tokens: Task 1 (importliste, ikke semantikk/grunnlag — presisert fra spec, se Global Constraints). §2.2 fonter: Task 2. §2.3 lys: Task 2 (ingen bryter). §2.4 komponenter: Task 3 + Task 7 step 3. §2.5 skall: Task 4. Bro: Task 5. §3 rekkefølge: Task 7-tabellen. §4 løkke: Task 7 step 2–9. §5 opprydding: Task 8. §6 testing: Task 1 (fil-test), Task 5 (røyk), Task 8 (vakt-test). §7 registrering: Task 6. §8 økter: én side per økt i Task 7.
- Avvik fra spec, med vilje: spec §2.1 sa «alle token-filer inkl. semantikk og grunnlag». Målt 04.09: `semantikk.css` kolliderer med fem produkt-tokens, `grunnlag.css` setter `body` globalt. Begge holdes ute; grunnlaget gjenskapes scopet. Spec §2.1 er rettet i samme commit som denne planen.
