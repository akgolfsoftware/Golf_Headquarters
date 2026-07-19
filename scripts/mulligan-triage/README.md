# Mulligan e-post-triage

Lokalt Mac-mini-script (samme mønster som `scripts/meg-tilbakeskriving/`) som
klassifiserer uleste e-poster til Mulligan Indoor Golf og forbereder
svar-utkast for booking-forespørsler. Bygget etter reglene i
`.claude/rules/mulligan-drift.md`.

**Sender ALDRI e-post automatisk.** Scriptet oppretter kun Gmail-UTKAST —
Anders leser, redigerer om nødvendig og sender selv fra Gmail.

## Hvorfor lokalt script, ikke Vercel/cron

Klassifiseringen skjer via en lokal Ollama-modell (PII-krav: kundedata skal
aldri til en sky-AI). Ollama finnes kun på Mac Mini-en, derfor kjører hele
pipelinen der — ingen ny Vercel/serverless-kode for selve klassifiseringen.

## Hva scriptet gjør per kjøring

1. Henter uleste e-poster via Gmail-søk (`MULLIGAN_GMAIL_QUERY`).
2. Klassifiserer hver e-post lokalt via Ollama til **booking** / **drift** / **generelt**.
   - Ollama utilgjengelig/usikker → e-posten hoppes over og logges for
     manuell vurdering. Vi gjetter aldri klassen.
3. **booking:** sjekker ledighet i Google Calendar for de neste 7 dagene
   (kalender-verifisert, aldri antatt) → oppretter et Gmail-utkast med
   konkrete ledige tider. Ingen ledig tid funnet → hopper over utkastet,
   logger for manuell oppfølging.
4. **drift:** oppretter INGEN utkast — bare logges/flagges slik at Anders kan
   følge opp manuelt (feilmeldinger krever et faglig/teknisk svar en AI ikke
   bør forfatte).
5. **generelt:** logges for manuell oppfølging, ingen automatisk handling.
6. Sender én Telegram-oppsummering til Anders på slutten (kun antall — booking-
   utkast, drift-saker, generelt, uklassifisert/feilet — aldri detaljer/PII i
   meldingen).

## Env-variabler

Alle er valgfrie med fornuftige defaults:

```
MULLIGAN_OLLAMA_URL=http://localhost:11434       # default
MULLIGAN_OLLAMA_MODEL=qwen2.5:7b                 # default — samme som inbox-sortering.ts
MULLIGAN_GMAIL_QUERY=is:unread newer_than:2d      # default — snevre inn når Mulligans innboks-struktur er kjent (f.eks. et eget label)
```

Google-tilgang og Telegram gjenbruker EKSISTERENDE Meg-bot-konfigurasjon —
ingen nye secrets trengs:

```
GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI / GOOGLE_TOKEN_ENCRYPTION_KEY
MEG_TELEGRAM_BOT_TOKEN / MEG_TELEGRAM_ALLOWED_CHAT_ID
```

Forutsetning: en aktiv `GoogleCalendarConnection` for en ADMIN-bruker
(samme tilkobling Meg-boten allerede bruker via
`/api/google-calendar/connect?meg=1`) med Gmail- og Calendar-scopes.

## Kjør manuelt

```bash
npm run mulligan:triage
```

## Installer LaunchAgent (kjører hver time 08:00–20:00)

Kjøretiden er en ANTAKELSE — juster mot Mulligans faktiske åpningstider og
ønsket frekvens.

```bash
cp scripts/mulligan-triage/com.akgolf.mulligan-triage.plist \
   ~/Library/LaunchAgents/

launchctl load ~/Library/LaunchAgents/com.akgolf.mulligan-triage.plist
launchctl list | grep mulligan-triage
```

Kjør manuelt nå (som ved en planlagt kjøring):

```bash
launchctl start com.akgolf.mulligan-triage
```

Avinstaller:

```bash
launchctl unload ~/Library/LaunchAgents/com.akgolf.mulligan-triage.plist
rm ~/Library/LaunchAgents/com.akgolf.mulligan-triage.plist
```

## Loggfiler

```bash
tail -50 /tmp/mulligan-triage.log
tail -50 /tmp/mulligan-triage.err
```

## Filer

- `env.ts` — miljøkonfigurasjon med defaults.
- `klassifiser.ts` — Ollama-klassifisering (booking/drift/generelt). Ingen
  sky-AI — se filhodet for PII-begrunnelsen.
- `kalender.ts` — ledig-tid-utregning. Bruker `regnUtLedigeVinduer()` fra
  `src/lib/mulligan/ledige-tider.ts` (ren, testet funksjon) + `getCalendarBusy()`
  fra `src/lib/google-calendar.ts` for selve Google-kallet.
- `gmail-utkast.ts` — oppretter svarutkast via `createGmailDraft()` (delt
  helper i `src/lib/google-gmail.ts`).
- `google-tilkobling.ts` — henter ADMIN-brukerens Google-tilkobling (samme
  mønster som `getOwnerConnection()` i `src/lib/meg/connectors/google.ts`,
  kopiert fordi den fila er `server-only`-guardet og ikke kan importeres av
  et rent tsx-script).
- `run.ts` — hovedscriptet, kjøres av `npm run mulligan:triage`.

## Ikke del av denne bølgen

- **SMS-triage:** ingen SMS-leverandør er integrert i repoet ennå.
  Klassifiseringen i `klassifiser.ts` er allerede leverandør-uavhengig
  (tar bare emne+tekst) og kan gjenbrukes rett når en leverandør finnes —
  kun en ny inntaksvei trengs.
- Faktisk kjøring mot ekte Mulligan-e-post er ikke gjort i denne økten
  (krever en aktiv Google-tilkobling + Ollama kjørende på Mac Mini-en).
