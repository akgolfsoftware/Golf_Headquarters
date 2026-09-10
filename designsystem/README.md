# Designarbeid og referanser

**Gjeldende beskjed fra Anders 10.09.2026:** «Jeg jobber nå parallelt i Claude design for å optimalisere design på alle skjermer. Ingenting av det som ligger i prosjektet nå er låst.»

Alle eksisterende designpakker er arbeidsunderlag under revisjon. Navn som «Train-lock», eldre godkjenninger og formuleringer som «eneste fasit» låser ikke videre arbeid. Dette gjelder også navigasjon, oppsett, fonter, farger, temaer og komponentvalg på tvers av flatene. En ny versjon fra Claude Design er ikke inspisert eller importert i denne avklaringen.

## Eksisterende underlag

For nytt arbeid: bruk [AK HQ Design-skillen](../.claude/skills/ak-hq-design/SKILL.md) og [samlet hovedprompt og arbeidsbeskrivelse](../docs/design-system/ak-hq-designarbeid.md). De definerer prosessen og dekningen, ikke et nytt låst utseende.

Tabellen viser hvor materialet og dagens implementasjon finnes. Den velger ikke fremtidig design.

| Flate | Eksisterende referanser | Dagens implementasjon |
|---|---|---|
| PlayerHQ `/portal`, AgencyOS `/admin`, Forelder `/forelder` | [Train-lock](train-lock/DESIGN-SYSTEM.md), [skjermregister](train-lock/SCREEN-INDEX.md), [portering](train-lock/PORTING.md) | `src/styles/train-lock-tokens.css`, `src/lib/v2/train-lock.ts` (`TL`) |
| Booking, også offentlig `/booking` | Tidligere lys Train-lock-flyt; finn B-skjermene i registeret | `--tl-*` / `TL` |
| Markedssider `/` og øvrig offentlig nettsted | [AK Golf-master](ak-golf/readme.md) | `--ak-*`, `src/styles/ak-golf.css`; genererte verdier kommer fra `ak-golf/tokens.json` |
| WANG `/team-wang` | [WANG](wang/LES-MEG.md), [portering](wang/PORTING.md) | `src/styles/wang-tokens.css` |
| Team Norway `/team-norway` | [Claw / Team Norway](team-norway/handover/PORTING.md) | Team Norway-pakkens tokenbro; delte analyseflater har Train-lock-struktur |
| Lokale utkast / tidligere godkjente tillegg | [Canvas](canvas/README.md) | Se den enkelte referansen. |


[Tema-dokumentet](../docs/design-system/TEMA-LYS-MORK.md) beskriver dagens kode. Det fastsetter ikke tema eller fonter i neste design. Historiske `Fasit:`-kommentarer dokumenterer opphav, ikke en aktuell godkjenning.

## Fra Claude Design til appen

1. Arbeid med sammenhengende brukerreiser. Anbefalt første gjennomgang er spillerens vei fra **I dag → Plan → gjennomfør økt → oppsummering**. Rekkefølgen er et forslag, ikke en ny låsing av meny eller produkt.
2. Når Anders velger en versjon for bygging, registrer designlenke eller eksport med versjon/dato, tilhørende skjermer, hovedhandlinger og overganger. Ta med mobil, desktop og relevante tomme, lastende, feil- og fullført-tilstander. Registrer avtalte temaer.
3. Bygg og vurder denne reisen samlet. Vis appen ved siden av valgt versjon, dokumenter funksjonstester og kjente avvik, og registrer Anders' vurdering. Andre skjermer kan fortsatt være under utforsking.

Byggestatus og rekkefølge føres i [arbeidslisten](../docs/MASTERPLAN-GJENSTAAENDE.md). En komplett app før lansering er fortsatt målet; levering i gjennomgåtte deler endrer ikke dette målet.

## Bevaring og tekniske kontroller

Originalpakkene beholdes som referanser. Ved ny import brukes pakkens dokumenterte synk eller en versjonert leveranse, slik at opphav og tidligere arbeid bevares. Ikke overskriv dem med antakelser om arbeid som fortsatt pågår i Claude Design.

Gamle Paper-verktøy er arkivert og sperret etter oppryddingen. At designvalg er åpne, starter ikke disse verktøyene på nytt. Når en ny retning bestilles, oppdateres berørte designkontroller sammen med implementasjonen. Vanlige krav til personvern, tilgang, dataintegritet og autorisasjon gjelder fortsatt.
