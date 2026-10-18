# WANG Toppidrett i nytt design: trenerskjermene

Status: **pakke 1 Grunnmur er godkjent 14.10.2026 (Anders: ja til aksefargene) og utvidet i utkast 2. Pakkene 2–8 er utkast 2 (16.10, retning B) og venter på port 7. Pakke 10 Data Golf er utkast 1 og venter bare på port 7. Åpne spørsmål står samlet nederst.**

Samleside utkast 2 (alle pakker bak én lenke): https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg · utkast 1: https://claude.ai/artifact/HW8QwEKadH369Bv4FszDSB

Gjelder trenerflaten i `/team-wang` i AK Golf HQ. Claude Design stenger 14.12, så Anders godkjente 14.10 at WANG tegnes i
repoet som HTML-utkast publisert som private Artifacts, samme metode som [PlayerHQ](../utkast-playerhq/README.md).
Anders går gjennom alt samlet til slutt (port 7).

## Rammer

- **Bare WANGs egne farger og skrifter.** Ingen AK-farger: ingen rust `#9B2415`, ingen sand eller grafitt, ingen
  Precision-akser. Kilde for verdiene: `src/styles/wang-tokens.css` og `AKSE_FARGE` i
  `src/app/team-wang/_components/ak-primitiver.tsx`. Skrift: Montserrat (overskrifter, tall) og Quattrocento Sans (brødtekst).
- **To roller: Trener og Sportssjef** (`.claude/rules/beslutninger.md` §WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER,
  bekreftet av Anders 14.10). De ti rollene i `docs/planer/wang-fredrikstad-demoreise-og-produksjonsplan-2026-10-14.md` gjelder ikke her.
- **Menyen:** I dag · Trening · Tester · Konkurranse · Meldinger · Elever, og Administrasjon bare for sportssjef.
- **Fellessiden `/team-wang` holdes utenfor** og endres ikke.
- **Én IUP og ett testbatteri** for AK Golf, WANG og Team Norway (§ÉN IUP OG ETT TESTBATTERI). Kategori A–K erstatter E–A+.
- **Bare syntetiske data.** Elevene er mindreårige: «Elev 04», «Trener 1». Aldri ekte navn.
- Aldri sidelengs rulling. Tekst minst 4,5:1 i kontrast (stor tekst 3:1).

## Nærmere AgencyOS (Anders 15.10.2026)

Anders 15.10: «Få designet på WANG-skjermene litt nærmere hvordan AgencyOS-skjermene ser ut. Og utbedre farger.»
Mal: AgencyOS-utkastene i `docs/design-system/utkast-agencyos/` (grenen `claude/agencyos-p4-workbench`, Cockpit og Stall).
WANG beholder egne farger og skrifter; oppsettet er hentet fra AgencyOS:

- **Skallet:** lys sidemeny på PC med navy aktiv rad og trener nederst, bjelle øverst til høyre. På mobil
  hamburgermeny, logo og bjelle i stedet for bunnmeny. Hurtigknappen (navy, 56 x 56) står på alle skjermer:
  Ny økt · Før oppmøte · Ny melding · Før test.
- **Toppen av skjermen:** dato over tittel, ingen farget flate. Nøkkeltallene står i tellere med tynn kant;
  det som krever handling får rosa kant (som rust-signalet i AgencyOS).
- **Flater:** ~~hvit bakgrunn, kort med tynn grå kant og 14 px hjørner, knapper med 10 px hjørner~~ (overstyrt 16.10: off-white bakgrunn og firkantede hjørner, §Nærmere wang.no), understrekte faner, navy avatarer.
- **I dag** har fått dagen som tidslinje, som Cockpit: én rad per time, øktene som fylte blokker i aksefargen, skoletimer i grått og rød nå-strek.
- **Farger:** ~~navy er handling~~ (overstyrt 16.10: vinrød hovedknapp, §Nærmere wang.no), rosa haster. Fra utkast 2 er mint bare status «ok». Aksefargene er uendret. Perioder, grupper og
  elevens prikker bruker ikke aksefarger.

## Utkast 2: retning B «Stall og helteflate» (16.10.2026)

Grunnlag: kartleggingen i `docs/planer/tn-wang-designloft-2026-10-16.md` (grenen `claude/tn-wang-designloft`) og
designbrevet 13.10. WANGs farger, skrifter og de godkjente aksefargene er uendret; grunnmuren er utvidet, ikke byttet ut.

- **Ett hovedtall per hovedskjerm** på en navy helteflate (`.helt`): stort tall, kort forklaring, én hvit knapp
  (`.knapp.lys`) og valgfritt golfbilde ved siden av (`.helt-bilde`, over på mobil), aldri tekst oppå bildet. De andre
  tallene står som små tellere (`.smaa-tall`). Toppen får plass i én skjermhøyde på 390 px.
  I dag: «5 saker krever deg, 2 før 07:50». Trening: «92 % av planen gjennomført». Elever: «2 elever trenger deg».
  Tester: «4 resultater venter på kontroll». Konkurranse: «10 dager til Juniortour Øst, finale».
- **Tre bånd** (`.baand`, `.baand-del`): Trenger deg · Følger planen · Ikke delt, med teller i båndhodet. Side om side på
  PC med `.baand.kol`. Brukt i Trening › Per elev og Elevlista.
- **Elevrad** (`.elevrad`): statusmarkør til venstre (rosa trenger deg, mint følger planen, grå ikke delt), avatar,
  navn og grunn, plan-stolpe (gjennomført mot planlagt tid siste fire uker) med strek ved 80 % (`i.strek`).
- **Fylt graf** (`WANGUtkast.fyltGraf`): arealet under linja fylt, stiplet mållinje. Trening › Uke for uke.
- **Én handlingsfarge: navy.** «Før oppmøte» og «Start testdag» var mint; mint er nå bare status «ok». `.knapp.mint`
  finnes fortsatt, men vises som navy så eldre utkast ikke brekker.
- **Krever handling** i I dag er gruppert etter frist (før 07:50 · i dag · denne uka), med én primærknapp per sak.
- **Turneringer med bilde** øverst i kortet og beste resultat stort på spilte turneringer.
- **IUP-hodet** har hovedtall (plan siste fire uker) og pyramiden som fylt bånd.
- Mindre grå småtekst med store bokstaver: høyst én slik linje per kort (datolinja over tittelen).
- «3 poeng»-merket i Trening er fjernet. Det betydde 3 prosentpoeng lavere enn de fire ukene før, og står nå som en setning.
- Samme elevtall i I dag, Trening og Elever: Elev 06 og 10 har ikke delt, Elev 02 og 09 trenger deg.
- Gammel toppramme heter `.topp` (dato, tittel, `.helt-tall`). `.helt` er fra utkast 2 helteflaten.
- Meldinger og Administrasjon har lett hånd: oppsettet fra utkast 1, bare grunnmuren justert. Ro er riktig der.

## Nærmere wang.no (Anders 16.10.2026)

Anders 16.10, etter utkast 2: «WANG må litt nærmere stilen som er på www.wang.no». Målt på wang.no samme dag og lagt inn
som eget lag nederst i `felles/wang.css` (gjelder alle pakkene). Aksefargene og statusfargene er uendret.

- **Firkantede hjørner overalt**, som wang.no. Bare avatarer og statusprikker er runde.
- **Hovedknappen er vinrød `#AE0034`** med store bokstaver i Montserrat, som «Søk Ung» på wang.no. Sekundærknapp har vinrød kant.
  I lister med flere saker har bare den mest akutte fylt knapp. Erstatter «navy er handling» fra 15.10.
- **Brødtekst i Quattrocento (serif)**, som wang.no. Overskrifter fortsatt Montserrat; sidetittelen er vinrød.
- **Varm off-white bakgrunn `#FCFAFA`**, tekst `#222` og `#444`.
- **Helteflaten har wang.nos gradient** navy → teal (`#17446F` → `#2E857D`) og store tall i lettere vekt, som «WANG i tall».
- **«Les mer →»-lenker** i rosa (`--rosa-tekst`, fordi wang.nos `#D12A5C` gir under 4,5:1 på hvitt).

`wang-tokens.css` i appen har i dag runde hjørner (26 px) og ingen vinrød. Det må endres når utkastene porteres, etter port 7.

## Aksefargene (godkjent av Anders 14.10.2026)

| Akse | Farge | Søyle og prikk | Flate med tekst | Tekst på flaten |
|---|---|---|---|---|
| FYS | Navy | `#17446F` | `#17446F` | hvit |
| TEK | Teal | `#2E857D` | `#226F67` (WANGs `--wang-teal-text`) | hvit |
| SLAG | Oransje | `#F47B20` | `#F47B20` | mørk navy `#0F172A` |
| SPILL | Blå | `#007DB1` | `#007DB1` | hvit |
| TURN | Lilla | `#7F1975` | `#7F1975` | hvit |

Samme valg som koden har i dag (`AKSE_FARGE`, `PY_AXES`). To grep for kontrasten: TEK-flater bruker WANGs mørkere teal,
fordi hvit på `#2E857D` gir 4,4:1. SLAG-flater har mørk tekst, fordi hvit på oransje gir 2,7:1.

**Status bruker andre farger enn aksene:** mint er ok, gul venter, rosa haster eller feil, grå nøytral. Da betyr oransje
alltid SLAG og teal alltid TEK. Koden gjør det ikke i dag (se avvik 3).

## Pakkeplan

| Pakke | Skjermer | Fil | Status | Lenke |
|---|---|---|---|---|
| 1 Grunnmur | Skall og meny (390 og 1280, trener og sportssjef), aksefarger, pyramide, øktkort, ukefordeling, graf, knapper, status, felt. Utkast 2: helteflate, tre bånd, elevrad, fylt graf | `grunnmur.html` | **Godkjent 14.10** (aksefargene, Anders), utvidet i utkast 2 (16.10) | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 2 I dag | I dag (dagens fokus, økter, krever handling, oppfølging, uka), Oppmøte morgentrening, Økta (med avlys), Meld fravær | `idag.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 3 Trening | Oversikt WANG-42 (etterlevelse, morgentrening, per akse, uke for uke, per elev), Årsplan skoleåret 2026/27, Periodeskjema (timer per akse, kvittering), Uka (lagt inn mot fordelt), Ny økt (pyramiden først) | `trening.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 4 Tester | Testbatteriet (golf og fysisk), Til kontroll (egenført og kontrollert, WANG-37), Før test (8-ball slag for slag, WANG-48B), Én test (gruppa, nivå «—»), Én elev (testprofil) | `tester.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 5 Konkurranse | Kalender (WANG-10), Én turnering med evaluering per elev (WANG-11), Sesongen med SG og Data Golf (WANG-09, WANG-50), Samling og uttak (WANG-27, C2) | `konkurranse.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 6 Meldinger | Innboks, Én elev (foresatte leser under 18, WANG-14), Gruppepost med lesekvittering (WANG-13), Foreldremøte (WANG-15), Dokumenter med rekkevidde (WANG-21) | `meldinger.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 7 Elever | Elevlista (WANG-07), Én elev (WANG-44), IUP i arkets rekkefølge, Fireukerssjekk (WANG-45), Foreslå endring, Ikke delt | `elever.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 8 Administrasjon | Trenere og roller (WANG-19), Samtykke og deling (WANG-34), Timeplan med kollisjoner (WANG-26), Opptak med plasser og kandidater (WANG-31, -32), Koordinering mellom skolene (WANG-33). Trener får «Denne siden er lukket» | `administrasjon.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 9 Samleside | Alle åtte pakker, det viktigste å ta stilling til, feil i dagens kode | `index.html` | **Utkast 2** (16.10) | https://claude.ai/artifact/THcuAZdFY454ix4Ha2BvUg (samlesiden) |
| 10 Data Golf | DG-01 Oversikt, DG-02 Proffkatalog, DG-03 Proffprofil, DG-04 Topplister, DG-05 Elev mot proff, DG-06 Innspill-tak, DG-07 Fra funn til forslag, DG-08 Norske proffer, DG-09 Kilde og dekning. Under Konkurranse › Data Golf (WANG-50). Samme skjermer og regler som AgencyOS pakke 10 | `datagolf.html` | **Godkjent 16.10** (Anders: «Ja alle»), bygges (bruksretten er avklart 16.10) | https://claude.ai/artifact/9Wj9yJqkEXBKomyCQ1D97Q |

Én fil og én PR per pakke. Hver skjerm i 390 og 1280, med tom, laster og feil.
Kilder for innhold: `designsystem/wang/SKJERMREGISTER.md`, `designsystem/wang/TILGANGSMATRISE.md` og vedtakene i
`.claude/rules/beslutninger.md`. WANG og Team Norway foreslår endringer i elevens plan; eleven bestemmer.

## Slik lages en skjerm

1. Ny fil i denne mappen. Mal: `grunnmur.html`.
2. `<link rel="stylesheet" href="felles/wang.css">`, Google Fonts-lenken fra malen, og egen `<style>` bare for det skjermen trenger.
3. Skjermen ligger i `<template id="skjerm"><div class="app" data-fane="trening"><main class="innhold">…</main></div></template>`.
   `felles/wang.js` bygger topplinje, sidemeny, bunnmeny og Mer-arket. Undersider: `data-skall="tilbake" data-tilbake="Elever"`.
4. `<script src="felles/wang.js"></script><script>WANGUtkast.start({ etter: fn, tom: {tittel, tekst, knapp}, laster: '…', feil: '…' })</script>`.
   Flere skjermer i én fil: `WANGUtkast.start({ skjermer: { id: { mal, etter, tom, laster, feil } } })` med velger `data-skjerm` og lenker `data-gaa`.
   Velgerne på siden: `data-bredde` (mob, pc), `data-rolle` (trener, sportssjef; `rolle: 'sportssjef'` i `start` for sider som starter som sportssjef), `data-tilstand` (data, tom, laster, feil).
   Innhold bare for sportssjef: `data-bare="sportssjef"`. Skjult med `hidden` virker også på kort.
5. Kontroll: `[ROLLE=sportssjef] NODE_PATH=<hovedrepo>/node_modules node kilder/sjekk.js $PWD/<fil>.html <ut>` gir skjermbilder,
   måler sidelengs rulling i 390 og 360 px, samler JS-feil og måler kontrasten på all tekst, for hver skjerm i fila. Se på bildene før publisering.
   Tekst over gradient eller bilde måles ikke automatisk (står som «manuelt»); helteflatens lyseste punkt gir 6,1:1 for hvit tekst.
6. Bruk aldri aksenavnene (`fys`, `tek`, `slag`, `spill`, `turn`) som egne klassenavn i en skjerm. De styrer fargen på `.akse`, `.okt` og `.bg-*`.
7. Farge betyr akse også her: perioder, status, elevens og trenerens prikker og grupper bruker aldri aksefargene. Mint og gul er status, grå er nøytralt.
8. Publiser med Artifact: `file_path` = skjermfila, `root` = denne mappen, `files` = `felles/*` og bildene den bruker.

Bildene i `bilder/` er kopier fra PlayerHQ-utkastene (FYS-bildet er Unsplash, Victor Freitas). Logoene er fra
`designsystem/wang/assets/`.

## Avvik i koden i dag (ikke rettet, bare registrert)

1. **AK-rust i WANG-flaten.** `src/app/team-wang/WangToppidrettPrecisionView.tsx` bruker `#9B2415` fire steder: linje 272
   (lenken «Meld fravær»), 292 (Award-ikonet ved nasjonale fysiske tester), 442 (varselikonet i fraværsdialogen) og 479
   (knappen «Bekreft fravær»). Samme fil bruker også AK sand og grafitt (`#DDD9D1`, `#141413`). Skal bli WANG-tokens:
   rosa for bekreft fravær, navy for vanlige handlinger.
2. **Delte AK-komponenter i WANG.**
   - `src/components/workbench/Trenerforslag.tsx` (brukt i `src/app/team-wang/coach/iup/[elevId]/page.tsx`): grunnstilen
     bruker AK-tokens (`--surface-1`, `--border-default`, `--surface-inverse`, `--text-inverse`, `--type-body-s`).
     WANG-varianten (`wangPanel`, `wangKnapp`) overstyrer bare deler av dem.
   - `src/components/workbench/SamlingsprogramKontroll.tsx` (brukt i `src/app/team-wang/coach/coach-arsplan.tsx`):
     WANG-stilen viser til `--bg-surface`, som ikke finnes i `wang-tokens.css`.
   - `src/components/v2/toppbar-hoyde.ts` (brukt i `coach-arsplan.tsx` og `_components/wang-fellesside.tsx`): ingen farger,
     bare høyden på topplinja. Det er en avhengighet til AKs v2-skall, ikke et fargeavvik.
3. **Status har samme farge som aksene.** `STATUS_FARGE` i `ak-primitiver.tsx` bruker oransje for «På vei» og teal for
   «Nådd», som er SLAG og TEK. Utkastet bruker gul og mint.
4. **Teal og oransje som tekst.** `--wang-teal` på hvitt er 4,4:1 og `--cat-orange` 2,7:1. Koden bruker allerede
   `-text`-variantene der den er riktig; nye skjermer skal gjøre det samme.

## Nytt i utkastet som ikke finnes i `wang-tokens.css`

- `--rosa-tekst: #A81F49`: rosa tekst på rosa tint. WANGs `#D12A5C` gir bare 4,2:1 der. Forslag til nytt token.

## Åpne spørsmål til Anders

Skrevet her i stedet for å vente (bestilling 14.10: alt ferdig til morgenen). Ingen av dem stopper tegningen.

### Pakke 3 Trening
1. Ligger morgentreningene (WANG-04) fast i timeplanen, eller kan trener flytte dem i uka? Utkastet lar trener endre dem som vanlige økter.
2. Skal en WANG-elev kunne ha «Egen» uke i gruppas plan, eller sender treneren bare forslag? Utkastet viser at eleven arver gruppas plan og at endringer fra trener er forslag (vedtaket 06.10).
3. Periodene i årsplanen er et forslag: Turneringsperiode uke 33–41, Evaluering uke 42, Restitusjon uke 43, Grunnperiode uke 44–51 og 2–9, Spesialperiode uke 10–17, Turneringsperiode uke 18–25, Ferie. Fasit for WANG 2026/27 er årshjulet i repoet; tallene her er syntetiske.

### Pakke 4 Tester
1. Nivåtallene for A–K per test er ikke vedtatt. Utkastet viser «—» og «Referanse ikke satt».
2. Landslagsnivå per klasse må komme fra Team Norway. Til da «—».
3. Dagens kode har knebøy og CMJ i WANGs fysiske tester (`src/components/wang/wang-data.ts`). Vedtaket 28.09 sier benkpress, markløft trapbar, lengdehopp, rotasjonskast og Club Speed. Utkastet følger vedtaket.
4. WANG-39 «nasjonal rangering og persentiler» er ikke tegnet: posisjon er aldri persentil, og en trener ser ikke andre skolers elever. Rangering i egen gruppe ligger i «Én test». Skal en nasjonal rangering finnes, må tallene komme fra Team Norway.

### Pakke 10 Data Golf
1. **Avklart 16.10:** Data Golf vises bare for coacher i AK Golf, WANG og Team Norway, aldri for kunder (beslutninger.md §DATA GOLF VISES ALDRI TIL KUNDER). Bruksretten for WANG-trenere er dermed avklart. Utkastet venter bare på port 7. DG-09 i `datagolf.html` viser fortsatt «Ikke avklart» og rettes når pakken får utkast 2. `docs/design-system/datagolf-coach-datakart-og-skjermliste.md` er felles grunnlag.
2. **Avklart 16.10:** WANG-trenere ser Data Golf (alle med coach-rollen, også WANG-trenere). Ingen begrensning til sportssjef.
3. Innspill-tak som øvelse: sirkelen er proffens nærhet rett av. Skal elever under kategori C få et trinn (for eksempel proffens tall + 30 %)?
4. Underpunktene WANG-50.10–50.17 (live, modellanalyse, bane og felt, trend, datautforsker, kilde, tiltak, spesialistdata) er kuttet i `src/components/wang/wang-data.ts`; de ni som står igjen har navnene fra skjermlista. `WangKonkurranse.tsx` viser fortsatt den gamle WANG-50-fanen og er ikke endret.

### Pakke 5 Konkurranse
1. **Avklart 16.10:** WANG-trenere ser Data Golf-sammenligningen (WANG-50), som coacher i AK Golf og Team Norway. Aldri kunder. Utkastet viser den, merket «Powered by Data Golf» og «Bare for trenere».
2. Hvem publiserer uttaket til samlinger? Utkastet lar trener lagre kladd og bare sportssjef publisere.
3. Dagens kode viser «College D1 snitt» som referanse i turneringsanalysen (`WangKonkurranse.tsx`). Kilden er ukjent. Utkastet bruker neste kategori (Broadie, estimat) og Data Golf.

### Pakke 6 Meldinger
1. Skal Meldinger i WANG være samme innboks som i AgencyOS, eller egen? Utkastet viser egen, bare med WANG-samtaler.
2. Skal foreldremøter også sendes på e-post? Utkastet sender bare i PlayerHQ.
3. Dagens meldingsflate i appen (`/team-wang/app/meldinger`) er skrivebeskyttet. Utkastet tegner sending; det krever byggearbeid og en sjekk av at foresattes lesetilgang faller bort ved 18.

### Pakke 7 Elever
1. Skole og fravær (WANG-05) er ikke tegnet som egen skjerm: timeplan og prøver hører til eleven i PlayerHQ. Skal treneren se elevens prøveplan?
2. Invitasjon til PlayerHQ fra WANG (WANG-20) venter til delingen virker (vedtaket 28.09). Utkastet viser bare «Minn eleven på det» når eleven ikke har delt.
3. Hvilke 41 spørsmål og hvilke områder utviklingssjekken har, kommer fra Team Norways ark. Områdene i utkastet (Teknikk, Slag og spill, Fysisk, Mental forberedelse, Livsstil og skole) er plassholdere.
4. Dagens kode har realistiske fornavn og etternavn på demoelever (`src/components/wang/wang-data.ts`). Elevene er mindreårige; tegningene bruker «Elev 04».

### Pakke 8 Administrasjon
1. Hvilke vurderingspunkter skal opptaket bruke (D1)? Utkastet viser fire plassholdere: Spill, Teknikk, Fysisk, Holdning og skole.
2. Skal sportssjef kunne invitere trenere selv, eller går det via AK Golf? Utkastet lar sportssjef invitere.
3. Opptak og koordinering trenger nye tabeller (kandidat, stjernemerke per skole, kontaktlogg uten innhold), se `designsystem/wang/DATAMODELL.md` og vedtaket 26.09.
