---
name: ak-personvern
description: >
  Bruk ALLTID ved endring som rører persondata, brukere, barn, samtykke, forelder,
  eksport, sletting, logger, e-post, AI-prompts, TrackMan, helse, video, booking,
  Stripe-kunde, GDPR, barnevern, WANG-elever, åpne stats-sider, eller før commit
  av kode i src/ eller prisma/. Personvernvakt for AK Golf HQ.
metadata:
  version: "1"
  reviewed: "2026-09-12"
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Juridiske konklusjoner tas av Anders/jurist, ikke av agenten.

# AK personvern

Dette er en app med juniorer, foreldre, helsefelt og betaling. Persondata skal ikke havne i Git, i en sky-prompt eller på en åpen side.

Les denne før du skriver kode som rører mennesker. Hva som lagres hvor står i [datakartet](../../../docs/gdpr/datakart.md). Hva koden faktisk kan i dag står i [rettighetsstatus](../../../docs/gdpr/rettigheter-status.md). Ikke behandle «AVKLAR»-punkter som ferdig funksjon.

## Tre spørsmål før du lagrer

1. Kan en innlogget bruker se eller endre noe som ikke er deres?
2. Kommer persondata eller hemmeligheter ut i nettleser, logg, Git eller en ekstern AI?
3. Er barn, samtykke, sletting eller åpne sider berørt — og er det i tråd med reglene under?

## Barn og åpne sider

- Under 16 år krever foreldresamtykke (`src/lib/auth/minor.ts`, GDPR art. 8). Spilleren sendes til `/auth/samtykke-venter` til samtykke er gitt (`requirePortalUser`).
- Åpne flater: spillere født 2008 eller senere vises aldri. Mangler fødselsår → vises ikke, unntatt DataGolf-proffer. Fasit: `src/lib/stats/offentlig-spiller.ts`. Ikke bygg en ny åpen liste uten dette filteret.
- `/stats/aargang` er bak innlogging fordi den teller nettopp de kullene barnevern-regelen stenger (`src/proxy.ts`).
- `/team-wang` uten innlogging viser ikke elevnavn. Roster med navn ligger bak `/team-wang/coach` **og** `requirePortalUser`. Ikke vis navn, e-post, bilde eller initialer knyttet til én elev på den åpne siden.

## Samtykke og deling

- Forelder godkjenner for mindreårige. Deling til WANG/Team Norway går gjennom `src/lib/auth/ekstern-leser-scope.ts`: aktiv gruppe + aktivt medlemskap + gyldig samtykke. Mindreårige krever FORESATT-rad.
- Ekstern leser får tester/statistikk etter samtykke — aldri plan, notater eller helse via den stien.
- Helse og skade er særlig kategori. Ikke utvid de feltene, og ikke send dem til AI, uten at Anders har bestilt det.

## Data ut av huset

- Ekte navn, e-post, telefon, fødselsdato eller elevlister skal aldri inn i sky-prompts, issue-tekst, commit-meldinger eller offentlig Git. Bruk syntetiske testdata.
- AI (Caddie, Jarvis, visjon, transkripsjon) får minimalt nødvendig underlag. En parameter som ikke kan leses, er `null` — aldri et gjett tall (TruthLayer).
- Logger: ingen persondata i klartekst. `ErrorLog` skal ikke få stack med tokens eller request-body.
- Seed, import, betaling, e-post og databaseendringer er ikke del av en dokumentkontroll.

## Innsyn og sletting

Eksport og sletting finnes delvis. [Rettighetsstatus](../../../docs/gdpr/rettigheter-status.md) lister hullene. Ikke lov i UI eller e-post at «all data følger med» hvis koden ikke tar den med.

Kjent og uendret uten ny bestilling:

- Eksporten mangler blant annet coach-notater, flere meldinger, video/lyd-filer og abonnement.
- Soft-slett sletter ikke Supabase Auth-brukeren, Storage-filer eller Stripe-kunden.
- Foresattes slettekrav har ingen admin-kø.
- Gjeste-bookinger (navn/e-post/telefon uten konto) har ingen slette-vei.
- Betalingsrader beholdes etter bokføringsloven (`userId` settes null).

Ny lagring av persondata krever at datakartet oppdateres i samme arbeid, og at det finnes en vei til innsyn/sletting eller et bevisst, dokumentert unntak.

## Tester

Kun fiktive personer. Demo-navn i UI: spiller Øyvind Rohjan, coach Anders Kristiansen. Ikke kopier ekte elever fra WANG, GFGK eller Academy inn i fixtures.

## Når du ikke skal overdrive

Ren visuell justering uten nye felt, logger eller åpne lister: still likevel spørsmål 2 hvis `src/` eller `prisma/` er rørt.

Ikke finn opp juss. Ikke «fiks GDPR» ved å slette revisjonsspor eller betalingsrader. Sikkerhetsvakten er [ak-sikkerhet](../ak-sikkerhet/SKILL.md).
