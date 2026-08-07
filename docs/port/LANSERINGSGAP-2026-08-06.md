# Lanseringsgjennomgang — AK Golf HQ

**Skrevet:** 06.08.2026 kveld · **Metode:** verifisert mot kildekoden, ikke mot dokumentasjon.
Alt under er sjekket i repoet. Der jeg ikke har kunnet verifisere noe, står det eksplisitt.

**Sammendrag:** grunnmuren er bedre enn i de fleste prosjekter på denne størrelsen. Det som
gjenstår er ikke arkitektur — det er *ferdigstillelse* av ting som er 80 % bygget.

> **⚠ Rettet 07.08.2026:** de to funnene som opprinnelig sto som «blokkerende for lansering»
> (GDPR-sletting og -eksport) **var feil** — begge deler var allerede bygget 02.08. Se B1 og B2.
> Etter rettelsen står det **ingen blokkerende funn** igjen i dette dokumentet. CI-problemet (P2)
> løste seg også selv natt til 07.08 — kjøringer fullfører normalt igjen.
>
> Det som fortsatt gjelder: P3 (branch protection), P4, P5, og hele Del 5 (manuell testing).

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

### 🟢 B1. Sletting av persondata — RETTET 07.08, var aldri blokkerende

> **Denne seksjonen var feil.** Den sto opprinnelig som rødt/blokkerende funn. Grok fanget opp
> feilen i nattrapporten 07.08, og den er nå verifisert i koden. Feilen står igjen her i sin
> helhet under, fordi en rettelse som skjuler hva som var galt ikke er en rettelse.

**Hva jeg påstod (feil):** «`anonymiser-bruker.ts` refererer verken Supabase Auth, Storage eller
Stripe» — og derfor at sletting ikke kaskaderer.

**Hva som faktisk stemmer (verifisert 07.08):** `src/lib/gdpr/slett-eksterne-data.ts` ble opprettet
**02.08.2026** (commit `9b89771`, «sikkerhet: komplett GDPR-eksport og -sletting (Steg 5)») og
gjør nettopp det jeg påstod manglet:

| Påstått mangel | Faktisk status | Bevis |
|---|---|---|
| Supabase Auth-bruker slettes ikke | ✅ Slettes | `sb.auth.admin.deleteUser(bruker.authId)` — linje 218 |
| Stripe-kunde slettes ikke | ✅ Slettes | `stripe.customers.del(sub.stripeCustomerId)` — linje 208 |
| Storage-filer slettes ikke | ✅ Slettes | `storageFilerFjernet`-teller, linje 119/139 |
| Ingen behandlingskø | ✅ Finnes | `/admin/gdpr` viser PENDING-køen |

`anonymiser-bruker.ts` **kaller** funksjonen på linje 205. Feilen min var å lese den filen isolert,
se at *den* ikke nevnte Auth/Storage/Stripe, og konkludere uten å følge importen — kombinert med
at jeg stolte på `docs/gdpr/rettigheter-status.md`, som selv var utdatert i forhold til
02.08-arbeidet.

**Lærdom verdt å ta med:** at et dokument sier «MANGLER» er ikke bevis på at noe mangler.
`rettigheter-status.md` bør oppdateres, ellers villeder den neste som leser den.

**Det som faktisk gjenstår (ikke blokkerende, men gjør det før lansering):**
- Tørrkjøring mot en testbruker — `dryRun` finnes nå (#375), aldri kjørt mot ekte data
- Ende-til-ende slettetest: be om sletting → cron kjører → verifiser at data faktisk er borte
  i Prisma, Supabase Auth, Storage og Stripe
- Verifiser om fil-**innhold** (bytes) skal med i eksporten, ikke bare manifestet

### 🟢 B2. Eksport av persondata — RETTET 07.08, var heller ikke blokkerende

**Hva jeg påstod (feil):** at `exportUserData()` utelater `CoachingSession.messages` og at filer
ikke eksporteres i det hele tatt.

**Faktisk:** eksporten inkluderer `coachingSessions` og et `_storageFiler`-manifest. Samme
rotårsak som B1 — utdatert kildedokument, ikke verifisert mot koden.

**Gjenstår:** avklar om manifest er nok, eller om fil-innholdet skal pakkes med. Det er en
juridisk vurdering (art. 20 «maskinlesbart format»), ikke en teknisk mangel.

### 🟠 B3. Feilmonitorering fanger ikke uventede feil *(korrigert 06.08 kveld)*

**Rettelse:** en tidligere versjon av dette dokumentet sa «ingen feilmonitorering». Det var feil.
`src/lib/error-tracking.ts` finnes og er gjennomtenkt:

- console.error → Vercel Logs
- `ErrorLog`-tabell i Prisma, med UI på `/admin/feillogg`
- Slack-webhook ved fatal/critical
- Telegram til Anders ved fatal/error, strupet til én per kontekst per 15. min
- **PII-sanitering før logging** (e-post, telefon, kortdata, tokens → `[REDACTED]`)
- 90 dagers retensjon på feillogg, som en uttalt forpliktelse fra personvernerklæringen

Dette er bedre enn i mange produksjonssystemer, og nedgraderer funnet fra rødt til oransje.

**Det som faktisk mangler:** systemet fanger kun feil koden *velger* å logge via `logError()` i
en `try/catch`. Det fanger **ikke**:
- Uventede unntak utenfor try/catch
- Klientside-krasj (React-feil, hydration-mismatch)
- Feil i tredjeparts-kode
- Feil som skjer før JS lastes

Produksjonsincidenten 11.07–05.08 (prod nede ~3 uker, 394 brukere) er illustrerende: P1001-feilen
var en tilkoblingsfeil som slo til før noe applikasjonslag rakk å logge den.

**Tiltak:** enten en automatisk unntaksfanger (Sentry e.l. — krever ny pakke, se §Grok-oppgave C),
eller — som et billigere første steg — en `ErrorBoundary` på rotnivå som sender klientfeil til
`logError()`, pluss en helsesjekk som varsler når appen ikke svarer. Det siste krever ingen ny
avhengighet.

---

## Del 3 — Bør fikses før lansering

### 🟠 P1. Rate limiting på 12 av 57 API-ruter

Mønsteret finnes (`src/lib/rate-limit.ts`, Upstash). 45 ruter mangler det, inkludert ruter som
treffer database og eksterne API-er. Dette er mekanisk arbeid — trygt å delegere.

### 🟢 P2. CI kjører ikke — LØST AV SEG SELV 07.08

Kvelden 06.08 sto jobber i kø til de ble avbrutt (35+ min, tom steg-liste — de startet aldri).
Natt til 07.08 begynte de å kjøre normalt igjen; kjøringer kl. 06:27 og 06:39 fullførte grønt.

**Årsak: forbigående feil hos GitHub, ikke i konfigurasjonen.** `ci.yml` ble lest gjennom og er
korrekt — `runs-on: ubuntu-latest`, ingen concurrency-grupper som kansellerer, ingen blokkerende
`if`-betingelser. Ingen endring var nødvendig.

**Konsekvens:** «Require status checks» i branch protection (P3) er nå mulig — det var det ikke
mens runnerne lå nede.

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
