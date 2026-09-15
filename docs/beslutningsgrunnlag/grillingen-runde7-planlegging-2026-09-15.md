# Grillingen runde 7, 15.09.2026 — planleggingskonseptet

Bestilt av Anders 15.09.2026: «hvordan videreutvikle dette konseptet — kjør en komplett
grill-session». Konseptet = hele planleggingskjeden: ordbok → årsplan → periode → uke → økt →
øvelse → gjennomføring → resultat, for individ og gruppe, for coach og spiller.

Alle målinger er gjort mot kodebasen 15.09.2026 før spørsmålene ble stilt
(`ordbok-og-workbench-analyse-2026-09-15.md`). Der det står «i dag», er det målt, ikke antatt.

**Slik svarer du:** nummer + svar, gjerne med tale. «7.3 b» holder. Hopp over det du ikke vil
ta stilling til nå. Ingenting under blir en beslutning før du har svart, og svarene registreres
med `/beslutning` etterpå.

Der jeg anbefaler noe, står det. Du velger.

---

## A. Din planleggingsuke (hvordan du faktisk jobber)

**7.1 Når planlegger du?** Søndag kveld for hele uka, kvelden før hver dag, eller løpende i
mellomrommene? Dette avgjør om Workbench skal være en ukeflate eller en dagsflate på mobil.
Anbefaling: én ukeflate på Mac søndag, én dagsflate på mobil resten av uka.

**7.2 Hvor mange planer lager du i dag per uke?** WANG (11 elever), GFGK-grupper, Academy
(4 spillere), Team Norway. Tell dem. Hvis svaret er «én per spiller», er det ~20 planer per uke.
Målet med OW-4 og OW-5 er å få det ned til antall grupper pluss antall avvik.

**7.3 Hvor mye av uka er lik fra uke til uke?** a) 80 % likt, kun turneringer og avvik
endres. b) 50 %. c) Alt lages på nytt. Anbefaling ved a eller b: «kopier forrige uke» som
standard startpunkt, ikke tom uke.

**7.4 Hva er det første du vil se når du åpner Workbench mandag morgen på mobil?** a) Dagens
økter for alle grupper. b) Hvem som ikke har svart på publisert plan. c) Avvik fra forrige uke.
Anbefaling: a, med b som prikk.

**7.5 Hvem andre planlegger?** Markus (Academy og GFGK), Espen (GFGK junior), WANG-trenere,
Team Norway-trenere. Skal de ha samme Workbench med begrenset stall, eller egne enklere flater?
Anbefaling: samme Workbench, stall avgrenset av gruppemedlemskap.

## B. Gruppe og individ

**7.6 Gruppeuka først, så individ?** I dag: hver spiller for seg. Forslag: du lager gruppeuka
én gang, den kopieres til hver spiller, du justerer avvik per spiller. Er dette riktig bilde
av hvordan du vil jobbe? Ja/nei, og hva mangler i bildet.

**7.7 Hva skjer når du endrer gruppeøkta etter at den er kopiert?** a) Endringen går til alle
som ikke har endret sin kopi. b) Endringen går til alle, alltid. c) Endringen går til ingen,
du må publisere på nytt. Regelverket i koden gjør a i dag (`gruppesynk.ts`). Anbefaling: a.

**7.8 Kan en spiller si nei til en gruppeøkt?** WB-10 «Ikke delta» er tegnet. Skal spilleren
kunne skjule en gruppeøkt fra sin plan uten å spørre deg, eller må du godkjenne fraværet?
Anbefaling: spilleren skjuler selv, du ser det som prikk i Stall.

**7.9 Delt økt: første time individuell, siste 45 min felles.** Hvor detaljert skal blokkene
være? a) To blokker med tid og ansvarlig trener. b) Blokker med egne øvelser og egen
AK-formel per blokk. c) Bare et notat på økten. Anbefaling: b, ellers kan ikke resultat og
etterlevelse regnes per blokk.

**7.10 Ansvarlig trener per blokk.** Skal navnet være en person (Anders, Markus) eller en
rolle (AK Golf Academy, Team Norway, WANG-trener)? Anbefaling: person, med organisasjon som
merke. En rolle kan ikke få varsel.

**7.11 Spiller i to grupper (WANG og GFGK).** I dag: to separate planer. Ønsket: én plan med
to kilder, eller to planer? Anbefaling: én plan, hver økt merket med hvilken gruppe den kom fra.
Kollisjon vises, ikke stoppes.

## C. Årsplan og perioder

**7.12 Hvem eier årsplanen?** a) Du lager den for hver spiller. b) Gruppen har årsplan,
spilleren arver og kan justere. c) Spilleren lager sin egen, du godkjenner. Anbefaling: b for
gruppespillere, a for Academy-spillere.

**7.13 Skal årsplanen fylle uka automatisk (OW-5)?** Perioden har øktbudsjett per
treningstype. Forslag: tom uke får et ferdig forslag bygget fra budsjett, gruppetider, skole og
turneringer. Vil du ha det som a) alltid på, b) en knapp «Fyll uka», c) ikke i det hele tatt.
Anbefaling: b.

**7.14 Uketyper fra WANG-årshjulet** (utviklingsuke, pre-turnering, turneringsuke,
overgangsuke, avslutningsuke, samlingsuke, testuke, ferieuke). Skal de a) bli data i appen
og styre forslaget i 7.13, b) forbli tekst i årshjulet, c) erstattes av treningsblokk-merkene
UTVIKLING/FORBEREDELSER/KONKURRANSE. Anbefaling: c, de dekker det samme med tre ord.

**7.15 Periodeliste.** Åtte i masteren (Grunnperiode, Spesialisering, Turneringsperiode,
Evaluering, Testuke, Ferie, Treningssamling, Heldagssamling). Er samlingene perioder eller
blokker i kalenderen? Anbefaling: samlinger er kalenderblokker, ikke perioder. Da er det fem
perioder.

**7.16 Årsplan som produkt til foreldre og skole.** WANG-årshjulet finnes som egen
HTML-side. Skal årsplanen i appen kunne deles som lesbar side til foreldre og skole?
Anbefaling: ja, via foreldreportalen, ikke egen HTML.

## D. Økt og øvelse

**7.17 Hvor detaljert er en økt når du lager den?** a) Tittel, tid, treningstype. b) Pluss
øvelser med AK-formel. c) Pluss reps, sett, mål per øvelse. Målt: koden støtter c. Hva gjør du
faktisk? Anbefaling: a når du planlegger uka, c når du gjennomfører med spilleren.

**7.18 Øvelsesbiblioteket.** Hvor kommer øvelsene fra? a) Ditt eget bibliotek, bygget over
tid. b) Ferdig innlastet standardbank (132 FYS-øvelser er godkjent, golfdrills finnes i seed).
c) Begge, med ditt som først. Anbefaling: c.

**7.19 AK-formelen på økt eller øvelse?** Avklaring 4 i masteren. Anbefaling: øvelse.

**7.20 Hva skal spilleren se av formelen?** a) Hele koden (TEK_CHIP_LAV_HAST_…). b) Bare de
norske ordene (Teknisk · Chip · Lav hastighet · Treningsområde · Alene). c) Ingenting, kun
tittel og øvelser. Anbefaling: b.

**7.21 Teknisk plan og P-posisjoner.** Skal tekniske oppgaver fra teknisk plan automatisk
dukke opp som innslag i TEK-økter? Anbefaling: ja, som forslag, ikke automatisk lagt inn.

## E. Styrke og FYS

**7.22 Styrkeøkter inn i Workbench (OW-7).** I dag egen FYS-flate for spilleren, ingen
coach-side. Skal du planlegge styrke for gruppene? a) Ja, med sett/reps/%1RM. b) Bare «FYS 45
min», spilleren følger eget program. c) WANG har eget program utenfor appen. Anbefaling: a for
WANG, b for Academy.

**7.23 Styrkeprogram-planen (`plan-styrkeprogram-fys.md`)** har tre åpne beslutninger:
knebøy 1RM og 3000 m som WANG-tester, WANG-scoped eller generelt, og om det venter på
FYS-indeksen. Svar: a/b/c per punkt, eller «senere».

**7.24 Kroppsvekt og %1RM.** Kroppsvekt hentes fra helseregistreringen (16-årsregel for
samtykke). Er det greit at styrkeprogrammet regner belastning ut fra helsedata, eller skal
1RM stå alene? Anbefaling: 1RM alene for under 16.

## F. Tester

**7.25 Testdag i Workbench.** Ti elever etter tur på samme protokoll. Skal testdagen a) være
en egen blokk-type med protokoll og deltakere, b) en vanlig økt med testinnslag, c) egen flate
utenfor Workbench. Anbefaling: a.

**7.26 Hvilke 21 av 31 protokoller ser spilleren?** Listen finnes nå i masteren kap. 10.1. De
ti skjulte: skal de forbli coach-only, eller ryddes bort? Anbefaling: rydd bort de som ikke er
brukt siste år.

**7.27 Testresultat tilbake i planen.** Skal et testresultat automatisk foreslå øvelser (D4
«test → drill» var blokkert fordi testene manglet områdekode)? Anbefaling: ja, når
protokollene har fått områdekode fra masteren.

## G. Turnering

**7.28 Turnering styrer uka?** I dag: turnering vises som kollisjon mot periode. Skal en
bekreftet turnering automatisk sette FORBEREDELSER-merke på dagene før og KONKURRANSE på
turneringsdagene? Anbefaling: ja, som forslag du kan endre.

**7.29 Planlagt nivå A/B/C.** Brukes det? Hvis ja, hva betyr A i praksis (full forberedelse,
reise, egen plan)? Hvis nei, stryk.

## H. Spillerens side

**7.30 Hva skal spilleren kunne endre i en publisert plan?** a) Ingenting, kun godta/avvise.
b) Flytte innen uka. c) Alt, du ser endringene. Anbefaling: b.

**7.31 Selvbetjente spillere (Platform only).** Skal de få samme Workbench som coach-spillere,
eller en enklere «Fyll uka»-flyt? Anbefaling: samme Workbench, fylt fra mal.

**7.32 Etterlevelse.** Hva skal telle som «gjennomført»? I dag: gjennomført, avlyst teller
aldri, hoppet over med årsak teller ikke, uten årsak er avvik. Riktig? Ja/nei.

## I. AI og Jarvis i planleggingen

**7.33 Hva skal Jarvis gjøre i planleggingen uten å spørre?** Regelen fra 30.08: forbereder
alt, sender ingenting. Konkret: a) foreslå neste uke fra forrige uke + avvik, b) foreslå
øvelser fra siste test og TrackMan, c) skrive utkast til periodebrev til foreldre. Velg det
som skal bygges først. Anbefaling: a.

**7.34 AI-laget leser fortsatt CANON v3.5** med L-faser og prosentkrav. Skal Caddie få
masteren som eneste faglige kilde nå (OW-P), eller vente til masteren er ferdig rettet?
Anbefaling: nå.

## J. Organisasjonene

**7.35 WANG, GFGK, Team Norway: samme planleggingsflate?** Team Norway får Workdesk med
poster, ikke chat. Skal Team Norway-trenere planlegge i samme Workbench, eller kun se?
Anbefaling: se, med kommentar. Planlegging er spillerens coach sitt ansvar.

**7.36 Foreldre.** Skal forelder se hele planen, kun uka, eller kun tidspunkter?
Anbefaling: hele uka, ingen øvelsesdetaljer.

## K. Forretning

**7.37 Hva er det som selges?** Spillerlisens (299 kr/mnd) inkluderer planen. Skal
gruppeplanlegging (OW-4) være en coach-funksjon som er gratis, eller en del av det
organisasjonene betaler for via lisensene? Anbefaling: gratis for coach, betalt via
spillerlisens, uendret fra 30.08.

**7.38 Mal-bibliotek som produkt.** Kan uke-maler per periode og kategori (OW-6) selges til
andre coacher eller klubber senere? Hvis ja, må de være anonyme fra dag én. Anbefaling: ja,
bygg dem uten spillerdata.

---

## Etter svar

Svarene registreres med `/beslutning` i én blokk «GRILLINGEN RUNDE 7». Rader som endrer
OW-1–OW-9 oppdateres samme dag i `docs/MASTERPLAN-GJENSTAAENDE.md`.
