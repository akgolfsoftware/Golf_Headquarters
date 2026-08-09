# Plan: Komplett Paper-design for hele appen

> **Fremdrift 2026-08-09:** Wave **0–D** agent-port + finpuss ✅ i sandbox.  
> **Ikke DONE** (mangler pixel screenshots + Anders sign-off + Mac push til main).  
> Levende status: **`docs/port/WAVE-STATUS-MASTER.md`**.

**Fasit (pixel):** `designsystem/paper/` (= `AK Golf HQ — Claude Paper.zip`, 07.08.2026)  
**Omfang del 1:** alt i zip (fase1 33 + fase2 W1 11 + templates) — **pixel-nært**  
**Omfang del 2:** **alle øvrige app-skjermer uten fasit** (~400+ `page.tsx`) — **pattern-designet av Grok** mot designsystemet (tokens, shell, komponenter)  
**Utenfor inntil ny zip:** W2–W6 HTML som Claude Design tegner nå (importeres senere som ny del 1)

**Mål:**
1. Hver fasit-HTML → eier-komponent, pixel-nær m+d, Paper-regler, ærlig empty, screenshots  
2. Hver rute **uten** fasit → ser ut som Paper-appen (samme tokens/shell/CTA), ikke «gammel V1/grå admin»

---

## 0. Preflight (obligatorisk før Wave A)

Se **`docs/port/PAPER-PREFLIGHT-CONFLICTS-2026-08-09.md`**.  
Wave **0** (token-semantikk, ingen dobbel shell, golfdata-scope, Mac push) **før** pixel-port.

## 0b. Definisjon av «komplett skjerm»

En skjerm er **DONE** kun når alle er sanne:

| # | Kriterium |
|---|---|
| 1 | HTML-fasit åpnet side-om-side med live rute |
| 2 | Layout-struktur matcher (header / stack / faner / CTA-plass) |
| 3 | Tokens: `T.bg/panel/handling/lime` kun som fasit (lime ≠ primær CTA) |
| 4 | LogoAK riktig surface (ink/paper) |
| 5 | Én primær CTA (handling/clay) — ghost for sekundær |
| 6 | Mobil 390 + desktop (og iPad der fasit har to filer) |
| 7 | Tom tilstand ærlig (ingen fake drills/data) |
| 8 | `data-paper-*` eller `data-od-id` for QA |
| 9 | Screenshot under `screenshots/paper/<slug>-m.png` + `-d.png` |
| 10 | Ingen hydration/console-feil på ruten |

**Ikke DONE:** «har V2-komponent» uten side-om-side pass.

---

## 1. Inventar (44 skjerm-fasiter + 8 templates)

### 1.1 Fase 1 — 33 HTML (kjerneprodukt)

| ID | Fasit-fil | App-rute (mål) | Eier-komponent (nå) | Prioritet |
|---|---|---|---|---|
| F1-01 | `innlogging.html` | `/auth/*`, login | `LoginV2` + auth V2 | **P0** |
| F1-02 | `playerhq-plan.html` | `/portal` Plan / planlegge | `PlanV2` | **P0** |
| F1-03 | `playerhq-analyse.html` | `/portal/analysere` | `AnalysereV2` | **P0** |
| F1-04 | `playerhq-meg.html` | `/portal/meg` | `MegV2` | **P0** |
| F1-05 | `playerhq-booking.html` | `/portal/booking` | `BookingHubV2` / `BookingNyV2` | **P0** |
| F1-06 | `booking.html` | public + portal booking | `BookingNy*` + marketing | **P0** |
| F1-07 | `playerhq-chat-mobil.html` | `/portal` chat | `PortalChatHjem` + `samtale` | **P0** |
| F1-08 | `playerhq-chat-desktop.html` | samme | samme | **P0** |
| F1-09 | `playerhq-live-brief.html` | live brief | `LiveBrief` / portal live | **P1** |
| F1-10 | `playerhq-live-okt.html` | live økt | `LiveActive` / `LiveSessionShell` | **P1** |
| F1-11 | `playerhq-live-summary.html` | live summary | `SessionSummary` | **P1** |
| F1-12 | `playerhq-runde-live.html` | `/portal/runde/live` | runde-logg live | **P1** |
| F1-13 | `playerhq-runde-logg.html` | `/portal/runde/logg` | runde-logg | **P1** |
| F1-14 | `playerhq-test-gjennomfor.html` | tester gjennomfør | `TesterV2` / `NyTest*` | **P1** |
| F1-15 | `workbench-desktop.html` | workbench | `WorkbenchV2*` | **P1** |
| F1-16 | `workbench-mobil.html` | workbench mobil | `WorkbenchV2Mobil` | **P1** |
| F1-17 | `workbench-turnering.html` | turnering i WB | `TurneringPlanleggerV2` | **P2** |
| F1-18 | `fangstsheet.html` | fangst / chat fangst | `FangstModal` + sheet | **P1** |
| F1-19 | `spillerprofil.html` | coach spiller 360 | `AdminSpillerProfil*` | **P1** |
| F1-20 | `foreldreportal.html` | `/forelder` | Forelder* V2 | **P2** |
| F1-21 | `agencyos-konsoll-desktop.html` | `/admin` cockpit | `CockpitV2` | **P0** |
| F1-22 | `agencyos-konsoll-mobil.html` | `/admin` mobil | `CockpitV2` + shell | **P0** |
| F1-23 | `agencyos-kalender.html` | `/admin/kalender` | `AgencyKalenderV2` | **P0** |
| F1-24 | `agencyos-kalender-mobil.html` | samme | samme | **P0** |
| F1-25 | `agencyos-spillere.html` | stall / spillere | `StallV2` / FokusSpillere | **P1** |
| F1-26 | `agencyos-spillere-mobil.html` | samme | samme | **P1** |
| F1-27 | `agencyos-innboks.html` | `/admin/innboks` | Innboks V2 | **P1** |
| F1-28 | `agencyos-innboks-mobil.html` | samme | samme | **P1** |
| F1-29 | `agencyos-okonomi.html` | `/admin` økonomi | `AdminOkonomiV2` | **P2** |
| F1-30 | `agencyos-innstillinger.html` | admin innstillinger | admin settings V2 | **P2** |
| F1-31 | `agencyos-live-session.html` | Agency live | `AgencyLiveV2` | **P1** |
| F1-32 | `agencyos-ak-stigen.html` | AK-stigen | `AkStigenV2` | **P2** |
| F1-33 | `agencyos-agenticos.html` | Agenticos / agents | Agent UI V2 | **P2** |

### 1.2 Fase 2 W1 — 11 HTML (PlayerHQ utvidelse)

| ID | Fasit | Rute | Eier | Pri |
|---|---|---|---|---|
| F2-01 | `playerhq-drills.html` | `/portal/drills` | `OvelsesbankV2` | **P1** |
| F2-02 | `playerhq-drill-detalj.html` | drill detalj | drill detalj V2 | **P1** |
| F2-03 | `playerhq-tester-hub.html` | tester hub | `TesterV2` | **P1** |
| F2-04 | `playerhq-test-detalj.html` | test detalj | test detalj | **P1** |
| F2-05 | `playerhq-turneringer.html` | turneringer | `TurneringerV2` | **P2** |
| F2-06 | `playerhq-turnering-detalj.html` | turnering detalj | `TurneringDetaljV2` | **P2** |
| F2-07 | `playerhq-okt-detalj.html` | økt detalj | `OktPlanlagtV2` | **P1** |
| F2-08 | `playerhq-teknisk-plan.html` | teknisk plan | `TekniskPlanV2` | **P2** |
| F2-09 | `playerhq-fys-plan.html` | fysisk plan | fysisk V2 | **P2** |
| F2-10 | `playerhq-feiring.html` | feiring | `FeiringV2` | **P2** |
| F2-11 | `playerhq-live-tapper.html` | live tapper | live UI | **P1** |

### 1.3 Templates (DC) — 8

Brukes som **struktur-referanse** (ikke alltid egen rute):

| Template | Bruk |
|---|---|
| `playerhq-idag` | Hjem / I dag (ofte mer aktuell enn eldre «plan»-topp) |
| `agencyos-hjem` / `agencyos-dashboard` | Cockpit |
| `agencyos-workbench` | Workbench shell |
| `agencyos-kalender` | Kalender |
| `agencyos-ko` | Kø / triage |
| `agencyos-stall` | Stall |
| `agencyos-alt` | «Alt»-meny |

---

## 2. Arbeidsmetode (hver skjerm)

```
1. Åpne fasit HTML (designsystem/paper/fase1|fase2/...)
2. Åpne rute i app (dev eller prod etter push)
3. Diff: struktur → spacing → type → farge → CTA → empty
4. Endre KUN eier-komponent + tokens (ikke nytt design-system)
5. Screenshot m+d → screenshots/paper/
6. Kryss av DONE i sjekklisten under
7. Commit per wave (ikke monolitisk «alt design»)
```

**Regler (låst):**
- Primær CTA = `T.handling` (clay), ikke lime  
- Lime = status / nav / Agency-live-indikator der fasit sier det  
- Ingen seedede fake drills  
- Progressive disclosure: Simple default, Deep for TrackMan-detalj  
- V2/legacy: port til Paper-eier, ikke bygg parallell «V3»

---

## 3. Waves (rekkefølge)

### Wave A — P0 synlig kjerne (PlayerHQ + auth)  
**Mål:** det spilleren ser dag 1 ser ut som fasit  

| Order | ID | Skjerm |
|---|---|---|
| 1 | F1-01 | Innlogging |
| 2 | F1-02 + template idag | Plan / Hjem |
| 3 | F1-03 | Analyse |
| 4 | F1-04 | Meg |
| 5 | F1-05 + F1-06 | Booking hub + flyt |
| 6 | F1-07 + F1-08 | Chat m + d |

**Exit A:** 6 flater side-om-side OK på 390 + desktop. Screenshots lagret.

### Wave B — P0 AgencyOS chrome  
| Order | ID | Skjerm |
|---|---|---|
| 1 | F1-21 + F1-22 | Konsoll / cockpit m+d |
| 2 | F1-23 + F1-24 | Kalender m+d |
| 3 | Template kø | Triage / Kø |
| 4 | F1-25 + F1-26 | Spillere/stall m+d |

**Exit B:** Coach kan jobbe en dag uten «gammel» chrome på hovedflater.

### Wave C — P1 Live + runde + fangst  
| ID-er | F1-09…F1-13, F1-18, F1-31, F2-11 |
|---|---|
| Live brief → active → summary |  
| Runde live + logg |  
| Fangstsheet |  
| Agency live session |  

**Exit C:** Live-sløyfe og runde matcher fasit-flow.

### Wave D — P1 Workbench + tester + drills (fase2 start)  
| ID-er | F1-14…F1-16, F2-01…F2-04, F2-07 |
|---|---|
| Workbench m+d |  
| Test gjennomfør + hub + detalj |  
| Drills liste + detalj |  
| Økt detalj |  

**Exit D:** Treningsløkken (plan → økt → test → drill) er Paper.

### Wave E — P1/P2 kommunikasjon + profil  
| ID-er | F1-19, F1-27, F1-28, F1-20 |
|---|---|
| Spillerprofil coach |  
| Innboks m+d |  
| Foreldreportal |  

### Wave F — P2 rest i zip  
| ID-er | F1-17, F1-29, F1-30, F1-32, F1-33, F2-05…F2-10 |
|---|---|
| Turnering WB + turneringer |  
| Økonomi, innstillinger, AK-stigen, Agenticos |  
| Teknisk/fys plan, feiring |  

**Exit F:** **Alle 44 fasit-HTML i zip** har DONE-kryss.

---

## 4. Tidsramme (realistisk)

| Wave | Omfang | Estimat (agent + QA) |
|---|---|---|
| A | 6 kjerne PlayerHQ | 1–1,5 dag |
| B | 4 Agency kjerne | 1 dag |
| C | Live/runde | 1–1,5 dag |
| D | WB + drills/tester | 1–1,5 dag |
| E | profil/innboks/forelder | 0,5–1 dag |
| F | rest zip | 1–1,5 dag |
| **Total del 1** | **44 fasiter** | **ca. 6–8 arbeidsdager** fokustert |
| **Total del 2** | **~alle øvrige ruter** | **ca. 5–8 arbeidsdager** pattern-port (G–K) |
| **Grand total** | **fasit + pattern** | **ca. 11–16 dager** agent-tid (kan paralleliseres etter A–B) |

*Estimat = AI-agent med fasit/designsystem + screenshots, ikke «en designer fra null».  
Mac-push/Vercel mellom waves anbefales slik at du ser fremdrift live.*

---

## 5. QA-matrise (per wave)

| Viewport | Verktøy |
|---|---|
| 390×844 | mobil |
| 768 | iPad portrett |
| 1280+ | desktop |
| Side-om-side | fasit HTML vs app |
| Console | 0 uncaught |
| Empty | null data / tom drill-bank |

Sjekkliste-fil: `docs/port/PAPER-ZIP-CHECKLIST.md` (genereres wave for wave).

---

## 6. Del 2 — Skjermer **uten** fasit (Grok designer mot designsystemet)

**Lås (Anders 2026-08-09):** Grok **skal** designe/implementere **alle** eksisterende skjermer som **ikke** har HTML-fasit i zip, ved å følge **designsystemet** — ikke vente på Claude Design for hver rute.

### 6.1 Hva «designet mot designsystemet» betyr

| Bruk alltid | Ikke finn opp |
|---|---|
| Tokens: `T.*` / `paper-tokens.css` / `designsystem/paper/tokens` | Nye farger, fonter, radius |
| Shell: `V2Shell`, `PaperChrome`, BunnNav / IkonRail | Parallelle «V3»-layouts |
| Primærer: `Knapp` / `CTAPill` → **handling** (clay) | Lime som primær CTA |
| Byggesteiner: Kort, Rad, Caps, TomTilstand, StatusPill, skjema | Ad-hoc grå admin-tabeller uten tokens |
| LogoAK surface-regler | Feil logo-variant |
| Empty: ærlig (tom drill-bank, ingen fake data) | Placeholder Lorem / seed-drills |
| Responsive: brukbar 390 + desktop | Kun desktop-layout |

**DONE (uten fasit)** = skjermen følger listen over + ingen console-feil + ikke «orphan legacy»-look.  
**Ikke** krav om pixel-diff mot en HTML som ikke finnes.

### 6.2 Når Claude Design likevel brukes

| Send til Claude Design | Grok pattern-porter |
|---|---|
| Ny informasjonsarkitektur / komplekst dashboard | Settings-undersider, lister, CRUD |
| W2–W6 og andre strategiske flater (pågår) | Empty/error/loading |
| Pixel-kritisk salgsflate | «Samme chrome, nytt innhold» |
| Etter prod: skjerm som *føles feil* til tross for tokens | Små admin-verktøy |

### 6.3 Wave G+ — Pattern-port (etter Wave A–F eller parallelt med E–F)

Kjør **etter** at P0-fasit (Wave A–B) er stabil, slik at mønsteret er låst.

| Wave | Domene | Eksempler | Estimat |
|---|---|---|---|
| **G** | PlayerHQ rest uten fasit | varsler, venner, talent-sub, gameplan-sub, innstillinger-*, mal, stats, datagolf shell | 1–2 d |
| **H** | AgencyOS rest uten fasit | drills admin, email, availability, compliance, grupper, plan-templates, audit, api-keys, … | 2–3 d |
| **I** | Auth/onboarding rest | wizard-steg, guardian, reset, bankid polish | 0,5–1 d |
| **J** | Marketing rest | cases, jobb, junior, blogg, cookies, vilkår — tokens + primær handling-CTA | 1 d |
| **K** | Live/runde/workbench rest-edges | edge states, error boundaries, deep links | 0,5–1 d |

**Inventar:** alle `src/app/**/page.tsx` (~450) minus de som allerede er DONE i fasit-sjekkliste.  
**Sporing:** `docs/port/PAPER-PATTERN-CHECKLIST.md` (rute → status).

### 6.4 Metode per rute uten fasit

```
1. Identifiser shell (PlayerHQ / AgencyOS / Marketing / Auth)
2. Bytt legacy/grå UI → V2/Paper-komponenter + T.*
3. Primær CTA → handling; ghost sekundær
4. TomTilstand med ærlig copy
5. data-paper-pattern="<route>" for QA
6. Rask sjekk 390 (ingen horisontal overflow) + desktop
7. Kryss av pattern-checklist
```

### 6.5 Fortsatt utenfor denne design-planen

| Tema | Eier |
|---|---|
| W2–W6 **nye** HTML fra Claude Design | Importer zip → utvid del 1 (pixel) |
| Drill **innhold** (FASIT-tekster) | Anders Toshiba |
| Stripe / DNS / Resend / pricing | Drift P0 |
| Mac push sandbox → main | Anders når tilgjengelig |

---

## 7. Start-kommando (når agent skal kjøre)

1. Speil er allerede: `designsystem/paper/`  
2. Start **Wave A.1** `innlogging.html` ↔ `LoginV2`  
3. Deretter A.2 Plan/Hjem …  
4. Etter hver wave: commit + (Mac) push + hard refresh  
5. Ikke hopp til F før A–B er DONE (kjerne først)  
6. **Wave G+ (uten fasit):** start når A–B er stabile — Grok designer mot designsystemet uten å vente på Claude  
7. Når Claude leverer W2-zip: pause/interleave pixel-port av nye fasiter (høy pri)

---

## 8. Suksess

| Nivå | Definisjon |
|---|---|
| **Del 1 ferdig** | Alle 33 + 11 + templates DONE i `PAPER-ZIP-CHECKLIST.md`, screenshots, prod etter push |
| **Del 2 ferdig** | Alle app-ruter uten fasit DONE i pattern-checklist (designsystem, ikke pixel-HTML) |
| **App design-komplett (nåværende scope)** | Del 1 + Del 2 |
| **Etter ny Design-zip** | Nye fasiter → ny del 1-runde; pattern-ruter som får fasit oppgraderes til pixel |

**Merk:** «App design-komplett» ≠ «Claude har tegnet hver rute». Det betyr: **fasit der den finnes, designsystem overalt ellers.**
