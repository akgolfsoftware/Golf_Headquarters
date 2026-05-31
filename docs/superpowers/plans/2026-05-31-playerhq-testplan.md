# PlayerHQ — Komplett testplan

> Generert 2026-05-31 · Basert på faktisk kildekode og rute-inventar.
> 127 ruter i `/portal/`. Testen dekker alle brukerflyter en reell spiller vil treffe.
>
> **Svar på nøkkelspørsmål:** Kan spiller lage sin egentreningsplan?
> → Se seksjon 3.1. Kort svar: **delvis** — stub på "Ny plan"-knapp, men Workbench og AI mal-bygger fungerer.

---

## Testmiljø

- URL: `https://akgolf-hq.vercel.app` (prod) eller `http://localhost:3000` (lokal)
- Testbruker: opprett ny spiller-konto via signup (ikke coach/admin)
- Browser: Chrome + Safari (mobil)
- Status-kolonner: ✅ OK · ❌ Feil · ⚠️ Stub/delvis · — Ikke testet

---

## 1. Autentisering og tilgangskontroll

| # | Test | Forventet | Status |
|---|---|---|---|
| 1.1 | Gå til `/portal` uten innlogging | Redirect til `/auth/login` | — |
| 1.2 | Logg inn med gyldig e-post + passord | Havner på `/portal` | — |
| 1.3 | Logg inn med feil passord | Feilmelding vises, ikke innlogget | — |
| 1.4 | Gå til `/admin` som spiller | Redirect til login eller 403 | — |
| 1.5 | Gå til `/portal/logget-ut` | Viser bekreftelse, ikke innlogget lenger | — |
| 1.6 | Glemte passord → klikk link → reset | Ny passord-form fungerer | — |
| 1.7 | Onboarding (ny spiller første gang) | HCP-skjema, navn, fødselsdato | — |

---

## 2. Dashboard (Hjem) — `/portal`

| # | Test | Forventet | Status |
|---|---|---|---|
| 2.1 | Siden laster uten feil | 200, ingen console-errors | — |
| 2.2 | Navn + HCP vises | Brukerens eget navn og handicap | — |
| 2.3 | Neste booking vises (hvis finnes) | Dato, tid, sted | — |
| 2.4 | Aktiv treningsplan vises (hvis finnes) | Plannavn, fremgang | — |
| 2.5 | Siste runde vises (hvis finnes) | Score, bane, dato | — |
| 2.6 | Navigasjon til alle hovedmenyer | Klikk virker, ingen 404 | — |
| 2.7 | Mobil: bottom-nav fungerer | Alle 5 faner klikkes | — |

---

## 3. Trening

### 3.1 Egentreningsplan — NØKKELTESTING

| # | Test | Forventet | Status | Merknad |
|---|---|---|---|---|
| 3.1.1 | Gå til `/portal/tren/teknisk-plan` | Siden laster, liste over planer | — | |
| 3.1.2 | Klikk "Ny plan"-knappen | **Skal åpne dialog/flyt for å lage plan** | — | **STUB** — knapp er `type="button"` uten action. Åpner ingenting. |
| 3.1.3 | Gå til `/portal/planlegge/workbench` | Workbench laster med chrome | — | Fungerer, men er kompleks |
| 3.1.4 | Opprett en periode i Workbench | Modal åpner, navn + uker lagres | — | Lagres som TechnicalPlanAudit (ikke PeriodBlock ennå) |
| 3.1.5 | Gå til `/portal/mal/bygger` (AI mal-bygger) | 5-stegs wizard vises | — | Fungerer, AI-generert plan |
| 3.1.6 | Kjør gjennom alle 5 steg i bygger | Steg 1-5 fungerer, plan opprettes | — | |
| 3.1.7 | Gå til `/portal/ny-okt` | Siden laster | — | **STUB** — info-card, ingen ekte wizard |
| 3.1.8 | Gå til `/portal/tren/kalender` | Kalender med "Egne økter" auto-plan | — | |

**Konklusjon treningsplan:**
- `/portal/tren/teknisk-plan` → "Ny plan"-knapp: **ikke funksjonell** (stub)
- `/portal/ny-okt` → Wizard: **ikke funksjonell** (stub, post-BETA)
- `/portal/planlegge/workbench` → **fungerer**, oppretter plan + perioder
- `/portal/mal/bygger` → **fungerer**, AI-generert plan

### 3.2 Teknisk plan (eksisterende planer)

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.2.1 | Klikk på en eksisterende plan | `/portal/tren/teknisk-plan/[planId]` laster | — |
| 3.2.2 | Registrer øvelsesreps | Teller oppdateres | — |
| 3.2.3 | Se fremdrift per P-posisjon | Visualisering vises | — |

### 3.3 Årsplan

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.3.1 | `/portal/tren/aarsplan` laster | Gantt-kart for hele året | — |
| 3.3.2 | Klikk periode → rediger | `/tren/aarsplan/periode/[id]/rediger` laster | — |
| 3.3.3 | Drag periode i Gantt | Dato oppdateres | — |

### 3.4 Fysisk plan

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.4.1 | `/portal/tren/fys-plan` laster | Liste over fysiske planer | — |
| 3.4.2 | "Ny plan"-knapp | Åpner ny plan-flyt | — |
| 3.4.3 | Klikk plan → `/tren/fys-plan/[planId]` | Detalj-side laster | — |

### 3.5 Tester

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.5.1 | `/portal/tren/tester` laster | Oversikt over tester | — |
| 3.5.2 | Klikk "Ny test" → `/tren/tester/ny` | Wizard laster | — |
| 3.5.3 | Velg en NGF-test → gjennomfør | Score lagres | — |
| 3.5.4 | `/portal/tren/tester/katalog` | Katalog over alle tilgjengelige tester | — |
| 3.5.5 | `/portal/tren/tester/ny/egen` | Egendefinert test opprettes | — |
| 3.5.6 | Live test-modus `/portal/(fullscreen)/test/[testId]/live` | Scoring fungerer live | — |
| 3.5.7 | Test-summary etter fullføring | Resultater vises | — |

### 3.6 Øvelser (Drills)

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.6.1 | `/portal/drills` laster | Grid/liste med drills | — |
| 3.6.2 | Klikk en drill → `/portal/drills/[id]` | Detalj-side med beskrivelse | — |
| 3.6.3 | Søk/filtrer drills | Resultater oppdateres | — |
| 3.6.4 | `/portal/tren/ovelser` laster | Øvelsesliste | — |
| 3.6.5 | Klikk øvelse → detalj | `/tren/ovelser/[id]` laster | — |

### 3.7 Turneringer

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.7.1 | `/portal/tren/turneringer` laster | Turneringsliste | — |
| 3.7.2 | Klikk turnering → detalj | `/tren/turneringer/[id]` laster | — |
| 3.7.3 | "Ny turnering"-flyt | `/tren/turneringer/ny` laster + lagrer | — |

### 3.8 Kalender

| # | Test | Forventet | Status |
|---|---|---|---|
| 3.8.1 | `/portal/tren/kalender` laster | Uke/måned-visning | — |
| 3.8.2 | Klikk en økt i kalender | Detalj åpner | — |

---

## 4. Gjennomfør live-økt

| # | Test | Forventet | Status |
|---|---|---|---|
| 4.1 | Klikk "Start økt" fra en plan | `/portal/(fullscreen)/tren` laster | — |
| 4.2 | Brief-skjerm | Økt-info vises | — |
| 4.3 | `/live/[sessionId]/active` — live tapper | Reps/sets registreres | — |
| 4.4 | `/live/[sessionId]/logger` | Logger fungerer | — |
| 4.5 | Fullfør økt → summary | Sammendrag med statistikk | — |
| 4.6 | `/portal/gjennomfore` laster | Dagens gjennomføring | — |

---

## 5. Analysér

### 5.1 Statistikk

| # | Test | Forventet | Status |
|---|---|---|---|
| 5.1.1 | `/portal/statistikk` laster | Oversikt over nøkkeltall | — |
| 5.1.2 | `/portal/statistikk/[metric]` — klikk en metrikk | Drilldown-side laster | — |
| 5.1.3 | `/portal/statistikk/sammenlign` | Sammenlign mot PGA-spiller | — |
| 5.1.4 | Del runde `/portal/statistikk/runder/[runId]/del` | Del-flyt fungerer | — |

### 5.2 SG Hub

| # | Test | Forventet | Status |
|---|---|---|---|
| 5.2.1 | `/portal/mal/sg-hub` laster | 4 SG-kategorier OTT/APP/ARG/PUTT | — |
| 5.2.2 | Klikk en kølle → `/sg-hub/[club]` | DPlane + Strike + Trend vises | — |
| 5.2.3 | `/sg-hub/best-vs-now` | Beste sesjon vs. nåværende | — |
| 5.2.4 | `/sg-hub/equipment` | Utstyrsanalyse laster | — |
| 5.2.5 | `/sg-hub/yardage` | Carry-distansetabell vises | — |
| 5.2.6 | `/sg-hub/conditions` | Kondisjonsjusteringer laster | — |
| 5.2.7 | `/sg-hub/benchmark` | PGA-benchmark-sammenligning | — |

### 5.3 TrackMan

| # | Test | Forventet | Status |
|---|---|---|---|
| 5.3.1 | `/portal/mal/trackman` laster | Sesjonsliste | — |
| 5.3.2 | Klikk sesjon → `/trackman/[id]` | Dispersion-plot + per-slag data | — |

### 5.4 Runder

| # | Test | Forventet | Status |
|---|---|---|---|
| 5.4.1 | `/portal/mal/runder` laster | Rundeliste | — |
| 5.4.2 | Klikk runde → `/mal/runder/[id]` | Detalj med score + SG | — |
| 5.4.3 | `/mal/runder/[id]/shot-by-shot` | Slag-for-slag-analyse | — |
| 5.4.4 | Logg ny runde → `/mal/runder/ny` | Skjema fungerer, lagres | — |

### 5.5 Analysere (general)

| # | Test | Forventet | Status |
|---|---|---|---|
| 5.5.1 | `/portal/analysere` laster | Analyse-oversikt | — |
| 5.5.2 | `/portal/analysere/hull` | Hull-for-hull-analyse | — |

---

## 6. Mål

| # | Test | Forventet | Status |
|---|---|---|---|
| 6.1 | `/portal/mal` laster | Mål-oversikt | — |
| 6.2 | Klikk et mål → `/mal/goal/[id]` | Detalj-side | — |
| 6.3 | `/portal/mal/leaderboard` | Rangering mot andre spillere | — |
| 6.4 | `/portal/mal/milepaeler` | Milepæler-liste | — |
| 6.5 | `/portal/mal/statistikk` | Statistikk-oversikt | — |
| 6.6 | `/portal/mal/baner` | Bane-oversikt | — |
| 6.7 | Klikk bane → `/mal/baner/[id]` | Bane-detalj med historikk | — |

---

## 7. Coach-fanen

| # | Test | Forventet | Status |
|---|---|---|---|
| 7.1 | `/portal/coach` laster | Coach-oversikt med min coach | — |
| 7.2 | Klikk coach → `/coach/[coachId]` | Coach-profil | — |
| 7.3 | `/portal/coach/melding` | Innboks med meldinger | — |
| 7.4 | Ny melding → `/coach/melding/ny` | Kan skrive + sende melding | — |
| 7.5 | Klikk melding → `/coach/melding/[id]` | Melding åpner | — |
| 7.6 | `/coach/melding/[id]/vedlegg` | Vedlegg-liste | — |
| 7.7 | `/portal/coach/notes` | Coach-notater for meg | — |
| 7.8 | `/portal/coach/plans` | Planer coach har lagt til | — |
| 7.9 | Klikk plan → `/coach/plans/[planId]` | Plan-detalj | — |
| 7.10 | `/coach/plans/[planId]/ny-okt` | Legg til økt i coach-plan | — |
| 7.11 | `/coach/ovelser` | Øvelser coach har laget | — |
| 7.12 | `/coach/videoer` | Video-bibliotek fra coach | — |
| 7.13 | `/portal/coach/ai` | AI-anbefalinger | — |
| 7.14 | `/coach/sporsmal/[id]` | Svar på coach-spørsmål | — |

---

## 8. Booking

| # | Test | Forventet | Status |
|---|---|---|---|
| 8.1 | `/portal/booking` laster | Booking-oversikt + "Book time" | — |
| 8.2 | Klikk "Book time" → `/booking/ny` | Bookingflyt starter | — |
| 8.3 | Velg anlegg → `/booking/anlegg/[anleggId]` | Ledige tider vises | — |
| 8.4 | Velg coach → `/booking/coach/[coachId]` | Coach-tilgjengeliget vises | — |
| 8.5 | Gå til `/booking/ny/bekreft` | Bekreftelse-skjerm | — |
| 8.6 | Fullfør booking | Booking lagres, bekreftelse-e-post | — |
| 8.7 | `/booking/bekreftet` | Bekreftelse-side vises | — |
| 8.8 | Se en eksisterende booking → `/booking/[bookingId]` | Detalj vises | — |
| 8.9 | Avbestill booking | Status settes til CANCELLED | — |
| 8.10 | Reschedule → `/meg/bookinger/reschedule/[bookingId]` | Ny tid velges | — |
| 8.11 | **Race condition (dobbel-klikk på Book)** | Kun én booking opprettes | — |
| 8.12 | `/portal/meg/bookinger` | Min bookinghistorikk | — |

---

## 9. Planlegge / Workbench

| # | Test | Forventet | Status |
|---|---|---|---|
| 9.1 | `/portal/planlegge` laster | Planlegge-oversikt | — |
| 9.2 | `/portal/planlegge/workbench` laster | Workbench med chrome | — |
| 9.3 | Zoom-tabs fungerer (År/Periode/Måned/Uke/Dag) | Canvas skifter | — |
| 9.4 | Klikk økt i canvas → session-drawer åpner | Drawer vises fra høyre | — |
| 9.5 | Esc lukker drawer | Drawer lukkes | — |
| 9.6 | Klikk "Fasiliteter"-ikon → modal åpner | 10+ toggle-knapper | — |
| 9.7 | Lagre fasiliteter | Persisteres til DB | — |
| 9.8 | Klikk "+ Ny periode" → modal åpner | Navn + uker-felt | — |
| 9.9 | Plan A / Plan B-bytting | Canvas oppdateres | — |
| 9.10 | Drag-drop økt til annen uke | Posisjon oppdateres | — |
| 9.11 | AI-bar-chips ("Generér uke") | Modal åpner | — |
| 9.12 | Del plan-knapp | "Lenke kopiert"-toast | — |

---

## 10. Meg (profil og innstillinger)

| # | Test | Forventet | Status |
|---|---|---|---|
| 10.1 | `/portal/meg` laster | Profilside | — |
| 10.2 | `/meg/profil/rediger` | Kan endre navn, bilde | — |
| 10.3 | `/portal/meg/abonnement` | Abonnement-status (GRATIS/PRO) | — |
| 10.4 | Oppgrader til PRO → `/abonnement/oppgrader` | Stripe-betaling fungerer | — |
| 10.5 | `/abonnement/kort/ny` | Legg til kort | — |
| 10.6 | Avbestill abonnement → `/abonnement/avbestill` | Bekreftelse + avbestilt | — |
| 10.7 | `/meg/innstillinger` | Innstillinger-oversikt | — |
| 10.8 | Innstillinger → varsler | Toggle-er fungerer | — |
| 10.9 | Innstillinger → personvern | GDPR-valg lagres | — |
| 10.10 | Innstillinger → sikkerhet | Passord-bytte fungerer | — |
| 10.11 | `/meg/innstillinger/2fa` | To-faktor-oppsett | — |
| 10.12 | `/portal/meg/helse` | Helse-logger | — |
| 10.13 | Legg til symptom → `/helse/symptom/ny` | Symptom lagres | — |
| 10.14 | `/portal/meg/dokumenter` | Dokument-liste | — |
| 10.15 | `/portal/meg/utstyrsbag` | Utstyr-oversikt | — |
| 10.16 | `/portal/meg/hjelp/kontakt` | Kontaktskjema | — |
| 10.17 | `/portal/meg/foreldre` | Foresatt-info | — |

---

## 11. Talent-seksjonen

| # | Test | Forventet | Status |
|---|---|---|---|
| 11.1 | `/portal/talent` laster | Talent-oversikt | — |
| 11.2 | `/portal/talent/min-plan` | Min utviklingsplan | — |
| 11.3 | `/portal/talent/roadmap` | Veikart for utvikling | — |
| 11.4 | `/portal/talent/mitt-niva` | Nåværende nivå-vurdering | — |
| 11.5 | `/portal/talent/sammenligning` | Sammenlign mot andre | — |

---

## 12. Ønsket økt og utfordringer

| # | Test | Forventet | Status |
|---|---|---|---|
| 12.1 | `/portal/onskeligokt` laster | Ønskede økt-skjema | — |
| 12.2 | Send ønsket økt | Lagres, bekreftelse | — |
| 12.3 | `/onskeligokt/bekreftet` | Bekreftelse-side | — |
| 12.4 | `/portal/utfordringer` | Utfordringsliste | — |
| 12.5 | Klikk utfordring → `/utfordringer/[id]` | Detalj | — |
| 12.6 | Ny utfordring → `/utfordringer/ny` | Skjema fungerer | — |

---

## 13. Spesialfunksjoner

| # | Test | Forventet | Status |
|---|---|---|---|
| 13.1 | `/portal/varsler` | Varslinger-liste | — |
| 13.2 | `/portal/kalender` laster | Kalendervisning | — |
| 13.3 | `/portal/reach` | Nå ut-side | — |
| 13.4 | `/portal/spiller/[spillerId]` | Spiller-profil | — |
| 13.5 | AI drill-forslag → `/portal/ai/foresla-drill` | Forslag vises | — |
| 13.6 | AI turnering-forslag → `/portal/ai/foresla-turnering` | Forslag vises | — |
| 13.7 | `/portal/stats` | Stats-oversikt | — |

---

## 14. Tilgangskontroll — abonnement

| # | Test | Forventet | Status |
|---|---|---|---|
| 14.1 | GRATIS bruker → PRO-funksjon | Upgrade-prompt vises | — |
| 14.2 | PRO bruker → alle PRO-funksjoner | Full tilgang | — |
| 14.3 | Utgått abonnement → fremdeles tilgang? | Skal vise renewal-prompt | — |

---

## 15. Mobil-QA (iPhone Safari)

| # | Test | Forventet | Status |
|---|---|---|---|
| 15.1 | Dashboard laster | Ingen overflow, lesbar | — |
| 15.2 | Bottom-nav synlig + klikkbar | Alle 5 faner | — |
| 15.3 | Booking-flyt på mobil | Fungerer touch | — |
| 15.4 | Workbench på mobil | Viser fallback-melding eller fungerer | — |
| 15.5 | Live-økt-skjerm på mobil | Touch-vennlig | — |

---

## Prioritert rekkefølge for manuell testing

### Test disse FØRST (kritisk for beta-launch):

1. **Seksjon 1** — Autentisering + tilgangskontroll
2. **Seksjon 8.1–8.11** — Booking (inkl. race condition)
3. **Seksjon 3.1** — Egentreningsplan-spørsmålet
4. **Seksjon 2** — Dashboard laster
5. **Seksjon 10.3–10.6** — Abonnement/Stripe
6. **Seksjon 15** — Mobil-QA

### Test DERETTER (viktig, men ikke launch-blokkerende):

7. Seksjon 7 — Coach-kommunikasjon
8. Seksjon 4 — Live-økt
9. Seksjon 5 — Analyse/SG Hub
10. Seksjon 9 — Workbench

---

## Kjente stub-sider (ikke test disse — er bevisst uferdige)

| Rute | Status | Beskrivelse |
|---|---|---|
| `/portal/ny-okt` | STUB | Info-card, wizard post-BETA |
| `/portal/tren/teknisk-plan` → "Ny plan" | STUB | Knapp uten action |
| `/portal/workbench-v2` | GAMMEL | Kan slettes |
| `/portal/coach/ai` → AI-chips | STUB | Åpner modal, men ingen AI-funksjon |
| `/portal/planlegge/workbench` → AI Command Bar | STUB | Chips fungerer, AI-svar kommer post-beta |

---

*Plan lagret: 2026-05-31 · Prosjekt: akgolf-hq*
