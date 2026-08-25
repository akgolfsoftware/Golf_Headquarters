# Gap-måling: designfasit vs. designbriefen (fase 2.2)

> **PÅ VENT 25.08.2026 (D6 + Train-lock):** Gap-målingen under er mot Paper-fasiten, som nå er
> historikk — Train-lock er designfasit for alle PlayerHQ/AgencyOS-skjermer. Målingen må gjøres
> på nytt mot Train-lock-fasiten når den er levert (LAUNCH-PLAN D3) og D6 er avklart.

Målt 20.08.2026 mot `designsystem/paper/` (speilet, zip 16.08) og
Claude Design-prosjektet `605a48cc` via MCP.

**Funnet endrer fase 2.** Planen (`docs/plan-treningsplanlegging-til-kode-2026-08-20.md`
§Fase 2) lister åtte skjermer som skal tegnes, formulert som om alle åtte er nye.
Seks av dem har allerede fasit — delvis. Jobben er derfor **utvid seks, tegn to**,
ikke «tegn åtte». Tegnes de åtte fra bunnen, får vi duplikat-fasit for de seks, og
da har vi to sannheter om samme skjerm — nøyaktig det `CLAUDE.md` §Skjermarbeid
forbyr.

Dette er samme felle som er logget før: en plan sier «klar/mangler», og koden eller
fasiten sier noe annet. Mål alltid før du bygger en rad planen kaller ny.

## Tabellen

| # | Skjerm i briefen | Eksisterende fasit | Status | Gap |
|---|---|---|---|---|
| 1 | Workbench-kalender | `fase1/workbench-mobil.html` (1677 l) · `fase1/workbench-desktop.html` (2443 l) | UTVID | Har periode, blokk, gruppemerking. **Årstidslinjen mangler i begge.** Skall-økter finnes kun på desktop, ikke mobil. |
| 2 | Periodemal-flyten | ingen | **NY** | Hele flyten: antall økter per pyramide → skall-økter i kalenderen → køen av ufylte. |
| 3 | Økt-editoren | `fase2/playerhq/playerhq-okt-detalj.html` (494 l) | UTVID | Har motorikk/belastning/press, men er en **visning, ikke en editor**. Mangler redigering og den ene teknikk-dimensjonen. |
| 4 | Teknisk utviklingsplan | `fase2/playerhq/playerhq-teknisk-plan.html` (319 l) | UTVID | Har P-posisjoner og TrackMan. **Mangler målmatrisen (rep-mål per motorikk-trinn × kontekst), rep-tellingen, og statusrapporten med spredning i tre kontekster.** |
| 5 | Live-økta | `fase1/playerhq-live-okt.html` (700 l) · `fase1/playerhq-live-summary.html` (586 l) | UTVID | Har pausehåndtering og notat. Mangler **+5/+10/+25**, FYS-serielogging (reps + vekt), kondisjon per sone-segment, spontan drill. Oppsummeringen mangler **de tre stjernradene** (fokus/gjennomføring/mestring) og total pausetid. |
| 6 | Gruppeplanlegging | `fase2/agencyos/agencyos-gruppe-detalj.html` (192 l) | UTVID | Har kalenderkobling. Mangler «denne økta blir nå din egen»-setningen og hovedcoach. |
| 7 | Spillerprofilen | `fase1/spillerprofil.html` (822 l) · `fase2/playerhq/playerhq-profil.html` (107 l) | UTVID | Har teknisk plan. **Mangler «hvem ser deg» med navngitte trenere og utmelding, testhistorikk, og gruppene.** To filer for samme flate — avklar hvilken som er malen før utvidelse. |
| 8 | Standard/Tour + onboarding | ingen | **NY** | Bryteren i innstillinger + onboarding-tillegget (treningstid, fasiliteter med fysiske mål). |

## Konsekvens for rekkefølgen

Skjerm 2 (periodemal-flyten) bør tegnes først. Den produserer skall-øktene, som er
det skjerm 1 mangler visning for på mobil — å tegne kalenderutvidelsen før flyten
som fyller den, er å tegne beholderen før innholdet er bestemt.

Skjerm 7 har en åpen avklaring før arbeid: `fase1/spillerprofil.html` (822 l) og
`fase2/playerhq/playerhq-profil.html` (107 l) dekker samme flate. Én av dem er malen;
den andre må enten bli en variant eller utgå. Ikke utvid begge.

## Metode

Målingen er gjort med søk etter briefens egne nøkkelbegreper i hver kandidatfil
(årstidslinje, målmatrise, +25, sone, «hvem ser deg», hovedcoach osv.). Det er en
grov måling: den finner om begrepet er tegnet, ikke om det er tegnet *godt*. Før
hver enkelt utvidelse må skjermen åpnes og leses — men da vet man i det minste at
det er en utvidelse og ikke en ny skjerm.
