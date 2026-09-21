# Workbench og PlayerHQ — restplan 21.09.2026

Gjeldende restplan følger nedenfor. Nattloggen lenger ned er historikk.
Planen er ikke en ny tillatelse til produksjonsendringer, kontrollsvekkelser
eller publisering. Ordinær design og lokal kode er allerede bestilt.

**Gjeldende kontrollpunkt 21.09:** Anders har autorisert isolert lokal testing
og bedt om at prosjektregelen oppdateres først. Dette er utført i `AGENTS.md`.
Docker og separat Supabase kjører med bare lokale porter og syntetiske kontoer.
Appen kjører på `http://127.0.0.1:3105`; eksisterende miljøfiler og produksjon
er uendret. Det ventes ikke lenger på godkjenning av dette testmiljøet.

Full `npm run verify` bestod etter kobling av skole-/opptattblokker: **3318 tester,
4 komponenttester og bygg**. Etterfølgende avgrenset skjermretting av mørke
skjemafelt og øvelsesrad kontrolleres separat. Innlogget lokal oppretting,
flytting, publisering, oppfriskning, tilbaketrekking, mal og øvelseslagring er
prøvd. Se [kontrollrapporten](../design-audit/workbench-kontrollretting-2026-09-21.md).

**Lanseringsfrist:** tirsdag **22.09.2026 kl. 18.00 Europe/Oslo**, satt av Anders.
Dette er en frist, ikke et bevis på at hele omfanget er leveringsklart.
Egen designoppgave «AK Golf HQ – designverksted i Claude Design» er opprettet
(`01a0c350-a225-7f13-a026-5cd53c898813`). Den arbeider med Anders, én faktisk
skjerm om gangen; kode og testing fortsetter her. Bare en uttrykkelig valgt
versjon erstatter tidligere fasit. Anbefalt første designarbeid er PlayerHQ.

**Nytt kontrollpunkt:** serie, kildedrag, publiseringsutvalg, avvist tilgang,
spillerbytte/tilbake og mobilens dag-/øktvalg er prøvd innlogget. Varighet som
feilaktig ble rundet opp er rettet og prøvd på nytt. Nye side-ved-side-bilder
1440/390 foreligger; gjenværende innholds-/funksjonsavvik står i rapporten.
Ny full verify består: **3321 tester, 4 komponenttester og bygg**, uten hoppede
tester. Teknisk Uke-kontroll og innloggede bilder foreligger; Anders er ikke
tilskrevet visuell godkjenning. Neste byggetrinn er Periode. Ingen deploy er utført.

**Måned-kontroll 21.09:** Måned er koblet til den beskyttede spilleruten med
direktelenke og forrige/i dag/neste. Månedsrutenett, fremdrift hittil,
pyramidefordeling, riktig avgrensning av randuker og tom måned er kontrollert
innlogget på desktop og 390 px. Full verify består med **3327 tester, 4
komponenttester og bygg**. Se
[Måned-kontrollen](../design-audit/workbench-maned-kontroll-2026-09-21.md).
Neste byggetrinn er År. Ingen deploy er utført.

**År-kontroll 21.09:** År er koblet til den beskyttede spilleruten med
årsbytte, plan mot gjennomført hittil, pyramidefordeling, periodebånd,
periodetabell og tomtilstand. Periodevalg oppdaterer detaljpanelet; bare
«Åpne periode» navigerer og beholder riktig periode-ID. Desktop og 390 px er
kontrollert innlogget. Full verify består med **3329 tester, 4 komponenttester
og bygg**. Se [År-kontrollen](../design-audit/workbench-aar-kontroll-2026-09-21.md).
Neste byggetrinn er Økt. Ingen deploy er utført.

**Økt-kontroll 21.09:** Økt er koblet til den beskyttede spilleruten med
eksplisitt økt-ID, øktvelger, åtte formelfelt og «Valgt øvelse». Eksisterende
handlinger for tid, publisering og øvelser er beholdt. Syntetisk øvelse med
Måte og Målsetning ble lagret og bekreftet etter ny lasting. Desktop og 390 px
er kontrollert innlogget. Full verify består med **3330 tester, 4
komponenttester og bygg**. Se
[Økt-kontrollen](../design-audit/workbench-okt-kontroll-2026-09-21.md).
Neste byggetrinn er Stall. Ingen deploy er utført.

**Stall-kontroll 21.09:** Stall er koblet til den beskyttede spilleruten som
en tilgangssikret 14-dagers oppfølgingsliste uten kildepanel. Filtre, radvalg,
URL-bevaring, åtte formelfelt og fast mobilpanel er kontrollert innlogget.
«Godkjenn økt» vises bare for en faktisk ventende PlanAction og bruker den
eksisterende rolle- og lagringskontrollen; spillerens egen godkjenning kan ikke
overstyres. Full verify består med **3332 tester, 4 komponenttester og bygg**.
Se [Stall-kontrollen](../design-audit/workbench-stall-kontroll-2026-09-21.md).
Neste byggetrinn er Live. Ingen deploy er utført.

**Live-kontroll 21.09:** Live er koblet til den beskyttede spilleruten som
egen mørk flate med negativ logo, faktisk pågående økt og neste publiserte
økt. Start og overgang mellom økter, løpende klokke, slagtelling, serier og
øvelsesstatus lagres i eksisterende `liveSnapshot`. Desktop og 390 px er
kontrollert innlogget mot valgt WB-09. Full verify består med **3338 tester,
4 komponenttester og bygg**. Se
[Live-kontrollen](../design-audit/workbench-live-kontroll-2026-09-21.md).
Neste byggetrinn er Min kalender. Ingen deploy er utført.

## Mål og avgrensning

Fullfør valgt Workbench-design i faktisk AgencyOS-app, deretter PlayerHQ
I dag, Plan, Analyse og Meg. Bevar eksisterende funksjoner og dataflyt.
Ingen TN, WANG, nye produkter eller ny palett. Andre AgencyOS-sider skal
beholde fungerende navigasjon; de får ikke et uavklart redesign i denne planen.

Uke, Periode, Måned, År, Økt, Stall og Live er lokalt implementert og kontrollert
innlogget mot isolert database; produksjonsversjonen er ikke verifisert med den
nye koden. Min kalender gjenstår i Workbench. Siste bevis og
testresultater står i de daterte rapportene under `docs/design-audit/`.

## 1. Fjern hindringene med en etterprøvbar løsning

| Oppgave | Ansvar og avhengighet | Ferdig når |
|---|---|---|
| Kartlegg de to abonnementstestene og ni bortfalte designreferansene | Codex kan analysere kode og Git-historikk nå | Rapport viser hva hver kontroll skal beskytte, hvorfor den feiler og konkret forslag som bevarer beskyttelsen |
| Rett kontrollene eller den manglende implementeringen | Codex etter at foreslått løsning er vurdert mot tidligere avvisning | Relevante regresjonsprøver og deretter full `npm run verify` består; ingen falske referanser, slettede tester eller svekkede grenser |
| Etabler eksisterende coach/admin-innlogging | Anders fullfører nødvendig innlogging; Codex kontrollerer riktig rolle | Beskyttet Workbench kan åpnes med riktig spilleravgrensning uten endrede tilgangsregler |
| Klargjør trygg innlogget test og forhåndsvisning | Codex kartlegger eksisterende testmiljø og syntetiske kontoer; manglende oppsett beskrives konkret | Det er klart hvilken kodeversjon, innlogging og datakilde som brukes, og testen skriver ikke til produksjon |
| Gjør kontrollert kode tilgjengelig på Vercel | Krever grønn kontroll og konkret autorisasjon til aktuell forhåndsvisning/publisering | Riktig kodeversjon er READY og kan åpnes av riktig rolle |

De tidligere avviste forslagene — gjenopprette gammelt DDL-skript og senke
153/219-grensen — skal ikke gjentas uten konkret ny autorisasjon. Førstevalg er
å finne en løsning som fortsatt prøver den faktiske beskyttelsen. En reell
endring av kontrollgrunnlaget må beskrives som en egen beslutning, ikke skjules
i designarbeid. Ingen databaseendring inngår i å reparere dokumentkontrollen.

Mens tilgang mangler, kan analyse, testbeskrivelse, vurdering av eksisterende
testmiljø og gjennomgang av Uke-avvik gjøres. Ikke gjenta grønne kontroller
eller starte neste fane for å fylle ventetid. En isolert komponentprøve beviser
fortsatt ikke innlogging, lagring eller publisering.

## 2. Fullfør Uke før neste fane

- Kontroller oppretting, redigering, flytting, sletting, kildedrag og
  publiseringsutvalg i avtalt testmiljø. Prøv både vellykket lagring og feil.
- Kontroller uke- og spillerbytte, tilbakeknapp, oppfriskning og at valg ikke
  viser gamle data. Prøv coach med tillatt og avvist spillertilgang.
- Avklar eventuelle manglende datakilder for formelfeltene; ikke fyll «—» med
  demonstrasjonstall eller legg til databaseskjema uten konkret autorisasjon.
- Sammenlign innlogget skjerm ved 1440 × 880 og 390 × 844 mot valgt PNG.
  Bruk konsistente testdatoer; fasitens motstridende uke/dato/år dokumenteres.
- Rett faktiske layoutavvik, prøv berøring/tastatur og tom/lastende/feiltilstand.
  Dokumenter 05–22, 32 px timerader, minst 44 px kort, heldagsbånd og overlapp.
- Vis app og fasit ved siden av hverandre for Anders. Registrer teknisk
  kontroll og visuell vurdering separat. Ikke be om samme designvalg på nytt.

**Utgangskrav:** funksjonene er prøvd med faktisk lagring i avtalt miljø,
innlogget bildebevis foreligger, avvik er rettet eller konkret avklart,
kvalitetskontroll er grønn og den bestilte visuelle vurderingen er registrert.

## 3. Bygg Workbench videre, én fane om gangen

Start neste rad først når foregående har passert samme funksjons- og
bildekontroll som Uke. Gjenbruk skall, formelfelt, kilder og detaljpanel.
Kartlegg eksisterende komponenter og serverhandlinger før ny kode; ikke monter
hele gamle `WorkbenchV2` som snarvei. Koble støttede `vis`-verdier til faktisk
innhold trinnvis, og test direkte lenker, oppfriskning og tilbakeknapp.

| Rekkefølge | Fane | Leveranse og særskilt kontroll |
|---|---|---|
| 1 | Uke | Lukk kontrollpunktene over; dagens lokale arbeid er utgangspunkt |
| 2 | Periode | Åtte ukers tidslinje, volum i timer og «Valgt periode»; utvalg og datoavgrensning følger samme plan |
| 3 | Måned | Sju kolonner, tre synlige linjer og «+N mer»; velg dag og åpne økt uten å miste skjulte økter |
| 4 | År | Periodebånd velger i detaljpanelet; bare «Åpne periode» bytter til riktig periode |
| 5 | Økt | «Valgt øvelse», alle åtte formelfelt med avtalte forklaringer; prøv eksisterende redigering og lagring |
| 6 | Stall | Liste og detaljpanel uten 236 px kildepanel; «Godkjenn økt» følger eksisterende rolle- og lagringskontroll |
| 7 | Live | Mørk flate kun her, negativ logo og «START ØKT»; prøv faktisk start, pågående tilstand og eksisterende avslutningsflyt |
| 8 | Min kalender | Riktige egne økter, kildepanel og «Valgt økt»; ingen Publiser-handling, «Åpne økt» er grafitt |

Felles regler: topp 56 px, kilde 236 px bare på avtalte flater, detaljpanel
340 ±8 px, åtte faner på én rad og avrunding 2 px. Rust er bare Publiser,
Godkjenn og START ØKT. Bruk avtalt ordliste, timer som volum og «—» ved
manglende verdi. Ingen funksjoner fjernes for å oppnå bildelikhet.

## 4. Fullfør PlayerHQ etter Workbench

Før koding kontrolleres den faktisk valgte referansen for hver spillerflate.
Workbench-eksporten alene er ikke fasit for hele PlayerHQ. Manglende eller
motstridende valg beskrives konkret; en ny retning velges ikke automatisk.

| Rekkefølge | Flate | Ferdigkrav |
|---|---|---|
| 1 | I dag | Riktig dagsplan, tydelig øktstatus og fungerende inngang til samme økt |
| 2 | Plan | Publisert coach-plan vises hos riktig spiller; datoer, økter og volum stemmer |
| 3 | Analyse | Tall kan spores til datagrunnlag, periode og enhet; tomme data er tydelige og grafer er lesbare på mobil |
| 4 | Meg | Valgt design med eksisterende profil- og innstillingsfunksjoner bevart; personvern og tilgang endres ikke som styling |

Kontroller sammenhengen coach-plan → publisert plan → spillerens I dag/Plan
→ økt → gjennomføring → Analyse. Utfør skrivehandlingene med syntetiske data
i avtalt testmiljø. Ikke utvid til nye analysefunksjoner eller øktmodeller.

## 5. Sluttkontroll og levering

1. Gjennomgå hele avtalte reisen på mobil og desktop, inkludert hovednavigasjon,
   relevante feilstier, tastatur, fokus og tilbakegang. Ingen ny meny er bevis
   på at alle sider bak den er ferdige.
2. Kjør full `npm run verify` og dokumentkontroll. Skill dokumenterte tidligere
   feil fra ny regresjon; en rød kontroll er fortsatt rød.
3. Lever oversikt per flate: valgt kilde, kodeversjon, faktisk rute,
   funksjonstest, bildebevis, avvik og Anders' vurdering. Bilder holdes privat.
   Prosent pikselforskjell brukes som diagnostikk, ikke som automatisk godkjenning.
4. Gjennomgå diff, lag ryddige commits når kontrollene er grønne, og klargjør
   en konkret publiseringspakke med endringer, risiko og gjenopprettingsmåte.
   Publiser først innen uttrykkelig autorisert omfang; ingen testdata i produksjon.
5. Etter autorisert publisering: kontroller riktig versjon, innlogging,
   nøkkelflyter og live-bilder. Pause automatisk oppfølging først når hele det
   avtalte omfanget er verifisert ferdig, eller Anders ber om det.

## Beslutninger og første neste handling

Anders trengs for eksisterende coach/admin-innlogging, eventuell konkret
kontrollendring som fortsatt krever autorisasjon, manglende designvalg og
autorisert forhåndsvisning/publisering. Codex eier analyse, forslag, ordinær
design og kode, tester, sammenligninger og rapportering innen bestilt omfang.
En planbestilling er ikke automatisk godkjenning av disse særskilte handlingene.

**Første kontrollpunkt er utført:** abonnementstestene er rettet,
kildebyttet er konkret godkjent, full verify består og isolert testmiljø er
autorisert og etablert. **Neste handling:** fullfør innlogget Uke-kontroll.
Produksjonskontoer, tilgangsregler og deploy krever fortsatt konkret autorisasjon.
Ingen ferdigdato loves før tilgang, kontrollfeil og PlayerHQ-fasit er avklart;
arbeidet måles mot ferdige kontrollpunkter, ikke antall kjøringer.

## Bestilling og rammer

Anders har 20.09 gitt forhåndsgodkjenning til løpende arbeid i Claude Design
og lokal kode, med relevante skills og sammenligning mot fasiten. Arbeidet
fortsetter etter siste beskjed til avtalt omfang er ferdig; den tidligere
klokken-08-grensen er fjernet. Automatisering: `ak-golf-hq-nattarbeid`, aktiv hvert
5. minutt i denne oppgaven. Maskin, app og nødvendige tilkoblinger må være
tilgjengelige. Ingen garanti om at alle flater blir ferdige i tidsrommet.

Omfang: Workbench, deretter avtalte AgencyOS/PlayerHQ-flater. Ikke TN/WANG,
nytt produkt, ny palett eller ny master. Publisering og produksjonsdata krever
fortsatt egen konkret autorisasjon; ingen omgåelse av tilgang eller godkjenningskontroll.
De nye prosjektinstruksene 21.09 krever egen arbeidsgren. Arbeidet er flyttet
til `codex/workbench-launch-20260922` med eksisterende endringer bevart; ikke
flytt eller slett andres arbeid. Ingen force/reset/clean eller kontrollomgåelse.

## Kilder

- [Workbench-overlevering](../workbench-handover.md).
- [Kontrollert import og startstatus](../design-audit/workbench-handover-import-2026-09-20.md).
- [Arbeidsmåte i AK HQ Design](../../.claude/skills/ak-hq-design/references/workbench-design-og-kode.md).
- Masterprosjekt: https://claude.ai/design/p/830e7bce-eaba-465b-848c-26f73bd0f2d3.
- Kode ved start: `96aa1503f`; dokumentimport er lokal, ikke committet.

## Arbeidsrekkefølge

1. Sikre gjenbrukbar skjermsammenligning og oppdatert Workbench-referanse i skillen.
2. Rett eksisterende stopp i kvalitetskontrollen uten å utvide unntak:
   hardkodede Workbench-farger og 137 brutte dokumentlenker etter oppryddingen.
   Bevar historikk; gamle filer gjeninnføres ikke som aktive kjøreordrer.
3. Uke: mål og sammenlign faktisk montert appkomponent mot PNG ved 1440/390.
   Start med samme syntetiske data i isolert lokal rigg hvis live-tilgang mangler.
   Noter alle avvik; rett etter valgt fasit og bevar funksjoner.
4. Kontroller handlinger, mobil, tom/lasting/feil; kjør relevante tester og full
   kvalitetskontroll før commit. Ingen påstand om live-verifisering uten innlogging.
5. Fortsett Periode → Måned → År → Økt → Stall → Live → Min kalender når
   kontrollpunktet for foregående pille er oppfylt. Deretter PlayerHQ
   I dag/Plan/Analyse/Meg med sin navngitte fasit.

## Kontroller per pille

Registrer designhash, kodeversjon, faktisk komponent/rute, syntetiske data,
viewport/pikselfaktor, målinger og private bildefiler. Referansebilder er 2×:
2880 × 1760 / 780 × 1688. Mål i CSS-px: topp 56, kilde 236, inspektør 340 ±8,
timerad 32, kort/treff minst 44. Rust bare avtalte handlinger; grafitt i kort
og fordelinger. Periode = «Valgt periode». Ingen selectedForBuilding-endring.

Sammenligningsmotor: `scripts/workbench-compare.mjs` (PNG/JPEG inn, side-ved-side,
differanse og JSON ut). Bruk `--help`. Den er et måleverktøy, ikke en automatisk
visuell godkjenning. Ta faktiske nettleserbilder med cua_repl. Private bilder
og råresultater lagres under `/private/tmp/ak-hq-workbench-natt-20260920/`.

## Status ved oppstart

| Pille | Design | Aktiv coach-kode | Lokal bildeprøve | Live |
|---|---|---|---|---|
| Uke | Importert | Delvis | Gjenstår | Venter på coach-økt |
| Periode | Importert | Mangler | Gjenstår | Gjenstår |
| Måned | Importert | Implementert lokalt | Kontrollert desktop/390 | Gjenstår |
| År | Importert | Implementert lokalt | Kontrollert desktop/390 | Gjenstår |
| Økt | Importert | Implementert lokalt | Kontrollert desktop/390 | Gjenstår |
| Stall | Importert | Implementert lokalt | Kontrollert desktop/390 | Gjenstår |
| Live | Importert | Implementert lokalt | Kontrollert desktop/390 | Gjenstår |
| Min kalender | Importert | Mangler | Gjenstår | Gjenstår |

## Hindringer ved nattarbeidets oppstart (historikk)

- Nettleseren hadde spillerrolle; `/admin` sendte til `/portal`. Coach/admin-økt
  er etterspurt. Ikke endre roller, hente produksjonsdata eller omgå vaktene.
- Full verify stoppet på hardkodede farger før tester/bygg. Typesjekk/lint bestod
  med tre advarsler. Dokumentkontroll: 137 gamle feil, ingen nye fra importen.
- PlayerHQs eksakte nyere fasit må kontrolleres før avhengig portering.

## Nattlogg

- 21.58: eksisterende natt-automatisering gjenbrukt og koblet til denne oppgaven.
- AK HQ Design v5 har Workbench-referanse; ingen konkurrerende hovedskill.
- Sammenligningsmotor ferdig: `scripts/workbench-compare.mjs`. Bestått prøve
  med identiske PNG-er, kjent 16-pikslers avvik, CSS-koordinater ved 2×,
  eksplisitt grensebrudd, ulik bildestørrelse og sperre mot lagring i repoet.
- Reell designrevisjon før/etter sammenlignet: 150857 av 5068800 piksler
  (2,976 %). Private resultater i `design-revisjon/` under nattmappen. Dette
  sammenligner to designrevisjoner, IKKE app mot design eller godkjent live.
- Hardkodede farger flyttet til felles eksisterende AK-tokenlag med samme
  eksakte verdier. Filer: `CoachWorkbenchMount.tsx`, `WorkbenchUke.tsx`,
  `SessionInspector.tsx`, `ak-hq-tokens.css` og `workbench-lov.css`.
  `check-token-gap` og målrettet ESLint bestått. Ingen tilgang/data/loggendring;
  de tre sikkerhets-/personvernspørsmålene gir ingen ny eksponering i denne diffen.
- Strukturkontroll og `git diff --check` bestått. Full verify er ikke kjørt
  på nytt før de resterende dokumentfeilene er rettet; ingen commit/push/deploy.
- Midlertidig `caffeinate -i` kjører til omtrent 08.00 for å hindre automatisk
  hvile. Dette holder ikke en lukket bærbar eller avslått maskin tilgjengelig.

## Oppdatert 21.09.2026

Se [Uke-kontrollen](../design-audit/workbench-uke-kontroll-2026-09-21.md).
Dokumentlenkene er rettet. Uke er portert lokalt til valgt skall og kalender,
med mobilark og målt geometri. Bygg bestod; senere endringer kontrolleres samlet.
3303/3305 tester bestod ved første fulle kjøring. De to feilene skyldtes slettet
arkivskript. Forslag om gjenoppretting og justert siteringsgrense ble avvist av
automatisk kontroll og tilbakeført. Testene og grensen er uendret.

Nettleserverktøyet hang i flere timer under en native app-forespørsel; det var
ikke aktiv fremdrift i den perioden. Arbeidet fortsatte da verktøyet returnerte.

Lokal funksjonskontroll, fersk verify og skjermsammenligning er utført. Siste
bygg bestod. Full verify stopper fortsatt på uendret historisk siteringsgrense;
samlet testkjøring har fortsatt to kjente feil. Det finnes private bilder av
desktop, mobil, tom, lastende og feiltilstand. Bildeavvikene er 4,632 % desktop
og 7,885 % mobil med registrerte data- og formatforskjeller, ikke visuell godkjenning.

Neste avhengige steg krever coach/admin-økt, autorisert forhåndsvisning av
kodeendringene og avklaring av avviste kontrollrettinger. Ingen påstand om at de
andre sju pillene er ferdige. Brukerens siste beskjed er kontinuerlig arbeid til
ferdig; eksisterende oppfølging er derfor oppdatert uten klokken-08-stopp.
Når ingen uavhengig oppgave gjenstår, venter oppfølgingen stille på endret tilgang
eller konkret autorisasjon og gjentar ikke avviste handlinger.

## Periode – første fungerende kontrollpunkt

Periode er koblet til den samme beskyttede spilleruten via
`?vis=periode&aar=2026`. Visningen leser `SeasonPlan`/`PeriodBlock`, faktiske
Workbench-økter og turneringer etter den eksisterende spilleravgrensningen.
Den beregner periodevolum, gjennomført mot plan hittil, uketidslinje og
pyramidefordeling uten å finne opp uketype eller manglende data.

Publiser periode bruker samme valgdialog og publiseringshandling som Uke. I det
isolerte lokale miljøet ble 12 valgte utkast publisert, mens én overlappende
økt forble utkast. Etterpå ble syntetiske testdata tilbakestilt. Desktop og
390 × 844 er kontrollert i den innloggede appen; mobilens faste periodepanel og
publiseringsdialog virker. Rust finnes på Publiser periode, mens kortkanter,
tidslinje og fordeling bruker grafitt.

47 målrettede tester består: 43 domenetester og fire tilgangstester. Den nye
tilgangstesten bekrefter null databaseoppslag når coachen mangler tilgang.
Målrettet ESLint, TypeScript-kontroll og `git diff --check` består. Full
`npm run verify` består med 3324 tester, fire komponenttester, statiske
kontroller og produksjonsbygg. Full skjermsammenstilling gjenstår etter siste
Periode-endringer; skjermen regnes derfor ikke som sluttgodkjent ennå.

## Måned – fungerende kontrollpunkt

Måned er koblet til `?vis=maned&maned=YYYY-MM`. Visningen bruker faktiske
Workbench-økter, viser sju kalenderkolonner, inntil tre økter per dag,
gjennomført mot plan hittil, pyramidefordeling og ukesammendrag.

Randuker vises i kalenderen, men økter utenfor valgt måned påvirker ikke måneds-
eller ukesummene. November uten økter viser en egen tomtilstand. September og
oktober er kontrollert innlogget på desktop; september og tom november er også
kontrollert ved 390 × 844. Grafitt brukes på øktmarkører og kortkanter.

50 målrettede tester, målrettet ESLint, TypeScript og `git diff --check`
består. Full `npm run verify` består med 3327 tester, fire komponenttester,
statiske kontroller og produksjonsbygg. Se
[Måned-kontrollen](../design-audit/workbench-maned-kontroll-2026-09-21.md).

## År – fungerende kontrollpunkt

År er koblet til `?vis=aar&aar=YYYY`. Visningen bruker faktisk årsplan,
perioder, Workbench-økter, turneringer og tester. Plan og gjennomført hittil,
pyramidefordeling, periodebånd og periodetabell beregnes i domenelaget.

Periodebåndet velger detaljpanelet uten å navigere. «Åpne periode» er den eneste
handlingen som bytter til Periode, og valgt periode-ID følger URL-en. 2027 uten
årsplan viser egen tomtilstand. Desktop og 390 × 844 er kontrollert innlogget.

54 målrettede tester, målrettet ESLint, TypeScript og `git diff --check`
består. Full `npm run verify` består med 3329 tester, fire komponenttester,
statiske kontroller og produksjonsbygg. Se
[År-kontrollen](../design-audit/workbench-aar-kontroll-2026-09-21.md).

## Økt – fungerende kontrollpunkt

Økt er koblet til `?vis=okt&uke=YYYY-MM-DD&okt=[sessionId]`. Visningen velger
bare blant økter som allerede er returnert fra den tilgangssikrede uke-lastingen.
Alle åtte formelfelt følger valgt øvelse, og manglende verdier vises som `—`.

Eksisterende serverhandlinger for tid, publisering, tilbaketrekking, ny øvelse,
rekkefølge og fjerning er beholdt. En syntetisk øvelse med område, Måte og
Målsetning ble lagret og kontrollert etter ny lasting. Desktop og 390 × 844 er
kontrollert innlogget.

Målrettet ESLint, TypeScript, URL-test og `git diff --check` består. Full
`npm run verify` består med 3330 tester, fire komponenttester, statiske
kontroller og produksjonsbygg. Se
[Økt-kontrollen](../design-audit/workbench-okt-kontroll-2026-09-21.md).
