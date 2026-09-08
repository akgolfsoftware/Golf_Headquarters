# Vurdering av Team WANG-flaten — 02.09.2026

Kilder lest denne runden: `akgolfsoftware/Golf_Headquarters@main` (`src/app/team-wang/**`,
`src/styles/wang-tokens.css`, `src/lib/gruppe-kalender/wang-turneringer.ts`), fasitfila
`fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html`, og designsystemet
`be77fcdb-7e1e-4341-aa67-23f21370ad8a` (`tokens/*`, `components/**`, 17 guideline-kort).
Ingen skjerm er tegnet om, ingen token er endret, fasitfila er ikke rørt.

---

## a. Sammendrag

Fellessiden er bygget 1:1 etter 25.08-fasiten og er den eneste flaten som er ferdig.
Kalenderen viser 17.08.2026 som «i dag» — en hardkodet dato, ikke systemdatoen.
Økt-detalj og hendelse-detalj finnes i kode, men ingen rute monterer dem lenger.
Trenerflaten og IUP kjører på demo-innhold, og testtallene i IUP mangler protokoll,
versjon og hvem som målte — TruthLayer er ikke oppfylt der tall om elever faktisk vises.
Fire av behovslistens seks punkter har ingen skjerm i det hele tatt.

---

## b. Systemnivå

Designsystemet `be77fcdb` har 44 komponenter i ni familier og seks token-filer. Golfskjermene
bruker fire av komponentene: `EventChip`, `IconChip`, `Tabs` og `CalendarView` (alle
x-importert i fasitfila). Resten av fasiten er inline markup på tokens. Det er ikke i seg
selv galt — men det betyr at tre av de fire brukte komponentene er de eneste stedene
designsystemet faktisk håndhever noe.

**Det golfskjermene trenger og som finnes:** hele fargelaget (`tokens/colors.css`), radius-,
skygge- og bevegelsesskalaen (`tokens/spacing.css`), typeskalaen (`tokens/typography.css`),
`EventChip`/`IconChip`/`Tabs`/`CalendarView`, samt `EmptyState`, `SkeletonLoader` og
`AlertBanner` i `components/feedback/` — de tre siste er tilgjengelige, men ikke tatt i bruk
på noen /team-wang-skjerm.

**Det som mangler for behovslista:** testkort med kildelinje (eier · protokoll/versjon · målt
av · hvem kan se), samlingskort med uttaksliste, og turneringsrad som håndterer både
gjennomført og kommende. Ingen av de 44 komponentene dekker dem.

**Utenfor omfang her:** mørk modus (tokens finnes under `[data-theme="dark"]` i speilet, men
26.08-beslutningen gjelder ikke /team-wang), Analyse, DataGolf og samtykkebryterne.

| Fil | Funn | Mål | Alvorlighet |
|---|---|---|---|
| `tokens/wang-tokens.css` (dette prosjektet) | Speilet mangler seks tokens og ett keyframe som finnes i `src/styles/wang-tokens.css`: `--text-on-dark-78/-85`, `--overlay-on-dark-06/-12`, `--surface-header`, `--wang-navy-deep-text`, `@keyframes wangArsplanFadeUp`. Speilet kan ikke brukes til `diff` slik LES-MEG.md lover. | 6 tokens + 1 keyframe | SVAKHET |
| `be77fcdb/tokens/spacing.css:23` | `--touch-min: 48px` er deklarert, men ingen /team-wang-komponent bruker den. | 48px deklarert, 0 bruk | SVAKHET |
| `be77fcdb/components/navigation/Tabs.jsx:35,50` | `md`-knappen er 9+13,5+9 = 31,5px høy, container-padding 4px ⇒ 39,5px total. | 39,5px < 44px | SVAKHET |
| `be77fcdb/components/core/IconChip.jsx:11` | `CHIP_COLORS.yellow` er rå hex `#C9A800` — eneste rå hex i fargekartet. Reprodusert i `arsplan-fasit-2026-27.ts:239`. | 1 rå hex, 2 steder | SVAKHET |
| `be77fcdb/components/chips/StatusChip.jsx:43` | `EVENT_DEFS.hendelse` er `pink`; koden (`fane-kalender-arsplan.tsx:30`) setter `hendelse` til `--cat-orange`. To sannheter for samme hendelsestype. | 2 farger, 1 type | SVAKHET |
| `be77fcdb/components/chips/StatusChip.jsx:39` | `EVENT_DEFS.konkurranse` (oransje) finnes, men koden har ingen konkurranse-type — turneringer vises som `prove` (lilla) med etiketten «Test og konkurranse». Turnering og test får samme farge. | 5 typer i DS, 4 i kode | SVAKHET |
| `fasit/arsplan-2026-27/ds-base.js:3` | Peker på `_ds/wang-toppidrett-software-be77fcdb-…/_ds_bundle.js`, som ikke finnes i dette prosjektet. Fasitfila kan ikke rendre sine fire x-import-komponenter lokalt. | 4 x-import, 0 løser | SVAKHET |
| `be77fcdb/components/**` | Ingen komponent for testresultat med kildelinje, samling med uttak, eller turneringsrad (historikk + kommende). | 3 manglende familier | BLOKKERER |

---

## c. Skjermregnskap

| Skjerm | Rute | Fasit | Kode | Funn | Alvorlighet |
|---|---|---|---|---|---|
| Fellesside · Trening (hero, årshjul, periodisering, månedsplan, ukeplan, øktplaner) | `/team-wang?fane=trening` | ja | ja | `fane-trening.tsx:120` legger til seksjonen `denne-uken`, som ikke finnes blant fasitens 12 seksjoner og ikke i sekundærnavigasjonen i `arsplan-shell.tsx:24`. | SVAKHET |
| Fellesside · Trening | samme | ja | ja | `fane-trening.tsx:53` og `fane-foreldre-arsplan.tsx:49` skriver hero-gradienten som literal i stedet for `var(--grad-hero-line)`, som er definert i tokens. To kopier å vedlikeholde. | SVAKHET |
| Fellesside · Trening | samme | ja | ja | `fane-trening.tsx:222`: `<Chip farge={fase.tekst} tint="var(--text-on-dark-dim)">` — tint-sloten får en hvit 72 %-overlay ment for mørk flate, på en lys tint-bakgrunn. Kontrasten er udefinert. | SVAKHET |
| Fellesside · Trening | samme | ja | ja | Radius utenfor skalaen (14/16/20/26/999): årshjulsøyler `borderRadius: 6` (`fane-trening.tsx:205`), fase-panel `14`, ukeplan-notat `12`, skolerute-ruter `10` (`fane-foreldre-arsplan.tsx:196`). `WangKort` (`primitiver.tsx:141`) hardkoder `20` i stedet for `var(--radius-card-sm)`. | POLERING |
| Fellesside · Trening/Foreldre/Kalender | samme | ja | ja | Farget topplinje på hvite kort: `fane-trening.tsx:130, 393, 431`, `fane-foreldre-arsplan.tsx:150`, `fane-kalender-arsplan.tsx:238`. Merkevareregelen er «aldri ramme på kort». | SVAKHET |
| Fellesside · Skole (timeplan, kompetansemål, prøver) | `/team-wang?fane=skole` | ja | ja/demo | `fane-skole.tsx:38`: timeplanrutenettet har `minWidth: 640` inne i `overflowX: auto` ⇒ horisontal scroll på 390. `wang-tokens.css` §`wang-spor` slår fast «aldri horisontal scroll». | SVAKHET |
| Fellesside · Skole | samme | ja | demo | VG1–VG3-kompetansemålene er ikke transkribert (kun WANG Ung finnes); `KM`/`KM_KRO` i `arsplan-fasit-2026-27.ts` er fasittekst uten Udir-kilde per mål. Timeplan per klasse har ingen datamodell. | BLOKKERER |
| Fellesside · Kalender (tidslinje/uke/måned/år) | `/team-wang?fane=kalender` | ja | ja | `fane-kalender-arsplan.tsx:301` og `:322`: «I dag» setter `setValgtDag("2026-08-17")`, og initialverdien er samme hardkodede dato — selv om `useOsloIdagIso` finnes i `primitiver.tsx:246`. Kalenderen viser aldri faktisk dagens dato. | BLOKKERER |
| Fellesside · Kalender | samme | ja | ja | Alle kalenderflater har `border: 1px solid var(--border-subtle)`: `UkeVisning:112`, `MaanedVisning:178`, `AarVisning:232`, `TidslinjeVisning:266`, dagradene i `ValgtDagKort:72`. Ramme på kort. | SVAKHET |
| Fellesside · Foreldre (ukessammendrag, foreldremøter, praktisk) | `/team-wang?fane=foreldre` | ja | demo | `UKESRAPPORTER` er statisk fasitdata i `arsplan-fasit-2026-27.ts`; ingen modell for at trener publiserer en rapport. Kortet lover «senest kl. 16 hver fredag» uten kilde som kan holde løftet. | BLOKKERER |
| Alle fire faner | `/team-wang` | ja | ja | Ingen laster- eller feiltilstand: all data er statiske `const`. Tom tilstand finnes to steder (`fane-trening.tsx:143`, `fane-foreldre-arsplan.tsx:32`). `EmptyState` og `SkeletonLoader` i be77fcdb er ubrukte. | SVAKHET |
| Alle fire faner | `/team-wang` | ja | ja | Trykkmål er 40px: `arsplan-shell.tsx:88` (fane-piller), `primitiver.tsx:163` (`PillGruppe`), `fane-kalender-arsplan.tsx:navBtn`, `fane-foreldre-arsplan.tsx:112` («Les»). Under 44px på 390, og under DS-ets eget `--touch-min: 48px`. | SVAKHET |
| Alle fire faner | `/team-wang` | ja | ja | `arsplan-shell.tsx:79–104` hånd-ruller pill-fanene; fasitfila (linje 507) spesifiserer be77fcdb-komponenten `Tabs`. To implementasjoner av samme kontroll. | SVAKHET |
| Økt-detalj (overlegg) | ingen | nei | ja, urutet | `okt-detalj.tsx` (17 060 B) importeres ikke av `arsplan-shell.tsx`. `page.tsx` rendrer kun `WangArsplanShell`; den eneste tidligere kalleren var `wang-fellesside.tsx`, som ikke lenger er koblet til ruten. | BLOKKERER |
| Hendelse-detalj (overlegg) | ingen | nei | ja, urutet | Samme som over: `hendelse-detalj.tsx` (3 493 B) har ingen kaller i den nåværende ruten. | BLOKKERER |
| Coach · årsplan | `/team-wang/coach` | historisk (`6061a53c`) | demo | `coach-arsplan.tsx:6`: «Demo-data; ingen ekte auth/DB ennå». Periodeinnholdet kommer fra `_data/coach-arsplan.ts:4` «Hardkodet demo». Pyramide, mål og tester vises som tall uten kildelinje. | SVAKHET |
| Coach · periode-detalj | `/team-wang/coach` (in-page) | historisk | demo | Periodevisningen er en tilstand inne i `coach-arsplan.tsx:697` («Alle perioder»-tilbakeknapp), ikke en egen rute. Kan ikke deles eller bokmerkes. | POLERING |
| Coach · årsplan og IUP | begge | historisk | demo | Skriftstørrelse under 12px (`--fs-label`, den minste deklarerte): `coach-arsplan.tsx:219, 490, 644, 954, 1023` (10–11,5px) og `iup-samtale.tsx:265, 781` (10 og 11px). | SVAKHET |
| IUP-samtale | `/team-wang/coach/iup/[elevId]` | ja (`6061a53c`) | ja | `page.tsx:127–148` henter `testResult` med `id, score, takenAt, test.name, test.pyramidArea` — ingen protokoll, versjon eller hvem som målte. TruthLayer krever alle tre på hvert tall om en elev. | BLOKKERER |
| IUP-samtale | samme | ja | ja | Positivt og verdt å bevare: tom tilstand er ekte (`iup-samtale.tsx:429` «Ingen testresultater registrert i denne perioden»), ingen oppdiktede tall, og ordet «vurdering» brukes konsekvent — «karakter» finnes ikke i fila. | — |
| Logg inn | `/team-wang/logg-inn` | nei | demo | `wang-login.tsx:334` har fritekstfeltet «Elevens navn» i en demo-brukeradministrasjon med `SEED: DemoBruker[] = []` (linje 25) — navn på mindreårige skrives inn i en visning som ikke lagrer noe. | SVAKHET |

---

## d. Gap mot behovslista

**1. Testing (testdag-føring, protokoller, resultater per elev med versjon) — MANGLER.**
Ingen skjerm finnes. `testResult` leses ett sted (`iup/[elevId]/page.tsx:127`) og der uten
protokoll/versjon/målt av. Testdag-føring for 10+ elever etter tur på samme øvelse finnes
verken som skjerm, komponent eller datakontrakt her. Manglende skjermer: testdag-føring,
protokolliste, protokoll-detalj (versjonert, låst ved første bruk), resultat per elev.

**2. Deling av data — DELVIS / TRAIN-LOCK.** Samtykke er Train-lock og skal ikke tegnes her.
Ukessammendrag til foreldre FINNES som visning (`fane-foreldre-arsplan.tsx`), men uten modell
— `UKESRAPPORTER` er statisk fasitdata. Dokumentdeling MANGLER helt. Manglende skjermer:
ukessammendrag-redigering (trener), dokumentliste.

**3. Golfstatistikk — TRAIN-LOCK-SKINN, ikke tegnet.** Skinn-mekanismen finnes teknisk:
`.wang-tp`-scopet i `src/styles/wang-tokens.css` er nettopp det mønsteret (samme som
`.gfgk-jr`). Men ingen Train-lock-visning er montert under `/team-wang`, så mekanismen er
udemonstrert. Ett skjermbevis mangler.

**4. Turneringer (alle som har vært OG alle som kommer) — MANGLER.**
`src/lib/gruppe-kalender/wang-turneringer.ts:78` henter kun `startDate: { gt: now }`, og
funksjonen kalles ikke fra noen fil under `src/app/team-wang/`. Kalenderen viser i stedet
statiske `ARSPLAN_EVENTS` for høsten 2026. Våren 2027 (Norgescup, Østlandstour vår, Srixon
Tour, NM) finnes ikke. Manglende skjerm: turneringsoversikt med historikk og kommende.

**5. Elevene (liste og elev-ark, kun innlogget) — DELVIS.** Liste FINNES:
`GruppeRoster` (`live-seksjoner.tsx`) rendres i `coach-arsplan.tsx:513` bak
`requirePortalUser({ allow: ["ADMIN","COACH"] })`. Elev-ark MANGLER — det nærmeste er
IUP-samtalen, som er én periode, ikke et ark. Manglende skjerm: elev-ark.

**6. Samlinger med hvem som er tatt ut — MANGLER.** `fane-samlinger.tsx` tilhører den gamle,
urutede fellessiden. I den gjeldende fasiten er samlinger kun uke-etiketter
(«Samlingsuke — WANG fellessamling med Oslo», uke 1 og 7). Ingen detalj, ingen uttaksliste,
ingen modell. Manglende skjermer: samlingsoversikt, samling-detalj med uttak.

---

## e. Spørsmål Anders må svare på

**1. B4 — skal `/team-wang/coach` bestå som egen flate, bli ren lesevisning, eller redirecte
til AgencyOS?** *Anbefaling:* behold ruten, men gjør den til ren lesevisning + roster + IUP-
lenker. All planlegging skjer i Workbench. Da slipper vi å vedlikeholde en demo-pyramide som
konkurrerer med AgencyOS, og trenerens navnebeskyttede rute beholder én grunn til å finnes.

**2. Skal økt-detalj og hendelse-detalj gjenopplives, eller slettes?** De er urutet kode i
dag. *Anbefaling:* gjenoppliv økt-detalj og koble den til Kalender-fanens dagkort (som
allerede har en `→`-knapp uten mål). Slett hendelse-detalj — den viser tittel, dato, sted og
tekst, som får plass i dagkortet.

**3. Skal kalenderens «i dag» flyttes til systemdato nå, eller vente på ekte data?**
*Anbefaling:* flytt den nå. `useOsloIdagIso` finnes allerede; det er én linje per sted, og
en kalender som påstår at det er 17. august er det første en elev legger merke til.

**4. B5 — skal skole- og foreldredata modelleres, eller forbli merket demo ut skoleåret?**
*Anbefaling:* forbli merket demo for VG-kompetansemål og timeplan, men modeller
ukessammendrag nå. Det er den ene foreldrefunksjonen som har en fast leveringsrytme (fredag
kl. 16) og derfor blir synlig løgn hvis den er statisk.

**5. Skal testtall vise kildelinje før eller etter at testdag-føring bygges?**
*Anbefaling:* før. Utvid `testResult`-lesingen i IUP med protokoll, versjon og målt av først
— da arver testdag-føringen kontrakten i stedet for å definere den på nytt.

---

## f. Prioritert rekkefølge for batch 1

| # | Hva | Hvorfor først | Filer |
|---|---|---|---|
| 1 | Kalender «i dag» = systemdato | Kjører på ekte data i dag, feil er synlig for alle, én linje per sted | `_components/arsplan-2026-27/fane-kalender-arsplan.tsx` |
| 2 | Kildelinje på testtall i IUP (protokoll · versjon · målt av) | TruthLayer er brutt der ekte elevtall faktisk vises | `coach/iup/[elevId]/page.tsx`, `coach/iup/[elevId]/iup-samtale.tsx` |
| 3 | Turneringer: fjern `gt: now`, koble `hentWangTurneringer` til Kalender-fanen | Datagrunnlaget finnes allerede i basen; behov 4 løses uten ny modell | `src/lib/gruppe-kalender/wang-turneringer.ts`, `_components/arsplan-2026-27/fane-kalender-arsplan.tsx` |
| 4 | Rute økt-detalj fra Kalender-fanens dagkort (avhenger av spørsmål 2) | Ferdig kode uten rute; `→`-knappen peker ingensteds i dag | `_components/okt-detalj.tsx`, `fane-kalender-arsplan.tsx` |
| 5 | Trykkmål 40 → 48px i alle pill-kontroller | Mobil 390 er førsteinntrykket, og 48px er DS-ets eget `--touch-min` | `arsplan-2026-27/primitiver.tsx`, `arsplan-shell.tsx`, `fane-kalender-arsplan.tsx`, `fane-foreldre-arsplan.tsx` |
| 6 | Timeplan uten horisontal scroll på 390, minimum 12px tekst | Skole-fanen er uleselig på telefon i dag | `_components/arsplan-2026-27/fane-skole.tsx` |
| 7 | Fjern kortrammer og topplinjer, samle radius på skalaen | Merkevareregel, og gjelder samtlige fire faner | `fane-kalender-arsplan.tsx`, `fane-trening.tsx`, `fane-foreldre-arsplan.tsx`, `arsplan-2026-27/primitiver.tsx` |
| 8 | Samkjør `EventChip`-typene: `konkurranse` egen type, `hendelse` én farge | To sannheter i dag; blokkerer turneringsraden i punkt 3 | `be77fcdb/components/chips/StatusChip.jsx`, `fane-kalender-arsplan.tsx` |
| 9 | Oppdater `tokens/wang-tokens.css`-speilet mot `src/styles/wang-tokens.css` | LES-MEG.md lover at `diff` skal være tom; den er ikke det | `tokens/wang-tokens.css` |
| 10 | Laster- og feiltilstand på de fire fanene med `SkeletonLoader`/`AlertBanner` | Kreves før noen fane bytter fra statisk fasit til live data (punkt 3) | `arsplan-shell.tsx`, alle fire `fane-*.tsx` |


## Tillegg 02.09.2026 — batch 1 tegnet

Alle ni manglende skjermer i gap-lista er tegnet i `skjermer-batch1/` (mobil 390 først, minst
to tilstander hver; b1, b7 også desktop 1280). De er forslag, ikke fasit: hver fil navngir
datamodell-hullet den forutsetter, og ingen av dem løser hullet. Fasitfila er urørt, ingen
nye tokens er innført, og de fire åpne beslutningene (B4, B5, VG-filter, periodegrenser) er
uendret. B6 er merket ANTAKELSE — at Train-lock kan scopes under `.wang-tp` uten å bryte egne
stiler er ikke verifisert i kode.


## Tillegg 07.09.2026 — batch 2 tegnet

De resterende skjermene er tegnet i `skjermer-batch2/` (c1–c9), og `skjermkart.html` samler
alle 23 skjermer med rute, behovsnummer og status. Med dette har hvert punkt i behovslista
minst én tegnet skjerm, og hvert BLOKKERER-funn i skjermregnskapet har en tegnet løsning:

- **C5** viser IUP med protokoll, versjon og målt av per tall — ved siden av dagens visning
  for sammenligning — samt tilstanden «ført under eldre versjon, kan ikke sammenlignes».
- **C3** gir `okt-detalj.tsx` et mål (dagkortets `→`-knapp) og tegner økt uten publisert plan.
- **C4** dekker turneringshistorikk og mellomrommet der runden er spilt men resultatet ikke
  importert — tilstanden som ellers ville framtvunget oppdiktede tall.
- **C9** erstatter timeplanens `minWidth: 640` med én dag av gangen, og viser utranskriberte
  VG-kompetansemål som tomt filter med begrunnelse framfor omskrevne mål.
- **C7** fjerner fritekstfeltet «Elevens navn» og samler rolle-rekkevidden på én skjerm.
- **C8** tegner laster, delvis feil, uten nett på testdag, og 403 — punkt 10 i batch 1.
- **C1** og **C2** løser behov 5 og 6 fullt ut: roster med egen rute og flervalg, og uttak der
  kriteriet skrives og låses før navnene publiseres.
- **C6** tegner B4 som et valg med kostnaden oppført, ikke som en anbefaling alene.

Fortsatt ikke tegnet, med vilje: samtykkebryterne (Train-lock), hendelse-detalj (anbefalt
slettet), mørk modus, Analyse og DataGolf. De fem spørsmålene i del e er uendret — ingen av
skjermene forutsetter et svar. Fasitfila er urørt, ingen nye tokens er innført, og ingen
repo-fil er endret.
