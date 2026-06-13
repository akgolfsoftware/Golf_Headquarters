# TODO — AK Golf HQ

Levende to-do for gjenstående arbeid. Sist oppdatert: 2026-06-01.

---

## ⏸️ Venter (bevisst utsatt)

### Elite Fase 2 — VENTER (besluttet 2026-06-01)
Disse skal **ikke** bygges nå. Krever design i Claude Design først.

- [ ] **Video-analyse** (4 skjermer) — bibliotek, analyse, sammenlign, coach-versjon
  - Mangler design — må tegnes i Claude Design først.
  - Ruter: `/portal/analysere/video` + `/admin/spillere/[id]/video`
  - Nye datamodeller: `VideoAnnotation`, `VideoComparison`
- [ ] **Mental** (5 skjermer) — hub, rutine, dagbok, vurdering, pressure
  - Mangler design — må tegnes i Claude Design først.
  - Ruter: `/portal/mental` + coach-innsyn `/admin/spillere/[id]/mental`
  - Nye datamodeller: `MentalLog`, `RoutineLog`, `MentalAssessment`

### Elite Fase 2 — Dispersjon (klar å bygge, men venter med resten)
- [ ] **Dispersjon-motor** (3 skjermer) — oversikt, sikte-planlegger, game-plan
  - Har design i zip (`DispersionTool.html`, `Utslag-spredning.html`, `components-trackman-dispersion.html`).
  - Krever ny Prisma-modell: `DispersionProfile`, `AimStrategy` (utledes fra TrackMan-data via cron).
  - Tas sammen med resten av Elite Fase 2 når video + mental er designet.

Full spec: [docs/skjerm-manifest-elite-fase2.md](skjerm-manifest-elite-fase2.md)

---

## 🧹 Del 1 strukturrydding (2026-06-01)

- [x] **Oppgave 1 — to-URL:** dokumentert akgolf.no som eneste prod-URL + auto-deploy-dashboard-instruks (se over).
- [x] **Oppgave 2 — demo-ruter:** IKKE slettet. Viste seg å være en bevisst demo/screenshot-suite (`/demo`-indeks + `proxy.ts`-bypass + `robots.ts`-disallow + coach-preview screenshot-rute), ikke død kode. Lav verdi/risiko å fjerne. Lar stå.
- [x] **Oppgave 3 — mock-sveip:** `audit-log` koblet til ekte `AuditLog` (16 rader) + tomstate. De fleste andre «mock»-treff var allerede ekte Prisma m/ merket dev-fallback (workspace, trackman, approvals).
- [ ] **Gjenstående mock (lav prio, coach-side):** `caddie/caddie-page-shell.tsx` (MOCK_CONVERSATIONS — ekte `/api/caddie/*` finnes, koble senere) · `talent/roadmap` DEMO_FASER (disclosed scaffold bak pre-beta-stripe — fase-modell finnes ikke i DB ennå).

## 🔧 Kjente tekniske rester (ikke haster)

- [x] **Vercel-deploy gjort 2026-06-01** — manuell `vercel --prod --yes` deployet Fase 0+1+2 til prod. Aliaset til **akgolf.no** (live, åpent, build grønn — 315 sider på 2m). Alle nøkkelruter svarer 200.
- ⚠️ **PROD-URL: bruk KUN `akgolf.no`.** Prosjektet har 5 domener; de tre `*.vercel.app`-domenene (inkl. `akgolf-hq-akgolfgroup-netizen-…vercel.app`) er SSO-beskyttet og forvirrende. `akgolf.no` er åpen og peker alltid på siste deploy. Anders så «gamle sider» fordi han brukte en vercel.app-URL.
- [ ] **Auto-deploy henger (Diagnose 2026-06-01):** git ER koblet (alle deploys har GitHub-commit-metadata), men push trigger ikke lenger auto-deploy — siste ~10 deploys er manuelle (`actor: claude-code`). Ikke i `vercel.json` (kun crons der). Årsak ligger i Vercel-dashboard. **Fiks (Anders, ~2 min):** vercel.com → akgolf-hq → Settings → Git → sjekk at «Automatic deployments» er PÅ + at production-branch = `main`; hvis «Ignored Build Step» er satt, fjern den. Inntil da: deploy manuelt med `vercel --prod --yes`.
- [ ] **google-calendar `invalid_grant`** under build (freebusy for ~10 kalendere) — utløpt OAuth-token i build-miljø. Ikke kritisk (build fullfører), men coach-kalender-freebusy feiler til token fornyes. Lav prio.
- [ ] **`/stats/sammenlign-spillere`** gir 500 (stats-prototype med fake-data) — skjul i prod som de andre stats-prototypene, eller fiks.
- [ ] **Gamle skyggede sider** (locations, facilities, analyse, statistikk, kalender, mal m.fl.) — redirecter til nye sider, men `page.tsx` ligger igjen og deler kode med aktive sider. Krever forsiktig refactor (flytt delt kode → oppdater imports → slett), ikke ren sletting. Lavt prioritert — usynlig for brukere.

---

## ✅ Ferdig (denne runden, 2026-06-01)

- **Fase 0 — audit:** klassifisert resterende skjermer (91 på-brand, 15 redesign, 48 stub). Se [audit-resterende-2026-06-01.md](audit-resterende-2026-06-01.md).
- **Fase 1 — komplett (45 skjermer):** PlayerHQ (19) + AgencyOS (26) til athletic-DNA via 10 parallelle agenter. Fant + fikset ekte bugs: døde lenker (/admin/elever, /admin/bookings/ny), fabrikerte tall (kohort, video-markører, caddie-data, MRR-placeholder) → ekte Prisma/tomstate, priskorr 249→300, slettet 10 foreldreløse filer. tsc 0 / eslint 0 / pushet.
- **Plan for gjenstående:** [plan-gjenstaende-2026-06-01.md](plan-gjenstaende-2026-06-01.md) — Fase 2 (foreldre+auth) + stats/marketing-beslutning + Elite.
- 40 skjermer portet fra Claude Design-handover (PlayerHQ + AgencyOS + auth + øvrig) — alle 8 design-runder
- Godkjennings-galleri: https://akgolf-skjermer.vercel.app (44 screenshots)
- IA-redirect-loops fjernet (tester/booking/aarsplan synlige) + compliance flyttet
- Schema-bug fikset (imageUrl/muscleGroups @map) — drill/live ga 500
- 5 døde komponent-filer ryddet
