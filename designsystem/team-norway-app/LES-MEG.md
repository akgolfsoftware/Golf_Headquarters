# `designsystem/team-norway-app/` — hvor Team Norways appdesign bor

**Fasiten er ikke her.** Den er Claude Design-prosjektet **«Team Norway App»**
(`bf70a934-12f1-4c0a-8153-685c4b03e6af`). Denne fila sier bare hva som gjelder, så
ingen trenger å lete.

Besluttet av Anders 22.09.2026 — se [beslutninger.md](../../.claude/rules/beslutninger.md)
§TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK.

## Hva som gjelder

| | |
|---|---|
| Skrift, overskrift | Jost, vekt 300, versaler, sperret |
| Skrift, brødtekst | Lato |
| Skrift, tall og etiketter | IBM Plex Mono |
| Hjørner | Myke kort med radius, runde avatarer og piller tillatt (overstyrt 19.10, beslutninger.md §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ») |
| Skygger | lagdelte navy-skygger på kort, slik `docs/design-system/utkast-tn/nye-veier.html` retning 1 viser |
| Navy | `#012B5D` |
| Rød | `#D70232` — målt fra logofilen. Identitet og frist, **aldri** status |
| Sidemeny | alltid navy, hvit tekst, rød markør foran aktiv rad. Ingen hvite streker inni |
| Avatar | rund (19.10) |

Verdiene i koden bor i [`src/styles/team-norway-tokens.css`](../../src/styles/team-norway-tokens.css),
lest fra TS gjennom [`src/lib/v2/team-norway.ts`](../../src/lib/v2/team-norway.ts) (`TN`).

## Hvor det gamle ble av

`designsystem/team-norway/` er Claw-speilet. Det er **funksjonsinventar og historikk**
— skjermregister TN-00–TN-21, datamodell, tilgangsmatrise og åpne beslutninger gjelder
uendret. Utseendet der gjør det ikke.

## Automatiske jobber

Ingen. Speilet oppdateres ikke automatisk; prosjektet i Claude Design er kilden.
