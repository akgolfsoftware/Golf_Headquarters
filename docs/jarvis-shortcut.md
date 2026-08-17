# Spør Jarvis — iOS Snarvei (Watch/Siri/bil)

`POST /api/meg/shortcut` er en tynn inngang til Meg-boten («Jarvis») for iOS Snarveier
(Shortcuts-appen). Den lar Anders si «Hei Siri, Spør Jarvis» fra Apple Watch, iPhone eller
CarPlay og få svaret lest opp — uten å åpne Telegram.

Ruten deler samtalehistorikk og BEKREFT-flyt med Telegram-kanalen: begge bruker samme
identitet (Anders/admin-personen i allowlisten), så «BEKREFT» sagt til Siri kan bekrefte
noe Jarvis foreslo på Telegram, og omvendt.

Kildefiler:
- Rute: `src/app/api/meg/shortcut/route.ts`
- Env-leser: `readMegShortcutEnv` i `src/lib/meg/env.ts`
- Token-verifisering: `src/lib/meg/shortcut-auth.ts`

## 1. Kontrakt

```
POST /api/meg/shortcut
Authorization: Bearer <MEG_SHORTCUT_TOKEN>
Content-Type: application/json

{ "melding": "Hva står på kalenderen i morgen?" }
```

Svar (200):

```json
{ "svar": "..." }
```

Feil (401/429/400/503/502): `{ "feil": "..." }` med riktig statuskode. Ingen streaming —
Shortcuts leser hele svaret på én gang.

### curl-eksempel

```bash
curl -X POST https://akgolf-hq.vercel.app/api/meg/shortcut \
  -H "Authorization: Bearer $MEG_SHORTCUT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"melding": "Hva står på kalenderen i morgen?"}'
```

## 2. Generer og sett token

Token genereres én gang lokalt:

```bash
openssl rand -hex 32
```

Verdien limes inn to steder (aldri i kode, aldri i git):

1. **Vercel** → Project Settings → Environment Variables → `MEG_SHORTCUT_TOKEN` (Production).
2. **`.env.local`** (kun hvis Jarvis skal testes lokalt) → `MEG_SHORTCUT_TOKEN=<verdien>`.

Uten denne variabelen svarer ruten `503 { "feil": "ikke konfigurert" }` — den er bevisst
avslått til Anders faktisk har satt et token, ikke en åpen endepunkt-feil.

## 3. Bygg Shortcut-en i Snarveier-appen (iPhone)

1. Åpne **Snarveier** → trykk **+** for ny snarvei.
2. Trykk snarvei-navnet øverst → gi den navnet **«Spør Jarvis»** (dette er frasen Siri
   lytter etter).
3. Legg til handlingen **«Dikter tekst»** (Dictate Text) — dette er det Anders sier etter
   «Spør Jarvis». Sett språk til norsk bokmål.
4. Legg til handlingen **«Få innhold fra URL»** (Get Contents of URL):
   - URL: `https://akgolf-hq.vercel.app/api/meg/shortcut`
   - Metode: **POST**
   - Headers:
     - `Authorization` → `Bearer <MEG_SHORTCUT_TOKEN>`
     - `Content-Type` → `application/json`
   - Forespørselstekst (Request Body): **JSON**, med ett felt:
     - `melding` → sett verdien til variabelen **Diktert tekst** fra steg 3.
5. Legg til handlingen **«Hent verdi fra ordliste»** (Get Dictionary Value) på resultatet
   fra forrige steg, med nøkkel `svar`.
6. Legg til handlingen **«Les opp tekst»** (Speak Text) med verdien fra steg 5.
7. Lukk redigeringen. Under snarvei-innstillingene (info-ikonet):
   - Skru på **«Legg til i Siri»** og bekreft frasen «Spør Jarvis».
   - Skru på **«Vis i Del-arket»** av hvis den ikke skal ligge blant delings-valg.

Test ved å si «Hei Siri, Spør Jarvis» fra telefonen først, før den prøves fra klokken.

## 4. Trigge fra Apple Watch

Snarveier synkroniseres automatisk til klokken når den er lagt til Siri på iPhone
(forutsetter at Snarveier-appen er installert på Watch — den følger med i App Store-appen
på klokken som standard i nyere watchOS).

- **Fra klokken:** «Hei Siri, Spør Jarvis» — samme frase som på telefonen. Watch dikterer
  meldingen, sender til ruten, og leser svaret opp i høyttaleren (eller viser det på
  skjermen hvis lyd er av).
- **I bil (CarPlay):** samme snarvei er tilgjengelig via «Hei Siri» gjennom bilens
  mikrofon når iPhone er koblet til CarPlay — ingen egen oppsett nødvendig.

Er svaret langt (agenten kan skrive flere setninger), leser Watch/CarPlay opp hele
teksten — hold spørsmålene konkrete for korte, presise svar.

## 5. Feilsøking

| Symptom | Årsak | Fiks |
|---|---|---|
| «Ikke konfigurert» (503) | `MEG_SHORTCUT_TOKEN` mangler i miljøet | Sett variabelen i Vercel (se steg 2) |
| «Uautorisert» (401) | Feil/utløpt token i snarveien | Sjekk `Authorization`-headeren i steg 4.4 |
| «For mange forespørsler» (429) | Rate-limit (20 kall/min) nådd | Vent ett minutt |
| «Meg er ikke konfigurert» (503) | Kjerne-Meg-env (Supabase/Telegram-allowlist) mangler | Sjekk `MEG_SUPABASE_*` og `MEG_ALLOWED_PEOPLE`/`MEG_TELEGRAM_ALLOWED_CHAT_ID` |
| Tomt/rart svar | Agenten feilet internt (502) | Se Vercel-loggene for `[meg/shortcut]` — loggene inneholder aldri meldingsteksten, kun lengde og responstid |

Ingen personopplysninger logges av denne ruten — kun meldingslengde og responstid i
millisekunder (`console.info("[meg/shortcut] ...", { lengde, ms })`).
