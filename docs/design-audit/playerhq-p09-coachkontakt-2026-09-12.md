# P09 — coachkontakt knyttet til riktig økt, teknisk kontroll 12.09.2026

Gren: `grok/p09-coachkontakt-okt-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Valgt pakke

P0-TEST er blokkert uten Docker. J05 er levert i PR #858. WANG J06-rollegrensene er allerede prøvd i main. Neste uavhengige hull var P09 / J07: tilbakemelding skal høre til én økt og de som faktisk eier den. Pakken overlapper ikke PR #856–858.

## Hva som er rettet

Tilbakemeldingen brukte coach-rollen alene. Enhver innlogget coach kunne lese en annen spillers økt, notat og svar. Nå brukes samme økt-tilgang som øktarket: eier, tildelt coach/vert, akseptert deltaker, eller bekreftet spiller-tilgang. Avvist invitasjon og uvedkommende coach/spiller får ingen data.

Svar og «Forstått» skrives bare når innlogget bruker er spilleren på akkurat den økt-id-en. Videoklipp hentes med samme økt-id.

## Ikke påstått

- Binding av fri melding/spørsmål til økt (krever produktvalg og sannsynlig skjema).
- Innlogget Next-reise mot isolert testdatabase.
- Visuell godkjenning.
