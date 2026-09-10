# AK Golf HQ — Agent Brief

Les dette før du endrer filer. [START-HER.md](../../START-HER.md) er inngangen. [AGENTS.md](../../AGENTS.md) eier felles arbeidsregler; denne filen eier det tekniske oversiktskartet.

## Produkt og nåsituasjon

AK Golf HQ samler offentlig nettsted, coachingbooking, PlayerHQ og AgencyOS i én app. Forelder, WANG, GFGK, Team Norway og personlige arbeidsflater ligger også i samme prosjekt. Målet er en komplett app før åpen lansering med booking og betaling; endelig omfang er ikke låst.

[Status nå](../STATUS-NÅ.md) skiller kode, tester, visuell godkjenning og produksjonsbevis. Eldre «ferdig»-markeringer er ikke et lanseringsvedtak.

## Kilder og ansvar

| Spørsmål | Kilde |
|---|---|
| Hva skal produktet gjøre? | [Nordstjernen](NORDSTJERNE.md), [produktreglene](BUSINESS-RULES.md) |
| Hva betyr treningsbegrepene? | [Treningsfaglig fasit](../FASIT-AK-GOLF-HQ.md), ordbøkene via [dokumentoversikten](../README.md) |
| Hvordan skal skjermen se ut? | [Designarbeid og referanser](../../designsystem/README.md); alle skjermer revideres i Claude Design, og eksisterende design er ikke låst |
| Hva gjør funksjonen faktisk? | Koden, testene og en målt kundereise |
| Hva gjenstår? | [Arbeidslisten](../MASTERPLAN-GJENSTAAENDE.md) |
| Hvor ligger en fil? | [Prosjektkart](../vedlikehold/prosjektkart.md) og det genererte filregisteret |

## Teknisk grunnlag

Next.js App Router, React, TypeScript, Prisma, Supabase og Tailwind CSS. Eksakte installerte versjoner eies av `package-lock.json`; støttede intervaller og kommandoer av `package.json`. Node-versjonen står i `.nvmrc`. Testene bruker `node:test` med `tsx`, samt Playwright i nettleser.

Les den installerte Next.js-dokumentasjonen i `node_modules/next/dist/docs/` før Next-spesifikke endringer. Ikke oppgrader rammeverk som del av dokumentopprydding.

## Kodekart

| Område | Hvor |
|---|---|
| Ruter, lastetilstander, feil og server actions | `src/app/` |
| Grunnkomponenter | `src/components/ui/`, `src/components/v2/` |
| Produktkomponenter | `src/components/admin/`, `portal/`, `marketing/`, `forelder/`, `workbench/` og øvrige funksjonsmapper |
| Domene og beregninger | `src/lib/domain/` |
| Workbench-planlegging | `src/lib/domain/workbench/`, `src/lib/workbench/wb-actions.ts` |
| Tilgang | `src/lib/auth/`, `src/lib/feature-flags.ts`, `src/proxy.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/`, `prisma.config.ts`, `src/lib/prisma.ts` |
| Autentisering og lagring | `src/lib/supabase/` |
| Design i appen | `src/styles/`, `src/lib/v2/`, `src/app/globals.css` |
| Generert databaseklient | `src/generated/` — regenereres, ikke håndredigeres |
| Personlig ME-database | `supabase-meg/` — separat skjema, ikke del av appens Prisma-migrasjoner |
| Tester | tester ved koden i `src/`, samt `tests/` |
| Verktøy | [scripts/README.md](../../scripts/README.md) |

Gamle `v2`, `legacy` og `athletic`-navn betyr ikke automatisk at en fil kan slettes. Kontroller innkommende importer og rutebruk. Mapper med aktive avhengigheter beholdes inntil en konkret funksjon er erstattet og testet.

## Viktige tekniske grenser

- Flere øktmodeller eksisterer samtidig. Workbench, TrainingSessionV2 og TrainingPlanSession skal ikke slås sammen som opprydding. Samsvar mellom dem må testes i den aktuelle spillerreisen.
- `prisma.config.ts` laster lokal miljøkonfigurasjon. Generering av klient er noe annet enn å endre databasen. Ikke kjør data- eller skjemaskript for å få en dokumentkontroll grønn.
- Migrasjonshistorikken er ufullstendig for en tom database. Følg [fallgruvene](../../.claude/rules/gotchas.md); en separat test-VM har [egen oppskrift](../utvikling/lokal-testdatabase.md).
- `next.config.ts` bruker `withMDX(nextConfig)`. Service worker bygges separat med Serwist i `npm run build`. Bevar de faktiske kommandoene og eksportene.
- Betalings- og e-postintegrasjoner må prøves gjennom hele flyten før åpen lansering. Eksisterende kode er ikke dokumentasjon på et vellykket kjøp.
- Verken kodebasert auth-kontroll eller en RLS-migrasjonsfil beviser at en coach bare kan endre sine egne spillere. Test tillatte og avviste tilfeller.

## Arbeid og kontroll

`npm run prosjekt:sjekk` kontrollerer dokumentasjon og struktur. `npm run verify` og `npm test` er kodekontrollene. Se [testveiledningen](../testing.md) og [visuell rigg](../../tests/visual/README.md). Dokumenter datagrunnlag og begrensninger når du rapporterer resultater.
