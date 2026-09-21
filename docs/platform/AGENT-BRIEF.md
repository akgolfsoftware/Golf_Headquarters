# AK Golf HQ — Agent Brief

Les dette før du endrer filer. [START-HER.md](../../START-HER.md) er inngangen. [AGENTS.md](../../AGENTS.md) eier felles arbeidsregler; denne filen eier det tekniske oversiktskartet.

## Produkt og nåsituasjon

Gjeldende visuell autoritet er [AK Golf Design System og «App design»](../design-system/design-autoritet.md).
Train-lock og Paper er utgående. Eldre navn i kode beskriver overgangstilstand, ikke ny designretning.

Aktiv Workbench-bestilling 20.09.2026: [overlevering og kildepakke](../workbench-handover.md)
og [gjeldende arbeidsplan](../planer/workbench-design-og-kode-natt-2026-09-20.md).
Lenker merket «historisk Git-versjon» bevarer fjernede dokumenter; de er ikke
nye kjøreordrer eller bevis på dagens status.

AK Golf HQ samler offentlig nettsted, coachingbooking, PlayerHQ og AgencyOS i én app. Forelder, WANG, GFGK, Team Norway og personlige arbeidsflater ligger også i samme prosjekt. Målet er en komplett app før åpen lansering med booking og betaling; endelig omfang er ikke låst.

[Status nå · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/b700ce0089a8bf48f6b269c9682af2373e696287/docs/STATUS-N%C3%85.md) skiller kode, tester, visuell godkjenning og produksjonsbevis. Eldre «ferdig»-markeringer er ikke et lanseringsvedtak.

## Kilder og ansvar

| Spørsmål | Kilde |
|---|---|
| Hva skal produktet gjøre? | [Nordstjernen](NORDSTJERNE.md), [produktreglene](BUSINESS-RULES.md) |
| Hvilket språk og hvilke begreper gjelder? | [Ordbok og språk](../ordbok.md) — eneste master |
| Hvordan planlegges trening? | [Treningsplanlegging](../treningsplanlegging.md) |
| Hvordan skal skjermen se ut? | [Gjeldende designautoritet](../design-system/design-autoritet.md), deretter [designarbeid og referanser](../../designsystem/README.md) |
| Hva gjør funksjonen faktisk? | Koden, testene og en målt kundereise |
| Hva gjenstår? | [Arbeidslisten · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/a235444b0f7287b0ce7270c28b32d34517711a2f/docs/MASTERPLAN-GJENSTAAENDE.md) |
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

- Flere øktmodeller eksisterer samtidig. Workbench, TrainingSessionV2 og TrainingPlanSession skal ikke slås sammen som opprydding. Samsvar mellom dem må testes i den aktuelle spillerreisen. Sammenslåingen av Workbench og TrainingPlanSession er bestilt som OW-3 (beslutning 15.09.2026) og følger [migreringsplanen · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/0df788be1e5e28934c2a6d2f6594eb6ceb96223b/docs/planer/ow-3-en-oekt-modell-2026-09-16.md) fase for fase; fase 1–2 er gjort.
- `prisma.config.ts` laster lokal miljøkonfigurasjon. Generering av klient er noe annet enn å endre databasen. Ikke kjør data- eller skjemaskript for å få en dokumentkontroll grønn.
- Migrasjonshistorikken er ufullstendig for en tom database. Følg [fallgruvene](../../.claude/rules/gotchas.md); en separat test-VM har [egen oppskrift](../utvikling/lokal-testdatabase.md).
- `next.config.ts` bruker `withMDX(nextConfig)`. Service worker bygges separat med Serwist i `npm run build`. Bevar de faktiske kommandoene og eksportene.
- Betalings- og e-postintegrasjoner må prøves gjennom hele flyten før åpen lansering. Eksisterende kode er ikke dokumentasjon på et vellykket kjøp.
- Verken kodebasert auth-kontroll eller en RLS-migrasjonsfil beviser at en coach bare kan endre sine egne spillere. Test tillatte og avviste tilfeller.

## Arbeid og kontroll

`npm run prosjekt:sjekk` kontrollerer dokumentasjon og struktur. `npm run verify` og `npm test` er kodekontrollene. Se [testveiledningen](../testing.md) og [visuell rigg](../../tests/visual/README.md). Dokumenter datagrunnlag og begrensninger når du rapporterer resultater.

Ved endring i innlogging, persondata, betaling, filer, logger eller AI: les [ak-sikkerhet](../../.claude/skills/ak-sikkerhet/SKILL.md) og [ak-personvern](../../.claude/skills/ak-personvern/SKILL.md) før du skriver kode.
