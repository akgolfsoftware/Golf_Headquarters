# AK Golf HQ — Handover Spec

## Oversikt
AK Golf HQ er en komplett coaching-plattform med 4 overflater:
- **PlayerHQ** — spillerportal med dashboard, treningsplan, statistikk, mal
- **CoachHQ** — coach-arbeidsplass med spilleroversikt, live sessions, briefing
- **Landing (akgolf.no)** — markedsside med mork hero og lyse seksjoner
- **Shared** — delte komponenter, auth, API

## Overflater

### PlayerHQ (lys, lime accent, fitness-premium)
Spillerens sentrale hub. Lys bakgrunn med lime som bold accent.
- Dashboard med KPI-kort, HCP-trend, streak, AI-innsikt
- Treningsplan med uke-pills (W1-W6), drill-kort med pyramide-stripe
- Live Session med store +/- knapper for rep-logging
- Statistikk med SG-radar, HCP-trend, sammenligning
- Mal og runder med glassmorfisk overlay pa golfbane-foto

### CoachHQ (lys, strukturert, profesjonell)
Coach-arbeidsflate. Lys bakgrunn, strukturerte kort.
- Daglig Brief med urgency-prioriterte oppgaver
- Spilleroversikt med 360-profil (CRM-stil med tidslinje + chat)
- Live Session-styring med sanntidsstatus
- Oppfolgingsko med SLA-varsler
- Video-innboks for swing-analyse

### Landing (mork hero, lyse seksjoner)
- Mork hero med editorial serif pa foto
- Lime CTA-knapper
- Lyse seksjoner under for innhold

## Teknisk arkitektur
- 160+ sider, 140+ Prisma-modeller, 726+ komponenter
- Next.js App Router + Supabase + Tailwind CSS v4 + shadcn/ui
- CBAC-basert tilgangsstyring (Capability-Based Access Control)
- Signal/Skill/Agent-system for coaching-intelligens

## Neste steg
Sprint 0: Konsolidering av designsystem og fundament
Sprint 1: Treningsplan-rebuild + Live Session
Sprint 2: CoachHQ 360-profil + Daglig Brief
