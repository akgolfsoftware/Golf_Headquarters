> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Fase 1 — Beslutningsunderlag: hva skjer med token-filene?

**Dato:** 02.08.2026 · **Branch:** `claude/akgolf-tokens-decision-0ppuuc` · **Status:** venter på Anders

Dette er et beslutningsunderlag, ikke en endring. Ingen token-filer er rørt, ingen skjermer portet,
ingenting slettet. Alle tall under kommer fra kommandoer kjørt mot repoet i dag. Der noe ikke er målt,
står det eksplisitt `[anslag]` eller «ikke verifisert».

> **Spørsmålet Anders skal svare på:** når et nytt tokensett kommer inn — skal det (a) erstatte alt,
> (b) leve ved siden av med gradvis migrering, eller (c) mappes til de eksisterende aliaslagene?
> Anbefalingen står i §5.

---

## 0. Utgangspunkt (reprodusert, ikke antatt)

`akhq-tokens.css` finnes ikke. Null treff på «akhq» i repoet. Det som finnes er seks CSS-filer med
variabeldeklarasjoner:

| Fil | Linjer | Deklarasjoner | Unike navn | Scope-selektor |
|---|---:|---:|---:|---|
| `src/app/globals.css` | 829 | 454 | 340 | `:root`, `.dark`, `[data-theme="dark"]`, `html[data-v2-tema]` |
| `src/styles/golfdata-tokens.css` | 226 | 161 | 111 | `.golfdata-scope` |
| `src/styles/wang-tokens.css` | 179 | 78 | 78 | `.wang-tp` |
| `src/styles/gfgk-junior-tokens.css` | 169 | 63 | 63 | `.gfgk-jr` |
| `src/styles/v2/patterns.css` | 438 | 2 | 2 | (mønsterklasser) |
| `src/styles/v2/motion.css` | 339 | 0 | 0 | (animasjonsklasser) |
| **Sum** | | **758** | | |

Tallene 454/161/78/63/2/0 = 758 reproduserer session 1 nøyaktig. Ingen drift siden i går.

Det viktigste strukturelle funnet, som ikke sto i session 1: **alle tre sidefilene er klasse-scopede.**
Ingen av dem deklarerer noe på `:root`. Det endrer hele risikobildet i §2.

---

## 1. Hvem bruker hva

Målt med grep etter både `@import`/`import`-setninger og etter faktisk bruk av scope-klassen.

### 1.1 `golfdata-tokens.css` — den store, og den som lekker

Lastes ett sted:

```
src/app/globals.css:636   @import "../styles/golfdata-tokens.css";
```

Den er altså **globalt lastet på hver eneste rute** — men variablene aktiveres bare inne i et element
med klassen `.golfdata-scope`. Den klassen settes fem steder i produksjonskode:

| Fil | Effekt |
|---|---|
| `src/components/portal/portal-shell.tsx:104` | wrapper `{children}` — treffer alle PlayerHQ-ruter under PortalShell |
| `src/app/admin/(legacy)/layout.tsx:20` | wrapper `{children}` for hele legacy-AgencyOS |
| `src/components/portal/statistikk/statistikk-hybrid.tsx` | lokal flate |
| `src/components/portal/sg-hub/sg-hub.tsx` | lokal flate |
| `src/components/portal/aarsplan/aarsplan.tsx` | lokal flate |

Ruter truffet: **167 `page.tsx` under `src/app/portal/`** (alle som går gjennom PortalShell — 36 filer
importerer shellen) pluss **42 ruter under `src/app/admin/(legacy)/`**.

**Dette er ikke et lite overgangslag.** Det er tokenkilden for PlayerHQ og for hele legacy-AgencyOS.
Navnet «v13-overgangslag» i `.claude/rules/arkitektur.md` undervurderer rekkevidden kraftig.

### 1.2 `wang-tokens.css` — ren, lekker ikke

```
src/app/team-wang/layout.tsx:4   import "@/styles/wang-tokens.css";
```

Next.js sideimport: CSS-en havner i den globale bundlen, men alle 78 variabler ligger under `.wang-tp`,
og den klassen settes **kun** i `src/app/team-wang/layout.tsx`. Null andre treff i `src/`.

Ruter truffet: **3** (`src/app/team-wang/**/page.tsx`). Ingen lekkasje.

### 1.3 `gfgk-junior-tokens.css` — én bevisst lekkasje, path-guardet

```
src/app/gfgk-junior/layout.tsx:4   import "@/styles/gfgk-junior-tokens.css";
```

`.gfgk-jr` settes to steder: micrositens layout, **og** `src/components/shared/cookie-banner.tsx:109`.
Det siste ser ut som en lekkasje, men er det ikke — banneret setter klassen bak en path-guard:

```ts
const gfgk = pathname?.startsWith("/gfgk-junior") ?? false;   // linje 51
className={gfgk ? "gfgk-jr" : undefined}                       // linje 109
```

Ruter truffet: **6** (`src/app/gfgk-junior/**/page.tsx`) pluss cookie-banneret på de samme rutene.
Verifisert: ingen lekkasje videre.

### 1.4 `v2/patterns.css` og `v2/motion.css` — ikke tokenfiler

Begge `@import`-eres fra globals.css (linje 623 og 630). `patterns.css` deklarerer 2 variabler,
`motion.css` deklarerer 0. De bærer klasser (`.v2-skel-pulsen` m.fl.), ikke tokens. Åtte komponentfiler
refererer `motion.css` i kommentarer med begrunnelsen «inline styles kan ikke uttrykke `:hover`/media
queries». **De er ikke i scope for en tokenbeslutning** og bør ikke røres av porten.

### 1.5 Konsumentsiden

| Mål | Antall |
|---|---:|
| Filer i `src/` med `var(--…)` | 250 |
| Komponentfiler totalt (`src/components/**/*.tsx`) | 618 |
| Herav `src/components/v2/` | 28 |
| Filer med inline `style={{` | 636 |
| `page.tsx`-ruter totalt | 454 |
| Filer under `(legacy)`-ruter | 131 |

De 636 filene med inline `style={{` er den egentlige kostnadsdriveren i enhver port: tokens som brukes
inline kan ikke byttes med et søk-og-erstatt på Tailwind-klassenavn.

---

## 2. Kollisjonslisten

Målt med `comm -12` på sorterte, unike navnelister per fil.

| Par | Antall kolliderende navn |
|---|---:|
| globals ∩ golfdata | **111** |
| globals ∩ wang | 15 |
| globals ∩ gfgk-junior | 5 |
| golfdata ∩ wang | 7 |
| wang ∩ gfgk-junior | 3 |
| golfdata ∩ gfgk-junior | 2 |

### 2.1 Den store: globals ∩ golfdata = 111 av 111

**Hver eneste variabel i `golfdata-tokens.css` er også deklarert i `globals.css`.** Ikke et delvis
overlapp — et totalt. Filen er en full omdeklarasjon av 111 navn, deriblant hele kjernen:
`--bg`, `--surface`, `--surface-2`, `--surface-hover`, `--text`, `--text-muted`, `--text-faint`,
`--border`, `--border-strong`, `--signal`, `--signal-fill`, `--primary-fill`, `--primary-text`,
`--success`, `--warning`, `--destructive`, alle 15 akse-tokens, alle typografi-trinnene
`--text-11` … `--text-60`, alle `--sand-*`/`--graphite-*`/`--lime-*`-råverdiene, og
`--font-ui`/`--font-display`/`--font-mono`.

**Hvem vinner i dag, og hvorfor.** Ikke importrekkefølge, og ikke spesifisitet — men
*arveavstand*. `:root` (globals) og `.golfdata-scope` har begge spesifisitet `(0,1,0)`, så
spesifisitet avgjør ingenting. Det avgjørende er at `.golfdata-scope` sitter på et `<div>` *inne i*
`<html>`: en egendefinert variabel deklarert på et nærmere element vinner alltid for det elementets
subtre, uansett spesifisitet og rekkefølge.

Konsekvens: **inne i `.golfdata-scope` er globals.css sine 111 verdier fullstendig uten effekt.**
På 167 portal-ruter og 42 legacy-admin-ruter er golfdata-tokens den reelle kilden — globals.css er
bare kilden for de resterende ~245 rutene.

### 2.2 Følgefeil: mørkt tema er brutt inne i scopet

`globals.css:65` deklarerer 58 variabler under `.dark`. `.dark` settes på wrapper-elementer i minst
10 marketing-/v2-filer (`MarkedJobbV2.tsx:99`, `MarkedOmOssV2.tsx:101`, `feil-laste.tsx:400` m.fl.).
Men `.dark` sitter alltid *lenger ut* enn `.golfdata-scope` der begge finnes — så inne i scopet
overstyrer golfdatas lyse verdier `.dark` sine mørke.

Golfdata har sin egen mørk-gren på linje 165: `.golfdata-scope [data-theme="dark"]`, 50 deklarasjoner.
**Attributtet `data-theme` settes aldri av noen kode.** Målt: null treff i `*.tsx`/`*.ts` i hele `src/`.
De eneste to forekomstene i repoet er selve CSS-selektorene:

```
src/app/globals.css:261              [data-theme="dark"] {          44 deklarasjoner
src/styles/golfdata-tokens.css:165   .golfdata-scope [data-theme="dark"] {   50 deklarasjoner
```

**94 deklarasjoner i to blokker som aldri kan aktiveres.** Det faktiske mørk-tema-bryteren bruker et
tredje attributt, `data-v2-tema` (7 filer, bl.a. `src/components/v2/shell.tsx:203`), som er koblet mot
`html[data-v2-tema="dark"]` på `globals.css:793`.

Tre parallelle mørk-mekanismer altså — `.dark`, `[data-theme]`, `data-v2-tema` — hvorav én er død.
Dette er den enkeltfeilen som vil gjøre mest skade i en port hvis den ikke ryddes først.

### 2.3 De små kollisjonene

- **globals ∩ wang (15):** `--color-primary`, `--color-accent`, `--color-success`, `--color-warning`,
  `--color-danger`, `--color-info`, `--dur-fast`, `--dur-slow`, `--ease-out`, `--radius-card`,
  `--radius-input`, `--shadow-card`, `--space-3/4/5`. Alle under `.wang-tp` → wang vinner på sine
  3 ruter, globals overalt ellers. **Merk:** seks av dem er `--color-*`-navn, som er nøyaktig
  navnerommet `@theme inline` bruker til å emittere Tailwind-utilities. Wang omdefinerer dermed hva
  `bg-primary` betyr inne i `.wang-tp` — bevisst eller ikke, det er et virkemiddel porten må vite om.
- **globals ∩ gfgk (5):** `--ink`, `--paper`, `--r-sm`, `--dur-fast`, `--dur-slow`. Scopet til `.gfgk-jr`.
- **Sidefilene mot hverandre (wang ∩ gfgk = 3, golfdata ∩ wang = 7, golfdata ∩ gfgk = 2):** i praksis
  ufarlige, siden scopene aldri nøstes. Unntaket er `--dur-fast`/`--dur-slow`, som er deklarert i
  **alle fire** filene med potensielt ulike verdier — den eneste ekte firdelte kollisjonen.

### 2.4 Aliaslagene

Tre lag i globals.css, som beskrevet i oppdraget, bekreftet:

```
Lag 1  råverdi     --sand-50, --graphite-0, --lime-500                (:root, linje 17)
Lag 2  DS-navn     --bg: var(--sand-50)                               (linje 203) / var(--graphite-0) (263)
Lag 3  shadcn-form --color-background: var(--bg)                      (@theme inline, linje 319)
```

Pluss et fjerde, uavhengig system: hsl-tripletter som `--background: 60 15.8% 96.3%` (linje 19). De
deler ikke mekanisme med lag 1–3 og må behandles separat.

`@theme inline` inneholder **144 navn**. Det er dette blokken som gjør tokens til Tailwind-utilities
(`bg-background`, `text-ink`, `shadow-deck`), og derfor det eneste laget komponentkode ser via
klassenavn.

**`--handling`:** deklarert på `globals.css:766` som `var(--v2-handling)`. Låst 2026-07-31 — ikke rørt.
Men målt: `var(--handling)` har **null** konsumenter i hele repoet, og utility-ene `bg-handling` /
`text-on-handling` brukes i **0 filer**. Den låste kjeden som faktisk er koblet går
`--v2-handling` (763) → `--color-handling` (340) → utility. Aliaset på linje 766 er ubrukt.
*Rør det likevel ikke uten ny beslutning fra Anders* — dette er en observasjon, ikke et forslag.

---

## 3. Død vekt

Metode, tre passeringer: (1) navn i `globals.css` som aldri opptrer i noen annen fil i `src/`,
(2) minus dem som `var()`-refereres inne i globals.css selv, (3) for navn i `@theme inline`: sjekk om
det bare navnet opptrer i komponentkode i det hele tatt (dekker `bg-*`/`text-*`/`shadow-*`-bruk).

| Passering | Antall |
|---|---:|
| Unike navn i globals.css | 340 |
| Aldri referert utenfor globals.css | 116 |
| …og heller ikke `var()`-brukt inne i globals.css | 112 |
| Herav i `@theme inline` (kunne vært brukt som utility) | 84 |
| **Ekte døde — verken `var()` noe sted, eller i `@theme inline`** | **28** |
| **Av de 84: navnet opptrer ikke i komponentkode i det hele tatt** | **33** |
| **Sum navn uten noen målt konsument** | **61 av 340 (18 %)** |

**De 28 rene døde:**

`--handling`, `--on-handling` (se §2.4 — låst, ikke rør) · `--lime-bg`, `--lime-bg-2` ·
`--t-bg`, `--t-bg-1`, `--t-bg-2`, `--t-bg-4`, `--t-fg-2`, `--t-fg-4`, `--t-line-2`, `--t-line-soft`,
`--t-up`, `--t-up-bg`, `--t-down`, `--t-down-bg`, `--t-info`, `--t-warn` (hele `--t-*`-familien,
18 navn, ingen konsument) · `--v2-card-shadow`, `--v2-font-display`, `--v2-font-ui`, `--v2-r-card`,
`--v2-r-input`, `--v2-r-panel`, `--v2-r-pill`, `--v2-r-row`, `--v2-r-sheet`, `--v2-r-tag`
(hele `--v2-r-*`-radius-familien).

**De 33 utility-døde (mest åpenbare kandidater):**

`--color-rail-bg`, `--color-rail-bg-cockpit`, `--color-nav-bg`, `--color-nav-active`,
`--color-coach-content`, `--color-coach-sidebar-border`, `--color-player-content`,
`--color-tab-active-bg`, `--color-tab-active-text`, `--color-surface-deck`, `--color-ink-subtle`,
`--color-alert-coral`, `--color-accent-deep`, `--color-accent-soft`, `--color-brand-accent-hover`,
`--color-brand-primary-deep`, `--color-forest-deep`, `--cream-2`, `--muted-2`, `--sand-deep`,
`--lime-dim`, `--duration-micro`, `--sh-sm`, `--sh-md`, `--sh-lg`, `--sh-forest`,
`--shadow-card-hover`, `--gradient-avatar-2/3/4/5/7/8` (avatar 1 og 6 brukes, 2–5 og 7–8 ikke).

Merk `--color-coach-sidebar*` og `--color-rail-bg-cockpit`: coach-sidebar-tokenene fra session 1 er
altså i hovedsak ubrukte — sidebar-en er bygget med andre verdier.

**Forbehold, ærlig sagt:** passering 3 er en navnesøk-heuristikk. Et navn som konstrueres dynamisk
(`` `bg-${farge}` ``) vil telles som dødt. Ingenting på denne listen bør slettes uten en manuell
gjennomgang per navn. **Ingenting er slettet her.**

---

## 4. Tre veier videre

Felles forutsetninger for alle tre: 250 filer bruker `var(--…)` direkte, 636 filer har inline
`style={{`, 618 komponentfiler finnes, 131 filer ligger under `(legacy)`-ruter (42 admin + 34 portal
`page.tsx`, 76 til sammen).

### @layer-fella — slår inn i alle tre

`globals.css` bruker `@layer` nøyaktig to steder, begge `@layer base` (linje 516 og 529).
Kommentaren på linje 514 forklarer hvorfor:

> `NB: i @layer base — unlayered CSS ville slått ut ALLE border-fargeklasser (border-primary,
> border-accent, …) siden unlayered vinner over @layer utilities.`

Regelen: **ulaget CSS vinner over all laget CSS**, inkludert Tailwinds `@layer utilities`. Det gir to
feilmåter for en ny tokenfil, og de er motsatte:

- **Legges den ulaget** (som `golfdata-tokens.css` er i dag, importert på 636 uten `@layer`): den vinner
  over Tailwind-utilities. For rene variabeldeklarasjoner er det harmløst — variabler kolliderer ikke
  med utilities. Men i samme øyeblikk filen også inneholder én eneste *regel* (f.eks. `.kort { border-color: … }`),
  slår den ut alle `border-*`-klasser globalt. Nøyaktig fella linje 514 beskriver.
- **Legges den i `@layer base`**: den taper mot enhver `@layer utilities`-regel, og mot all eksisterende
  ulaget CSS i globals.css — som er det aller meste av filen. Da får den ikke effekt der den skal.

**Konklusjon som gjelder uansett vei:** et nytt tokensett må være *rene variabeldeklarasjoner, uten en
eneste selektorregel*, og lastes ulaget. Blandes tokens og komponentregler i samme fil, er
border-regresjonen garantert. Dette bør skrives inn som en gotcha før noen porterer noe.

### (a) Erstatt alt

Slett de fire filene, én ny kilde.

| | |
|---|---|
| Filer som må endres | 4 tokenfiler + `globals.css` + minst de 250 `var(--…)`-filene. Med inline-styles i tillegg: opp mot 636. `[anslag]` — eksakt tall krever navn-for-navn-mapping mot et tokensett som ikke finnes på disk. |
| Hva brekker | Alle 111 golfdata-navn forsvinner samtidig fra 167 portal-ruter + 42 legacy-admin-ruter. `.wang-tp` og `.gfgk-jr` mister sine 78 + 63 navn på 9 microsite-ruter. |
| Legacy-rutene | Verst her. 76 legacy-`page.tsx` (131 filer) er per definisjon ikke rekomponert — de leser golfdata-tokens direkte. Fjernes kilden, faller de til ustilte fallback-verdier på én gang. |
| @layer | Én kilde å plassere riktig — enklest av de tre, hvis regelen over følges. |
| Reell blokkering | Kan ikke gjøres i det hele tatt før designbiblioteket er på disk (§6). Uten fasit finnes det ingen målverdi å erstatte med. |

### (b) Nytt sett ved siden av, gradvis migrering

Ny fil med eget navnerom, flate for flate.

| | |
|---|---|
| Filer som må endres | 1 ny fil + 1 linje i `globals.css` for å starte. Deretter én flate om gangen. |
| Hva brekker | Ingenting ved innføring, forutsatt eget navnerom uten kollisjon mot de 340 + 111 + 78 + 63 eksisterende navnene. Krever en navnekollisjonssjekk før første commit — den er billig, kommandoen finnes i §2. |
| Legacy-rutene | Rører dem ikke. De 76 legacy-rutene beholder golfdata-tokens til de rekomponeres — som er akkurat rekkefølgen `admin/(legacy)/layout.tsx:9` allerede beskriver («rekomponeres til v2 bølgevis»). |
| @layer | Én ny ulaget variabelfil, ingen selektorregler. Lavest risiko. |
| Kostnad | Token-tellingen går opp før den går ned. Repoet har midlertidig fem tokensystemer i stedet for fire, og §5 i CLAUDE.md advarer eksplisitt mot «nye parallelle token-systemer». Den advarselen må adresseres direkte overfor Anders, ikke omgås. |

### (c) Mapp nye navn til eksisterende aliaslag

Behold lag 1–3, la nye navn peke inn i dem: `--nytt-navn: var(--bg)`.

| | |
|---|---|
| Filer som må endres | Kun `globals.css` (ett nytt aliaslag). Færrest filer av alle tre. |
| Hva brekker | Ikke noe umiddelbart — og det er problemet. Mappingen arver **alle** de eksisterende feilene: de 94 uaktiverbare `[data-theme="dark"]`-deklarasjonene, de tre parallelle mørk-mekanismene, og de 61 navnene uten konsument. Et nytt designsystem som mappes ned på et lag 2 som ikke virker i mørkt tema, virker heller ikke i mørkt tema. |
| Legacy-rutene | Uendret — men golfdata-scopet overstyrer fortsatt alt på 209 ruter (§2.1), så de nye navnene får *ikke* effekt der de mappes til noe golfdata omdeklarerer. Det er 111 av navnene. |
| @layer | Ingen ny fil, ingen ny risiko. |
| Kostnad | Et fjerde aliaslag oppå tre eksisterende. Neste agent må forstå fire indirektiner for å endre én farge. |

---

## 5. Anbefaling

**Vei (b) — nytt sett ved siden av, gradvis migrering — men med en forutgående ryddejobb som gjøres først
og alene.**

Begrunnelsen, i rekkefølge etter vekt:

1. **(a) er ikke gjennomførbar nå.** Designbiblioteket er ikke på disk (§6). En erstatning uten fasit
   er gjetting på 758 deklarasjoner. Veien er ikke feil på sikt, den er umulig i dag.
2. **(c) sementerer tre målte feil.** Å mappe inn i lag 2 arver de 94 døde mørk-deklarasjonene, de tre
   mørk-mekanismene og golfdata-overstyringen på 209 ruter. Et nytt designsystem som ikke virker i mørkt
   tema på PlayerHQ er ikke et nytt designsystem.
3. **(b) er den eneste veien der noe kan verifiseres underveis.** Én flate om gangen betyr én flate å
   sammenligne mot fasit når fasiten kommer — i stedet for 454 ruter samtidig.
4. **(b) matcher rekkefølgen repoet allerede har valgt.** `admin/(legacy)/layout.tsx:9` sier
   «rekomponeres til v2 bølgevis». Legacy-rutene *skal* ligge på golfdata-tokens til bølgen når dem.
   Vei (b) er den eneste som ikke bryter med den planen.

**Forbeholdet, sagt rett ut:** CLAUDE.md arbeidsregel 5 sier «ikke opprett nye parallelle token-systemer».
Vei (b) gjør nettopp det, midlertidig. Jeg anbefaler den likevel, fordi alternativene er verre — men
Anders må si ja til akkurat det, ikke bare til «vei b». Anbefalingen bør derfor komme med en
avviklingsbetingelse: det nye settet er *ikke* permanent parallelt, og golfdata-tokens.css slettes når
siste av de 209 rutene er migrert.

**Ryddejobben som må gjøres først, før noe nytt sett innføres** — den er uavhengig av hvilket
designsystem som kommer, og blir bare dyrere å utsette:

1. **Avklar mørk-tema-mekanismen.** Tre parallelle systemer, ett dødt. Bestem at `data-v2-tema` er den
   ene, og dokumentér at `[data-theme]` (94 deklarasjoner) er uaktiverbart. Ikke slett ennå — men ikke
   la et nytt tokensett kobles til en mekanisme som ikke virker.
2. **Skriv @layer-regelen som gotcha:** tokenfiler = rene variabeldeklarasjoner, ulaget, null
   selektorregler. Ellers gjentas border-regresjonen fra linje 514.
3. **Bekreft at golfdata-tokens eier PlayerHQ.** Dokumentasjonen kaller den et overgangslag; målingen
   sier den er hovedkilden for 209 ruter. Til det er avklart, vil enhver port bomme på omfanget.

Steg 1–3 er dokumentasjon og beslutning, ikke kode. De kan gjøres nå, uten designbiblioteket.

---

## 6. Designbiblioteket er ikke på disk

Verifisert i dag, samme resultat som session 1:

- De 78 komponentene og 19 HTML-fasitflatene finnes ikke i repoet.
- Ikke i hjemmekatalogen.
- Ikke på noen branch. `chore/paper-speil-lokal`, som `.claude/rules/beslutninger.md` viser til,
  **finnes ikke på origin**.
- `designsystem/paper/` finnes ikke.

**Konsekvensen er absolutt:** ingenting kan verifiseres mot fasit. Ingen port kan starte, ingen
tokenverdi kan sjekkes, og §5-anbefalingens steg «migrer én flate» har ingen målestokk før dette er løst.

**Hva Anders må gjøre — én av disse:**

1. **Push branchen.** Hvis `chore/paper-speil-lokal` finnes på en lokal maskin:
   `git push -u origin chore/paper-speil-lokal`. Da blir speilet tilgjengelig for alle sesjoner.
2. **Eksportér fra Open Design** (`be6bdcb8-…` / Claude Design `605a48cc`) og legg filene i repoet under
   f.eks. `designsystem/paper/`, i egen branch + PR.
3. **Legg dem i en delt katalog** utenfor repoet, og oppgi den absolutte stien — men da må stien være
   tilgjengelig fra sesjonens maskin, ikke bare fra Anders' egen.

Alternativ 1 er raskest hvis branchen finnes lokalt. Alternativ 2 er det som varer, siden det legger
fasiten under versjonskontroll sammen med koden som skal matche den.

**Uverifiserte forhold, oppgitt som mangler og ikke gjettet:**

- **Supabase MCP** krevde OAuth og var utilgjengelig også i denne sesjonen. Ingen DB-tall er hentet
  eller estimert.
- **De fire ekstra kolonnene på `service_types`** (`billingInterval`, `sessionsPerPeriod`,
  `includesPlayerHq`, `rolloverUnused`) pluss tre CHECK-constraints er ikke reverifisert her — de er
  irrelevante for tokenbeslutningen. `prisma migrate dev` er ikke kjørt, i tråd med instruksen.
