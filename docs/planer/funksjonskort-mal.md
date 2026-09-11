# Funksjonskort — mal

Kopier til `docs/planer/funksjon-<navn>.md` når en konkret funksjon tas videre. Bruk [produktplanen](produktplan-og-intervju-2026-09-11.md) for arbeidsmåte og [registeret](funksjonsregister-2026-09-11.md) for sammenheng. Fyll bare det som er relevant; marker ukjent fremfor å gjette.

## Oppdrag

- **ID og navn:**
- **Bruker/rolle:**
- **Situasjon og problem:**
- **Ønsket resultat:**
- **Slik måler vi nytten:**
- **Bestilling og eventuelle tidligere avklaringer:**
- **Eksisterende løsning/kode som skal brukes:**
- **Denne leveransen omfatter:**
- **Senere deler som beholdes i planen:**

## Brukerreise

Beskriv inngang → handling → lagring → synlig resultat → neste handling. Ta med feiltrykk, avbrudd, gjenopptakelse og tilbakevei. Forklar hvor den samme informasjonen brukes av spiller, coach eller andre roller.

## Data og faglige regler

- Kilde, eier, enhet og tidspunkt for hvert viktig tall.
- Hva er målt, beregnet, manuelt registrert eller ukjent?
- Hvem kan lese og endre hvilke opplysninger?
- Hva skjer ved manglende data, dårlig nett, gjentatt innsending eller endret tilgang?
- Eventuelle eksterne tjenester, databaseendringer og konkrete autorisasjoner.

## Design og oppførsel

- Valgt kilde/versjon/dato, hvis skjermarbeid inngår.
- Berørte skjermer og felles komponenter.
- Mobil 390 px, desktop og avtalte temaer.
- Relevante tilstander: tom, lastende, normal, feil, ventende lagring, fullført og avbrutt.
- Tastatur, berøring, lesbarhet og hjelpebeskjeder.

## Gjennomføring

- Arbeidsgren og egen arbeidsmappe.
- Grunnlag: kodeversjon og avhengige leveranser.
- Ansvarlige filer/moduler og koordinering med annet arbeid.
- Avgrensede deloppgaver og rekkefølge.
- Åpne produktbeslutninger; hvilke deler de faktisk blokkerer.

## Akseptanse — observerbar oppførsel

| Situasjon | Brukerens handling | Forventet resultat | Prøve og bevis |
|---|---|---|---|
| Vanlig bruk | Fyll inn | Fyll inn | Ikke prøvd |
| Manglende/ugyldig data | Fyll inn | Fyll inn | Ikke prøvd |
| Uvedkommende bruker | Fyll inn | Tilgang avvises uten å røpe private data | Ikke prøvd |
| Feil og nytt forsøk | Fyll inn | Fyll inn | Ikke prøvd |

## Leveranse og status

| Område | Status/bevis |
|---|---|
| Produktavklaring | Idé / avklares / bestilt |
| Kode | Ikke startet / bygges / implementert; gren og versjon |
| Automatiske kontroller | Kommando, resultat, dato og versjon; eventuelle hoppede tester |
| Faktisk brukerreise | Miljø, syntetiske roller, prøvesteg og resultat |
| Visuell kontroll | Valgt kilde, formater/tilstander og avvik |
| Anders har prøvd/sett | Dato, versjon og tilbakemelding |
| Kjent restarbeid | Konkret liste; hva blokkerer levering? |
| Før samling til main | Oppdatert grunnlag, gjennomgått diff, endringsforslag og ny kontroll ved endring |
| Merge/publisering | Konkret bestilling, versjon og kjent konsekvens |
| Kontroll i drift | Faktisk publisert versjon og resultat |
| Tilbakeføring | Hvilken kode gjenopprettes, hvordan, og hva skjer med eventuelle nye data? |

«Implementert», «testet», «sett av Anders», «i main» og «bekreftet i drift» er fem ulike opplysninger. Ingen av dem fylles ut automatisk fordi den forrige er ferdig.
