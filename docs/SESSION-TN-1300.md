# Session — Team Norway demo 18.09.2026 kl. 13:00 CEST

**Mål:** `/team-norway` ser ut som Claw, ikke som stubben (mørk+gull er FEIL).
**Ikke:** Agency Workbench-serie, FYS, merkevare-brev, GolfBox-API, WANG.

Claw-zip: `/workspace/attachments/Claw Design — Team Norway Golf.zip`
Pakk til `/tmp/claw-tn`. Tokens: `tokens/colors.css`. Logo: `assets/logo/team-norway-golf.png`.
Fasit-HTML: `templates/tn-*/`. Register: `handover/SKJERMREGISTER.md`.

## Farge (målt fra logo — ikke finn på)

Navy 900 `#012B5D` · 700 `#033C7A` · 600 `#0A5199` · 100 `#E3ECF6`
Rød 600 `#D70232` (identitet, aldri status) · 700 `#A80126` · 100 `#FCE3E8`
Rail **252px** (rett fra Claw). Rød er merke, amber er advarsel.

## Demo-sti kl. 13 (må virke på 1440 og 390)

1. `/team-norway?skjerm=oversikt&rolle=SS` — TN-02 dekningstall, ikke tom h1
2. Stall / workdesk — TN-00 tre rammer (hjem, liste, ark) minst liste + ett ark
3. `/team-norway?skjerm=tilgang&rolle=SS` — TN-18 tabell trenere
4. Gruppeposter — TN-09 tidslinje
5. Rolle FO + Live → setning «Foresatt har ikke tilgang til Live»
6. Logo fra zip i rail. Ingen Agency-sand som sidens bakgrunn. Ingen WANG-teal.

## Utenfor 13:00 (ikke start)

TN-03…08, 11–17, 19–21, IUP, college. Stub-lenke «kommer» er ok.

## Rekkefølge (én chunk om gangen)

| # | Hva | Fasit-fil |
|---|---|---|
| 1 | Pakk zip. `src/styles` eller `src/components/tn/tn.css` fra Claw tokens. Kopier logo til `public/tn/` | tokens/* |
| 2 | Skriv om `tn/shell.tsx` mot `templates/tn-skall/TnSkall.dc.html` + mobil | TN-01 |
| 3 | Typer: skjermer oversikt, stall, poster, tilgang, uke, live. Roller SS TR HJ SP FO | |
| 4 | Oversikt mot `tn-oversikt/TnOversikt.dc.html` + mobil | TN-02 |
| 5 | Stall mot workdesk-batch | TN-00 |
| 6 | Tilgang mot `tn-trenere-tilgang` | TN-18 |
| 7 | Poster mot `tn-gruppeposter` | TN-09 |
| 8 | FO≠Live, tom/laster/feil på de fem via `?tilstand=` |
| 9 | `tsc --noEmit`. Screenshot 1440+390 av oversikt+tilgang. Rute i produktlenker. |

Port **HTML-fasit → React**. Ikke restyle stubben. Dummy-data syntetisk (Mina, Iver, Nora).

Kl. 12:40: stopp nye skjermer, kun demo-sti + screenshot.

STATUS: skjerm N av 5 demo | avvik mot fasit | 1440/390 | FORTSETT|DEMO-KLAR
