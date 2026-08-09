# Komplett gjenstående plan — AK Golf HQ

**Oppdatert:** 2026-08-09 · **Eier:** Anders Kristiansen · **Agent-kilde:** én fil  
**Formål:** Alt som gjenstår — design, produkt, data, Masterbrain, drift, lansering — i én plan.  
**Ingen antagelser:** der Anders må velge, står det **[ANDERS]**. Ellers kan agent jobbe autonomt innenfor låste regler.

**Relaterte filer (ikke erstattes, men underordnes denne):**
| Fil | Rolle |
|---|---|
| `docs/port/AUTONOMOUS-4H-PAPER-2026-08-08.md` | 4-timers autonom kjøring (prod-unblock + guards) |
| `docs/port/plan-designport-alle-skjermer.md` | Steg 1–10 designport |
| `docs/port/skjermplan-tegnet-og-wireframe.md` | W1–W6 wireframe → port |
| `docs/port/portstatus-paper.md` | Godkjent fasit-port |
| `docs/port/monsterdokument-paper.md` | Mønstre uten fasit |
| `docs/platform/PRODUCT-LOCKS.md` | Låste produktvalg (hvis finnes) |
| `docs/STATUS-NÅ.md` | Snapshot (oppdater ved milepæl) |
| `docs/REMAINING-PAPER-4H.md` | Kort push-status |

---

## 0. Nå-tilstand (2026-08-09 kveld)

**Paper wave-status (master):** `docs/port/WAVE-STATUS-MASTER.md`

| Spor | Status |
|---|---|
| Sandbox branch | `handoff/iphone-5h-2026-08-09` — Wave **0–D** chrome + finpuss |
| GitHub `main` / prod | **Ikke oppdatert med A–D** før **[ANDERS] Mac push** |
| Wave 0 preflight | ✅ shell/tokens/CTA-semantikk |
| Wave A PlayerHQ P0 | ✅ chrome + finpuss (Login Plan Analyse Meg Booking Hjem) |
| Wave B AgencyOS P0 | ✅ chrome + finpuss (Konsoll Innboks Spillere Kalender + nav) |
| Wave C Live + runde | ✅ chrome + komplett finpuss (cream live, runde, fangst) |
| Wave D Workbench + test/drill | ✅ chrome + finpuss ×2 (zoom soft, test-gjennomfør Paper) |
| Wave E profil/innboks/forelder | ✅ chrome |
| Wave F P2 zip rest | ✅ chrome |
| Pattern G–K | ⬜ ikke startet |
| Pixel DONE (screenshot-gate) | ❌ alle waves — venter Anders sign-off |
| Login OAuth | **OK** + rate-limit circuit-breaker (tidligere) |
| Masterbrain drill bank | **Tømt** — ingen falske seed-drills |
| Betaling | PRO gratis til `BETALING_STARTER` 1. sep 2026 |

### Parallelle spor nå
1. **[ANDERS]** Mac push A–D → main → hard refresh  
2. **[ANDERS]** Pixel sign-off Wave A–D (fasit side om side)  
3. **Agent:** Wave E (profil/kommunikasjon) deretter F  
4. **Claude Design:** W2–W6 uten fasit (prompt finnes)  

---

## 1. Prioritetspyramide (arbeidsrekkefølge)

```text
P0  Prod grønn + login stabil          ← NÅ
P1  Visuell sign-off fasit-kjerne      (Hjem Plan Analyse Meg Workbench AgencyOS)
P2  Viewport 390 / 768 / 1280 + mørk   (samme fasit-flater)
P3  W2 Analysere-dybde (Design→port)
P4  Masterbrain rebuild + Putting brain
P5  W3–W6 wireframe-bølger
P6  Lansering P0 Anders (Stripe/DNS/Resend)
P7  Skala / pricing / AI-coaching volume
```

---

## 2. DESIGN — komplett spor

### 2.0 Låste regler (aldri bryt)
1. **Ingen skjerm kodes uten tegnet fasit** (fase1 eller godkjent fase2).  
2. **Paper vinner** over gammel athletic/v1.  
3. **Skjermbilde-gate:** app + fasit side om side før merge.  
4. **Viewport:** telefon ~390–430 · iPad ~768–1024 · desktop ≥1181 (monster §1).  
5. **Én ting nå:** maks én `T.handling` per tilstand.  
6. **Tokens:** ingen nye hex i `style={{}}` (`check-token-gap`).  
7. **PlayerHQ nav (låst):** I dag · Plan · Analyse · Meg.  
8. **AgencyOS nav (låst):** 5 primærjobber + sekundære.  

### 2.1 P0 — Prod og fasit synlig (0–2 dager)

| ID | Oppgave | Eier | Done |
|---|---|---|---|
| D-P0-1 | Kjør `push-4h-paper.sh` → main | **[ANDERS]** | Vercel READY |
| D-P0-2 | Verifiser Upstash REST URL+token (ikke redis-cli, ikke xxxx) | **[ANDERS]** | Ingen WRONGPASS i logs |
| D-P0-3 | Hard refresh Hjem/Plan/Analyse | **[ANDERS]** | Paper synlig |
| D-P0-4 | Agent: hold Analysere depthMode + circuit-breaker i main | Agent | CI grønn |

### 2.2 P1 — Visuell sign-off (fasit-dekkede flater)

Per flate: **mobil 390 · iPad 768 · desktop 1280 · lys · mørk** (der relevant).

| ID | Flate | Fasit | Sign-off |
|---|---|---|---|
| D-P1-01 | Hjem `/portal` | playerhq-chat-desktop/mobil | Agent fidelity ✅ · **[ANDERS]** sign-off |
| D-P1-02 | Plan `/portal/planlegge` | playerhq-plan | Agent fidelity ✅ · **[ANDERS]** sign-off |
| D-P1-03 | Analyse hub | playerhq-analyse | Agent chrome ✅ · **[ANDERS]** sign-off |
| D-P1-04 | Meg | playerhq-meg | Agent fidelity ✅ · **[ANDERS]** sign-off |
| D-P1-05 | Booking | playerhq-booking | Agent hub chrome ✅ · **[ANDERS]** sign-off |
| D-P1-06 | Live brief→active→summary | live-* | Wave **C** cream active + loop + 56 CTA ✅ · **[ANDERS]** pixel |
| D-P1-07 | Runde live/logg | runde-* | Wave **C** Paper topp titler ✅ · **[ANDERS]** pixel |
| D-P1-08 | Workbench m+d | workbench-* | Wave **D** + finpuss (soft zoom, Publiser clay) ✅ · **[ANDERS]** pixel |
| D-P1-09 | AgencyOS konsoll | agencyos-konsoll-* | Wave **B** Konsoll Paper ✅ · **[ANDERS]** pixel |
| D-P1-10 | Innboks / Kø | agencyos-innboks | Wave **B** Innboks + hub pills ✅ · **[ANDERS]** pixel |
| D-P1-11 | Kalender / Stall | kalender, spillere | Wave **B** ✅ · Profil coach = **Wave E** · **[ANDERS]** pixel |
| D-P1-12 | Auth / Forelder / Marketing booking | innlogging, forelder, booking | **[ANDERS]** |

**Agent mellom sign-offs:** fiks A1–A4 type avvik (layout, én ting nå, composer, empty) uten å spørre — Paper HTML er fasit.

### 2.3 P2 — Responsiv system-QA

| ID | Oppgave | Done |
|---|---|---|
| D-P2-1 | Ingen horisontal scroll @390 på P1-flater | Playwright/smoke |
| D-P2-2 | Touch targets ≥44px | manuell + lint der mulig |
| D-P2-3 | iPad: rail/bunn-nav, sheet vs panel | manuell |
| D-P2-4 | Safe-area live fullscreen | manuell |
| D-P2-5 | Visual seeds i `tests/e2e/paper-visual/` oppdateres ved fix | CI |

### 2.4 P3 — W2 Analysere-dybde (Design → port)

**Prinsipp:** konsolider → wireframe `fase2/` → **[ANDERS] batch-ja** → port.

| ID | Rute / flate | Handling |
|---|---|---|
| D-W2-1 | Hull-analyse | Port/Paper mot midlertidig seed → egen wireframe |
| D-W2-2 | Runder-liste + detalj | samme |
| D-W2-3 | Gameplan | samme |
| D-W2-4 | TrackMan liste/detalj | deep mode only i UI |
| D-W2-5 | DataGolf | **[ANDERS] PR-F** plassering først |
| D-W2-6 | Talent-undersider | etter hub-dybde / **[ANDERS]** |
| D-W2-7 | Hjem-rest (varsler, venner, …) | konsolideringsliste først |

### 2.5 P4–P6 — W3–W6 (uten fasit)

| Bølge | Område | Est. uten fasit | Steg |
|---|---|---:|---|
| **W3** | Meg-rest, Booking-rest, Talent, Coach-aliaser | ~60 | Konsolider redirects → Design → port |
| **W4** | AgencyOS-rest (stall/admin/plan/innsikt) | ~111 | Mal-basert wireframe-batcher |
| **W5** | Marketing, forelder-dybde, auth-rest, system | ~70 | **[ANDERS]** marketing-visuell linje? |
| **W6** | WANG + GFGK | TBD | Tell ruter først |

**Per bølge (fast pipeline):**
1. Konsolideringsforslag (agent) → **[ANDERS]** ja/nei  
2. Mal-tildeling (monster §5–12)  
3. Tegn `fase2/` i Claude Design  
4. Batch-godkjenning **[ANDERS]**  
5. Port PR med skjermbilde-gate  
6. Oppdater `portstatus-paper.md` + `fasit-liste-paper.md`  

### 2.6 Design-blokkert uten beslutning

| ID | Sak | Trenger |
|---|---|---|
| PR-E | Testantall 20 / 21 / 25 | **[ANDERS]** |
| PR-F | DataGolf /stats plassering | **[ANDERS]** |
| W5-M | Marketing egen linje vs Paper | **[ANDERS]** |

---

## 3. PRODUKT & PLATTFORM

| ID | Oppgave | Status | Eier |
|---|---|---|---|
| P-01 | Simple/Deep depth mode (cookie) | I kode (#383) | Agent polish |
| P-02 | Progressive disclosure (ikke paywall for AI-kjerne) | Låst retning | **[ANDERS]** final copy |
| P-03 | Pricing 299 vs 499 + annual | Anbefaling laget i chat | **[ANDERS]** lås |
| P-04 | Coaching packages ≠ app-tier | Låst | hold |
| P-05 | AI inkludert i PRO (ikke add-on) | Anbefalt | **[ANDERS]** |
| P-06 | Unngå generisk «AI»-branding i UI | Anbefalt | copy-pass |
| P-07 | Feature flags / BETALING_STARTER 1.sep | I kode | **[ANDERS]** aktivering |
| P-08 | Freemium vs PRO grenser (tydelig UX) | Delvis | Agent + **[ANDERS]** |

---

## 4. MASTERBRAIN / DATA / COACHING-INTELLIGENCE

| ID | Oppgave | Status | Eier |
|---|---|---|---|
| M-01 | Drill bank tom (ingen seed-28) | Done (policy) | — |
| M-02 | Empty-bank hard stop (ingen AI-oppspinn) | Done / guards | hold |
| M-03 | Masterbrain rebuild-plan | Docs | Agent |
| M-04 | **Putting brain** v1 (struktur + data + UI-hook) | Ikke startet | Agent etter P0 |
| M-05 | Drill FASIT fra Toshiba/ekstern kilde | Venter inventar | **[ANDERS]** + Agent |
| M-06 | SOURCE → Masterbrain pipeline (audio/video inventory) | Delvis scripts | Agent |
| M-07 | Concepts/taxonomy re-validering | Etter FASIT | Agent |
| M-08 | Caddie/forslag kun fra bank | Guards | hold |
| M-09 | TrackMan visual potential (charts, dispersion) | Gap-analyse | Agent W2 |
| M-10 | Agent-team / nattordre / cron health | Drift | Agent + logs |

---

## 5. TEKNISK / SIKKERHET / KVALITET

| ID | Oppgave | Status |
|---|---|---|
| T-01 | OAuth fail-open rate-limit | Done (main) |
| T-02 | rate-limit circuit-breaker | I push-batch |
| T-03 | Offline queue export contract + CI | I push-batch |
| T-04 | Offline sync bootstrap korrekt «synket» | I push-batch |
| T-05 | Prisma DATABASE_URL / pooler | Ops — **[ANDERS]** env |
| T-06 | CSP / nonce hydration | Delvis fikset (layout) — overvåk |
| T-07 | `npm run verify` grønn på main | Etter push |
| T-08 | E2E pilot + paper-visual seeds | Vedlikehold |
| T-09 | Action-auth gate | Aktiv |
| T-10 | Token-gap gate | Aktiv |
| T-11 | Critical-imports gate | I push-batch |
| T-12 | GDPR export/delete | Bygget — re-verifiser ved lansering |
| T-13 | Service-role client audit | Scripts finnes |
| T-14 | Live offline drill-reps → DB (ikke bare IDB) | Delvis — fullfør |
| T-15 | Webhook / cron resilience (Upstash down) | Circuit + logs |

---

## 6. DRIFT / LANSERING (Anders P0)

| ID | Oppgave | Eier |
|---|---|---|
| L-01 | Stripe live keys + price IDs | **[ANDERS]** |
| L-02 | Resend DKIM / DNS | **[ANDERS]** |
| L-03 | Supabase auth redirect URLs (prod) | **[ANDERS]** |
| L-04 | Domene akgolf.no / www SSL | Vercel + **[ANDERS]** |
| L-05 | Første ekte spiller-login + coaching loop | **[ANDERS]** + pilot |
| L-06 | Go-live sjekkliste `docs/go-live-sjekkliste.md` | Følg |
| L-07 | Pilot demo sjekkliste | Følg |
| L-08 | Betaling 1. sep — kommunikasjon | **[ANDERS]** |

---

## 7. AGENCYOS / COACH-LOOP

| ID | Oppgave | Status |
|---|---|---|
| A-01 | Kø badges (godkjenninger-count) | I #383-spor |
| A-02 | Godkjenninger / innboks Paper | Portet — sign-off |
| A-03 | Stall + spillerprofil | Portet — sign-off |
| A-04 | Workbench coach-side | Portet |
| A-05 | 28 legacy admin-ruter | W4 / redirect / konsolider |
| A-06 | Caddie drafts empty-bank | Guard |
| A-07 | Live coach panel | Portet |

---

## 8. 4-timers autonomt vindu (allerede definert)

Se **`docs/port/AUTONOMOUS-4H-PAPER-2026-08-08.md`**.

**Dekker:** P0 tech (build, guards, Hjem/Plan verify, triage).  
**Dekker ikke:** W2–W6 tegning, pricing-lås, Stripe, Masterbrain FASIT-innhold.

---

## 9. 30 / 60 / 90 dagers bilde

### 30 dager
- [ ] Prod Paper grønn  
- [ ] P1 sign-off kjerneflater (m+d)  
- [ ] P2 mobil-overflow null på kjerne  
- [ ] W2 første 3 dybdeskjer portet  
- [ ] Putting brain skeleton + data modell  
- [ ] Stripe/DNS/Resend klar for pilot  

### 60 dager
- [ ] W2 batch ferdig  
- [ ] W3 startet  
- [ ] Drill FASIT ≥ N validerte drills (**[ANDERS]** tall)  
- [ ] Pricing låst + annual  
- [ ] Pilot med ekte spillere i loop  

### 90 dager
- [ ] W4 AgencyOS-rest vesentlig redusert  
- [ ] Masterbrain + putting i daglig bruk  
- [ ] Betaling live (post 1.sep)  
- [ ] W5/W6 planlagt med tall  

---

## 10. Agent-autonomi vs Anders-stopp

| Agent gjør uten å spørre | STOPP → **[ANDERS]** |
|---|---|
| Build/type/import-fiks | Ny skjerm uten fasit |
| Paper-match mot eksisterende HTML | Konsolidering av produktflater |
| CI-gates, tester, docs | Pricing, navn, AI-copy-strategi |
| Empty-bank guards | PR-E / PR-F |
| Polish tokens/spacing/touch | Stripe/DNS secrets |
| Push-script for Mac | Merge-policy endring |

---

## 11. Neste 3 handlinger (rekkefølge)

1. **[ANDERS]** `bash push-4h-paper.sh` + sjekk Vercel  
2. **[ANDERS]** Sign-off Hjem + Plan (mobil+desktop)  
3. **Agent** W2-1 hull/runder Paper-polish + Putting brain skeleton (etter prod grønn)  

---

## 12. Endringslogg

| Dato | Endring |
|---|---|
| 2026-08-08 | Opprettet komplett gjenstående plan (design + alle spor) |

## 13. Oppdatering 2026-08-09 (iPhone 5h autonom)

- Claude Design zip speilet → `designsystem/paper/` (702 filer).
- P2 booking (slot-hold, policy, coach-colors, metrics) i sandbox; handoff til Mac.
- Facility-scope helpers + PolicyBanner.
- Prompt: `docs/port/CLAUDE-DESIGN-PROMPT-FULL-PROSJEKT.md`.
- Plan: `docs/port/IPHONE-5H-AUTONOMOUS-2026-08-09.md`.
- fase2 i zip = W1 only; **W2–W6 mangler** → Claude Design.

## 14. iPhone 5h COMPLETE (2026-08-09)

Autonom batch ferdig i sandbox (`handoff/iphone-5h-2026-08-09`, 6 commits).  
**Krever Mac APPLY** for main/prod. Se `docs/port/IPHONE-5H-COMPLETE-2026-08-09.md`.

Inkludert: P2 booking, handling-CTA monopoly, putting brain data+UI, multi-facility, FASIT empty, Design-prompt, Paper zip speil.

## 15. Design scope låst (2026-08-09)

**Del 1:** Pixel-port av Claude Paper zip (44 skjermer) — `docs/port/PAPER-ZIP-FULL-IMPLEMENTATION-PLAN.md`  
**Del 2:** Grok designer **alle skjermer uten fasit** mot designsystemet (tokens/shell/Paper) — Wave G–K i samme plan, spor `docs/port/PAPER-PATTERN-CHECKLIST.md`  
**Claude Design:** kun strategiske/nye flater (W2+) — ikke alle micro-ruter.
