# Portplan — fra designfasit til akgolf-hq

**Skrevet:** 02.08.2026
**Fra:** Claude Design `605a48cc` · `fase1/` (19 flater) + `components/` (78 komponenter)
**Til:** `~/Developer/akgolf-hq` · Next.js · Prisma · Supabase `dcnxoztjtdqoidaekxry` · Vercel

---

## Om ordet

«Portere» er riktig nok, men litt upresist for det som faktisk skal skje.
Flatene i `fase1/` er ikke et system som skal flyttes — de er **fasit**: én
statisk HTML-fil per skjerm som viser hvordan skjermen skal se ut og oppføre
seg, med demo-data hardkodet inn.

Jobben er å bygge skjermen på nytt i appen, med ekte data, og bruke fasiten
som dom over resultatet. Komponentbiblioteket i `components/` er derimot
ekte React og kan flyttes tilnærmet som det er.

To ulike operasjoner, og de må ikke blandes:

| | Hva | Hvordan |
|---|---|---|
| `components/` | 78 React-komponenter, `@layer`-migrert, tokens | **Flyttes** — kopieres inn, brukes |
| `fase1/` | 19 statiske HTML-flater med demo-data | **Bygges om** — fasit, ikke kilde |

---

## Fase 0 · Kartlegging — må gjøres først, og den kan endre resten

**Dette er ikke en formalitet.** Jeg har ikke sett repoet. Alt under Fase 1
og utover er skrevet ut fra hva designprosjektet og Supabase sier, og
rekkefølgen kan endre seg når du har svart på dette.

Kjør i Claude Code og skriv ned svarene:

1. **Hva finnes av skjermer i dag?** List rutene under `src/app/`. Hvilke av
   de 19 fasitflatene har allerede en rute, og hvilke er nye?
2. **Er tokens allerede inne?** Finnes `akhq-tokens.css` i repoet, eller har
   appen sitt eget stilsystem? Dette avgjør om Fase 1 er «kopier inn» eller
   «erstatt et system».
3. **Brukes komponentbiblioteket?** Er noen av de 78 komponentene allerede
   importert, eller bygger appen på shadcn/Tailwind/noe annet?
4. **Hvordan hentes data?** Server Components med Prisma direkte, API-ruter,
   eller Supabase-klient i nettleseren? Avgjør hvordan hver skjerm kobles.
5. **Finnes det en `/admin/agencyos`-nav fra før?** `guidelines/kodeordre-agencyos.md`
   beskriver en nav-struktur som kan være delvis bygget.

**Leveranse fra Fase 0:** en tabell med 19 rader — flate, finnes ruten,
bruker tokens, bruker biblioteket, datakilde OK. Den tabellen er det som
styrer resten.

---

## Rekkefølgen bestemmes av data, ikke av hvor ferdig designet ser ut

Dette er det viktigste valget i planen, og det er lett å ta feil.

Fristelsen er å starte med den peneste flata. Riktig kriterium er om
**dataene finnes**. En skjerm portet mot en tom tabell er ikke ferdig — den
er en ny demo, i et dyrere format, som ser ferdig ut for alle som ser den.

Målt i Supabase 02.08.2026:

### Grønn — data finnes, kan portes nå

| Flate | Tabeller | Rader |
|---|---|---|
| **Innlogging** | `users` | 28 |
| **Workbench · Turneringer** | `tournaments`, `tournament_entries`, `training_periods` | 447 / 6 / 5 |
| **Booking (offentlig)** | `service_types`, `locations`, `coach_availability`, `bookings` | 10 / 4 / 13 / 6 |
| **Økonomi** | `payments` | 11 |

Økonomi står i grønt selv om betalingene mangler `userId` — flata er bygget
for å si det høyt i stedet for å skjule det. Den kan portes som den er, og
blir bedre av seg selv når P3 i arbeidsordren er gjort.

### Gul — tabellene finnes, men er tomme eller halve

| Flate | Problem |
|---|---|
| **PlayerHQ · Booking** | `subscriptions` har 0 rader. Saldoen «2 av 2 igjen» har ingenting å lese fra før P2 er gjort. |
| **PlayerHQ · Meg** | Samme — abonnementskortet henger på `subscriptions`. |
| **Foreldreportal** | `parent_relations` 0, `helse_samtykker` 0, `lyd_samtykker` 1. Flata virker, men det finnes ingen ekte foresatt å logge inn som. |
| **Spillere / Spillerprofil** | Seks av sju spillere er `Spiller B`–`G`, merket demo. |

Gul betyr **ikke** vent med å porte. Det betyr: port skjermen, og godta at
den viser tomtilstand til dataene kommer. Alle fire flatene har allerede
ekte tomtilstander — det var derfor de ble tegnet.

### Rød — modellen finnes ikke

| Flate | Mangler |
|---|---|
| **AgenticOS** | `AiModel`, `RoutingRule`, `AiPrompt`, `AiCost` finnes ikke som tabeller. Kun `agent_runs` finnes — og den har 3 182 rader, så agentfanen har faktisk dekning. |
| **AgencyOS · Innstillinger** | Konsern og selskaper finnes ingen steder i basen. Bare i Notion. |

Rød betyr: datamodellen må bygges før skjermen. Porter du disse nå, bygger
du et grensesnitt mot noe som ikke finnes, og du oppdager først etterpå
hvilke felt som mangler.

---

## Fase 1 · Fundamentet (før noen skjerm)

Rekkefølgen internt er ikke valgfri — hvert steg forutsetter det forrige.

**1.1 Tokens inn som eneste kilde.**
`tokens/akhq-tokens.css` inn i appen, importert én gang i rot-layouten.
Finnes det et konkurrerende system fra før, må det avgjøres nå om det skal
erstattes eller leve side om side. **Side om side er den dyre løsningen** —
to token-systemer betyr at hver komponent kan style seg fra to steder, og
feilklassen vokser med hver skjerm.

**1.2 Komponentbiblioteket inn.**
78 komponenter fra `components/`. Alle er `@layer`-migrert (fullført
28.07), og `guidelines/lagsjekk.mjs` er en stående portsjekk som returnerer
`ok: false` på CSS utenfor `@layer`.

**Kjør lagsjekken i appens CI.** Uten den er lagdisiplinen en engangsmåling
som forfaller ved første nye komponent.

**1.3 Én skjerm som pilot — Innlogging.**
Den er minst, har færrest avhengigheter, og er den eneste som må virke før
noen av de andre kan testes med ekte bruker. Går denne gjennom, er
fundamentet bevist. Går den ikke, har du oppdaget det på én skjerm i stedet
for på ni.

---

## Fase 2 · De grønne (fire flater)

Én skjerm om gangen, i denne rekkefølgen:

1. **Innlogging** — pilot, se 1.3
2. **Booking (offentlig)** — inntektsbærende, og eneste flate en fremmed ser
3. **Workbench · Turneringer** — mest ekte data (447 turneringer), null avhengigheter til Stripe
4. **Økonomi** — leser bare `payments`, ingen skriving

Per skjerm, samme løype hver gang:

- Bygg ruten med komponenter fra biblioteket
- Koble data — ekte spørring, ingen mock
- Kjør fasiten og appen side om side på 390, 430, 834, 1440, 1920 i lys og mørk
- Mål: clay ≤ 1, ingen trykkflate under 44 px, ingen horisontal scroll,
  ingen JS-feil, ingen hex utenfor tokenblokka
- **Sjekk at siden ikke er tom.** Denne målingen kom av at `booking.html`
  mistet hele body-markupen 02.08 og bestod alle de andre målingene
  trivielt — null clay, null små trykkflater, null feil.

---

## Fase 3 · De gule (fire flater)

Krever at P2 og P3 i `kart/arbeidsordre-kodepunkter-2026-08-02.md` er gjort
først — ellers porterer du saldovisninger mot en tom tabell.

5. **PlayerHQ · Meg**
6. **PlayerHQ · Booking**
7. **Foreldreportal**
8. **Spillere + Spillerprofil** — trenger ekte stall inn først: fire aktive
   i akademiet, elleve på WANG

---

## Fase 4 · Resten av AgencyOS

9. Konsoll (desktop + mobil)
10. Innboks (desktop + mobil)
11. Kalender (desktop + mobil)
12. Workbench (desktop + mobil)
13. FangstSheet
14. PlayerHQ I dag / Plan / Analyse

Disse er større, men ikke vanskeligere — når fundamentet står og fire
skjermer er gjennom løypa, er resten repetisjon.

---

## Fase 5 · De røde

15. **AgenticOS** — datamodellen først: `AiModel`, `RoutingRule`, `AiPrompt`,
    `AiCost`. Agentfanen kan bygges før de andre, siden `agent_runs` har
    3 182 rader.
16. **Innstillinger** — konsern og selskaper må bli tabeller først

---

## Tre feller

**Å porte alle skjermene samtidig.** Nitten halvferdige ruter er verre enn
fire ferdige. Én om gangen, hele veien gjennom målingen, før neste starter.

**Å la fasiten og appen drive fra hverandre.** Når en skjerm er portet, er
appen sannheten — ikke HTML-fila. Endres noe i appen, skal fasiten enten
oppdateres eller markeres som utdatert. To sannheter om samme skjerm er
samme feilklasse som prisen som sto tre steder.

**Å porte mot demo-data.** Øyvind Rohjan er demo-kanon og skal være det.
Men `Spiller B`–`G` skal ikke inn i appen — de er fyll som ser ut som data,
og i appen vil ingen huske at de var fyll.

---

## Hva jeg trenger fra deg for å gå videre

Svarene fra Fase 0. Særlig punkt 2 og 3 — om appen allerede har et
stilsystem og om biblioteket er i bruk. De to avgjør om Fase 1 er en
ettermiddag eller en uke, og de kan snu rekkefølgen i planen.
