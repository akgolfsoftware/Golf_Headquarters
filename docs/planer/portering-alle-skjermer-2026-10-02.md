# Porteringsplan — alle AK Golf HQ-skjermer

Sist oppdatert: 2026-10-02 13:10 CEST
Eier: Codex for kode og kontroll · Claude Design for designkilden
Overordnet rekkefølge: [arbeidslisten for resterende oppgaver](arbeidsliste-restoppgaver-2026-10-02.md)

Dette er en gjennomføringsplan, ikke en ny designfasit. Arbeidslisten eier prioritet og
avhengigheter. Gjeldende designautoritet er AK Golf Precision Athletics for hovedappen,
WANGs eget designsystem for WANG og Team Norways valgte designspråk for egne Team Norway-flater.
Precision-skjermene er visuelt godkjent av Anders. Det som gjenstår er å portere dem til kode,
koble ekte funksjon og kontrollere hver rute, rolle og tilstand.

## 1. Omfang og sann status

Fersk kodeinventar fra `kartlegg-skjermer.mjs`:

| Område | Sidefiler | Unike rutemønstre |
|---|---:|---:|
| PlayerHQ | 177 | 177 |
| AgencyOS | 164 | 164 |
| Lag/skole, inkludert WANG/TN/GFGK | 49 | 49 |
| Marked/offentlig | 70 | 70 |
| Forelder | 16 | 16 |
| Innlogging/konto | 18 | 18 |
| Offentlig booking | 4 | 4 |
| Delt innsyn | 11 | 11 |
| Personlig arbeidsflate | 3 | 3 |
| Systemtilstander | 2 | 2 |
| **Totalt** | **520** | **520** |

Designregistrene må fortsatt holdes separat fra kodeinventaret:

- Precision: 74 skjermtyper og 443 ruter i det godkjente designomfanget. Alle Precision-
  skjermene er visuelt godkjent; implementeringsstatus må registreres per rute.
- WANG: 59 skjermer i WANG-registeret. Prototypebevis teller ikke som app-portering.
- Team Norway: TN-00–TN-27 og 34 dyp-lenker i det utvidede funksjonsinventaret.

Tallene skal ikke summeres direkte. En skjermtype kan dekke flere ruter, og en rute kan åpne
dialoger, ark, feilflater og leverandørsteg som må ha egne kontroll-ID-er.

## 2. Statusmodell for hver rad

Hver rute og hvert overlegg får én rad i et manuelt vedlikeholdt skjermregister. Bruk disse
separate feltene:

1. `kartlagt` — faktisk fil, rute, rolle og inngang er funnet.
2. `wireframe` — informasjonsrekkefølge, hovedhandling og tilbakevei er koblet.
3. `ui-utkast` — valgt designvariant og designverdier er identifisert.
4. `prototype` — klikkbar reise finnes med syntetiske data.
5. `vurdert` — avvik, tilgjengelighet og tilstander er gjennomgått.
6. `valgt-for-bygging` — konkret Precision-, WANG- eller TN-versjon er fastsatt.
7. `implementert` — faktisk appkode bruker ekte domenehandlinger og lagring.
8. `kontrollert-i-app` — nettleserreise, formater, roller, tilstander og referanse er kontrollert.

Designstatus, teknisk status og Anders' vurdering skal aldri slås sammen til ett ferdigmerke.

## 3. Arbeidspakker i fast rekkefølge

### P0 — Lås grunnlaget og opprett registeret

- Kjør fersk ruteinventar før hver større porteringsbolk.
- Opprett ett skjermregister med `screenId`, rute, kildefil, område, rolle, designkilde,
  designversjon, komponentmønster, handlinger, data/API, tilstander, formater, status,
  eier, kontrollbevis og avvik.
- Legg til manuelle rader for dialoger, ark, menyer, toast, konflikt, offline, tilgangsavslag,
  opplasting, betaling og bekreftelse.
- Koble hver av de 520 sidefilene til konkret skjermtype, felles mønster eller undersøkt
  teknisk forklaring. Ingen rute slettes fordi den ser gammel ut.

**Ferdig når:** ingen inventarrad står uten forklaring eller eier.

### P1 — Felles fundament i kode

- Kartlegg Precision-verdier til eksisterende komponenter og fjern bare dokumenterte visuelle
  avvik; ikke lag et parallelt komponentbibliotek.
- Standardiser typografi, betydningsbaserte farger, avstand, radius, fokus, status og tema.
- Behold lyst tema som standard og nattmodus bare der produktet krever fokusmodus.
- Lag eksplisitte mønstre for sidehode, navigasjon, tabell/list, skjema, dialog, ark, status,
  grafer, tidslinje, opplasting og tom/lastende/feil.
- Bruk WANG- og TN-systemene som egne profiler, ikke som umerket blanding med Precision.

**Ferdig når:** tre referanseflater bruker samme dokumenterte grunnlag uten tap av funksjon:
AgencyOS Hjem, PlayerHQ I dag → økt → Live → oppsummering og Analyse.

### P2 — PlayerHQ: den sammenhengende spillerreisen

Portér i denne rekkefølgen:

1. I dag og planoversikt.
2. Workbench: år, periode, måned, uke og økt.
3. Øktark og øvelsesbank.
4. Live-økt og slagregistrering.
5. Oppsummering og analyse.
6. Tester, fysisk trening, teknisk plan og mål.
7. Runder, statistikk, TrackMan/DataGolf og gameplan.
8. Coachkontakt, video, Caddie, venner, talent og Meg.
9. Spillerbooking, abonnement, sikkerhet, varsler og hjelp.

For hver overgang skal samme økt-ID, eier, mål, status, tall og lagring følge reisen.

### P3 — AgencyOS: coachens arbeidsflate

1. Cockpit, kø og innboks.
2. Kalender, tilgjengelighet og booking.
3. Stall, spiller 360 og spilleranalyse.
4. Coach-Workbench, grupper, årsplan og teknisk plan.
5. Øktark, Live-tavle, tester og testbatteri.
6. Turneringer, TrackMan, video og Caddie/AgenticOS.
7. Økonomi, oppgaver, talent/innsyn, oppsett og drift.

Gruppehandlinger skal kontrolleres mot coachens faktiske scope før de vises som mulig.

### P4 — WANG: 59 skjermer som egen profil

- Koble alle 59 WANG-rader til faktisk app-rute, inngang, rolle og arbeidskontekst.
- Bevar samme spillerdata som PlayerHQ; WANG legger bare til skole- og kompetansemål.
- Portér elevprofil, IUP, plan, tester, testdag, forslag, samtykke, deling og DataGolf-visning
  med WANGs eget språk og komponenter.
- Kontroller alle seks delingsstatusene, foresattventing, tilbaketrekking, begrenset deling,
  konflikt og lagringsfeil.
- Dokumenter hva som er syntetisk prototype, hva som er appkode og hva som krever DataGolf-
  eller avtalegrunnlag.

**Ferdig når:** hver WANG-rad har appreferanse, ekte handling, tilstander, 390/1440-kontroll
og registrert avvik.

### P5 — Team Norway: TN-00–TN-27 og 34 dyp-lenker

- Koble hver TN-ID til riktig trener-, spiller-, gruppe- eller delt innsynskontekst.
- Portér organisasjon, spillerliste, post, dokumenter, samtykke, invitasjon, tilgang,
  tester, protokoller, uttak, rangliste, skoleoversikt, samlinger, kalender, turneringer
  og analyse.
- Bruk Team Norways valgte designspråk for egne `/team-norway/*`-flater.
- Prøv hovedtrener, hjelpetrener, Team Norway-spiller, spiller uten tilgang og foresatt der
  reisen berører disse rollene.
- Kontroller direkteåpning av alle 34 dyp-lenker, inkludert utløpt, trukket og avvist tilgang.

**Ferdig når:** hver TN-ID og dyp-lenke har kontrollert rolle, gruppe, samtykke, dataeier,
tilstand og visuell vurdering.

### P6 — Konto, forelder, offentlig og delt innsyn

- Innlogging, registrering, gjenoppretting, invitasjon, verifisering og onboarding.
- Forelder: barn, plan, coach, booking, økonomi, samtykke, rapport og varsler.
- Offentlig nettsted og booking: tilbud, coach, tjeneste, tid, betaling, kvittering og konto.
- Delt innsyn: aktiv, begrenset, utløpt, avvist og ingen tilgang.
- Systemtilstander: offline, vedlikehold, 404, 500 og tilgangsavslag.

Ingen designendring skal svekke serverkontroll, RLS, foresattsamtykke eller sletting.

### P7 — Integrasjoner og sikkerhet

- Koble skjermhandlinger til eksisterende serverfunksjoner, ikke demodata eller faste reserveverdier.
- Kontroller coach-/gruppeomfang, spiller-ID-scope, WANG/TN-deling og foresattsamtykke i serveren.
- Prøv Storage/video/lyd, kalender, e-post, varsler, resultatimport og booking i testmodus.
- DataGolf-sammenligninger aktiveres først etter separat dokumentert rettighets- og kildekontroll.
- Bruk syntetiske kontoer og data; ingen PII i logger, sky-prompts eller referansebilder.

## 4. Gjentakbar porteringssløyfe for hver skjermfamilie

1. Les route, server actions, domene, tilgang og eksisterende tester.
2. Fyll skjermkontrakten med konkret designkilde og skjerm-ID.
3. Identifiser montert komponent og gjenbruk eksisterende kode der den er riktig.
4. Portér layout, typografi, geometri, handlinger og data — uten å fjerne funksjon.
5. Implementer normal, tom, lasting, delvis, feil, offline, tilgangsavslag, lagrer, lagret,
   konflikt, avbrutt og fullført der tilstanden er relevant.
6. Kontroller 390 × 844 og 1440 × 880, samt nettbrett når reisen trenger det.
7. Kjør tastatur, fokus, kontrast, 200 % tekst og skjermleserprøve der miljøet tillater det.
8. Kjør syntetisk nettleserreise med riktig rolle og dataeier.
9. Sammenlign appbilde med godkjent referanse og registrer avvik, ikke bare en prosentverdi.
10. Oppdater register, testbevis, handover og neste konkrete rute før neste familie.

## 5. Git, test og leveranse

- Én avgrenset gren og PR per sammenhengende skjermfamilie; ikke bland WANG, TN og Precision-
  varianter i samme PR uten eksplisitt kobling.
- Bevar andre arbeidskopier og rebase kontrollert mot fersk `main` før sluttkontroll.
- Før merge: `npm test`, `npm run verify`, `npm run prosjekt:sjekk` og `git diff --check`.
- For relevante familier: innlogget Playwright-/nettleserreise, 390/1440-måling og kontroll av
  feil-/tilgangstilstander.
- Kjør ikke produksjonsmigrasjon, ekte betaling, ekte e-post, ekte invitasjoner eller import av
  persondata som del av skjermporteringen.
- Lagre bilder og mulige persondata privat utenfor Git og `public/`.

## 6. Ferdigdefinisjon for hele porteringsleveransen

Hele leveransen kan først kalles ferdig når:

- alle 520 inventarrader er koblet til implementert skjerm, felles mønster eller dokumentert
  teknisk forklaring;
- alle Precision-ruter er portert til godkjent design og kontrollert i appen;
- alle 59 WANG-skjermer og TN-00–TN-27/34 dyp-lenker har appbevis;
- kritiske reiser fungerer fra plan til gjennomføring, lagring, oppsummering og analyse;
- roller, RLS, samtykke, deling, tilbakekalling og feiltilstander er prøvd;
- `npm run verify`, relevante nettleserreiser, tilgjengelighetskontroller og produksjonsrøyktest
  peker på samme kodeversjon;
- skjermregister, designversjon, kodeversjon, åpne avvik og tilbakeføringsplan er overlevert;
- Anders har vurdert de avtalte sluttbildene, separat fra teknisk godkjenning.

## 7. Første konkrete arbeidsrekkefølge nå

Status 02.10.2026: punkt 1 er merget som PR #1125. Punkt 3 er påbegynt med PH-10, PH-02, PH-03, PH-04 brief, PH-05 aktiv Live og PH-06 slagteller. Oppsummering, kalender og Workbench-øktark gjenstår i denne grenen. 520 var tellingen da planen ble skrevet; registeret har 527. Workbench-PR #1099 skal ikke gjøres om. Åpne Precision-PR-er bulk-merges ikke.

1. Opprett og fyll skjermregisteret fra fersk inventarskanning.
2. Lukk Workbench-PR #1099 og testbatteriets umergede leveranse før nye parallelle varianter.
3. Portér PlayerHQ-kjeden I dag → Plan → økt → Live → oppsummering/analyse.
4. Portér AgencyOS-kjeden cockpit → spiller → Workbench → publisering → spiller.
5. Portér WANG-registeret rad for rad og deretter TN-registeret rad for rad.
6. Ta konto, forelder, offentlig booking, delt innsyn og systemtilstander.
7. Kjør samlet sikkerhets-, tilgjengelighets-, integrasjons- og lanseringsgate.

Punkt 1 er registeret. Neste arbeidsøkt porterer en avgrenset skjermfamilie og stopper ikke ved en grønn prototype: hver rad skal ende i
`kontrollert-i-app` eller ha et navngitt, dokumentert avvik.
