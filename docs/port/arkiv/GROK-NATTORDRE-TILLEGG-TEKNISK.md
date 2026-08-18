> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Nattordre — teknisk tillegg (workflows / agent-team)

**Skrevet:** 06.08.2026 kveld · **Utvider:** `GROK-NATTORDRE-2026-08-06.md`
**Kilde for funnene:** `LANSERINGSGAP-2026-08-06.md` (verifisert mot kildekoden)

Dette dokumentet er strukturert for **parallell kjøring med agent-team**. Hver strøm har
eksplisitte fil-grenser slik at agenter ikke kolliderer. Les §0 før du fordeler arbeid.

---

## 0. Slik parallelliseres dette trygt

**Fem uavhengige strømmer.** De rører disjunkte filer og kan kjøre samtidig:

| Strøm | Oppgave | Filområde (eksklusivt) | Risiko |
|---|---|---|---|
| **S1** | Skjermport (hoveddokumentet) | `src/app/**/page.tsx`, `src/components/**` | Lav |
| **S2** | Rate limiting | `src/app/api/**/route.ts` | Lav |
| **S3** | Bredde-gate i CI | `scripts/` | Lav |
| **S4** | GDPR-kaskade | `src/lib/gdpr/**`, `src/app/api/cron/cleanup-deleted-accounts/` | **Høy — les §C** |
| **S5** | Feilfangst klientside | `src/app/error.tsx`, `global-error.tsx`, `src/lib/error-tracking.ts` | Middels |

**Regler for parallell kjøring:**
1. **Én agent eier ett filområde.** To agenter skal aldri redigere samme fil.
2. **Hver strøm = egen branch = egen draft-PR.** Aldri én PR på tvers av strømmer.
3. **Ingen strøm rører `prisma/schema.prisma`, `.env*`, `vercel.json` eller
   `.github/workflows/`** — de er forbudt for alle (se hoveddokumentet §6).
4. **S4 og S5 skal ikke merges av noen.** De krever menneskelig gjennomgang uansett hvor
   grønne testene er.
5. Blir to strømmer avhengige av hverandre: **stopp den ene**, noter i
   `AAPNE-SPORSMAL.md`, la den andre fullføre. Ikke koordiner rundt en konflikt — unngå den.

**Verifisering per strøm:** `npm run verify && npm test` grønt før commit. CI er nede i natt
(se hoveddokumentet), så lokal kjøring er eneste reelle gate.

---

## Oppgave A — Rate limiting (strøm S2)

Se hoveddokumentet §4b, oppgave A. Uendret.

**Parallelliseringstips:** de 45 rutene er helt uavhengige av hverandre. Dette er den
enkleste oppgaven å dele på flere agenter — f.eks. én agent per undermappe i `src/app/api/`.
Sørg bare for at ingen to agenter tar samme rute.

---

## Oppgave B — Bredde-gate i CI (strøm S3)

Se hoveddokumentet §4b, oppgave B. Uendret.

**Ikke parallelliser denne** — det er ett skript, én agent.

---

## Oppgave C — GDPR-kaskade (strøm S4) ⚠ HØYRISIKO

### Les dette først

Denne oppgaven berører **irreversibel sletting av ekte brukerdata** på tvers av tre systemer
(Supabase Auth, Supabase Storage, Stripe). Dataene tilhører blant annet **mindreårige**.

**Den absolutte grensen for natten:**

> **Du skriver koden. Du kjører den ALDRI mot ekte data.**

Konkret betyr det:
- ✅ Skriv funksjonene, med tester
- ✅ Kjør enhetstester med mock/stub av Supabase- og Stripe-kallene
- ❌ **ALDRI** kjør cronen eller slettefunksjonen mot produksjonsdatabasen
- ❌ **ALDRI** kall Supabase Admin API eller Stripe API med ekte nøkler
- ❌ **ALDRI** merge PR-en

PR-en blir liggende til Anders kjører den manuelt mot en testbruker først. Det er ikke
overforsiktighet: en feil her sletter data som ikke kan hentes tilbake, og en agent kan ikke
verifisere at den traff riktig bruker.

### Situasjonen (verifisert)

Anonymisering framfor sletting er et **bevisst valg** av Anders 28.07.2026, godt begrunnet i
`src/app/api/cron/cleanup-deleted-accounts/route.ts`: treningshistorikk beholdes for
akademiets utviklingsarbeid, persondata og fritekst vaskes. **Ikke endre den beslutningen.**

Problemet er at vasken ikke når hele veien. `src/lib/gdpr/anonymiser-bruker.ts` refererer
verken Supabase Auth, Storage eller Stripe (verifisert med grep — null treff).

### Hva som skal bygges

Utvid anonymiseringen slik at den også dekker:

1. **Supabase Auth-brukeren.** I dag blir `auth.users`-raden liggende. Enten slett den, eller
   anonymiser e-post/metadata på samme måte som Prisma-raden. **Velg samme prinsipp som
   resten av funksjonen følger** — ikke innfør en ny filosofi.
2. **Storage-filer.** Video, lyd og vedlegg i Supabase Storage følger ikke med. Finn hvilke
   buckets/stier som hører til en bruker, og rydd dem.
3. **Stripe-kunden.** `stripeCustomerId`-referansen forsvinner med Prisma-raden, men kunden
   består hos Stripe. Anonymiser eller slett kunden der.
4. **Behandlingskø.** `DataExportRequest` med status PENDING vises ingen steder. Bygg en enkel
   visning for coach/admin så ingen forespørsel blir liggende usett. **Dette punktet er trygt**
   — det er ren lesing, ingen sletting. Ta gjerne dette først.

### Krav til koden

- **Idempotent.** Kjøres den to ganger på samme bruker, skal ikke andre gang feile eller
  slette noe ekstra.
- **Transaksjonell der det går.** Feiler Stripe-kallet, skal ikke DB-raden allerede være borte
  — da har du en bruker som er halvt slettet og umulig å rydde opp i.
- **Logget.** Hvert steg via `logError`/audit, så det er sporbart hva som faktisk ble gjort.
- **Testet med stubs.** Enhetstester som beviser: full kjøring, delvis feil (Stripe nede),
  og gjentatt kjøring.
- **Tørrkjøringsmodus.** Bygg inn en `dryRun`-parameter som logger hva den *ville* gjort uten
  å gjøre det. Det er slik Anders skal verifisere den i morgen.

### Eksport (samme strøm)

`exportUserData()` utelater `CoachingSession.messages` og **alle filer**. Utvid den. Dette er
lavrisiko — eksport leser data, sletter ingenting. Ta det gjerne før slettedelen.

---

## Oppgave D — Feilfangst klientside (strøm S5)

### Situasjonen (verifisert — merk rettelsen)

`src/lib/error-tracking.ts` er **allerede god**: Prisma-logg, `/admin/feillogg`-UI,
Slack ved critical, Telegram til Anders, PII-sanitering, 90 dagers retensjon.

Det den ikke fanger: feil som aldri når en `logError()`-setning — uventede unntak,
React-krasj, hydration-mismatch, feil før JS lastes.

### Hva som skal bygges (uten nye pakker)

1. **Rot-`ErrorBoundary`** som fanger klientside-React-feil og sender dem til `logError()`
   via en liten API-rute. `src/app/global-error.tsx` finnes allerede — utvid den framfor å
   lage noe nytt ved siden av.
2. **Dekning på `error.tsx`:** 70 av 455 ruter har det. Legg til på de viktigste flatene
   (`/portal`, `/admin`, `/forelder` på rotnivå dekker mye).
3. **`not-found.tsx`:** finnes for 6 av 455 ruter. Lag **ett** mønster og legg det på rotnivå
   per produktområde. Mønsterdokumentet §12 sier at en ekte 404 er udekket i Paper-biblioteket
   — bruk `Banner tone="info"`-mønsteret, ikke `EmptyState` (som er for datatilstander).

### Om Sentry

Ekstern feilmonitorering krever **ny npm-pakke**, og `CLAUDE.md` §Arbeidsregler sier
dependencies alltid er «be Anders før». Anders har bedt om feilmonitorering, men har ikke
eksplisitt godkjent en pakkeinstallasjon.

**Derfor:** bygg punkt 1–3 over, som ikke krever noen ny avhengighet. Skriv et kort forslag i
nattrapporten om hva en Sentry-installasjon ville krevd (pakke, DSN, env-variabel, kostnad),
så tar Anders den beslutningen våken. **Ikke installer noe i natt.**

---

## Oppgave E — Branch protection og CI-runners

**Dette kan ingen agent gjøre.** Det er kontoinnstillinger i GitHub, ikke kode:

- **Branch protection på `main`:** krev godkjenning fra en annen enn PR-åpneren.
  (Settings → Branches → Add rule)
- **CI-runners:** jobber blir stående i kø til de avbrytes. Verifisert i kveld: både
  `workflow_dispatch` og `rerun` satt fast i 35+ min uten at noen runner tok dem.
  (Settings → Actions → Runners / Actions-tillatelser)

**Grok skal ikke forsøke dette.** Skriv det i nattrapporten som «krever Anders i GitHub-UI».

Merk at CI-problemet påvirker alle strømmene: ingen PR i natt blir CI-verifisert. Lokal
`npm run verify && npm test` er eneste gate, og skal derfor kjøres fullt ut hver gang.

---

## Prioritering hvis natten blir for kort

1. **S1 skjermport** — det Anders primært ba om
2. **S2 rate limiting** — mekanisk, høy verdi, lav risiko
3. **S5 feilfangst** — beskytter alt annet
4. **S3 bredde-gate** — låser designkvaliteten permanent
5. **S4 GDPR** — viktigst for lansering, men **også den som tåler best å vente**, fordi den
   uansett ikke kan merges uten Anders' manuelle verifisering

Rekker du ikke S4: skriv i nattrapporten hva som gjenstår. Det er langt bedre enn halvferdig
slettekode som ser komplett ut.
