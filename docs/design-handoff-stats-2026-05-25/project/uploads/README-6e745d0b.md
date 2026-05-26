# AK Golf Stats — Visuell Redesign-pakke

**Dato:** 25. mai 2026
**Designverktøy:** Claude Design
**Antall prompts:** 10 (1 master + 9 per side)

---

## Hvordan bruke denne pakken

### Variant A — Helhetlig redesign (anbefalt)

Gi Claude Design alle 10 filer samlet, i denne rekkefølgen:

1. `00-master-brief.md` (brand, tone, tokens — les denne først)
2. `01-hub-landing.md`
3. `02-pga-hub.md`
4. `03-pga-kategori-detalj.md`
5. `04-pga-putt-explorer.md`
6. `05-norsk-spillerbase-sok.md`
7. `06-norsk-spillerbase-profil.md`
8. `07-sg-sammenlign-landing.md`
9. `08-sg-sammenlign-onboarding.md`
10. `09-sg-sammenlign-resultat.md`

Da får du et konsistent design-system på tvers av alle sider.

### Variant B — Side om side (hvis du vil starte ett sted)

Gi master-brief + én side-prompt om gangen. Anbefalt rekkefølge for verdi:

1. Start med **09-sg-sammenlign-resultat** — den mest spektakulære siden, setter visjon
2. Deretter **01-hub-landing** — øker konvertering
3. **03-pga-kategori-detalj** — er gjenbrukt 6 ganger, høyest ROI
4. Resten i hvilken rekkefølge som helst

---

## Sammendrag av sidene

| # | Side | Status nå | Designmål |
|---|---|---|---|
| 01 | `/stats` | Funksjonelt minimum | Editorial hero, "Norske i aksjon", bento-grid, mersalg |
| 02 | `/stats/pga` | 6 funksjonelle kort | KPI-strip, bento-grid, putt-explorer-teaser |
| 03 | `/stats/pga/[6 kategorier]` | Slider + topp-20 | Interaktiv blokk + percentile-analyse + leaderboard |
| 04 | `/stats/pga/putt-explorer` | Slider + bar-chart | Heatmap + amatør vs Tour-storytelling |
| 05 | `/stats/spillere` | Søk + tabell | Talent-database à la FotMob, kort-grid + tabell |
| 06 | `/stats/spillere/[slug]` | Tabs + tabell | Editorial spillerprofil — hero, tabs, trend, AI-sammendrag |
| 07 | `/stats/sg-sammenlign` | Hero + 3-stegs | Mest selgende — emotionell hook + visuelle eksempler |
| 08 | `/stats/sg-sammenlign/start` | 2-stegs skjema | Wizard-feel, én ting om gangen |
| 09 | `/stats/sg-sammenlign/resultat/[id]` | Radar + KPI | Wow-side — delbart, OpenGraph, sterk mersalg |

---

## Hva som er bygget per nå (teknisk fundament)

Alle sider er **live i produksjon** med funksjonell men minimal design:

- Database fyllt: 1 175 turneringer + 14 296 deltaker-rader + ~2 500 norske spillere + 1 299 PGA Tour-spillere
- DataGolf-sync: ukentlig cron (mandag morgen)
- Auth: Supabase, gratis konto for SG-tool
- Estimator: Broadie HCP-tabell + WHS-formel for Tour-ekvivalent

**Det vi trenger fra Claude Design:** Visuelt løft. Ingen ny funksjonalitet — bare gjøre det vakkert nok til å konvertere.

---

## Felles brand-regler (oppsummert — full versjon i `00-master-brief.md`)

- Forest `#005840` primær · Lime `#D1F843` accent · Off-white `#FAFAF7` bakgrunn
- Inter (sans) · Inter Tight (display) · JetBrains Mono (mono/tall)
- 8pt grid, ingen `p-3/p-5/p-7`
- Lucide-ikoner kun, INGEN emoji
- Italic-aksent i hero: `<em className="font-normal italic text-primary">`
- Norsk bokmål

---

## Konverteringsmål

**Hovedmål:** Konvertere stats-trafikk til PlayerHQ-abonnement (300 kr/mnd treningsdagbok).

- Hver side har minst én PlayerHQ-CTA
- Konvertering skjer naturlig — aldri popup, aldri agressiv
- SG-sammenligning er kraftigste konverteringsfunnel (krever signup, naturlig overgang til abonnement etterpå)

---

## Hva som ikke skal endres

- Brand-tokens i `globals.css`
- Backend / API / database
- URL-struktur (`/stats/*`)
- Cron-jobber og data-pipeline
- Eksisterende komponenter som er gjenbrukt på andre sider av plattformen (`Card`, `Badge`, `AthleticEyebrow` etc.)

---

## Når Claude Design er ferdig

Output skal være:
- Sketch/mockup per side (high-fi)
- Komponent-bibliotek for nye elementer
- Mobile- og desktop-versjon
- Mikrointeraksjons-spesifikasjon
- Implementasjon-snippets (TSX, ufullstendige men nok til å vise intensjon)

Deretter blir det implementert av agenter (Next.js-developer agent) — én side om gangen, eller parallelt der filer ikke overlapper.
