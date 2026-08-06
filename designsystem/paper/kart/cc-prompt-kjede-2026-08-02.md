# Prompt-kjede for Claude Code — port av AK Golf HQ

Denne fila inneholder **prompten du limer inn i en ny Claude Code-session**.
Hver session avslutter med å skrive neste prompt. Du kopierer den videre,
starter ny session, limer inn. Ingen session trenger å vite hva den forrige
gjorde utover det som står i prompten.

**Start her.** Alt mellom linjene under limes inn i en ny Claude Code-session
i `~/Developer/akgolf-hq`.

---
---

Du er inne i `~/Developer/akgolf-hq`. Verifiser med `git remote -v` før du
gjør noe annet.

## Hva dette er

AK Golf HQ skal få designet fra et ferdig designsystem portet inn. Designet
finnes som fasit i Claude Design-prosjekt `605a48cc` — du har ikke tilgang
dit, og trenger det ikke. Alt du trenger står i denne prompten.

Dette er session 1 av en kjede. Din jobb er **kartlegging**. Du skriver
ingen skjermer i dag.

## Kildene utenfor repoet

**Supabase (produksjon):** prosjekt `Golf_Headquarters` · `dcnxoztjtdqoidaekxry`
· region eu-west-2. Dette er basen appen kjører mot.

**Designbiblioteket** består av to ting som må holdes fra hverandre:

- `components/` — 78 React-komponenter, ferdig `@layer`-migrerte, med
  `akhq-base` / `akhq-container` / `akhq-modifier` som kaskadelag. Disse
  **flyttes** inn i appen tilnærmet som de er.
- `fase1/` — 19 statiske HTML-flater med demo-data hardkodet. Disse er
  **fasit, ikke kilde**. Skjermene bygges på nytt i appen med ekte data, og
  HTML-fila er dommen over resultatet.

Blander du de to, ender du med å kopiere demo-data inn i appen.

## Tilstanden i basen — målt 02.08.2026

Fire kolonner ble lagt på `service_types` direkte i basen, utenom Prisma:

| Kolonne | Type | Null | Standard |
|---|---|---|---|
| `billingInterval` | text | NEI | `'ONE_TIME'` |
| `sessionsPerPeriod` | integer | JA | — |
| `includesPlayerHq` | boolean | NEI | `false` |
| `rolloverUnused` | boolean | NEI | `false` |

Pluss tre CHECK-constraints: `service_types_billing_interval_check`,
`service_types_sessions_per_period_check`, `service_types_max_deltakere_check`.

**`schema.prisma` vet ikke om noen av dem.** Neste `prisma migrate dev` vil
foreslå å slette dem. Det er ikke en risiko, det er standard oppførsel. Ikke
kjør `prisma migrate dev` i denne sessionen.

Radtall som styrer rekkefølgen senere:

```
users 28 · service_types 10 aktive · locations 4 (2 aktive) · coach_availability 13
bookings 6 · payments 11 · subscriptions 0 · parent_relations 0
helse_samtykker 0 · lyd_samtykker 1 · tournaments 447 · tournament_entries 6
training_periods 5 · agent_runs 3182
```

`AiModel`, `RoutingRule`, `AiPrompt` og `AiCost` finnes ikke som tabeller.

## Din oppgave i denne sessionen

Kartlegg repoet. Ingen kodeendringer. Svar på fem spørsmål med målte funn,
ikke antakelser:

1. **Ruter.** List alt under `src/app/`. Hvilke ruter finnes, og hvilke av
   disse 19 fasitflatene har allerede en rute?

   ```
   innlogging · foreldreportal · booking · playerhq-booking · playerhq-meg
   playerhq-plan · playerhq-chat-desktop · playerhq-chat-mobil
   playerhq-analyse · agencyos-konsoll-desktop · agencyos-konsoll-mobil
   agencyos-innboks · agencyos-innboks-mobil · agencyos-innstillinger
   agencyos-agenticos · agencyos-okonomi · workbench-desktop
   workbench-mobil · workbench-turnering · fangstsheet
   ```

2. **Stilsystem.** Finnes `akhq-tokens.css` i repoet? Bruker appen Tailwind,
   CSS-moduler, styled-components eller noe annet? Finnes det CSS-variabler
   med andre navn som gjør samme jobb (`--bg`, `--fg`, `--accent`)?

3. **Komponenter.** Er noen av de 78 komponentene allerede inne? Bruker
   appen shadcn/ui eller et annet bibliotek? Tell hvor mange egne
   UI-komponenter som finnes i dag.

4. **Datahenting.** Server Components med Prisma direkte, API-ruter under
   `src/app/api/`, eller Supabase-klient i nettleseren? Gi ett konkret
   eksempel fra en eksisterende side.

5. **Nav.** Finnes `/admin/agencyos` med en navigasjonsstruktur fra før?
   Hvilke punkter?

## Regler som gjelder hele kjeden

- **Mål, ikke anta.** Hvert tall du oppgir skal komme fra en kommando du har
  kjørt. Skriver du et tall du ikke har målt, merk det `[anslag]`.
- **Ingen oppdiktede data.** Finner du ikke noe, skriv at det mangler. Et
  plausibelt tall er verre enn et tomt felt — det blir trodd.
- **Ikke kjør `prisma migrate dev`** i denne sessionen.
- **Ikke start porting.** Fase 0 er kartlegging. Rekkefølgen i planen kan
  snu på funnene dine.

## Hvordan du avslutter

Skriv to ting, i denne rekkefølgen:

**A. Funnrapport** — lagre som `docs/port/fase0-kartlegging.md` i repoet.
Fem spørsmål, fem svar, med kommandoene du kjørte. Pluss en tabell med 19
rader: flate · finnes ruten · bruker tokens · bruker biblioteket · datakilde OK.

**B. Neste prompt** — skriv ut en komplett, selvstendig prompt for neste
session, i en kodeblokk merket `NESTE PROMPT`. Den skal:

- kunne limes rett inn i en tom session uten at brukeren forklarer noe
- inneholde de funnene fra i dag som neste session trenger, skrevet ut —
  ikke som «se forrige rapport»
- ha én konkret oppgave, ikke flere
- gjenta reglene over
- selv avslutte med krav om å skrive neste prompt

Neste oppgave er normalt **Fase 1.1: tokens inn som eneste kilde**. Fant du
et konkurrerende stilsystem i spørsmål 2, skal neste prompt i stedet være
beslutningen om hva som skal skje med det — og du skriver hvorfor.

Hold neste prompt under 200 linjer. Poenget med kjeden er at hver session
starter tom.

---
---

## Slik bruker du kjeden

1. Lim inn prompten over i en ny Claude Code-session
2. Sessionen kartlegger og skriver `docs/port/fase0-kartlegging.md`
3. Den avslutter med en `NESTE PROMPT`-blokk
4. Du kopierer blokken, starter **ny** session, limer inn
5. Gjenta

Hver session starter uten historikk. Det er hele poenget — konteksten bæres
av prompten, ikke av samtalen.

**Kom tilbake hit** når en session sier noe som ikke stemmer med planen, når
en beslutning må tas som ikke er kode, eller når en fasitflate må endres.
