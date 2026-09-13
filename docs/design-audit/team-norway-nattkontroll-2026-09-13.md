# Team Norway — mottatt nettleserbevis 13.09.2026

Kandidat: `6af19e315` + `591a2a797`. Kontrollen er utført av Team Norway-oppgaven. Nattkoordinatoren har lest JSON-rapporten, kontrollert antall/utfall og sett representative mobil- og desktopbilder. Dette er ikke en ny kjøring eller Anders’ visuelle godkjenning.

## Faktisk rapport

- 32 kombinasjoner: trener desktop 19, trener mobil 4, TN-spiller mobil 7, to forventede avvisninger.
- 30 autoriserte visninger har logo; de to avvisningssidene har ikke logo.
- Ingen innloggingsomdirigering, horisontal overflow eller konsollfeil er registrert.
- Bredder: 1440 × 900 og 390 × 844. Syntetiske testbrukere.

## Lokale artefakter

- `/tmp/ak-tn-claw-signoff/report.json`
- `/tmp/ak-tn-claw-signoff/coach-team-norway-spillere-final.png` — sett av nattkoordinator.
- `/tmp/ak-tn-claw-signoff/player-team-norway-turneringer-ny-final.png` — sett av nattkoordinator.
- `/tmp/ak-tn-claw-signoff/coach-team-norway-manedsplan-final.png` — fil kontrollert.
- `/tmp/ak-tn-claw-signoff/coach-team-norway-tilgang-final.png` — fil kontrollert.

Artefaktene beholdes lokalt og er ikke kopiert inn i Git eller public.

## Rute- og rolleliste

| Rolle | Bredde | Rute | Forventet utfall |
|---|---|---|---|
| coach | 1440x900 | `/team-norway` | Tillatt |
| coach | 1440x900 | `/team-norway/spillere` | Tillatt |
| coach | 1440x900 | `/team-norway/fellestesting` | Tillatt |
| coach | 1440x900 | `/team-norway/samlinger` | Tillatt |
| coach | 1440x900 | `/team-norway/college` | Tillatt |
| coach | 1440x900 | `/team-norway/manedsplan` | Tillatt |
| coach | 1440x900 | `/team-norway/uttak` | Tillatt |
| coach | 1440x900 | `/team-norway/rangliste` | Tillatt |
| coach | 1440x900 | `/team-norway/skoler` | Tillatt |
| coach | 1440x900 | `/team-norway/protokoller` | Tillatt |
| coach | 1440x900 | `/team-norway/turneringer` | Tillatt |
| coach | 1440x900 | `/team-norway/referansenivaer` | Tillatt |
| coach | 1440x900 | `/team-norway/inviter` | Tillatt |
| coach | 1440x900 | `/team-norway/apparatet` | Tillatt |
| coach | 1440x900 | `/team-norway/tilgang` | Tillatt |
| coach | 1440x900 | `/team-norway/samlinger/tn-signoff-camp` | Tillatt |
| coach | 1440x900 | `/team-norway/protokoller/8-ball-variation` | Tillatt |
| coach | 1440x900 | `/team-norway/spiller/cmtyx46u10001gne53dgs03gk` | Tillatt |
| coach | 1440x900 | `/team-norway/cmtz2s5pg0001uie54j63l3n4` | Tillatt |
| coach | 390x844 | `/team-norway` | Tillatt |
| coach | 390x844 | `/team-norway/spillere` | Tillatt |
| coach | 390x844 | `/team-norway/manedsplan` | Tillatt |
| coach | 390x844 | `/team-norway/tilgang` | Tillatt |
| player | 390x844 | `/team-norway` | Tillatt |
| player | 390x844 | `/team-norway/college` | Tillatt |
| player | 390x844 | `/team-norway/samlinger` | Tillatt |
| player | 390x844 | `/team-norway/manedsplan` | Tillatt |
| player | 390x844 | `/team-norway/turneringer` | Tillatt |
| player | 390x844 | `/team-norway/turneringer/ny` | Tillatt |
| player | 390x844 | `/team-norway/referansenivaer` | Tillatt |
| player-denied | 390x844 | `/team-norway/fellestesting` | Avvist |
| foreign-denied | 390x844 | `/team-norway` | Avvist |

## Bevisgrense

Rapporten dokumenterer de oppgitte visningene og rollene. Den dokumenterer ikke alle skrivehandlinger, full tom-/lastende-/feil-/offline-/samtykkematrise, alle mobile ruter, tastatur/200 % tekst, eller produksjon. Ingen slik fullføring utledes av at siden lastet uten feil. Samlet integrasjon og kortenes fulle ferdigkrav følges separat.
