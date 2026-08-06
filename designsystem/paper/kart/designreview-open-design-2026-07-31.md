# Designreview · Open Design-pakken (claude-paper-2026-08-01)

Dato: 2026-07-31. Grunnlag: `index.html`, 12 AgencyOS-skjermer, 5 komponentkort, 4 tidligere prototyper, skjermfasit-agencyos-2026-07-30, restanse-designsystem, komponentkart.

## 0. Dom

Pakken er visuelt disiplinert og produktmessig hul.

Paletten holder (0 Presis-hex, 0 rød, leire `#A85536` i stedet), køen er reelt god, proveniens er ekte håndverk, og `EmptyState`/`ListRow`/`QueueCard`/`Shell` er ordentlige komponenter. Det er verdt å si.

Men tre ting er brutt på et nivå som ikke lar seg pusse bort:

1. **Fangstflaten finnes ikke.** Fem skjermer refererer til «Fangst 14:20 · Whisper + AK-glossar». Null skjermer fanger. `agencyos-live` har én knapp «Logg slag» som ikke leder noe sted, ingen stemmeinngang, ingen auto-fangst fra TrackMan, og «Avslutt økt» som ghost uten konsekvens. Dette er problemet hele produktet finnes for, og det er det eneste som ikke er tegnet.
2. **Konsollen er borte.** Skjermfasit §3.1: «Eier åpner AgencyOS og møter et skrivefelt, ikke en meny.» Dagens `agencyos-hjem` er en meny: KPI-rad, dispatch-kort, trenger-deg-liste, statuspanel. Arbeidslinjer (§3.3, «obligatoriske») og «Hvorfor dette tallet» (§3.3, «påkrevd») har 0 treff i alle 12 skjermer. Begge finnes i `agencyos-konsoll.html`-prototypen. Det er en regresjon, ikke en forenkling.
3. **«Én ting nå» er en overskrift, ikke en handling.** Alle godkjenn-knapper er `data-toast`-attrapper. På Dashboard vises samme sak (Emma, ukeplan) fire steder: OneThingNow, køkort, spillerliste, tidslinje — hver med sin egen svarte primærknapp. Sløyfen lukkes aldri visuelt.

Rangert kort: **system 7/10, skjermer 4/10, produktløfte 3/10.**

## 1. Anti-paralyse — regel for regel

| Regel | Status | Bevis |
|---|---|---|
| Én oransje flate per skjerm | Brutt i praksis | `--dn: #A85536` er terrakotta 15° fra `#D97757` og brukes 10 ganger på tall/status i Hjem, Kø, Dashboard. Kø og Stall har i tillegg `.ladder-step.active .dot` i aksent. Stall har null oransje og gir primærvekt til «Ny spiller». |
| Ingen tomme skjermer | Brutt | `.empty-inline` og `.day-empty-note` definert og ubrukt i Hjem, Kø, Stall. Køfiltrene kan gi helt blank flate. Eneste ekte `EmptyState` i alle 12 skjermer er i `agencyos-alt`. |
| System forfatter / eier godkjenner | Delvis | Konseptuelt best løst i `agencyos-sjekkpunkt` (DiffKort + ProvenanceDisclosure + FØR-konsekvens). Men `godkjenn()` bytter én etikett i headeren og ingenting annet. `cta-avvis` har etiketten «Rediger». En løkke uten avvisning er en kvittering. |
| Maks 5 flater | Brutt overalt | Seks rail-elementer i alle 12 skjermer, og **tre uforenlige railer**: `Hjem·Kø·Stall·Kalender·Workbench·Alt` (x-dc), `Hjem·Kø·Stall·Plan·Data·AI` (Hjem/Kø), `Hjem·Stall·Cockpit·Kø·Plan·AI` (Dashboard, hvor Cockpit og Plan peker til samme URL). |
| FØR/UNDER/ETTER | Ord, ikke lenker | UNDER finnes ikke som handling noe sted. `go`, `spor`, `lagre`, `visKollisjon` er tomme funksjoner i alle x-dc-maler. Dashboard har null lenke til fangst i det hele tatt. |

## 2. Skjerm for skjerm — prioritert

### Live (10 kB) — kritisk underdesignet
Minste fil i pakken, viktigste skjerm i produktet. «Logg slag» har ingen sheet, ingen tallpad, ingen `onClick`. Null treff på stemme/diktat/mikrofon. KPI-raden er `repeat(4,1fr)` uten mobil-breakpoint: på 375px gir det 77px per kort med 20px mono-tall — overflyt. Primærknappen har `margin-top:auto` i en container med `overflow:auto`, altså ~700px scroll ned til den, under økt, med hanske på. 48px treffområde der 64px+ og bunnfestet er minimum.

**Gjør:** ny fangstflate. Bunnfestet, tommelnær, stemme som primær og tall som sekundær, tilgjengelig fra Live og Testkjøring uten scroll.

### Hjem / Konsoll — feil sjanger
Tre identisk svarte primærknapper i toppbåndet under overskriften «Én ting nå». «Start fangst» duplisert 60px fra seg selv. Statuspanelet gjentar KPI-raden ordrett. `<kbd>/</kbd>` uten keydown-handler. Søkefelt med `cursor:not-allowed` som ikke er `disabled` (Dashboard gjør dette riktig med `aria-disabled` + «Søk kommer snart» — kopier det). Alle fire «Trenger deg»-rader lenker til samme URL, ikke til personen.

**Gjør:** bytt tilbake til komponist + tråd + artefaktpanel. Arbeidslinjer og «Hvorfor dette tallet» tilbake fra `agencyos-konsoll.html`.

### Kø — pakkens beste skjerm, med to hull
Proveniens per rad, utsatt-rad som beholder plassen med synlig frist, seg-note som forklarer regelen. Beste enkeltdetalj i hele leveransen.

Men: 24 knapper, 18 av dem identisk svarte «Godkjenn». Rad 1 skilles kun av en 1px kant på 35 % aksentblanding — knapt synlig. Aside-panelet ser radbundet ut, men er hardkodet til Emma mens rad 1 er Jonas; ingen JS binder dem. `role="tablist"` på div med `<button>`-barn uten `role="tab"` — feil ARIA er verre enn ingen. Filterchips mangler `:focus-visible`. **Mobil er ødelagt:** rail `display:none` under 880px, `.tabs-bar` finnes bare i CSS. Ingen angre etter godkjenning.

### Workbench — bilde av et arbeidsverktøy
Skjermfasit §7 er ikke bygget. Målt: `draggable` 0, `TimeGrid` 0, `20 min`-snap 0, tastaturekvivalent 0, `aria-live` 0, angre 0, diff mot forrige uke 0, øvelsesbank 0, invariant-teller 0. «Tre soner» er en SegmentControl med gjensidig utelukkende visning — du kan ikke se et Caddie-utkast og øktkortet det skal erstatte samtidig, som er hele poenget. Sidestolpen forsvinner helt under 1180px uten erstatning. `lagre: () => {}`. Primærvekt på «Lagre økt», mens «Publiser til Emma» er ghost.

Det som er bra: invariantbrudd beregnes og formuleres med to utveier. Men `overstyr` lagrer ingen begrunnelse, selv om teksten lover det.

### Testkjøring — riktig instinkt, feil friksjon
`inputmode="decimal"` + komma-hint er den ene tingen som er ordentlig tenkt. Men 3–5 interaksjoner per slag × 10 slag × 20 stasjoner = **600–1000 interaksjoner per testbatteri**, med tastatur oppe over halve grensesnittet. Slagrutene er `<div>` uten `onClick` — feilregistrering kan ikke rettes. `[data-tap]{min-height:44px}` er deklarert; `data-tap` finnes ikke på ett eneste element. Krav A-teksten står tre steder på samme skjerm.

**Gjør:** binær «innenfor/utenfor»-toggle som primærvei der kravet er binært; presis avstand som sekundær. Skjul alt skrivebordschrome over registreringsfeltet i testmodus.

### Stall — tallene lyver, radene er blindveier
Overskrift sier «18 spillere · pilot», chip sier «Alle 7», listen viser 7. Alle fire filterchips har `data-filter="alle"` og ingen rad har `data-kind` — filtrene ser ut som de virker og gjør ingenting. Spillerrader er `href="#"`, så Stall → Spillerprofil finnes ikke, selv om Spillerprofil har «← Stall». Emma `+2,92` er farget `dn` (rød) mens Sander `+0,88` er `up` (grønn) — samme fortegn, motsatt farge. Halve stilarket er dødt: 64 av 127 klasser er ubrukte, kopiert fra andre skjermer.

Fasitens tre grupper (Trenger deg nå · Følger planen · Hviler) er redusert til to.

### Kalender — beste kode, ingen utgang
Kollisjoner beregnes i stedet for å hardkodes; det er beste håndverk i pakken. Teksten på avbestillingsfrist med beløp og klokkeslett *før* bekreftelse er ekte anti-paralyse. Men `valgtId` settes og leses aldri, `visKollisjon: () => {}` er tom, og den ene primærknappen sitter i en aside som er `display:none` under 1180px — altså null primærhandling på tablet og mobil. Fasitens Måned/År-visning, periodebakgrunn (GRUNN/SPES/TURN) og selskapsfiltrering: 0 treff.

### Agenter — riktig beslutning, feil utførelse
Å legge godkjenning i Kø og la denne flaten være driftsstatus er riktig, og filen sier det selv. Men samme ene feil vises fem steder (kort, logg, callout, KPI, statusbar). Feil signaleres med `border-color: var(--fg)` — samme kode som «aktiv» i Testkjøring. «Vis grunnlaget» og «Hvorfor?» er to navn på samme handling i samme kolonne. `[natt 8]` er intern markør lekket til produksjonstekst. Fasitens fire maskinrom-seksjoner (Modellruting, Skills, ak-brain, API-kostnad) er borte — alle fire finnes i `agencyos-konsoll.html`.

### Alt — indeks uten produktets verb
40 rader, alle inerte (`apne: () => {}`). ⌘K-håndteringen og synonymsøket er ordentlig gjort, og filen har pakkens eneste ekte `EmptyState`. Men det finnes ingen «Logg slag», «Start fangst», «Diktér øktnotat» eller «Registrer test» i indeksen over alt systemet kan gjøre. Nivå 1 er definert som «svarer uten å ta deg noe sted» — det er nøyaktig riktig hjem for hurtigfangst, og fangst er ikke der.

## 3. Designsystem-konsistens

**Tre implementasjonsspor uten regel.** Hjem, Kø, Stall, Dashboard er standalone HTML med inline CSS og **null** `x-import`. De åtte andre er x-dc-maler mot `_ds_bundle.js`. De fire mest polerte skjermene er altså skrevet utenfor komponentbiblioteket. `agencyos-ko` reimplementerer `QueueCard` for hånd mens `queue.card.html` finnes.

**Spacing-tokens forlatt.** `agencyos-konsoll.html`: 63 av 102 deklarasjoner bruker `--s1`–`--s6`. `agencyos-hjem`: 0 av 101. `agencyos-ko`: 0 av 138. Alt hardkodet px.

**Radius er 8px, ikke 12.** `--r: 8px`, `--r-sm: 6px`, resten hardkodet (`999px`, `4px`, `50%`). `agencyos-hq.html` hadde seks radius-tokens. Pakkens egen `index.html` bruker `border-radius: 12px` — startsiden matcher ikke sitt eget system.

**Lora er pynt.** 2–3 strenger per skjerm i standalone-filene, 0 i Kalender, Workbench og Spillerprofil. Systemet er i praksis Poppins + IBM Plex Mono, med mono i overvekt (23 regler i Stall). Velg: gi Lora all forklarende prosa (`.q-item p`, `.d-card .s`, `.panel-note`, `.prov`) eller stryk den fra fasiten.

**`--warn: #7A6220` er innført uten beslutning, `--info` er samtidig forsvunnet.** Fasit §4.3 krever `--info` som tredje prikkfarge på tidslinjen (lukket/åpen/delvis løst) — den tilstanden kan ikke uttrykkes nå.

**R1 · OneThingNow har mistet 3px-venstrekanten** i alle fire hi-fi-skjermer, mens `one-thing-now.card.html` fortsatt annonserer «3px venstrekant + pulsende mono-etikett» i undertittelen. Komponent og skjerm er i direkte motstrid. Kortet er dessuten pakkens svakest dekkede: 1 834 byte, null assertioner, null tilstander, null containerbredder — på den ene komponenten der oransje faktisk er tillatt.

**Komponentkortene spriker:** fire ulike smalbredder (300/380/430/`.band`), tre layoutmekanismer for modus-paritet, `.lab` hardkodet til 9,5px i to kort mot `SectionLabel` 10px i to andre, `.assert`-CSS duplisert nesten ordrett i `queue` og `shell`.

## 4. Datainkonsistens (billig å fikse, dyrt å la stå)

Emma Sæther / Emma Berg. Jonas Hveem / Jonas Li. «7 i kø» / «3 i kø». «Mandag 27. juli · uke 31» / «Fre 31. jul» på samme skjerm. Chat-svaret på Dashboard nevner tre personer som ikke finnes noe sted i skjermen. En fasit som skal kodes etter, blir kopiert inn i seeds som den står.

## 5. Falske affordanser — rydd før pilot

- `<kbd>/</kbd>` uten handler (Hjem, Kø)
- Skrivbart søkefelt med `cursor:not-allowed` (Hjem, Kø)
- 4 × `href="#"` i Kø, 4 × i Stall
- Aside i Kø som ser radbundet ut, men er statisk plakat
- `dataState` deklarert og aldri bundet i Spillerprofil og Sjekkpunkt
- `data-tap`-regelen i Testkjøring uten et eneste `data-tap`
- `maal`-arrayen i Testkjøring: deklarert, aldri brukt
- ~45 linjer død telefon/ladder/xp/tabs-CSS i Kø; 64 ubrukte klasser i Stall
- `index.html` annonserer 34 maler og lenker 36 mål; 26 av dem mangler i den opplastede pakken (verifiser mot Drive før tallet gjentas)
- «CANON ✓», «[natt 8]» — internspråk i produksjons-UI

## 6. Rekkefølge

**Nå (blokkerer pilot):**

1. Design fangstflaten. Bunnfestet, stemme primær, tall sekundær, nåbar fra Live og Testkjøring uten scroll. Uten denne er resten kosmetikk.
2. Gjør «Én ting nå» til én handling som endrer tilstand. Fjern duplikatene av samme sak på Dashboard. Ingen `data-toast`-attrapper i en fasit som skal kodes etter.
3. Én rail, fem flater, samme navn i alle 12 filer. Velg Stall eller Spillere og lukk §11.7.
4. Fiks mobil i Kø (rail forsvinner uten erstatning) og primærhandlingen i Kalender/Workbench/Sjekkpunkt som forsvinner under 1180px.

**Deretter:**

5. Legg 3px-kanten tilbake på OneThingNow og skriv assertionen som ville fanget tapet.
6. Flytt `--dn` bort fra terrakotta, eller innrøm at oransjemonopolet ikke finnes.
7. Ekte tomtilstander på Kø-filter, spillerliste, dispatch, dagpanel — med klokkeslett, slik fasit §5.4 sier.
8. Avvis-knapp på Sjekkpunkt. `cta-avvis` med etiketten «Rediger» er en uferdig tanke som har stivnet.
9. Rydd død CSS og falske affordanser før port til `src/`.
10. Beslutt Lora: alt eller ingenting.

**Senere (fasit-gjeld, ikke pilot-blokkerende):**

Workbench §7 i sin helhet (TimeGrid, drag + tastaturekvivalent, invariant-teller, diff, øvelsesbank). Maskinrommets fire seksjoner. Kalenderens Måned/År + periodebakgrunn + selskapsfilter. Konsollens arbeidslinjer og «Hvorfor dette tallet».

## 7. Én setning

Pakken ser ut som et ferdig system og oppfører seg som et moodboard: den tegner den røde tråden i tekst på ni skjermer og bygger den i null overganger — og hullet står nøyaktig der fangsten skulle vært.
