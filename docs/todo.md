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

## 🔧 Kjente tekniske rester (ikke haster)

- [x] **Vercel-deploy gjort 2026-06-01** — manuell `vercel --prod --yes` deployet Fase 0+1+2 til prod. Aliaset til **akgolf.no** (live, åpent, build grønn — 315 sider på 2m). Alle nøkkelruter svarer 200. Auto-deploy fra GitHub henger fortsatt → bruk manuell `vercel --prod` ved fremtidige releaser.
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
