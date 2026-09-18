# Løp — Team Norway piksel-identisk med Claw-filen

Du er i `/workspace`. Fasit: `/tmp/claw-tn1` (Claw Design — Team Norway Golf). Plan: `docs/TN-PAR-PLAN.md`. Status: `docs/TN-PIXEL-STATUS.md`.

## Mål

Alle skjermer under `/team-norway` er **identiske med artboardet i zip-filen** (SUCCESS 1440 for trener, SUCCESS 390 for spiller). Løpet er ferdig når status-tabellen er IDENTISK på alle rader og testene under er grønne.

Ikke spør brukeren. Ikke vent. Ikke stopp etter én skjerm. AgencyOS/WANG/FYS er utenfor.

## Per runde (én eller flere skjermer, aldri tom runde)

1. Les `docs/TN-PIXEL-STATUS.md`. Ta første rad som ikke er IDENTISK.
2. Fasit-HTML ligger i `src/components/tn/frames/{id}.html` og `{id}-390.html` (+ tom/laster/feil). Hvis mangler: trekk ut fra `/tmp/claw-tn1/templates/tn-*` (første `width:1440px` / `width:390px` SUCCESS).
3. Port/hydratér mot Claw-tokens (`src/components/tn/ds`). Logo `/tn/team-norway-golf.png`. Navy `#012B5D`, rød `#D70232` kun merke. Rail 252. Øyvind Royan / Kari Royan i `src/lib/tn/demo.ts`.
4. SP/FO: 390-ramme via `frameCandidates` + `PLAYER_NAV_GROUPS`. SP lander på `iup`, ikke trener-oversikt. FO ≠ Live.
5. `npx tsc --noEmit`. `node --experimental-strip-types --test src/components/tn/frame-key.test.ts src/components/tn/hydrate.test.ts src/lib/tn/access.test.ts`.
6. Oppdater status-rad til IDENTISK kun hvis: ingen `{{ }}`, ingen `sc-for`, logo-sti, Øyvind på spillerlister, riktig ramme 1440/390.
7. Neste rad. Hvis alle IDENTISK: skriv `LØP FERDIG` øverst i status-filen og gjør ingenting mer.

## Forbud

Mørk+gull, krem, Agency-sand, WANG-teal, «elev», session, kortspill, rekonstruert logo, innerHTML av hele dokumentasjons-canvas (kun artboardet).
