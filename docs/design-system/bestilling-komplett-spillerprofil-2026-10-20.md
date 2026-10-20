# Bestilling: komplett spillerprofil i AgencyOS, Team Norway og WANG

Dato: 20.10.2026. Bestiller: Anders Kristiansen. Status: **tegning mangler.** Koden er bygget midlertidig med hvert miljøs egne
byggeklosser (`src/components/profil/KomplettProfil{AgencyOS,Tn,Wang}.tsx`) og kan byttes når tegningen er godkjent.

## Hva siden er

Én side per spiller for treneren, med alt vi vet om spilleren på ett sted, fra samme kilde i alle tre miljøene.
Spilleren selv bruker PlayerHQ og får ikke denne siden. Ruter i dag:

- AgencyOS: `/admin/spillere/[id]/profil-komplett` (system: Precision Athletics)
- Team Norway: `/team-norway/spiller/[spillerId]/profil` (system: Team Norway, retning «Skrå»)
- WANG: `/team-wang/coach/profil/[elevId]` (system: WANG, egne farger og skrifter)

Hvert miljø beholder sitt eget designsystem. Ingen AK-farger i Team Norway og WANG, ingen WANG- eller TN-farger i AgencyOS.

## Hva som finnes fra før (ikke et svar på bestillingen)

- WANG: elevprofil (WANG-44) og «Siste turneringer» i `docs/design-system/utkast-wang/elever.html`.
- Team Norway: spillerutvikling, «Siste tester», «Fullførte resultater» i `docs/design-system/utkast-tn/spillere.html`.
- AgencyOS: Spiller 360 (AG08Spiller360) og «Turneringsprofil».
- Ingen av dem samler offisielle resultater, tester, runder og IUP på én side.

## Innhold, i denne rekkefølgen

1. **Identitet:** navn, fødselsår, golf-ID (MemberID). Golf-ID vises bare for trenere.
2. **Offisielle resultater:** per år, nyeste først. Dato, turnering, klasse, plassering, slag (brutto) med mot par, kilde
   (GolfBox, Srixon, Olyo, NorgesCup, regionstour, Nordic League fra GolfBox, WAGR, college, egen registrering).
   Under: sesongtall (runder, snitt, mot par).
3. **Tester spilleren har registrert:** test, område, siste verdi, dato, antall. Team Norway-protokoller viser ikke verdi her
   (egne enheter) men en lenke til Team Norway › Tester.
4. **Runder og statistikk, siste 12 måneder:** runder, snitt brutto, SG totalt, utslag, innspill, nærspill, putting.
   Bare runder spilleren har delt med trener.
5. **IUP:** leverte svar (utviklingssjekk og sesongevaluering) med periode og leveringsdato, og IUP-måltall per kvartal
   (K1–K4, året, spillerens mål). Bare for aktive WANG- og Team Norway-spillere.

## Tilstander som må tegnes

- Full profil.
- **Resultatprofil ikke koblet:** spilleren har ikke koblet seg ennå. Under 16 kobler treneren (AgencyOS).
- Ingen tester, ingen delte runder, ingen IUP: egne tomtilstander med forklaring, aldri «0».
- IUP-svar som ikke kan vises fordi innholdet avviker fra kilden.
- Laster og feil.
- 390 px og 360 px: aldri sidelengs rulling på selve siden. Lange tabeller kan bli rader.

## Harde regler (kan ikke tegnes bort)

- Brutto score alltid. Netto-klasser vises ikke.
- Ingen Data Golf-tall på denne siden, uansett rolle.
- Golf-ID bare for trenere. Aldri for spiller eller forelder.
- Mindreårige: resultater vises bare fra kilder der forbund eller tour allerede har publisert dem.
- Runder merket «Bare deg» og IUP-utkast vises aldri.
- Bare syntetiske data i tegningene. Aldri ekte navn på mindreårige.
- Tekstkontrast minst 4,5:1.

## Levering

- AgencyOS: Claude Design-prosjektet «AK Golf Precision Athletics» (`7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`).
- Team Norway og WANG: HTML-utkast i `docs/design-system/utkast-tn/` og `utkast-wang/`, samme metode som øvrige pakker
  (Claude Design stenger 14.12). Gjennomgang samlet i port 7.

## Åpne spørsmål til Anders

1. Skal den samlede profilen være en egen side, eller en ny fane i Spiller 360, Team Norway-spillerfanene og WANG-elevsiden?
2. Skal IUP-svarene kunne åpnes fra profilen, eller er leveringsdato og periode nok?
