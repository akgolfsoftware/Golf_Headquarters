# Skjermkontroll 15.–16.10.2026

Bestilt av Anders 15.10: «sjekk alle skjermer og gi meg faktiske screen shots». Skjermbildene ligger i en privat side på claude.ai og er ikke lagt i Git. Her står bare funnene og rekkefølgen for retting. Ingen kode er rettet i denne runden.

## Slik ble det målt

- Appen kjørte lokalt (`next dev`, vedlikeholdsmodus av) mot den ekte databasen. Grenen var main fra 16.10 morgen, pluss PR #1347 (demokontoene).
- Playwright logget inn som spiller (`screentest@akgolf.test`), coach (`coachtest@akgolf.test`, ADMIN), forelder (`screentest-parent@akgolf.test`), uinnlogget, og de nye demokontoene `demo@wang.no` og `demo@golfforbundet.no`.
- Rutene kom fra `docs/design-system/skjermregister.csv`. Med: tegnede skjermtyper og felles mønstre. Ikke med: videresendinger og interne demoer. Dynamiske ruter ble fulgt fra lenker på andre sider.
- Hver side ble lastet én gang og fotografert i 1280 og 390 px. Målingene: sidelengs rulling (`scrollWidth > clientWidth` og elementer utenfor rammen), feilside, HTTP-status, konsollfeil, nettverksfeil, bakgrunnens lyshet og skrift.
- 269 skjermer har bilde i begge bredder. 33 dynamiske ruter fant ingen lenke å følge (listet nederst).
- Persondata: navn og e-post på ekte brukere ble byttet ut med «Spiller Anonym» og «epost@skjult» i siden før bildet ble tatt. AgencyOS-bildene er ikke sett gjennom av Claude, for å holde persondata unna. Anders må se dem selv.
- Lastetid er målt fra lokal maskin mot databasen i London og er ikke representativ for produksjon.

## Funn, sortert etter alvor

### Kritisk

1. **Hele Team Norway krasjer.** Alle 21 trenersider under `/team-norway` viser «Siden kunne ikke hentes». Årsaken er at sidemenyen `TnRail` kaller `initialer()` fra serveren, men funksjonen ligger i en klientfil (`src/components/team-norway/tn-shell.tsx:228` og `:327`, importert fra `./rail-mobil`). Feilen finnes i main og rammer alle brukere, ikke bare demokontoen. De dynamiske TN-sidene (spiller, samling, protokoll og så videre) kunne derfor ikke kontrolleres.

### Høy

2. **To offentlige statistikksider gir serverfeil (500).** `/stats/blogg/norske-17-aringer-og-putt` (en funksjon sendes til en klientkomponent) og `/stats/turneringer/gjg-season-kickoff-wagr-268281` (`onMouseEnter` på et element fra serveren).
3. **Lastesidene blokkeres av sikkerhetsregelen (CSP).** `loading.tsx` importerer klientskall (`PlayerHQSkall` og andre `"use client"`-moduler), som bryter fallgruven i `.claude/rules/gotchas.md`. Sett på `/portal/planlegge`, `/portal/planlegge/workbench`, `/portal/varsler`, `/portal/tren/tester/team-norway`, `/portal/tren/fys-plan`, `/portal/mal/runder/ny`, `/admin/agencyos/live` og `/booking`. Vakten `tests/e2e/csp-konsoll.spec.ts` fanger det ikke.
4. **WANG «I dag» viser oppdiktede elever.** Trenersiden viser «Marius Olsen», «av 7 elever» og «112 mph» fra faste eksempeldata (`src/components/wang/wang-data.ts`), også for demogruppa, som har 11 spillere. Eksempeldata blandes med ekte data uten merking.
5. **Gammelt design igjen i PlayerHQ.** Disse sidene har den gamle flytende menylinja med mikrofonknapp, ofte i tillegg til den nye bunnmenyen: `/portal/ai/foresla-drill`, `/portal/ai/foresla-turnering`, `/portal/mal/sg-hub/equipment`, `/portal/meg/abonnement/avbestill`, `/portal/meg/feedback`, `/portal/meg/help`, `/portal/meg/help/kontakt`, `/portal/meg/innstillinger/sikkerhet`, `/portal/meg/innstillinger/sprak`, `/portal/meg/innstillinger/varsler`, `/portal/tren/turneringer`, `/portal/ukesdigest` og `/portal/utfordringer/ny`. Flere sider har også skråstilte overskrifter fra det gamle uttrykket: `/portal/meg/helse/symptom/ny`, `/portal/meg/sikkerhet/2fa`, `/portal/tren/tester/ny`, `/portal/trening/putte-laboratoriet` og `/portal/mal/sg-hub`.
6. **`/portal/tren/tester/team-norway` er helt uten stil.** Siden vises som en rå tekstliste.

### Middels

7. **Ordbruk som er vedtatt bort.** `/portal/meg/abonnement/avbestill` spør «Avbestille Pro?». Nivåene heter Gratis og Full (beslutning 30.09). `/forelder/okonomi` viser «FULL» som nivå.
8. **Kontaktsiden lover svar innen én virkedag.** `/kontakt` sier «Skjema · svar innen 1 virkedag» og «Vi svarer innen 1 virkedag». Beslutningen sier at dette ikke skal stå før Jarvis er i drift.
9. **Sidelengs rulling i 390 px.** `/stats/2026` (KPI-kort 227–425 px), `/stats/sammenlign-spillere` (søkefelt 329–502 px, siden 616 px bred) og `/admin/tester/benchmarks` (tekst 35–622 px). `/team-wang/skjermer` ruller ikke, men tabellen er så smal at kolonneteksten står loddrett.
10. **Mørkt tema der lyst er standard.** Hele `/stats` (30 sider), `/innsyn` (5 sider) og `/meg` er mørke. Precision Athletics har lyst som standard. Anders må avgjøre om `/stats` skal ha eget mørkt uttrykk.
11. **Forelder på mobil har bunnmeny.** `/forelder` viser fire faner nederst og «Mer» øverst. Beslutningen 23.09 sier hamburgermeny på mobil, som i AgencyOS og PlayerHQ. Bør sjekkes mot gjeldende tegning før endring.
12. **Hydreringsfeil.** `/admin/availability` har en knapp inni en knapp. `/portal/planlegge/workbench` har to elementer med samme nøkkel.
13. **Innboksen lenker til en profil som ikke finnes.** `/admin/innboks` lenker til `/admin/spillere/<id>` for en konto som ikke er spiller, og gir «Denne siden finnes ikke».

### Lav

14. `/portal/booking/bekreftet`, `/portal/booking/ny/bekreft` og `/forelder/bookinger/bekreftet` viser 404 når de åpnes uten booking. Det er rimelig, men 404-siden tilbyr «Logg inn på nytt» til en som allerede er innlogget.
15. WANG skoleplattform (`/team-wang/app/*` og `/team-wang/demo`) viser «midlertidig utilgjengelig» lokalt, fordi den egne WANG-databasen ikke er satt opp i `.env.local`. Det er ikke en feil i appen, men sidene kunne ikke kontrolleres.
16. Talent-sidene `/portal/talent/min-plan`, `mitt-niva`, `roadmap` og `sammenligning` finnes fortsatt. Beslutningen 28.09 sier at Talent «Min plan» og roadmap utgår.
17. Tregeste sider lokalt: `/portal` og `/admin/agencyos` brukte over 3 minutter første gang, `/innsyn` 163 sekunder, `/innsyn/talent/*` rundt 145 sekunder. Tallene er ikke produksjonstall, men viser hvilke sider som gjør mest databasearbeid.

### Kontrollert og i orden

- Data Golf er sperret for uinnlogget: `/stats/pga/*` sender til innlogging eller til `/stats`.
- Ingen andre sider ruller sidelengs i 390 px.
- All app-tekst bruker IBM Plex Sans, utenom WANG (Montserrat, eget system).
- Demokontoene ser bare demogruppene (PR #1347). Ingen av dem er medlem av en ekte gruppe, og demogruppene har bare syntetiske spillere og trenere.

## Forslag til rekkefølge for retting

1. Team Norway-krasjet (funn 1). Liten retting: flytt `initialer()` til en fil uten `"use client"`. Ta deretter skjermbildene av Team Norway på nytt, også de dynamiske sidene.
2. Serverfeilene i `/stats` (funn 2) og lastesidene som blokkeres (funn 3).
3. Gammelt design og siden uten stil i PlayerHQ (funn 5 og 6).
4. WANG-eksempeldata (funn 4). Merk dem eller fjern dem.
5. Ordbruk og løfter i tekst (funn 7 og 8).
6. Sidelengs rulling og hydreringsfeil (funn 9, 12 og 13).
7. Avklaringer med Anders: mørk `/stats` og forelder-menyen (funn 10 og 11), og om Talent-sidene skal bort (funn 16).

## Ikke kontrollert

Dynamiske ruter uten lenke å følge (33): `/auth/guardian-consent/[token]`, `/auth/lyd-samtykke/[token]`, `/inviter/forelder/[token]`, `/admin/agencyos/live/[sessionId]`, `/admin/agents/[agentId]`, `/admin/email-templates/[id]/rediger`, `/admin/gjennomfore/okter/[id]`, `/admin/grupper/[id]/arsplan/skoledata`, `/admin/plan-templates/[id]/rediger`, `/admin/spillere/[id]/plan/[planId]`, `/admin/spillere/[id]/turnering-kobling`, `/admin/tournaments/[id]`, `/admin/trackman/[sessionId]`, `/forelder/samtykke/deling/[childId]`, `/portal/venner/[spillerId]`, 14 dynamiske sider under `/team-norway` (blokkert av funn 1) og 4 under `/team-wang`.
