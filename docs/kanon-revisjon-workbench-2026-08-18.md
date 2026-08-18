# Kanon-revisjon — Workbench-leveransen

**Dato:** 2026-08-18
**Type:** Lese- og rapporteringsjobb — ingen filer endret.
**Metode:** Grep-basert gjennomgang av seks filer (til sammen 9737 linjer) mot kanon i
`src/lib/pyramide.ts`, `src/app/globals.css`, `.claude/rules/beslutninger.md` og global
`CLAUDE.md`. `DESIGN-FASIT.md`/`PORT-README.md` ble **ikke funnet** under `designsystem/paper/`
med de navnene — nærmeste treff er `designsystem/paper/readme.md` (generell designsystem-fasit)
og `.claude/rules/beslutninger.md` (produktbeslutninger). Dette er ikke en linje-for-linje
lesning av alle 9737 linjer — funnene er grep-verifiserte, ikke en fullstendig sveip. Flagg selv
om noe virker utelatt.

## Filer i revisjonen

1. `designsystem/paper/fase1/workbench-desktop.html`
2. `designsystem/paper/fase1/workbench-mobil.html`
3. `designsystem/paper/fase1/workbench-stall.html`
4. `designsystem/paper/fase1/workbench-stall-mobil.html`
5. `designsystem/paper/fase1/workbench-turnering.html`
6. `designsystem/paper/templates/agencyos-workbench/AgencyosWorkbench.dc.html`

---

## 1. Funnliste per sjekkpunkt

### 1. Pyramideområder — Grønt

Kun `FYS/TEK/SLAG/SPILL/TURN` funnet i formel-objektene, rekkefølge nedenfra matcher
`PYR_REKKEFOLGE` i `src/lib/pyramide.ts`.

- **Funn:** `workbench-desktop.html:842` — «En **FYSISK** drill har ingen AK-formel»
  — prosatekst, ikke UI-label/kode-token.
  **Regel brutt:** Kanon-ord er `FYS` som forkortelse, `Fysisk` som fullt ord
  (jf. `PYR_LABEL.FYS = "Fysisk"`). «FYSISK» i versaler midt i forklarende setning er
  inkonsekvent stavemåte, ikke selve pyramideordet.
  **Forslag:** Bruk «Fysisk» (kanon-casing) i prosatekst.
  Alvor: lavt.

### 2. Budsjett — Se konflikt A, ikke rødt/grønt

Kode-kommentar i `workbench-desktop.html:1365–1381` dokumenterer at hele regel-/lås-laget
(inkl. «Overstyr med begrunnelse») er bevisst fjernet 01.08.2026 på Anders' eksplisitte
beskjed. Nåværende KPI-stripe (`workbench-desktop.html:744`) viser kun målte tall («3 t 30 min»,
«uke 32») — ingen nevner av typen «9 t av 5–8 t», ingen TEK-andel i %, ingen aldersregel synlig
i UI.

- **Funn:** `workbench-desktop.html:1898` — «TEK-andelen holder seg på 18 %» i en
  agent-forslagstekst. Prosentbegrepet finnes altså ett sted, men ikke systematisk på
  budsjettlinjer.
  **Se full drøfting under Konflikt A.**

### 3. AK-formel — Grønt for v2-formatet

Alle formel-strenger funnet (`TEK_INNSPILL_50_LAV_HAST_TRENINGSOMRADE_ALENE` osv.,
desktop/mobil/stall linje 811–2162) følger `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`-
mønsteret fra `beslutninger.md`.

- **Merk:** Ingen `AkFormelVelger`-komponent finnes i kodebasen (0 treff i `src/`).
  Sjekkpunktets premiss om at v3-kaskade «kun via AkFormelVelger» kan derfor ikke
  verifiseres — komponenten eksisterer ikke ennå. Ikke et brudd, men udekket premiss.

### 4. L-faser — Rødt (rapportert rent, ingen anbefaling om harmonisering)

To konkurrerende serier, jf. åpen konflikt hos Anders:

- **Serie L-CTRL/L-BALL/L-COMP** — kun i `AgencyosWorkbench.dc.html`:
  - linje 103: `lfase: "L-BALL"`
  - linje 252: `lfaser: ["L-CTRL", "L-BALL", "L-COMP"]`
- **Serie L_KROPP/L_ARM/L_AUTO** — 0 treff i noen av de seks filene.

**Tilleggsfunn (samme fil):** `AgencyosWorkbench.dc.html:131,134,143` bruker i tillegg den
eksakte økt-ID-en `TEK_TEE_L-BALL_CS60_M2_PR2` og varianter
(`TEK_ARG_L-CTRL_CS50_M1_PR3`, `TEK_TEE_L-BALL_CS40_M1_PR1`).

- **Regel brutt:** Dette er ordrett ID-en som global instruks navngir som utdatert mønster
  («TEK_TEE_L-BALL_CS60_M2_PR2 — den er utdatert som mønster»), pluss CS-nivå (uavklart,
  skal spørres om før bruk i noe nytt) og M/PR-koder — erstattet av Belastning/Press per
  `workbench-desktop.html:855`: «M0–M5 er erstattet av Belastning, PR1–PR5 av Press».
  **Forslag:** Erstatt hele ID-mønsteret i `AgencyosWorkbench.dc.html` med v2-mønsteret
  brukt i fase1-filene (`PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`), og fjern CS-nivå
  inntil Anders har avklart skalaen.

De fem fase1-filene bruker verken L-CTRL/L-BALL/L-COMP eller L_KROPP/L_ARM/L_AUTO — de
bruker MOTORIKK-stegene `UTEN_BALL/LAV_HAST/AUTO` (desktop:893, mobil:682), som matcher
`beslutninger.md`s bekreftelse av v2. Kun template-filen bryter.

### 5. Agentflyt — Gult

Stort sett grønt i fase1-desktop/mobil:

- `PlanAction PENDING` eksplisitt kommentert: `workbench-desktop.html:909–910`,
  `workbench-mobil.html:807`.
- «Godkjenn»/«Avvis»-knapper funnet flere steder: desktop:1955,1957; mobil:1422,1424.

- **Funn:** `AgencyosWorkbench.dc.html:68` — «Godkjenn»-knapp via
  `x-import ListRow … actionLabel="Godkjenn"` uten synlig «Avvis»-motpart eller
  «Hvorfor?»-forklaring i samme utsnitt.
  **Regel brutt:** Punkt 5 krever Godkjenn/Avvis parvis med «Hvorfor?» (agent · data · regel).
  **Forslag:** Legg til Avvis-knapp og Hvorfor-lenke ved siden av Godkjenn, eller bekreft at
  disse finnes lenger ut i komponenten (ikke fanget av dette grep-utsnittet) — bør sjekkes
  mot full komponentkildekode.

### 6. Ghost — Grønt

«ghost-blokk(er)» brukt konsekvent: `workbench-desktop.html:779,981,1020`. Ingen
alternative ord funnet (forslag-boks/AI-blokk/preview-blokk: 0 treff). Ingen
auto-send/autoSend-funn i noen av de seks filene.

### 7. Blokk-typer — Grønt (skole-dimming ikke visuelt verifisert)

- `workbench-stall-mobil.html:1020` lister `okt/gruppe/booking` som kildefelt-typer —
  konsistent med kanon-listen.
- `workbench-desktop.html:1208` bekrefter «skole og bookinger er låste lag».
- `workbench-desktop.html:1526` — «konflikt mot låste lag — varsel, aldri blokkering»
  (matcher invariant 1: anbefalinger sperrer aldri).

- **Udekket:** Ingen eksplisitt «skole er dimmet OG låst»-visuell-sjekk funnet i grep.
  **Forslag:** Verifiser visuelt (skjermdump/render), ikke bare tekstlig — grep kan ikke
  bekrefte CSS-dimming.

### 8. Raster og tid — Rødt

- **Funn:** `workbench-stall-mobil.html:544` — «Stripa er **06:00–22:00**»
- **Funn:** `workbench-stall-mobil.html:821` — «Stripa dekker 06:00–22:00»
  **Regel brutt:** Kanon-raster er 05:00–23:00 (punkt 8 i sjekklisten). Dette er nøyaktig
  den typen rest sjekklisten ber om å flagge.
  **Forslag:** Oppdater begge steder til 05:00–23:00, SLOT=30, ⇧=5 min — som resten av
  filene allerede gjør.

De fire andre filene med tidsakse bruker korrekt mønster:
`T_START = 5*60, T_SLUTT = 23*60, SLOT = 30` — desktop:1241, mobil:755, stall:1057.

- **Udekket:** `workbench-turnering.html` og `AgencyosWorkbench.dc.html` har ingen
  tidsaksedefinisjon i det hele tatt (0 treff på T_START/T_SLUTT-mønster). Ikke
  nødvendigvis et avvik — kan være at disse visningene ikke bruker tidsraster — men
  udekket av grep, bør bekreftes.

### 9. Roller — Gult

- «coach eier»-teksten finnes i `workbench-stall.html:924,975` og i
  `workbench-stall-mobil.html` (gruppeøkt-mekanikken generelt) — **men kun i stall-filene**.

- **Funn:** `workbench-desktop.html` og `workbench-mobil.html` — 0 treff på «coach eier»
  eller «coach-endring».
  **Regel brutt:** Punkt 9 krever at coach-endring merkes «coach» i spillerens logg, og at
  gruppeøkt vises låst «coach eier» i spillermodus — i alle relevante visninger, ikke bare
  stall-varianten.
  **Forslag:** Bekreft om funksjonen bevisst ikke er bygget i desktop/mobil ennå (fase1 er
  ikke ferdig), eller om ordet/mekanikken er droppet der. Hvis sistnevnte: legg til
  «coach eier»-låsing og logg-attribusjon i desktop/mobil før port.

### 10. Språk — Gult

- **Funn:** «Ingen data» — 0 treff i alle seks filer. Ingen brudd på tomtilstand-regelen der.
- **Funn:** To Unicode-dingbats brukt som statussymboler (ikke fargede emoji, men
  bør likevel byttes):
  - `⚠` — `workbench-desktop.html:1534`
  - `✓` — `workbench-desktop.html:1540`, `workbench-mobil.html:1299`,
    `workbench-stall.html:1488`, `AgencyosWorkbench.dc.html:309`
  **Regel brutt:** Global CLAUDE.md: «Aldri emoji i kode eller UI — bruk Lucide-ikoner.»
  **Forslag:** Bytt `⚠` → Lucide `AlertTriangle`, `✓` → Lucide `Check`.
- **Ikke sjekket eksaustivt (for stort omfang for grep i denne runden):** komma-desimal på
  alle tallfelter, mono-klasse på alle tallfelter. Bør sjekkes visuelt eller med målrettet
  grep per tallformat ved neste runde.

### 11. Navnekanon — Rødt

- **Brudd, gjentatt:**
  - `workbench-stall.html:941` — `n:'Emma Sæther', ini:'ES', alder:15, skole:'WANG'`
  - `workbench-stall-mobil.html:750` — samme
  - `AgencyosWorkbench.dc.html:18,285` — «Emma Sæther», «Emma S.»
  **Regel brutt:** Primær demospiller skal være Øyvind Rohjan.
  **Forslag:** Erstatt alle forekomster av Emma Sæther med Øyvind Rohjan i disse tre filene.

- Øyvind Rohjan funnet korrekt i: desktop (1×), mobil (1×), stall (2×), stall-mobil (1×) —
  **sameksisterer** altså med Emma Sæther i tre av filene (stall, stall-mobil, template).

- **Åpent funn:** `workbench-turnering.html` bruker helt andre demo-navn
  (Max Risvåg, Sondre U. Thøgersen — linje 601–602) og har 0 treff på Øyvind Rohjan.
  Usikkert om turneringsvisningen skal ha egen deltakerliste (flere spillere i samme
  turnering, naturlig med andre navn) eller om den også skal referere hovedspilleren
  et sted. **Ikke flagget som sikkert brudd** — avklar med Anders.

- Markus Røinås Pedersen: 0 treff i noen av de seks filene — ingen konflikt, ikke rørt.

### 12. Tokens — Gult, betydelig avvik på prefiks

- **Funn:** Ingen av de seks filene importerer `tokens/akhq-tokens.css` via lenke — alle
  (unntatt template) definerer et eget `:root`-blokk med hardkodede hex-verdier direkte i
  `<style>` (desktop:34–170, identisk struktur i mobil/stall/stall-mobil/turnering).
  Filen sier selv i kommentar (desktop:9): «akhq-tokens.css v3.1 — KOPIERT VERBATIM.
  Eneste tokenkilde» — altså **tilsiktet kopi-inline**, ikke frihånds-hex. Verdiene
  stemmer 1:1 med kanon-fargene i `src/app/globals.css`
  (`#788c5d`=FYS/olive, `#c46686`=SPILL/fig, `#d97757`=accent/clay).
  **Regel brutt:** Sjekkpunkt 12 krever `--p-*`-prefiks. Disse filene bruker
  `--bg/--fg/--accent` osv. **uten** `--p-`-prefiks.
  **Se Konflikt B** — uklart om `--p-*` faktisk er påkrevd prefiks for disse HTML-filene.

- Oransje `#d97757` (`--accent`) er kun koblet til `--focus` og kommentert
  «kun 'Én ting nå' + focus i app» (desktop:67) — konsistent med produktbeslutning A3.
  Ingen brudd på oransje-begrensningen.

- **Funn:** `[data-theme="dark"]`-JS-en i disse filene er ikke merket som demo-stillas
  noe sted i grep-treffene.
  **Forslag:** Bekreft mot CLAUDE.md invariant 2 / beslutning A4 (auth alltid lys) om
  denne tema-vekslingen skal merkes eksplisitt som midlertidig demo-rigging før port.

---

## 2. Konfliktliste

### Konflikt A — Budsjett-sjekkpunktet mot faktisk produktbeslutning

Sjekklisten (fra revisjonsoppdraget) krever at hver budsjettlinje har nevner, TEK-andel i
%, aldersregel brutto, og at brudd vises som «Overstyr med begrunnelse».

**Sitat A (sjekkliste / global CLAUDE.md):**
> «TEK min 15 %» (global instruks, §Faglig grunnlag)
> «hver budsjettlinje har nevner … invariantbrudd er anbefaling med
> 'Overstyr med begrunnelse'» (revisjonsoppdraget)

**Sitat B (kode, gjeldende — `workbench-desktop.html:1365–1381`):**
> «Fjern alle regler og låser nå. Alt dette må jobbes med mer nøyaktig» (Anders, 01.08.2026)
> «Ingen CANON-score, ingen tak, ingen terskler, ingen 'overstyr'. […] Når reglene er
> gjennomarbeidet settes de tilbake her.»

Koden dokumenterer også at ni invarianter i `src/lib/canon/invarianter.ts` ikke stemmer
med de tre i `canon-invariants-13.md`, at periodetak og aldersregel gir sprikende svar, og
at TEK-minimum varierer per periode (25 %/15 %) — ikke flatt 15 % slik global CLAUDE.md
sier.

**Vurdering:** Dette er ikke en feil i leveransen — det er et bevisst, villet, midlertidig
produktvalg (Anders har eksplisitt bedt om at reglene fjernes til de er gjennomarbeidet).
Sjekklisten er ikke oppdatert mot dette valget. Løses ikke her — rapporteres som konflikt,
ingen side velges.

### Konflikt B — `--p-*`-prefikset finnes ikke i verifiserbar form for disse filene

Sjekkpunkt 12 krever `--p-*`-prefiks per «PORT-README §7», men ingen fil med det navnet
ble funnet under `designsystem/paper/`. `src/styles/paper-tokens.css` (nevnt i prosjektets
`CLAUDE.md` under Fonter) bruker riktignok `--p-font-sans` osv. — altså finnes
`--p-`-prefikset et sted i det virkelige systemet, men workbench-HTML-filene bruker det
ikke, og ingen funnet kilde sier autoritativt at disse spesifikke HTML-filene *skal* bruke
`--p-`-prefiks fremfor sitt eget lokale `:root`-sett.

**Vurdering:** Åpent — ikke avgjort her. Anbefales avklart med hvem som eier
PORT-README-innholdet (finnes det i det hele tatt under det navnet, eller har det fått et
annet filnavn/lokasjon?).

---

## 3. Status per sjekkpunkt

| # | Sjekkpunkt | Status |
|---|---|---|
| 1 | Pyramideområder | Grønt (ett lavt-alvor tekstavvik) |
| 2 | Budsjett | Konflikt A — ikke rødt/grønt |
| 3 | AK-formel | Grønt (AkFormelVelger finnes ikke i kode ennå) |
| 4 | L-faser | **Rødt** — L-CTRL/L-BALL/L-COMP + utdatert ID i AgencyosWorkbench.dc.html |
| 5 | Agentflyt | Gult — én knapp uten synlig Avvis/Hvorfor i template |
| 6 | Ghost | Grønt |
| 7 | Blokk-typer | Grønt (skole-dimming ikke visuelt verifisert) |
| 8 | Raster og tid | **Rødt** — 06:00–22:00-rest i workbench-stall-mobil.html |
| 9 | Roller | Gult — coach-attribusjon mangler i desktop/mobil |
| 10 | Språk | Gult — ⚠/✓ bør være Lucide-ikoner, ellers grønt |
| 11 | Navnekanon | **Rødt** — Emma Sæther i tre filer |
| 12 | Tokens | Gult — inline-kopi uten `--p-`-prefiks, uavklart mot kanon (Konflikt B) |

## Dom

**Leveransen er ikke klar for port.** `templates/agencyos-workbench/AgencyosWorkbench.dc.html`
bærer utdaterte L-fase/CS/M/PR-mønstre og feil demo-navn, og `workbench-stall-mobil.html` har
et gammelt tidsraster; disse tre filene (template, stall, stall-mobil) bør rettes eller
eksplisitt skilles ut fra leveransen før de tre øvrige (desktop, mobil, som i hovedsak er
kanon-tro) sendes videre. `workbench-turnering.html` bør avklares separat (egen navnekanon
for turneringsdeltakere, ikke dekket av tidsraster-grep).

## Anbefalt rekkefølge for retting (uten at revisjonen selv utfører noe)

1. **Navnekanon** (pkt 11) — mekanisk søk-og-erstatt Emma Sæther → Øyvind Rohjan i tre filer.
   Lavest risiko, høyest hastegrad siden det er gjentatt tre steder.
2. **Raster** (pkt 8) — to linjer i `workbench-stall-mobil.html`, samme mekaniske fiks som
   resten av filsettet allerede har.
3. **L-faser/ID-mønster** (pkt 4) — krever mer omtanke: hele `AgencyosWorkbench.dc.html`
   må konverteres fra L-CTRL/L-BALL/L-COMP + CS/M/PR til v2-mønsteret. Størst omfang,
   bør gjøres som egen oppgave, ikke i samme slag som de to over.
4. Gule funn (pkt 5, 9, 10, 12) tas etter de røde, i den rekkefølgen Anders prioriterer.
