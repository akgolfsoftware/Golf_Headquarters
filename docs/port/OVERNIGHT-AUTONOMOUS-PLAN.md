# OVERNIGHT AUTONOMOUS PLAN — fullfør uten godkjenning

**Versjon:** 1.0 · **09.08.2026 21:30 CEST**  
**Mål:** Agent jobber **kontinuerlig** (auto-yes / «fortsett» uten spørsmål) til **kode-port er komplett** for all in-scope Paper-fidelity, med handoff-bundles til `main` underveis.  
**Styrende pixel-definisjon:** `PIXEL-PERFECT-PLAN-COMPLETE.md` (D1–D12)  
**Viktig skille:** Agent kan fullføre **D1–D11 (kode + screenshots i sandbox)**. **D12 (Anders sign-off)** kan ikke auto-lukkes — planen markerer dem `READY_SIGN` og fortsetter.

---

## 0. Autonomi-protokoll (alltid på)

### 0.1 Auto-yes (gjelder hele natten)

Agent skal **aldri** stoppe for å spørre om:

- «Skal jeg fortsette?»
- «Vil du ha A eller B?» når planen allerede har prioritert rekkefølge
- Godkjenning før commit
- Godkjenning før neste PP-fase

**Tolking av bruker-meldinger under kjøring:**

| Melding | Handling |
|---|---|
| `fortsett` / `next` / `go` / `auto` / tom / emoji | Neste arbeidspakke i køen |
| `status` | 10-linjers status + fortsett umiddelbart etter |
| `stopp` / `pause` | Stopp etter nåværende fil-commit |
| `push` | Generer bundle + Mac-kommandoer, fortsett kode |
| Konkret bug/skjerm | Fiks det, deretter tilbake til kø |

### 0.2 Beslutningsregler (når plan er tvetydig)

1. **Fasit vinner** på layout/CTA/logo/type  
2. **Én solid clay** per view (Én ting nå / mic) — ellers ink CTA  
3. **Minimal diff** — ikke refaktor hele appen  
4. **Mal før variant** (W3–W5)  
5. **PlayerHQ før AgencyOS** innen samme timeblokk  
6. Ved konflikt funksjon vs fasit: ærlig empty, ikke fake data  
7. Ved usikker rute: les `github.md` + `PP-0-ROUTE-MAP.md`  
8. Aldri commit `.env` / secrets  
9. Sandbox kan ikke `git push` → alltid bundle + `PUSH-*.sh` / kommandoer  
10. Etter hver **arbeidspakke** (1–3 skjermer): commit + oppdater status-doc

### 0.3 Stopp-betingelser (kun disse)

- Bruker sier `stopp` / `pause`
- Kritiske røde tester / build-brudd som ikke løses på 2 forsøk → logg `BLOCKED` i status, hopp til neste pakke
- Disk/minne-feil i sandbox

**Ikke stopp for:** manglende Vercel, manglende Anders, manglende screenshots på prod, «ser litt annerledes ut uten sign-off».

---

## 1. Definisjon av «komplett ferdig» i denne natten

### 1.1 Agent-komplett (mål for natten)

| Krav | Mål |
|---|---|
| Alle **fase1 33** fasit | Kode-port D1–D11 minimum (chrome + CTA + struktur + slug) |
| Fase2 W1–W2 (23) | Kode-port eller eksplisitt mal-gjenbruk |
| W3–W5 maler (19 HTML) | **Mal-komponenter** pixel-nære + variants-docs fylt |
| W6 (4) | Port eller merket microsite-chrome OK |
| Checklist | 0× `[ ]` for IN-fasit; alle enten `[~] READY_SIGN` eller `[x]` |
| PP-status docs | Oppdatert per fase |
| Bundles | Minst én push-klar bundle per stor batch |

### 1.2 Menneske-komplett (etter natten — Anders)

| Krav | Når |
|---|---|
| D12 sign-off batch | Morgen: 15 min stikkprøve P0, deretter rullerende |
| Mac push alle bundles | Når du er ved laptop |
| Prod smoke | Etter siste push |

**Natten er suksess om:** Anders kan **kun signere og pushe**, ikke designe/implementere.

---

## 2. Arbeidskø (strikt rekkefølge)

### BATCH A — PP-1 ferdig (PlayerHQ kjerne) · ~2–4 t

| # | Pakke | Fasit | Eier | Exit |
|---|---|---|---|---|
| A1 | ✅ PP-1.1 Hjem/chat | chat-m/d | PortalChatHjem | DONE kode |
| A2 | PP-1.2 Plan | playerhq-plan | PlanV2 | loop/CTA/dokk/topp |
| A3 | PP-1.3 Analyse | playerhq-analyse | AnalysereV2 | |
| A4 | PP-1.4 Meg | playerhq-meg | MegV2 | |
| A5 | PP-1.5 Booking hub | playerhq-booking | BookingHubV2 | |
| A6 | PP-1.6 Login | innlogging | LoginV2 | flat cream, logo paper |
| A7 | PP-1.7 Public booking | booking.html | marketing booking | clay CTA |

**Batch A commit:** `feat(paper): PP-1 complete PlayerHQ core ports`  
**Bundle:** `overnight-A-pp1.bundle`

---

### BATCH B — PP-2 AgencyOS kjerne · ~2–4 t

| # | Pakke | Fasit | Eier |
|---|---|---|---|
| B1 | Konsoll | agencyos-konsoll-* | CockpitV2 |
| B2 | Innboks | agencyos-innboks-* | TriageV2 |
| B3 | Spillere | agencyos-spillere-* | StallV2 |
| B4 | Kalender | agencyos-kalender-* | AgencyKalenderV2 |
| B5 | Økonomi | agencyos-okonomi | AdminOkonomiV2 |
| B6 | Innstillinger | agencyos-innstillinger | AdminSettingsV2 |
| B7 | AK-stigen + AgenticOS + profil | rester fase1 admin | |

**Bundle:** `overnight-B-pp2.bundle`

---

### BATCH C — PP-3 Live / Runde / WB / Fangst / Forelder · ~2–4 t

| # | Pakke |
|---|---|
| C1 | Live brief / active / summary (cream, 56 clay start) |
| C2 | Runde live + logg |
| C3 | Test gjennomfør |
| C4 | FangstModal = fangstsheet |
| C5 | Workbench d/m/turnering |
| C6 | Foreldreportal hub |

**Bundle:** `overnight-C-pp3.bundle`  
**Milestone:** fase1 33/33 `[~]` READY_SIGN

---

### BATCH D — PP-4 W1 (økt/drill/test/turnering/feiring) · ~2–3 t

Alle 11 W1 HTML → eier-komponenter.  
**Bundle:** `overnight-D-pp4.bundle`

---

### BATCH E — PP-5 W2 data-dybde · ~3–5 t

| Prioritet | Skjerm |
|---|---|
| E1 | Putte-lab |
| E2 | TrackMan liste + detalj (canonical mal/*) |
| E3 | Analyse-hull |
| E4 | Runder liste/detalj |
| E5 | Gameplan + banekart |
| E6 | DataGolf |
| E7 | Historikk-filter + hjem-varsler/rest |

Port F2.6 primitiver **kun når skjerm krever det** (minimal).  
**Bundle:** `overnight-E-pp5.bundle`

---

### BATCH F — PP-6 W3 mal-fabrikk · ~3–4 t

Implementer/oppdater **mal-skall** + fyll `docs/port/PP-W3-VARIANTS.md`:

1. innstillinger (9 ruter)  
2. abonnement  
3. helse  
4. booking-ny + mine  
5. coach-hub  
6. talent  

**Bundle:** `overnight-F-pp6.bundle`

---

### BATCH G — PP-7 W4 Agency maler · ~3–4 t

1. godkjenninger/kø  
2. gruppe-detalj  
3. bookinger  
4. planbibliotek  
5. turneringer  
6. oppsett  

+ `docs/port/PP-W4-VARIANTS.md`  
**Bundle:** `overnight-G-pp7.bundle`

---

### BATCH H — PP-8 W5 Marketing/Auth/Forelder/System · ~2–3 t

1. marketing-side + katalog  
2. auth-flyt + samtykke (utvid PP-1.6)  
3. forelder-barn  
4. system-tilstander  

+ `docs/port/PP-W5-VARIANTS.md`  
**Bundle:** `overnight-H-pp8.bundle`

---

### BATCH I — PP-9 W6 microsites · ~1–2 t

WANG + GFGK mot egne tokens (ikke tving Paper-shell).  
**Bundle:** `overnight-I-pp9.bundle`

---

### BATCH J — PP-10 Regression + lukking · ~1–2 t

1. Checklist: 0 `[ ]`  
2. Grep: ingen gamle logo-paths; neon CTA lint grønn  
3. `npm run typecheck` (hvis mulig) / smoke kritiske ruter  
4. Oppdater `WAVE-STATUS-MASTER.md` + `OVERNIGHT-RUNLOG.md`  
5. Final mega-bundle `overnight-FINAL.bundle` = origin/main..HEAD  

**Exit natt:** Agent skriver:

```
NIGHT_COMPLETE
batches: A…J status
commits: N
ready_sign: M skjermer
blocked: …
mac_push: se overnight-FINAL + PUSH-OVERNIGHT.sh
```

---

## 3. Per-skjerm fabrikk (uendret, rask)

```
1. Åpne fasit HTML (grep CSS: topp, dokk, btn.now, btn.ink, loop)
2. Åpne eier .tsx
3. Diff ≤ 15 punkter
4. Patch minimal
5. data-paper-slug="<fasit-stem>"
6. Oppdater checklist [~] + READY_SIGN i PP-*-STATUS
7. Commit etter 1–3 skjermer
```

**Tidsboks:** max 45 min per 1:1-fasit; max 90 min per mal. Overskridelse → mark `PARTIAL`, neste.

---

## 4. Push-strategi (Mac om morgenen / underveis)

```bash
# Generisk mønster (agent produserer bundle + disse linjene):
cd ~/Developer/akgolf-hq
git checkout main && git pull origin main
git fetch ~/Downloads/<bundle>.bundle HEAD:refs/heads/handoff/overnight-<id>
git merge --ff-only handoff/overnight-<id>
git push origin main
```

Agent skal **alltid** ha siste bundle i `/home/workdir/artifacts/` og oppdatert:

`docs/port/OVERNIGHT-RUNLOG.md` med:

```
## HH:MM
- batch: A2
- commit: abc123
- files: …
- next: A3
```

---

## 5. Timeplan (ca. 8–12 t agent-tid)

| Blokk | UTC+2 | Batch |
|---|---|---|
| 1 | start+0–3t | A (PP-1) |
| 2 | +3–6t | B (PP-2) |
| 3 | +6–8t | C (PP-3) → fase1 lukket |
| 4 | +8–10t | D + E (W1/W2) |
| 5 | +10–13t | F + G (maler W3/W4) |
| 6 | +13–15t | H + I + J |

Hvis kortere natt: **prioritet A → B → C → E1–E3 → F booking-maler → J partial**.

---

## 6. OUT (ikke i nattkjøring)

- Stats (~45) — egen plan  
- AgenticOS dyp produktlogikk  
- Ny backend-features utenom det som allerede finnes  
- Pixel D12 sign-off  
- Prisma migrate / env-endringer  
- Drill bank seed (fjernet — ikke gjeninnfør)  

---

## 7. Kvalitetsgulv (selv uten D12)

Hver portet skjerm **må** ha:

- [ ] `data-paper-slug`  
- [ ] Ingen solid neon-lime CTA  
- [ ] Primær handling = ink eller clay iht. fasit  
- [ ] Logo paper/LogoAK surface riktig  
- [ ] Tom tilstand ærlig  
- [ ] Mobil 390 lesbar (ingen horisontal overflow i hovedflate)  

---

## 8. Startkommando til agent (lim inn når natten starter)

```
OVERNIGHT MODE ON
Les docs/port/OVERNIGHT-AUTONOMOUS-PLAN.md
Auto-yes: aldri spør om fortsettelse
Start: BATCH A fra første ikke-DONE (nå A2 Plan)
Etter hver pakke: commit + oppdater OVERNIGHT-RUNLOG.md + PP-status
Etter hver batch: bundle i artifacts/
Kjør til NIGHT_COMPLETE eller stopp
Ved «fortsett»/«next»: bare neste pakke
```

---

## 9. Morgen-sjekkliste (Anders, 10 min)

1. Last ned siste `overnight-*.bundle` / FINAL  
2. Push til main (kommandoer i chatten / RUNLOG)  
3. Vercel Ready → hard refresh  
4. Spotcheck: `/portal`, `/portal/planlegge`, `/admin/agencyos`  
5. Svar `godkjent PP-1` / list avvik — agent fikser dagtid  

---

## 10. Status nå (ved plan-opprettelse)

| | |
|---|---|
| PP-0 | DONE + på main (`30dfdf57`) |
| PP-1.1 Hjem/chat | Kode DONE (`7b0a68c`) — bundle `pp1-1` må pushes hvis ikke merget |
| PP-1.2…1.7 | Neste |
| Checklist | ~2 `[x]`, ~51 `[~]`, ~38 `[ ]` |

---

## 11. Én setning

**Agent jobber uavbrutt A→J med auto-yes, commits og bundles; du pusher om morgenen og signerer — da er hele Paper in-scope kode-komplett og klar for pixel-sign-off.**
