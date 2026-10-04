# Workbench — designkontrakt for restpakken

Kilde: Anders sin bestilling om å fullføre restoppgavene, valgt Precision Athletics eksport 77, [planleggingsmasteren](../treningsplanlegging.md) og [restregisteret](workbench-fullforing-2026-10-02.json). Dette er en konkret overlevering, ikke bevis på ferdige skjermer eller produksjonsfunksjon. Kode-/testbevis registreres etter gjennomføring.

## Precision først

Viderefør de eksisterende fire Workbench-visningene og deres ark. Bevar spiller, valgt år/periode/måned/uke og dato ved navigasjon. Ikke opprett en ny app eller endre det valgte designsystemet.

- **Hendelse:** navn, type skole/reise/samling/annet, dato og klokkeslett i Oslo, enkeltstående eller ukentlig. Vis varighet og kollisjon før lagring. Private titler skal ikke avsløres til andre spillere gjennom kalenderen.
- **Turneringsplan:** tour, land, sted, start/slutt, 9/18 hull, eksplisitte rundedatoer, separate reisedager og prioritet. Historisk WAGR Power skal ha kildeår og kilde; det er et annet mål enn DataGolf-feltstyrke. Ikke sett manglende verdi til nulltall.
- **Flytt, kopi og gjenta:** vis måluke, berørte økter og konflikt før handlingen. Kopier planinnhold med nytt opphav, uten gjennomføringslogger. Angre må bevare nyere spillerendringer og vise konflikt dersom grunnlaget er endret.
- **Gjennomføring:** start, pause, fortsett, fullfør og avbryt samme økt. Skill gjennomføringsfase fra lagrer/lagret/venter/feil. Oppfriskning må bevare faktisk registrert tid, pause og rå registreringer. Avbrutt og avlyst er ulike tilstander.
- **Etterregistrering og retting:** faktisk tid, øktantall og rettingsårsak med historikk. Skill uttrykkelig registrert 0 fra manglende registrering. Bekreftet lagring oppdaterer dag/uke/måned/sesong og de fem treningsområdene, uten dobbelttelling.
- **Tidligere bestilte tillegg:** ukeprioritet/fokus/budsjett/opphold, tre konkrete ISO-uker, fri uketype, testmerker, samlet lagring, bekreftet kopiering og oppløsning uten sletting. Serieendring sender bare feltene som faktisk er endret.

Bruk 390 og 1440 px, eksisterende lyst tema og nattema i Live. Prøv tastatur/fokus og tom, lastende, ikke-delt, lagringsfeil, gjentatt innsending og samtidig endring. Syntetiske personer og resultater er eneste designunderlag. Ingen automatisk faglig progresjon eller omtolking av gamle måledata.

## Deretter eksisterende WANG og Team Norway

Overfør samme funksjoner til de eksisterende organisasjonsprosjektene og bevar hvert sitt designsystem. WANG betyr **WANG Golf UI prototype**, ikke et nytt prosjekt. Treneren skal se spillerens autoriserte data fra PlayerHQ, med kildeversjon og tidspunkt, fremfor egne kopier av IUP-en.

Personlige endringer sendes som forslag med før/etter, begrunnelse og gjeldende planversjon. Spillerens godkjenning anvender hele forslaget én gang; avvisning anvender null. Vis trukket, utløpt og konflikt. Trenerens egne notater og gruppeprogram følger sine separate rettigheter. Skole-/testdeling gir ikke automatisk full profil eller skriverett til personlig Workbench.

Bevar samlings-, testbatteri-, DataGolf- og fullprofilfiler som de andre aktive oppgavene viderefører. Design skal vise tilgangstilstandene, men kan ikke tildele nye rettigheter i appen eller aktivere DataGolf for kunder uten dokumentert rett.

## Leveranse og bevis

Oppgi endrede filer, konkrete skjerm-ID-er, handlinger og faktisk prøvde bredder/tilstander. Eksport med kontrollsum og egen visuell sammenligning kreves før et nytt skjermvalg kan regnes som vurdert. En sendt prompt, en prototypeknapp eller grønn kodekontroll er ikke en ferdigattest.

Ved kontroll av Precision 02.10.2026 hadde den foregående leveransen stoppet ved bruksgrense uten nye filer. Etter fortsettelsesbeskjeden leverte prosjektet `uv.js` og endringer i `shell.js`, `v-uke.js`, `base.css`, `index.html`, `overlevering.md` og `status.md`. Den faktiske forhåndsvisningen viser Ukevalg og treukerssyklus. Leveransen er en prototype; den nye dialogen er ikke en visuell godkjenning av appen.

Prosjektet rapporterte selv at serieendring manglet, og at konflikt kunne løses ved direkte overskriving med gammelt utkast. Konkret retting er sendt: bevar utkastet, sammenstill mot fersk revisjon og stopp alle delvise skriver ved konflikt. Serieendring skal bare sende faktisk endrede felt. En egen overføringskontrakt til eksisterende WANG og Team Norway er også bestilt. Fontrettingen er rapportert kontrollert ved 1440, men 390 etter rettingen og egen uavhengig klikkprøve er fortsatt uverifisert. Det er ikke gjort abonnementendring eller kjøp.
