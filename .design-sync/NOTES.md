# design-sync — notater for AK Golf HQ (repo-spesifikke fakta)

Første synk 16.09.2026. Målprosjekt i Claude Design: «AK Golf HQ — komponenter fra kode»
(`projectId` i `config.json`). Det eksisterende prosjektet «AK Golf HQ Design System» (bb9b2b1d) er
Anders' tegneprosjekt og skal ALDRI være mål for denne synken.

## Slik er repoet koblet til konverteren

- Appen er en Next.js-app uten `dist/`. Synken bruker en **virtuell pakke** i `.design-sync/pkg/`:
  `package.json` (navn, `module: index.ts`, `types`), `index.ts` (eksportlista) og `scope/`
  (symlenker til de ekte komponentfilene, gruppert i mapper som blir gruppenavn i Claude Design).
  Konverteren kjøres med `--entry .design-sync/pkg/index.ts`, så `PKG_DIR` = `.design-sync/pkg`.
- `node .design-sync/gen-scope.mjs` regenererer `index.ts`, `scope/` og `componentSrcMap` i
  `config.json` fra fil→gruppe-tabellen `GRUPPER`. Ny komponent i `src/components/{ui,v2}`? Kjør den.
- `node .design-sync/build.mjs` (= `cfg.buildCmd`) skriver typer (tsc, `pkg/types/`), skriver om
  `@/`-alias til relative stier i .d.ts (ts-morph kjenner ikke aliaset), kompilerer Tailwind v4
  flatt (`pkg/css/app.css`) og setter sammen `pkg/css/entry.css` = `fonts.css` + app.css.
  Krever `.ds-sync/node_modules/.bin/tailwindcss` (`@tailwindcss/cli` installeres i steg 7).
- `pkg/process-shim.ts` importeres først i `index.ts`: `next/link` leser `process.env.__NEXT_*`
  ved lasting, og uten shimen kaster hele bundelen `ReferenceError: process is not defined`.
- Playwright: cachet Chromium på maskinen er build 1194 → `playwright@1.56.0` i `.ds-sync/`
  (1.59 vil ha 1217 og feiler med «Executable doesn't exist»).

## Bevisst utenfor omfanget (ikke eksportert)

- `ui/icon.tsx` og `ui/popover.tsx`: navnekollisjon med `v2/icon.tsx` og `v2/overlays.tsx`
  (`Icon`, `Popover`). v2-variantene er de Train-lock-skjermene bruker.
- `v2/wb-mobil.tsx` sin `Ark` eksporteres som `WbArk` (samme alias som `src/components/v2/index.ts`).
- `v2/shell.tsx`, `v2/spiller-veksler.tsx`: bruker `next/navigation` (krever Next-ruter).
- `v2/design-lab-v2.tsx`: lab, bruker `next/image`. `v2/rolle.tsx`: kun provider/hook.
- `v2/hurtig-opprett.tsx`: importerer server actions fra `src/app` og drar prisma/supabase/
  googleapis/web-push inn i nettleserbundelen (esbuild feiler på node-innebygde moduler).
- `ui/toast.ts`: kun `ToastProvider`/`useToast`, ingen komponent å vise.
- `LFaseBadge` (`v2/domene.tsx`): utgått komponent — beslutning 05.08.2026 «tas IKKE i bruk, skal ikke
  gjeninnføres på noen flate». Claude Design skal ikke kunne bygge med den.
- `AmbientBakgrunn` (`v2/core.tsx`): rendrer `null` uten `PROFIL.src`, som settes av appen i runtime;
  ingen statisk tilstand å vise. Begge ekskluderes i `EKSKLUDER_EKSPORT` i `gen-scope.mjs`.

## Fonter

Appen laster fonter via `next/font/google` (CSS-variabler `--font-poppins` osv. settes av Next).
`fonts.css` gjenskaper variablene. `build.mjs` henter Google Fonts-CSS-en med curl (Chrome-UA gir
woff2 + unicode-range), laster ned latin/latin-ext-filene til `pkg/fonts/` og skriver
`pkg/fonts/fonts-local.css`; `cfg.extraFonts` peker dit, så konverteren shipper filene i `fonts/`
og designene får ekte Poppins/IBM Plex Mono/Lora/Archivo/Oswald/Geist offline. Feiler nettet,
faller build.mjs tilbake til fjern `@import` (`[FONT_REMOTE]`).
Felle (funnet 16.09): Google skriver subsett-kommentaren FORAN blokken (`/* latin */ @font-face`);
splittes CSS-en på `@font-face`, havner neste bloks kommentar på slutten av forrige blokk, og
latin-blokken (U+0000-00FF) blir kastet — da laster ingen font. Alle familiene er OFL-lisensiert.
Archivo har bevisst ikke vekt 700 (fontgjennomgang F3 15.09).
Verifisering: `document.fonts` må sjekkes over http (harnessen serverer 127.0.0.1); fra `file://`
blokkerer Chromium fontlasting, og Google Fonts direkte feiler på proxyens CA (`ERR_CERT_AUTHORITY_INVALID`).

## Forhåndsvisninger — mønstre som virker

Runde 1 (16.09, 140 komponenter, 448 celler) ga disse reglene. De gjelder alle previews.

- **Default slår inn på `undefined`, `null`/`""` slår av.** Alle domenekort har demo-data som default;
  «uten X»-tilstander sendes som `null` (`frist`, `cta`, `hjelp`, `sub`, `label` i felt inne i
  `SkjemaFelt`) eller tom streng der kilden vokter med falsy (`FeaturedCard.badge`, `KategoriFjell.neste`).
  Preview-bygget er esbuild uten typesjekk, så `null` kompilerer selv om `.d.ts` sier `string` — bruk
  bare tilstander kilden faktisk vokter for. **`.d.ts`-generatoren stripper `| null` og utelater nestede
  typer** (CompareSerie, Skudd, RadarPunkt …) — les kilden for den ekte kontrakten.
- **Tokens sendes som strenger:** `"var(--tl-ok)"`, `"var(--tl-mute)"`, `"var(--tl-font-mono)"`,
  `--v2-ax-*` (FYS/TEK/SLAG/SPILL/TURN), `hsl(var(--border))`/`hsl(var(--muted-foreground))` i layout-lim.
  `TL`, `AK` og `PROFIL` er ikke eksportert fra pakken. Lys `--tl-fill` er svart (ikke lime) — kildens
  «lime»-kommentarer gjelder mørk modus.
- **Nakne komponenter (målere, stolper, spark) vises i `Kort`** med `eyebrow` og `action` (kilde · dato i
  mono 9 px mute). Rad-komponenter (FakturaRad, VarselRad) i `Kort pad="15px 17px"` med `last` på siste rad.
  `Rad` rendrer `meta`/`trailing` rått; `trailing={null}` skjuler chevronen.
- **Maks-bredde i cellen:** felt 360, kort 440, tint-kort 520, lister/rader 480–560, Veiviser 520–640.
  Uten wrapper strekkes alt til ~750 px (enkelt-celle) og tabeller/kort mister proporsjonene.
- **Overlegg:** `position: relative; height: 560` rundt `<Dialog open onOpenChange={() => {}}>`; 576 når
  dialog-body skal rulle (max-h-[90vh] ved 640-viewport). Dropdown-menyer rendres åpne med `open`
  (Popover-basert), ankres med `position: relative; display: inline-block`, scene 400 px, og
  `className="w-max"` på `DropdownMenuContent` — ellers klemmes bredden av ankeret. Trigger/Close er
  ustilte `<button>` som sprer `...rest` (inline `style` virker). Bruk bare Tailwind-klasser som finnes
  kompilert: `grep -c "\.<klasse>[ {:,]" .design-sync/pkg/css/entry.css`.
- **Kontrollerte felt:** `checked` + `readOnly` (Checkbox/Switch stiler etter `checked`, ikke
  `defaultChecked`), `value` + `onChange={() => {}}`. Native `<Input type="date">` rendrer en-US
  (`09/18/2026`) — bruk tekstverdi `18.09.2026`. `Select` tar `<option>`-barn, `Input` aldri children.
- **Skall:** `IkonRail`/`Sidebar` har ingen egen høyde — flex-ramme 560 px med innhold ved siden av;
  `BunnNav` i 390 px-boks; `Skjerm` (390×800 / 1280) i en wrapper med `zoom: 0.8`/`0.66`.
- **Innhold:** grupper (WANG Toppidrett, GFGK junior, Team Norway U18) og økter/runder som rader; Øyvind
  Rohjan og Anders Kristiansen er eneste personer. Ordforråd fra `docs/ordbok-master-trening.md`
  (pyramideakser, Innendørs/Treningsområde/Bane/Konkurranse, Alene/Observert/Konkurranse/Turnering,
  kategori A–K). Ingen CS-nivå/L-fase-tekst i nye celler (historisk lesing kun der komponenten er historisk).
- `next/link` rendrer fint (process-shim). Mount-animasjoner (`useMount` 500 ms, `useCountUp` 600 ms,
  Trend 700 ms) er ferdige før fangst (`networkidle` + fontlasting).

## Fangst og gradering — fakta

- `package-capture` tar ett **900×700-viewport-skjermbilde per celle** (`?story=<Celle>`), ikke
  element-skjermbilde og ikke fullPage: alt under ~650 px høyde klippes stille. Arket skalerer hvert
  bilde til 760×520; råfilene ligger i `ds-bundle/_screenshots/review/raw/<gruppe>__<Name>__<Celle>.png`.
  Arket sorterer cellene alfabetisk, ikke etter eksportrekkefølge.
- `mobilKort`-modus i DataTabell og andre `md:`-brytere kan ikke vises: viewporten er 900 px. Ønskes de,
  trengs `viewport` ≤ 767 px i `cfg.overrides` for den komponenten.
- Grade-fila slettes av capture når preview-kilden endres («contract changed»): skriv graden ETTER
  capture, regrader alle celler, og hold cellenavn = grade-nøkler. Endrer du et eksportnavn, følger
  grade-fila med.
- Parallelle agenter: alltid `--components` på `preview-rebuild` og `package-capture`; aldri
  `package-build`/`package-validate` mens andre jobber (felles tilstand). Ferdig-graderte komponenter i
  `--components`-lista blir «carried forward» gratis.


- Kontekst-krevende deler (DialogContent/-Title/…, SheetContent/…, PopoverTrigger/-Content, TabList/
  Tab/TabPanel, RadioGroup-barn) skrives som hele foreldrekomposisjonen — det er den eneste sanne
  renderen. Overstyringene `cardMode: single/column` + `viewport: 900x640` for overleggene ligger i
  `cfg.overrides`.

## Kildefunn fra synken 16.09 (ikke rettet — `src/` er utenfor synkens mandat)

Funnet av preview-agentene ved lesing av kilden. Meldt videre i arbeidslisten; rettes i egne PR-er.

- **`Kort tint` / `KpiFlis varsle`** (`core.tsx`): `background: \`${TL.dim}, ${TL.elev}\`` er ugyldig
  flerlags-CSS (farge bare i siste lag) → deklarasjonen forkastes, «tonet» kort blir transparent.
- **`SkjemaFelt` med `feil`** (`skjema.tsx`) tegner feilmeldingen to ganger (kloner `feil` inn i barnet OG
  tegner egen `Feltmelding`); kommentaren sier det motsatte. Rammer AdminNySpillerV2 (8 felt),
  AdminInviterCoachV2, AdminEksternLeserV2, UtfordringDetaljV2. Standardteksten i `hjelp` («Bruk komma
  som desimaltegn …») vises under et hvilket som helst felt der `hjelp` er `undefined` — appen sender
  `hjelp={undefined}` flere steder, som ikke slår den av (må være `null`).
- **`MeldingsTraad`** (domene2, linje ~313): `${m.meg ? "${AK.farge.forestMerkeA60}" : TL.hair}` — indre
  mal står som bokstavelig streng → ugyldig kantfarge på «meg»-bobler.
- **`PillTabs`**: faneknapper mangler `flex: none` → krymper til `minWidth: 44` med klippet tekst før
  scroll/fade slår inn.
- **`Knapp`/`CTAPill` `enTing`**: `enTing ? TL.fill : TL.fill` — identisk med solid.
- **`NAV` i core** har fem punkter (Hjem/Plan/Gjør/Analyse/Meg); beslutning 05.08.2026 sier fire
  (I dag/Plan/Analyse/Meg). IkonRail/Sidebar/BunnNav/Skjerm viser fem.
- **Utgått vokabular i default-props** (ordbok §17): `NivaSkala` CS90–CS120, `BenchmarkBadge`
  `nivaa="CS90"`, `TestResultatKort` `krav="Krav CS100"` + stops CS80–CS110, `AKFormelChip`
  `intensitet="CS80"` + `lFase="L3"`, `SpillerKort` `kategori="Elite junior"`, `VarselRad` «hold CS60»,
  `MeldingsTraad` «CS60/CS80», `SGSplittKort` `baseline="Broadie scratch"`, `LaunchWindow` prop-navnet
  `csNivaa`, `Diagnose` `resept.kode` «CS90», `KategoriKrav` A–K + FYS-krav (begge uavklart).
- **`SamtykkeKort`** default `forelder` inneholder en e-postadresse (demo-data i kilden).
- **`OktKort state="done"`**: venstre kant `TL.ok` (grønn) mens pillen er `warm` — MAT-00 («Fullført aldri
  TL.ok») bare fulgt for pillen.
- **`LogoAK surface="ink"`** bruker `TL.text` → usynlig på mørk flate i lys tema. **`LiveStatus
  tone="lime"`** og **`VideoKort`**-fallback-gradienten (`TL.fill → TL.scene`) er svart i lys modus;
  navn/kommentar («forest-gradient») villeder. `Caps color="var(--tl-warm-text)"` er nøytral i lys modus.
- **`TurneringNedtelling`**: «dager» bøyes ikke («1 DAGER»). **`HullStripe`**: hardkodet 1/9/18-akse.
  **`KolleStatKort`**: kølle-navn > 4 tegn kuttes til 3 («Dri», «7-j»). **`TrackmanSammendrag`**: `dato`/
  `slag` i props brukes ikke. **`LoadChart`**: 1,5-etiketten kolliderer med siste punkt nær 1,5.
  **`LaunchWindow`**: «Vindu · X»-etiketten kan dekkes av et punkt. **`SlagLekkasje`**: `|sg| < 0,05` er
  nøytral uansett `desimaler`. **`RingMaaler zones[].label`** > ~15 tegn brytes opp i ringen.
- **`DataTabell`**: sortering faller til strengsammenligning ved `null` → null-rader først ved `asc`;
  `delta` farger etter fortegn (feil for Attack Angle). **`DropdownMenuContent`** klemmes av ankerets
  bredde (`w-max` innbakt ville løst det; ingen app-bruk utenfor primitivfila 16.09). **`SheetContent`**
  `h-full` også med lite innhold. **`FeaturedCard.bilde`** settes inn som `url(${bilde})` uten
  anførselstegn — data-URL må være fullt kodet.
- **`AmbientBakgrunn`** rendrer `null` uten `PROFIL.src` (modulnivå-state satt av appen) — kan ikke vises
  i et designsystem; ekskludert fra eksporten (se under). **`LFaseBadge`** er utgått (05.08.2026) —
  ekskludert av samme grunn.
- Kontrast: `warn`-tekst på lys bunn (ValgKort `tagTone="warn"`, NpsSkala «Passiv») — kjent token-sak,
  se `gotchas.md` §Historisk Train-lock-kontrast.

## Valgfrie config-endringer som IKKE er gjort

- Dropdown*-familien kunne hatt `viewport: 900x460` (tettere ark) — ikke nødvendig.
- `DataTabell` (`mobilKort`) og `NpsSkala` (to-raders mobiltilstand) kunne fått egen celle med
  `viewport` ≤ 767 px — krever viewport-styring per komponent.
- `Skjerm`: `viewport` ≥ 1300×900 i stedet for `zoom`-wrapperen.

## Kjente render-advarsler (triagert, ikke feil)

- `[TOKENS_MISSING] 78` — `--ak-sans`, `--ak-display`, `--ak-r-*` m.fl. refereres av markeds-
  temaet i `globals.css` (`designsystem/ak-golf/tokens/tailwind-theme.css`) og defineres i
  `designsystem/ak-golf/tokens/type.css`, som kun markedssidene laster. Produktkomponentene bruker
  dem ikke (kun `--ak-topbar-h`, som settes i runtime av toppbaren). Skal IKKE shippes:
  beslutning 03.09.2026 «AK Golf-tokens skal aldri inn i en produktskjerm».
- `[FONT_REMOTE]` — se Fonter.

## Tema

Lyst tema er default på `:root`; mørkt aktiveres med `data-v2-tema="dark"` på `<html>`
(`src/lib/v2/tema-default.ts`). Kortene rendres lyse. Produktflatene `/portal` og `/admin` er mørke
som standard i appen.

## Re-sync-risikoer

- `pkg/types/` og `pkg/css/` er maskinstate (gitignored) og må bygges på nytt med `buildCmd`
  før konverteren; en stale `app.css` gir feil utility-klasser.
- Google Fonts-importen krever nett i render-miljøet; uten nett faller tekst til systemfont.
- `GRUPPER` i `gen-scope.mjs` er en manuell liste: en ny komponentfil i `src/components/v2`
  kommer ikke med før den er lagt til der.
- Tailwind-utilities finnes bare for klasser som er brukt et sted i repoet; en design som bruker
  en klasse appen aldri har brukt, får ingen stil (se conventions.md).
- Previews sender `null` til props typet uten `| null` (esbuild sjekker ikke typer). Innføres typesjekk
  av previews, må enten `.d.ts`-generatoren bevare `| null`, eller cellene skrives om.
- Kildefunnene over er ikke rettet: rettes de, kan celler som viser dagens (feil) utseende få ny
  kontrakt — `package-capture` nullstiller graden og cellen må leses på nytt.
- Ekskluderingslista `EKSKLUDER_EKSPORT` i `gen-scope.mjs` er manuell; kommer `LFaseBadge` i bruk igjen
  ved ny beslutning, fjernes den derfra.
