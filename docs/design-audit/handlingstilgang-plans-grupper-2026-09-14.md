# R-I fortsettelse — admin/plans og admin/grupper søskentester 14.09.2026

Gren: `codex/etter-r-c-merge-2026-09-14`, oppå main `0fd4e593d`. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Målt 13.–14.09: 56 filer med `"use server"` og eksporterte handlinger under `src/app/admin`, 50 av dem uten søskentestfil. Dette er samme kjente gap som `handlingstilgang-bred-2026-09-12.md` («Øvrige skrivehandlinger uten søskentest, inkludert … admin-mutasjoner») og masterplanens R-I-rad. Ikke alle 50 er sikkerhetshull — de fleste er allerede korrekt portvokta i koden (bekreftet ved manuell lesing av flere høyrisiko-kandidater før noe ble skrevet), men mangler regresjonstest som ville fanget en fremtidig fjernet vakt.

## Hva som er gjort

To av de høyest-risiko filene (mutasjoner nøkkelbundet til en spesifikk spiller-/gruppe-id fra klienten) fikk fulle avvisningstestsuiter, matchende det etablerte mønsteret fra tidligere R-I-arbeid (`node:test` + `mock.module`):

- **`src/app/admin/plans/[planId]/actions.ts`** — 22 tester, dekker alle 16 eksporterte handlinger (flytt/send/godkjenn/marker-utkast/pause/gjenoppta/avslutt/marker-fullført/vurder-effekt/kanseller/arkiver/slett/oppdater/tilbakemelding/kopier/legg-til-økt/lagre-som-mal/tildel). Hver handling avviser en coach uten stalltilgang til spilleren planen eller økten tilhører, og skriver ingenting. `slettPlan` er ADMIN-only, bekreftet at en vanlig coach avvises. `assignPlanToPlayers` bekreftet at den hopper over mottakere coachen ikke har tilgang til (delvis suksess, ikke stille feil).
- **`src/app/admin/grupper/[id]/actions.ts`** — 9 tester for `eierGruppen`-porten (hovedtrener ELLER aktivt COACH-medlem, ikke bare rolle COACH): legg til/fjern medlem, inviter, opprett/dupliser gruppetime. Inkluderer at en gruppetime ikke kan dupliseres FRA en annen coachs gruppe inn i egen, selv når coachen eier mottakergruppen.

Ingen produksjonskode i disse to filene ble endret — begge var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- `npx tsc --noEmit`: grønt for begge filene
- `npx eslint`: grønt, ingen advarsler
- Begge testfilene kjørt isolert: 22/22 og 9/9 bestått
- Full `npm test`: 2732 tester bestått (opp fra 2701), 0 feil, 260 suiter
- Full `npm run verify`: grønt — typesjekk, lint, alle designvakter, prosjektkontroll, produksjonsbygg og Serwist

## Gjenstår

48 admin-mutasjonsfiler (av de opprinnelig 50) mangler fortsatt søskentest. Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen — det krever samme manuelle lesing per fil som `plans`/`grupper` fikk her. Portal- og component-mutasjoner (`src/lib`, `src/components`) utenfor `src/app/admin` er ikke talt i denne omgangen.

## Ikke påstått

- At de øvrige 48 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse to filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
