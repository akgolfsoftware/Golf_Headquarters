# Saker-innsamling (Jarvis steg 2)

Lokale Mac-mini-script (samme mønster som `scripts/mulligan-triage/`) som fyller
den samlede "venter på deg"-køen (steg 1, tabellen `saker`) med nye
henvendelser. Bygget etter `~/Documents/Claude/akgolf-hq/kunnskap/jarvis-masterplan.md`,
DEL A steg 2.

**Gjør KUN innsamling.** Ingen klassifisering, ingen `foreslattSvar` — det er
steg 3 (triage-agenten). Hver ny henvendelse blir en `Sak`-rad med status
`VENTER` og en 6-timers SLA-frist. Sender/oppretter ALDRI noe selv i
Gmail/Meldinger — kun leser.

## Hvorfor lokalt script, ikke Vercel/cron

Gmail-delen gjenbruker ADMIN-brukerens eksisterende Google-tilkobling (samme
som Meg-boten/mulligan-triage) og kunne i prinsippet kjørt i skyen, men
iMessage/SMS-delen MÅ kjøre lokalt (leser macOS' egen `chat.db`) — begge
scriptene er derfor samlet i én lokal Mac Mini-mappe for konsistens.

## Hva Gmail-innsamleren gjør per kjøring (`gmail.ts`, `npm run saker:gmail`)

1. Henter e-post via Gmail-søk (`SAKER_GMAIL_QUERY`, default: uleste, siste
   2 døgn, i innboks, ekskluderer egne utsendte).
2. For hver e-post: sjekker om en `Sak` med `kanal=EPOST` og samme
   `kildeId` (Gmail message-id) allerede finnes — finnes den, hoppes den
   over (idempotens; ingen unik-constraint i databasen, sjekkes derfor i
   applikasjonskoden).
3. Filtrerer bort åpenbar støy med en enkel, lokal heuristikk FØR en sak
   opprettes: avsendere med `no-reply@`/`noreply@`/`notifications@`/
   `newsletter@` o.l., og meldinger med en `List-Unsubscribe`-header
   (sterkt nyhetsbrev-signal). Ingen sky-AI, ingen innholdsklassifisering —
   kun avsender/header-mønster. Bevisst konservativt: tvetydige avsendere
   lages det en sak av.
4. Oppretter en `Sak` (kanal `EPOST`, status `VENTER`) med avsender
   (From-header), emne (Subject-header), innhold (e-postteksten —
   `finnTekstDel`-mønsteret fra `mulligan-triage/run.ts`), kildeId
   (Gmail message-id), frist (nå + 6 timer), og `provenance`
   (`{kilde: "gmail-innsamler", kjort: <ISO-tid>}`).
5. Sender én kort Telegram-oppsummering til Anders på slutten (kun antall —
   aldri innhold/PII i selve meldingen).

## iMessage/SMS — status (undersøkt 2026-08-16)

**Ikke verifisert mot ekte data i denne økten.** To ting ble faktisk testet:

- `sqlite3 ~/Library/Messages/chat.db "SELECT count(*) FROM message;"` og
  det samme via Nodes innebygde `node:sqlite` → begge feilet med
  "unable to open database file" / "authorization denied". **Full Disk
  Access er IKKE gitt** til prosessen dette ble bygget i.
- Beeper Desktop sin lokale HTTP-API (vurdert som et bredere alternativ,
  jf. oppgavebeskrivelsen) → Beeper Desktop-appen kjørte ikke og lyttet
  ikke på noen lokal port (`lsof` viste ingen Beeper-prosess/port).

**Valg: `chat.db` direkte**, ikke Beeper. Begrunnelse: Beeper krever at
GUI-appen holdes åpen og API-et er skrudd på — dårlig match for en headless
LaunchAgent. `chat.db` er macOS' egen database og trenger kun Full Disk
Access, ingen ekstra app kjørende.

`imessage.ts` er skrevet ferdig og typesjekker, men skjemaet (kolonnenavn i
`message`/`handle`-tabellene, dato-format, `attributedBody`-fallback for
tekst på nyere macOS) er basert på offentlig dokumentert struktur —
**ikke kjørt mot ekte data**. Test på nytt (`npm run saker:imessage`) når
Full Disk Access er gitt, og verifiser spesielt `attributedBody`-fallbacken
(`pakkUtAttributedBodyTekst` i `imessage.ts`) — den er kjent skjør og kan
trenge justering.

### Gi Full Disk Access (manuell sjekkliste)

Kjøringen skjer via `npm`/`node`/`tsx` fra Terminal (eller den appen
LaunchAgenten bruker) — det er DEN prosessen som trenger tilgang, ikke
Claude Code i seg selv:

1. Åpne **Systeminnstillinger → Personvern og sikkerhet → Full diskvertilgang**.
2. Klikk `+` og legg til **Terminal** (eller iTerm, hvis det er den du bruker
   til å kjøre `npm run saker:imessage` manuelt/via LaunchAgent).
3. Skru PÅ bryteren for Terminal/iTerm i lista.
4. Lukk og åpne Terminal-appen på nytt (tilgangen krever restart av appen).
5. Test: `sqlite3 ~/Library/Messages/chat.db "SELECT count(*) FROM message;"`
   — får du et tall (ikke en feilmelding), er tilgangen på plass.
6. Kjør deretter `npm run saker:imessage` fra samme terminal for å
   verifisere at innsamleren faktisk fungerer, før noen LaunchAgent
   installeres for den.

**iMessage-delen har INGEN LaunchAgent installert ennå** — den venter på
punkt 6 over. `com.akgolf.saker-gmail.plist` (denne mappen) dekker kun
Gmail-delen.

## Env-variabler

Alle er valgfrie med fornuftige defaults:

```
SAKER_GMAIL_QUERY=in:inbox is:unread newer_than:2d -from:me   # default
```

Google-tilgang og Telegram gjenbruker EKSISTERENDE Meg-bot-konfigurasjon —
ingen nye secrets trengs:

```
GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI / GOOGLE_TOKEN_ENCRYPTION_KEY
MEG_TELEGRAM_BOT_TOKEN / MEG_TELEGRAM_ALLOWED_CHAT_ID
```

## Kjør manuelt

```bash
npm run saker:gmail
npm run saker:imessage   # krever Full Disk Access, se sjekkliste over
```

## Installer LaunchAgent (KUN Gmail, hvert 10. minutt)

```bash
cp scripts/saker-innsamling/com.akgolf.saker-gmail.plist \
   ~/Library/LaunchAgents/

launchctl load ~/Library/LaunchAgents/com.akgolf.saker-gmail.plist
launchctl list | grep saker-gmail
```

Kjør manuelt nå (som ved en planlagt kjøring):

```bash
launchctl start com.akgolf.saker-gmail
```

Avinstaller:

```bash
launchctl unload ~/Library/LaunchAgents/com.akgolf.saker-gmail.plist
rm ~/Library/LaunchAgents/com.akgolf.saker-gmail.plist
```

## Loggfiler

```bash
tail -50 /tmp/saker-gmail.log
tail -50 /tmp/saker-gmail.err
```

## Filer

- `env.ts` — miljøkonfigurasjon med defaults (delt av begge innsamlerne).
- `google-tilkobling.ts` — henter ADMIN-brukerens Google-tilkobling (kopi
  av mønsteret i `scripts/mulligan-triage/google-tilkobling.ts` — se
  filhodet der for hvorfor det er en kopi og ikke en import).
- `gmail.ts` — Gmail-innsamleren, kjøres av `npm run saker:gmail`.
- `imessage.ts` — iMessage/SMS-innsamleren, kjøres av `npm run saker:imessage`.
  Se "iMessage/SMS — status" over.
- `node-sqlite.d.ts` — minimal ambient type-shim for `node:sqlite` (prosjektets
  `@types/node`-versjon mangler ennå disse typene).
- `com.akgolf.saker-gmail.plist` — LaunchAgent for Gmail-delen (hvert 10. min).

## Ikke del av denne bølgen

- Klassifisering, svarutkast og godkjenningsflyt — det er steg 3 og 4 i
  masterplanen.
- LaunchAgent for iMessage/SMS — venter på Full Disk Access-avklaring
  (se over).
