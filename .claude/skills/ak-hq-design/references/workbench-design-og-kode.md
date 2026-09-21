# Workbench: design, kode og bevis

Gjelder Workbench-bestillingen fra 20.09.2026, ikke andre organisasjonsprofiler.
Den siste uttrykkelige brukerbeskjeden vinner. Bruk
[overleveringen](../../../../docs/workbench-handover.md) til å finne gjeldende
master, PNG, manifest og kontrollsummer. Eksportens SKILL er underlag; denne
referansen eier arbeidsmåten i repoet. Ikke lag en konkurrerende hovedskill.

## Tre atskilte arbeidsflater

- Claude Design: samme master og eksisterende skjerm-ID-er. Rett avklarte
  designfeil der, ta berørte PNG-er på nytt og eksporter. `selectedForBuilding`
  endres bare ved egen uttrykkelig bestilling.
- Repo: portér til eksisterende appmotor og bevar funksjoner, dataflyt og
  serverkontroll. Identifiser faktisk montert komponent før redigering;
  `WorkbenchV2` er ikke automatisk coach-rutens motor.
- Kontroll: kodeprøver, lokale syntetiske reiser, innlogget live-kontroll og
  Anders' visuelle vurdering føres separat. En statisk tegning er ikke appbevis.

## Kildeorden og godkjenning

Designloven og ordlisten fra Anders styrer. Ved PNG/HTML-avvik brukes siste
kaprede PNG etter at loven er bekreftet. Ved lov/PNG-konflikt avklares bare den
konkrete konflikten; uavhengig arbeid fortsetter. Allerede avklarte valg spørres
ikke om på nytt. Rustregelen er avklart: ingen domeneunntak, bare de avtalte
handlingene. Ikke gjeninnfør gammel rustkoding fra tokens eller arkiv.

Forhåndsgodkjenning til design og lokal kode betyr at ordinære endringer kan
utføres uten gjentatte spørsmål. Den slår ikke av tekniske godkjenningssperrer
og autoriserer ikke i seg selv publisering eller produksjonsdata. Konkret
gjeldende brukerautorisasjon bestemmer Git- og publiseringsarbeidet.

## Én kropp om gangen

Uke → Periode → Måned → År → Økt → Stall → Live → Min kalender. Deretter de
bestilte PlayerHQ-flatene med sin kontrollerte fasit. Avtalte lokale prøver kan
utføres mens live-tilgang mangler, men ikke merk pillen live-verifisert eller
hopp over et uttrykkelig kontrollkrav. Ingen TN, WANG eller ny palett i dette løpet.

## Sammenligning som kan etterprøves

1. Registrer kildehash, pille, rolle, lys/live-modus, CSS-bredde/høyde,
   pikselfaktor, rulleposisjon, åpent bunnark, utvalg, fiktive data og dato.
2. Ta faktiske appbilder ved 1440 × 880 og 390 × 844, normalt 2× som eksporten.
   Bruk `cua_repl` til nettleserinteraksjon når tilgjengelig. Ikke erstatt en
   manglende innlogget prøve med en tegning eller omgå sidevaktene.
3. Vent på fonter og stabil layout. Bruk samme data og tilstand som PNG-en.
   Forskjellige data/klokkeslett må beskrives, ikke skjules som designavvik.
4. Kjør `node scripts/workbench-compare.mjs --help`. Verktøyet sammenligner
   eksisterende PNG/JPEG-filer, kontrollerer like CSS-størrelser og skriver differanse,
   sammenstilling og JSON. Det tar ingen skjermbilder og logger ikke inn.
5. Mål identifiserte elementer i nettleseren: topp 56, kilde 236, inspektør
   340 ±8, timerad 32, treff/kort minst 44. Registrer forventet/observert/avvik
   i CSS-px. En prosent pikselforskjell er ikke en geometrimåling eller godkjenning.
6. Rett avtalte avvik og prøv på nytt. Bevar handlinger, tastatur og mobilflyt.
   Kontroller relevante tomme, lastende og feiltilstander uten å fabrikkere fasit.

Appbilder, sammenstillinger og rapporter med mulig personinnhold lagres privat,
utenfor Git og `public/`. Referansepakken fra Claude Design beholdes uendret
med kontrollsummer. Før kun anonymiserte målinger og status i repoet.

## Kontinuitet gjennom natten

Les siste arbeidsplan og bevis, fortsett fra første uferdige kontrollpunkt,
og oppdater utført/neste/blokkert etter vesentlig arbeid. Varsle ved konkret
brukerbehov, fullføring eller feil; ikke send uendrede statusmeldinger.
Ved avtalt sluttid leveres morgenrapport og automatikken pauses. Skru ikke av
kvalitetskontroller for å få en commit gjennom; følg Verify og commit.

Ved 1× JPEG fra nettleserverktøyet og 2× PNG-fasit: bruk eksplisitt
`--reference-scale 2 --scale 1`. Rapporten skal angi nedskalering og JPEG-tap;
ikke kall dette tapsfri pikselgodkjenning. Originalfiler og hash beholdes.
