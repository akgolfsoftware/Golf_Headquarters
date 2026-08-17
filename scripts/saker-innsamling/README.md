# Saker-innsamling og -triage (Jarvis steg 2–4)

Lokale Mac-mini-script (samme mønster som `scripts/mulligan-triage/`) som fyller
den samlede "venter på deg"-køen (steg 1, tabellen `saker`) med nye
henvendelser (steg 2, `gmail.ts`/`imessage.ts`) og skriver svarutkast på dem
(steg 3+4, `triage.ts`). Bygget etter
`docs/jarvis-masterplan.md`, DEL A.

**Innsamlerne (`gmail.ts`/`imessage.ts`) gjør KUN innsamling.** Ingen
klassifisering, ingen `foreslattSvar` — det er `triage.ts` sin jobb. Hver ny
henvendelse blir en `Sak`-rad med status `VENTER` og en 6-timers SLA-frist.
Innsamlerne sender/oppretter ALDRI noe selv i Gmail/Meldinger — kun leser.

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

## Hva triage-agenten gjør per kjøring (`triage.ts`, `npm run saker:triage`)

Plukker opptil `SAKER_TRIAGE_BATCH_LIMIT` (default 20) `Sak`-rader med
`status=VENTER` og `foreslattSvar=null`, eldste først:

1. Lokal Ollama klassifiserer saken (kategori, hastegrad, om det er en ren
   bekreftelse/kvittering) OG lister personnavnene den finner i innholdet.
   Klarer ikke Ollama dette (nede/timeout), hoppes saken over — den prøves
   igjen neste kjøring. Ingen sky-AI ser rå innhold på dette steget.
2. **Enkle saker** (ren bekreftelse/kvittering): svarutkastet skrives HELT av
   den lokale Ollama-modellen, på rå tekst (forlater aldri maskinen).
3. **Komplekse saker**: personnavnene fra steg 1 erstattes lokalt og
   deterministisk med `[PERSON1]`, `[PERSON2]` osv.
   (`src/lib/saker/anonymiser.ts`, egne tester) — KUN denne anonymiserte
   teksten sendes til Claude. Svaret får navnene satt tilbake lokalt før det
   lagres.
4. `Sak.foreslattSvar` skrives, `Sak.provenance` får et `triage`-felt
   (kategori/hastegrad/motor/tidspunkt) i tillegg til det innsamleren
   allerede skrev — ingenting overskrives.
5. Anders varsles på Telegram (kort sammendrag + selve utkastet), og én
   ventende BEKREFT-handling registreres (`tool_name: "sak_godkjenn"`) —
   kun hvis ingen åpen `sak_godkjenn`-pending finnes fra før, se avsnittet
   under. Svarer han BEKREFT, kjører `src/lib/saker/godkjenn.ts` og
   oppretter et Gmail-UTKAST. Samme funksjon som Godkjenn-knappen i
   AgencyOS → Innboks. **Sender ALDRI noe automatisk**, uansett sakstype.
6. Hele kjøringen logges via `runAgent("saker-triage", …)` til `AgentRun`.

`me_pending_action` (BEKREFT-lageret) leses med «siste ventende handling
vinner» (`getLatestPending`) — derfor registrerer triage aldri mer enn én
`sak_godkjenn`-pending om gangen: finnes en åpen fra før
(`harVentendePending` i `src/lib/meg/pending.ts`), hoppes registreringen
over og Telegram-meldingen sier «Flere saker venter — godkjenn i
AgencyOS → Innboks» i stedet for BEKREFT-instruksjonen. BEKREFT treffer
dermed alltid en deterministisk sak (den først registrerte), aldri blindt
bakover i en stabel.

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
SAKER_TRIAGE_BATCH_LIMIT=20                                   # default, kun triage.ts
```

Google-tilgang, Telegram, Ollama og Claude gjenbruker EKSISTERENDE
Meg-bot/AI-konfigurasjon — ingen nye secrets trengs:

```
GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI / GOOGLE_TOKEN_ENCRYPTION_KEY
MEG_TELEGRAM_BOT_TOKEN / MEG_TELEGRAM_ALLOWED_CHAT_ID / MEG_ALLOWED_PEOPLE
MEG_OLLAMA_URL / MEG_OLLAMA_MODEL       (kun triage.ts — mangler denne, hoppes klassifisering over)
ANTHROPIC_API_KEY                       (kun triage.ts, kun komplekse saker)
MEG_SUPABASE_URL / MEG_SUPABASE_SERVICE_ROLE_KEY   (kun triage.ts — BEKREFT-lageret)
```

## Kjør manuelt

```bash
npm run saker:gmail
npm run saker:imessage   # krever Full Disk Access, se sjekkliste over
npm run saker:triage
```

## Installer LaunchAgent (Gmail hvert 10. min, triage hvert 30. min)

```bash
cp scripts/saker-innsamling/com.akgolf.saker-gmail.plist \
   scripts/saker-innsamling/com.akgolf.saker-triage.plist \
   ~/Library/LaunchAgents/

launchctl load ~/Library/LaunchAgents/com.akgolf.saker-gmail.plist
launchctl load ~/Library/LaunchAgents/com.akgolf.saker-triage.plist
launchctl list | grep saker-
```

Kjør manuelt nå (som ved en planlagt kjøring):

```bash
launchctl start com.akgolf.saker-gmail
launchctl start com.akgolf.saker-triage
```

Avinstaller:

```bash
launchctl unload ~/Library/LaunchAgents/com.akgolf.saker-gmail.plist
launchctl unload ~/Library/LaunchAgents/com.akgolf.saker-triage.plist
rm ~/Library/LaunchAgents/com.akgolf.saker-gmail.plist
rm ~/Library/LaunchAgents/com.akgolf.saker-triage.plist
```

## Loggfiler

```bash
tail -50 /tmp/saker-gmail.log
tail -50 /tmp/saker-gmail.err
tail -50 /tmp/saker-triage.log
tail -50 /tmp/saker-triage.err
```

## Filer

- `env.ts` — miljøkonfigurasjon med defaults (delt av alle tre scriptene).
- `google-tilkobling.ts` — henter ADMIN-brukerens Google-tilkobling (kopi
  av mønsteret i `scripts/mulligan-triage/google-tilkobling.ts` — se
  filhodet der for hvorfor det er en kopi og ikke en import).
- `gmail.ts` — Gmail-innsamleren, kjøres av `npm run saker:gmail`.
- `imessage.ts` — iMessage/SMS-innsamleren, kjøres av `npm run saker:imessage`.
  Se "iMessage/SMS — status" over.
- `triage.ts` — klassifiserings- og svarutkast-agenten, kjøres av
  `npm run saker:triage`. Se "Hva triage-agenten gjør" over. Anonymiserings-
  logikken den bruker ligger i `src/lib/saker/anonymiser.ts` (testet), og
  godkjenn/avvis-logikken (både AgencyOS-knappen og Telegram BEKREFT) i
  `src/lib/saker/godkjenn.ts`.
- `node-sqlite.d.ts` — minimal ambient type-shim for `node:sqlite` (prosjektets
  `@types/node`-versjon mangler ennå disse typene).
- `com.akgolf.saker-gmail.plist` — LaunchAgent for Gmail-delen (hvert 10. min).
- `com.akgolf.saker-triage.plist` — LaunchAgent for triage (hvert 30. min).

## Ikke del av denne bølgen

- LaunchAgent for iMessage/SMS — venter på Full Disk Access-avklaring
  (se over).
