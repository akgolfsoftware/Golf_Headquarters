# Workbench og Team Norway IUP 2027 — funksjonsdekning

Kontrollert 01.10.2026 mot vedlegget «Team Norway IUP 2027.xlsx» og hovedarbeidskopiens kode på `f9c40e542`. Dette er en funksjons- og kodegjennomgang, ikke en bekreftelse på produksjonsdrift eller visuell godkjenning. Ingen appkode eller databaser er endret.

## Konklusjon

**Vi dekker ikke hele filen ennå.** Planlegging, økter, målsetninger, tester og tekniske oppgaver har reell støtte. Men den samlede IUP-reisen mangler blant annet sesongevaluering, utviklingssjekk, komplett kvartalsoppfølging og flere strukturerte felt. En IUP-overskrift i Spiller 360 er ikke bevis på at funksjonen bak er ferdig.

Den eksisterende [Workbench-planen](../planer/workbench-kalender-aarsplan-periodisering-2026-10-01.md) dekker kalender, årsplan, periodisering og navigasjon. Den må suppleres med kravene under for å dekke hele IUP-en. Ikke alle funksjonene skal ligge inne i Workbench: PlayerHQ bruker Plan, Stats, Målsetning og Meg, mens treneren får samlet IUP i Spiller 360, WANG og Team Norway.

## Grunnlag og statusbegreper

- Alle **18 ark** er inventert: 17 synlige og ett skjult. Celler, formler, tekstbokser, 25 diagramdefinisjoner og én pivottabell er undersøkt. De åtte mediefilene er undersøkt som bilder eller vektortekst. Intro er tekst og figurer, ikke et tomt ark.
- **Kode:** konkret funksjon og kobling til brukerflate er funnet. Det betyr ikke at hele kundereisen er prøvd.
- **Delvis:** en del finnes, men felt, beregning eller sammenheng mangler.
- **Mangler:** ingen tilsvarende funksjon funnet i de undersøkte rutene, handlingene og datamodellene, eller flaten viser uttrykkelig at den ikke finnes.
- **Avvik:** arbeidsboken, tidligere vedtak eller eksisterende beregninger har ulike definisjoner. Skal ikke overskrives uten en konkret avklaring.
- Originalfilen og kontaktopplysninger er ikke kopiert inn i repoet eller sendt til Claude Design. Eksterne lenker i filen er registrert som kildereferanser; innholdet bak dem er ikke kontrollert som del av denne gjennomgangen.

## Dekning av hvert ark

| Ark / kildeområde | Funksjoner som må bevares | Status i appen og gjenstående arbeid |
|---|---|---|
| Intro · tekstbokser | Forklaring, riktig arbeidsrekkefølge, inngangsnivå markert X, sammenheng mellom evaluering, målsetning og plan | **Delvis.** Spiller 360 har 12 IUP-seksjoner i tilsvarende rekkefølge. Veiledet utfylling, minimumsfelt og fullføringsstatus gjennom hele reisen er ikke dokumentert ferdig. [K1] |
| TN Coaches · A1:D11 | Navn, rolle, telefon og e-post til støtteapparatet | **Delvis.** TN Fagapparat viser aktive gruppetrenere og begrenset e-posttilgang. Telefon og eksterne fagpersoner er uttrykkelig utelatt. Dette er ikke et komplett spillerstyrt kontaktregister. [K2] |
| 1. Person info · A1:D25 | Persondata, klubb, skole/college, adresse, GolfBox-ID; eget team med ansvarlig, golf-, fysisk-, mental- og puttetrener og foreldre; skader, medisinske forhold, allergier | **Delvis.** Profil, hovedcoach, skole, kontaktdata, foresatte og GolfBox-kobling finnes. Hele teammatrisen og de tre helseradene som strukturert IUP-del er ikke dekket. Skade/fravær og generell helselogg er ikke det samme som dette skjemaet. [K1–K3] |
| 2. Evaluering spørsmål · A1:F39 + tekstboks | Tre fritekstsvar; ti egenvurderinger på skala 1–4; faktisk og planlagt prosentfordeling på fem pyramideområder; minst tre forbedringspunkter som går videre til prosessmål | **Mangler som samlet lagrende funksjon.** Spiller 360 viser sesongevaluering uten resultat. TN-evaluering er en lesevisning av tester og teknisk plan. En eksisterende WANG-samtale erstatter ikke dette innholdet. [K1, K4] |
| 3. Målsetting og oppfølging · A1:J43 | Historikk, fire kvartaler oktober–september, årsresultat og neste målsetning. Ranking, brutto score, SG, PEI, presisjon, aktivitet og tidsbruk | **Delvis.** Resultat-/prosessmål og flere stats finnes. Hele måltallsmatrisen, sammenlignbar årshistorikk og lagrede kvartalsvurderinger er ikke koblet sammen. [K1, K5, K6] |
| 4. Prosessmål · A1:J29 | Resultat-/prestasjonsmål → handling → prosess → start/slutt → fremdriftsmåling → fasilitet/utstyr → hjelper → evaluering | **Delvis.** Målsetningstype, kategori, frist, testkobling, pyramideområde og plannivå finnes. Målsetningshandlingen har ikke hele kjeden som strukturerte felt eller en tydelig kobling mellom overordnet resultatmål og flere prosessmål. [K5] |
| 5. Årsplan · A1:BB26 + figurer | Ukevis hovedfokus; perioder; fem pyramideområder; utvikle/vedlikeholde/redusere prioritet; sted hjemme/Norge/internasjonalt; eksempler etter spillernivå | **Delvis.** Sesong, perioder, fokus, tidsbudsjett og øktbudsjett finnes. Prioritet per område per uke og sesongens oppholdssteder er ikke dekket av et generelt fokusfelt. Eksisterende kalenderrettinger gjenstår i den separate planen. Eksempelfigurene er veiledning, ikke automatisk spillerplan. [K7] |
| 6. Turneringsplan · A1:S41 + figurer | Turnering, WAGR Power, hull, uke, start/slutt, antall dager, land, tour, totalsummer; kandidatkalender etter klasse; sammenligning av turneringsnivå | **Delvis.** Turneringskalender, datoer, land/tour i Tournament og nye Workbench-planer med reise og runder finnes. WAGR Power, samlet hull-/dagsregnskap og tilsvarende nivåbalanse i én planflate er ikke dokumentert. WAGR-ranking og DataGolf-feltstyrke er ikke WAGR Power. [K8] |
| 7. Ukeplan · B1:BA42 + tekstbokser | Grunn- og spesialuker, turneringsuke med/uten turnering; morgen/ettermiddag/kveld; øktantall/tid; treukerssyklus; testplan; økter kan dekke flere områder med ett hovedfokus | **Delvis.** Dato, klokkeslett, varighet, hovedområde, gjentakelser, maler og kopiering finnes. Fire navngitte ukemaler og en redigerbar treukerssyklus med summer og testplassering er ikke verifisert som en samlet funksjon. [K7, K9] |
| 8. Treningsøkter · A1:AH124 + tekstboks | Egen turneringsoppvarming og basisøkter; slagområde, formål, oppgaver, repetisjoner, tid, pyramide, utstyr og antall; egne varianter; progresjon mot spill/press | **Delvis.** Økter, øvelser, maler, tekniske oppgaver og press finnes. Komplett oppvarmingsmal, utstyrsliste med antall og eksplisitt kobling fra IUP-prosessmål gjennom alle øktvarianter er ikke bekreftet. [K9, K10] |
| 9. Utviklingssjekk 5 Prosesser · A3:AU63 + instruks | Nivåtilpassede spørsmål, skala 1–5, sosialt, mentalt, fysisk, strategisk, teknisk, golfutvikling og neste trinn | **Mangler; versjonsavvik.** Spiller 360 viser uttrykkelig at utviklingssjekken ikke finnes. Denne filen inneholder 34/43/47/38 spørsmål. Tidligere bestilling bruker 34/41/41/38, og appens tomme seksjon sier 1–8. Se avklaringer nedenfor. [K1, K11] |
| TN Tester Tot · C8:AA31 | Åtte golfslagtester, ti teknikktester og to fysiske resultatlinjer; gjentatte resultater med dato; lenker til testbeskrivelse/scorekort | **Delvis.** Katalog, testøkter, dato, historikk, beregning og lagring finnes. Flere protokoller kan bare lagres som utkast fordi reglene er uavklarte. At et navn finnes i katalogen, er ikke full dekning. [K12] |
| Teknikktest · B1:AV176 + 24 diagrammer | Driver, 7-jern og wedge; del A for målsetting og del B for måling; carry/side, avstand til mål, PEI, median/snitt/spenn; sju TrackMan-felt; slagspredning og målevariasjon; gjentatte paneler | **Delvis med vesentlig avvik.** Appens tre paneler er basert på en annen protokollversjon og er sperret for fullføring. Felt og antall forsøk matcher ikke dette arket fullt ut. De 24 diagrammenes informasjonsinnhold må dekkes, men trenger ikke bli 24 separate skjermkort. [K12] |
| Teknikkplan · B1:P48 + tekstboks | Dato/slagområde; hvorfor endringen gir bedre score; nåværende/ønsket ballflukt; nåværende/ønsket treff; GOBBS og bevegelsesoppgaver; metoder, driller, video, hjelpemidler, utstyr; ferdiguke før golfslagtrening | **Delvis.** Teknisk plan, oppgaver, målegrenser, læringssteg, miljø og repetisjoner finnes. Strukturert før/etter-beskrivelse av alle ballflukt-/treffdimensjoner og begrunnelse knyttet til spillstatistikk er ikke lik arbeidsbokens skjema. [K10] |
| TN Fystester · A1:V61 | Daterte testserier: trapbar, benkpress, CMJ, stille lengde, knestående ballkast; samlet score og 3000 m; kjønnsspesifikke tid/poeng-tabeller | **Delvis / avvik mot valgt testbatteri.** Generell testføring finnes. Eksisterende FYS-score bruker en annen beregning. Det vedtatte seksårsløpets testbatteri overstyrer tidligere TN-protokoller; 3000 m og CMJ skal ikke automatisk bli obligatoriske ved import. [K11, K13] |
| Treningsdagbok · A1:T367 + pivot og diagram | Daglig mengde på fem områder, antall økter, total; måneds- og sesongsummer; graf over fordelingen | **Delvis.** Workbench har gjennomføring og felt for faktisk tid. Flere oversiktssummer bruker fortsatt planlagt varighet på fullførte økter. Det er ikke fullstendig dokumentasjon av faktisk tidsbruk. Flere øktmodeller må avstemmes uten dobbelttelling. [K7, K9] |
| Statistics · A1:Y44 | Referansetabeller for innspill/nærspill: SG, median PEI per avstand, green/fringe; forventede slag etter avstand og ballplassering | **Delvis.** Egne SG-, PEI- og DataGolf-kilder finnes. Det er ikke kontrollert én-til-én samsvar med alle tabeller her. Kilde, dato, enhet, utvalg og beregningsmetode må følge hver sammenligning. Bildereferansen for innspill er også registrert. [K6, K14] |
| Ref · A1:C16, skjult | Oppslag for forventet antall putter etter avstandsintervall | **Kode + avvik ved grenseverdier.** De 14 positive referansenivåene gjenfinnes i SG-tabellen fra 0,9 til 18 m. Filen har dessuten en egen 0–0,01-rad med 0. Appen bruker grenseoppslag og særregler; full likhet ved 0, mellomrom mellom intervaller og over 18 m er ikke bevist av denne sammenligningen. [K14] |

## Detaljkrav som ikke må forsvinne i samlekategoriene

### Målsetting og oppfølging

Alle følgende rader finnes i ark 3. En generell «SG»-graf dekker dem ikke alene:

- Ranking; gjennomsnittlig brutto turneringsscore; gjennomsnittlig brutto score utenfor turnering; beste og verste turneringsscore.
- SG totalt, utslag, innspill totalt og 100–150 m / 151–200 m, nærspill (arkets uklare etikett «> 45 Total») og putting totalt.
- Putting fordelt på 0–3, 3–5, 5–10, 10–15, 15–25, 25–40 og 40+ fot. Intervallgrenser må defineres uten overlapp.
- PEI totalt og 40–80, 80–120, 120–160, 160–200 og 200+ m.
- Slaglengde, avvik fra mållinje, FT %, GIR % og scrambling %. Forkortelser og målemetode må dokumenteres.
- Antall konkurranser, konkurranserunder, treningsrunder 9/18 hull, total golftreningstid og fysisk treningstid.

For hver rad kreves definisjon, enhet, kilde, datovindu, antall målinger, historikk, målsetning og oppfølging. Manglende data skal være ukjent, ikke 0. Ni- og attenhullsrunder må holdes sammenlignbare. Manuell kvartalsverdi må ikke fremstilles som automatisk beregnet resultat.

### Testbatteriet

| Kilde i TN Tester Tot | Appens dekning |
|---|---|
| Driver Basic, Inspill Basic, Wedge Variation, 8-balls variation, Putt 1–3 m, Golfslag på banen, 18 hulls inspill | Relevante kjørbare katalogvarianter, validering og scoreberegning finnes. Dette oversiktsarket inneholder ikke de eksterne fullstendige protokollene; identisk 2027-protokoll er derfor ikke bevist. |
| 9 hull lengde | Katalogført, men fullføring sperret i koden i påvente av avstands-/poengregel. Senere designnotater omtaler avklaringer; de er ikke bevis på implementering. |
| Driver Gate, Wedge Gate, Nærspill Gate, VISA Express, Putt Speed 1×5, Putt Speed 3×3, Putt Gate | Katalogført. Kodens `blocked`-regler hindrer ferdig resultat. Rådata/utkast er ikke en fullført test. |
| Teknikktest DW, J7 og Wedge | Tre rådatapaneler finnes, men er sperret og har ulike felt/forsøk fra vedlegget. |
| Fysscore og 3000 m | Generell resultatføring finnes; vedleggets samlede score og tid/poeng-tabeller er ikke en verifisert gjeldende appprotokoll. |

Teknikktestens sju felt er Swing Direction, Club Path, Attack Angle, Face to Path, Spin Loft, Smash Factor og Club Speed. Appens paneler bruker blant annet Face Angle, Dynamic Loft og Impact Location. Disse er ikke utskiftbare. Del A/B har også motstrid mellom tekstinstruks og celleområder i filen; definer én versjonert protokoll før beregning aktiveres.

### Utviklingssjekken: kontroll mot tidligere kilde

Spørsmålskolonnene er telt uten overskrifter, og sammenlignet lokalt med 2025-filen som lå til grunn for vedtaket 28.09:

| Nivå | 2025 | Vedlegg 2027 | Forskjell |
|---|---:|---:|---|
| Ung · C5:C50 | 34 | 34 | Flere spørsmål om teknikk er omformulert, samt matinntak. |
| Junior · O5:O59 | 41 | 43 | To ekstra spørsmål om fysisk kapasitet til tekniske mål og treningsmengde; teknikkspørsmål omformulert. |
| Amatør · AA5:AA63 | 41 | 47 | Utvidet teknikkdel og endret ordlyd, blant annet college-tilpasning. |
| Profesjonell · AM5:AM55 | 38 | 38 | Ingen tekstforskjell i de undersøkte spørsmålscellene. |

2027-instruksen sier **1–5**. Sesongevalueringen bruker separat **1–4**. Den monterte, uferdige IUP-seksjonen sier **1–8**. Disse skalaene kan ikke slås sammen. Et nivåskifte må bevare gamle svar med sin spørsmålsversjon. Nye aldersetiketter i Excel overstyrer heller ikke vedtaket om Ung etter klassetrinn og Junior til og med året spilleren fyller 19.

## Kildeavvik som ikke skal kopieres inn som fasit

1. **Dagbokens år:** B2:B367 inneholder 01.10.2023–30.09.2024, selv om filnavnet sier 2027. Sesongdatoer må komme fra valgt sesong.
2. **Dagbokens total:** J2 og J4 summerer D:I og legger dermed også antall økter til tidsverdiene. J3 bruker D:H. Antall og tid skal være separate måltall.
3. **Turneringssummer:** D33 summerer D2:E26, altså hull og ukenummer sammen, og utelater rad 27–32. H33 summerer H2:I26 og utelater også de siste turneringsradene. Bruk klart definerte summer.
4. **Teknikktestens statistikk:** D21 er merket gjennomsnitt, men bruker MEDIAN. U21 bruker AVERAGE(U11:U20), som utelater første slag og inkluderer medianraden. Flere paneler har ulike A/B-områder. Krever en ryddet protokoll, ikke blind formelkopiering.
5. **Fysisk score:** B9 = B3+B4+B5/2+B6/6+B7 bruker CMJ, lengdehopp og ballkast i andre posisjoner/vekter enn vekttabellen A14:B18 beskriver. Appens score er i tillegg kroppsvekt-/stallrelativ. Disse tre definisjonene er ikke samme måltall.
6. **Avstand i Statistics:** T2 og den delte formelen videre bruker yards × 0,9. Eksakt konvertering er × 0,9144. Arkets referanseintervaller må likevel ikke endres lydløst; bevar kildens definisjon og skill den fra enhetskonvertering.
7. **Bilder med nivå/Power:** historiske eksempelbilder og turneringslister er ikke verifiserte 2027-rankinger eller gjeldende AK-kategorier. Bruk kilde/dato og gjeldende A–K-regler.

## Konkret tillegg til kode- og designplanen

| Prioritet | Leveranse | Hvor det hører hjemme | Ferdigkriterium |
|---|---|---|---|
| P0 | Felles IUP-feltkart og kildeversjon | Datakontrakter for målsetninger, tester, vurdering og plan | Hvert krav over har lagringsfelt, leser, skriver og test; funksjonen registreres én gang og gjenbrukes i alle relevante flater. Ingen ny databaseendring er utført eller autorisert av denne rapporten. |
| P0 | Sesongevaluering og utviklingssjekk | PlayerHQ I dag/oppfølging; trenerens IUP | Lagre, fortsette senere, fullføre og sammenligne historikk; riktig nivå og egen skala; forbedringspunkt kan opprette prosessmål. Avklar 2027-versjonen før avhengig bygging. |
| P0 | Full prosessmålmodell | Målsetning og Workbench | Handling, tidsrom, målekriterium, overordnet resultatmål, hjelper, fasilitet/utstyr og evaluering følger målet helt til økten. |
| P1 | Års-/kvartalsmatrise | Stats og trenerens IUP | Alle måltallene i ark 3 har mål/historikk og kildemerking. Sesongstart etter gjeldende vedtak; arkets oktober–september-vindu vises eksplisitt hvis beholdt som rapportvindu. |
| P1 | Ukeprioritet og oppholdssted | Workbench År/Periode | Fem områders prioritet kan ses sammen med perioder, turneringer og sted. Null, ukjent, planlagt og faktisk skilles. |
| P1 | Turneringsnivå og samlet omfang | Workbench Turnering | Power med kilde/år, hull, dager, land/tour og reise kan sammenlignes; totalene stemmer for alle rader. Ranking blandes ikke med feltstyrke. |
| P1 | Ukesyklus og basisøkter | Workbench Uke/Økt og malbibliotek | Fire uketyper og treukersoppsett kan lagres/gjenbrukes, med turneringsoppvarming, testøkter og utstyrsbehov. Gjeldende treningsbegreper beholdes. |
| P1 | Teknikktest og før/etter-plan | Stats Tester og Teknisk plan | Riktig A/B-protokoll, alle målefelter, spredning og statistikk; funn kobles til teknisk oppgave og trening. Uavklarte poengregler gir aldri oppdiktet resultat. |
| P1 | Faktisk treningsdagbok | Stats/Plan og trenerens IUP | En fullført økt med 45 faktiske og 60 planlagte minutter vises som 45 faktisk/60 planlagt; dag/måned/sesong summerer likt, uten dobbelttelling mellom øktmodeller. |
| P2 | Støtteapparat og referansebibliotek | Meg, trener-IUP og Stats | Rolle/person/kontakt/fagansvar kan registreres med riktig tilgang. Referanser har kilde, versjon, utvalg og enhet. Helsefelter håndteres etter gjeldende tilgangsregler. |

Designgrunnlaget skal vise koblingene mellom skjermene, ikke samle alle Excel-feltene på én stor Workbench-side. Precision Athletics gjelder fortsatt; Team Norway beholder sin egen profil. Denne rapporten er klargjort for en anonymisert designoverlevering, men er ikke sendt i denne kontrollen.

## Kodebevis

Stiene viser koden som faktisk ble lest i hovedarbeidskopien, `f9c40e542`. Dokumentet lagres på egen plangren, som har et eldre kodegrunnlag; kontroller angitt revisjon ved senere gjennomgang.

| ID | Kilder |
|---|---|
| K1 | `src/components/admin/precision/AG08Faner.tsx:117` og `AG08Spiller360.tsx:131`; `src/app/admin/spillere/[id]/page.tsx`; `src/lib/admin-spiller/spiller360-data.ts` |
| K2 | `src/components/team-norway/skjermer/tn-fagapparat-skjerm.tsx` |
| K3 | `src/app/portal/meg/actions.ts`; `src/lib/portal/profil-flate-data.ts`; `prisma/schema.prisma` — User, HealthEntry, Leave |
| K4 | `src/lib/domain/tn-evaluering.ts`; `src/app/team-norway/spiller/[spillerId]/evaluering/page.tsx`; `src/app/team-wang/coach/iup/[elevId]/actions.ts` |
| K5 | `prisma/schema.prisma:2364` — Goal; `src/app/portal/(legacy)/mal/goals-actions.ts:16`; `src/lib/workbench/maal-spor.ts`; `src/lib/domain/maal-plannivaa.ts` |
| K6 | `src/lib/admin-spiller/spiller360-data.ts`; `src/lib/portal-stats/datagolf-data.ts`; `src/lib/portal-runder/manuell-sg.ts` |
| K7 | `src/lib/workbench/perioder.ts`; `src/lib/domain/workbench/operations.ts:474`; samme fil `:607`, `:636`; `src/app/team-norway/workbench/page.tsx` |
| K8 | `prisma/schema.prisma:3010` — Tournament; `:6740` — WorkbenchTournamentPlan og relasjoner; `src/lib/workbench/fys-turnering-actions.ts`; `fys-turnering-kontrakt.ts`; `turnering-plan.ts`; `src/app/admin/workbench/[playerId]/page.tsx` |
| K9 | `src/lib/domain/workbench/types.ts` — WorkbenchSession og SourceItem; `src/lib/workbench/wb-actions.ts`; `src/app/team-norway/workbench/page.tsx` |
| K10 | `prisma/schema.prisma:4941` — TechnicalPlan; `src/lib/teknisk-plan/tp-skjema.ts`; `test-to-tm-baseline.ts`; `src/lib/domain/tn-teknisk-plan.ts` |
| K11 | [Vedtak 28.09](../../.claude/rules/beslutninger.md), «Én IUP og ett testbatteri»; [detaljgrunnlag](../beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md) |
| K12 | `src/lib/portal-tester/tn-catalog.ts`; `tn-scoring.ts`; `src/app/portal/tren/tester/team-norway/page.tsx`, `actions.ts`, `scorecard.tsx`; `src/app/team-norway/tn-testforing-actions.ts` |
| K13 | `src/lib/domain/fys-score.ts`; `src/lib/fys-data.ts`; `src/app/portal/tren/tester/ny/actions.ts`; `src/lib/portal-fysisk/fysisk-data.ts` |
| K14 | `src/lib/domain/sg.ts:124`; `src/lib/domain/pei/broadie-sg-tabeller.ts`; `pei-tabeller.ts`; [beregningsregler](../platform/BUSINESS-RULES.md) |

## Verifisering og begrensning

105 eksisterende tester besto, 0 feilet, 0 hoppet over. Utvalg: `tn-scoring.test.ts`, `domain/workbench/operations.test.ts`, `__tests__/domain/fys-score.test.ts`, `domain/maal-plannivaa.test.ts` og `__tests__/domain/sg.test.ts`.

Testenes Excel-paritet gjelder deres eksisterende referanser, blant annet TN-testprotokoll v3. Det er **ikke** en automatisk sammenligning mot hele IUP 2027. Denne kontrollen inkluderer ikke innlogget nettlesertest, produksjonsdata, mobil/desktop-godkjenning, eksterne protokollnettsider eller full kvalitetskontroll for appen.

En funksjon kan først merkes ferdig når relevante data kan registreres, lagres, gjenåpnes, summeres og vises hos riktig spiller/trener, med riktig kilde og tilgang. Skjermene må også kontrolleres i mobil og desktop mot valgt design.
