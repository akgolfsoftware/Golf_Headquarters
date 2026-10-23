# Designrunde 1 — 23.10.2026

Mål: gjøre to AgencyOS-visninger lettere å bruke uten å endre designsystemet. Regler som følger av runden står i
[designregler-data-og-lister.md](../design-system/designregler-data-og-lister.md).

## Funn fra kartleggingen

Målt som coach på lokal dev-server (innlogget testkonto), `/admin/spillere`, `/admin/bookinger`, `/admin/runder`,
`/admin/okter` ved 390, 768 og 1440 px. Ingen sidelengs rulling og ingen konsollfeil på noen av dem.

1. **Runder (`/admin/runder`)**: 14 runder som en lang kortliste. Ingen måte å se om scoren går ned (brutto 79 → 72).
2. **Stall (`/admin/spillere`)**: 41 spillere sortert bare etter «trenger deg». Coachen kan ikke ta navn eller handicap.
3. Cookie-banneret dekker innhold nederst på mobil og i midten på desktop til det lukkes (fantes fra før, ikke rørt).
4. Frontend-analysen fra 20.10 ([analyse-frontend…](../design-system/analyse-frontend-playerhq-agencyos-2026-10-20.md))
   viser at samme design er bygget tre ganger i koden. Det er årsaken til at hver ny byggekloss koster mer enn den
   burde. Ikke adressert her.

## Beslutning per verktøy

| Verktøy | Status | Beslutning |
|---|---|---|
| Recharts | Installert (^3.8.1), brukt i SG-hub og stats | **Brukt nå**: `RundeUtvikling` på Runder. `react-is` ikke berørt. |
| TanStack Table | Ikke installert | **Vurder senere.** Listene er kortlister på 14–41 rader med én sorteringsakse. |
| shadcn Calendar | Ikke installert, ingen DayPicker. Datoer er `<input type="date">` | **Vurder senere.** Ingen sted i de valgte visningene trenger periodevalg. Kandidat: periodefilter på Runder når antallet vokser. |
| Motion | Ikke installert; `prefers-reduced-motion` finnes i flere stilark | **Ikke relevant nå.** Ingen interaksjon trengte mer enn CSS. |
| frontend-design | Tilgjengelig som skill | **Brukt** med Precision Athletics som begrensning; ingen ny stil. |
| web-design-guidelines | Ikke installert som skill (AGENTS.md forbyr å kopiere eksterne skill-kataloger inn i repoet) | **Brukt uten installasjon**: reglene hentet fra `vercel-labs/web-interface-guidelines` og anvendt manuelt på endrede filer. |
| Chrome DevTools MCP | Ikke tilgjengelig i denne økten | **Ikke brukt.** Erstattet av Playwright-biblioteket og målinger i `page.evaluate`. Ytelsesmåling ikke gjort. |
| Playwright MCP | Ikke tilgjengelig som MCP | **Playwright-biblioteket** (`@playwright/test`, allerede i prosjektet) kjørt direkte. |

## Endringer

| Fil | Hva |
|---|---|
| `src/components/admin/precision/RundeUtvikling.tsx` (ny) | Utviklingskurve for brutto score med tekstoppsummering |
| `src/lib/admin/runde-utvikling.ts` + test (ny) | Filtrering til tellende runder, rekkefølge, endring |
| `src/components/admin/precision/AGRD01RunderNy.tsx` | Viser kurven når én spiller er valgt eller bare én finnes |
| `src/styles/agencyos-ny-teknisk.css` | Stil for kurveflaten og tooltip (scopet til `.agn-s`) |
| `src/components/admin/precision/AG07Stall.tsx` | Sorteringsvalg Trenger deg / Navn / Handicap |
| `src/lib/admin/stall-sortering.ts` + test (ny) | Handicap-tolking og sortering |

Ingen endring i forretningslogikk, datakontrakter, tilgang eller spørringer.

## Verifisert

- `npm run verify`: statiske kontroller og alle tester grønne (5584 + 240 + 2). Bygget feilet første gang på en
  gammel `.next`-cache (Google-fonter «module not found»); etter `rm -rf .next` ga `next build` grønt. Serwist-steget
  (`serwist build`) er ikke kjørt separat etter dette.
- `npx tsc --noEmit` (med 8 GB minne): ingen feil.
- `eslint` på alle endrede filer: ingen funn.
- Nye enhetstester (6): bestått.
- Nettleser, 390 / 768 / 1440 px, innlogget coach: Runder viser diagram med riktig `aria-label`, tooltip ved hover,
  `scrollWidth` lik skjermbredden. Stall: sortering Navn og Handicap gir riktig rekkefølge (Karl L. med HCP +0,4
  først), `aria-pressed` oppdateres, tastatur (fokus + mellomrom) fungerer, 44 px høye knapper.
- Konsollfeil: 0 på begge sider.
- Skjermbilder før og etter ligger i økta (scratchpad), ikke i repoet (AGENTS.md: lokale skjermbilder aldri i Git).

## Ikke verifisert

- Visning mot utkastet i `utkast-agencyos/teknisk.html`: kurven og sorteringsknappene finnes ikke der. Per AGENTS.md er
  en skjerm ikke ferdig før Anders har sett den mot valgt design.
- Datagrunnlaget i testbasen: Runder har bare én spiller med runder, og SG-kolonnene i Stall er tomme for de fleste.
  Kurven er ikke prøvd med flere spillere i samme kjøring (der skjules den bevisst).
- Nattema, redusert bevegelse (ingen animasjon å teste), skjermleser.
- Handicap-sortering mot ekte data med minus-formatering utover testtilfellene.

## Neste tre forbedringer

1. **Ett delt tokensett** (forslag 1 i frontend-analysen): lavest risiko, størst effekt på all videre bygging.
2. **Sortering og filter i URL** på Stall og Runder, så coachen kan dele og gå tilbake til en visning.
3. **Periodefilter på Runder** (dato fra–til). Da er kalenderkomponenten begrunnet; avklar først om den skal bygges på
   DayPicker eller på `<input type="date">` som resten av appen.
