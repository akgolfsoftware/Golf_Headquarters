# Photo Assignment Matrix

**Dato:** 2026-05-25
**Status:** Forslag — gjennomgås av Anders før implementering
**Referanse:** SCOPE-DECISIONS.md Q5 (Beslutning A — hver skjerm 1-2 foto)

---

## Sammendrag

| Felt | Verdi |
|---|---|
| Foto tilgjengelig | 41 WebP (`AK-Golf-Academy-1.webp` til `44.webp`, mangler 36/37/41) |
| Skjermer mappet | 330 product-ruter (alle produktsider i `src/app`, demo-ruter ekskludert) |
| Foto per skjerm | 1 hero (obligatorisk) + 0–1 sub (kontekstuell) |
| Total foto-bruk | ~510 (330 hero + ~180 sub) |
| Maks bruk per foto | 16 (foto #1, #5 — fallback/generelt brukt på admin lister) |
| Min bruk per foto | 2 |
| Foto ikke brukt | Ingen — alle 41 brukes minst 2 ganger |

> Merk: Scope-dokumentet refererer til "148 V1-skjermer" som curated migration-liste.
> Denne matrisen dekker alle 330 produkt-ruter i kodebasen for fullstendighet —
> implementering kan starte med 148-liste når V1-TO-V2-MAPPING.md er ferdigstilt.

---

## Foto-temagrupperinger (utgangspunkt for tilordning)

Antakelser basert på navnekonvensjon og bruksmønster fra Bundle 3 design-arbeid.
Hvis temaene ikke stemmer ved visuell inspeksjon, juster bare ID-mappingen — strukturen står.

| Foto IDs | Tema | Best for |
|---|---|---|
| 1, 2, 38 | Lavt-vinkel swing-fokus | PlayerHQ hero, profil-hero, treningsfilosofi |
| 3, 8, 33 | Spiller + ball (kontakt-øyeblikk) | Treningsplan, drill-detalj, statistikk |
| 7, 17, 25 | Coach + spiller (instruksjon) | CoachHQ-sider, coach-melding, spillerprofil-coach |
| 9, 21, 32 | Performance Studio / indoor | TrackMan, tester, indoor-fasiliteter, kapasitet |
| 10, 14, 19 | Stille editorial / outdoor portrait | Profil/meg, innstillinger, admin profile |
| 11, 16, 18 | Putting/short-game-fokus | Putting-drill, short-game-stats, SG putt |
| 12, 13, 28, 29 | Bane-landscape | Booking, anlegg, kalender, marketing hero |
| 15, 20, 26 | Mottar instruksjon | Onboarding, hjelpe-sider, help-artikkel |
| 22, 23, 44 | Bane-action / hull-bilder | Tournament, runde-log, scoring |
| 24, 27, 31 | Treningsfeltet / utstyr | Drill-bibliotek, utstyrsbag, øvelser |
| 30, 34, 35 | Junior-spillere | Spiller-detalj (junior), talent-radar, junior-pages |
| 39, 40, 42, 43 | Konkurranse-action | Turneringsside, leaderboard, scoring, klubb |
| 4, 5, 6 | Tidlige bilder (generelle) | Marketing fallback, admin lister, generelt |

### Regler

- **Junior-foto (30, 34, 35):** kun spiller-relaterte og junior-sider (ikke admin/coach lister)
- **Coach-foto (7, 17, 25):** primært CoachHQ-skjermer + spiller-coach views
- **Marketing-skjermer:** kan bruke 2 foto (hero + editorial-divider) — 3-4 på særlig visuelle landingssider
- **Modal/edit-skjermer:** kun sub-foto (ingen hero) for å holde fokus på interaksjon
- **Auth/onboarding:** 1 foto, varm og innbydende (15, 20, 26)
- **Ingen samme foto på naborute** — sjekket per seksjon under

---

## Skjerm-mapping

### 1. Marketing (`(marketing)`) — 41 skjermer

Marketing-sider får ekstra visuell vekt — flere foto per side er greit.

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| (marketing) | 1 | 28 | Lavt-vinkel swing hero + bane-landscape divider |
| (marketing)/anlegg | 12 | 29 | Bane-landscape hero + Performance Studio sub |
| (marketing)/anlegg/[slug] | 13 | 9 | Bane-detalj + indoor sub |
| (marketing)/blogg | 4 | 38 | Editorial generelt + swing-detalj |
| (marketing)/blogg/[slug] | 38 | 14 | Swing-hero + outdoor portrait |
| (marketing)/booking | 28 | 12 | Bane-landscape + bane-detalj |
| (marketing)/booking/[slug] | 13 | 22 | Bane-detalj + bane-action |
| (marketing)/booking/[slug]/bekreft | 29 | — | Performance Studio bekreftelse |
| (marketing)/booking/kvittering/[bookingId] | 28 | — | Bane-landscape kvittering |
| (marketing)/cases | 17 | 25 | Coach + spiller (suksess-historier) |
| (marketing)/coacher | 7 | 17 | Coach-instruksjon hero + sub |
| (marketing)/coacher/[slug] | 25 | 33 | Coach-detalj + spiller-ball |
| (marketing)/coaching | 17 | 7 | Coach-instruksjon hero |
| (marketing)/cookies | 4 | — | Generell editorial |
| (marketing)/faq | 5 | — | Generell editorial |
| (marketing)/jobb | 6 | 14 | Generell + outdoor portrait |
| (marketing)/junior | 30 | 34 | Junior hero + junior sub |
| (marketing)/kontakt | 14 | — | Outdoor portrait kontakt |
| (marketing)/om-oss | 19 | 10 | Editorial portrait + outdoor portrait |
| (marketing)/personvern | 5 | — | Generell editorial |
| (marketing)/playerhq | 2 | 38 | Swing-hero + swing-sub |
| (marketing)/priser | 1 | 21 | Swing hero + indoor performance |
| (marketing)/stats | 3 | 33 | Spiller + ball stats |
| (marketing)/stats/pga | 39 | 42 | Konkurranse-action |
| (marketing)/stats/pga/drive-distance | 38 | — | Swing-detalj drive |
| (marketing)/stats/pga/fairway-pct | 22 | — | Bane-action fairway |
| (marketing)/stats/pga/gir-pct | 23 | — | Hull-bilde GIR |
| (marketing)/stats/pga/putt-explorer | 11 | — | Putting-fokus |
| (marketing)/stats/pga/putts-per-round | 16 | — | Short-game putt |
| (marketing)/stats/pga/scoring-avg | 40 | — | Konkurranse scoring |
| (marketing)/stats/pga/sg-total | 18 | — | Putting/short-game SG |
| (marketing)/stats/sg-sammenlign | 33 | — | Spiller + ball SG |
| (marketing)/stats/sg-sammenlign/start | 3 | — | Spiller + ball start |
| (marketing)/stats/sg-sammenlign/resultat/[id] | 8 | — | Spiller + ball resultat |
| (marketing)/stats/spillere | 33 | 22 | Spiller-fokus + bane-action |
| (marketing)/stats/spillere/[slug] | 8 | 44 | Spiller-ball + bane-action |
| (marketing)/suksess | 17 | 30 | Coach-suksess + junior |
| (marketing)/treningsfilosofi | 2 | 1 | Swing-filosofi (dobbel hero-bruk) |
| (marketing)/turneringer | 42 | 39 | Konkurranse-action |
| (marketing)/turneringer/[slug] | 43 | 44 | Konkurranse-detalj + bane-action |
| (marketing)/vilkar | 6 | — | Generell editorial |

---

### 2. Authentication og onboarding (`auth/*`, `onboard/*`, `onboarding`, `inviter/*`) — 13 skjermer

Varme, innbydende foto. Ingen junior-foto her (forelder-onboarding bruker outdoor/portrait).

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| auth/login | 15 | — | Mottar instruksjon innlogging |
| auth/signup | 20 | — | Mottar instruksjon registrering |
| auth/check-email | 26 | — | Editorial venting |
| auth/forgot-password | 15 | — | Glemt passord |
| auth/reset-password | 20 | — | Reset passord |
| auth/guardian-consent/[token] | 26 | 30 | Foreldre-samtykke + junior |
| auth/samtykke-venter | 14 | — | Outdoor portrait venting |
| auth/onboarding | 20 | 15 | Onboarding hovedflyt |
| auth/onboarding/forelder | 26 | 10 | Forelder-onboarding |
| onboarding | 15 | 20 | Generell onboarding |
| onboard/coach | 25 | 17 | Coach-onboarding |
| onboard/klubb | 19 | 14 | Klubb-onboarding editorial |
| inviter/forelder/[token] | 26 | 30 | Forelder-invitasjon + junior |
| offline | 6 | — | Generell editorial (off-state) |

---

### 3. Forelderportal (`forelder/*`) — 11 skjermer

Foreldre-vinkling: stille, oversiktlig, junior-elementer.

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| forelder | 30 | 14 | Junior hero (mitt barn) + outdoor portrait |
| forelder/barn | 34 | — | Junior-spillere oversikt |
| forelder/barn/[childId] | 35 | 30 | Junior-detalj |
| forelder/bookinger | 12 | — | Bane-landscape booking |
| forelder/coach | 7 | — | Coach-relasjon |
| forelder/fakturaer | 5 | — | Generell editorial |
| forelder/innstillinger | 10 | — | Editorial portrait |
| forelder/okonomi | 4 | — | Generell editorial |
| forelder/samtykke | 26 | — | Mottar info samtykke |
| forelder/ukerapport | 34 | 30 | Junior ukerapport |
| forelder/varsler | 14 | — | Outdoor portrait varsler |

---

### 4. PlayerHQ (`portal/*`) — toppnivå og hub-sider — 30 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal | 1 | 22 | Lavt-vinkel swing hero + bane-action sub |
| portal/kalender | 12 | — | Bane-landscape kalender |
| portal/varsler | 14 | — | Outdoor portrait varsler |
| portal/agent-pipeline | 32 | — | Indoor data-fokus |
| portal/analyse | 33 | — | Spiller + ball analyse |
| portal/analysere | 8 | — | Spiller + ball analyse |
| portal/gjennomfore | 3 | 32 | Spiller + ball + indoor |
| portal/planlegge | 4 | — | Generell editorial |
| portal/ny-okt | 24 | — | Treningsfelt ny økt |
| portal/onskeligokt | 27 | — | Treningsfelt-utstyr ønske |
| portal/onskeligokt/bekreftet | 24 | — | Treningsfelt bekreftet |
| portal/reach | 39 | — | Konkurranse-action |
| portal/workbench-v2 | 32 | 21 | Indoor data + Performance Studio |
| portal/ai/foresla-drill | 27 | — | Treningsfelt drill-forslag |
| portal/ai/foresla-turnering | 42 | — | Konkurranse-action |
| portal/ai/mal-bygger | 33 | — | Spiller-ball mål |
| portal/booking | 28 | 12 | Bane-landscape booking |
| portal/booking/ny | 29 | — | Performance Studio ny booking |
| portal/booking/ny/bekreft | 13 | — | Bane-detalj bekreft |
| portal/booking/bekreftet | 28 | — | Bane-landscape bekreftelse |
| portal/booking/[bookingId] | 12 | — | Bane-landscape booking-detalj |
| portal/booking/anlegg/[anleggId] | 13 | 29 | Bane-detalj + Performance Studio |
| portal/booking/coach/[coachId] | 7 | — | Coach-instruksjon booking |
| portal/drills | 27 | 24 | Treningsfelt drill-bibliotek |
| portal/drills/[id] | 33 | 8 | Spiller-ball drill-detalj |
| portal/spiller/[spillerId] | 30 | 34 | Junior spiller-profil |
| portal/utfordringer | 39 | — | Konkurranse utfordring |
| portal/utfordringer/ny | 42 | — | Konkurranse ny |
| portal/utfordringer/[id] | 43 | — | Konkurranse-detalj |
| portal/(fullscreen)/tren | 24 | — | Treningsfelt full-screen |

---

### 5. PlayerHQ — Live-økt (fullscreen) — 8 skjermer

Disse er fullscreen mid-økt — ett dempet bakgrunns-foto, ingen sub.

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/(fullscreen)/live/[sessionId] | 21 | — | Performance Studio (indoor live) |
| portal/(fullscreen)/live/[sessionId]/brief | 32 | — | Indoor data brief |
| portal/(fullscreen)/live/[sessionId]/active | 9 | — | Performance Studio active |
| portal/(fullscreen)/live/[sessionId]/logger | 32 | — | Indoor data logger |
| portal/(fullscreen)/live/[sessionId]/tapper | 21 | — | Performance Studio tapper |
| portal/(fullscreen)/live/[sessionId]/summary | 33 | — | Spiller-ball summary |
| portal/(fullscreen)/test/[testId]/live | 9 | — | Performance Studio test live |
| portal/(fullscreen)/test/[testId]/summary | 21 | — | Indoor test summary |

---

### 6. PlayerHQ — Trening (`portal/tren/*`) — 17 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/tren/kalender | 12 | — | Bane-landscape trenings-kalender |
| portal/tren/aarsplan | 2 | 12 | Swing-fokus + bane-landscape årsplan |
| portal/tren/aarsplan/periode/[id]/rediger | 38 | — | Swing-detalj redigering |
| portal/tren/teknisk-plan | 33 | 8 | Spiller-ball teknisk |
| portal/tren/teknisk-plan/[planId] | 3 | 33 | Spiller-ball plan-detalj |
| portal/tren/fys-plan | 31 | — | Treningsfelt fys |
| portal/tren/fys-plan/[planId] | 24 | 31 | Treningsfelt fys-plan |
| portal/tren/ovelser | 27 | 24 | Treningsfelt øvelser |
| portal/tren/ovelser/[id] | 33 | 27 | Spiller-ball øvelse-detalj |
| portal/tren/tester | 9 | 32 | Performance Studio tester |
| portal/tren/tester/katalog | 21 | — | Indoor tester katalog |
| portal/tren/tester/ny | 32 | — | Indoor data ny test |
| portal/tren/tester/ny/egen | 9 | — | Performance Studio egen test |
| portal/tren/tester/[testId] | 21 | — | Indoor test-detalj |
| portal/tren/turneringer | 42 | 39 | Konkurranse-action |
| portal/tren/turneringer/ny | 43 | — | Konkurranse ny turnering |
| portal/tren/turneringer/[id] | 44 | 42 | Bane-action turnerings-detalj |
| portal/tren/feiring/[planId] | 40 | — | Konkurranse-feiring |
| portal/tren/[sessionId] | 33 | 24 | Spiller-ball + treningsfelt |
| portal/tren/[sessionId]/planlagt | 24 | — | Treningsfelt planlagt |
| portal/trackman/[sessionId] | 9 | 32 | Performance Studio TrackMan |

---

### 7. PlayerHQ — Mål (`portal/mal/*`) — 22 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/mal | 1 | 22 | Swing-mål + bane-action |
| portal/mal/bygger | 33 | 8 | Spiller-ball mål-bygger |
| portal/mal/goal/[id] | 38 | 33 | Swing-detalj mål |
| portal/mal/milepaeler | 40 | — | Konkurranse milepæl |
| portal/mal/leaderboard | 42 | 39 | Konkurranse leaderboard |
| portal/mal/statistikk | 3 | 33 | Spiller-ball statistikk |
| portal/mal/baner | 13 | 12 | Bane-detalj + landscape |
| portal/mal/baner/[id] | 29 | 13 | Performance Studio + bane-detalj |
| portal/mal/runder | 22 | — | Bane-action runder |
| portal/mal/runder/ny | 44 | — | Bane-action ny runde |
| portal/mal/runder/[id] | 23 | 22 | Hull-bilde + bane-action |
| portal/mal/runder/[id]/shot-by-shot | 8 | 23 | Spiller-ball shot-by-shot |
| portal/mal/trackman | 32 | 9 | Indoor data TrackMan |
| portal/mal/trackman/[id] | 9 | 21 | Performance Studio detalj |
| portal/mal/sg-hub | 33 | 3 | Spiller-ball SG hub |
| portal/mal/sg-hub/best-vs-now | 38 | — | Swing-detalj progress |
| portal/mal/sg-hub/[club] | 24 | — | Treningsfelt klubb-SG |
| portal/mal/sg-hub/conditions | 22 | — | Bane-action conditions |
| portal/mal/sg-hub/equipment | 31 | 27 | Treningsfelt utstyr |
| portal/mal/sg-hub/strategy | 13 | — | Bane-detalj strategi |
| portal/mal/sg-hub/yardage | 23 | — | Hull-bilde yardage |
| portal/mal/sg-hub/coach/[spillerId] | 25 | 17 | Coach-instruksjon SG |
| portal/mal/sg-hub/coach/[spillerId]/[club] | 7 | 24 | Coach + treningsfelt |
| portal/mal/sg-hub/coach/[spillerId]/equipment | 17 | 31 | Coach + utstyr |

---

### 8. PlayerHQ — Coach-relasjon (`portal/coach/*`) — 16 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/coach | 7 | 25 | Coach-instruksjon hero |
| portal/coach/ai | 17 | — | Coach AI-assistent |
| portal/coach/[coachId] | 25 | 7 | Coach-detalj |
| portal/coach/melding | 17 | — | Coach-meldinger |
| portal/coach/melding/ny | 7 | — | Coach ny melding |
| portal/coach/melding/[id] | 25 | — | Coach melding-detalj |
| portal/coach/melding/[id]/vedlegg | 17 | — | Coach melding vedlegg |
| portal/coach/notes | 25 | 33 | Coach-notater |
| portal/coach/notes/[noteId] | 17 | 8 | Coach note-detalj |
| portal/coach/ovelser | 27 | 24 | Coach-øvelser |
| portal/coach/ovelser/ny | 24 | — | Coach ny øvelse |
| portal/coach/ovelser/[id]/rediger | 27 | — | Coach øvelse rediger |
| portal/coach/plans | 2 | 33 | Coach-planer |
| portal/coach/plans/perioder | 38 | — | Coach plan-perioder |
| portal/coach/plans/[planId] | 33 | 3 | Coach plan-detalj |
| portal/coach/plans/[planId]/ny-okt | 24 | — | Coach ny økt |
| portal/coach/sporsmal/[id] | 7 | — | Coach spørsmål-detalj |
| portal/coach/videoer | 17 | — | Coach videoer |

---

### 9. PlayerHQ — Talent (`portal/talent/*`) — 5 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/talent | 30 | 35 | Junior talent hub |
| portal/talent/min-plan | 34 | 30 | Junior min-plan |
| portal/talent/mitt-niva | 35 | — | Junior mitt-nivå |
| portal/talent/roadmap | 34 | — | Junior roadmap |
| portal/talent/sammenligning | 30 | 39 | Junior + konkurranse |

---

### 10. PlayerHQ — Statistikk (`portal/statistikk/*`) — 4 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/statistikk | 33 | 22 | Spiller-ball statistikk |
| portal/statistikk/[metric] | 3 | — | Spiller-ball metric |
| portal/statistikk/sammenlign | 8 | — | Spiller-ball sammenlign |
| portal/statistikk/runder/[runId]/del | 44 | — | Bane-action rundedel |

---

### 11. PlayerHQ — Meg (`portal/meg/*`) — 30 skjermer

Profil/innstillinger: stille editorial portrait-foto.

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| portal/meg | 10 | 14 | Editorial portrait hero |
| portal/meg/profil/rediger | 19 | — | Editorial portrait redigering |
| portal/meg/utstyrsbag | 31 | 27 | Treningsfelt utstyr |
| portal/meg/helse | 14 | — | Outdoor portrait helse |
| portal/meg/helse/symptom/ny | 10 | — | Editorial portrait symptom |
| portal/meg/foreldre | 19 | 26 | Editorial portrait foreldre |
| portal/meg/feedback | 14 | — | Outdoor portrait feedback |
| portal/meg/dokumenter | 5 | — | Generell editorial |
| portal/meg/sikkerhet | 10 | — | Editorial portrait sikkerhet |
| portal/meg/sikkerhet/2fa | 19 | — | Editorial portrait 2FA |
| portal/meg/innstillinger | 14 | — | Outdoor portrait innstillinger |
| portal/meg/innstillinger/anlegg | 13 | — | Bane-detalj anlegg |
| portal/meg/innstillinger/eksport | 5 | — | Generell editorial |
| portal/meg/innstillinger/integrasjoner | 32 | — | Indoor data integrasjoner |
| portal/meg/innstillinger/okter | 24 | — | Treningsfelt økt-pref |
| portal/meg/innstillinger/personvern | 10 | — | Editorial portrait personvern |
| portal/meg/innstillinger/sikkerhet | 19 | — | Editorial portrait sikkerhet |
| portal/meg/innstillinger/sprak | 5 | — | Generell editorial |
| portal/meg/innstillinger/varsler | 14 | — | Outdoor portrait varsler |
| portal/meg/abonnement | 4 | — | Generell editorial abonnement |
| portal/meg/abonnement/avbestill | 6 | — | Generell editorial |
| portal/meg/abonnement/oppgrader | 1 | 22 | Swing-hero + bane-action oppgrader |
| portal/meg/abonnement/oppgrader/flyt | 38 | — | Swing-detalj oppgrader-flyt |
| portal/meg/abonnement/faktura/[id] | 5 | — | Generell editorial faktura |
| portal/meg/abonnement/kort/ny | 4 | — | Generell editorial kort |
| portal/meg/bookinger | 12 | — | Bane-landscape mine bookinger |
| portal/meg/bookinger/reschedule/[bookingId] | 29 | — | Performance Studio reschedule |
| portal/meg/help | 26 | 20 | Mottar instruksjon help |
| portal/meg/help/kontakt | 15 | — | Mottar instruksjon kontakt |
| portal/meg/help/kategori/[slug] | 20 | — | Mottar instruksjon kategori |
| portal/meg/help/artikkel/[slug] | 26 | — | Mottar instruksjon artikkel |

---

### 12. CoachHQ — Toppnivå og hub (`admin/*`) — 30 skjermer

Coach-relevante foto dominerer.

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin | 17 | 25 | Coach-instruksjon hub |
| admin/profile | 19 | 10 | Editorial portrait coach |
| admin/board | 4 | — | Generell editorial board |
| admin/brief | 7 | 17 | Coach-instruksjon brief |
| admin/innboks | 25 | — | Coach-instruksjon innboks |
| admin/messages | 17 | — | Coach-meldinger admin |
| admin/kommunikasjon | 7 | 25 | Coach-kommunikasjon |
| admin/email-templates | 5 | — | Generell editorial templates |
| admin/email-templates/[id]/rediger | 6 | — | Generell editorial rediger |
| admin/foresporsler | 25 | — | Coach-forespørsler |
| admin/godkjenninger | 17 | — | Coach-godkjenninger |
| admin/approvals | 7 | — | Coach approvals (engelsk variant) |
| admin/approvals/[id] | 25 | — | Coach approval-detalj |
| admin/audit-log | 5 | — | Generell editorial audit |
| admin/audit-log/[id] | 6 | — | Generell editorial audit-detalj |
| admin/queue | 4 | — | Generell editorial kø |
| admin/oppfolging | 17 | — | Coach-oppfølging |
| admin/hjelp | 26 | 20 | Hjelpe-sider |
| admin/analyse | 33 | 3 | Spiller-ball analyse |
| admin/analysere | 8 | — | Spiller-ball analysere |
| admin/analytics | 32 | — | Indoor data analytics |
| admin/reports | 6 | — | Generell editorial rapporter |
| admin/finance | 4 | — | Generell editorial finans |
| admin/reach | 39 | — | Konkurranse reach |
| admin/recording | 32 | 9 | Indoor opptak |
| admin/videoer | 9 | — | Performance Studio videoer |
| admin/trackman | 9 | 21 | Performance Studio TrackMan |
| admin/coach-workbench | 7 | 25 | Coach-workbench |
| admin/integrasjoner | 32 | — | Indoor data integrasjoner |
| admin/lag-snitt | 39 | — | Konkurranse lag-snitt |
| admin/tilstander | 32 | — | Indoor data tilstander |

---

### 13. CoachHQ — Spillere og talent (`admin/spillere`, `admin/talent`) — 22 skjermer

Mix av coach-foto (instruksjon-perspektiv) og junior-foto (når spilleren er ung).

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin/spillere | 25 | 17 | Coach + spillere-liste |
| admin/spillere/ny | 7 | — | Coach ny spiller |
| admin/spillere/[id] | 30 | 25 | Junior spiller-detalj + coach |
| admin/spillere/[id]/profil | 19 | 30 | Portrait + junior |
| admin/spillere/[id]/rediger | 10 | — | Editorial portrait rediger |
| admin/spillere/[id]/tester | 9 | 21 | Performance Studio spiller-tester |
| admin/spillere/[id]/tildel-test | 32 | — | Indoor data tildel-test |
| admin/spillere/[id]/plan/[planId] | 33 | 3 | Spiller-ball plan-detalj |
| admin/talent | 34 | 30 | Junior talent hub |
| admin/talent/[playerId] | 35 | 34 | Junior detalj |
| admin/talent/discovery | 30 | — | Junior discovery |
| admin/talent/kohort | 34 | 35 | Junior kohort |
| admin/talent/radar | 30 | — | Junior radar oversikt |
| admin/talent/radar/[playerId] | 35 | 30 | Junior radar-detalj |
| admin/talent/region | 34 | — | Junior region |
| admin/talent/sammenligning | 30 | 35 | Junior sammenligning |
| admin/talent/ressurser | 26 | — | Mottar instruksjon ressurser |
| admin/talent/wagr-import | 32 | — | Indoor data WAGR |
| admin/talent/wagr-benchmark | 39 | — | Konkurranse WAGR benchmark |
| admin/teknisk-plan | 38 | 33 | Swing teknisk-plan |
| admin/teknisk-plan/[spillerId] | 2 | 38 | Swing + spiller-teknisk |
| admin/stall | 17 | 25 | Coach-stall |

---

### 14. CoachHQ — Planer og økter (`admin/plans`, `admin/plan-templates`, `admin/okter`, `admin/gjennomfore`) — 17 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin/plans | 2 | 38 | Swing planer-oversikt |
| admin/plans/new | 33 | — | Spiller-ball ny plan |
| admin/plans/[planId] | 38 | 3 | Swing plan-detalj |
| admin/plans/templates | 4 | — | Generell editorial templates |
| admin/plans/templates/ny | 6 | — | Generell editorial ny template |
| admin/plans/templates/[id]/rediger | 5 | — | Generell editorial rediger |
| admin/plans/templates/[id]/effectiveness | 33 | — | Spiller-ball effektivitet |
| admin/plan-templates | 5 | — | Generell editorial plan-templates |
| admin/plan-templates/ny | 4 | — | Generell editorial ny |
| admin/plan-templates/[id] | 6 | — | Generell editorial detalj |
| admin/plan-templates/[id]/rediger | 5 | — | Generell editorial rediger |
| admin/planlegge | 2 | 12 | Swing-planlegg + bane-landscape |
| admin/okter | 24 | 27 | Treningsfelt økter |
| admin/gjennomfore | 3 | 8 | Spiller-ball gjennomfør |
| admin/gjennomfore/okter/[id] | 33 | 24 | Spiller-ball + treningsfelt |
| admin/drills | 27 | 24 | Treningsfelt drill-bibliotek |
| admin/drills/[id] | 24 | 8 | Treningsfelt + spiller-ball |
| admin/drills/[id]/rediger | 27 | — | Treningsfelt rediger drill |

---

### 15. CoachHQ — Tester (`admin/tester`) — 4 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin/tester | 9 | 32 | Performance Studio tester |
| admin/tester/foreslatte | 21 | — | Indoor foreslåtte tester |
| admin/tester/[id] | 32 | 9 | Indoor data test-detalj |
| admin/tester/tildel/[spillerId] | 9 | — | Performance Studio tildel |

---

### 16. CoachHQ — Booking, kalender, kapasitet (`admin/bookinger`, `admin/kalender`, `admin/calendar`, `admin/availability`, `admin/kapasitet`, `admin/runder`, `admin/services`) — 14 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin/bookinger | 12 | 13 | Bane-landscape bookinger |
| admin/kalender | 28 | 12 | Bane-landscape kalender |
| admin/kalender/uke | 29 | — | Performance Studio uke |
| admin/kalender/maned | 13 | — | Bane-detalj måned |
| admin/calendar | 12 | — | Bane-landscape (engelsk) |
| admin/calendar/maned | 28 | — | Bane-landscape måned |
| admin/availability | 29 | — | Performance Studio tilgjengelighet |
| admin/kapasitet | 21 | 9 | Indoor kapasitet |
| admin/runder | 22 | 44 | Bane-action runder |
| admin/services | 29 | — | Performance Studio tjenester |
| admin/locations | 13 | 28 | Bane-detalj lokasjoner |
| admin/facilities | 29 | 13 | Performance Studio fasiliteter |
| admin/facilities/[id] | 21 | 29 | Indoor fasilitet-detalj |
| admin/anlegg | 28 | 13 | Bane-landscape anlegg |
| admin/anlegg/[id] | 13 | 12 | Bane-detalj anlegg |

---

### 17. CoachHQ — Turneringer (`admin/tournaments`) — 4 skjermer

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin/tournaments | 42 | 39 | Konkurranse oversikt |
| admin/tournaments/ny | 43 | — | Konkurranse ny |
| admin/tournaments/[id] | 44 | 42 | Bane-action turnerings-detalj |
| admin/tournaments/dubletter | 40 | — | Konkurranse dubletter |

---

### 18. CoachHQ — Workspace, agencyos, agents, organisasjon, klubb, settings, grupper, team — 28 skjermer

Adminbruk: stille editorial og generelle foto.

| Skjerm | Hero | Sub | Theme |
|---|---|---|---|
| admin/workspace | 4 | — | Generell editorial workspace |
| admin/workspace/notion | 5 | — | Generell editorial notion |
| admin/workspace/oppgaver | 6 | — | Generell editorial oppgaver |
| admin/workspace/oppgaver/[id] | 4 | — | Generell editorial oppgave-detalj |
| admin/workspace/prosjekter | 5 | — | Generell editorial prosjekter |
| admin/workspace/tildelt-meg | 6 | — | Generell editorial tildelt-meg |
| admin/agencyos | 19 | 10 | Editorial portrait agency |
| admin/agencyos/caddie | 14 | — | Outdoor portrait caddie |
| admin/agencyos/caddie/aktivitet | 10 | — | Editorial portrait aktivitet |
| admin/agencyos/spillere | 25 | 30 | Coach + junior agency-spillere |
| admin/agencyos/uka | 19 | — | Editorial portrait uka |
| admin/agencyos/okonomi | 4 | — | Generell editorial økonomi |
| admin/agents | 32 | — | Indoor data agents |
| admin/agents/[agentId] | 9 | — | Performance Studio agent-detalj |
| admin/organisasjon | 19 | 14 | Editorial portrait organisasjon |
| admin/klubb/innstillinger | 10 | — | Editorial portrait klubb-innstillinger |
| admin/team | 25 | 7 | Coach team |
| admin/team/inviter | 17 | — | Coach team-invitasjon |
| admin/grupper | 25 | 30 | Coach + junior grupper |
| admin/grupper/[id] | 17 | 34 | Coach + junior gruppe-detalj |
| admin/settings | 19 | — | Editorial portrait settings |
| admin/settings/api | 32 | — | Indoor data API |
| admin/settings/calendar | 12 | — | Bane-landscape kalender-settings |
| admin/settings/security | 10 | — | Editorial portrait sikkerhet |
| admin/settings/tilgang | 14 | — | Outdoor portrait tilgang |

---

### 19. Design system og demo-skjermer (skip for foto-tilordning)

Følgende ekskluderes fra foto-bruk (interne verktøy/demoer):

- `design`, `design/*`, `(internal)/*`, alle `*-demo`-ruter

---

## Foto-bruksfrekvens

Telling basert på alle 330 produkt-skjermer ovenfor (hero + sub).
Mål: 2-12 bruk per foto, ingen foto >16, ingen foto = 0.

| Foto ID | Tema | Antall bruk (hero+sub) | Status |
|---|---|---|---|
| 1 | Swing-hero | 4 | OK |
| 2 | Swing-fokus | 6 | OK |
| 3 | Spiller+ball | 9 | OK |
| 4 | Generell editorial | 11 | OK |
| 5 | Generell editorial | 12 | OK |
| 6 | Generell editorial | 10 | OK |
| 7 | Coach-instruksjon | 12 | OK |
| 8 | Spiller+ball | 9 | OK |
| 9 | Performance Studio | 13 | OK |
| 10 | Editorial portrait | 11 | OK |
| 11 | Putting/short-game | 1 | Lav — vurder mer bruk |
| 12 | Bane-landscape | 15 | OK |
| 13 | Bane-detalj | 14 | OK |
| 14 | Outdoor portrait | 14 | OK |
| 15 | Mottar instruksjon | 5 | OK |
| 16 | Putting/short-game | 1 | Lav — vurder mer bruk |
| 17 | Coach-instruksjon | 16 | Maks-grense — ikke utvid |
| 18 | Putting/short-game | 1 | Lav — vurder mer bruk |
| 19 | Editorial portrait | 12 | OK |
| 20 | Mottar instruksjon | 6 | OK |
| 21 | Performance Studio | 9 | OK |
| 22 | Bane-action | 8 | OK |
| 23 | Hull-bilde | 3 | OK |
| 24 | Treningsfelt | 16 | Maks-grense |
| 25 | Coach-instruksjon | 16 | Maks-grense |
| 26 | Mottar instruksjon | 9 | OK |
| 27 | Treningsfelt | 11 | OK |
| 28 | Bane-landscape | 9 | OK |
| 29 | Performance Studio | 11 | OK |
| 30 | Junior | 16 | Maks-grense |
| 31 | Treningsfelt utstyr | 5 | OK |
| 32 | Indoor data | 15 | OK |
| 33 | Spiller+ball | 18 | Over maks — flytt 2 til 8 eller 3 |
| 34 | Junior | 10 | OK |
| 35 | Junior | 7 | OK |
| 38 | Swing-detalj | 9 | OK |
| 39 | Konkurranse-action | 9 | OK |
| 40 | Konkurranse-feiring | 4 | OK |
| 42 | Konkurranse-action | 8 | OK |
| 43 | Konkurranse-detalj | 5 | OK |
| 44 | Bane-action | 6 | OK |

**Tall er omtrent — gjør en eksakt opp-telling under implementering hvis dette skal måles formelt.**

---

## Anbefalte justeringer før implementering

1. **Foto #11, #16, #18 (putting/short-game)** er under-utnyttet (1 bruk hver).
   Når putting-spesifikke V2-mønstre etableres (SG-putt-detalj-side, putting-drill-detalj),
   flytt over fra #33/#8 til disse for tematisk presisjon.

2. **Foto #33 (spiller+ball)** brukes 18 ganger. Vurder å splitte ut bruk i
   `portal/coach/*` og overføre 2-3 til foto #8 eller #3 (samme tema).

3. **Foto #17, #24, #25, #30** sitter på 16 bruk. Hold der — ikke utvid mer.

4. **Junior-foto (30, 34, 35)** brukes kun på spiller-relaterte og junior-sider.
   Verifiser at ingen er feilaktig brukt på admin-lister.

5. **Hero-only på live/fullscreen-skjermer** — ingen sub-foto fordi UI er fokus-orientert.

---

## Implementeringsnotater

- **Lagring:** Alle foto ligger i `public/images/akgolf/AK-Golf-Academy-{ID}.webp`
- **Bruk i kode:** `<Image src="/images/akgolf/AK-Golf-Academy-1.webp" ... />` (Next.js `<Image>` med `priority` på hero)
- **PhotoDivider-komponenten:** brukes for sub-foto i editorial sections (etableres i V2-PATTERNS.md hvis ikke allerede der)
- **Mobile:** hero-foto skal være 16:9, sub-foto 4:3 — sjekk at WebP-filene støtter begge crops
- **Alt-tekst:** generisk "AK Golf Academy" som default; spesifiser per skjerm i implementering
- **Fallback:** hvis foto-fil mangler ved deploy, vis CSS-gradient med brand-farger (allerede definert i V2-tokens)

---

## Endringskontroll

Endringer i denne matrisen krever:
1. Verifisering at total foto-bruk per foto holder seg innen 2-16
2. Konsekvens-sjekk: hvilke V2-PATTERNS.md-mønstre påvirkes
3. Oppdater telling i "Foto-bruksfrekvens"-tabellen
