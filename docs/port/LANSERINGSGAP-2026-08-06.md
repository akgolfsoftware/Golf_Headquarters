# Lanseringsgjennomgang — AK Golf HQ

**Skrevet:** 06.08.2026 kveld · **Metode:** verifisert mot kildekoden, ikke mot dokumentasjon.
Alt under er sjekket i repoet. Der jeg ikke har kunnet verifisere noe, står det eksplisitt.

**Sammendrag:** grunnmuren er bedre enn i de fleste prosjekter på denne størrelsen. Det som
gjenstår er ikke arkitektur — det er *ferdigstillelse* av ting som er 80 % bygget, pluss to
hull som er alvorlige nok til å utsette lansering.

---

## Del 1 — Det som allerede holder høy standard

Verdt å si først, fordi det påvirker hvor mye arbeid som faktisk gjenstår:

| Område | Status | Bevis |
|---|---|---|
| **Stripe-idempotens** | ✅ Riktig gjort | `webhook/route.ts` bruker `markerBehandlet(event.id)` + `angreBehandlet()` ved feil. Dette er selve fellen folk går i med betalinger — den er unngått. |
| **Backup / DR** | ✅ Dokumentert | `runbook.md`: daglig backup, PITR, RTO 1–2 t, med uttalt oppgraderingsterskel |
| **Autorisasjon** | ✅ Håndhevet i CI | `check-action-auth.mjs` kjører i `verify`. Coach-scoping i spørringer (`coachScopedPlayerWhere`) |
| **IDOR-testing** | ✅ Finnes | `coach-scope-idor.spec.ts`, `auth-guard.spec.ts` |
| **Samtykkegating** | ✅ Bygget | Helsedata bak `hentSamtykkeStatus` + `innsynsNivaaFra` + maskering |
| **Institusjonell hukommelse** | ✅ Uvanlig sterk | `gotchas.md` er bedre enn i de fleste selskaper — hver produksjonsfeil er skrevet ned med rotårsak |
| **Enhetstester** | ✅ 150 filer | Domenelogikk (SG, hcp, ak-kategori, fys-score) er dekket |

Dette er ikke et prosjekt som mangler ingeniørkvalitet. Det mangler **lukking**.

---

## Del 2 — Blokkerende for lansering

### 🔴 B1. Sletting av persondata fungerer ikke (GDPR art. 17)

**Kilde:** `docs/gdpr/rettigheter-status.md` — dokumentet sier selv «MANGLER for lanseringsnivå».

Konkret, med deres egne ord:
- **Supabase Auth-brukeren slettes ikke.** Cronen sletter kun Prisma-raden. Kontoen består.
- **Storage-filer slettes ikke** (video, lyd, vedlegg)
- **Stripe-kunden slettes/anonymiseres ikke**
- **Ingen behandlingskø:** `DataExportRequest` med status PENDING vises ingen steder — ingen ser
  at noen har bedt om sletting
- Foresatt-slettekrav oppretter kun en forespørsel; koden sier selv *«Faktisk kaskade-sletting
  gjøres IKKE her — krever manuell behandling»*

**Hvorfor dette blokkerer:** dere behandler **helsedata om mindreårige** (søvn, hvilepuls,
skadelogg, symptomer) med foreldresamtykke. En slettefunksjon som ikke sletter, og en slettekø
ingen overvåker, er ikke en teknisk gjeld — det er et avvik et tilsyn reagerer på.

**Ikke la en agent gjøre dette over natten.** Det rører `auth.users`, Storage og Stripe-kunder —
irreversibel sletting av ekte brukerdata. Krever en våken person og en testkjøring mot en
testbruker først.

### 🔴 B2. Eksport av persondata er ufullstendig (GDPR art. 20)

`exportUserData()` utelater bl.a. `CoachingSession.messages`, og **filer eksporteres ikke i det
hele tatt** — kun DB-rader. En bruker som ber om «alt dere har om meg» får ikke alt.

### 🔴 B3. Ingen feilmonitorering i produksjon

**Verifisert:** ingen Sentry, Datadog, Bugsnag eller tilsvarende i `package.json`.

Konsekvens: når noe brekker for en ekte bruker, får dere det ikke å vite. Dere oppdager det
når noen ringer. `/admin/feillogg` finnes, men fanger kun det appen selv velger å logge —
ikke uventede unntak, hydration-feil eller klientkrasj.

**Sammenlign med produksjonsincidenten 11.07–05.08:** prod var nede i ~3 uker for 394 brukere
før rotårsaken ble funnet. Med feilmonitorering ville P1001-feilen vært synlig samme dag.
Dette er det billigste tiltaket med størst effekt i hele lista.

---

## Del 3 — Bør fikses før lansering

### 🟠 P1. Rate limiting på 12 av 57 API-ruter

Mønsteret finnes (`src/lib/rate-limit.ts`, Upstash). 45 ruter mangler det, inkludert ruter som
treffer database og eksterne API-er. Dette er mekanisk arbeid — trygt å delegere.

### 🟠 P2. CI kjører ikke

Verifisert i kveld: jobber blir stående i kø til de avbrytes. `ci.yml` har en kommentar fra
19.07 om samme problem. **Uten CI er lokal kjøring eneste gate** — og lokal kjøring kan hoppes
over av den som har det travelt.

### 🟠 P3. Ingen branch protection på `main`

06.08 ble 34 PR-er self-merget av samme konto som åpnet dem, alle med «Venter på Anders' ja» i
beskrivelsen. Uten en regel som krever godkjenning fra en annen part, gjentar det seg.

### 🟠 P4. `not-found.tsx` finnes for 6 av 455 ruter

En bruker som treffer en død lenke får Next.js sin standardside — ikke deres. Mønsterdokumentet
§12 sier eksplisitt at en ekte 404 er udekket i Paper-biblioteket. Ett felles mønster dekker alle.

### 🟠 P5. Designregler uten håndheving

`monsterdokument-paper.md` har testbare regler, men kun farger har en CI-gate
(`check-token-gap.mjs`). Layout har ingen — derfor kunne 280 sider mangle kolonnebredde uten at
noen merket det. **Utvid gaten til å feile på `<V2Shell>` uten eksplisitt `bredde`-prop.**

---

## Del 4 — Kvalitetsheving (etter lansering er greit)

- **Domenelogikk:** 11 filer i `src/lib/domain/`, 3 med tester. Dette er forretningskritisk
  regnestykke (SG, kategori, score) — bør ha nær 100 % dekning, ikke 27 %.
- **`error.tsx`:** 70 av 455 ruter. En uventet feil i de øvrige 385 gir standard feilside.
- **A11y ikke enhetsverifisert:** `fase-d-enhetsverifisering.md` sier selv at touch-gulvet
  (WCAG 2.5.5) er *kildelest, ikke målt*. Trenger en runde på ekte enhet.
- **IA-konsolidering:** 8 AgencyOS-flater konkurrerer om «her er det som venter på deg».
  ~12 dublett-skjermer. Se `GROK-NATTORDRE-2026-08-06.md` §4.
- **«Kommer snart»-skjermer i produksjon:** AI-coach, tilkoblede økter, BankID. Fjern heller
  enn å love.

---

## Del 5 — Det en erfaren utvikler ville testet manuelt før lansering

Ingen av disse kan verifiseres med statisk analyse. De må gjøres av et menneske:

**Penger (høyest innsats):**
1. Kjøp abonnement med ekte kort → sjekk at tilgang gis, faktura kommer, webhook traff
2. Avbestill → sjekk at Stripe faktisk stopper trekk (dette var en ekte bug 13.07)
3. Kort utløper / betaling feiler → hva ser brukeren?
4. Refusjon → hva skjer med tilgangen?

**Roller og tilgang:**
5. Logg inn som spiller → prøv å åpne en `/admin`-URL direkte
6. Logg inn som coach A → prøv å åpne coach B sin spiller via URL-manipulering
7. Foresatt → bekreft at hen kun ser egne barn
8. Utløpt/slettet bruker → hva skjer med en gammel sesjon?

**Mindreårige og samtykke:**
9. Registrer en bruker under 16 → bekreft at samtykke faktisk kreves før data samles
10. Foresatt trekker samtykke → bekreft at helsedata faktisk skjules
11. Be om sletting → **følg den hele veien og bekreft at data faktisk er borte** (se B1)

**Drift:**
12. Slå av nett midt i en økt → kommer dataene inn når nettet er tilbake? (PWA-løftet)
13. Last inn appen på 3G → hvor lang tid til første meningsfulle innhold?
14. Kjør en full restore fra backup til et testmiljø — **en backup er ikke verifisert før den
    er gjenopprettet minst én gang**

**Innhold:**
15. Les gjennom all UI-tekst med friske øyne — norsk bokmål, ingen engelske rester,
    ingen «Lorem», ingen utviklerspråk lekket til brukeren

---

## Del 6 — Anbefalt rekkefølge

**Denne uka (blokkerende):**
1. Feilmonitorering inn (B3) — halvdags jobb, størst effekt
2. GDPR-sletting fullført og testet (B1) — krever våken person
3. Eksport komplettert (B2)

**Før lansering:**
4. Rate limiting på de 45 rutene (P1) — kan delegeres
5. CI i gang igjen (P2) + branch protection (P3)
6. 404-mønster (P4) + bredde-gate i CI (P5)
7. Manuell testrunde, Del 5 — særlig punkt 1–4 (penger) og 9–11 (mindreårige)

**Etter lansering:**
8. Domenetestdekning opp
9. IA-konsolidering
10. A11y på enhet

---

## Ærlig vurdering

Spørsmålet var hva som skal til for 10/10. Svaret:

**Design/UX:** ligger i dag på ca. 7/10 — sterkt designsystem, svak håndheving. Bredde-gaten
i CI + IA-konsolideringen tar det til 9. Den siste tienden er polering som først gir mening
etter at ekte brukere har vært innom.

**Datasikkerhet:** grunnmuren er 8/10 (RLS, autorisasjonssjekk i CI, IDOR-tester, idempotente
webhooks, samtykkegating). Men **GDPR-rettighetene drar det ned til 5/10 samlet**, fordi
sletting og eksport er de to tingene en bruker faktisk kan kreve, og begge er ufullstendige.
Fikset man kun B1+B2+B3, går sikkerheten fra 5 til 9.

Det som mangler er ikke kompetanse eller arkitektur. Det er at de siste 20 % av tre ting —
sletting, eksport, observabilitet — aldri ble lukket, og at ingenting i verktøykjeden tvinger
dem til å bli det.
