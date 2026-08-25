> STATUS: skrevet før designsystem-revisjonen juli 2026 — design-beslutninger i dag: `.claude/rules/beslutninger.md` §Tema/design (design-system-regel.md er slettet)

# AK Golf HQ — Platform PRD

## Visjon

AK Golf HQ er en helintegrert plattform som gir golfcoacher og spillere felles verktøy for treningsplanlegging, oppfølging og utvikling — fra første booking til langsiktig prestasjonsvekst.

---

## Tech stack

| Teknologi | Versjon / detalj |
|---|---|
| Next.js | 16, App Router, TypeScript strict, Turbopack |
| React | 19 |
| Prisma | 7 + Supabase (Postgres) |
| Tailwind CSS | v4, CSS-first via `@theme` i `globals.css` — INGEN `tailwind.config.ts` |
| Fonts | Poppins + Lora + IBM Plex Mono (fra Paper-porten; Train-lock-fasitens typografi er ikke levert ennå — LAUNCH-PLAN D2/D3). Inter Tight er fjernet |
| Ikoner | Lucide React — eneste tillatte bibliotek |
| Pakkebehandler | npm |

### Kritiske gotchas (alle agenter MÅ kjenne disse)

1. **Turbopack root-config:** `next.config.ts` MÅ ha `turbopack: { root: import.meta.dirname }` — ellers feiler Turbopack CSS-resolve lokalt.
2. **Prisma 7 connection-strings:** Koble-URL-er bor i `prisma.config.ts`, ikke i `schema.prisma`. Schema har bare `provider = "postgresql"`. Runtime bruker `@prisma/adapter-pg` med `DATABASE_URL` (pgbouncer-pooler). `prisma.config.ts` må laste `.env.local` eksplisitt med `dotenv.config({ path: ".env.local" })`.
3. **proxy.ts i stedet for middleware.ts:** Next.js 16 bruker `proxy.ts` for middleware (bare nodejs runtime, ikke edge). Det finnes ingen `middleware.ts` i dette prosjektet.
4. **Scripts MÅ importere `_env` først:** Alle `scripts/*.ts` MÅ ha `import "./_env"` som første import — FØR `@/lib/prisma` eller andre DB-avhengige imports. Ellers feiler DB-tilkoblingen (ESM import-rekkefølge).

---

## Tema

| Produkt | Tema | Regel |
|---|---|---|
| **PlayerHQ** (`/portal`) | Lyst | Aldri `.dark`-klasse på root. Alltid lyst tema. |
| **AgencyOS** (`/admin`) | Mørkt | `.dark`-klasse settes på root-elementet. Alltid mørkt tema. |

**Ingen tema-toggle** — verken nå eller i MVP. Begge paletter finnes i `globals.css`, men valget er låst per produkt og skal ikke eksponeres som brukervalg.

---

## Skjerm-gate (LÅST REGEL)

> **ENDRET 25.08.2026:** Designfasit er **Train-lock** for alle skjermer i PlayerHQ og AgencyOS
> (Anders, i økt). Claude Paper og port-dokumentene under er historikk. Fasit-zip er ikke
> committet ennå — se `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` D2/D3.

**FØR** du bygger, endrer eller kobler en skjerm:
1. Sjekk om skjermen har Train-lock-fasit (når zip-en er committet) — mangler den: STOPP og spør Anders.
2. Sjekk `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` — hvilken session hører skjermen til, og hva er status?
3. Jobb mot ferdig-definisjonen der (DONE-fil + verify + skjermbilde-gate).

En skjerm er **ikke ferdig** før ferdig-definisjonen er oppfylt og Anders har SETT skjermbildet:
mobil 390px + desktop, lys og mørk, fasit ved siden av, alle fire tilstander, maks én oransje handling,
klikk-verifisert.

---

## Brukertyper

### Spiller
**Hvem:** Golfspiller på alle nivåer, 15–50 år, tilknyttet AK Golf Academy, WANG Toppidrett eller Mulligan.
**Primært mål:** Se sin egen utvikling, gjennomføre planlagte treningsøkter og kommunisere med coach.
**Smertepunkt uten appen:** Treningsplanen lever i e-post eller papir, SG-data er spredt, ingen oversikt over fremgang mellom coachingøkter.

### Coach
**Hvem:** Anders Kristiansen og eventuelt Markus Røinås Pedersen — profesjonelle golfcoacher som driver spillerporteføljer.
**Primært mål:** Administrere alle spillere fra ett sted, planlegge og tildele treningsplaner, følge opp SG-data og treningsetterlevelse.
**Smertepunkt uten appen:** Tidkrevende manuell oppfølging per spiller, ingen samlet innsikt i porteføljens fremgang, booking og betaling i separate systemer.

### Forelder
**Hvem:** Foresatte til spillere under 18 år, primært i WANG- og junior-programmer.
**Primært mål:** Se barnets plan og aktivitet uten å forstyrre coachrelasjonen.
**Smertepunkt uten appen:** Ingen innsyn — må spørre barnet eller coachen direkte for statusoppdateringer.

### Admin
**Hvem:** Anders som plattformeier, eventuelt fremtidig driftsansvarlig.
**Primært mål:** Overvåke systemhelse, håndtere brukertilganger, se økonomirapporter og auditlogger.
**Smertepunkt uten appen:** Ingen samlet plass for å administrere drift, betaling og tilganger på tvers av produkter.

---

## Produkter

### PlayerHQ — `/portal`
**Formål:** Spillerens personlige trenings-OS der alt fra plan til data til coaching samles på ett sted.
**Primær bruker:** Spiller
**Kjerneflyt:**
1. Logger inn og ser dagens økt og mål på Hjem-dashbordet
2. Går til Gjennomføre og starter planlagt økt med live drill-logger
3. Etter økt: ser SG-oppdatering i Analysere-hubben
4. Sender ønskelig treningsøkt eller spørsmål til coach via Workbench
5. Sjekker fremgang mot sesongens mål i Mål-seksjonen

**Suksesskriterium:** Spilleren gjennomfører minst 3 av 5 planlagte ukesøkter og ser SG-fremgang innen 8 uker.

---

### AgencyOS — `/admin`
**Formål:** Coachens kontrollpanel for å administrere spillerportefølje, planlegge, følge opp og drive bookingvirksomheten.
**Primær bruker:** Coach
**Kjerneflyt:**
1. Åpner daglig brief med prioriterte spillere og ventende forespørsler
2. Åpner spiller-Workbench og justerer treningsplan eller tildeler ny økt
3. Gjennomgår SG-data og TrackMan-sesjon fra siste trening
4. Bekrefter eller avslår sesjonforespørsler fra spillere
5. Ser ukens økonomisammendrag og kapasitetsutnyttelse

**Suksesskriterium:** Coach bruker under 20 minutter per dag på administrativt arbeid per spiller i aktiv plan.

---

### Booking — `/booking`
**Formål:** Selvbetjent bookingflyt for enkeltøkter og coaching-pakker direkte fra markedsnettsiden.
**Primær bruker:** Ny eller eksisterende spiller (ikke-innlogget eller innlogget)
**Kjerneflyt:**
1. Velger tjeneste (Performance-økt, gruppetrening, simulator)
2. Velger dato og tilgjengelig tid
3. Betaler via Stripe checkout
4. Får kvittering og opprettes som bruker i systemet
5. Booking synkroniseres til coachens kalender og spillerens portal

**Suksesskriterium:** Konverteringsrate fra besøk til bekreftet booking over 15 %.

---

### Marketing — `/(marketing)`
**Formål:** Presentere AK Golf Group, generere leads og drive trafikk til booking og PlayerHQ-registrering.
**Primær bruker:** Potensiell ny spiller, forelder, journalist, sponsor
**Kjerneflyt:**
1. Lander på akgolf.no — ser tilbud, filosofi og resultater
2. Utforsker coaches, anlegg og treningsprogram
3. Klikker seg til booking eller registrering
4. Finner åpen statistikk (norske spillere, PGA Tour-data) som bygger troverdighet
5. Sender kontaktskjema eller registrerer seg direkte

**Suksesskriterium:** 30 % av nye PlayerHQ-brukere kommer organisk via markedssidene.

---

## Forretningsmodell

### Abonnement — PlayerHQ-tilgang
**Gratis** i tre tilfeller:
1. Første 30 dager (prøveperiode — alle nye brukere)
2. Aktiv coaching-pakke (Performance eller Performance Pro)
3. Deltaker i en gruppecoaching via AK Golf

**299 kr/mnd** for alle andre som ønsker full PlayerHQ-tilgang etter prøveperioden.

### Coaching-pakker
- **Performance:** 2 credits/mnd — individuelle coachingøkter
- **Performance Pro:** 4 credits/mnd — mer intensiv individuell oppfølging

Performance og Performance Pro er **pakker for antall coachingøkter**, ikke app-nivåer. De vises aldri som et abonnementsnivå i UI.

### ELITE-enum
`ELITE` finnes som verdi i Prisma-enumet `Tier` men er et **dødt felt**. Det skal aldri vises, velges eller refereres til i noe brukergrensesnitt. Årsak: tier-modellen er avviklet til fordel for coaching-pakker som grunnlag for gratis tilgang.

### Enkeltbooking
Coachingøkter, simulatortid og andre tjenester kan kjøpes enkeltvis via Booking-flyten uten abonnement.

---

## Suksesskriterier

1. **Treningsetterlevelse:** 70 % av aktive spillere gjennomfører minst 3 av 5 planlagte ukesøkter, målt rullerende 4 uker.
2. **SG-fremgang:** Gjennomsnittlig SG Total forbedres med +0,5 per spiller i løpet av en 12-ukers plan.
3. **Booking-konvertering:** Minst 15 % av unike besøkende på bookingsidene fullfører en bestilling.
4. **Abonnement-konvertering:** 25 % av prøveperiode-brukere uten coaching-pakke konverterer til 299 kr/mnd.
5. **Coach-effektivitet:** Gjennomsnittlig tid brukt per spiller per uke på administrasjon under 20 minutter.

---

## Ikke i scope

- **Separat repo per produkt:** Splittingen av monorepo til separate Next.js-prosjekter er ikke aktuelt før etter lansering. Alt bygges i ett repo.
- **GolfBox-integrasjon for handicap-oppdatering:** Leses fra GolfBox men skrives ikke tilbake — AK Golf er ikke handicap-administrasjonssystem.
- **E-commerce utover coaching:** Nettbutikk for utstyr (Skarpnord Golf Products) er ikke del av denne plattformen.
- **Multi-coach SaaS:** Plattformen er bygd for AK Golf-coacher, ikke som en white-label løsning for andre akademier — ennå.
- **Foreldreportal full funksjonalitet:** Foreldreskjermen gir lesetilgang; foreldre kan ikke endre planer eller kommunisere direkte med coach via plattformen i MVP.
