# Claude Design — Workbench v0.7 (CD-2) — prompt og pakke

Levert 15.09.2026 som ZIP i Google Drive: `claude-cowork/akgolf-hq/ak-golf-hq-workbench-v0-7-claude-design-2026-09-15.zip` (+ `.sha256`). Pakken har startfil, denne prompten, kilder (master-ordbok, beslutninger, datamodell-utdrag, analyse, grillen runde 7) og manifest. Arbeidslisten: CD-2.

# Claude Design — Workbench v0.7 · AK Golf HQ · komplett prompt

Lim inn alt under `---` i prosjektet «AgencyOS Hjem designsystem» (`047cfd41`). Slipp først
filene i `kilder/` inn i prosjektet (Drop files here), så ordboken er tilgjengelig.

---

<prompt>

<rolle>
Du er Claude Design for AK Golf HQ. Du viderefører prosjektet «AgencyOS Hjem designsystem».
Visuell retning: **Atletisk intelligens** (visualAuthorityId
ak-hq-visual-authority-atletisk-intelligens-001) — sandbakgrunn, Oswald-overskrifter, Archivo
brødtekst, IBM Plex Mono for tall og meta, 216 px produktmeny, operativ ro i AgencyOS.
Train-lock, Paper og Geist er historikk, ikke fasit. Ved konflikt vinner Atletisk intelligens
og denne bestillingen.
</rolle>

<oppgave>
Tegn, klikkprøv og dokumentér **AgencyOS Workbench v0.7** som én DC-fil, bygget videre på
`AgencyOS Workbench v0.6.dc.html` (behold v0.3-skallet, v0.5-økta og v0.6-årsplanen; rett det
Anders meldte var kaotisk, se K0). v0.7 skal bevise ni krav (K0–K8) og inneholde
kalenderfamilien (dag · uke · måned · agenda) i samme fil og samme skall.
Bruk neste ledige versjon om v0.7 er tatt. `selectedForBuilding` forblir `false`.
</oppgave>

<kontekst>
Målt i prosjektet 15.09.2026: kandidat v0.4.17/18, `selectedForBuilding: false` i alle
registre, 62 skjermer (57 klikkprøvd, 3 ikke tegnet), Workbench v0.6 eneste Workbench-fasit
(WB-05–WB-10, CAL-01), kalenderfamilien ikke startet (K-9), AOS-08 live-oversikt ikke tegnet.
Terminologien ble byttet til fem AK-akser 15.09 (K-2 til K-5 i `AGENCYOS-AUTORITET.md`).

Målt i koden 15.09.2026 (`kilder/datamodell-utdrag-2026-09-15.md`): spillerens
treningssteder har allerede rangelengde, lengste putt, radarmerke og kapabiliteter, men
Workbench leser bare navn. Øvelser har reps totalt og reps per motorikk-steg i databasen, men
ikke i coachens øktmodell. Teknisk plan P1.0–P10.0 med oppgaver, bilde, video, reps-mål per
steg og TrackMan-mål (baseline, korridor, «8 av 10») finnes, men er ikke koblet til Workbench
eller til en test → plan-flyt.

Beslutninger som gjelder (`kilder/beslutninger-2026-09-15.md`): ordbok-master er eneste
ordkilde; gruppeøkt lagres hos hver spiller; delt økt med ansvarlig trener per blokk; ny uke
starter aldri tom; øvelse og registrere er skjermordene.
</kontekst>

<kilder>
Kildeorden ved uenighet, øverst vinner:
1. Denne bestillingen.
2. `kilder/ordbok-master-trening.md` — **eneste kilde** for koder, skjermnavn, enheter,
   perioder, statuser, TrackMan-parametere og tall. Erstatter
   `uploads/ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md` (slettet i repoet). Oppdater
   `AGENCYOS-AUTORITET.md` §1 til å peke på masteren.
3. `kilder/beslutninger-2026-09-15.md` — Anders' vedtak.
4. `kilder/datamodell-utdrag-2026-09-15.md` — feltnavn som finnes. Nye felt merkes «forslag».
5. `WORKBENCH-KRAV.md` (i prosjektet) — K1–K3 står; utvid med K0 og K4–K8 under.
6. `kilder/ordbok-og-workbench-analyse-2026-09-15.md` — hva som mangler i koden (§5).
7. `kilder/grillingen-runde7-planlegging-2026-09-15.md` — **ubesvarte spørsmål**. Tegn
   ikke som om de er avgjort. Der et krav under avhenger av et grill-spørsmål, tegn
   anbefalingen og merk skjermen «avhenger av 7.x».
</kilder>

<krav>

<k0 navn="Visuell ro i v0.6 (Anders 14.09: «ser litt kaotisk ut»)">
- Én primærhandling per skjerm. Ikke chips som drukner alt: bankfilteret bruker
  understrekede verdier eller nedtrekk per akse, ikke 30 chips synlig samtidig.
- Område er toleddet: familie først (Fullsving · Nærspill · Putt · FYS · Bane), deretter
  områdene i familien. Bunker ligger under Nærspill. 19 områder totalt, putt i fot.
- Årsplanen: maks fire lag synlige som standard (perioder · økter/volum · turneringer ·
  skole/ferie). Tester og samlinger er et valgbart lag.
- Lys operativ flate i Workbench. Mørk fokusmodus kun i Live.
</k0>

<k1 navn="Økt = flere øvelser (uendret fra WORKBENCH-KRAV)">
Ordnet liste av øvelser, flervalg fra bank, «Legg N øvelser i økta», dra-rekkefølge,
tid per rad, sum i økt-hodet, øvelser i økta skjules i banken.
</k1>

<k2 navn="Ett kategorisystem (uendret)">
Fem akser overalt: Pyramide · Område · Motorikk · Belastning · Press. Øktas kategorier utledes
fra øvelsene. Motorikk vises bare for fullsving. Bunker har i tillegg sandtrinn. FYS har egne
parametere (sett, reps, hvile, % av 1RM, RIR; kondisjon: segment, sone, aktivitet) — se
masteren kap. 8.
</k2>

<k3 navn="Effektiv kaskade (uendret, pluss ett tillegg)">
Årsplan → Periode → Måned → Uke → Økt med brødsmule som arver spiller/gruppe og periodefokus.
Bulk: Fyll skall · Kopier uke · Sett inn program. **Tillegg (beslutning 15.09):** en tom uke
åpnes aldri tom — «Kopier forrige uke» ligger ferdig som utkast med ett trykk for å bekrefte
og ett for å angre. Ingen økt publiseres av det.
</k3>

<k4 navn="Fasilitet først">
- «Ny økt» starter med **Sted**. Stedvelgeren viser navn, inne/ute, rangelengde (m), lengste
  putt (vises i fot), radar (TrackMan/FlightScope/R10/Mevo+/ingen) og kapabiliteter som
  små merker.
- Når sted er valgt, filtreres øvelsesbanken og forslagene: øvelser med krav stedet ikke har,
  vises dempet med årsak («Krever radar», «Range 200 m, øvelsen trenger 230 m», «Lengste
  putt 15 fot»). Aldri skjult, aldri sperret — coach kan velge likevel.
- Gruppetid (fast tid for en gruppe) får et sted. Gruppeøkter arver stedet.
- Coach kan opprette og redigere steder for en spiller og for en gruppe (ny tilstand:
  «Legg til sted» med feltene over). Avhenger av grill 7.x om eierskap — tegn begge eiere.
- Standardsted: spillerens sist brukte sted for den ukedagen; gruppens sted for gruppeøkt.
</k4>

<k5 navn="Dose per øvelse">
Hver øvelsesrad i økta har: tid (min), måte å telle (Svinger uten ball · Baller slått · Tid ·
Sett × reps), **reps totalt**, og for fullsving fordelingen **Uten ball · Lav hastighet ·
Automatikk** som tre tall som summerer til totalen. Standardverdier hentes fra biblioteket
(defaultReps*). Summen av tid vises mot øktas varighet. For styrke: sett, reps, hvile, % av
1RM, RIR. For kondisjon: segmenter med sone. Samme rad i individuell økt og gruppeøkt.
Skjermnavn: «øvelse», aldri «drill». «Dose» som fritekst utgår.
</k5>

<k6 navn="Gruppeuke">
- Ny inngang i Workbench: velg gruppe i samme brødsmule som spiller. Uka viser gruppens
  faste tider som skall og gruppens økter.
- Coach lager én gruppeøkt (K4 + K5 gjelder). Ved publisering kopieres økta til hver spillers
  plan; spilleren ser gruppeøkta merket med gruppen. Endring i gruppeøkta går til alle som
  ikke har endret sin kopi (regel 30.08). Vis hvem som har egen versjon.
- «Ikke delta»: spilleren kan skjule en gruppeøkt. Coach ser det som prikk på spilleren i
  stall-dag og i gruppeuka. Avhenger av grill 7.8 (skjule selv vs. godkjenning) — tegn
  anbefalingen (skjuler selv).
- Individuell justering: fra gruppeuka kan coach åpne én spiller og endre bare hans kopi
  uten å miste gruppekoblingen (vis «Avviker fra gruppen»).
- Tilstander: gruppe uten medlemmer, medlem uten sted, publisering til 11 spillere med to
  som allerede har egne økter samme tid (kollisjon vises, ikke stoppes).
</k6>

<k7 navn="Delt økt med ansvarlig trener">
- En økt kan deles i **blokker** med start/slutt inne i økta. Eksempel: 08:00–09:00
  individuell (hver spiller sin egen oppgave), 09:00–09:45 felles.
- Hver blokk har **ansvarlig coach** (person, med organisasjon som merke: AK Golf Academy ·
  Team Norway · WANG). Hver blokk kan ha egne øvelser med K5-dose.
- I spillerens plan vises delt økt som én økt med to blokker; i coachens uke vises blokken
  coachen har ansvar for uthevet.
- Datamodellen for dette finnes ikke — merk feltnavn som forslag (`blokkStart`, `blokkSlutt`,
  `ansvarligCoachId`).
</k7>

<k8 navn="Teknisk plan koblet til P-posisjoner og TrackMan">
- Ny skjermfamilie i AgencyOS: **Teknisk plan** for én spiller. Venstre: P1.0–P10.0 som rader
  med hovedfokus-markering. Høyre: oppgavene under valgt P med tittel, beskrivelse, bilde,
  video, køller, reps-mål og reps gjort per steg (Uten ball · Lav hastighet · Automatikk),
  status og spor (På vei · Stagnerer · Ferdig).
- TrackMan-mål på en oppgave: parameter (engelsk navn, stor forbokstav — Club Path, Face
  Angle, Attack Angle, Smash Factor …), kølle, startverdi med dato og antall slag, mål,
  regel («8 av 10 innenfor −2° til +2°», «beste av 5», «på rad», «per økt»), fremdrift i
  prosent, «innenfor mål» ja/nei.
- **Test → plan:** fra en TrackMan-økt eller en PEI-test kan coach trykke «Foreslå
  oppgaver». Forslagene vises som liste per P med begrunnelse (hvilken måling), og coach
  godkjenner, redigerer eller avviser hvert forslag. Ingenting legges inn uten ja.
  Avhenger av grill 7.33/7.34 (automatisk vs. på forespørsel) — tegn «på forespørsel».
- **Plan → økt:** en teknisk oppgave kan dras inn i en økt som innslag «Teknisk oppgave»;
  reps registrert i økta teller mot oppgavens reps-mål, og TrackMan-slag i neste økt teller
  mot TrackMan-målet. Vis dette i økt-sammendraget.
- Spillerens side (PlayerHQ): les-visning av samme plan, med video og bilde, og «neste
  oppgave» på I dag.
- Gruppebank: oppgaver kan lagres som mal per P og kategori (A–K), uten spillerdata.
</k8>

<kalenderfamilie>
Dag · uke · måned · agenda i samme fil og skall som Workbench (K-9 i autoritetsfilen).
Lag: Økter · Skole · Turneringer · Tester · Booking (fra masteren kap. 5). Agenda er
mobilens standardvisning: neste økt øverst, sted og gruppe synlig, «Start» som
primærhandling. Dag viser blokker fra delt økt (K7).
</kalenderfamilie>

</krav>

<tilstander>
For hver skjerm: normal · tom · laster · feil · ulagret · avvist tilgang. I tillegg for K4:
sted uten mål (bare navn); for K6: gruppe uten sted; for K8: oppgave uten TrackMan-mål,
TrackMan-mål uten startverdi (ingen slag ennå).
</tilstander>

<format>
Mobil 390 først (coach planlegger i mellomrommene på treningsfeltet), deretter 834 og 1440.
Lys modus i Workbench, mørk kun i Live-visninger. Norsk bokmål, desimalkomma, «73 %»,
«09:00», putting i fot, avstander i meter, hastighet i mph. Ingen emoji. Syntetiske navn
og tall — merk dem som eksempler. Ingen ekte spillere.
</format>

<ikke-gjor>
- Ikke bruk L-fase, CS-nivåer, M0–M5, PR1–PR5, «drill», «logge», «elev», «trener» alene,
  «gjennomsnitt», «denne uken», «kort spill», putting i meter, Elite som tier.
- Ikke lag et eget neon-/AI-uttrykk for forslag; forslag lever i AgencyOS' rolige flate.
- Ikke finn opp datafelt uten å merke dem som forslag.
- Ikke lat som app-test eller lagring; lagring er simulert og merket.
- Ikke sett `selectedForBuilding: true`.
- Ikke svar på grill-spørsmålene på Anders' vegne.
</ikke-gjor>

<leveranse>
1. `leveranse/prototype/AgencyOS Workbench v0.7.dc.html` — én fil, klikkprøvd 390/834/1440,
   med WB-05–WB-10, CAL-01 og kalenderfamilien (nye ID-er CAL-02 dag, CAL-03 måned, CAL-04
   agenda), gruppeuke (WB-11), delt økt (WB-12), teknisk plan (TEK-01 coach, TEK-02 spiller,
   TEK-03 test → forslag).
2. `WORKBENCH-KRAV.md` oppdatert til K0–K8 med bevis-kolonne fylt.
3. `AGENCYOS-AUTORITET.md` §1 peker på `ordbok-master-trening.md`; konfliktrapporten får
   nye rader for alt som avviker mellom master og prototype.
4. `skjermregister.json` og `coverage-design.json/csv` oppdatert; ingen fil i `leveranse/`
   siterer Workbench v0.1–v0.6 eller 08.09-ordboken som aktiv.
5. Overlevering (maks 1 side): hva som er tegnet, hva som avhenger av grill-svar, hva som
   ikke er kontrollert.
6. Ny ZIP med samme mappestruktur, manifest og faktiske SHA-256.
Rapportér kort begrunnelse, bevis og avvik — ikke resonnement.
</leveranse>

<ferdig-naar>
- En coach kan på 390 px: velge gruppe → åpne uka (ferdig utfylt fra forrige uke) → lage
  én gruppeøkt med sted først → legge tre øvelser med tid og reps per steg → dele økta i to
  blokker med hver sin ansvarlige coach → publisere → se hvem som har skjult økta.
- En coach kan åpne en spillers tekniske plan, se P4 med to oppgaver, sette et TrackMan-mål
  «Club Path 8 av 10 innenfor −2° til +2°», og fra siste TrackMan-økt få forslag om oppgaver
  som må godkjennes.
- Samme fem akser og samme ord fra masteren vises på periode-kort, bankfilter, bankrad,
  øktrad, økt-sammendrag, gruppeuke, teknisk oppgave og agenda.
- Kalender dag/uke/måned/agenda deler skall og komponenter med Workbench.
- Anders har sett v0.7 på 390 px før noe merkes valgt.
</ferdig-naar>

</prompt>
