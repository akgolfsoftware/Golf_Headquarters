# Utviklingsplan — design system + alle skjermer

**Status:** Redesign-gate 0 GAP (2026-07-22/23) · **neste = evolusjon**  
**Dato:** 2026-07-22 · oppdatert 2026-07-23  
**Grunnlag:** FASIT v2 Presis + **B-pakke**  
**Evolusjon:** `docs/design-system/DESIGN-EVOLUSJON-2026-07-23.md` (bølger V1–V6)

### Fremdrift

| Steg | Status |
|---|---|
| 1 FASIT + B | **Ferdig** (§3b i FASIT.md) |
| 2 B-klosser | **Ferdig** (B-KLOSSER.md — finnes i v2) |
| 3 Dommerskjermer i app | **Ferdig** (Hjem · Plan · Analyse = B i app) |
| 4 PlayerHQ resten | **0 GAP redesign** — finpuss = evolusjon V1–V2 |
| 5–8 AgencyOS / craft | **0 GAP ruter** — finpuss = evolusjon V3–V6 |

---

## Hvor vi er nå

| Ferdig | Ikke ferdig |
|---|---|
| Farger, fonter, merkevare (FASIT) | B-følelsen skrevet inn som offisiell fasit |
| B-pakke valgt for 3 dommerskjermer | De 3 skjermene 100 % lik B i appen |
| ~361 sider kartlagt med design-boards | Alle sider i appen ser ut som B |
| Noe v2-kode (Hjem, Analyse, Workbench m.m.) | AgencyOS, Forelder, Auth systematisk oppdatert |
| ~124 komponenter i Claude Design-spor | Alle komponenter sjekket mot B |

**Mål:** Én fasit du er happy med → bygges i appen bølgevis → hele plattformen føles lik.

---

## Prinsipp (låst arbeidsmåte)

1. **Ikke 361 unike design.** 8 skjermtyper + B-regler = de fleste sidene.
2. **Dommerskjermer først.** Virker Hjem/Plan/Analyse, arver resten.
3. **Komponent før side.** Ny knapp/kort/liste lages én gang, brukes overalt.
4. **Du dømmer med øye + 5 sekunder** — ikke med 50 sider på en gang.
5. **Kode etter at retning er låst** (B er låst for de tre).

---

## Plan i 8 steg (anbefalt rekkefølge)

### Steg 1 — Lås B inn i fasiten (1 dag)
- Oppdater `FASIT.md` med B-pakkens 5 setninger (opplevelse, ikke bare farger).
- Pek til `RETNING-B-PAKKE.md` som «slik skal PlayerHQ føles».
- **Ferdig når:** Du leser fasiten og nikker: «dette er oss».

### Steg 2 — Felles byggeklosser (2–4 dager)
De tingene alle B-skjermer trenger, én gang:
- Stor grønn knapp (én primær)
- Form-kort (tall + trend + status)
- Dagens-plan-kort / økt-rad
- SG-liste (svakest uthevet)
- Uke-status (planlagt / gjort / %)
- Tom tilstand + laster + feil
- **Ferdig når:** De 6 klossene finnes i kode (`v2`) og ser like ut i en demo-side.

### Steg 3 — Bygg de 3 dommerskjermene i appen (1 uke)
- Hjem → 100 % B  
- Plan/Workbench (spiller-uke) → 100 % B  
- Analyse (SG-fane først) → 100 % B  
- **Ferdig når:** Du bruker dem på telefon 2–3 dager og ikke vil bytte retning.

### Steg 4 — PlayerHQ resten via 8 familier (2–3 uker)
Ikke side for side fra scratch. Per type:

| Type | Eksempel | Antall ca. |
|---|---|---|
| Hub | Hjem, coach-hub | mange |
| Liste | driller, meldinger | middels |
| Detalj | økt, runde, drill | flest |
| Analyse | SG, runder | få |
| Kalender | uke, workbench | få |
| Wizard | booking, ny plan | få |
| Live | økt pågår, runde | få |
| Auth-lignende | innlogging i portal | få |

Rekkefølge inne i PlayerHQ (131 sider):
1. Gjør / Live / oppsummering (fullfører treningen)
2. Booking-flyt
3. Meg / innstillinger
4. Resten av detalj/liste etter inventar

**Ferdig når:** Alle PlayerHQ-ruter bruker v2-klossene og B-hierarki (én CTA, 5s-test).

### Steg 5 — Forelder (11 sider) (3–5 dager)
- Samme lys B-følelse, enklere språk, færre tall.
- **Ferdig når:** Forelder-hjem + uke + melding er på B-nivå.

### Steg 6 — AgencyOS (100 sider) (3–4 uker)
- **Samme B-idé** (oversikt + én hovedhandling), men **mørk standard** + mer makt.
- Dommerskjermer AgencyOS først: Stall, spiller 360, plan-bygger.
- Deretter lister, detalj, intern.
- **Ferdig når:** Coach ser stall-tilstand på 5 sek og har én tydelig neste handling.

### Steg 7 — Auth, marketing, system (ca. 100 sider) (1–2 uker)
- Innlogging, e-post, feilsider, enkle landinger.
- Samme tokens; enklere layout (ofte A-minimal er OK her).
- **Ferdig når:** Ingen «annen app»-følelse ved login/feil.

### Steg 8 — Konsistens-pass + fasit v3 (1 uke)
- Gå gjennom inventar: mangler CTA? Feil farge? Lime på lys?
- Oppdater FASIT + komponentliste med det som faktisk ble brukt.
- Commit/push designpakke + kode.
- **Ferdig når:** Du kan si «fasiten er 100 % happy» for det som er live.

---

## Tidslinje (realistisk)

| Bølge | Innhold | Ca. tid |
|---|---|---|
| **0** | Steg 1–2 (fasit + klosser) | 1 uke |
| **1** | Steg 3 (3 dommerskjermer) | 1 uke |
| **2** | Steg 4 del 1 (PlayerHQ kjerneflyt) | 2 uker |
| **3** | Steg 4 del 2 + Forelder | 2 uker |
| **4** | AgencyOS dommere + stall | 2 uker |
| **5** | AgencyOS resten + Auth/system | 2–3 uker |
| **6** | Konsistens + lås fasit | 1 uke |

**Ca. 10–12 uker** til «hele plattformen i B» ved jevn fart — eller raskere hvis bare PlayerHQ-kjerne er målet først.

---

## Hva du gjør vs hva AI/kode gjør

| Du | AI / utvikler |
|---|---|
| Godkjenner bølge og 3-retninger ved tvil | Bygger klosser og sider |
| Bruker appen 2–3 dager per bølge | Kjører sjekk (utseende, lenker, tomme tilstander) |
| Sier stopp hvis det føles feil | Oppdaterer inventar + fasit |

---

## Suksess — du er «100 % happy» når

1. Hjem, Plan, Analyse føles som B på ekte data.  
2. Nye sider ser automatisk like ut (samme klosser).  
3. Du trenger ikke designe hver av 361 — bare unntak.  
4. FASIT beskriver både farger **og** opplevelse (B).  
5. AgencyOS er mørk men «samme familie» som PlayerHQ.

---

## Risiko (og fix)

| Risiko | Fix |
|---|---|
| For mye på mobil i B | Fold sekundært; behold form + plan + CTA øverst |
| 361 tar evig | Familier, ikke unike boards per side |
| AgencyOS blir «annen app» | Samme klosser, bare mørkt tema |
| Fasit endres midt i | Bare dommerskjermer kan endre retning — ikke alle sider |

---

## Anbefalt start etter GO

**Denne uken:** Steg 1 + 2 + start steg 3 (Hjem B i app).  
**Ikke:** Redesign alle 361 boards på nytt.

---

## Beslutning

Skriv **GO** for hele planen, eller juster:
- «Bare PlayerHQ først» (steg 1–4, utsett AgencyOS)
- «Bare de 3 skjermene» (steg 1–3)
- «Raskere / saktere» + ønsket sluttdato
