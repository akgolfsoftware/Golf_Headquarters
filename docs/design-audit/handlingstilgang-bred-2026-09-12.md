# R-I fortsettelse — bred handlingstilgang 12.09.2026

Gren: `grok/r-i-bred-handlingstilgang-2026-09-12`. Ingen visuell portering.

## Inventar

Målt mot `origin/main`: 164 `use server`-filer med eksporterte async-funksjoner. 157 mangler søskentestfil. Mange lesehandlinger og eldre flater inngår. Dette er ikke 164 ubeskyttede skriv.

## Hva som er prøvd i denne pakken

Eksporterte skrivehandlinger, avviste roller og ressursgrenser:

- Opptatt tid: opprettelse bruker innlogget bruker-id. Endring og sletting av andres avtale treffer 0 rader.
- Profil: forelder avvises uten skriving.
- Mål: slett og avbryt avviser andres mål.

Tidligere R-I (PR #848) dekker coach-notat, fys-logg, IUP, TN-post og skoletid.

## Gjenstår

Øvrige skrivehandlinger uten søskentest, inkludert booking, helse, coachmelding og admin-mutasjoner. Utstyrsbag er prøvd på `grok/r-i-utstyrsbag-2026-09-13`. Innlogget isolert reise er blokkert uten Docker.

## Ikke påstått

- At alle 164 filer har egen avvisningstest.
- Lanseringsklar app.
