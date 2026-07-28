# Whoop og Garmin — oppsett og søknader

Steg 2 av 10 i wearable-integrasjonen. Dette dokumentet inneholder alt Anders må gjøre
manuelt, ferdig utfylt, pluss de tekniske valgene steg 4–5 skal bygge på.

**Status per 27.07.2026:** ingen av delene er registrert eller sendt ennå.

| Del | Hvem gjør det | Status |
|---|---|---|
| Whoop-app registreres | Anders (5 min, selvbetjent) | Ikke gjort |
| Garmin-søknad sendes | Anders (10 min, skjema) | Ikke sendt |
| Nøkler legges i Vercel | Anders | Venter på de to over |
| Kode som bruker dem | Steg 4–5 | Venter |

---

## 1. Whoop — registrer app (gjør denne først)

Whoop er selvbetjent. Ingen søknad, ingen ventetid.

**Gå til** [developer.whoop.com](https://developer.whoop.com/) → logg inn med Whoop-kontoen →
Developer Dashboard → opprett app.

### Verdier å fylle inn

| Felt | Verdi |
|---|---|
| App name | `AK Golf HQ` |
| Contact email | `post@akgolf.no` |
| Privacy policy URL | `https://akgolf.no/personvern` |
| Redirect URI (produksjon) | `https://akgolf.no/api/whoop/callback` |
| Redirect URI (lokal utvikling) | `http://localhost:3000/api/whoop/callback` |
| Scopes | `read:sleep` · `read:recovery` · `offline` |

### Om scopes — ikke huk av flere enn disse

Whoop tilbyr seks scopes. Vi ber om to, pluss `offline`:

- `read:sleep` — timer søvn
- `read:recovery` — restitusjonsscore, HRV og hvilepuls (alle tre ligger i samme svar)
- `offline` — lar oss fornye tilgangen automatisk, så spilleren slipper å koble til på nytt

Vi ber **ikke** om `read:workout`, `read:cycles`, `read:body_measurement` eller `read:profile`.
Det er et bevisst valg: samtykketeksten spillerne får se lover at vi kun henter fire døgnverdier,
og GDPR krever at vi ikke ber om mer enn vi trenger. Ber vi om mer, må samtykketeksten endres og
alle samtykker innhentes på nytt.

> **Å verifisere i steg 4:** hvis restitusjons-endepunktet viser seg å kreve `read:cycles` for å
> kunne leses (restitusjonsobjektet peker på en syklus), må scopet legges til — og da må
> `HELSE_SAMTYKKE_VERSJON` bumpes og teksten oppdateres. Ikke legg det til «for sikkerhets skyld».

### Viktig begrensning: 10 medlemmer før godkjenning

En ny Whoop-app kan kobles til **maks 10 Whoop-medlemmer** før den er godkjent av Whoop. Det er
mer enn nok til å teste med de første spillerne, men ikke nok til å slippe alle løs.

Godkjenning søkes gjennom Whoops eget App Submission-skjema, og forutsetter at:

- appen er testet med minst ett ekte Whoop-medlem
- navn, kontakt-e-post og personvern-URL i dashbordet stemmer
- Whoops merkevareretningslinjer følges (logo og navn brukt riktig)

**Anbefaling:** registrer appen nå, bygg og test på de 10 plassene, og søk godkjenning når steg
4–7 er ferdig og vi har noe å vise. Da har vi skjermbilder å legge ved.

### Nøkler som kommer ut

Etter registrering får du en **Client ID** og en **Client Secret**. Disse skal inn i Vercel som
miljøvariabler — se punkt 3. Send dem aldri på e-post eller i chat.

---

## 2. Garmin — søknad om Health API

Garmin krever godkjenning. Gratis, men de vil vite hvem vi er og hva vi skal med dataene.
Svar på selve søknaden kommer normalt innen **to virkedager**; full tilgang og integrasjon tar
typisk **1–4 uker**.

**Gå til** [Garmin Connect Developer Program — tilgangsskjema](https://www.garmin.com/en-US/forms/GarminConnectDeveloperAccess/)

### Selskapsopplysninger

| Felt | Verdi |
|---|---|
| Company name | AK Golf Group AS |
| Organisation number | 927 248 581 |
| Country | Norway |
| Website | https://akgolf.no |
| Contact name | Anders Kristiansen |
| Title | CEO |
| Email | post@akgolf.no |
| Phone | +47 482 16 540 |

### API-er å velge

Huk av **Health API**. Ikke huk av Activity, Women's Health, Training eller Courses — vi bruker
dem ikke, og hvert ekstra API gjør søknaden tyngre å få godkjent.

### Databehandling

På spørsmålet om dataene knyttes til identifiserbare brukere eller behandles anonymt/aggregert:
svar **linked to identifiable users**. Det er sant — dataene knyttes til den enkelte spilleren —
og å svare feil her ville vært et problem senere.

### Beskrivelse av bruksområde (kopier og lim inn)

```
AK Golf HQ is a coaching platform for golf players, built and operated by AK Golf Group AS
in Fredrikstad, Norway. It is used by our own academy, by junior players at Gamle Fredrikstad
Golf Club, and by student athletes at WANG Toppidrett Fredrikstad upper secondary school.

We want to use the Health API so that a player who owns a Garmin device can choose to connect
it and have their daily wellness data flow into their training plan automatically, instead of
typing the numbers in by hand as they do today.

What we would retrieve, once per day per consenting user:
- sleep duration
- resting heart rate
- heart rate variability
- stress or body battery level

How it is used: the platform compares training load against recovery. When a player's planned
training load rises faster than their body is recovering, the platform flags it to the player
and, if the player has separately agreed to it, to their coach. This is a recognised approach
to reducing overuse injury, which matters particularly for our junior players who are still
growing.

What we do not do: we do not retrieve GPS or location data, detailed heart rate series, or
activity files. We do not sell, license or share Garmin data with any third party. We do not
use it for advertising or for training machine learning models. Data is not shared between
players.

Consent and legal basis: sleep and heart rate data are special category personal data under
the EU General Data Protection Regulation. We collect them solely on the basis of explicit
consent under Article 9(2)(a), obtained through a dedicated consent step inside our own
application before any connection is made. Every consent is stored as a timestamped, versioned
record. Players under 16 require a parent or guardian to give consent under Article 8, which
is enforced server-side. Consent can be withdrawn at any time, which immediately stops all
data retrieval and revokes our access token.

Storage: data is stored in our PostgreSQL database hosted by Supabase in London, within the
EEA. It is not transferred outside the EEA. Access tokens are encrypted at rest using
AES-256-GCM. When a user disconnects, tokens are deleted immediately and the user chooses
whether to keep or delete their stored history.

Expected scale: fewer than 100 connected users in the first year.

Integration approach: server-side OAuth with push notifications, using the Garmin Health API
directly. We are not using a third-party data aggregator.
```

### Callback- og webhook-URL-er Garmin vil be om

| Type | URL |
|---|---|
| OAuth redirect | `https://akgolf.no/api/garmin/callback` |
| Push/ping-varsler | `https://akgolf.no/api/garmin/webhook` |

Rutene finnes ikke ennå — de bygges i steg 8. Oppgi dem likevel i søknaden; Garmin forventer at
de er på plass før du tar i bruk push, ikke før du søker.

---

## 3. Miljøvariabler

Legges inn i Vercel (Production + Preview) og lokalt i `.env.local` når nøklene finnes.
**Aldri i kode, aldri i commit.**

```
WHOOP_CLIENT_ID=
WHOOP_CLIENT_SECRET=
WHOOP_WEBHOOK_SECRET=

GARMIN_CONSUMER_KEY=
GARMIN_CONSUMER_SECRET=

WEARABLE_TOKEN_ENCRYPTION_KEY=
```

`WEARABLE_TOKEN_ENCRYPTION_KEY` er vår egen, ikke fra leverandørene: den krypterer
tilgangsnøklene før de lagres, etter samme mønster som Google Kalender-koblingen. 32 tilfeldige
byte som hex. Genereres slik:

```bash
openssl rand -hex 32
```

Legg alle tre Whoop-variablene inn samtidig når appen er registrert, og de to Garmin-variablene
når søknaden er godkjent. Rutine ved kompromittert nøkkel: `docs/runbook.md` §2.5 — den listen
må utvides med disse.

---

## 4. Rekkefølge

1. Registrer Whoop-appen (5 min) → legg Client ID og Secret i Vercel
2. Send Garmin-søknaden (10 min) → svar innen to virkedager
3. Generer og legg inn `WEARABLE_TOKEN_ENCRYPTION_KEY`
4. Steg 3–7 bygges på Whoop mens Garmin behandles
5. Steg 8 kobler på Garmin når godkjenningen er i havn

Garmin-søknaden bør sendes selv om Whoop bygges først — ventetiden løper parallelt og koster
ingenting.

---

## Kilder

- [WHOOP for Developers](https://developer.whoop.com/)
- [WHOOP API Terms of Use](https://developer.whoop.com/api-terms-of-use/) — merk forbudet mot å selge eller dele data videre, også med brukerens samtykke
- [WHOOP app approval](https://developer.whoop.com/docs/developing/app-approval/) — 10-medlemsgrensen
- [Garmin Health API](https://developer.garmin.com/gc-developer-program/health-api/)
- [Garmin Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/) — ingen lisensavgift, svar innen to virkedager
