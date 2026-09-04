# Markedssidene porteres til Master AK Golf — design

Dato: 2026-09-04 · Besluttet av Anders i økt (omfang: kun de 22 markedssidene, full port av alle).
Kilde for merket: `designsystem/ak-golf/` (speil av Claude Design-prosjektet
`3e5c851c-4b78-41ab-8ced-7b11048838f9`, v1.0.0, synket 02.09.2026).

## 1. Hva som skal skje

De 22 markedssidene under `src/app/(marketing)/` bygges om fra to gamle stilsystemer
(`--mk-*` i `src/app/globals.css` og Paper-kitet `pk-*`/`--mkit-*` i `src/styles/marked-kit.css`)
til AK Golf-masteren: verkstedpaletten, IBM Plex-familien, instrumentlaget og masterens
komponenter. Når siste side er over, slettes begge de gamle systemene og en vakt hindrer at de
kommer tilbake.

**Utenfor omfanget, røres ikke:**
- `/stats/*` (51 ruter) — eget skall (`MRamme`), egen bølge (W7).
- `/booking/*` når bookingen er åpen — Train-lock (Anders 28.08.2026). `MarkedBookingPauset`
  (vises når bookingen er pauset) får bare det nye skallet, ikke ny side.
- PlayerHQ, AgencyOS, Forelder — Train-lock (CLAUDE.md invariant 2). Ingen `--ak-*` i
  produktskjermer; beslutning 03.09 «tokens aldri» står.
- `/team-norway/*` — Claw.

## 2. Fundamentet (PR 1)

### 2.1 Tokens
`src/styles/ak-golf.css` importerer token-filene **direkte fra masterens speil**, i masterens
egen rekkefølge (`designsystem/ak-golf/styles.css`), minus `fonter.css` (fonter lastes med
next/font, se 2.2):

```
farge → type → rom → bevegelse → instrument → semantikk → grunnlag → samspill → tailwind-theme
```

Filene er generert fra `tokens.json` av `scripts/ak-golf-tokens.mjs`, som allerede feiler
`npm run verify` ved skli eller kontrastbrudd. Å importere dem uendret gjør at samme vakt dekker
koden. Ingen verdi kopieres inn i `src/`.

`ak-golf.css` importeres i `src/app/(marketing)/layout.tsx`, ikke i `globals.css`, så tokene
lever kun på markedsflaten. Tailwind-klassene `ak-*` (`bg-ak-grunn`, `text-ak-signal`,
`font-ak-display` osv.) kommer fra masterens `tailwind-theme.css` via `@theme inline`.
Verifiseres: Tailwind v4 plukker opp `@theme` fra en fil importert i en rute-layout; gjør den ikke
det, flyttes kun `@import "…/tailwind-theme.css"` til `globals.css` (klassene er
`ak`-prefiksert og kolliderer ikke med produktet).

### 2.2 Fonter
IBM Plex Sans Condensed (600, 700), IBM Plex Sans (400, 500, 600) og IBM Plex Mono (400, 500)
lastes med `next/font/google` i markedslayouten og settes på `<div>`-skallet som
`--ak-display`, `--ak-sans`, `--ak-mono` (overstyrer type.css sine fallback-stacks). Produktet
beholder Poppins uendret; IBM Plex Mono finnes allerede globalt.

### 2.3 Lys og mørk
Lys er standard i masteren og landingssidene er låst lyse i `src/lib/v2/tema-default.ts`.
Markedsflaten bygges derfor lys. Mørk variant finnes i tokene (`:root[data-ak-flate="mork"]`)
men kobles ikke til noen bryter. Skal mørk på, er det én attributt, ingen ombygging.

### 2.4 Komponenter
Masterens komponenter er JSX mot et globalt namespace og kan ikke importeres direkte. De portes
til TSX i `src/components/marketing/ak/`, én fil per komponent, samme navn og props som masteren
(`Knapp`, `Kort`, `Fotokort`, `Talleblokk`, `Faktarad`, `Instrumentflate`, `Maalestokk`,
`Merkelapp`, `Akkordeon`, `Toppnav`, `Mobilmeny`, `Logo`, `Ikon`, `Felt`, `TomTilstand`).
Fundament-PR-en porter det skallet og forsiden trenger; resten portes i den side-PR-en som
først trenger dem. Aldri `any`; `.d.ts`-filene i masteren er utgangspunkt for typene.

### 2.5 Skallet
`MarkedNav` og `MarkedFot` bygges om etter kitets `Toppnav`/`Mobilmeny` og `Bunn`
(`ui_kits/markedsside/Deler.jsx`). Meny: Coaching · Junior · Priser · Om oss · Kontakt, med
handlingen «Book kartleggingsøkt» (lenke til `/booking`). Bunn: logo + beskrivelse +
variantmerkelapper · Tilbud · Kontakt. Skallet eies fortsatt av `(marketing)/layout.tsx`.
`EGET_SKALL`-logikken beholdes.

Etter PR 1 står alle 22 sider i verkstedpaletten med IBM Plex (de gamle tokensettene pekes om
til `--ak-*`-verdier som midlertidig bro), med nytt skall. Innholdet i hver side er fortsatt
gammelt til siden porteres.

## 3. Sidene — rekkefølge og kilde

| # | Side(r) | Kilde i masteren | Tekst |
|---|---|---|---|
| 1 | `/` forside | `ui_kits/markedsside/Deler.jsx` | tekstkonsept §2 |
| 2 | `/junior` | `ui_kits/markedsside/JuniorDeler.jsx` | tekstkonsept §2 |
| 3 | `/coaching` | canvas | tekstkonsept §2 |
| 4 | `/priser` | canvas | tekstkonsept §2 |
| 5 | `/om-oss` | canvas | tekstkonsept §2 |
| 6 | `/kontakt` | canvas | tekstkonsept §2 |
| 7 | `/coacher` + `/coacher/[slug]` | canvas | dagens, i tonen |
| 8 | `/anlegg` + `/anlegg/[slug]` | canvas | dagens, i tonen |
| 9 | `/turneringer` + `/turneringer/[slug]` | canvas | dagens, i tonen |
| 10 | `/blogg` + `/blogg/[slug]` | canvas (dokumentkit for detalj) | dagens |
| 11 | `/playerhq` | canvas | dagens, i tonen |
| 12 | `/mulligan` | canvas | dagens, i tonen. Mulligan knyttes ikke til AK Golf-merket (31.08): siden promoterer, blander ikke |
| 13 | `/treningsfilosofi` | canvas | dagens, i tonen. MORAD nevnes aldri (31.08) |
| 14 | `/cases` | canvas | **må vurderes**: masteren forbyr sitater og vitnesbyrd (01.09). Foreslås «slik leser du tallet»-form eller sletting med redirect. Anders avgjør når siden står for tur |
| 15 | `/faq` | canvas, `Akkordeon` | dagens |
| 16 | `/jobb` | canvas | dagens, i tonen |
| 17 | `/suksess` | canvas | dagens |
| 18 | `/cookies`, `/personvern`, `/vilkar` | `ui_kits/dokument` (brevark) — én mal, tre sider | dagens, uendret juridisk innhold |

Liste og detalj går i samme PR. 18 side-PR-er etter fundamentet.

**Forside-konflikt:** dagens forside er «Reisen» (`MarkedForsideReise`, scroll-animert, Anders
28.08). Kitet tegner en stillere forside. Kitets versjon bygges som `MarkedForsideAK` og vises på
Vercel-preview ved siden av Reisen. Anders velger. Ingen av dem slettes før valget er tatt.

## 4. Løkka per side (fast, aldri batch)

1. **Canvas** i `designsystem/canvas/marked-<side>/` (Mac 1440 + mobil 390, lys; ekte tekst;
   tall som ikke er målt merkes eksempel). Publiseres med `design`-skillen, URL sendes i
   samtalen. Hopper over for side 1 og 2 (kit er allerede tegnet og godkjent i masteren).
2. **Anders sier ja** til canvasen.
3. **Bygg** mot `ak-*`/`--ak-*` og komponentene i `src/components/marketing/ak/`. Aldri
   `--mk-*`, `pk-*`, `TL`, `T`.
4. **`/impeccable audit`** på den ferdige siden; alt utenom font/farge/radius rettes
   (masterens verdier vinner over skillens forslag).
5. **Skjermbilde-gate**: Vercel-preview, 390 og 1440, sendt i samtalen. `npm run verify` grønt.
6. **Merge**, gren slettes.

## 5. Opprydding og vakter (PR 20, etter side 18)

- Slett `--mk-*`-blokken og `@theme`-aliasene i `src/app/globals.css`, `src/styles/marked-kit.css`,
  `src/components/marketing/v2/kit/` og alle `Marked*V2.tsx` som er erstattet.
- `scripts/check-ingen-paper.mjs` utvides: `--mk-`, `--mkit-`, `mk-`-Tailwind-klasser og
  `pk-`-klasser i `src/` feiler bygget.
- `CLAUDE.md` invariant 2 og `(marketing)/layout.tsx`: «egen fasit (ak-golf-website)» byttes til
  `designsystem/ak-golf/`. STEG 18.8 (konfliktregelen inn i invariant 2) lukkes samtidig.
- Ett unntak: `src/components/stats/` bruker `--mk-*` i én fil. Den pekes til `--ak-*` i PR 1
  som bro, og ryddes i W7. Merkes i MASTERPLAN.

## 6. Testing

- `npm run verify` (tsc, lint, test, paper-vakt, tokens-vakt) på hver PR.
- Ny enhetstest for `check-ingen-paper.mjs`-utvidelsen (PR 20).
- Playwright-røyk per side-PR: siden rendrer uten konsollfeil på 390 og 1440, ingen horisontal
  overflow (`document.documentElement.scrollWidth <= innerWidth`). Mønster:
  `scripts/check-ak-golf-kits.mjs`, som allerede måler dette på kitene.
- Skjermbilde-gaten er den manuelle testen; CI måler ikke layout.

## 7. Registrering

Beslutningen registreres med `/beslutning`: `.claude/rules/beslutninger.md` + ny rad STEG 18.33 i
`docs/MASTERPLAN-GJENSTAAENDE.md` med side-tabellen over som sjekkliste. Fase 3 finnes ikke —
alle 22 er i omfanget.

## 8. Økter

19–20 PR-er og 18 gater passer ikke i én økt. Denne økten leverer spec, plan og PR 1. Sidene
bygges i påfølgende Sonnet-økter etter planen i `docs/superpowers/plans/`, én eller to sider per
økt, i rekkefølgen over.
