# Portering til AK Golf HQ · Claude Code · 04.10.2026

Fra 04.10.2026 porterer **Claude Code** skjermene fra dette designprosjektet til appen (`akgolfsoftware/Golf_Headquarters`, `main`). Claude Code tar over rollen Codex hadde. Grok brukes ikke. Claude Design (dette prosjektet) er fortsatt designkilde og prototype.

Spesifikasjon, datakontrakt og knapp–skjerm-kart: `overlevering/codex.md`. Filnavnet er beholdt for lenkenes skyld, og innholdet gjelder Claude Code.

## Faste regler
- Språk: `guidelines/treningsplanlegging-master.md` er fasit for all synlig tekst. Uavklart begrep → `status.md` › Språkspørsmål.
- Bare syntetiske data i prototyper og tester. Primærhandling grafitt `#141413`, rust `#9B2415` bare som signal.
- Bare PH-01 er visuelt godkjent. Alt annet er kandidat til Anders har sett det i appen.
- Gjenbruk eksisterende kode i `src/components/precision/` og `src/lib/`. Ingen ny komponent der en finnes.
- Ferdig = lagring, tilgang, feil, Tom/Laster/Feil, 390 px og desktop bevist i appkoden (Playwright), ikke bare i prototypen.
- Etter hver portering: oppdater `github.md` (Last sync, Screen map) og `status.md`.

## Arbeidsmåte per skjerm
1. Les prototypen (`ui_kits/playerhq/screens/*.jsx` eller `ui_kits/agencyos/screens/*.jsx`) og raden i `skjermliste.md`.
2. Finn ruten i `skjermliste.md` og eksisterende kode i repoet (søk på rute og skjerm-ID).
3. Port til Next.js App Router + Tailwind v4 + Precision-komponentene. Tokens fra `overlevering/tokens.css`.
4. Bygg alle fire tilstander og variantene i skjermlisten.
5. Kjør revisjonsreglene (`codex.md` §9 / `ui_kits/audit.html`) i Playwright.

## Porteringskø (rekkefølge)
| # | Oppgave | Kilde i designprosjektet | Merknad |
|---|---|---|---|
| 1 | Rydd utgåtte skjermer: AG-02 Kø, AG-17 Turneringer, PH-26 Utenfor banen. Gamle ruter videresender | `skjermliste.md` (utgår 28.09) | Bygget i repoet, men utgått |
| 2 | Oppdater repoets `docs/design-system/skjermliste-precision-athletics.md` og `skjermregister.csv` til IA 28.09 | `skjermliste.md` | Repoet har 26.09 |
| 3 | IUP-tilgang: IUP og innsyn automatisk når spilleren har PlayerHQ-profil og er i en WANG- eller Team Norway-gruppe. Skjules straks medlemskapet ender | `status.md` › Avgjørelser 04.10, `overlevering/overforing-wang-tn.md` | Erstatter «medlemskap alene gir ikke innsyn» |
| 4 | PH-IUP-01 Fireukerssjekk (+UNG, KO, LEVERT) | `ui_kits/playerhq/screens/PH-IUP.jsx`, `ui_kits/_shared/data-iup2027.js` | Spørsmål eksakt fra `kildemateriale/iup-2027-kilde-2026-10-01.json`, skala 1–5 |
| 5 | PH-IUP-02 Sesongevaluering (+LEVERT) | samme | Tiltak merket prosessmål → Målsetninger |
| 6 | PH-11-MAL-IUP IUP-måltall + rad i Workbench › Målsetninger | `PH-IUP.jsx`, `ui_kits/_shared/WB3.jsx` (`iupRow`) | 37 måltall, K1–K4 |
| 7 | PH-01: fireukerssjekk-kortet åpner PH-IUP-01; sesongkort uke 42 | `screens/PH-27.jsx` (Fireuker), `screens/PH-01.jsx` | Godkjent skjerm: kortets utseende uendret |
| 8 | PH-27 Deling: WANG/TN som «Gruppe», uten Trekk tilgang | `screens/PH-27.jsx`, `_shared/data-iup.js` | |
| 9 | AG-08-IUP til IUP 2027 | `ui_kits/agencyos/screens/AG-08-IUP.jsx` | Snitt per område, 2025 for seg |
| 10 | Kontroller PH-04–PH-25 i repoet mot prototypene | `ui_kits/playerhq/` | Bygget, ikke sammenlignet |
| 11 | Workbench, valgt retning A–D | `ui_kits/workbench-samlet/`, `codex.md` | Åpent produktvalg i `codex.md` skal ikke gjettes |

| 12 | Regi per spiller: merker Privat · GFGK · WANG · Team Norway (flere mulig) i AG-07-rader og AG-08-spillerkort, filter «Regi» i AG-07 Hele stallen | `ui_kits/agencyos/screens/AG-stall.jsx` (`Regi`), `AG-360.jsx`, `data-stall.js` (`regi`) | Kobles til gruppemedlemskap; WANG/TN styrer IUP |

## Utenfor omfang
- WANG- og Team Norway-trenerflatene bygges i egne prosjekter etter `overlevering/overforing-wang-tn.md`.
- Arkiverte prototyper (`arkiv/iup-komplett`, `arkiv/iup-excel`) er bare referanse.
