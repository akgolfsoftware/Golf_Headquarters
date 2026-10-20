# Bildeplan for hele AK Golf HQ

Grunnlag: godkjent oppgraderingsplan 12.10.2026, Precision eksport34/D47/D78/D79, faktisk main a1aa2b183 og de aktive inngangene. Nike Training Club brukes som referanse for bildeplassering og hierarki. Ingen Nike- eller Mobbin-bilder er tatt inn i appen.

SportsCover er et eget, felles inngangsmønster:120px høyde, ingen tekst over fotografiet, adaptivt utsnitt, Next Image og plass reservert før lasting. Det skal være underordnet dagens handling. Høyere variant finnes i komponenten, men brukes ikke i denne oppgraderingen uten separat visuell godkjenning.

## Bilder som er produsert og koblet

| Fil under public/images/precision | Formål og plassering | Utsnitt og identitet |
| --- | --- | --- |
| practice-green-2026-10.png | I dag og generisk inngang til Spiller360 | Anonym voksen sett bakfra på treningsgreen. Dekorativt alt, aldri fremstilt som den valgte spilleren eller en faktisk lokasjon. |
| practice-range-2026-10.png | Øvelsesbankens treningsinngang | Anonym voksen/utstyr på range. Navigasjon og atmosfære, ingen teknisk P-posisjon. |
| physical-training-2026-10.png | FYS-planinngang | Utstyr i et treningsrom, uten personer. Ingen øvelsesinstruksjon. |

Alle tre er originale ImageGen-bilder fra12.10.2026. De har prompt/proveniens i sidekarfiler. Den første sidekarfilen inneholder rekonstruert genereringshensikt; de to senere inneholder den eksakte verktøyprompten. Originalene er bevart. Ingen spiller-, elev- eller kundeidentitet ble sendt til genereringen.

## Aktive mønstre gjennom resten av appen

| Bruksområde | Bildekilde / beslutning | Alternativ og faglig kontroll |
| --- | --- | --- |
| Øvelsesdetalj, TEK og MORAD | Faktisk tilknyttet video, foto eller godkjent fagillustrasjon når kilden finnes | Tekst, oppgave og mål fungerer uten bilde. Generert atmosfære brukes aldri som bevis på riktig P-posisjon. |
| Live, slagteller og fysisk registrering | Rolig arbeidsflate uten dekorativt foto | Øvelse, faktisk registrering og neste handling er hovedinnholdet. |
| Oppsummering, Stats og tester | Faktiske målinger, resultater og kilde | Ingen foto bak diagrammer eller tekst. Manglende kilde vises som ukjent. |
| Personlig spillerprofil | Eksisterende identitetsbilde bare gjennom den gjeldende tilgangs-/samtykkeflyten | Initialer når et tillatt portrett ikke finnes. Generisk SportsCover erstatter aldri portrettet. |
| WANG og Team Norway | Organisasjonens egne verifiserte logoer og eksisterende kildemateriale | Hele flaten følger D47. Aktuell samlingsbeskrivelse og faktisk sted står i tekst; et generisk sportsbilde er ikke et stedbilde. |
| Booking, konto, forelder, økonomi, samtykke | Ingen dekorativ fotoavhengighet | Informasjon og handlinger fungerer uten media. |
| GFGK Junior | Eksisterende merkevare- og klubbmateriale med gjeldende kilde | Ingen nye identifiserbare juniorbilder genereres. |
| E-post | Verifiserte ordmerker og tekstbaserte handlingslenker | E-posten skal kunne leses når bilder er blokkert. |

De27 SVG-ene i Precision-eksporten er et designinventar, ikke27 aktive bildeplasseringer i hovedappen. Oppslag i faktisk src/app og src/components fant ingen bruk av denne assets/ovelser-samlingen. Det er derfor ikke laget26 vilkårlige erstatningsfoto. Ved nye faglige bildebehov registreres motiv, inngang, kilde, identitet/samtykke og faglig kontroll før bruk.

## Kontrollstatus

De genererte motivene er visuelt inspisert. Visuell kontroll av endelige appinnganger og godkjenning av samme leveranse dokumenteres i samlet leveranserapport. Skjermprøver med syntetiske data er ikke brukerens visuelle godkjenning.
