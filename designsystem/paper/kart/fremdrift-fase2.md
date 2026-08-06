# Fremdrift — fase 2 · morgenrapport 31.07.2026 (andre kjøring)

Autonom kjøring etter `kart/nattordre-2026-07-30.md`. Alt merket **[målt]** er
produsert av en måling denne økta. Ingen grønn påstand uten måling.
Forrige rapport (første nattkjøring) er arkivert nederst som «Forrige økt».

## Dekning

**Dekning 8/223 · 85/151.**

- **Skjermsporet: 8 av 223 [målt]** — de fem fra før (`agencyos-dashboard`,
  `playerhq-idag`, `agencyos-ko`, `agencyos-hjem`, `agencyos-stall`) + tre nye
  hi-fi-templates i porteringsrekkefølgen: **S5 Workbench**, **S4 Kalender**,
  **S6 Alt**. 3,6 %.
- **Systemsporet: 85 av 151 [målt via `check_design_system`: 87 eksporter,
  minus `Region`-hjelperen og `ukenummer`-funksjonen som ikke er komponenter]**
  — 74 ved døgnstart + 11 nye. 56 %.
- Kort: **48 i 14 grupper [målt]**. Tokens: 74. `check_design_system`:
  **No issues found [målt]**.

## Det som ble lukket fra forrige rapports utestående-liste

### 1 · Måling mot fersk bundel — lukket [målt 31.07]

Riggen (`kart/revisjon-gulv-rigg.html`) mot produksjonsbundelen:
`ok: true`, **selvtest 4/4 grønn, 31 komponenter målt, 0 brudd**.

| Punkt | Resultat |
|---|---|
| 0.4 BottomSheet-fokusnoden | laget har `tabindex="-1"`, dragehåndtaket er `<button aria-label="Lukk arket">` med **43,99 px sone over 4,0 px synlig strek** [målt] |
| 0.3 `.akhq-search-in` i bundelen | **44,0 px, `--floor: 44px`** [målt] |
| Listekontrakten i alle fire templates | **0 advarsler** i Kø, Hjem, Stall og Dashboard [målt]. Skillelinjer: **21 av 21 forventede** (Kø 3/3, Hjem 3/3, Stall 6/6, Dashboard 6/6 — siste rad i hver gruppe uten strek, som den skal) [målt]. Alle radene `role="listitem"` i gruppe med `role="list"` [målt] |

Bolk 0 er dermed lukket **med måling mot bundelen**, ikke bare i kilden.

### 2 · Assertionene sett feile — lukket for K1 og skallet [målt 31.07]

| Kort | Forfalsket | Utfall |
|---|---|---|
| `queue.card.html` | prov-summary-sonen klemt til 20 px · 300 px-containeren tvunget til 3 kolonner | **2 røde, 3 uberørte grønne**, og alle 5 grønne igjen etter at forfalskningen ble fjernet |
| `shell.card.html` | komponistfeltet klemt til 22 px · komponisthinten tvunget synlig i smal spalte | **2 røde, 7 uberørte grønne**, alle 9 grønne igjen etterpå |

Predikatene måler altså det de påstår. Riggens egen fasitnegativ ses fortsatt
rød i hver kjøring (selvtestens punkt 3).

## Bygget i natt

### Bølge P1 fullført — de tre siste fokuskontrakt-konsumentene

| Komponent | Sted | Poenget |
|---|---|---|
| **Popover** | `overlays/` | ikke-modalt lag med innhold og inntil to handlinger. Auto-forankring måles etter åpning, ikke gjettes. Lukkeknapp 28 px synlig / 44 px sone |
| **Tooltip** | `overlays/` | ren tekst ved hover/fokus, mono på blekk. **Skjules ved grov peker** — derfor regelen: ingen informasjon får finnes kun i en tooltip |
| **Drawer** | `overlays/` | modalt sidelag (`modal: true`). Artefaktpanelet er `Panel`/`BottomSheet`, ikke dette — forvekslingen står skrevet i `.prompt.md` |

Kort: `components/overlays/popover-tooltip-drawer.card.html` (gruppe «Overlegg»),
med assertioner for gulv, fokusnoder, tooltip-kobling og oransjemonopolet.

### Bølge P2 skjema — komplett

`Select` (native `<select>` med begrunnelsen skrevet ut) · `Combobox` (det ene
laget der fokus blir i feltet, jf. ARIA-mønsteret) · `Radio` + `RadioGroup`
(labelen er treffmottakeren) · `Slider` (obligatorisk tallavlesning) ·
`DatePicker` (mandag først, ukenummer synlig, roving tabindex) · `CodeInput`
(liming fordeler seg selv; `one-time-code` på første rute).

Kort: `components/forms/forms-p2.card.html` med 16 assertioner.
**`CodeInput` løste Auth-blokkeringen, `DatePicker` kalenderfamilien.**

### K3 og K4 — Workbench-underlaget

- **`SessionCard`** (`calendar/`): ett treffmål for hele kortet — hengelås,
  rrule og deltakertelling er informasjon, ikke fem små knapper i en 130 px
  kolonne. Container queries: formelen ryker under 150 px, områdemerket under
  110 px, tittelen står alltid.
- **`BudgetBar`** (`calendar/`): ukevolum mot periodens vindu, fordeling per
  pyramideområde, nøkkeltall, og **invariantbrudd som anbefaling med «overstyr
  med begrunnelse» — aldri sperre**. Komponenten regner ikke; CANON eier
  invariantene.

Kort: `components/calendar/workbench.card.html` med 13 assertioner.

## Klart for portering

| # | Skjerm | Template-sti | Erstatter i repoet |
|---|---|---|---|
| 1 | S2 Kø | `templates/agencyos-ko/AgencyosKo.dc.html` | V2-køflaten (designdekning del 1) |
| 2 | S1 Hjem | `templates/agencyos-hjem/AgencyosHjem.dc.html` | dashboard-V2, revidert mot nytt skall |
| 3 | S3 Stall + profil | `templates/agencyos-stall/AgencyosStall.dc.html` | stall-V2 + profilens fem faner i panel |
| 4 | **S5 Workbench** | `templates/agencyos-workbench/AgencyosWorkbench.dc.html` | planleggings-V2: budsjettlinje + ukelerret + sidestolpe (editor/innboks/Caddie) erstatter håndrullet ukegrid |
| 5 | **S4 Kalender** | `templates/agencyos-kalender/AgencyosKalender.dc.html` | kalender-V2: TimeGrid med selskapsfilter, bakgrunnslag og bookingveiviser i panel |
| 6 | **S6 Alt** | `templates/agencyos-alt/AgencyosAlt.dc.html` | global-search-V2: indeks med nivåmerke per rad + ⌘K-laget |

Komponenter klare til portering (alle med `.jsx` + `.d.ts` + `.prompt.md` +
spesimenkort + readme-omtale): **Popover, Tooltip, Drawer, Select, Combobox,
Radio/RadioGroup, Slider, DatePicker, CodeInput, SessionCard, BudgetBar** —
i tillegg til K1 og de seks fra bølge P1 i forrige rapport.

### Brytpunkter — målt, ikke antatt [målt 31.07]

`getComputedStyle` i fire bredder, i alle tre nye templates:

| Bredde | rail | sidestolpe/panel | bunnfaner | statuslinje | lerret |
|---|---|---|---|---|---|
| 1200 px | flex | flex | none | block | Workbench 7 kol · Alt 2 kol |
| 1000 px | flex | **none** | none | block | Workbench 4 kol · Alt 1 kol |
| 924 px | flex | none | none | block | Workbench 4 kol · Alt 1 kol |
| 430 px | **none** | none | **block** | **none** | Workbench 1 kol (dagstripe) · Alt 1 kol |

Alt-flaten er også målt på innhold: **7 grupper, 39 rader, 32 av 32 forventede
skillelinjer, nivåmerke N1/N2/N3 på hver rad** [målt].
Kalenderen: **9 hendelser i lerretet, kollisjonen beregnet og varslet**
(«Kollisjon ons 15:00», 6 økter · 1 kollisjon) [målt] — varselet regnes fra
dataene, det er ikke skrevet inn for hånd.

## Klar for review

- **Wireframe-galleriene** (`kart/wf/index.html` + tre gallerier), uendret fra
  forrige rapport — fortsatt klar for eiers godkjenning.
- **De ni [natt]-beslutningene** 1–9. Nytt siden sist: beslutning 3
  (avbestillingsfrist og gebyr synlig i steg 4) er nå bygget som `Callout` i
  bookingpanelets steg 4 — «450 kr, frist fredag 15:00» står før bekreftelse,
  ikke i kvitteringen. Beslutning 4 (filtrer til ett selskap) er bygget som
  `Select` med «Alle fem selskap» som eksplisitt førstevalg.
- **Nye [valg] denne økta:**
  1. **Dagstripe i stedet for sju kolonner på telefon** i Workbench. Sju
     kolonner i 430 px gir kort ingen kan lese; dagstripen viser én dag om
     gangen og beholder ukesummene. Følger av [valg 1] fra forrige økt.
  2. **Kollisjon beregnes, ikke merkes.** Kalenderen finner overlapp i
     dataene. En hardkodet advarsel lyver i samme øyeblikk dataene endrer seg.
     Ledig tid og bakgrunnslag teller ikke som kollisjon — de er tilbud og
     kontekst, ikke avtaler.
  3. **Dagsvisning er samme lerret med én kolonne**, ikke en annen komponent.
     En kalender som bytter anatomi mellom visninger må læres to ganger.
  4. **Norsk desimalkomma i alle tall** (`2,3 t`, ikke `2.3 t`). Lagt inn i
     `BudgetBar` selv, ikke bare i templaten — komponenten som viser tall eier
     tallformatet.
  5. **`Combobox` konsumerer ikke `useOverlayLayer`.** ARIA krever at fokus
     blir i feltet. Regelen «skriv aldri en egen fokusfelle» er ikke brutt:
     laget har ingen tabbbare noder, så det finnes ingen felle å skrive.
     Begrunnelsen står i `Combobox.prompt.md`.
  6. **`DatePicker` fikk `defaultOpen`** utelukkende for at den åpne
     tilstanden skal kunne rendres og måles i spesimenkortet.
  7. **Copy skal ikke love en ubygget gest.** Workbench-leaden sa «Dra økter
     mellom dager»; målt i DOM fantes 0 `draggable`-elementer — mekanismen er
     «Flytt til …» i editoren [funn i review 31.07]. Leaden er skrevet om til
     det artefaktet faktisk gjør. Samme disiplin som [målt]: en påstand uten
     dekning er en feil, også når den står i en ledetekst.
  8. **Hardt mellomrom mellom tall og enhet/substantiv** (`9\u00A0t`,
     `38\u00A0%`, `1\u00A0kollisjon`, `39\u00A0funksjoner`). Målt i reviewen:
     «7 økter · 9 t» brakk til «9» / «t» i en 85,8 px metaspalte, og
     kalenderens meta lå på 139 px i en 139 px spalte. Lagt inn i alle tre nye
     templates og i `BudgetBar` selv.
  9. **`Tooltip` refererte `--ink`/`--paper`, som ikke finnes** — laget
     rendret uten flate og var i praksis uleselig [funn i review 31.07].
     Rettet til `--fg`/`--bg`, samme invers-par som `Toast` bruker.
     Lærdommen: en token som ikke finnes feiler stille, akkurat som en
     ulagret klasse. Skann etter udefinerte `var()`-referanser hører i
     sveipet, ikke i øynene.

## Utestående, i rekkefølge

1. **P7 craft-porten: utestående for alle seks templates og alle 19
   komponenter.** Kan ikke lukkes herfra — krever verifikatør eller eier med
   rendret side mot `uploads/agencyos-dashboard-claude-paper.html`. Meldes
   aldri grønn.
2. **Måling mot fersk bundel — utført sent i økta [målt 31.07].** Bundelen
   rakk å kompilere: **88 eksporter**, og begge de nye templatene er målt med
   ekte komponenter, ikke plassholdere.
   - Workbench: **7 `SessionCard`, 1 `BudgetBar`, 1 bruddkort** (9 t over
     8 t-taket), 0 plassholdere, 0 `draggable` (leaden er rettet deretter).
   - «Flytt til …» er testet som interaksjon: `Select` sender event,
     `flyttDag` leser `e.target.value`, og økta flyttet seg fra mandag til
     torsdag i lerretet (kolonnetelling 2→1 og 1→2) [målt].
   - Kalender: **10 hendelser** i TimeGrid, 2 bakgrunnslag, 2 ledige,
     kollisjonsvarselet beregnet («Kollisjon ons 15:00»).
   - **Feil funnet og rettet i samme måling:** `Callout` tar `label`, ikke
     `title` — fristkortet i bookingens steg 4 og nivåforklaringen i Alt
     rendret uten overskrift. Begge rettet; fristen leses nå som
     «AVBESTILLINGSFRIST … 450 kr» før bekreftelse [målt].
   - **Gjenstår:** falsifisering av de tre nye kortenes assertioner
     (`popover-tooltip-drawer`, `forms-p2`, `workbench`) mot bundelen.
     Første oppgave neste tur.
3. **Bølge P3 struktur og tabell:** `DataTable` (K9 — blokkerer økonomi og
   rapport), `Pagination`, `Stepper`, `FilterPills`, `KanbanKolonne`,
   `TabSet` (K8, profilfanene).
4. **Hi-fi 7–12 PlayerHQ:** Analyse (tar golfviz-familien i ekte bruk),
   TrackMan, Gjør/økt + fullskjerm-malen, liste+detalj, meg/innstillinger,
   PlayerHQ Workbench.
5. **Hi-fi 13–14:** Foreldreportal-malen og Auth-malen. Begge er nå ublokkert
   (`CodeInput` finnes).
6. **Bølge P4 kalenderfamilien** (`UkeKalender`, `MaanedKalender`, `AgendaRow`,
   `DayStrip`, `Tidslinje`, `Periodeplan`, `VisningsVelger`) — kalenderflaten
   står i dag på `TimeGrid` alene, og måneds-/årsvisningen er derfor kun et
   segmentvalg uten egen anatomi.
7. **K2 `StatTile`/`StatRow`:** avklart som innramming av `KpiCard`/`KpiStripe`.
   Gjenstår å avgjøre om kort-chromen eies av komponenten eller konsumenten —
   en beslutning, ikke en måling.
8. **`YearTimeline` (K11)** blokkerer årsvisningen i kalenderen og S15.

## Hva som ikke ble rørt

`_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` (regenereres
av kompilatoren). `TimeGrid` (referanseimplementasjonen — urørt etter ordre).
De 47 «foreldreløse» komponentene. S14 marketing-editor. Klubbflatene.

---

## Forrige økt (30./31.07, første nattkjøring) — kort

Dekning ved slutt: 5/223 · 74/151. Trinn 0 lukket (dekningsvurderingens fire
svar + Bolk 0s seks punkter), wireframe-galleriene skrevet, bølge P1 6 av 9,
K1 `QueueCard` + `ProvenanceDisclosure`, og hi-fi 1–3 (Kø, Hjem, Stall).
Funn som fortsatt gjelder som regler: inline `display` er forbudt på
skallelementer i templates · kontraktvakter slår opp med `closest()`, aldri
`parentElement` · ingen backticks i CSS-kommentarer i en `.jsx`.
Full tekst i git-historikken for denne fila.
