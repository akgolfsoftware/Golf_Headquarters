# GDPR-datakart — AK Golf HQ

> **G1 (masterplan Del 3d).** Hvilke persondata som lagres hvor, hvorfor, og hvor lenge.
> Bygget mot faktisk `prisma/schema.prisma` per 2026-07-12 (ikke ønsketilstand).
> Rettsgrunnlag og retention er FORSLAG — endelige valg tas av Anders/jurist.
> Alt merket «AVKLAR:» er en åpen beslutning.

Behandlingsansvarlig: AK Golf Group AS (org.nr. 927 248 581, iht. eksisterende
personvernerklæring i `src/components/marketing/v2/MarkedPersonvernV2.tsx`).

Lagringssteder:
- **Database:** Supabase Postgres (EU) via Prisma — alle modellene under.
- **Filer:** Supabase Storage-buckets (bl.a. `message-attachments`, `coaching-recordings`, video-buckets).
- **Auth:** Supabase Auth (`auth.users`, koblet via `User.authId`).
- **Tredjeparter:** Stripe (betaling), Resend (e-post), Anthropic (AI), Deepgram (transkripsjon), Google (kalender-sync), Notion (sync), Vercel (hosting/logger).

## 1. Identitet og profil

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Kontaktinfo | `User` (name, email, phone, avatarUrl) | Konto, innlogging, kommunikasjon | Avtale (art. 6-1 b) | Til konto slettes + 30 dagers angrefrist (`deletedAt`-cron) |
| Spillerprofil | `User` (hcp, playingYears, ambition, homeClub, school, schoolYear, prevSeasonAvgScore) | Coaching og planlegging | Avtale | Som konto |
| Fødselsdato / mindreårig-status | `User` (dateOfBirth, requiresGuardianConsent, guardianConsentGivenAt, guardianConsentByUserId) | GDPR art. 8-porten (16-årsgrense, `src/lib/auth/minor.ts`) | Rettslig forpliktelse (art. 6-1 c) | Som konto; samtykke-tidspunkt bør bevares som dokumentasjon |
| Preferanser og samtykker | `User.preferences` (JSON — inkl. samtykke-flagg satt av foresatt i `/forelder/samtykke`) | Varsel-valg, språk, samtykke-status | Samtykke (art. 6-1 a) for selve samtykkene | Som konto |
| Push-abonnement | `PushSubscription` (endpoint, p256dh, auth, userAgent) | Web-push-varsler | Samtykke (browseren spør) | Slettes ved 410 Gone; ellers som konto (Cascade) |
| Turneringsidentitet | `PublicPlayer`, `WagrSnapshot`, `TournamentResult` (navn, klubb, resultater) | Turneringshistorikk, benchmarking | Berettiget interesse (art. 6-1 f) — offentlig tilgjengelige resultater | AVKLAR: retention for offentlige turneringsdata etter kontosletting (i dag: `publicPlayerId` SetNull, PublicPlayer består) |

## 2. Helse-relaterte data (art. 9 — særlig kategori, strengest krav)

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Helselogg | `HealthEntry` (restingHr, hrv, sleepHours, weightKg, notes) | Belastningsstyring i trening | **Uttrykkelig samtykke (art. 9-2 a)** — frivillig egenregistrering | Som konto (Cascade); AVKLAR: kortere maks-retention, f.eks. 24 mnd |
| Skade/permisjon | `Leave` (reason inkl. SKADE, isInjury, rehabPlan JSON, description) | Return-to-play, plan-pause | **Uttrykkelig samtykke (art. 9-2 a)** — skadedata er helsedata | Som konto; AVKLAR: eget samtykke-punkt for skadedata mangler i dag |
| Talent-vurderinger | `TalentTracking` (fysisk/teknikk/taktikk/mental/motivasjon 1–10, notater) | Talent-program | Avtale + berettiget interesse; AVKLAR: «mental»-score kan grense mot helsedata | Som konto (Cascade) |

AVKLAR: appen har i dag INGEN eksplisitt art. 9-samtykkeinnhenting før helse-/skadefelt
fylles ut. Personvernerklæringen sier «frivillig, kun hvis du selv registrerer» — jurist
bør vurdere om det holder, eller om et aktivt avkrysnings-samtykke må inn i onboarding.

## 3. Mindreårige og foresatte

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Foresatt-relasjon | `ParentRelation` (parentId, childId, relationship, approved) | Foreldreinnsyn + samtykke | Rettslig forpliktelse (art. 8) | Som konto (Cascade begge veier) |
| Foresatt-invitasjon | `ParentInvitation` (email, token, relation, acceptedAt) | Koble foresatt til barn | Avtale/rettslig forpliktelse | Utløper etter 7 dager; AVKLAR: utløpte/ubrukte invitasjoner ryddes ikke i dag |
| Samtykke-spor | `AuditLog` («samtykke.updated», «data.export.requested» m.fl.) | Dokumentere at samtykke ble gitt/endret | Rettslig forpliktelse | AVKLAR: AuditLog har ingen retention i dag — samtykke-spor bør bevares lenge, øvrige actions kortere |

## 4. Trening, golf-data og AI

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Runder/slag/tester | `Round`, `Shot`, `HoleScore`, `TestResult`, `TestSession`, `TrainingLog` m.fl. | Kjerneproduktet: utvikling bevist | Avtale | Som konto |
| TrackMan-data | `TrackManSession`, `TrackManShot`, `ClubMetricTrend` | Analyse | Avtale | Som konto |
| Planer/økter | `TrainingPlan`, `TrainingPlanSession*`, `TrainingSessionV2`, `PlanSession`, `TechnicalPlan*` osv. | Planlegging/gjennomføring | Avtale | Som konto |
| AI-chat (spiller) | `CoachingSession.messages` (JSON), `CaddieMessage`, `CaddieConversation` | AI-coach / caddie | Avtale; AVKLAR: egen info om at innhold sendes til Anthropic | Erklæringen lover «kan slettes når som helst» — AVKLAR: selvbetjent slette-knapp finnes ikke i dag |
| Coach-notater om spiller | `CoachNote` | Coachens private notater | Berettiget interesse | Som konto; NB: omfattes av spillerens innsynsrett |
| Mål/prestasjoner/sosialt | `Goal`, `Achievement`, `Friendship`, `DrillChallenge`, `ChallengeParticipant` | Motivasjon/sosialt | Avtale | Som konto |

## 5. Video og lyd

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Coach-video av spiller | `SessionVideo` (videoUrl, notes) | Teknikk-gjennomgang | Avtale; AVKLAR: samtykke ved filming av mindreårige | Som konto (Cascade) — men se gap om Storage-filer i `rettigheter-status.md` |
| Spillerens swing-video | `PlayerSwingVideo` (videoUrl, storagePath, consentVerified) + `SwingAnalysis` | AI-svinganalyse | Avtale/samtykke (`consentVerified`-feltet finnes) | Som konto; AVKLAR: hva håndhever `consentVerified` i praksis |
| Økt-opptak (lyd) | `SessionRecording` (audioUrl, chunks, transcript, aiAnalysis, deepgramId, retentionUntil) | Coach-memo + AI-analyse | Samtykke (stemmeopptak av samtale) | Lyd slettes automatisk etter `retentionUntil` (cron `cleanup-recordings`); **transkript + AI-analyse beholdes evig** — AVKLAR: retention også for transkript |

## 6. Penger og kjøp

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Betalinger | `Payment` (Stripe-IDer, amountOre, description, metadata) | Betaling/refusjon | Avtale + rettslig forpliktelse | **5 år (bokføringsloven)** — `userId` SetNull ved kontosletting, raden består |
| Abonnement | `Subscription` (stripeCustomerId, tier, credits) | Abonnementsdrift | Avtale | Som konto (Cascade); Stripe-kunden består hos Stripe — AVKLAR: rutine for sletting hos Stripe |
| Bookinger | `Booking` (notes, guestName, guestEmail, guestPhone) | Timebestilling | Avtale | Historiske bookinger beholdes med `userId=null` ved sletting; AVKLAR: retention for **gjeste-bookinger** (navn/e-post/telefon uten konto) — ingen slette-vei i dag |
| Kvitteringer/kontrakter | `Document` (userId, title, url, kind) | Dokumentarkiv | Avtale/rettslig forpliktelse | CONTRACT/RECEIPT: 5 år; øvrig som konto (SetNull i dag — AVKLAR) |

## 7. Kommunikasjon

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Spiller↔coach-meldinger | `CoachingSession` (kind DIRECT/LIVE), `Question` (title, body, answer) | Coaching-dialog | Avtale | Som konto (Cascade) |
| Meldingsvedlegg | `MessageAttachment` (fileName, path → privat bucket `message-attachments`) | Filer i dialog | Avtale | Som konto; AVKLAR: bucket-filer slettes ikke automatisk ved kontosletting |
| Varsler | `Notification` (title, body, link) | In-app-varsling | Avtale | AVKLAR: ingen retention i dag — forslag 12 mnd |
| Innkommende e-post | `InnboksEpost` (fraEpost, fraNavn, emne, **full brødtekst**, utkastSvar) | Kommando-senter e-posthåndtering | Berettiget interesse | AVKLAR: full e-posttekst fra eksterne lagres uten retention og uten kobling til slette-flyt |
| Leads | `Lead` (email, name, source, metadata) | Markedsføring/salg | Samtykke (nyhetsbrev) / berettiget interesse (demo-forespørsel) | AVKLAR: forslag 24 mnd uten aktivitet; UNSUBSCRIBED bør anonymiseres |
| Support/feedback | `AppFeedback` (userId, tekst, side) | Support og produktforbedring | Berettiget interesse | AVKLAR: forslag 24 mnd |

## 8. Teknisk, logger og integrasjoner

| Kategori | Prisma-modell (felter) | Formål | Rettsgrunnlag (forslag) | Retention (forslag) |
|---|---|---|---|---|
| Audit-spor | `AuditLog` (actorId, action, target, metadata JSON) | Sporbarhet/sikkerhet | Berettiget interesse + rettslig forpliktelse | AVKLAR: ingen retention i dag; forslag 3 år (samtykke-spor lenger) |
| Feillogger | `ErrorLog` (userId, message, stack, meta) | Feilsøking | Berettiget interesse | Erklæringen lover 90 dager — **ingen cron håndhever dette i dag** (se gap-liste) |
| API-nøkler | `ApiKey` | Maskintilgang | Avtale | Som konto |
| Google Calendar | `GoogleCalendarConnection` (kryptert refresh-token) | 2-veis kalendersync for coach | Samtykke (OAuth) | Til frakobling; token kryptert med `GOOGLE_TOKEN_ENCRYPTION_KEY` |
| Notion | `NotionConnection`, `NotionDatabaseLink` | Per-bruker Notion-sync | Samtykke (OAuth) | Til frakobling |
| GDPR-forespørsler | `DataExportRequest` (userId, subjectUserId, type EXPORT/DELETE, status) | Kvittering/sporing av innsyn- og slettekrav | Rettslig forpliktelse | Bevares som dokumentasjon (forslag 3 år) |
| Agent-kjøringer | `AgentRun`, `KommandoAgentRun`/`Step`, `Signal`, `PlanAction` | AI-agent-drift | Berettiget interesse | AVKLAR: retention + regel om ingen PII i agent-logger (Nordstjernen-prinsipp) må verifiseres |

## Samlede AVKLAR-punkter for Anders (prioritert)

1. **Art. 9-samtykke** for helse- og skadedata (HealthEntry, Leave/rehabPlan) — aktivt samtykke i onboarding?
2. **Transkript/AI-analyse av økt-opptak beholdes evig** — sett en retention (f.eks. 3 år etter siste aktive avtale?).
3. **Gjeste-bookinger** (navn/e-post/telefon uten konto) — retention og slette-vei.
4. **InnboksEpost** — full e-posttekst uten retention.
5. **AuditLog/ErrorLog/Notification** — ingen retention-cron; erklæringen lover 90 dager for feillogger.
6. **«Inaktive kontoer slettes etter 36 måneder»** står i live personvernerklæring — ingen kode gjør dette. Enten bygg cron eller endre erklæringen.
7. **AI-chat «kan slettes når som helst»** står i erklæringen — selvbetjent sletting finnes ikke.
8. **Stripe-kunde og Supabase Auth-bruker** slettes ikke av cleanup-cronen (kun Prisma-rader) — rutine trengs.
9. **Storage-filer** (video, lyd-chunks, vedlegg, avatar) slettes ikke ved kontosletting — kun DB-rader kaskaderes.
10. **Video/bilde av mindreårige** — eget samtykkepunkt for foresatte?
