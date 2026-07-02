# AK Golf HQ — Komplett oversikt: funksjoner og data

> Sist oppdatert: 2026-06-30. Generert fra Prisma-schema + kodescan.

---

## DEL 1 — FUNKSJONER PER PRODUKTOMRÅDE

### Marketing (/) — Offentlig landingside
- Hero + lead-innsamling (guide-nedlasting, nyhetsbrev, demo-forespørsel)
- SEO-optimisert, B2B-CTA for klubber
- **Data**: `Lead` (email, navn, kilde, status)

---

### PlayerHQ (/portal) — Spillerplattform

**Hjem**
- Hurtigstatistikk: HCP, SG-snitt, siste runder, neste turnering
- Kalender-snippet (neste 7 dager)

**Planlegge**
- Treningsplan-liste (DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE)
- Coachens plan-forslag (AI-generert eller manuell)
- Spiller godkjenner/avviser med kommentar
- Sesong-oversikt (periodisering, turneringsmarkering)
- Download PDF, clone fra forrige sesong

**Gjennomføre**
- Dagens økt → start live-session
- Drill-for-drill: reps/sets, timer, notater
- Spørsmål til coach (tekst + video fra mobil)
- Video-opplasting

**Analysere**
- Runder med SG-total/OTT/APP/ARG/PUTT
- TrackMan Hub: radar-plots, dispersion-kart, per-kølle statistikk
- Benchmark mot PGA Tour (DataGolf)
- Weakness-analyse + AI-drill-forslag
- Per-hull og per-slag breakdown

**Meg**
- Profil, HCP, equipment-bag
- Personvern + GDPR-eksport
- Varslings-preferanser, Google Calendar-tilkobling

**Test-batteri (30+ tester)**
- Coach-tildeling → varsling → live-scoring → benchmark
- FYS-gate: må passere styrke-test før teknikk-progresjon
- Progression-trend per test

**Booking**
- Velg coaching-type + fasilitet + tidspunkt
- Stripe-checkout eller subscription-credit
- Google Calendar-sync, avbestilling >24h = credit-tilbakeføring

---

### Stats (/stats) — Offentlig statistikk
- Turneringskalender (PGA/DP/NGF/junior-NO) med leaderboards
- PGA-topplister: driving, fairway, GIR, putting, SG
- Offentlige spillerprofiler + WAGR-rangering
- Verktøy: WHS-kalkulator, SG-estimator, tour-ekvivalent

---

### Foreldreportal (/forelder)
- Oversikt over junior: HCP, runder, SG-status, neste turnering
- Bookinger og betalinger
- Ukentlig rapport (aktivitet + SG-fremgang)
- GDPR art. 8: foreldre-samtykke for mindreårige

---

### AgencyOS (/admin) — Coach/admin (26+ skjermer)

**Planlegging**
- Workbench: uke-view, Gantt, drag-drop, auto-gen fra maler
- Sesong-planlegger: måneds-oversikt + taper-logikk
- Plan-justeringsforespørsler fra spillere

**Gjennomføring (Live)**
- Timer, drill-logger (reps/timer), spørsmål fra spiller
- Video-upload, coaching-direktiver per drill

**Analyse**
- TrackMan Hub: import CSV, per-kølle trend, shot-annoteringer
- SG Coaching Hub: avstandsgapping, consistency-leaks, fatigue-mønstre
- Private coaching-notater med søk og tagging

**Teknisk utviklingsplan (P1–P10)**
- 10 svingposisjoner × arbeidsoppgaver
- Rep-mål per hastighet + TrackMan-mål
- AI Caddie-forslag (ukentlig batch)
- Auto-matching: TrackManShot → PositionTask

**Tester og evaluering**
- Test-tildeling fra 30+ test-katalog
- Benchmark-godkjenning (mandager, DataGolf-sync)
- FYS-gate kontroll

**Talent-tracking (junior-akademi)**
- Radar på 5 akser (fysisk/teknikk/taktikk/mental/motivasjon)
- Milepæler + ressurs-bibliotek

**Organisasjon**
- Grupper, lag, gruppe-tider
- Coaching-team med roller og tilganger
- API-nøkler, audit-log

**Finanser**
- Abonnement + booking-betalinger (Stripe)
- Refusjons-logikk (>24t avbestilling)
- Fakturaer via Resend

**Kommunikasjon**
- Innboks, varsler (in-app + push)
- AI Caddie Mission Control (Anders' konsoll)

---

## DEL 2 — DATA SOM SAMLES

### Bruker og autentisering
| Data | Formål |
|------|--------|
| Navn, email, telefon | Primær identitet |
| Avatar (Supabase Storage) | Profilbilde |
| Rolle (ADMIN/COACH/PLAYER/PARENT) | Tilgangskontroll |
| Tier (GRATIS/PRO/ELITE) | Betalingsstatus |
| deletedAt (soft-delete) | GDPR-compliance |
| lastLoginAt | Aktivitetssporing |

### Spillerprofil
| Data | Formål |
|------|--------|
| HCP (float) | Handicap-indeks |
| dateOfBirth | Alder (GDPR art. 8) |
| Spilling-år, ambisjon, hjemmeklubb | Spillerprofil |
| Skole (VGS) | Toppidrettslinje-matching |
| tilgjengeligeFasiliteter | Filtrer drills |
| userStatus (AKTIV/PERMISJON/SKADET) | Pause/skade |

### Helse og restitusjon
| Data | Formål |
|------|--------|
| Hvilepuls, søvntimer, vekt | Restitusjonssporing |
| Permisjon/skade (reason, periode, rehabPlan) | Pause-håndtering |

### Treningsdata — planlegging
- TrainingPlan (navn, status, periode, pyramide-område, L-fase)
- TrainingPlanSession (tidspunkt, varighet, miljø, skill-område)
- SessionDrill (navn, reps, sets, CS-mål)
- SeasonPlan, TournamentEntry, PeriodBlock

### Treningsdata — live gjennomføring
- TrainingSessionV2 (status, start/end, miljø, practiceType)
- SessionDrillInstance + SessionSet (planlagte vs faktiske reps, varighet)
- SessionDrillNote (spørsmål til coach, video-URL, coach-svar)
- SessionRecording (lydopptak + Deepgram-transkripsjon)

### Prestasjonsdata — runder og slag
| Data | Formål |
|------|--------|
| Score (brutto) | Primær prestasjonsmåling |
| SG-total/OTT/APP/ARG/PUTT | Kategori-analyse |
| Per-hull: strokes, putts, fairway, GIR | Detaljert runde |
| Per-slag: club, distanse, shotType, lie, wind | Slag-analyse |

### TrackMan-data
| Data | Formål |
|------|--------|
| Ballhastighet, spin, launchAngle, carry | Ballflykt-fysikk |
| Klubbhastighet, attackAngle, clubPath, faceAngle | Klubb-mekanikk |
| Side (offline-avvik i meter) | Spredning |
| Posisjon-matching → PositionTask | Auto-kobling til teknisk plan |

### Testdata
| Data | Formål |
|------|--------|
| TestDefinition (navn, formel, pyramide-område) | Test-protokoll |
| TestResult (score, benchmark-nivå, detaljer JSON) | Resultat |
| TestAssignment (status, frist, coach-kommentar) | Tildeling og progresjon |

### Finansdata
| Data | Formål |
|------|--------|
| Subscription (tier, status, Stripe-ID, månedlige kreditter) | Abonnement |
| Payment (beløp, status, refundert beløp) | Transaksjoner |
| Booking.priceOre | Kostnad per økt |

### Kommunikasjon og coaching
| Data | Formål |
|------|--------|
| CoachNote (privat observasjon, tags) | Coaching-notat |
| SessionDrillNote (spørsmål + svar) | Live-dialog |
| SessionVideo (URL, tag, type) | Video-feedback |
| Notification (type, lest-status) | Varsler |
| CaddieMessage / CaddieConversation | AI-chat-historikk |

### Organisasjon
| Data | Formål |
|------|--------|
| PlayerEnrollment (program, coach, periode) | Gruppertilhørighet |
| ParentRelation + samtykkedato | GDPR art. 8 |
| ApiKey (hashed) | Integrasjoner |
| AuditLog | Sporbarhet |

### Turneringer og eksterne data
| Data | Formål |
|------|--------|
| Tournament (navn, dato, DataGolf-ID) | Kalender |
| PublicPlayerEntry (plassering, score til par) | Resultat |
| PublicPlayerRound (SG per kategori) | Rundevis analyse |
| WagrSnapshot (rank, ptsAvg) | Amatør-rangering |

---

## DEL 3 — INTEGRASJONER

| Tjeneste | Formål | Status |
|----------|--------|--------|
| **Stripe** | Abonnement + booking-betalinger + refusjoner | Aktiv (TEST-modus) |
| **Google Calendar** | 2-way sync coach-kalender | Aktiv (OAuth2) |
| **Notion** | Task-sync (Anders' oppgaver) | Aktiv (cron 5 min) |
| **Resend** | Transaksjonelle e-poster (signup, reset, booking) | Aktiv — SPF/DKIM ikke verifisert |
| **Supabase Storage** | Avatarer, coaching-videoer, opptak | Aktiv |
| **DataGolf** | Turneringer, SG-benchmarks, PGA-stats | Aktiv (ukentlig cron) |
| **WAGR** | Amatør-ranking + NGF-kategori | Aktiv (snapshot) |
| **Deepgram** | Audio → tekst for coaching-opptak | Aktiv |
| **OpenAI / Claude** | AI-plan-generering, AI Caddie, SG Insights | Aktiv |
| **Vercel Blob** | Live-session videoer | Aktiv |

---

## Automatiske jobber (cron)

| Jobb | Tidspunkt | Formål |
|------|-----------|--------|
| DataGolf-sync | Mandag 08:00 | Oppdater turneringer + benchmarks |
| SG Insight-batch | Daglig 04:00 | AI-analyse per spiller |
| AI Caddie-forslag | Søndag | Ukentlige plan-forslag (PlanSuggestion) |
| Notion-sync | Hvert 5. min | Oppdater oppgave-cache |
| Cleanup slettet brukere | Periodisk | Slett filer etter 30 dager |

---

## P0-blokkere før ekte/betalende brukere (1. juli)

1. **Stripe live-nøkler** — verifiser TEST vs LIVE i Vercel-panelet
2. **E-post SPF/DKIM** — akgolf.no ikke verifisert i Resend (spam-risiko)
3. **`NEXT_PUBLIC_APP_URL`** — peker på Vercel-URL, ikke akgolf.no
4. **Deploy-rutine** — push til main deployer ikke automatisk (manuell `vercel deploy --prod`)
5. **GDPR-eksport-stub** — `/portal/meg/innstillinger/eksport` er forvirrende stub, bør redirecte til `/personvern`
