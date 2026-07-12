# GDPR-rettigheter — status i koden (G2)

> Hva som faktisk FINNES i koden per 2026-07-12 (verifisert mot filene), og hva som
> MANGLER for lanseringsnivå. Søsterdokument: `datakart.md` (hva vi lagrer) og
> `personvernerklaering-utkast.md` (hva vi lover).

## 1. Innsyn og dataportabilitet (art. 15 + 20)

### Finnes

| Funksjon | Fil | Hva den gjør |
|---|---|---|
| Selvbetjent eksport (spiller) | `src/app/portal/meg/innstillinger/actions.ts` → `exportUserData()` | Samler User (inkl. bookinger, foreldre-relasjoner) + goals, rounds, tournamentEntries, seasonPlans, trainingSessionsV2, testResults, trackManSessions, payments, notifications, healthEntries, equipmentBag, caddieMessages. Returnerer JSON som lastes ned i klienten, sender e-postkvittering (Resend), skriver `AuditLog` («gdpr.data_exported»). |
| Eksport-UI | `src/app/portal/meg/innstillinger/personvern/personvern-actions.tsx` | Last ned-knapp → JSON-fil `akgolf-data-export-<dato>.json`. |
| Foresatt-eksport (barn) | `src/app/forelder/samtykke/eksport/route.ts` (GET) | Forelder/admin får JSON med egen profil + hvert godkjent barns profil, bookinger, betalinger, runder, øktlogger og varsler. Skriver `DataExportRequest` (COMPLETED) + audit. |
| Sporbar forespørsel | `src/app/forelder/samtykke/actions.ts` → `beOmDataeksport()` | Oppretter `DataExportRequest` (type EXPORT, PENDING) med subjekt-tilgangskontroll (godkjent `ParentRelation` kreves) + audit. |
| Datamodell | `prisma/schema.prisma` → `DataExportRequest` | userId, subjectUserId, type EXPORT/DELETE, status PENDING/COMPLETED/REJECTED. |

### Mangler / gap

- **Eksporten er ufullstendig.** `exportUserData()` tar IKKE med bl.a.: `CoachingSession.messages`
  (direkte-meldinger med coach), `MessageAttachment`, `CoachNote` (coachens notater om spilleren
  omfattes av innsynsretten), `SessionRecording` (transkript/AI-analyse), `SessionVideo`/
  `PlayerSwingVideo`, `Leave` (skadedata), `TalentTracking`, `Shot`/`HoleScore`-detaljer,
  `TrainingLog`, `Document`, `Subscription`. E-postkvitteringen påstår at «meldinger» og «utstyr»
  er med — delvis riktig (kun caddie-meldinger).
- **Filer eksporteres ikke** — kun DB-rader. Video/lyd/vedlegg i Supabase Storage følger ikke med.
- **Foresatt-eksporten er smalere enn spiller-eksporten** (ingen helsedata, mål, tester) — OK som
  minimum, men bør harmoniseres.
- **Ingen behandlingskø:** `DataExportRequest`-rader med status PENDING vises ikke i noe
  admin-UI (grep: ingen treff i `src/app/admin`). REJECTED settes aldri av kode.

## 2. Sletting (art. 17)

### Finnes

| Funksjon | Fil | Hva den gjør |
|---|---|---|
| Selvbetjent kontosletting | `src/app/portal/meg/innstillinger/actions.ts` → `deleteUserAccount()` | Krever bekreftelsesordet «SLETT» (zod). Setter `User.deletedAt = now()` (soft delete), e-post til bruker + support, 30 dagers angrefrist. |
| Utestengning etter soft-delete | `src/lib/auth/getCurrentUser.ts` (linje 30) | `deletedAt` satt → behandles som utlogget overalt (requirePortalUser bygger på samme). |
| Permanent sletting | `src/app/api/cron/cleanup-deleted-accounts/route.ts` | Daglig cron (vercel.json), bak `CRON_SECRET`. Sletter Prisma-`User` eldre enn 30 dager (batch 100) — kaskade via `onDelete: Cascade` på relasjonene. |
| Foresatt-slettekrav | `src/app/forelder/samtykke/actions.ts` → `beOmDataSletting()` | Oppretter `DataExportRequest` (type DELETE) + audit. Uttalt i koden: «Faktisk kaskade-sletting gjøres IKKE her — krever manuell behandling.» |
| Lyd-retention | `src/lib/agents/cleanup-recordings.ts` (cron `cleanup-recordings`, daglig) | Sletter lydfiler fra bucket `coaching-recordings` når `retentionUntil` er passert; beholder transkript + AI-analyse. |

### Mangler / gap

- **Supabase Auth-brukeren slettes ikke.** Cronen sletter kun Prisma-raden; `auth.users`-raden
  (e-post, telefonnr, innloggingshistorikk) blir liggende hos Supabase.
- **Storage-filer slettes ikke ved kontosletting.** Kaskaden tar DB-radene (`SessionVideo`,
  `PlayerSwingVideo`, `MessageAttachment`, avatar), men filene i bucketene blir liggende.
- **Stripe-kunden slettes/anonymiseres ikke** (stripeCustomerId-referansen forsvinner med
  Subscription-raden, men kundeobjektet hos Stripe består).
- **Foresattes DELETE-forespørsler har ingen behandlingsflyt** — ingen admin-kø, ingen varsling
  utover audit-raden. For lansering: minimum en admin-liste + e-postvarsel til support.
- **Rader som bevisst overlever** (riktig, men må dokumenteres i erklæringen): `Payment`
  (SetNull — bokføringsloven), `Booking`-historikk (userId=null), `PublicPlayer`-turneringsdata,
  `AuditLog` (actor SetNull).
- **Gjeste-bookinger** (guestName/Email/Phone uten konto) har ingen slette-vei i det hele tatt.
- **Ingen sletting/anonymisering pr. datatype:** erklæringen lover at AI-chat kan slettes
  «når som helst» — det finnes ingen slik knapp.

## 3. Retting (art. 16)

### Finnes

- Spiller redigerer egen profil: `src/app/portal/meg/profil/rediger/actions.ts` (+ skjema i
  `profil-rediger-form.tsx`); fasiliteter i `lagreFasilitetProfil()`
  (`src/app/portal/meg/innstillinger/actions.ts`, med audit).
- Coach/admin redigerer spillerdata: `src/app/admin/(legacy)/spillere/[id]/rediger/actions.ts`.

### Mangler / gap

- Felter satt av coach (schoolYear, talent-vurderinger, coach-notater) kan ikke bestrides/
  kommenteres av spilleren i appen — retting skjer i praksis via e-post. Akseptabelt for
  lansering hvis erklæringen oppgir kontaktvei, men bør nevnes.

## 4. Samtykke og mindreårige (art. 7 + 8)

### Finnes

| Funksjon | Fil |
|---|---|
| 16-årsgrense + alder | `src/lib/auth/minor.ts` (`isMinor`, `isAwaitingGuardianConsent`, GDPR_AGE_THRESHOLD = 16) |
| Side-vakt: mindreårig uten samtykke → venterom | `src/lib/auth/getCurrentUser.ts` / `requirePortalUser.ts` |
| Action-vakt (lukker POST-hullet) | `src/lib/auth/requireConsentingUser.ts` (`requireConsentingUser`, `assertNotAwaitingConsent`) — brukes i spiller-actions |
| Foresatt-kobling | `ParentInvitation` (token, 7 dagers utløp) + `ParentRelation` (approved-flagg); claiming via Supabase-verifisert e-post (se auto-memory: guardian-consent-email-linking) |
| Samtykke-forvaltning | `src/app/forelder/samtykke/actions.ts` → `lagreSamtykker()` — lagres i `User.preferences`, auditeres («samtykke.updated») |

### Mangler / gap

- **Samtykker ligger i `User.preferences` (fri JSON)** uten zod-validering ved les (brudd på
  husregelen om zod på JSON-blobs) og uten versjonering (hvilken erklæringsversjon ble samtykket?).
- **Ingen art. 9-samtykke** for helse-/skadedata (se datakart punkt 2).
- **Coach-actions er bevisst ikke samtykke-gatet** (dokumentert beslutning) — OK, men bør stå
  i erklæringen at coach kan registrere data om spilleren som del av avtalen.

## 5. Det som loves i live personvernerklæring men IKKE finnes i kode

Kilde: `src/components/marketing/v2/MarkedPersonvernV2.tsx` (live på `/personvern`, datert 12. mai 2026):

1. «Inaktive kontoer slettes etter 36 måneder uten innlogging» — ingen cron gjør dette.
2. «Feillogger: 90 dager» — ingen retention-jobb for `ErrorLog`.
3. «AI-chat-historikk kan slettes av deg når som helst» — ingen slik funksjon.
4. «Sentry: feilrapportering» — feillogging skjer i egen `ErrorLog`-tabell
   (`src/lib/error-tracking.ts`); AVKLAR om Sentry faktisk er i bruk, ellers stryk.
5. Databehandler-listen mangler Deepgram (transkripsjon av økt-opptak) og Google
   (kalendersync) og Notion (per-bruker-sync).

## 6. Prioritert gap-liste for lanseringsnivå

| # | Gap | Alvor |
|---|---|---|
| 1 | Kontosletting sletter ikke Supabase Auth-bruker + Storage-filer + Stripe-kunde | Høy |
| 2 | Personvernerklæringen lover 3 ting koden ikke gjør (36 mnd, 90 dager, AI-chat-sletting) | Høy — enten bygg eller omformuler |
| 3 | Ingen admin-kø for `DataExportRequest` (særlig DELETE fra foresatte) | Høy |
| 4 | Eksporten mangler meldinger, coach-notater, helse-/skadedata m.m. | Middels-høy |
| 5 | Art. 9-samtykke for helsedata mangler | Middels-høy (jurist avgjør) |
| 6 | Samtykker uten versjonering/zod i `User.preferences` | Middels |
| 7 | Retention mangler helt for AuditLog, Notification, InnboksEpost, Lead, gjeste-bookinger, transkripter | Middels |
| 8 | Databehandler-listen i erklæringen er utdatert (Deepgram/Google/Notion) | Middels — fikses av G4-utkastet |
