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
| Runder/slag/tester | `Round` (inkl. kilde, kildedato, datakvalitet, status, delvis lagring og importmetadata), `Shot`, `HoleScore`, `TestResult`, `TestSession`, `TrainingLog` m.fl. | Kjerneproduktet: utvikling bevist | Avtale | Som konto |
| TrackMan-data, startretning og måloppsett | `TrackManSession`, `TrackManShot`, `ClubMetricTrend` | Analyse | Avtale | Som konto |
| Planer/økter | `TrainingPlan`, `TrainingPlanSession*`, `TrainingSessionV2`, `PlanSession`, `TechnicalPlan*` osv. | Planlegging/gjennomføring | Avtale | Som konto |
| Ukens treningsprioritet, fokus, øktbudsjett og oppholdssted (R06.2, 02.10.2026) | Eksisterende `WeekPlan.planningDetails` (nullable JSON, versjon 1: fire supplerende uketyper, oppholdssted, prioritet/fritt fokus/øktantall per FYS/TEK/SLAG/SPILL/TURN); `plannedHours*` beholdes som tidsbudsjett | Planlegging per ISO-uke, knyttet til spillerens årsplan og faktiske sesongdatoer. Samme validerte lagrings-/lesekontrakt i ukeplan og autorisert trenerinnsyn; ingen ny delingsrett, åpne lister, logger eller AI-overføring | Avtale (forslag); eksisterende mindreårig- og tilgangsvakter beholdes | Som eksisterende ukeplan. Felt kan tømmes eksplisitt av autorisert bruker. Kontoeksporten inkluderer alle eierens `WeekPlan`-rader med `planningDetails`, avgrenset med `playerId`. Kontoanonymisering tømmer `customNotes`, oppholdssted og alle frie fokusfelt; bare validerte v1-enumverdier, øktbudsjetter og kildeversjon bevares, ukjent/ugyldig JSON tømmes. Dekningen er testet med syntetiske data. **Gjenværende overgangsunntak:** øvrige Workbench-økter, øvelser, gruppekopier og fysiske-/turneringsplaner har fortsatt egne innsyn-/sletteavvik (radene under); denne ukeplanpakken lukker ikke disse |
| Gruppeoriginal og individuelle arvede økter | `WorkbenchSession` (`groupId`, `sourceGroupSessionId`, `localOverride`, publiseringsstatus og individuelle gjennomføringsfelt), `WorkbenchDrill`, `SessionBallLog` | Gruppeplan med individuell gjennomføring og statistikk; egne tilpasninger og historikk bevares | Avtale (forslag) | Som konto. Bevisst overgangsunntak: dagens kontoeksport/anonymisering dekker ikke hele Workbench; dette må lukkes før produksjonsbruk av den nye gruppeflyten. Se [gruppeflyt-kontrollen](../design-audit/gruppeflyt-kontroll-2026-10-01.md) |
| Testbasert øvelsesvalg | `WorkbenchDrill.sourceId` kan inneholde testresultat-ID og godkjent øvelses-ID når coach legger en øvelse i et fremtidig utkast | Vise hvorfor øvelsen ble valgt; ingen automatisk publisering | Avtale (forslag) | Øvelsen følger øktens livsløp; **AVKLAR:** dagens eksport/sletting dekker ikke nødvendigvis dette koblingsfeltet |
| Workbench fysisk plan og turneringsplan | `WorkbenchPhysicalBlock`, `WorkbenchPhysicalWeek`, `WorkbenchPhysicalSession`, `WorkbenchPhysicalExercise`, `WorkbenchPhysicalLog`, `WorkbenchTournamentPlan`, `WorkbenchTournamentPreparation`, `WorkbenchTournamentRound`, `WorkbenchTournamentGoal`, `WorkbenchTournamentEvaluation`, `WorkbenchPlanConflict` | Fysisk treningsplan, spillerlogging, turneringsforberedelse, runder, brutto score, SG-kilde og konfliktløsning mot reise/skole/testuke | Avtale | Som konto; AVKLAR: eksport/sletting må utvides når skjermene tas i bruk |
| AI-chat (spiller) | `CoachingSession.messages` (JSON), `CaddieMessage`, `CaddieConversation` | AI-coach / caddie | Avtale; AVKLAR: egen info om at innhold sendes til Anthropic | Erklæringen lover «kan slettes når som helst» — AVKLAR: selvbetjent slette-knapp finnes ikke i dag |
| Coach-notater om spiller | `CoachNote` | Coachens private notater | Berettiget interesse | Som konto; NB: omfattes av spillerens innsynsrett |
| Mål/prestasjoner/sosialt | `Goal`, `Achievement`, `Friendship`, `DrillChallenge`, `ChallengeParticipant` | Motivasjon/sosialt | Avtale | Som konto |
| Kobling til turneringshistorikk | Schema `dashboard` i samme database, eid av repoet ak-golf-pipelines (ikke Prisma): `profile_links` (hq_user_id, person_id, metode, status, bevis), `profile_lookups` (hq_user_id, tidspunkt, antall treff) | Vise spillerens egne GolfBox-resultater i `/portal/meg/resultater`, etter at spilleren selv har bekreftet «Er dette deg?» | Berettiget interesse for koblingen; selve resultatene er offentlig publisert av forbund/arrangør. AVKLAR: se punkt 11 | `profile_lookups` er rate-begrensning og kan slettes etter 30 dager. `profile_links` som konto. Sletting: `dashboard.delete_profile_data(hq_user_id)`, **ikke koblet til kontosletting ennå** |

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

### IUP-besvarelser — tillegg 02.10.2026

`IupBesvarelse` knytter én skjematype, kildeversjon, nivå og periode til spilleren, uten organisasjonskopier. `IupRevisjon` inneholder versjonerte utkast/leveringer, fritekst, egenvurderinger, prosentfordeling og forbedringspunkter, samt tidspunkt og teknisk lagringskvittering. Fritekst og egenvurdering kan inneholde personlige eller helserelaterte opplysninger.

Spillerens `/portal/mal/evaluering` og de tilhørende handlingene krever Full-tilgang og gyldig foreldresamtykke der det kreves. Nytt serverlag begrenser skriving til innlogget eier som også har aktivt spillermedlemskap i WANG (Ung/Toppidrett) eller den kanoniske Team Norway-gruppen. Tidligere medlemmer kan lese egne historiske svar gjennom den samme beskyttede spillerflaten. Begge tabeller har RLS og ingen rettigheter for `PUBLIC`, `anon` eller `authenticated`; de er ikke en offentlig Data API. Dette gir ikke WANG/TN-lesere noen nye rettigheter. Eksisterende fullprofil-samtykke er ikke utvidet til helse eller private notater.

Alle revisjoner følger brukerens dataeksport. Autorisert anonymisering sletter besvarelser og kaskadesletter revisjonene; de beholdes ikke på den anonymiserte spillerprofilen. Ordinær lagring overskriver aldri en tidligere revisjon, og nytt utkast erstatter ikke siste leverte revisjon. Ingen råsvar sendes til AI eller legges i applikasjonslogger.

Spillerskjemaet legger ikke til ekstern deling. Behandlingsgrunnlag, opplysningstekst og eventuell særskilt helsedeling står fortsatt som avklaringer for trenerdeling. Dette tillegget beskriver kodegrunnlaget og er ikke en juridisk godkjenning. Testene bruker bare syntetiske svar. Generell levetid før kontosletting er ikke fastsatt av dette arbeidet.

### Eksisterende avklaringsliste

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
11. **Profilkobling til GolfBox-historikk** (`/portal/meg/resultater`) — (a) LØST: kontosletting kaller `dashboard.delete_profile_data(hq_user_id)` (`src/lib/gdpr/slett-eksterne-data.ts`). (b) DELVIS: spillere under 16 år, eller uten fødselsdato, kan ikke koble seg selv (`byggOppslag`); trenergodkjenning som vei videre er ikke bygd, og krever en databasefunksjon i ak-golf-pipelines. Navn og fødselsdato er fortsatt selvoppgitt, så dette er ikke identitetskontroll. (c) ÅPEN: GolfBox-vilkårene for bruk av resultatdata er ikke funnet eller verifisert (NGF eier den nasjonale databasen, GolfBox AS er leverandør). Avklar med NGF før profilene deles med Team Norway, WANG eller foreldre.


### Navngitt trenerdeling — grunnlag 02.10.2026

Ny `TrenerDelingsInvitasjon` inneholder spiller, mottakergruppe, trenerens e-post, hvem som godkjente, tekstversjon, utløp og aksept/tilbaketrekking. Råtoken lagres ikke; databasen får bare SHA-256. Lenken varer sju døgn. Ny tabell har RLS uten klientprivilegier. `DelingsSamtykke` utvides med valgfri navngitt mottaker og separat omfang `NAVNGITT_KOMPLETT_PROFIL`. Eldre gruppesamtykker gir aldri dette omfanget. Begge bruker samme samtykkehistorikk; ingen gruppe- eller plattformrolle alene gir nytt profilinnsyn.

Eier eller godkjent foresatt kan opprette deling. Under 16 kreves foresatt. Mottakeren må logge inn med bekreftet, identisk e-post på det eksakte domenet wang.no eller golfforbundet.no og ha aktiv trenerrolle i den valgte gruppen. WANG krever elevens egen skolegruppe. TN kan motta eksplisitt deling fra en aktiv WANG-elev uten å opprette TN-medlemskap. Utmelding, arkivert gruppe, slettet konto, bortfalt foreldrerelasjon eller tilbaketrekking stopper nye oppslag. Samtidig aksept og tilbaketrekking serialiseres per spiller.

Ny IUP-leser validerer kilden og returnerer bare leverte besvarelser, aldri utkast. Hele dataoppslaget bruker samme transaksjon/lås som rettighetskontrollen. Grunnlaget er ennå ikke montert i en ny offentlig handling eller skjerm; det sender ingen e-post. Samtykketeksten beskriver ønsket fullprofil-omfang uttrykkelig, inkludert helse og meldinger, men ingen slik utvidet visning er aktivert av grunnlaget alene. Gamle WANG/TN-leseveier må samordnes før komplett trenerinnsyn er ferdig.

Invitasjoner som gjelder brukeren, følger dataeksport uten token-hash. Anonymisering fjerner invitasjoner der brukeren er spiller, foresatt, akseptert trener eller e-postmottaker; fysisk sletting har tilsvarende fremmednøkkelvern for identitetsfeltene. Samtykkehistorikk følger eksisterende revisjonsspor. Prisma-hendelser logger bare generiske feilvarsler, aldri rå databasefeil som kan inneholde personopplysninger. Ingen råsvar eller e-post sendes til AI. Testene bruker utelukkende syntetiske identiteter.


### Bookingforslag og avvisningsutkast (PR #1010)

Booking lagrer betalingsmåte og foreslått start/slutt med coach-ID. Feltene følger eksisterende bookingeksport. Avvisning oppretter et knyttet InnboksEpost-utkast med kontaktopplysninger og begrunnelse; ingenting sendes av avvisningshandlingen. Avvisning og utkast lagres i samme transaksjon. Tilgangen til selve bookingen avgrenses til riktig coach/admin.

Knyttede innboksutkast følger nå spillerens bookingeksport. Anonymisering vasker kontakt, emne, fritekst og utkast før den eksterne ryddekjeden kobler booking fra brukeren; booking- og betalingshistorikken beholdes. Gjestenes eksisterende retention-/slettespørsmål gjelder fortsatt som beskrevet over. Dette arbeidet legger ikke til noen automatisk utsending ved avvisning.
