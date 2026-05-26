# Plan — IA-konsolidering & guided navigation

**Dato:** 2026-05-17
**Mål:** Kutt antall sidebar-punkter, gjør hver side komplett, og guide brukerne effektivt gjennom.

---

## Problemet i tall

| Portal | Top-level sidebar | Sub-ruter | Snitt klikk til action | Diagnose |
|---|---|---|---|---|
| **CoachHQ** | **27** | ~40 | 3,4 | **Drukning** — 7 grupper, ingen tydelig hierarki |
| **PlayerHQ** | 5 | ~75 | 2,8 | OK top-level, men sub-treet er for dypt (3–4 nivåer) |
| **Akseptabel** | ≤ 8 | ≤ 30 | ≤ 2,5 | — |

CoachHQ er den kritiske flaskehalsen. PlayerHQ er OK på topp, men `/portal/meg/*` har 10 sub-ruter og `/portal/mal/sg-hub/*` har 10 — for dypt for at en spiller skal finne fram.

---

## 5 prinsipper som styrer konsolideringen

1. **7±2 i sidebar.** Hvis du ikke kan navngi alle items på 5 sekunder, er det for mange.
2. **Hub-mønster.** Én sidebar-item → én hub-side → tabs/seksjoner. Ikke 5 sidebar-items for relatert funksjonalitet.
3. **Action over data.** Top-nav skal være verb (Planlegge, Vurdere, Følge opp), ikke substantiv (Plans, Reports, Bookings).
4. **Progressive disclosure.** Vis det 80 % bruker. Skjul resten under "Avansert" eller egen "Lab".
5. **Search + AI som global escape-hatch.** Cmd-K + AI-chat løser navigasjonsproblemet for power-brukere.

---

## CoachHQ — fra 27 → 8 sidebar-items

### Forslag til ny sidebar

| # | Nytt sidebar-item | Slår sammen | Innhold som tabs/seksjoner |
|---|---|---|---|
| 1 | **I dag** | AgencyOS + Foresporsler + Innboks + Notion-oppgaver | Hub: morgenbrief, dagens kø, meldinger, godkjenninger, tasks |
| 2 | **Spillere** | Spillere + 360-profil + Talent + Grupper + WAGR | Tabs: Alle, A1-A5, Grupper, Talent-pipeline, WAGR |
| 3 | **Plans** | Plans + Templates + Plan-perioder + Sessions | Tabs: Aktive, Templates, Periodisering, Logg |
| 4 | **Kalender** | Calendar + Bookings + Kapasitet + Tilgjengelighet | Tabs: Måned, Uke, Kapasitet, Tilgjengelighet |
| 5 | **Anlegg** | Anlegg + Lokasjoner + Fasiliteter + Tjenester | Hub: liste + map + tjeneste-katalog |
| 6 | **Innsikt** | Analytics + Analytics-v2 + Lag-snitt + Reports + Finance | Tabs: Performance, Lag, Rapporter, Økonomi |
| 7 | **AI Lab** | Agents + Periodiserings-agent + Videoer + Recording | Tabs: Agenter, Videoer, Recording |
| 8 | **Innstillinger** | Team + Email-templates + Integrasjoner + Settings + Audit + Notion-prosjekter | Tabs: Team, Maler, Integrasjoner, Konto, API, Audit, Notion |

**Effekt:** 27 → 8 (-70 %). Hvert item har et tydelig formål. Alt eksisterende innhold bevart, bare omplassert i tabs.

### Hva som forsvinner som top-level

- Notion-prosjekter / -oppgaver → flyttet til "I dag" + "Innstillinger"
- Foresporsler → "I dag"
- WAGR-benchmark/-import → "Spillere"
- Lag-snitt + Kapasitet + Reports → "Innsikt"
- Tournaments → "Kalender" som filter ELLER beholdes som sub i "Plans"
- Team + Email-templates + Integrasjoner + Audit → "Innstillinger"

---

## PlayerHQ — fra 5 → 5 (top OK), men sub-tre kuttes

### Top-level forblir, men `/portal/meg/*` og `/portal/mal/*` kuttes drastisk

| Top-level | Status | Endring |
|---|---|---|
| Hjem | Behold | — |
| Tren | Behold | Slå inn `aarsplan`, `turneringer` som tabs |
| Mål | Behold men forenkle | Se under |
| Coach | Behold | — |
| Meg | Behold men forenkle | Se under |

### `/portal/mal/*` — fra 19 sub-ruter → 4 tabs

Nåværende: runder, runder/[id], statistikk, trackman, trackman/[id], goal, leaderboard, milepaeler, baner + SG-Hub × 10

Nytt: **Mål** blir én hub med 4 tabs:

| Tab | Innhold |
|---|---|
| **Oversikt** | HCP-trend, aktive mål, milepæler |
| **Runder** | Runder-liste + rund-detalj som modal/drawer |
| **Statistikk** | SG-Hub samlet (alle 10 sub-views som filter-pills) + TrackMan + sammenligning |
| **Utforske** | Baner-database + Leaderboard |

SG-Hub-subroutes som blir filter-pills i stedet for egne ruter: per-klubb, conditions, equipment, strategy, yardage, best-vs-now.

### `/portal/meg/*` — fra 10 sub-ruter → 4 tabs

Nåværende: profil, abonnement, innstillinger, sikkerhet, helse, utstyrsbag, dokumenter, bookinger, foreldre, help

Nytt: **Meg** blir én hub med 4 tabs:

| Tab | Innhold |
|---|---|
| **Profil** | Personlig info + foreldre + helse + utstyrsbag |
| **Konto** | Abonnement + bookinger + dokumenter |
| **Innstillinger** | Sikkerhet + notifikasjoner + integrasjoner |
| **Hjelp** | FAQ + support + bug-report |

**Effekt PlayerHQ:** topp-nav uendret, men sub-treet kuttes fra ~75 → ~25 reelle "destinasjoner". 50 ruter blir tabs/filter-pills/modaler.

---

## Hub-mønster — felles blueprint

Hver hub-side følger samme struktur, slik at brukere lærer mønsteret én gang og applikerer det overalt:

```
┌──────────────────────────────────────────┐
│ <H1 hub-tittel>     <quick-action CTA>   │  ← Editorial italic
├──────────────────────────────────────────┤
│ [Tab1] [Tab2] [Tab3] [Tab4]              │  ← Maks 5 tabs
├──────────────────────────────────────────┤
│ ┌─ KPI-strip / dagens fokus ──────────┐  │  ← Glanceable
│ └────────────────────────────────────┘  │
│                                          │
│ Hovedinnhold for valgt tab               │
│                                          │
│ [Filter-pills horisontal scroll]         │  ← Sub-sub-nav
│                                          │
└──────────────────────────────────────────┘
```

**Regler:**
- Maks 5 tabs per hub (helst 3–4)
- Filter-pills i stedet for sub-tabs hvis behov
- Modaler/drawers for detail-views — ikke nye sider
- "Detail-as-route" forbeholdes der dyplink/share er kritisk

---

## Guidance-patterns — slik unngår brukeren å gå seg vill

### 1. **"I dag"-skjerm som default landing** (CoachHQ)

Anders åpner CoachHQ → ser **én skjerm** med:
- "3 godkjenninger venter"
- "5 spillere har ny SG-data"
- "Mulligan har 2 ledige slots i dag"
- "Sørlandsåpent om 21 dager — 4 spillere uten plan"

Hvert kort er én klikk til riktig sub-side. Anders trenger aldri å gjette hva han skal gjøre.

### 2. **Smart-suggest banner i hver hub**

Øverst i hver hub: én linje som foreslår neste action.
> "Markus har ikke logget økt på 4 dager — send påminnelse?"
> "Plan-mal for A2-spillere er oppdatert — bruk på 6 spillere?"

### 3. **Cmd-K command-bar globalt**

Anywhere → Cmd-K → søk hvilken som helst spiller, action, rute.
Power-bruker-tilflukt for når Anders vet *hva* han vil men ikke *hvor* det er.

### 4. **AI floating button bottom-right**

Permanent tilgang til AI-coach. "Hvor ser jeg Markus' SG-trend?" → AI svarer + linker.

### 5. **Breadcrumbs i sub-views**

Når Anders går dypt: `Spillere › Markus R. Pedersen › Periodisering › Q3-fase`. Klikkbart hele veien.

### 6. **"Tilbake"-bar i drawers/modaler**

Hvis detail åpner som drawer fra side, vis "← Tilbake til Spillere" øverst i drawer.

---

## Migration — hvordan vi tar dette i bruk

### Steg 1 — Mål-arkitektur (1 dag)

- Skriv `wireframe/IA-MAP-NY.md` med komplett rute-mapping
- Bekreft med Anders før kode røres

### Steg 2 — Bygg nye sidebar-komponenter (2 dager)

- `src/components/admin/AdminSidebar.tsx` → ny versjon med 8 items
- `src/components/portal/PortalSidebar.tsx` → uendret top, ny mobile-bottom-nav
- Behold ALL eksisterende kode-funksjonalitet — kun nav endres

### Steg 3 — Bygg hub-sider (3–5 dager)

- 8 CoachHQ-hubs + 5 PlayerHQ-hubs = 13 nye hub-sider
- Hver hub: layout-fil + tabs-komponent som mounter eksisterende page-content
- Eksisterende `page.tsx` blir til `tab-content.tsx` og monteres inne i hub

### Steg 4 — Redirects (1 dag)

- Next.js `redirects()` i `next.config.ts` for alle gamle ruter
- Eks: `/admin/notion-oppgaver` → `/admin/i-dag?tab=tasks`
- Bevarer dyplinker og bookmarks

### Steg 5 — "I dag"-dashboard + smart-suggest (2 dager)

- Bygg dynamisk "I dag"-hub for CoachHQ
- Server-action genererer top-5 actions basert på agent-pipeline
- Smart-suggest-banner-komponent som plug-and-play i hver hub

### Steg 6 — Cmd-K + AI-floating (1 dag, kan utsettes)

- Cmd-K via `cmdk`-bibliotek
- AI-floating-button kobler til eksisterende `/admin/elever/[id]/ai`-flow

**Total estimat:** ~12 dager fullt arbeid for én Claude-instans, ~7 dager med parallellisering.

---

## Verifikasjon — kvantitative mål

| Måling | Før | Etter (mål) |
|---|---|---|
| CoachHQ sidebar-items | 27 | ≤ 8 |
| PlayerHQ sub-ruter (faktiske destinasjoner) | ~75 | ~25 |
| Snitt klikk til top-10 actions (CoachHQ) | 3,4 | ≤ 2,0 |
| Snitt klikk til top-10 actions (PlayerHQ) | 2,8 | ≤ 2,0 |
| Antall hub-sider med tab-nav | 0 | 13 |
| Tid for ny bruker å finne SG-trend | ~45 s | ≤ 15 s |

### Kvalitativ test

- Anders åpner CoachHQ kl 08:00 → ser 5 ting som krever handling → klikker én av dem → fullfører på under 30 sek
- Markus åpner PlayerHQ → ser dagens fokus + neste handling → starter økt på 2 klikk
- Ingen sub-ruter trenger mer enn 3 klikk fra top-level

---

## Risikoer & avveininger

| Risiko | Mitigering |
|---|---|
| Eksisterende dyplinker og dokumentasjon refererer til gamle ruter | Next.js permanent redirects (301) for alle gamle ruter |
| Coaches som er vant til 27-item-sidebaren vil savne det | Tooltip-tour ved første pålogging etter migrasjon |
| Hubs med 5 tabs kan bli tette | Behold "Avansert"-tab for power-features (under disclosure) |
| Performance: hub-sider laster all tab-data | Lazy-load per tab via Suspense — kun aktiv tab fetcher |
| SEO/marketing-side dyplinker (web) | Behold web som er — denne planen rører kun PlayerHQ + CoachHQ |

---

## Hva planen IKKE inkluderer

- **Ingen design-skifte** — denne planen er IA-only, retning beslutter vi separat
- **Ingen kode-endring i selve forretningslogikken** — server actions, queries, Prisma forblir uberørt
- **Ingen ny funksjonalitet** — bare reorganisering av eksisterende
- **Ikke booking.akgolf.no eller akgolf.no** — kun PlayerHQ + CoachHQ

---

## Anbefalt rekkefølge for godkjenning

1. **Du leser denne planen**
2. **Du godkjenner eller stryker top-level-foreslagene** (8 CoachHQ-items, 5 PlayerHQ-tabs i Mål + Meg)
3. **Jeg skriver `IA-MAP-NY.md`** med komplett rute-mapping (gammel → ny)
4. **Du godkjenner mappingen**
5. **Jeg starter bygging av sidebar + hubs**

Eller spør: "Hva blir tydeligst for brukeren — 8 eller 6 items i CoachHQ?" — jeg gjør gjerne enda mer aggressiv konsolidering hvis du vil.
