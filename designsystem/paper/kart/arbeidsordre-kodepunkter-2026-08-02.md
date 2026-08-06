# Arbeidsordre — de fem åpne punktene

**Skrevet:** 02.08.2026
**Base:** Supabase `Golf_Headquarters` · `dcnxoztjtdqoidaekxry`
**Repo:** `~/Developer/akgolf-hq`
**Kjøres i:** Claude Code. Ikke i Cowork — kode hører til `~/Developer`.

Fem punkter. Tre er kode og kjøres i rekkefølge. To er avklart og gjort i
basen 02.08 — de står her fordi den ene har en kode-rest.

**Rekkefølgen er ikke tilfeldig.** P1 må gjøres før P2, fordi Stripe-produktene
skal speile det basen sier. P3 kan gjøres når som helst, men jo lenger den
venter, jo flere betalinger kommer inn uten eier.

---

## P1 · schema.prisma må ta igjen basen

**Problem.** Jeg la fire kolonner på `service_types` direkte i basen
02.08.2026, via migrasjonen `service_types_abonnement_felter`. Prisma vet
ikke om dem. Neste gang noen kjører `prisma migrate dev`, ser Prisma et
skjema som ikke matcher modellen, og foreslår å **slette** kolonnene.

Det er ikke en teoretisk risiko. Det er standard oppførsel.

**Kolonnene som finnes i basen nå:**

| Kolonne | Type | Null | Standard |
|---|---|---|---|
| `billingInterval` | text | NEI | `'ONE_TIME'` |
| `sessionsPerPeriod` | integer | JA | — |
| `includesPlayerHq` | boolean | NEI | `false` |
| `rolloverUnused` | boolean | NEI | `false` |

**To CHECK-constraints:**

```
service_types_billing_interval_check
  CHECK (billingInterval IN ('ONE_TIME','MONTH'))

service_types_sessions_per_period_check
  CHECK (
    (billingInterval = 'MONTH'  AND sessionsPerPeriod IS NOT NULL AND sessionsPerPeriod > 0)
    OR
    (billingInterval = 'ONE_TIME' AND sessionsPerPeriod IS NULL)
  )
```

Den andre er den viktige: den gjør det umulig å lagre et abonnement uten
antall økter, eller en engangsøkt med det. Går den tapt i en migrasjon,
mister modellen sin eneste garanti.

**Gjør dette:**

1. Legg til i `model ServiceType` i `schema.prisma`:

```prisma
  billingInterval    String   @default("ONE_TIME")
  sessionsPerPeriod  Int?
  includesPlayerHq   Boolean  @default(false)
  rolloverUnused     Boolean  @default(false)
```

2. Kjør `npx prisma migrate dev --create-only --name service_types_abonnement`
   for å få en migrasjonsfil uten å bruke den.

3. **Åpne migrasjonsfilen og les den.** Står det `DROP COLUMN` eller
   `ALTER COLUMN ... DROP DEFAULT`, har du drift. Erstatt innholdet med en
   tom migrasjon som bare registrerer at basen allerede er slik:

```sql
-- Kolonnene finnes allerede i basen (lagt til 02.08.2026).
-- Denne migrasjonen registrerer dem i Prisma-historikken uten å endre noe.
```

4. CHECK-constraintene kan ikke uttrykkes i Prisma. Legg dem i samme
   migrasjonsfil med `CREATE ... IF NOT EXISTS`-mønsteret, så de overlever
   en fremtidig reset:

```sql
ALTER TABLE service_types DROP CONSTRAINT IF EXISTS service_types_billing_interval_check;
ALTER TABLE service_types ADD CONSTRAINT service_types_billing_interval_check
  CHECK ("billingInterval" IN ('ONE_TIME','MONTH'));

ALTER TABLE service_types DROP CONSTRAINT IF EXISTS service_types_sessions_per_period_check;
ALTER TABLE service_types ADD CONSTRAINT service_types_sessions_per_period_check
  CHECK (
    ("billingInterval" = 'MONTH' AND "sessionsPerPeriod" IS NOT NULL AND "sessionsPerPeriod" > 0)
    OR ("billingInterval" = 'ONE_TIME' AND "sessionsPerPeriod" IS NULL)
  );
```

5. `npx prisma migrate resolve --applied <migrasjonsnavn>`
6. `npx prisma generate`

**Verifisering — ikke hopp over denne:**

```bash
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma
```

Skal si «No difference detected». Sier den noe annet, er skjemaet fortsatt
på siden av basen.

---

## P2 · Stripe-produktene må matche de nye prisene

**Problem.** Performance og Performance Pro er ikke lenger engangsøkter. De
er månedsabonnement. Så lenge Stripe har de gamle engangsproduktene, kan
ingen tegne abonnement — knappen finnes i flata, men det finnes ingenting å
kjøpe.

**Slik er det i basen nå:**

| slug | navn | pris | intervall | økter | varighet |
|---|---|---|---|---|---|
| `anders-performance` | Performance — Anders | 1 300 kr | MONTH | 2 | 20 min |
| `anders-performance-pro` | Performance Pro — Anders | 2 300 kr | MONTH | 4 | 20 min |

Merk: `durationMin` er 20, ikke 40 eller 80. Feltet betyr lengden på **én**
økt. «2 × 20 min» er noe annet enn «40 min», og skal aldri slås sammen —
verken i Stripe-beskrivelsen eller i UI.

**Gjør dette:**

1. Opprett to nye **recurring** priser i Stripe, intervall `month`:
   - Performance — 130000 øre NOK
   - Performance Pro — 230000 øre NOK
2. Legg `stripePriceId` på de to radene i `service_types`. Kolonnen finnes
   ikke ennå — den må legges til i samme slengen som P1, eller som egen
   migrasjon.
3. Arkivér de gamle engangsproduktene i Stripe. Ikke slett dem — de 11
   betalingene i `payments` refererer til gamle intents, og sletting bryter
   sporet bakover.
4. Sjekk at webhooken håndterer `customer.subscription.created` og
   `invoice.paid`. I dag skriver den bare `payment_intent.succeeded` —
   derfor er `subscriptions` tom.

**Verifisering:** tegn ett testabonnement i Stripe testmodus. Det skal
dukke opp som en rad i `subscriptions` med riktig `serviceTypeId`. Gjør det
ikke det, er punkt 4 over ikke gjort.

---

## P3 · Webhooken må skrive userId på betalinger

**Problem — og dette er det dyreste av de fem.** Alle 11 radene i `payments`
har `userId = null` og `subscriptionId = null`. Fem av seks rader i
`bookings` har også `userId = null`.

Konsekvensen: ingen krone kan tilskrives en spiller eller et selskap.
Økonomiflata kan telle penger, men ikke fordele dem. Konsernmålet på
500 000 USD har ingen målesti så lenge dette står.

**Hvorfor det er slik.** Betalingene kommer fra Acuity Scheduling, ikke fra
plattformens egen booking. Acuity sender `stripeCustomerId`, men ingen
AK-bruker-ID. Navnet ligger begravd i `description`, som fritekst:

```
1744837297 - Bjørn Arild Haas Brubakk - Flex 50 minutter  - 7. august 2026 12:00
```

**Gjør dette, i denne rekkefølgen:**

1. **Fremover først.** I webhook-handleren: slå opp `stripeCustomerId` mot
   `users`, og skriv `userId` når det finnes treff. Krever at `users` får en
   `stripeCustomerId`-kolonne hvis den ikke finnes.
2. **Egen booking må sette userId direkte.** Går bestillingen gjennom
   plattformen, er brukeren kjent — da skal `userId` skrives uten oppslag.
   At fem av seks eksisterende bookinger mangler den, tyder på at dette
   ikke gjøres i dag.
3. **Bakover til slutt, og manuelt.** Ikke skriv en parser som gjetter navn
   ut av `description`. Elleve rader tar ti minutter for hånd, og en parser
   som treffer på ni av elleve gir deg tall du ikke kan stole på — uten at
   du vet hvilke to.

**Verifisering:** etter én ekte betaling gjennom plattformens booking, sjekk

```sql
select id, "userId", "subscriptionId", "bookingId" from payments
order by "createdAt" desc limit 1;
```

Alle tre skal ha verdi.

---

## P4 · Gruppe-økt · antall settes per økt — GJORT 02.08.2026

**Avklart av Anders:** en gruppe-økt skal kunne variere i antall. Antallet
bestemmes når økta opprettes, ikke av tjenesten.

Det betyr at `service_types.maxDeltakere` var feil sted å lete. Kapasiteten
bor allerede riktig: `training_sessions_v2.maxParticipants`, én verdi per
økt. Kolonnen fantes fra før.

**Migrasjon kjørt:** `gruppe_okt_antall_settes_per_okt`

- `service_types.maxDeltakere` er nå nullable, uten standardverdi
- CHECK: `maxDeltakere IS NULL OR maxDeltakere > 0`
- `gruppe-oekt` satt til NULL med beskrivelsen «Antall deltakere settes når
  økta opprettes»

Feltet har nå tre betydninger, og alle tre er tydelige:

| verdi | betyr | tjenester |
|---|---|---|
| `1` | for én spiller | Flex 20/50/90, Performance, Performance Pro, WANG |
| `2` | alltid to | 2-til-1 90 min |
| `NULL` | settes når økta opprettes | Gruppe-økt |

`booking.html` viser «antall settes per økt» på gruppe-økt-kortet i stedet
for et tall den ikke har.

**Gjenstår i koden:** når en gruppe-økt opprettes i Workbench eller
Kalenderen, må skjemaet kreve `maxParticipants`. Uten det får du økter uten
kapasitet, og da vet ingen når gruppa er full. Det er den eneste delen av
P4 som fortsatt er kode.

---

## P5 · WANG som lokasjon — besluttet, ikke et problem

WANG Toppidrett Fredrikstad forblir **aktiv uten adresse**. Det er et
bevisst valg, ikke et hull:

- WANG er intern kontraktscoaching og bookes ikke utenfra
- Økter skal kunne legges på stedet, og det krever at lokasjonen er aktiv
- Adressen trengs først den dagen noen skal navigere dit fra en offentlig
  flate, og det finnes ingen slik flate

Står den her for at ingen skal «rette» den senere.

---

## Rekkefølge og avhengigheter

```
P1  schema.prisma          ──►  P2  Stripe-produktene
                                     (P2 trenger stripePriceId-kolonnen fra P1)

P3  webhook + userId       ──►  uavhengig, men haster mest i praksis
                                 hver dag den venter = flere eierløse betalinger

P4  gruppe-økt             ──►  basen er gjort. Rest: skjemaet som
                                 oppretter gruppe-økt må kreve maxParticipants

P5  WANG                   ──►  ferdig, bare dokumentert
```

## Hva som er ferdig når dette er gjort

- Prisma og basen sier det samme, og constraintene overlever en reset
- Abonnement kan faktisk tegnes, og havner i `subscriptions`
- Nye betalinger har eier, og økonomiflata kan begynne å fordele
- Gruppe-økt henter antallet fra økta, ikke fra tjenesten
