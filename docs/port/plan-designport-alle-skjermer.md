# Plan — port alle skjermer til Claude Paper

**Skrevet:** 02.08.2026 · **Status:** GODKJENT OG I GANG (Anders 2026-08-03) — se svar nederst
**Gjelder:** hele appen — PlayerHQ, AgencyOS, marketing, booking, foreldreportal, WANG, GFGK

Dette er planen for at appens skjermer faktisk skal se ut som Claude Design-prosjektet
**«AK Golf HQ — Claude Paper»** (`claude.ai/design/p/605a48cc-81e8-44bd-94d2-07d50a97370a`).

Ingen kode er endret. Ingen token-fil er rørt. Planen er ikke godkjent.

---

## 0. To ting som må sies først

### 0.1 Paper-designet finnes ikke på disk

Verifisert i fase 1 §6 og bekreftet i dag: de 78 komponentene og fasitskjermene finnes bare
inne i Claude Design-prosjektet. Ikke i repoet, ikke på noen branch —
`chore/paper-speil-lokal` finnes ikke på origin, og `designsystem/paper/` finnes ikke.

**Uten fasit på disk kan ingen skjerm sammenlignes mot noe.** Det er derfor fase 1 stoppet.

Løsningen er ikke noe Anders må gjøre: Claude har lesetilgang til prosjektet via `DesignSync`
og kan laste det ned selv. Det er steg 1.

### 0.2 Planen bryter en låst regel — Anders må si ja til akkurat det

`CLAUDE.md` invariant 2 (låst 31.07.2026) sier at full Paper-port til `src/` skjer **etter** at
FØR/UNDER/ETTER-piloten er evaluert; fram til da ligger appen på v2-tokens + `--handling`
(`#D97757`). Se `docs/gjenstaaende-plan-2026-07-31.md` §1.1.

Denne planen ER den porten. Den skal ikke startes før Anders eksplisitt overstyrer invariant 2.

### 0.3 /design-sync er feil verktøy for dette

`/design-sync` sender komponenter **fra koden til** Claude Design, så designagenten kan tegne
med ekte deler. Den henter aldri design tilbake til appen. Den kan derfor ikke løse denne
oppgaven, og skal ikke kjøres mot `605a48cc` — prosjektet er håndbygget og ville fått
mesteparten av `components/`, `guidelines/` og `tokens/` slettet av opprydningssteget.

---

## Grunnlag (målt, ikke antatt)

Fra `docs/port/fase0`–`fase4`, alle merget til main 02.08.2026:

| Størrelse | Målt | Kilde |
|---|---:|---|
| Token-deklarasjoner i 6 CSS-filer | 758 | fase 1 §0 |
| Ruter som henger på `golfdata-tokens.css` | 209 | fase 1 §1.1 |
| Mørk-tema-mekanismer i parallell (én død) | 3 | fase 1 §2 |
| Døde `[data-theme]`-deklarasjoner | 94 | fase 1 §2 |
| Hardkodede farger i `style={{}}` | 419 i 132 filer | fase 4 |
| …av disse ekte nye farger uten token | 16 | fase 4 |
| …gjennomsiktighetsvarianter (trenger én alpha-skala) | 102 av 118 umatchede | fase 4 |
| Paper-komponenter som skal portes | 78 | fase 1 §6 |
| Paper-fasitskjermer (HTML) | 19 | fase 1 §6 |

Fase 1 §5 anbefaler **vei (b)**: nytt tokensett ved siden av dagens, gradvis migrering, med
avviklingsbetingelse. Denne planen følger den anbefalingen.

---

## Stegene

### Steg 1 — Hent Paper ned i repoet
Last alle komponenter, tokens, fonter og fasitskjermer fra Claude Design til
`designsystem/paper/`. Egen gren + PR. Etter dette er fasiten versjonskontrollert sammen med
koden som skal matche den, og tilgjengelig fra enhver maskin og enhver økt.
**Endrer ingen skjerm.**

### Steg 2 — Fasit-listen
Én tabell: hver Paper-skjerm ↔ hvilken ekte rute i appen den svarer til, bygget fra
`docs/MASTER-SKJERMPLAN.md`. Viser hvilke skjermer som har fasit, og hvilke som må designes
fra bunnen fordi Paper ikke har tegnet dem. Dette er grunnlaget for å tallfeste steg 7–9.
**Endrer ingen skjerm.**

### Steg 3 — Rydd mørk-tema-mekanismene
Tre parallelle systemer, ett dødt (94 deklarasjoner som aldri aktiveres). Velg én mekanisme
(`data-v2-tema` er kandidaten per fase 1 §5). Må skje før nye farger kobles på, ellers arves
feilen inn i det nye settet.

### Steg 4 — Paper-tokens inn ved siden av dagens
Farger, avstander, radius, skygger og fonter fra Paper som eget sett. Dagens sett røres ikke.
Ingen skjerm endrer utseende ennå. Med eksplisitt avviklingsbetingelse:
`golfdata-tokens.css` slettes når siste av de 209 rutene er migrert (fase 1 §5).
Merk `@layer`-regelen fra fase 1: tokenfiler = rene variabeldeklarasjoner, ingen selektorregler.

### Steg 5 — Bygg om de delte byggeklossene
Knapper, kort, felt, tabeller, overskrifter, lister. Hevstangen i hele porten: én riktig knapp
blir riktig på alle skjermene som bruker den, samtidig.

### Steg 6 — Fjern de 419 hardkodede fargene
419 fargeliteraler i 132 filer. 16 trenger nye tokennavn; 102 løses av én felles alpha-skala;
93 av 419 sitter i `boxShadow` og trenger en skygge-skala `T` ikke har i dag (fase 4 §7).
Uten dette steget overstyrer inline style Paper uansett hva steg 4 gjør.

### Steg 7 — Bølge 1: PlayerHQ
Spillerappen, skjerm for skjerm mot fasiten fra steg 2. Størst volum, og flaten som vises i
piloten. Deles i 4–6 PR-er når skjermantallet er kjent.

### Steg 8 — Bølge 2: AgencyOS
Coach-siden, inkludert de 42 legacy-rutene under `src/app/admin/(legacy)/` som i dag henger på
det gamle tokensettet.

### Steg 9 — Bølge 3: resten
Marketing, booking, foreldreportal, WANG (`team-wang`, 3 ruter), GFGK (`gfgk-junior`).

### Steg 10 — Steng døra
Slett det gamle tokensettet. Legg inn automatisk sjekk i `npm run verify` + CI som stopper nye
hardkodede farger. `scripts/check-token-gap.mjs` bygges fra fase 4 §8 (`tmp-gap-3-match.mjs`).
Uten dette siger designet tilbake i løpet av måneder — den gamle hex-gaten ble fjernet
26.07.2026 nettopp fordi den var ute av synk.

---

## Arbeidsmåte

- **Én PR per steg**, aldri én stor. Anders ser resultatet og kan stoppe når som helst.
- **Skjermbilder i hver PR:** før / etter / Paper-fasit side om side. Vurderes med øynene.
- `docs/MASTER-SKJERMPLAN.md` hakes av i SAMME commit som skjermen endres (prosjektregel).
- `npm run verify && npm test` grønt før hver PR. Aldri merge noe rødt.

## Tidsbilde

Steg 1–4 er raske (opprydding + grunnmur). Steg 5–6 er den tyngste enkeltjobben. Steg 7–9 er
der de fleste øktene går. Flere uker med korte økter — ikke én kveld. Ingen timeanslag oppgis,
fordi skjermantallet ikke er kjent før steg 2.

---

## Svar fra Anders (2026-08-03)

1. **Overstyres invariant 2? Ja.** Bekreftet eksplisitt 2026-08-03 kveld etter at steg 1–6 og
   steg 7 PR1 (PR #275) allerede var merget til main på løpende «ja» per PR — denne bekreftelsen
   formaliserer det som i praksis allerede var i gang. `CLAUDE.md` invariant 2 og
   `.claude/rules/beslutninger.md` er oppdatert til å vise dette.
2. **Kjøres steg 1 og 2?** Ja — begge gjort. Paper ligger i `designsystem/paper/` (25
   fasitfiler i `fase1/`), fasit-listen er `docs/port/fasit-liste-paper.md` (19 av 343 skjermer
   har fasit).

## Status per steg (oppdatert 2026-08-04 natt)

| Steg | Status |
|---|---|
| 1 — Hent Paper ned | Ferdig |
| 2 — Fasit-listen | Ferdig |
| 3 — Rydd mørk-tema | Ferdig (PR #256) |
| 4 — Paper-tokens ved siden av | Ferdig (PR #260) |
| 5A — Farger inn i `--v2-*` | Ferdig (PR #262) |
| 5B — Form: radius/avstand/typografi | Ferdig (PR #270–273) |
| 6 — Fjern 419 hardkodede farger | Ferdig (PR #274) |
| 7 — Bølge 1: PlayerHQ | I gang — se delstatus under |
| 8 — Bølge 2: AgencyOS | Ikke startet — venter på 2 avklaringer (§ Åpne punkter i fasit-listen) |
| 9 — Bølge 3: resten | Ikke startet — venter på at WANG/GFGK legges inn i MASTER-SKJERMPLAN |
| 10 — Steng døra (lint-gate) | `scripts/check-token-gap.mjs` bygget og koblet inn i verify+CI — [PR #279](https://github.com/akgolfsoftware/Golf_Headquarters/pull/279), IKKE merget ennå |

### Steg 7 delstatus (PlayerHQ, 151 skjermer)

> ⚠ **AVVIK FUNNET 2026-08-04 (Anders så skjermene selv):** PR1–PR4 er merget med riktige
> tokens, men **skjermene matcher ikke fasitens layout og interaksjonsmønster.** «Merget» i
> tabellen under betyr IKKE ferdig — se §Avviksliste og §Revidert steg 7-plan lenger ned.
> Rotårsak: ingen av PR-ene ble visuelt sammenlignet mot fasit før merge (PR1 sa det til og
> med selv i beskrivelsen). Ny FAST regel (beslutninger.md 2026-08-04): **skjermbilde-gate** —
> ingen skjerm-PR merges uten app/fasit side om side i PR-beskrivelsen.

**De 6 fasit-dekkede rutene:**

| Rute | Status |
|---|---|
| `/portal` (Hjem) | Merget (PR #275) — **må ombygges, se avviksliste A1** |
| `/portal/planlegge` | Merget (PR #276) — **må ombygges, se avviksliste A2** |
| `/portal/analysere` | Merget (PR #277) — mangler «Én ting nå» (A3); full visuell kontroll gjenstår |
| `/portal/meg` | Merget (PR #278) — mangler «Én ting nå»/lydsamtykke (A4); full visuell kontroll gjenstår |
| `/portal/booking` | [PR #281](https://github.com/akgolfsoftware/Golf_Headquarters/pull/281) åpnet 2026-08-04, IKKE merget — bygget om til timer/credits-oversikt som landing (Anders' instruks), ikke restyling av den gamle 4-stegs veiviseren |
| `/portal/planlegge/workbench` (Workbench mobil) | Mobilflaten `WorkbenchV2Mobil.tsx` finnes og er ferdig — men fasitens **Testbatteri-ark** (`sheetTest`, Tester-seksjon per økt) er IKKE bygget, se ny beslutning under |

### Avviksliste (verifisert mot fasit + kode 2026-08-04)

**Systemisk (alle 4 portede skjermer):** «Én ting nå»-mønsteret — fasitenes kjerne, den ENE
oransje handlingen (#D97757) som endrer tilstand — er ikke implementert på noen av dem.
Tokenet finnes (`T.handling`, låst 2026-07-31); det brukes bare ikke slik fasitene krever.

- **A1 — Hjem `/portal` (størst):** (1) layout — fasit er `rail 64px + tråd 720px +
  artefaktpanel 360px` fast kolonne med composer festet nederst; koden mangler høyrekolonnen
  og composer flyter. (2) «Én ting nå»-systeminnlegget (uoppfordret «Dagens økt starter om …»
  + «Start økta») mangler. (3) Tom tilstand («Anders har ikke publisert uke N ennå» + 3 veier
  videre) mangler. (4) Toppheader-kontekst (navn · kat · SG · dato) mangler. (5) Fangst-knapp
  i topplinja mangler.
- **A2 — Planlegge:** (1) full skjermbredde i stedet for fasitens 720px-kolonne. (2) FEM
  konkurrerende CTA-er (tre til Workbench) — bryter Enkelhet-regelen «én primær CTA»; fasiten
  har én aksenthandling (dokken «Start [økta] · 16:00»). (3) Tre døde KPI-tankestreker som
  hovedoppslag. (4) Gammelt v2-typografispråk («Din *uke*») i stedet for fasitens kompakte
  topplinje. (5) Kjempehøye dagpiller + enorme tomtilstandskort.
- **A3 — Analysere:** «Én ting nå» («Legg inn [område]-økt denne uka» — følger av analysen)
  mangler; NesteFokus-kortet finnes men uten handlings-mønsteret. 5 faner vs fasitens 3 er
  dokumentert bevisst (behold alle funksjoner) — avklaringspunkt, ikke feil.
- **A4 — Meg:** «Én ting nå: Gi lydsamtykke» mangler — `LydSamtykke`-modellen FINNES i
  Prisma, så datamodell-unnskyldning gjelder ikke. Detalj-ark-mønsteret må sjekkes visuelt.

### Ferdig-definisjon per skjerm (2026-08-04 — dette betyr «ferdig» fra nå av)

En skjerm er ferdig når ALLE punktene under er vist og godkjent — ikke når CI er grønn:

1. **Skjermbilde sendt Anders i samtalen** (synlig fra iPhone — ikke bare GitHub-lenke):
   mobil **390px** alltid først, deretter desktop 1280px. Tatt av kjørende app
   (Vercel-preview), innlogget testbruker med ekte data (Øyvind Rohjan / `demo@akgolf.test`).
2. **Lys OG mørk modus** — begge fotograferes (kjent felle: primary=accent-kollisjonen som
   ga usynlig tekst 24 steder i steg 3).
3. **Fasit ved siden av** — samme utsnitt fra `designsystem/paper/fase1/`-fila.
4. **Alle fasit-tilstander finnes:** Suksess / Tom / Laster / Feil — fasitene har eksplisitt
   tilstandsbryter for alle fire; koden må ha ærlig tom tilstand med én vei videre (regel),
   ikke blank flate (det var Hjem-feilen).
5. **«Én ting nå»-monopolet:** maks ÉN oransje handling (#D97757) synlig — tell dem på
   skjermbildet.
6. **Copy fra `docs/skjermtekst/`** — ikke diktet tekst; norsk bokmål; «Hvorfor dette
   tallet»-utvidelse på tall fasiten har det på.
7. **Klikk-verifisert, ikke bare fotografert:** ark/sheets åpner, primærhandlingen gjør noe,
   ingen konsollfeil (samme krav som `kjerne-klikk.spec.ts` stiller).
8. **MASTER-SKJERMPLAN-raden oppdateres i samme commit** (prosjektregel), og hakene settes
   først når punktene over er godkjent av Anders — aldri før.

### Revidert steg 7-plan (2026-08-04, én PR per skjerm, skjermbilde-gate på alle)

1. **PR-A — Hjem:** skallet (3 kolonner, composer nederst) + «Én ting nå» + tom tilstand +
   toppheader + fangst.
2. **PR-B — Planlegge:** 720px-kolonne, én aksenthandling (dokk), stram dagstripe + agenda,
   fjern KPI-lik og CTA-kaos.
3. **PR-C — Analysere** mot fasit (inkl. «Én ting nå»).
4. **PR-D — Meg** mot fasit (inkl. lydsamtykke).
5. **PR-E — Testbatteriet i Workbench** (Anders 2026-08-04): tester planlegges som del av
   økter i Workbench — fasiten `workbench-mobil.html` har designet dette ferdig (`sheetTest`,
   `erTest`, Tester-seksjon per økt). Resultat fra gjennomført test
   (`/portal/tren/tester/[testId]/gjennomfor` — én av de 8 uportede) skal synce direkte til
   TalentHQ (`/portal/talent/*`, 5 skjermer, live men skjult fra meny siden D1 2026-07-15).
   Uavklart før bygging: hvilke av DBs 36 testprotokoller spilleren skal se (Anders: 21,
   CANON: 20) + om TalentHQ skal tilbake i menyen.
6. **PR-F — DataGolf inn i PlayerHQ** (Anders 2026-08-04): `/stats/*`-skjermene ligger i dag
   kun under marketing; `/portal/stats` er en ren redirect UT av portalen. Omfang/plassering
   (egen flate vs. Analyse-faner) avklares med Anders før bygging.
7. **Deretter:** de 8 uportede Gjennomføre/live-skjermene (må komponeres — ingen fasit
   tegnet), så steg 8 (AgencyOS — konsollen er samme klasse ombygging som Hjem: chat-først
   fasit vs. dashbord-kode) og steg 9.

**De 145 skjermene uten fasit — kartlagt, tallet korrigert 2026-08-04 natt** ([PR #280](https://github.com/akgolfsoftware/Golf_Headquarters/pull/280), `scripts/paper-port-triage.mjs`, IKKE merget):

Første gjennomgang (samme kveld) meldte «31 `(legacy)`-skjermer, reelt gjenstående arbeid» — det var
feil, rettet under samme natt før noe ble bygget på feil grunnlag. Alle 54 filene i «ingen v2-import»-
bøtta ble sjekket individuelt for linjetall og innhold: **51 av 54 er 4–15 linjer lange redirect-
stubber** (`redirect("/portal/…")`, samme mønster/kommentar «Legacy → moderne PlayerHQ-rute (B / v2)»
i alle), som peker videre til allerede-porta v2-ruter. Ikke skjermer i det hele tatt — ingen UI å porte.
Kun **3 er reelle, uportede skjermer:**

| Kategori | Antall | Merknad |
|---|---:|---|
| Bruker allerede v2-komponenter | 113 | Arver trolig Paper-paletten automatisk (steg 5–6 er globale) — sannsynligvis lite/ikke gjenstående arbeid, ikke visuelt bekreftet skjerm for skjerm |
| Rene redirect-stubber (`(legacy)/*` + resten av «13 andre») | 46 | **Ikke skjermer.** 4–15 linjer, kun `redirect("/portal/…")` til kanoniske v2-ruter — samme lærdom som Analysere-falsk-alarmen: verifiser før noe meldes som gjenstående arbeid |
| **Reelt uportede skjermer** | **8** | Alle under `(fullscreen)/live/[sessionId]/{active,brief,page,summary,tapper}`, `(fullscreen)/runde/{live,logg}`, `(fullscreen)/tren/tester/[testId]/gjennomfor` — PlayerHQ Gjennomføre/live-økt, ingen Paper-fasit tegnet |
| **Sum uten v2-import** | **54** | |

**To rettelser i tallet samme natt — begge dokumentert i git-historikken, ikke skjult:** først meldt
«31 (legacy)-skjermer er reelt arbeid» (feil — de er redirect-stubber). Så meldt «kun 3 reelt uportede»
(også feil — skriptets første redirect-sjekk hadde ingen linjegrense, så 5 ekte skjermer på 64–107
linjer under `(fullscreen)/live/[sessionId]/` ble telt bort fordi de har ÉN `redirect()`-linje som
auth-guard øverst i en ellers reell side). Skriptet (`scripts/paper-port-triage.mjs`) fikk en
linjegrense (`STUB_MAKS_LINJER=20`) for å skille ekte auth-guard-redirects fra rene stubber.

**Konsekvens:** de 8 reelle skjermene er alle i Gjennomføre/live-økt — matcher godt med
`docs/port/fasit-liste-paper.md` sitt opprinnelige «PlayerHQ Gjennomføre: 0 fasit, 18 uten fasit»
(MASTER-SKJERMPLAN teller trolig flere tilstander/faner per rute som egne rader). `(legacy)`-mappa
og de andre redirect-stubbene er derimot IKKE gjenstående arbeid — `docs/MASTER-SKJERMPLAN.md` er
ikke krysssjekket mot dette funnet ennå og har sannsynligvis stale rader for disse, bør ryddes før
steg 8/9 planlegges på samme antatte skala som steg 7.

## Fortsett fra en annen maskin

```
cd ~/Developer/akgolf-hq && claude
```
Deretter: «les `docs/port/plan-designport-alle-skjermer.md` og kjør steg 1».
