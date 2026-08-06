# Designreview del 2 · PlayerHQ, restflatene, risiko og handling

Dato: 2026-07-31. Fortsettelse av `designreview-open-design-2026-07-31.md`. Dekker det som manglet: PlayerHQ (13), Auth, Foresatt, de sju AgencyOS-flatene som ikke var gjennomgått, wireframe-galleriet — pluss seksjon 5 (risiko), 6 (anbefalinger) og handlingsliste for 48–72 timer.

Alle påstander er målt i kildekoden, med linjenr.

---

## A. Det som endrer diagnosen fra del 1

Del 1 konkluderte: system 7/10, skjermer 4/10, produktløfte 3/10. Etter å ha lest de 22 gjenstående filene må skjermtallet ned.

**4 av 33 skjermer er ekte, kjørbare maler.** `agencyos-hjem`, `-ko`, `-stall`, `-dashboard` og `playerhq-idag` er selvstendige HTML med egne tokens og Google Fonts. De 29 andre er `<x-dc>`-manifester som laster `support.js` + `ds-base.js` — **ingen av dem finnes i pakken**. `find` over hele `claude-paper-2026-08-01/` gir null treff på `support.js`, `ds-base.js` og `_ds_bundle.js`.

Konsekvensen er ikke akademisk: `waitNs(n)` gir opp etter 160 forsøk (8 sekunder) og viser deretter **tom side uten feilmelding** (`playerhq-live-okt` l. 88–93, identisk i alle 29).

`index.html` presenterer alle 33 som likeverdige «hi-fi-maler». Å levere et galleri der 29 av 33 kort åpner en hvit side er verre enn å levere fire kort. **Enten legg runtime i mappa, eller merk x-dc-malene visuelt som kildemaler i indeksen.** Dette er en tillitssak, ikke en teknikalitet — det er slik en pakke går fra «34 skjermer ferdig» til «4 skjermer ferdig, 29 spesifisert».

Skjermtallet justeres til **3/10**.

---

## B. PlayerHQ (13) — kort per skjerm

| Skjerm | Type | Primary | Dom |
|---|---|---|---|
| idag (42 kB) | **Ekte mal** | 1 (svart) | Sterkeste fil i pakken. Håndbygd «Én ting nå», ProgramLadder m/ 5 tilstander, skip-link, aria-current, ekte kryss-navigasjon (4 href) |
| plan | Skisse | 1 | Best spesifiserte skisse. Eiermodellen uttalt tre steder. Eneste `emptyText` i hele PlayerHQ |
| kalender | Skisse | 1 | Overlapper plan og booking uten begrunnelse. Tre tidsflater for én spiller |
| analyse | Skisse | 1 | Mest overdesignet: fem interne faner inne i én bunnfane = 20 tilstander. Coachens analysedybde dyttet inn i spillerappen |
| **live-okt (7,4 kB)** | Skisse | 1 | Se §C |
| **etter-okt (5,8 kB)** | Skisse | 1 | Se §C |
| trackman (4,9 kB) | Skisse | 1 | Tynnest i pakken. Primary er «Bruk i Workbench» — sender spilleren til coachens verktøy. `max-width:720px` mot 430px overalt ellers |
| runde | Skisse | 2 (i hver sin `sc-if`) | Riktig fullskjerm. Feiring som *tilstand*, ikke egen skjerm — riktig instinkt. Men demo-knapper blandet inn i produksjonsflaten |
| booking | Skisse | 1 (dynamisk label) | Riktig mønster. Men ingen feiltilstand for «tiden ble tatt mens du valgte» — den feilen skjer garantert |
| gameplan | Skisse | 1 | Ærlig avgrensning («kart er bildeplassholder»). Men null lenke til `runde`, den eneste skjermen der en gameplan har verdi |
| coach-hub | Skisse | **0** | Konseptuelt skarpest: «ikke en innboks — bare tråden med Anders». Men uten primary er skjermen stum om hva som venter |
| meg | Skisse | 1 | `hint-size="140px,40px"` — 40px, under minimum |
| liste-detalj | Skisse | 1 | Riktig konsolidering (tester + økter + runder i én mal). Men beskrivelsen er skrevet for desktop, malen er merket 430px |
| **auth** | Skisse | 5 (én per tilstand) | Beste treffområde-konsistens i pakken: `hint-size="100%,44px"` ×7 |
| **forelder** | Skisse | 1 | **Eneste flate i hele pakken som bruker `OneThingNow`-komponenten riktig**, med utstavet konsekvens: «Uten fornying kan ikke Anders lagre ny fangst med Emma.» Tre faner mot spillerens fire — riktig for lese-først |

**Foreldreportalen er pakkens beste enkeltskjerm på anti-paralyse.** Kopier mønsteret tilbake til PlayerHQ og AgencyOS.

---

## C. Fangst på spillersiden — brutalt

De to filene som bærer kjerneproblemet er **7,4 kB / 112 linjer** og **5,8 kB / 86 linjer**. `playerhq-idag` er 1 357 linjer. Investeringen står i omvendt forhold til viktigheten.

**Stemme/diktat:** `grep -il "diktat|stemme|mikrofon|voice|opptak|lyd"` over alle 13 PlayerHQ-filer → **null treff**.

**Hurtigvalg:** finnes ikke. Ingen chip-rad, ingen taggevelger, ingen «hva satt du igjen med»-valg.

**`live-okt`:** «Logg slag» er implementert som `this.setState(s => ({ slag: Math.min(30, s.slag + 1) }))` — en teller. Knappen `cta-notat` har **ingen `onClick`** i markup eller `renderVals()`. Det samme gjelder `cta-neste-drill`. `avslutt: () => {}` (l. 108) er tom.

**`etter-okt`:** ingen inputfelt. Ingen tekstområde. Ingen chip. **Null fangstmulighet.** Primary er «Tilbake til I dag».

### Målingen

Fra «økt slutt» til «innsikt fanget»: **ingen vei finnes.** Ikke «for mange trykk» — flyten eksisterer ikke. Under 20 sekunder er uendelig langt unna.

Det som står i stedet, `etter-okt` Callout: «Forslag til Anders: «CS60 L-BALL holdes. Neste FØR = putting under 4 m.» **Du trenger ikke gjøre mer** — coaching-tråden går i Kø.»

Prinsippet «system forfatter, eier godkjenner» er riktig for *coaching-beslutningen*. Her er det misbrukt: det brukes til å fjerne spillerens fangst helt. AI-en gjetter innsikten. Spillerens egen observasjon — «wedgen føltes tung etter slag 15», «jeg mistet fokus da det begynte å regne» — har ingen inngang noe sted i produktet.

**Fangstsvikten er ikke løst. Den er designet bort.**

Og kontrakten er brutt begge veier: `agencyos-hjem` har «Se fangst» som halve OneThingNow. Coachen har en knapp til en tom hylle.

### Hva som må inn

I `etter-okt`, over folden, over `DiffKort`:

1. Én mikrofonknapp, 56–64px, `--accent`, automatisk transkribering
2. Under den 4–6 hurtigchips generert fra økt-formelen (`TEK_WEDGE_L-BALL_CS60_M2_PR2` → «traff CS60», «for kort», «tempo ustabilt», «bra», «vondt»)
3. Autolagring, ingen «Lagre»-knapp

Ett trykk, snakk i ti sekunder, ferdig. Eller to chip-trykk. Det er under 20 sekunder.

Samme komponent må ligge **under** økta i `live-okt` — fangst midt i økta er ferskere enn fangst etterpå. «Notat»-attrappen er plassholderen for den.

---

## D. Sløyfen på spillersiden

**Narrativt: godt gjort.** Formelen `TEK_WEDGE_L-BALL_CS60_M2_PR2` går ordrett igjen i idag, live-okt og etter-okt. Eyebrows sier FØR-kort / UNDER · drill 2 av 3 / ETTER · lagret. Callouts bærer tråden («Sjekkpunkt godkjent: hold CS60 L-BALL» → «Neste FØR = putting under 4 m»). Det er en ekte identitetsnøkkel gjennom hele løkka.

**Teknisk: ingenting.** `grep -o 'href=' playerhq-*/index.html` → **fire treff, alle i `playerhq-idag`**.

| Overgang | Status |
|---|---|
| idag → live-okt | «Start økt» er `data-toast="Starter økt…"`. Går ingen steder |
| live-okt → etter-okt | `avslutt: () => {}` |
| etter-okt → idag | «Tilbake til I dag»: verken `onClick` eller `href` |
| etter-okt → analyse | «Se mer analyse»: ingen handling |
| gameplan → runde | ingen lenke |
| runde → analyse | `cta-se-analyse`: ingen handling |

**Minimumsfiks: tre `href`-er.** idag→live-okt→etter-okt→idag. Kostnad: ti minutter. Verdi: forskjellen på 13 skjermer og ett produkt.

---

## E. Oransjemonopolet — telling over hele pakken

| Bruk | Antall |
|---|---|
| `OneThingNow`-komponenten i PlayerHQ (13 skjermer) | **0** |
| `OneThingNow` i AgencyOS (19 skjermer) | **1** (spillerprofil) |
| `OneThingNow` i forelder | 1 |
| Håndbygd «Én ting nå» | 1 (`playerhq-idag`) |

`OPEN-DESIGN.md` påstår «OneThingNow monopol: grønn på live-maler». Det er ikke sant. Komponenten brukes tre ganger i 33 skjermer.

**Verre: den primære handlingen er ikke oransje noe sted.** I `playerhq-idag`: `.btn.primary { background: var(--cta) }` (l. 402–406) og `--cta: #141413`. Svart blekk. Oransje brukes bare på eyebrow-teksten `.now-label { color: #B85C3D }` og en 7px pulsprikk. «Start økt» ser identisk ut med enhver annen knapp i systemet.

Dette er ikke oransjemonopol. Det er **oransje-abstinens**. `--handling: #D97757` er innført som token og deretter ikke brukt på handlingen. Fargen betyr ingenting.

Fiks: `.btn.primary` **inne i `.now`** får `background: var(--accent)`. Alt annet svart. Da betyr fargen noe, og monopolet blir håndhevbart med én assertion.

---

## F. Navigasjon — PlayerHQ er disiplinert, AgencyOS er det ikke

**PlayerHQ:** fire flater, ett sett, stabil rekkefølge. Bedre enn AgencyOS.

Feil: fjerde fane heter **«Meg»** i syv filer og **«Profil»** i fire (etter-okt, liste-detalj, trackman, idag). `id` er `profil` overalt — ren tekstinkonsistens. Rett til «Meg».

Reelt problem: **9 av 13 skjermer er hjemløse.** Booking, gameplan, coach-hub, trackman, runde, liste-detalj, live-okt, etter-okt er ikke nåbare fra tabbaren. De må nås fra sløyfen — som ikke er lenket (§D).

**AgencyOS-restflatene:** identisk 6-element-rail i alle sju, med tre navnebrudd i samme objekt:

```
{ id:"kalender", label:"Kalender", icon: I.idag }   ← id, label og ikon er tre ulike ord
{ id:"plan",     label:"Workbench", icon: I.plan }
{ id:"alt",      label:"Alt",       icon: I.analyse }
```

`tabItems` (mobil) har fem og er **ikke en delmengde**: `kalender` og `plan` byttes ut med `ai`/«Agenter». **På mobil forsvinner Kalender og Workbench helt.**

Aktiv-tilstanden matcher ikke:
- drift l. 81: `nav:"alt", tab:"hjem"` — samme skjerm er «Alt» på desktop og «Hjem» på mobil
- årshjul l. 142: `nav:"plan", tab:"stall"` — `plan` finnes ikke i tabItems
- booking l. 123: `nav:"kalender"` — finnes ikke i tabItems, ingen fane markeres aktiv på mobil

Railen skjules ved **880px**, ikke 1180px (1180 er kun `max-width` på main). Booking er den eneste som løser sidestolpen riktig under 880 (`[data-rsp=side]{order:-1}`).

---

## G. De sju AgencyOS-restflatene — dom per skjerm

Spørsmålet stilt eksplisitt for hver: **hvis denne skjermen ikke fantes, hva ville eier mistet?**

### Videoanalyse (S10) — mest lovende og mest villedende
Det nærmeste pakken kommer fangst. P-pillene (l. 79–83) er ekte `<button>` med `select: () => setState({pos})`, `data-tap`, `:focus-visible`. Notatfeltet har ekte `value`/`onChange`. «Merkede posisjoner» (l. 230) er **den eneste listen i alle sju med ekte handlere**.

Men scrubberen er statisk CSS: `.akhq-scrub-fill{width:42%}` hardkodet (l. 25), sporet er `aria-hidden="true"`, ingen `<input type=range>`, ingen tastaturtilgang, ingen `onChange`. Tidskoden «00:04,2» står som ren tekst — bytter du fra P6 til P2 blir tiden stående, mens merkelisten sier P2 = 00:01,1.

**Notatet festes til en etikett, ikke til et bilde.** «Lagre posisjonsnotat» lagrer «P6 + tekst» uten tidsstempel. Det er ikke fangst, det er en tagget notatblokk.

Fangst her ville vært: scrub → frys → tidsstempel følger automatisk → P foreslås av systemet → coach retter og godkjenner. Ingenting av det er modellert.

Lekkasje: l. 74 rendrer «VideoScrubber (K12) er ikke i komponentpakken ennå» som brødtekst **til coachen**.

### TrackMan coach (S8) — ren lesetavle
**Ingen registrering. Ingenting.** Ingen notatfelt, ingen merking av enkeltslag, ingen «flagg dette slaget», ingen lagring. Eneste handling er «Bruk i Workbench» — uten `onClick`.

Tre ulike sannheter om samme sesjon: `dispStats.count: 34`, `points` har 12, slagtabellen har 6 rader. Hit-rate 62 % vs 55 % står tre steder på samme skjerm.

`playerhq-trackman` finnes allerede. Denne legger til null fangst og null beslutning.

### Booking (S12) — riktig instinkt, ødelagt implementasjon
**Det ene punktet pakken faktisk treffer:** l. 94, «Gratis til 24 timer før start. Etter det belastes 50 % (475 kr). Vises her før bekreftelse — ikke først i kvitteringen.» Riktig anti-paralyse.

Men:
- **475 kr er hardkodet.** Velger du «Drop-in sim · 300 kr» står det fortsatt 475. Velger du «Gruppetime» er prisen `"pakke"` — 50 % av «pakke» gir ingen mening
- **Sluttiden er hardkodet:** l. 244, `this.state.tid + "–16:00"`. Velger du 20:00 får du «20:00–16:00». Og 16:00 er nettopp tiden som er `disabled`
- **Datoen er hardkodet i strengen** («torsdag 31.07») og endres ikke av `setDato`
- **«Bekreft booking» gjør ingenting.** `neste: () => setState({steg: Math.min(4, steg+1)})`. Ingen kvittering, ingen suksess, ingen feil, ingen låsing av tiden
- **`dataState` deklarert og aldri bundet** — eneste av de sju
- **Ingen tomtilstand.** Hva ser man en dag uten ledige tider?
- **Kollisjon uten grunn:** `disabled: lab === "16:00"`. Brukeren ser en grå knapp uten å vite hvorfor
- **Default `steg: 4`** — malen åpner på bekreftelse, steg 1–3 vises aldri i forhåndsvisning

**Fire steg er selv problemet.** Sidestolpen «Live oppsummering» viser hele bookingen samtidig — så hvorfor er hovedflaten delt i fire?

### Årshjul (S15) — plakat, ikke tidslinje
Båndet er tre `<div>` med hardkodede fraksjoner (l. 19): `1.1fr / 1.4fr / 1fr`. GRUNN (3 mnd) får 31 %, SPES (5 mnd) 39 %, TURN (4 mnd) 28 %. Månedsraden under er 12 **like** kolonner. **Båndene står ikke over sine egne måneder.**

Datoene henger ikke sammen: aria-label sier «SPES apr–aug», `ukeMeta` sier P3 = uke 28–36 (juli–september). **Uke 18–27 tilhører ingen periode** — mai og juni faller ut av sesongplanen.

Ingen kobling til Workbench eller Kalender: ukekortene er `<div>` uten `onClick` («uke 31 utkast» ser klikkbar ut, med `is-now`-ramme, og er død markup), «Åpne periodeplan» har ingen handler, 3× `open: () => {}` på milepælene.

Dette er den eneste av de sju som berører faktisk AK-IP. I denne formen er den en plakat.

### Drift — riktig behov, feil verktøy
Tallene motsier hverandre: KPI sier «Belegg i dag 68 %», mens hendelseslisten gir 7 bookinger à ~1–1,5 t over 3 sim × 15 t ≈ **19 %**.

`TimeGrid` med `dager: [{label:"ons"}]` — én kolonne. Sim-tilhørighet ligger i tittelstrengen («Sim 1 · Jonas TrackMan»), ikke som rad. b2 (10:30–12:00) og b3 (11:00–12:30) overlapper i samme kolonne. Trenger ressurskalender med tre sim som rader.

Callout l. 69 skriver en designbeslutning til brukeren: «Ikke en egen app-meny. Du ser «nå» — bytt ikke kontekst til planlegging her.» Brukeren bryr seg ikke.

### Økonomi (S11) — dårligere Tripletex
Skjermens egen footNote innrømmer det: «Kilde: Tripletex-eksport» (l. 31). Resultat, Fakturaer, Budsjett: **eier mister ingenting.**

Fanen **Timegrunnlag** er det eneste unike — koblingen økt → fakturerbar time finnes ikke i noe annet system.

Falske affordanser: «Godkjenn **valgte** timer» (l. 54) — det finnes ingen avkrysning, `ListRow` har `leading="status"`. `avvikTall` er ikke tallet: l. 165 har `avvik: "+4 200"` med `avvikTall: -4200`, l. 167 omvendt. Sortering på `avvik` sorterer formatert streng med U+2212. Ni flater på én skjerm.

### Varelager (S13) — scope-krype
42 SKU, tre varer under min, null kobling til coaching eller IP. `sort: {key:"lager", dir:"asc"}` på strengverdier: standardvisningen sorterer `"12"` før `"3"` — skjermens hele premiss («Lav lager først») feiler i default-tilstand. Callout sier 2 varer under min, KPI sier 3.

Internspråk i produktet: l. 56, «Varelager er ikke del av Drift. Annen rytme, andre roller — **se [natt 5]**.»

Målt mot 500k USD netto og AI Coach til $10M ARR: null bidrag.

### Wireframe-galleriet — tomt
`screens/wireframes/index.html` (1 728 B) lenker til `agencyos.html`, `playerhq.html`, `foreldre-auth.html`, `wf.css`, `../../styles.css`. **Ingen av dem finnes.** Mappa inneholder én fil. Uten stilark rendres den som usortert svart-på-hvitt tekst med tre døde lenker.

### 13 ubundne headerActions
`headerActions` bygges med `React.createElement(B, {...})` **uten `onClick`-prop** i alle seks som har dem: Eksporter ×3, Åpne Tripletex, Oppfrisk, Ny booking, Ny ordre, Last opp klipp, Eksporter notat, Bruk i Workbench, Rediger år, Åpne periodeplan. Verre enn `() => {}` — propen finnes ikke.

---

## 5. Risiko

### De fem største

| # | Risiko | Hvorfor den er dødelig | Tidligste symptom |
|---|---|---|---|
| **R1** | **Fangst finnes ikke noe sted i produktet** | 33 skjermer refererer til fangst; null produserer den. Coachens «Se fangst» peker på tom hylle. Uten fangst er hele plattformen et planleggingsverktøy med ekstra steg — og planlegging kan gjøres i Notion | Pilot uke 1: spilleren logger ingenting, coachen ser ingen data, begge går tilbake til meldinger |
| **R2** | **Sløyfen er tekst, ikke lenker** | Formelen `TEK_..._CS60_M2_PR2` går ordrett gjennom idag→live→etter, men null overganger er klikkbare. Produktets viktigste innsikt er skrevet som copy og bygget som ingenting | Første brukertest: «hvordan starter jeg økta?» |
| **R3** | **29 av 33 skjermer rendrer hvit side** | `support.js`/`ds-base.js` mangler. Indeksen presenterer dem som ferdige. Enhver som åpner pakken uten Open Design-runtime ser fire skjermer og 29 tomme faner | Neste gang du viser pakken til noen som ikke er deg |
| **R4** | **Attrapper er umulige å skille fra kode** | 13 ubundne `headerActions`, ~30 `() => {}`, 8+ `href="#"`, `data-toast` som «godkjenning», `dataState` deklarert og aldri bundet i fem filer. En utvikler som porterer dette til `src/` kan ikke se hva som var ment å virke | Port til Next.js: enten kodes attrappene som ferdige, eller alt må spesifiseres på nytt |
| **R5** | **Demodata er inkonsistent på tvers og vil bli seeds** | Emma Sæther/Emma Berg, Jonas Hveem/Jonas Li, 7 i kø/3 i kø, 27. juli/31. juli på samme skjerm, belegg 68 % vs 19 %, TrackMan 34/12/6 slag, SPES apr–aug vs uke 28–36, uke 18–27 uten periode | `prisma/seed.ts` kopierer strengene som de står |

R1 og R2 er samme risiko sett fra to sider: fangstflaten er ikke bygget, **og** den ville ikke vært nåbar om den var det.

### Hva som må fikses før flere skjermer

Ikke flere skjermer før disse fire er lukket:

1. Fangstflaten designet og bygget (§C)
2. Sløyfen lenket — tre `href`-er i PlayerHQ, tilsvarende i AgencyOS
3. Runtime i mappa, eller x-dc-malene merket som kilde i indeksen
4. Én rail, fem flater, ett navnesett — desktop og mobil som samme sett

**33 skjermer uten fangst er verdt mindre enn 6 skjermer med.**

### Godt nok vs verdensklasse

| Godt nok som det er | Må heves til verdensklasse |
|---|---|
| Auth (5 tilstander, 44px konsistent) | **Fangst (live-okt, etter-okt, videoanalyse)** — dette er produktet |
| Foreldreportalen (eneste riktige OneThingNow) | **Kø** — coachens daglige flate, må tåle 40 saker, ikke 7 |
| Kø-proveniens og utsatt-mønsteret | **playerhq-idag** — spillerens daglige flate, trenger tomtilstand og oransje handling |
| Liste-detalj-konsolideringen (3 skjermer → 1) | **Workbench** — fasitens §7 i sin helhet |
| Coach-hub-premisset («én tråd, ikke innboks») | **Booking** — én skjerm, avledede tall, ekte bekreftelse |
| Runde (feiring som tilstand, ikke skjerm) | |

---

## 6. Anbefalinger

### 6.1 Prioritert endringsliste

**P0 — blokkerer alt annet**

| # | Endring | Sted | Kostnad |
|---|---|---|---|
| 1 | Design og bygg fangstflaten: mikrofon 56–64px + 4–6 formel-avledede chips + autolagring | `playerhq-etter-okt`, `playerhq-live-okt` («Notat»-attrappen), `agencyos-live` | 1–2 dager design |
| 2 | Lenk sløyfen: idag→live-okt→etter-okt→idag | 3 `href` | 10 min |
| 3 | Legg `support.js`/`ds-base.js`/`_ds_bundle.js` i mappa, eller merk de 29 x-dc-kortene visuelt i `index.html` | pakkerot | 1 t |
| 4 | Gi oransje til handlingen: `.now .btn.primary { background: var(--accent) }` | alle ekte maler | 30 min |

**P1 — før flere skjermer**

| # | Endring | Sted |
|---|---|---|
| 5 | Én rail: fem flater, ett navnesett, `tabItems` som delmengde av `railItems`, `nav`/`tab` som matcher | alle 33 |
| 6 | Rett `--r` til 12px, eller oppdater Paper-fasiten. Ikke la de stå i konflikt | tokens + alle |
| 7 | 3px venstrekant tilbake på OneThingNow + assertion i `one-thing-now.card.html` | komponent + 4 maler |
| 8 | Flytt `--dn` bort fra terrakotta `#A85536` | tokens |
| 9 | Tomtilstand på `playerhq-idag` (ny spiller uten publisert plan) og `agencyos-ko` (filter uten treff, med klokkeslett per fasit §5.4) | 2 maler |
| 10 | Treffområder: `.btn` 36px → 44px, `.now .btn` → 48px, `cta-meld-coach` 40px → 44px | idag + meg |
| 11 | Én demodatafil. Ett navn per person, ett tall per KPI, én dato per skjerm | alle |
| 12 | Rydd falske affordanser: 13 ubundne headerActions, ~30 `() => {}`, 8 `href="#"`, ubundne `dataState`, `data-tap`-regel uten `data-tap` | alle |

**P2 — kosmetikk og gjeld**

13. «Profil» → «Meg» i fire PlayerHQ-filer
14. Fjern designer-metatekst fra produksjonsflater: «Claude Paper craft · Poppins / Lora», «VideoScrubber (K12) er ikke i komponentpakken ennå», «[natt 5]», «[natt 8]», «CANON ✓», «Paper · S11», Callouts som forklarer designbeslutninger til brukeren
15. Fjern demo-knappene i `playerhq-runde`
16. Beslutt Lora: alt av forklarende prosa, eller stryk fra fasiten
17. Rydd død CSS (64 ubrukte klasser i Stall, ~45 linjer i Kø)
18. Kutt `playerhq-analyse` fra fem underfaner til tre

### 6.2 Hvilke skjermer redesignes først

**1. `playerhq-etter-okt`** — fra 86 linjer lesevisning til produktets viktigste flate. Alt annet er sekundært.
**2. `agencyos-live` + `playerhq-live-okt`** — samme fangstkomponent, bunnfestet, tommelnær.
**3. `agencyos-videoanalyse`** — omskriv til ren fangstflate. Behold P-pillene og notatfeltet (de virker). Kast KPI-stripen, «Andre klipp», MORAD-forklaringen, utviklerkommentaren. Bygg VideoScrubber som ekte input, la tidsstempelet følge scrubberen inn i notatet, la systemet foreslå P som coach retter.
**4. `agencyos-hjem`** — tilbake til konsoll: komponist + tråd + artefaktpanel, arbeidslinjer og «Hvorfor dette tallet» fra `agencyos-konsoll.html`.
**5. `agencyos-ko`** — mobil, bulk-handling, angre, bind aside til valgt rad.
**6. `agencyos-booking`** — én skjerm i stedet for fire steg, avledede tall, ekte bekreftelse med feiltilstand.

**Parkeres til etter pilot:** Årshjul (datamodellen må avklares først — ti uker mangler periode), Drift (venter på TimeGrid med ressursstøtte), TrackMan coach (slås sammen med `playerhq-trackman`; coach-behovet er én handling, ikke en skjerm).

**Slettes fra pakken:** Varelager (regneark, null IP-bidrag). Økonomi minus Timegrunnlag — behold koblingen økt → fakturerbar time og flytt den til Kø som godkjenningsoppgave med ekte avkrysning; resten gjør Tripletex bedre. Wireframe-galleriet (tom mappe, tre døde lenker) — legg inn innholdet eller fjern mappa.

### 6.3 Komponenter som mangler eller må utvides

**Må bygges (blokkerer P0):**

| Komponent | Hvorfor |
|---|---|
| **FangstSheet** | Mikrofon + transkribering + formel-avledede chips + autolagring. Brukes i `etter-okt`, `live-okt`, `agencyos-live`. Finnes ikke i noen form |
| **VideoScrubber (K12)** | Ekte `<input type=range>` med tastatur, tidsstempel som følger med inn i notatet. I dag hardkodet `width:42%` |
| **ConfirmDialog** | Bookingbekreftelse, «Avslutt økt», «Avslutt runde», angre-vindu etter godkjenning. Fasit-restanse 5.9 er fortsatt åpen |

**Må utvides:**

- **ListRow — compound trailing.** I dag ett trailing-slot. Kø trenger tre handlinger per rad (Godkjenn / Se fangst / Utsett), Økonomi trenger checkbox i leading (jf. «Godkjenn **valgte** timer» uten avkrysning), Stall trenger begrunnelse + SG + handling. Løsning: `<ListRow.Leading>` / `<ListRow.Trailing>` som compound, med maks-antall-regel og automatisk overflow til `DropdownMenu` under 500px.
- **OneThingNow** — mangler assertion, tilstander (tom/laster), containerbredder, og 3px-kanten den selv annonserer. Pakkens dårligst dekkede kort på pakkens viktigste komponent.
- **TimeGrid** — ressursrader (tre sim), ellers er Drift ikke byggbar.
- **StatusBadge / KpiStripe / KpiCard** — viewport-hybrider fra restanse 0.6 er fortsatt uverifiserte (kun ListRow er lukket).
- **EmptyState** — finnes og er mønstergyldig, brukes **null ganger** i PlayerHQ. Ikke et komponentproblem, et bruksproblem.

**Fra fasiten, fortsatt ikke levert:** `YearTimeline` (K11), `DataTable` (K9), `DiffKort`, `Periodeplan`, `FilterPills`, `PPositionRail`, `DispersionMap`-utvidelsen (K10).

### 6.4 Craft-sveip framover

Økt 18 sveipet på hex og «0 Presis-hex». Det er en fargesjekk, ikke en craft-sjekk. Neste sveip må måle noe annet:

1. **Attrapp-gate.** Automatisk: tell `() => {}`, `href="#"`, `React.createElement(B,` uten `onClick`, `data-toast` som eneste effekt av en primary, `dataState` deklarert uten binding. Terskel: null i alle ekte maler.
2. **Sløyfe-gate.** For hver skjerm merket FØR/UNDER/ETTER: verifiser at neste steg er nåbart med en klikkbar overgang. Tekst teller ikke.
3. **Treffområde-gate.** Alle `hint-size` og alle `height` på interaktive elementer ≥44px, primary i `.now` ≥48px, fangstknapp ≥56px.
4. **Demodata-gate.** Ett navn per person, ett tall per KPI, én dato per skjerm — på tvers av alle 33.
5. **Aksent-gate.** Nøyaktig én `background: var(--accent)` per skjerm, og den skal ligge på en `<button>`, ikke på en label eller en prikk.
6. **Tomtilstand-gate.** Hver liste, tabell og datavisning har en definert nulltilstand med neste steg.
7. **Rendring-gate.** Hver skjerm i indeksen åpner faktisk noe. Hvit side = rødt.

Kjør 1, 2 og 5 som blokkerende. Resten som rapport.

---

## Handlingsliste — neste 48–72 timer

**Dag 1 (0–24 t) — lukk hullet i midten**

1. Skisse FangstSheet: mikrofon + chips + autolagring, ett trykk til fanget. Test målet fysisk: ta tiden på deg selv med stoppeklokke i simulatoren. Under 20 sekunder eller om igjen.
2. Bygg den inn i `playerhq-etter-okt` over folden, og som bunnfestet ark i `playerhq-live-okt` og `agencyos-live`.
3. Lenk sløyfen: tre `href`-er i PlayerHQ, tilsvarende idag→live→etter i AgencyOS.

**Dag 2 (24–48 t) — gjør pakken sannferdig**

4. Legg runtime i mappa, eller merk de 29 x-dc-kortene som «kildemal — åpnes i Open Design» i `index.html`. Rett tallet 34 til det som faktisk rendrer.
5. Gi oransje til handlingen (`.now .btn.primary`), sett 3px-kanten tilbake, skriv assertionen i `one-thing-now.card.html`.
6. Én rail: fem flater, ett navnesett, `tabItems ⊆ railItems`, `nav`/`tab` som matcher. 33 filer, mekanisk arbeid.
7. Én demodatafil. Rett Emma, Jonas, kø-tallet, datoene, belegget, TrackMan-slagene.

**Dag 3 (48–72 t) — rydd før port**

8. Attrapp-sveip: fjern eller koble 13 headerActions, ~30 `() => {}`, 8 `href="#"`, ubundne `dataState`, `data-tap`-regelen.
9. Fjern designer-metatekst og internspråk fra alle produksjonsflater.
10. Tomtilstand på `playerhq-idag` og `agencyos-ko`-filteret.
11. Slett Varelager, kutt Økonomi til Timegrunnlag-i-Kø, fyll eller fjern wireframe-mappa.
12. Skriv de tre gatene (attrapp, sløyfe, aksent) inn i craft-sveipen så dette ikke skjer igjen.

**Ikke gjør før dette er ferdig:** flere skjermer, Paper-port til `src/`, Workbench §7, Årshjul, Maskinrommets fire seksjoner.

---

## Én setning

Du har bygget 33 skjermer som beskriver et produkt der eier fanger på 20 sekunder, holder rød tråd og godkjenner utkast — og ingen av de tre tingene kan gjøres i noen av dem; fangst finnes ikke, tråden er copy uten lenker, og godkjenning er en toast. Bygg fangstflaten og lenk sløyfen, så er resten pussearbeid på noe som virker.
