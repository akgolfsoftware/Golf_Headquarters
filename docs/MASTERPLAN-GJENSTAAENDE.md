# Arbeidsliste — AK Golf HQ

Oppdatert 15.09.2026. Denne filen eier rekkefølge og gjenstående arbeid. [Status nå](STATUS-NÅ.md) oppsummerer leveransen. [Funksjonsregisteret](planer/funksjonsregister-2026-09-11.md) bevarer hele produktbredden; eldre bestillinger er samlet i [planarkivet](arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md).

## Gjeldende bestilling og design

Anders ønsker en komplett app før åpen lansering med booking og betaling. Han har bestilt videre arbeid, samling av ferdige oppgaver til main, prosjektopprydding og denne oppdaterte restlisten. En merge betyr at kode er samlet; den er ikke visuell godkjenning eller lanseringsvedtak.

Aktiv visuell retning er nå **Atletisk intelligens**. Claude Design-koordinatoren har kontrollert kandidat v0.4.10: 32 av 35 funksjonsfamilier, alle 17 hovedreiser med klikkbar dekning og 72 av 480 registrerte ruter som klikkbare. Ti reiser er merket komplette i designregisteret. Kandidaten består av en kontrollert eksport med SHA-256 `01fdb517a840593ff5c2828eac90ee0710c0fea222198b263b1e43187f6c1801`, men har fortsatt `selectedForBuilding: false`; den er derfor ikke en samlet byggebestilling. Train-lock, Claw/Team Norway, WANG-speilet og dagens Geist/v3-implementasjon bevares som funksjons-, historikk- og teknisk underlag, men er ikke visuell fasit for nye skjermendringer. [Siste repo-lagrede kontroll](design-audit/claude-design-v0-3-3-2026-09-12.md), [designstatus](../designsystem/README.md) og [tidligere portstatus](design-audit/portering-fire-flater-2026-09-10.md).

Eksisterende UI skal ikke slettes på forhånd. Det erstattes kontrollert per brukerreise etter at en designversjon er valgt, kartlagt til kode og funksjons-/visuelt prøvd.

Når Anders velger en komplett Claude Design-pakke med `selectedForBuilding: true`, er den eneste visuelle fasiten for omfanget registrert i pakken. Den ferdige pakken skal inkludere PlayerHQ, AgencyOS, Team Norway og WANG. Booking, marked, innlogging/konto, forelder, delt innsyn og systemtilstander skal før lansering være koblet til samme fundament gjennom en navngitt profil eller et navngitt mønster. Ingen brukerflate kan falle tilbake til gammel design som en skjult standard. Gamle visuelle regler og avhengigheter fjernes kontrollert under porteringen og skal ikke finnes i sluttresultatet. Claude trenger ikke detaljtegne hver rute separat, men alle ruter må kobles til et kontrollert skjermmønster, og alle unike/kritiske reiser skal ha detaljert UI og klikkbar mobil-, iPad- og desktopflyt. [Komplett design- og porteringskontrakt](planer/claude-design-til-grok-portering-2026-09-12.md).

## Kontrollporter som gjør planen komplett

Arbeid kan gå parallelt bare når avhengighetene under er oppfylt. Statusene `åpen`, `pågår`, `bestått` og `blokkert` brukes med lenke til bevis. En grønn test, en merge eller et designbrett teller aldri som bevis for andre porter.

| Port | Eier | Status 12.09 | Bestått når |
|---|---|---|---|
| P0-KILDE | Codex/Anders | Bestått i denne planleveransen | Business Rules, Nordstjernen, designstatus og masterplan har samme kildeorden: valgt Claude-pakke styrer visuelt; produkt- og sikkerhetsregler består |
| P0-OMFANG | Anders/Claude Design | Bestått som bestilling | Fire kjerner er obligatoriske, øvrige brukerflater får navngitt profil/mønster, og 480 ruter samt overlegg skal forklares |
| P0-TEST | Grok | Bestått i main 13.09 via PR #865: innlogget HQ-Supabase-reise for V2, Workbench og eldre plan; uvedkommende avvist. [Bevis](design-audit/p0-test-innlogget-reise-2026-09-12.md) | Syntetiske roller mot HQ-skjema i egen stack; kritiske prøver hopper ikke over manglende oppsett; betaling/e-post bruker testmiljø |
| P0-PRODUKT | Anders + fagansvarlig | Åpen per beslutning | Bare produkt- eller fagvalg som faktisk blokkerer neste leveranse avklares før avhengig bygging; beslutning, konsekvens og eier loggføres |
| P0-DEKNING | Teknisk eier | Åpen | Første tekniske prefikskart 12.09: 479 `page.tsx`, 103 lastefiler, 93 feilfiler. Familier og reiser har ansvarlig pakke; manuelle overlegg og D1-mønster gjenstår. [Kart](planer/teknisk-rute-tilstandskart-2026-09-12.md) |

### Design og portering D0–D6

| Port | Eier | Avhengighet | Bestått når |
|---|---|---|---|
| D0 · lås visuell kilde | Claude Design + Anders | P0-KILDE/P0-OMFANG | Én samsvarende eksport har versjon, dato, autoritets-ID, filhash, `selectedForBuilding: true`, endringslogg og eksplisitt omfang |
| D1 · rute → mønster | Claude Design + Grok | D0 | Hver rute og hvert manuelt overlegg er koblet til skjerm-ID/fellesmønster, reise, tilstander, handlinger, formater og unntak |
| D2 · systemfundament | Grok | D0–D1 | Grunnverdi → betydning → komponent, faktiske ressurser, app-ramme, navigasjon og basis-komponenter er bygget uten gammel token-fallback |
| D3 · fire piloter | Grok + Claude Design | D2 og relevant funksjonsport | PlayerHQ J02, AgencyOS hjem/spilleroppfølging, Team Norway testreise og WANG uke/elevreise virker med ekte handlinger og representative tilstander på mobil, iPad og desktop |
| D4 · full flatedekning | Grok | D3 | Fire kjerner og øvrige brukerflater i P0-OMFANG er portert etter dekningsregisteret uten tap av funksjon eller tilgang |
| D5 · fjern gammel design | Grok | D4 | Erstattere er godkjent; gamle CSS/tokens/fonter/komponentvarianter har ingen brukere; prosjektvakt avviser gjeninnføring |
| D6 · sluttgodkjenning | Anders + kvalitetseier | D5 | Visuell sammenligning, responsivitet, tilgjengelighet og kritiske reiser er bestått; avvik er lukket eller uttrykkelig akseptert |

### Åpne avvik i siste Claude-kandidat

Kandidat v0.4.10 er fortsatt en delpakke og har ikke `selectedForBuilding: true`. P11, O11 og O12 mangler fortsatt produktvalg og klikkbar familiedekning. Alle hovedreisene er representert, men bare 10 av 17 er merket komplette; 402 ruter er fortsatt mønsterkartlagt og 6 krever vurdering. J07 mangler bevist varig øktbinding for direkte coachdialog, mens Live-bindingen tilhører AI-coachen. Valgt, filtrert TrackMan-sett har heller ikke bevist lagring til utstyrsbag. Gameplan/GPS er klikkbart, men mangler fortsatt live-posisjon, aktiv rundekobling, offline-cache, kø for rundeslag, lagre-notat-handling og bevist idempotens ved ukjent utfall. Faktisk 320 px-/200 %-kontroll og full appattestering mangler. Den eldre [v0.3.3-kontrollen](design-audit/claude-design-v0-3-3-2026-09-12.md) bevarer tidligere avvik. Datamodell eller databaseendring krever egen autorisasjon.

## Samlet arbeid og hva kontrollene beviser

| Pakke | Resultat | Status og bevis |
|---|---|---|
| DataGolf/GolfBox og tidligere rettinger | Kode fra tidligere arbeidsgrener samlet | I main via PR #833/#834. [Grenregnskap](beslutningsgrunnlag/grener-og-main-2026-09-10.md) |
| D2 grunnlag, navigasjon, I dag, Plan, PH-04/PH-05, TN-18/WANG C7 | Første seks porteringspakker | I main via PR #835. Kode- og komponentprøver; alle skjermfamilier er ikke ferdige |
| Manuell SG | Manuell runde-/SG-registrering og dokumentert skjermarbeid | I main via PR #836. Ingen ny måling eller innlogget godkjenning er utledet av flettingen |
| Claude PH-06-testpakke | Seks enhetstester og første visuelle rigg | I main via PR #837. Den pakken endret ikke skjermen; den opprinnelige ferdigpåstanden er korrigert i [PH-06-rapporten](design-audit/playerhq-ph06-2026-09-11.md) |
| D2-PLAN | Eldre godtatte planøkter uten V2-speil kommer med i Plan/ukeprogresjon, uten dobbelttelling | Samlet i denne leveransen fra `0c060141c`. 11 målrettede kontrolltilfeller; [rapport](design-audit/plan-legacy-2026-09-11.md). Innlogget reise gjenstår |
| D2-PH06 / R2 | Valgt resultathierarki, lesbare lagrede notater/vurdering, ekte appskrifter, feil/venting/nytt forsøk, trygg feltskriving | Bygget og komponentprøvd i denne leveransen. Fem nye handlingstester, 64 skjermvarianter, interaktive feilprøver og isolert PostgreSQL-prøve. [Rapport og begrensninger](design-audit/playerhq-ph06-2026-09-11.md) |
| Produktplan/intervju | 192 funksjonskort, eget utførelsesregister og intervjuguide samlet | [Funksjonskort](planer/funksjonsforbedringer-og-intervju-2026-09-13.md) og [statusregister](planer/funksjonsforbedringer-nattstatus-2026-09-13.md) er styrte vedlegg til denne masterplanen. Kortene er bevart, men ikke automatisk ferdige |
| Future Development | Markedsundersøkelse av ledende golf-/coachingapper og fem framtidige AI-satsinger | [Markeds- og AI-retning](planer/future-development-markedsundersokelse.md) er beslutningsgrunnlag. Arbeidet starter etter portene i hovedrekkefølgen under |
| Prosjektopprydding | 20 ekstra arbeidskopier og 21 utdaterte lokale grener fjernet; én gammel ekstern gren slettet; én foreldreløs restmappe flyttet til papirkurven | [Samlingsrapport 13.09](vedlikehold/samling-og-opprydding-2026-09-13.md). Unike arbeidsvarianter er bevart i arkivet; bare rent `main` gjenstår lokalt og på GitHub |
| R-A/R-B/R-C/R-D/R-H | Caddie-ressursgrenser og AI-minimering, privat lokal lagring, TrackMan-enheter og sikker abonnementshenting | I main via samlingsarbeidet. [Kontroll og åpne grenser](vedlikehold/sikkerhet-og-enheter-2026-09-11.md). Innlogget kontroll og produksjonsbevis registreres separat |
| D2-TN/D2-WANG tilgangsgrunnlag | Sikret Team Norway-oversikt og samme konkrete WANG-gruppe/elev gjennom trenerliste, IUP-lesing og IUP-lagring | Bygget og testet i PR #842. [Kontroll og gjenstående brukerreiser](design-audit/tn-wang-tilgang-2026-09-11.md). Innlogget og visuell kontroll gjenstår |
| R-I handlingstilgang | Avvisningstester som kaller eksporterte handlinger; ubrukt vaktimport feiler i verify; coach-notat, fys-logg og IUP-skriving ressursavgrenset | I main via PR #848. [Kontroll](design-audit/handlingstilgang-r-i-2026-09-12.md). Innlogget reise gjenstår |
| R-I bred handlingstilgang | Fortsatt revisjon: opptatt tid, profil og mål. Inventar 164 use-server-filer | I main via PR #856. [Kontroll](design-audit/handlingstilgang-bred-2026-09-12.md). Øvrige skriv gjenstår |
| D2-TN teknisk reise | Oversikt → poster/dokumenter → spillerpost → testføring → historikk uten visuell port. Poster og dokumenter låst til kanonisk Team Norway-gruppe | I main via PR #849. [Kontroll](design-audit/team-norway-d2-tn-teknisk-reise-2026-09-12.md) |
| D2-WANG teknisk reise | Åpen hjemside → innlogging → coach-uke/økt → elev/IUP uten visuell port. IUP-lenke krever samme Toppidrett-gruppe og elev i rosteret | I main via PR #850. [Kontroll](design-audit/wang-d2-wang-teknisk-reise-2026-09-12.md) |
| Teknisk rute-/tilstandskart | 479 `page.tsx`, 103 lastefiler, 93 feilfiler kartlagt uten visuell port | I main via PR #851. [Kart](planer/teknisk-rute-tilstandskart-2026-09-12.md) |
| O05/O07 forelder og delt innsyn | Godkjent eierskap, identitetssikkert barnbytte, avvist skriving, ugyldig/utløpt lenke og tilbakekalling av delt tilgang | I main via PR #852. [Kontroll](design-audit/forelder-o05-delt-innsyn-2026-09-12.md). Innlogget reise og betaling for barn gjenstår |
| O06 booking/betaling | Kollisjon, idempotens, hendelser i ulik rekkefølge, credits, avbestilling/refusjon og oppsigelse mot Stripe først. Kun mocket Stripe | I main via PR #853. [Kontroll](design-audit/booking-o06-betaling-2026-09-12.md). Innlogget checkout og reell testnøkkel gjenstår |
| P02–P05 Plan/Live | Frekvens uten dobbelttelling av speil, FYS-standardverdi og detaljgjenåpning, avbrutt mot lagret | I main via PR #854. [Kontroll](design-audit/plan-live-p02-p05-2026-09-12.md). Innlogget reise gjenstår |
| P03 ny/rediger/flytt | Avvist rolle uten skriving for planøkt og Workbench-økt. Flytt treffer vist uke. Feil ruller tilbake tittel | I main via PR #871. [Kontroll](design-audit/plan-ny-rediger-flytt-2026-09-13.md). Innlogget reise gjenstår |
| G01/G06–G10 | Korrigering, kilde, enhet, manglende data og gjenåpning uten produksjonsimport | I main via PR #855. [Kontroll](design-audit/runde-sg-trackman-g01-g10-2026-09-12.md) |
| O13 kvalitet/backup | Feilsanitering uten hemmeligheter, helsesvar uten env, lokal URL-vakt og rollback-regel. Lokal `pg_restore` prøvd 12.09 kveld | I main via PR #857, ny prøve på `grok/docker-launch-tester-2026-09-12`. [Kontroll](design-audit/docker-launch-tester-2026-09-12.md). L7 ikke bestått |
| R-J samtykkegrunnlag | Felles 16-årsregel for helse og deling (flagg eller fødselsdato). Register over formål/lagring. Helselogg og spiller-samtykke avviser uten gyldig grunnlag | I main via PR #867. [Kontroll](design-audit/samtykke-r-j-2026-09-13.md). UI-tekst og lydhistorikk uendret |
| J05 TN-testreise | Sammenlignbar testhistorikk uten overskriving | I main via PR #858. [Kontroll](design-audit/tn-j05-testreise-2026-09-12.md) |
| P09 økt-tilbakemelding | Tilbakemelding bundet til eiers økt | I main via PR #859. [Kontroll](design-audit/playerhq-p09-coachkontakt-2026-09-12.md) |
| J14 AgenticOS-spor | Godkjenning, feil og avvisning på samme handlingsspor | I main via PR #861. [Kontroll](design-audit/agenticos-j14-godkjenning-spor-2026-09-12.md) |
| P09 spørsmål-tilgang | Spørsmål kun for spørsmålsstiller og tildelt coach | I main via PR #864. [Kontroll](design-audit/playerhq-p09-sporsmal-tilgang-2026-09-12.md) |
| P09 melding til tildelt coach | Spiller sender kun til innrullert coach | I main via PR #863. [Kontroll](design-audit/playerhq-p09-melding-coach-2026-09-12.md) |
| R-I utstyrsbag | Forelder avvises. Lagring bruker innlogget bruker-id | I main via PR #869. [Kontroll](design-audit/handlingstilgang-utstyrsbag-2026-09-13.md) |
| R-I admin-spiller | Opprett/rediger spiller avviser spiller og forelder; rediger krever stalltilgang | I main via PR #870. [Kontroll](design-audit/handlingstilgang-admin-spiller-2026-09-13.md) |
| O02 Workbench-publisering | Coach uten stalltilgang avvises. Snapshot bruker norsk mandag. Publisering lager ikke nye økter | I main via PR #866. [Kontroll](design-audit/workbench-o02-publisering-2026-09-13.md). Gruppeplan uten dublett gjenstår |
| R-I helseskriving | Manuelt helsesamtykke kreves før lagring. Forelder avvises. Under 16 kan ikke samtykke selv | I main via PR #872. [Kontroll](design-audit/handlingstilgang-helse-2026-09-13.md) |
| P0-TEST innlogget reise | I dag → Plan → PH-04/05/06 for V2, Workbench og eldre plan. Samme tall etter gjenåpning. Uvedkommende avvises | I main via PR #865. [Kontroll](design-audit/p0-test-innlogget-reise-2026-09-12.md) |
| Sikkerhet og samtidighet | Delt AgencyOS-spillertilgang, følsomme ruter, godkjenningsløp og samtidige Live-oppsummeringer er strammet inn | I main via PR #874–#876. Full `npm run verify` og GitHub/Vercel-kontroller bestod |
| TrackMan fotoenheter | Fotoresultat må ha eksplisitt avstands- og hastighetsenhet før det kan forhåndsvises og lagres | I main via PR #877. Reell bildepresisjon, personverngjennomgang av bildeoverføring og innlogget importreise gjenstår |
| Team Norway Claw | Visuelt godkjente Team Norway-flater samlet uten å erklære hele designpakken valgt | I main via PR #878. 82 målrettede tester og full kvalitetskontroll bestod |
| Avhengighetssikkerhet | Next.js 16.3.3 og kompatible sikkerhetspatcher; npm-funn redusert fra 20 til 5 | I main via PR #879/#880. Fem oppstrøms-/kompatibilitetsblokker dokumentert i [kontrollen](vedlikehold/avhengighetssikkerhet-2026-09-13.md) |
| R-E abonnement/tilgangsnivå | TALENT-profil ser talent-åpen side; FULL-låst side sender TALENT til oppgraderingsflyten; FULL-spiller går rett inn. Ny seedrolle + Playwright-spec mot samme isolerte stack som P0-TEST | I main via PR #886, merge `a6f184695`. [Kontroll](design-audit/abonnement-tilgang-r-e-2026-09-13.md). Pre-eksisterende flake i `spillerreise-innlogget.spec.ts` observert og dokumentert, ikke rettet |
| R-E Caddie-tilgang og TrackMan CSV/HTML | ADMIN slipper forbi `/api/caddie/chat`-gaten (ekte cookies, ingen side finnes ennå); COACH og uinnlogget avvises 401. Full skjermflyt for TrackMan CSV-import med eksplisitte enheter | I main via PR #887. [Kontroll](design-audit/caddie-trackman-r-e-2026-09-13.md) |
| R-C privat lokal lagring + TrackMan HTML | Ekte to-brukers offline/kølagt-scenario på samme nettleser-context uten manuell opprydding: spillerens kølagte tapper-telling er eier-navnerommet i IndexedDB, en fremmed spiller som logger inn rett etter arver aldri tellingen. TrackMan HTML-import med eksplisitte enheter | I main via PR #888. [Kontroll](design-audit/lokal-lagring-r-c-2026-09-14.md) |

| KODE-A · P0-flake, O02-gruppeplan, R-I godkjenninger | Flaken i `spillerreise-innlogget.spec.ts` rettet ved rot (dev-kompilert målrute ventet på 20 s expect-grense i stedet for fila sin 90 s navigasjonsgrense). Gruppeutrulling låst mot dublett OG mot bortfall av spillerens egne økter. Søskentest for godkjenningsflaten | I main via PR #890, merge `e37f835`. Full P0-pakke 11/11 grønn to ganger (6,0 og 6,9 min, den andre på nyoppsatt stack) + spec alene 4/4; full `npm run verify` grønn lokalt og i CI; 11 nye enhetstester. **A2 (innlogget P03) er lukket 15.09 — se egen rad under Plan/Live.** Status: flettet, men sluttsynkronisering gjenstår — Notion-oppgaven er ikke oppdatert. [Kontroll](design-audit/kode-a-flake-og-o02-2026-09-14.md) |
| KODE-B · Stripe-testreise (R4–R9) | Kartlagt og blokkert: ingen `STRIPE_*` i miljøet. Sju nødvendige variabler listet eksakt; mocket dekning (28 tester) skilt fra det som faktisk mangler | Ingen kode, ingen nøkkel gjettet, ingen belastning. [Kartlegging og blokkering](design-audit/kode-b-stripe-testreise-kartlegging-2026-09-14.md) |
| KODE-C · Caddie AI-svar og TrackMan foto | Utsatt, ikke startet — krever `ANTHROPIC_API_KEY` som ikke skal inn i sky-testmiljø | Eier: Anders. [Begrunnelse og gjenopptak](design-audit/kode-c-utsatt-2026-09-14.md) |

Siste samlede testresultat og flettepunkt skal leses i samlingsrapporten og tilhørende GitHub PR. Innlogget produksjonsreise, faktisk betaling og Anders' visuelle vurdering er egne kontroller som fortsatt gjenstår.

## Neste oppgaver, i rekkefølge

Aktiv arbeidsdeling 13.09.2026: Claude Design eier Design System v0.1. GitHub hadde etter PR #882 ingen åpne pull requests eller issues ved denne avstemmingen. Ikke bygg fra kandidat v0.4.10 før en pakke er valgt for det aktuelle omfanget.

| Prioritet / ID | Konkret neste leveranse | Inngang | Ferdig når |
|---|---|---|---|
| 1 · D0 | Fullfør og velg én Claude Design-pakke for et tydelig registrert omfang | Kandidat v0.4.10 og designregisteret; avklar P11, O11 og O12 | Pakken har versjon, hash, komplett avtalt dekning og `selectedForBuilding: true`; Anders har valgt den |
| 2 · D1 / P0-DEKNING | Koble valgt pakke til ruter, tilstander og handlinger; avklar J07-binding, TrackMan → utstyrsbag og Gameplan/GPS-gap uten skjult ny datamodell | Ruteinventaret, J07, G02–G04 og G06/G08 | Hver berørt rute har mønster, tilstand, rolle og datakilde; eventuell schemaendring er særskilt godkjent |
| 3 · R-A–R-E | **Fullført innenfor trygt omfang og flettet.** Abonnement/tilgangsnivå i main via PR #886. Caddie-tilgang (API-et, ingen side finnes ennå) og TrackMan CSV-import i main via PR #887. Privat lokal lagring (R-C) og TrackMan HTML-import i main via PR #888. **Bevisst udekket:** Caddie sitt AI-svar og TrackMan foto-kilde — begge krever `ANTHROPIC_API_KEY`, som ikke skal inn i et sky-testmiljø (KODE-C) | Eksisterende sikkerhetsregler og PR #877 | Tillatt rolle virker, uvedkommende avvises, feiltilstander er ærlige og ingen persondata sendes ukontrollert |
| 4 · R4–R9 | Kjør innlogget booking- og betalingsreise med Stripe-testnøkkel, inkludert barn, avbrudd, retur og gjentakelse. **Blokkert 14.09 på manglende testnøkler — sju variabler listet i [kartleggingen](design-audit/kode-b-stripe-testreise-kartlegging-2026-09-14.md)** | O06/O05-reglene i main + `STRIPE_*` testnøkler i miljøet | Testbetaling og refusjon består uten reell belastning; eierskap og idempotens er bevist |
| 5 · L3/L7/L8 | Fullfør visuell tilgjengelighet, alarm/gjenoppretting og kontrollert produksjonsreise | D6 og eksplisitt miljøautorisasjon | Kontrast, 320 px, 200 %, alarmer, restore/rollback og eksakt produksjonscommit er dokumentert bestått |

R-A–R-J og REV-F1–F11 er forklart i [produktplanen](planer/produktplan-og-intervju-2026-09-11.md). Funn fra den eldre gjennomgangen må kontrolleres mot dagens kode før endring. R-G «neste økt» er allerede rettet i porteringen og skal verifiseres i prioritet 1, ikke bygges på nytt.

### Future Development — rekkefølge etter stabil kjerne

Disse oppgavene er lagret fra markedsundersøkelsen. De skal ikke hoppe foran D0–L8 eller tolkes som ferdig produktvalg. Fullt kildegrunnlag, konkurrentkart, personvernrammer og måltall står i [Future Development-undersøkelsen](planer/future-development-markedsundersokelse.md).

| Prioritet / ID | Framtidig leveranse | Før utvikling | Ferdig når |
|---|---|---|---|
| FD-01 | Coachminne etter hver økt: fra notat/opptak til kontrollert sammendrag, én prioritet, øvelser og oppfølging | Stabil økt-, samtykke- og planreise | Coach godkjenner før noe deles eller endrer planen; kilde og beslutningshistorikk vises |
| FD-02 | Én evidenslinje per spiller på tvers av runder, SG, TrackMan, tester, video og økter | Avklart felles identitet, datakvalitet og tilgang | Hver hendelse viser kilde, tidspunkt, enhet, kvalitet og hvem som kan se den |
| FD-03 | Ukentlig prioriteringsmotor som foreslår én forklarbar handling | FD-02 og faglig validerte regler | Forslaget viser bevis og usikkerhet; coach kan godkjenne, redigere, utsette eller avvise |
| FD-04 | Enkel videoflyt først; avansert 3D gjennom validert partner | Samtykke, trygg fillagring og dokumentert leverandørvurdering | Opptak, trimming, sammenligning og coachkommentar virker; ingen medisinsk eller biomekanisk sannhet påstås uten validering |
| FD-05 | Konkurransetrygg banemodus | Valgt regelprofil, turneringskontekst og pålitelig frakoblet tilstand | Modusen skiller trening, sosial runde og konkurranse og låser råd som ikke er tillatt under tellende runde |

## Resterende oppgaver etter neste pakker

| Område / ID | Konkret restarbeid | Avhengighet / ferdigkriterium |
|---|---|---|
| PlayerHQ · D2-PH | Resterende Analyse, mål, kalender, øvelsesbank/program, profil, meldinger, deling, test/retest og sosiale reiser | Knytt hver skjerm til valgt kilde og appdata. Fullfør relevante tom-/laste-/feiltilstander. [Funksjonene P01–P11](planer/funksjonsregister-2026-09-11.md) |
| Plan/Live | Frekvens, FYS-gjenåpning og serverregler for ny/rediger/flytt er prøvd. **15.09: innlogget ny/rediger/flytt er prøvd (A2 lukket) — flytting persisterer over full sidelasting.** Rest: Caddie i live, og produktvalget om planleggeren skal bruke `okt`/`start` fra Plan-lenkene eller om lenkene skal slutte å love det | [P02–P05](design-audit/plan-live-p02-p05-2026-09-12.md) · [ny/rediger/flytt](design-audit/plan-ny-rediger-flytt-2026-09-13.md). Separate modeller beholdes |
| Workbench · O02 | Plan-publisering avviser uvedkommende og bruker norsk mandag. **14.09: gruppeutrulling er låst i test — samme gruppe er stille idempotent, krysskilde hoppes og rapporteres, og spillerens egne økter blir liggende urørt.** Rest: innlogget brukerreise for gruppeplan | [Kontroll](design-audit/workbench-o02-publisering-2026-09-13.md) · [KODE-A](design-audit/kode-a-flake-og-o02-2026-09-14.md). PR #866 |
| Mål · R-F / F1 | Startverdi, periode og faktisk gjennomføring; TN-mål med variant, antall, enhet og retning | Faglige definisjoner før avhengige beregninger. Eventuelle nye databasefelt krever konkret autorisasjon |
| Team Norway-tester | Sammenlignbar historikk uten overskriving er i main via PR #858. Rest: Excel v3-avstemming og innlogget reise | [J05](design-audit/tn-j05-testreise-2026-09-12.md) · [Fagkontroll](beslutningsgrunnlag/team-norway-excel-v3-kontroll.md) |
| WANG/GFGK | Årsplan, juniorgrupper, testdager, styrkeprogram, rapporter og foresatte | Virkelige rollegrenser og avklarte fagregler; P08/O03 i funksjonsregisteret |
| Booking · R4/R5/R9 | Serverregler for kollisjon, idempotens og trygg retur er prøvd med mock. Innlogget checkout og valgt bookingdesign gjenstår | [Kontroll](design-audit/booking-o06-betaling-2026-09-12.md). Ingen reell betaling |
| Betaling/tilgang · R6/R8 | Credits-race, avbestilling/refusjon og oppsigelse mot Stripe først er prøvd. Innlogget reise og testnøkkel gjenstår | [Kontroll](design-audit/booking-o06-betaling-2026-09-12.md) |
| Forelder/delt innsyn | Teknisk eierskap, barnbytte, lenkeavvisning og tilbakekalling er prøvd. Betaling for barn og innlogget reise gjenstår | [Kontroll](design-audit/forelder-o05-delt-innsyn-2026-09-12.md). Visuell barnvelger venter på D0 |
| Runde/SG/DataGolf | Korrigering, kilde, enhet og manglende data er prøvd uten produksjonsimport. Innlogget importreise gjenstår | [Kontroll](design-audit/runde-sg-trackman-g01-g10-2026-09-12.md) |
| Baneguide · BG-01–06 | Gameplan/kart/soner, samme slagkjede i kart og liste, GPS, offline, bag/spredning og coachvisning | Seks konkrete delpakker står i funksjonsregisteret. Avklar datakilde, bruker, offline-omfang og valgt design ved oppstart |
| Vindverktøy | Avklar treningsberegning, værkilde eller fysisk måler; bygg deretter én valgt funksjon | Ingen sensor- eller værintegrasjon er bekreftet som valgt. Usikkerhet og datakilde skal vises |
| AgenticOS/Jarvis | Innkurv, utkast, godkjenning, rutiner, oppgaver og kalender koblet til faktisk kjøring | Ingen editor-agentkopier som runtime. Utsending til andre krever gjeldende eksplisitt autorisasjon |
| Marked/salg | Nettsider, tilbud, coachprofiler, innhold og fungerende overgang til booking | Avstem bestilt omfang; ikke aktiver et historisk markedsføringssystem automatisk |
| Økonomi/personlig | Beslutningsstøtte, rapportgrunnlag og egne oppgaver | Avklar konkret behov; økonomitall kun fra autorisert Tripletex-eksport |
| Samtykke · R-J | Register og 16-årsregel er prøvd. Gjenstår: avklart UI-tekst per formål, lyd som historikk, innlogget reise | [Kontroll](design-audit/samtykke-r-j-2026-09-13.md). Ikke bytt 16 til 13 |
| Kodekontroll · R-I | PR #848, #856, #866, #869 og #870 i main. Helseskriving i tidligere leveranse. **14.09: 31 nye avvisningstester for `admin/plans/[planId]/actions.ts` (16 handlinger) og `admin/grupper/[id]/actions.ts` (5 handlinger) — begge filene var allerede riktig eierskaps-sjekket i koden, men manglet søskentest.** **14.09 kveld: `(legacy)/approvals/actions.ts` (5 handlinger, 5 tester) — den mest følsomme av de udekkede, siden den endrer spillerens plan og varsler spilleren.** **15.09: 52 nye tester for `tournaments/actions.ts` (12 handlinger), `(legacy)/plan-templates/actions.ts` (10), `(legacy)/anlegg/location-actions.ts` (6) og `(legacy)/bookinger/actions.ts` (5) — sistnevnte har reelt per-coach eierskap (`coachBookingScope`) og Stripe-leak-vern, begge bekreftet med test på tvers av to coacher.** 44 admin-mutasjonsfiler mangler fortsatt søskentest | [R-I](design-audit/handlingstilgang-r-i-2026-09-12.md) · [bred](design-audit/handlingstilgang-bred-2026-09-12.md) · [O02](design-audit/workbench-o02-publisering-2026-09-13.md) · [utstyrsbag](design-audit/handlingstilgang-utstyrsbag-2026-09-13.md) · [admin-spiller](design-audit/handlingstilgang-admin-spiller-2026-09-13.md) · [helse](design-audit/handlingstilgang-helse-2026-09-13.md) · [plans+grupper](design-audit/handlingstilgang-plans-grupper-2026-09-14.md) · [turnering+maler+anlegg+booking](design-audit/handlingstilgang-tournament-templates-anlegg-bookinger-2026-09-15.md) |
| Felles design/kvalitet | Avstem alle 480 sideruter og deres mønstre, visuell kontroll, kontrast, fokus, mobil og stor tekst | 480 ruter er inventar, ikke 480 unike ferdige design. Ingen ny kontrastbaseline for å skjule brudd |
| Drift/lansering | Produksjonens innloggings-/funksjonsvern, alarmprøve, gjenoppretting med filer og full kundereise | Lokal `pg_restore` prøvd 12.09 kveld. [Kontroll](design-audit/docker-launch-tester-2026-09-12.md). Produksjonsalarm og Vercel-rollback krever miljøautorisasjon |
| Produktbeslutninger | Avklar blokkerende produkt-/fagspørsmål rett før den avhengige leveransen; samle resten i intervjuet uten å stoppe uavhengig teknisk arbeid | [Intervjuguide](planer/produktplan-og-intervju-2026-09-11.md). Familie-OS/eldre sideprosjekter er bevart som underlag, ikke automatisk aktivert |

## Lanseringsporter L0–L8

Lansering kan først vurderes når alle porter under har datert bevis mot én eksakt commit:

| Port | Målbart bevis |
|---|---|
| L0 · omfang | P0-DEKNING og D6 bestått; ingen ukjent brukerflate eller kritisk tilstand |
| L1 · funksjon/roller | Kritiske ende-til-ende-reiser består med tillatte og avviste roller; ingen kritisk prøve er hoppet over |
| L2 · integrasjoner | Booking, betaling, e-post/varsling og avtalte importer består i testmiljø med gjentakelse, feil og returflyt |
| L3 · tilgjengelighet | Tastatur, synlig fokus, skjermlesernavn, kontrast, 320 px og 200 % tekst består for kritiske reiser |
| L4 · enheter/nettlesere | Avtalte mobil-, iPad- og desktopbredder samt støttede nettlesere består uten funksjonstap |
| L5 · ytelse | Avtalte måltall for last, respons og sentrale nettsignaler er definert og bestått på representative sider |
| L6 · sikkerhet/personvern | Tilgang, handlingstilgang, ressursavgrensning, samtykke, dataminimering og hemmeligheter er kontrollert uten kritiske funn |
| L7 · drift | Logger/alarmer er prøvd; sikkerhetskopi og faktisk gjenoppretting møter dokumentert RTO/RPO (maks tid/datapunkt-tap); rollback er prøvd |
| L8 · produksjon | Eksakt commit er publisert med autorisasjon, røyktest og full kritisk kundereise; resultat og tidspunkt er dokumentert |

## Arbeidsmåte og oppdatering

Arbeid på egen gren, bevar andres endringer, og bruk én ansvarlig oppgave per filområde. Kjør relevante tester, full `npm run verify` og `npm run prosjekt:sjekk` før commit. Anders har bestilt fletting av denne samlingen; senere oppgaver følger sin gjeldende autorisasjon. Ikke kjør migrasjoner, seed/import, reelle betalinger eller utsending som opprydding.

Marker separat: **bygget**, **komponentprøvd**, **innlogget prøvd**, **sett av Anders**, **flettet** og **publisert kontrollert**. Arkiv inneholder historiske oppgaver og målinger; dokumentert intensjon er ikke bevis på ferdig funksjon. Oppdater denne listen etter hver sammenhengende leveranse, uten en konkurrerende masterplan.

### Regel for absolutt ferdige oppgaver

En branch-push er ikke ferdigstatus. Når en leveranse har oppfylt avtalte ferdigkriterier, bestått relevante kontroller, blitt flettet til `main` og fått eventuell avtalt publisering kontrollert, skal sluttføringen i samme arbeidssteg:

1. oppdatere denne masterplanen med status, dato, PR, merge-commit, kontrollbevis og ærlig restarbeid;
2. oppdatere den eksisterende, tilsvarende oppgaven i Notion-databasen `Tasks` til ferdig med samme bevis og begrensninger.

Hvis én av oppdateringene ikke kan gjennomføres, er status **flettet, men sluttsynkronisering gjenstår**. Oppgaven skal ikke omtales som absolutt ferdig før både prosjektkilden og Notion samsvarer.
