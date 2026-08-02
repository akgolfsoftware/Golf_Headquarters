# Fase 3 — inline-style-kartlegging

**Dato:** 2026-08-02 · **Branch:** `claude/inline-style-mapping-oayctz` · **Base:** `main` @ `ef400f1`
**Sesjon 4 i port-kjeden.** Sesjon 1 kartla repoet, sesjon 2 skrev token-fil-underlaget,
sesjon 3 avklarte mørkt tema. Denne sesjonen kartlegger inline `style={{ }}`.

**Ingen kode er endret.** Dokumentet er beslutningsunderlag, ikke en implementasjon.

Alle tall under er målt med to skript kjørt mot `src/` på commit `ef400f1`
(brace-matchende uttrekk av hvert `style={{ … }}`-uttrykk, ikke linje-grep).
Tall som ikke er målt er merket `[anslag]`. Ingen slike finnes i dette dokumentet.

---

## 0. Hvorfor dette er blokkeringen

Inline `style` skrives til elementets `style`-attributt. Det ligger over enhver
CSS-regel i kaskaden (kun `!important` i stilark slår det). Et nytt tokensett byttes
ved å endre variabelverdier i CSS — den endringen når **ikke** en inline-verdi som er
en literal hex. En inline-verdi som er `var(--noe)` følger derimot byttet automatisk.

Skillet mellom disse to er hele porten. Derfor er hovedtallet ikke «13 953 inline
styles», men «698 hardkodede fargeliteraler i 144 filer».

---

## 1. Omfang

| Mål | Antall |
|---|---|
| `.tsx`-filer med minst én `style={{` | **636** |
| `style={{ }}`-forekomster totalt | **13 953** |
| Filer med minst én hardkodet farge i inline style | **144** |
| Hardkodede fargeliteraler (`#hex`, `rgb()`, `rgba()`, `hsl()`) i inline style | **698** |
| `.ts`-filer (ikke-tsx) med `style={{` | **0** |

### 1.1 Per rutegruppe og komponentmappe

Kolonnen «hardk.» er antall fargeliteraler, ikke antall forekomster.

| Gruppe | Filer | Forekomster | Hardk. farger | Filer m/hardk. |
|---|---:|---:|---:|---:|
| `components/portal` | 158 | 4 187 | 120 | 34 |
| `components/admin` | 124 | 2 970 | 44 | 22 |
| `components/marketing` | 43 | 1 734 | 45 | 19 |
| `components/v2` | 26 | 1 411 | 36 | 13 |
| app: microsites (`gfgk-junior`, `team-wang`, `team-gfgk`) | 30 | 903 | 65 | 13 |
| app: marketing (`(marketing)/`, `akgolf-*`) | 35 | 809 | **255** | 14 |
| app: admin | 44 | 553 | 9 | 3 |
| app: portal | 51 | 521 | 5 | 2 |
| `components/athletic` | 45 | 199 | 1 | 1 |
| `components/stats` | 20 | 162 | 25 | 6 |
| app: øvrig (`onboard/`, `inviter/`, `meg/`, `offline/` m.fl.) | 8 | 138 | 45 | 3 |
| `components/auth` | 2 | 88 | 4 | 1 |
| `components/meg` | 1 | 47 | 1 | 1 |
| `components/shared` | 11 | 42 | 6 | 3 |
| `components/teknisk-plan` | 5 | 41 | 17 | 2 |
| app: (internal) | 6 | 38 | 12 | 3 |
| app: auth | 3 | 31 | 4 | 1 |
| `components/widgets` | 4 | 31 | 0 | 0 |
| **app: admin/(legacy)** | **4** | **13** | **0** | **0** |
| `components/blogg` | 3 | 10 | 0 | 0 |
| `components/sg-hub` | 4 | 7 | 1 | 1 |
| `components/workspace` | 1 | 5 | 1 | 1 |
| `components/hubs` | 1 | 4 | 0 | 0 |
| `components/hole-analysis` | 1 | 3 | 0 | 0 |
| `components/coachhq` | 2 | 2 | 2 | 1 |
| `components/ui` | 2 | 2 | 0 | 0 |
| `components/gruppe-kalender` | 1 | 1 | 0 | 0 |
| `components/planlegge-v2` | 1 | 1 | 0 | 0 |
| **Sum** | **636** | **13 953** | **698** | **144** |

### 1.2 Tre funn å merke seg

1. **`components/` bærer 78 % av volumet** (10 947 av 13 953 forekomster). `src/app/`-rutene
   selv har 3 006. Porten er et komponentarbeid, ikke et rutearbeid — å telle 454 ruter
   overvurderer arbeidsmengden kraftig.
2. **`app: marketing` har 255 av 698 hardkodede farger på bare 809 forekomster** — 36,5 %
   av all hardkodet farge i 5,8 % av forekomstene. Fire filer under
   `(marketing)/stats/` står alene for 205 av dem (se §4). Dette er ikke jevnt fordelt
   teknisk gjeld; det er fire filer.
3. **`admin/(legacy)` har 0 hardkodede farger på 13 forekomster i 4 filer.** De 42
   legacy-admin-rutene som `.golfdata-scope` dekker (jf. sesjon 3) er praktisk talt
   inline-style-frie. Mørketema-problemet der er et CSS-kaskadeproblem, ikke et
   inline-style-problem — de to blokkeringene overlapper nesten ikke.

---

## 2. Klassifisering av de 13 953 forekomstene

Kategoriene er gjensidig utelukkende og evalueres i denne rekkefølgen per forekomst:
hardkodet farge først (fordi den dominerer risikoen), deretter token, deretter
fargenøkkel uten literal, ellers geometri.

| # | Kategori | Definisjon (målt regel) | Antall | Andel |
|---|---|---|---:|---:|
| **b** | **Hardkodet farge — MÅ endres** | uttrykket inneholder `#rgb`/`#rrggbb`/`rgb(`/`rgba(`/`hsl(`/`hsla(` | **568** | 4,1 % |
| **a** | **Leser token — trygt** | ingen literal, men inneholder `var(--…)` og/eller `T.…` | **7 789** | 55,8 % |
| **c** | **Layout/geometri uten farge — irrelevant** | ingen literal, ingen token, ingen fargenøkkel | **5 318** | 38,1 % |
| **d** | **Dynamisk beregnet farge** | ingen literal, ingen token, men en fargenøkkel (`color`, `background*`, `border*Color`, `fill`, `stroke`, `boxShadow`, …) med verdi fra en variabel/prop/uttrykk | **278** | 2,0 % |

Merk at **b** teller *forekomster* (568), mens tabellen i §1 teller *literaler* (698) —
én forekomst kan inneholde flere farger (gradienter, `boxShadow` med to farger).

### 2.1 Kryssmål (overlappende, ikke additive)

| Mål | Antall |
|---|---:|
| Forekomster som bruker `T.…` (og ikke `var()`) | 6 804 |
| Forekomster som bruker `var(--…)` (og ikke `T.`) | 1 378 |
| Forekomster som bruker begge | 50 |
| Forekomster uten både token og fargeliteral | 5 721 |
| Forekomster med et dynamisk uttrykk (`${}`, ternær, `Math.`, `.map(`) | 2 623 |

**Konklusjon fra §2:** 96 % av all inline style overlever et tokenbytte uskadd — enten
fordi den peker på en variabel (a), eller fordi den ikke handler om farge i det hele tatt (c).
Kategori (d), 278 forekomster, følger tokenbyttet dersom kilden til den beregnede verdien
gjør det; kilden er nesten alltid `T.` eller en `var()` som er ført gjennom en prop.
**Den harde jobben er kategori (b): 568 forekomster / 698 literaler / 144 filer.**

### 2.2 Hvilke `var()`-familier inline style faktisk leser

156 unike variabelnavn brukes i inline style. Fordelt på familie (antall bruk):

| Familie | Bruk |
|---|---:|
| `--font*` (inkl. `--font-mono`, `--font-brand`, `--font-jr-mono`) | 650 |
| `--s-*` (golfdata-scope-tokens) | 376 |
| `--v2-*` (direkte, utenom `T`) | 111 |
| Andre (`--primary`, `--ink`, `--text-primary`, `--muted-foreground`, `--border`, …) | 1 269 |

At `--s-*` (golfdata-scope) leses direkte fra inline style i 376 tilfeller betyr at
golfdata-tokensettet ikke bare er et CSS-lag — det er også en runtime-kontrakt i JSX.
Det kan ikke fjernes uten å røre disse.

---

## 3. `src/lib/v2/tokens.ts` — T-objektet

**Fil:** 114 linjer. **Eksporter:** `T` (const), `AkseKey` (type), `fmtSg()`, `TOM_TALL`, `fmtTall()`.
`T` har **52 nøkler på toppnivå**, hvorav fire er nøstede objekter (`ax`, `tee`, `milepael`, `wrapped`).

**Konsumenter:** **202 filer** importerer fra `lib/v2/tokens`; **170** av dem importerer `T`
spesifikt. Fordeling: `components/marketing` 43 · `components/admin` 33 · `app/portal` 32 ·
`app/admin` 30 · `components/v2` 24 · `components/portal` 23 · resten ≤ 3 hver.

**Er verdiene `var()` eller hex?** Begge — målt: **29 `var(--v2-*)`-referanser** og
**20 hex-literaler** i filen.

De 29 `var()`-referansene er hele merkevare-/flate-/tekst-paletten: `bg`, `panel`, `panel2`,
`panel3`, `tint`, `border`, `borderS`, `track`, `fg`, `fg2`, `mut`, `forest`, `forestSoft`,
`lime`, `onLime`, `handling`, `onHandling`, `handlingSoft`, `up`, `down`, `warn`, `info`,
de fem `ax.*`, `nivaGrad` og `segSkygge`.

De 20 hex-verdiene er, per fil-kommentarene, bevisst innkapslet der **for at
komponentfilene skal forbli hex-frie**:

| Nøkkel | Verdi(er) | Begrunnelse i filen |
|---|---|---|
| `onForest` | `#FFFFFF` | hvit i begge temaer, derfor ikke CSS-var |
| `tee.hvit/gul/rod` | `#F5F5F5` `#FFD600` `#E53935` | ekte fysiske teefarger, ikke merkevare |
| `milepael.topp10/proDebut` | `#2EA66B` `#7B61FF` | badge-farger, ikke merkevare |
| `chartFaint` | `#B8B5AC` | 4. serie i putt-explorer |
| `tierCollegeBg` | `#E8F5F0` | «college»-tier-badge |
| `wrapped.*` (8 verdier, 4 gradienter + 2 tekstfarger) | `#005840`…`#101613` | eksporterbart delekort, tema-uavhengig |

I tillegg er `disp`/`ui`/`mono` font-stakker som strenger (ikke `var(--font-*)`), og
`displayXl`…`capsSm`, `rTag`…`rPill`, `gap`, `maxw`, `dur` er rene tall — geometri og
typeskala som **ikke** er CSS-variabler i det hele tatt.

### 3.1 Vurdering: bro eller andre kilde?

**T er en bro, ikke en konkurrerende kilde — for farge.** 29 av 29 merkevare-, flate-,
tekst- og signalfarger er `var(--v2-*)`-referanser. Bytter du verdien bak `--v2-bg`,
følger alle 6 804 `T.`-forekomster med uten at én linje JSX røres. Det er den enkeltmest
verdifulle egenskapen i hele kartleggingen.

**T er en andre kilde for tre ting**, og de må håndteres eksplisitt i porten:
1. **Geometri og typeskala** (`rCard: 20`, `numHero: 56`, `gap: 16`, `maxw: 1120`) — tall i
   TS, uten CSS-motpart. Et nytt tokensett som endrer radius eller typeskala i CSS treffer
   ikke disse. Dette er den stille bruddflaten.
2. **De 20 hex-verdiene** — semantisk riktige å ha utenfor temaet (tee-farger, delekort),
   men `wrapped.bgForest`/`bgLime` er merkevarefarger i forkledning og bør revurderes.
3. **Font-stakkene** som strenger i stedet for `var(--font-*)`, mens 650 inline-forekomster
   andre steder bruker `var(--font-*)`. To parallelle veier til samme font.

**Anbefaling for T:** behold og utvid. Riv ikke. T er allerede den mekanismen som gjør at
6 804 inline styles er trygge; å fjerne den ville konvertert dem til problemet vi prøver å
unngå. Gjør i stedet geometri- og fonttallene til `var()`-referanser i samme fil.

---

## 4. Verste enkeltfiler — topp 15 etter hardkodede farger i inline style

| # | Farger | Rutegruppe | Fil |
|---:|---:|---|---|
| 1 | 70 | app: marketing | `src/app/(marketing)/stats/sg-sammenlign/start/skjema.tsx` |
| 2 | 51 | app: marketing | `src/app/(marketing)/stats/sammenlign-spillere/resultat.tsx` |
| 3 | 47 | app: marketing | `src/app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx` |
| 4 | 37 | app: marketing | `src/app/(marketing)/stats/sg-sammenlign/page.tsx` |
| 5 | 26 | app: øvrig | `src/app/onboard/klubb/klubb-wizard.tsx` |
| 6 | 19 | app: marketing | `src/app/(marketing)/stats/sammenlign-spillere/page.tsx` |
| 7 | 14 | app: microsites | `src/app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx` |
| 8 | 14 | components/teknisk-plan | `src/components/teknisk-plan/oppgave-modal.tsx` |
| 9 | 13 | app: øvrig | `src/app/onboard/coach/coach-wizard.tsx` |
| 10 | 12 | app: marketing | `src/app/(marketing)/stats/turneringer/[slug]/page.tsx` |
| 11 | 12 | components/portal | `src/components/portal/v2/GuardianConsentV2.tsx` |
| 12 | 11 | app: microsites | `src/app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx` |
| 13 | 10 | app: microsites | `src/app/gfgk-junior/_components/gfgk-footer.tsx` |
| 14 | 10 | components/portal | `src/components/portal/live/LiveActive.tsx` |
| 15 | 9 | components/portal | `src/components/portal/v2/BreakTabellV2.tsx` |

Delt 16.–20. plass (9–8 farger): `components/v2/overlays.tsx` (9),
`(marketing)/stats/sammenlign-spillere/spiller-sok.tsx` (8),
`gfgk-junior/_components/treningspyramide.tsx` (8),
`components/portal/v2/WorkbenchV2Sheets.tsx` (8), `components/v2/domene.tsx` (8).

**Topp 15 dekker 355 av 698 literaler — 51 % — i 15 av 636 filer (2,4 %).**
Topp 6 alene (alle `stats/` + `onboard/`) dekker 250, altså 36 %.

Fordelingen er ekstremt skjev. Det er hovedargumentet for strategien i §5.

---

## 5. Anbefalt strategi — én anbefaling

> **Konverter kategori (b) til `T.`-referanser i tre bølger sortert etter tetthet, før
> tokensettet byttes. Ikke rør kategori (a), (c) eller (d). Ikke konverter inline style
> til Tailwind-klasser som del av porten.**

### Hvorfor akkurat denne

Alternativet som ligger nærmest — «gjør om alt inline style til klasser» — ville berørt
13 953 steder for å løse et problem som finnes 568 steder. Kostnaden er 25× arbeidet og
25× regresjonsflaten, for null ekstra gevinst ved tokenbyttet. Alternativet «bytt token
først, fiks farger etterpå» gir en periode der 144 filer viser gammel palett i ny app —
det er nøyaktig samme feilklasse som mørketema-bruddet sesjon 3 målte, og det vil bli
oppdaget av Anders før det blir oppdaget av oss.

### Rekkefølge

**Bølge 0 — utvid T først (blokkerer alt annet).**
Legg til nøklene som mangler for at bølge 1–3 skal ha noe å peke på. Målt behov: de 698
literalene faller i familiene nøytralgrå, suksess/feil-grønn/rød, statusgul, samt
mikrosite-farger (GFGK-junior har egen palett i `gfgk-junior-tokens.css`). Samtidig:
gjør `disp`/`ui`/`mono` til `var(--font-*)` og geometrien (`rCard`, `gap`, `maxw`,
typeskalaen) til `var()`-referanser med CSS-motpart. Uten dette steget vil bølge 1–3
finne på nye hex-verdier.

**Bølge 1 — topp 6 filer, 250 literaler (36 %).**
`(marketing)/stats/*` (5 filer, 224) + `onboard/klubb/klubb-wizard.tsx` (26).
Alle er marketing/onboarding — offentlige flater uten `.golfdata-scope`, uten
`data-v2-tema`-avhengighet, og med lav regresjonsrisiko fordi de ikke deler komponenter
med portal/admin. Riktig sted å lære mønsteret.

**Bølge 2 — mikrosites + resterende marketing, 141 literaler.**
Mikrosites (65 i 13 filer: `gfgk-junior`, `team-wang`), `components/marketing` (45 i 19 filer)
og resterende `app: marketing` utenfor topp 6 (31).
Mikrositene har egne scope-tokensett (`.gfgk-jr`, `.wang-tp`) og skal peke dit, ikke
til `--v2-*`. Dette er bølgen der man må bestemme om mikrosite-tokensettene overlever
porten — ta den beslutningen her, ikke i bølge 3.

**Bølge 3 — komponentbiblioteket og resten, 307 literaler i ~110 filer.**
`components/portal` (120), `components/admin` (44), `components/v2` (36),
`components/stats` (25), `components/teknisk-plan` (17), pluss `app: admin` (9), `app: portal` (5),
`app: (internal)` (12), `app: auth` (4) og resterende `onboard/`-flater (19).
Sist, fordi disse filene er delt på tvers av 209 `.golfdata-scope`-ruter og 167
portalruter — én feil her synes overalt. Krever visuell verifisering per fil.

**Deretter, og først da:** bytt tokenverdiene.

### Hva som brekker

| Risiko | Hvor | Hvorfor |
|---|---|---|
| **Geometri-drift** | overalt der `T.rCard`/`T.gap`/typeskalaen brukes | Tallene er TS-konstanter uten CSS-motpart. Endrer det nye systemet radius eller typeskala, endres CSS-siden alene og JSX-siden blir stående. **Dette er det mest sannsynlige stille bruddet.** Bølge 0 finnes for å hindre det. |
| **`--s-*`-kollisjon** | 376 inline-bruk av golfdata-tokens | Inline style leser `.golfdata-scope`-variabler direkte. Fjernes eller omdøpes `--s-*`, blir verdien `undefined` og elementet arver — ingen feilmelding, bare feil farge. Sjekk disse 376 før `golfdata-tokens.css` røres. |
| **Mikrosite-palett** | `gfgk-junior`, `team-wang` | Peker 65 literaler mot `--v2-*` uten å tenke, og GFGK-junior får AK-merkevarefarger. Bølge 2 må avklare eierskap først. |
| **`T.wrapped.*`** | delekortene i `components/stats` | Bevisst tema-uavhengige. Konverteres de til tokens, endrer delekortene seg med tema — det er en produktendring, ikke en portering. La dem være. |
| **`--handling`** | `T.handling` → `--v2-handling` → `--color-handling` | LÅST 2026-07-31. Kjeden må stå urørt gjennom alle bølger. |
| **Ingen automatisk gate** | hele porten | Hex-gaten i CI ble fjernet 2026-07-26 (CLAUDE.md). Ingenting hindrer at nye hex-verdier siger inn mens bølgene pågår. Vurder å slå gaten på igjen — kun for inline style, kun i `src/` — som første del av bølge 0. |

### Hva som ikke skal gjøres

- **Ikke** masse-konverter inline style til `className`. 5 318 geometri-forekomster har
  null verdi i porten.
- **Ikke** slett noe fra `T`. 170 filer importerer det.
- **Ikke** bytt tokenverdier før bølge 3 er ferdig.

---

## 6. Forslag til gotcha-tekst

Teksten under er **ikke lagt inn** i `.claude/rules/gotchas.md`. Legg den inn når porten
starter.

```markdown
### Inline style overlever ethvert tokenbytte — hardkodet farge i style={{ }} er usynlig gjeld (kartlagt 2026-08-02)
- Inline `style` skrives til elementets style-attributt og slår enhver CSS-regel i
  kaskaden. Endrer du en CSS-variabel, følger `style={{ color: "var(--v2-fg)" }}` med —
  men `style={{ color: "#101613" }}` gjør det ikke. Feilen er stille: ingen typefeil,
  ingen lint, ingen build-feil. Bare feil farge, i lys eller mørk modus eller begge.
- Målt i `src/` 2026-08-02: 13 953 `style={{ }}`-forekomster i 636 `.tsx`-filer. Av disse
  er 568 forekomster (698 fargeliteraler i 144 filer) hardkodet farge. Resten er trygge —
  7 789 leser token via `T.` eller `var()`, 5 318 er ren geometri.
- **Regel:** all farge i inline style skal gå via `T` fra `src/lib/v2/tokens.ts`, aldri
  via literal. Mangler fargen i `T`, legg den til der — ikke i komponenten. `T` er
  designet for dette; fil-kommentarene sier eksplisitt at hex innkapsles der «så
  komponentfilene forblir hex-frie».
- **Unntak som er lov:** farger som med hensikt er tema-uavhengige og allerede bor i `T`
  (`T.tee.*` fysiske teefarger, `T.milepael.*`, `T.wrapped.*` på eksporterbare delekort,
  `T.onForest`). De skal IKKE gjøres om til tokens — det ville endret produktet.
- **Felle nr. 2 — `T` er ikke bare farge.** `T.rCard`, `T.gap`, `T.maxw`, `T.numHero` og
  hele typeskalaen er rene TS-tall uten CSS-motpart, og `T.disp`/`T.ui`/`T.mono` er
  font-stakker som strenger. Endrer et designsystem radius eller typeskala i CSS, blir
  disse stående på gamle verdier. Sjekk dem eksplisitt ved enhver token-endring.
- **Felle nr. 3 — `--s-*` leses direkte fra JSX.** 376 inline-forekomster peker på
  `.golfdata-scope`-variabler (`--s-primary`, `--s-border`, `--s-muted-fg` m.fl.).
  Omdøper eller fjerner du dem i `src/styles/golfdata-tokens.css`, blir verdien
  `undefined` og elementet arver stille. Grep etter `--s-` i `*.tsx` FØR du rører den fila.
- **Ingen CI-gate fanger dette.** Hex-gaten ble fjernet 2026-07-26. Til den eventuelt
  kommer tilbake er dette et rent disiplinkrav.
- Fullt underlag med per-fil-tall: `docs/port/fase3-inline-style-kartlegging.md`.
```

---

## 7. Metode og forbehold

**Slik er det målt.** To Node-skript gikk rekursivt gjennom alle `.tsx` under `src/`,
fant hver `style={{`-sekvens og hentet ut hele uttrykket med brace-matching som hopper
over strenger og escapede tegn. Klassifiseringen er regex mot det uttrekte uttrykket.
Skriptene er engangsverktøy og er ikke committet.

**Forbehold.**
- `style={someVar}` (variabel i stedet for objektliteral) telles **ikke**. Kun
  `style={{`-mønsteret. Ukjent hvor mange slike finnes — ikke målt.
- Farger som konstrueres i JS utenfor `style`-uttrykket (`const FARGE = "#ABC"` lenger
  opp i fila, brukt via `style={{ color: FARGE }}`) telles som kategori (d), ikke (b).
  Antallet i (b) er derfor et **gulv**, ikke et tak.
- CSS-i-JS, `<style>`-tagger og `dangerouslySetInnerHTML` er ikke undersøkt.
- Kategori (c)/(d)-skillet hviler på en liste over fargenøkler; en uvanlig nøkkel
  (`accentColor`, `columnRuleColor`) kan havne i (c). Konsekvensen er liten fordi (b)
  fanges uansett på literalen.
- **Ikke verifisert mot designfasit.** Designbiblioteket (78 komponenter + 19
  HTML-fasitflater) er ikke på disk, og `chore/paper-speil-lokal` finnes ikke på origin.
  Ingen anbefaling her er sjekket mot Claude Paper.
- **Ikke verifisert mot DB.** Supabase MCP krever OAuth og har vært utilgjengelig i fire
  sesjoner. Ingen tall i dokumentet kommer fra databasen.
