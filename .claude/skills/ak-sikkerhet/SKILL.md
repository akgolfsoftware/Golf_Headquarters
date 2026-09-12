---
name: ak-sikkerhet
description: >
  Bruk ALLTID ved endring i src/, prisma/, proxy.ts, vercel.json, server actions,
  API-ruter, innlogging, tilgang, betaling, Stripe, filopplasting, webhooks, cron,
  miljøvariabler, hemmeligheter, RLS, CSP, rate-limit, AI-chat, Caddie, Jarvis,
  eller før commit av kode. Sikkerhetsvakt for AK Golf HQ.
metadata:
  version: "1"
  reviewed: "2026-09-12"
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Produktregler vinner. Denne skillen eier sikkerhetsvakten i hver kodeendring.

# AK sikkerhet

Appen har innlogging, betaling og data om barn. En glipp her er ikke en stygg skjerm — det er at feil person ser eller endrer noens data.

Les denne ferdig før du skriver kode som rører de områdene over. Last deretter den eksterne detaljskillen som treffer. Ved konflikt vinner denne fila, `ak-personvern` og `AGENTS.md`.

## Tre spørsmål før du lagrer

1. Kan en innlogget bruker se eller endre noe som ikke er deres?
2. Kommer hemmeligheter eller persondata ut i nettleser, logg eller Git?
3. Er barn, samtykke, sletting eller åpne sider berørt — i tråd med `ak-personvern`?

Ubesvart spørsmål = ikke ferdig. Gjett aldri «det er sikkert».

## Lagene som faktisk stenger ute

`proxy.ts` er bare første port. Den er **ikke** nok alene.

| Lag | Hva det gjør | Hvor |
|---|---|---|
| Portvakt | Stopper uinnloggede på `/portal`, `/admin`, `/innsyn` | `src/proxy.ts` |
| Sidevakt | Sjekker innlogging, rolle, samtykke og tilgangsnivå på **hver** beskyttet side | `src/lib/auth/requirePortalUser.ts` |
| Handling | Server actions treffer **ikke** layout-vakten. Coach-handlinger bruker `requireCoachActionUser` / `coachAction` | `src/lib/auth/action-guards.ts` |
| Eierskap | Coach ser bare egne spillere | `coachScopedPlayerWhere` og `assertCoachTilgangTilSpiller` i `src/lib/auth/coached.ts` |
| Ekstern leser | WANG/TN-leser ser kun det spilleren (foresatt) har samtykket til | `src/lib/auth/ekstern-leser-scope.ts` |
| RLS | Database-sperre i tillegg til app-kode | `SECURITY.md`, `scripts/audit-rls.ts` |

Ny rute, ny action eller ny spørring med `userId`/`playerId` fra klienten: sjekk eierskap på **serveren**. Ikke stol på at menyen skjuler knappen.

## Fast regler

- Hemmeligheter bare i ignorerte `.env*`. Aldri `NEXT_PUBLIC_` på nøkler, Stripe-secret, database-url eller service role.
- All input til server actions og API valideres med zod. `as unknown as` på JSON fra Prisma er forbudt for forretningsdata.
- Betaling: Stripe-webhooken verifiserer signatur på rå body og tåler at Stripe sender samme hendelse to ganger. Fasit: `src/app/api/stripe/webhook/route.ts`.
- Cron og interne API-er bak `CRON_SECRET` eller tilsvarende, aldri åpne.
- Ikke logg e-post, telefon, fødselsdato, tokens eller hele request-body.
- Database: les `.claude/rules/gotchas.md`. Ikke `migrate dev`, `db push` eller `migrate deploy` mot den hostede basen.
- Ikke endre tilgangsregler, RLS eller `vercel.json` uten at Anders har bestilt akkurat den endringen.

## Når du laster hvilken ferdig skill

| Situasjon | Skill |
|---|---|
| Ny side, action, rute eller Next-mønster | `nextjs-security` |
| Input, innlogging, økt, avhengigheter | `security-and-hardening` |
| API-grense, ID i URL, «gi meg en annen brukers data» | `api-and-interface-design` |
| Prisma, SQL, RLS, indeks, spørring | `supabase-postgres-best-practices` |
| Stripe-kode | `stripe-webhook-security` og `stripe-docs` |
| Opplasting (bilde, video, TrackMan, vedlegg) | `file-upload-security` |
| Caddie, Jarvis, AI-chat, verktøy mot ekte data | `prompt-injection-defense` og `llm-app-security` |
| Nøkkel i Git eller mistanke om lekkasje | `secret-hygiene` |
| Bevisst gjennomgang av en diff | `security-review` |
| Før lansering eller stor flate | `web-security-review` |

## Når du ikke skal overdrive

Ren skjermtekst, farge eller layout uten data, innlogging eller nettverk: still likevel spørsmål 2 hvis diffen rører `src/`. Ikke kjør full OWASP-runde på en knappeetikett.

Ikke innfør et nytt tilgangssystem ved siden av det som finnes. Ikke slå av en vakt «for å komme videre».

## Personvern

Barn, samtykke, åpne lister, eksport og sletting: [ak-personvern](../ak-personvern/SKILL.md).
