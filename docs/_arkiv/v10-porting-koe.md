# v10-porting-kø — eksekveringsplan for alle plattform-skjermer

> Utkast 2026-06-02. HVORDAN-planen for å bygge alle skjermene mot v10-designet.
> Bygger på: `skjerm-manifest-playerhq.md` + `skjerm-manifest-agencyos.md` (innhold + knapp→destinasjon),
> `konsolidert-plan-2026-06-02.md` (IA/strategi D1–D5), og v10-designet i
> `public/design-handover/ak-design-system/` (visuell fasit). Metoden er bevist på Workbench (Bolk 1–3).

---

## Arbeidsmetode (per skjerm-bolk — uendret fra Workbench)

1. **Bygg FRA v10** — les v10-kilden (PlayerHQ/AgencyOS Prototype + skjerm-mappe) + matchende manifest-seksjon. Lag element-liste.
2. **Koble navigasjon** — hver knapp wires til destinasjonen i manifestets «knapp → destinasjon»-tabell. Ekte data/auth/Prisma beholdes.
3. **Screenshot** implementasjonen (Playwright, 1440px desktop / 430px der manifestet er mobil).
4. **Adversarial diff** — egen kritiker-agent mot v10 + manifest. Verifiser usikre funn mot kildekode/måling.
5. **Fiks til 0 reelle avvik**, så vis Anders.
6. **Isolert commit** (eksplisitte fil-stier, pga parallell sesjon på branchen) + push.

Bolk = ~3 skjermer (kvalitetsgrensen). tsc + eslint + build grønt per bolk.

---

## Prioritert kø — Fase 0 (lansering)

Rekkefølge er avhengighetsdrevet: delt kjerne først, så nøkkel-hjem, så flytene som henger på dem.

### Spor W — Workbench (delt planleggings-kjerne) · PÅGÅR
| Bolk | Skjermer | v10-kilde | Status |
|---|---|---|---|
| W1 | Skall + Kalender Uke/Dag | `Workbench.html` | ✓ ferdig |
| W2 | Kalender Kanban/Dashboard + coach-variant | `Workbench.html` | ✓ ferdig |
| W3 | Liste Tidslinje/Kanban/Dashboard | `workbench-dir-b.jsx` | bygges nå |
| W4 | Liste-coach + drill-modus-bro | `workbench-dir-b.jsx` + DayView | neste |
| W5 | **Innkobling:** koble Workbench på `/portal/planlegge/workbench` + `/admin/spillere/[id]/workbench` med ekte data; fjern de 3 gamle workbench-ene | — | neste |

### Spor P — PlayerHQ (`/portal`)
| Bolk | Skjermer | v10-kilde | Manifest |
|---|---|---|---|
| P1 | **Hjem/Oversikt** ★ (live-bar, hero, dagens program, AI-innsikt, ukas progresjon, snarveier) | `playerhq-app/hjem` | §1 |
| P2 | **Analysere-hub + SG-Hub** ★ (SG-Hub flyttes under Analyse per D1) | `analysere`, `mal-sg-runde` | §4 |
| P3 | SG klubb-detalj + Runder (+ shot-by-shot) + TrackMan | `mal-sg-runde`, `stats-trackman` | §4 |
| P4 | **Live-økt** (brief→active→logger→tapper→summary) ★ i scope (D5) | `gjennomfore` | §3 |
| P5 | Gjennomføre-hub + Kalender + Ny økt + Ønsket økt | `gjennomfore`, `idag-kalender` | §3 |
| P6 | Planlegge-hub + Årsplan + Teknisk plan + Fys-plan (eksponeres via Workbench) | `planlegge` | §2 |
| P7 | Drills + Mål + AI-verktøy + Utfordringer + Tester | `planlegge` | §2/§4 |
| P8 | Coach-hub + Meldinger + Coach-planer/øvelser/videoer | `coach-profil` | §5 |
| P9 | Meg (profil/abonnement/innstillinger/bookinger/helse) + Auth (login/signup/onboarding) | `auth`, `detaljer` | §6/§0 |
| P10 | **Booking** (åpen + forhåndsbetaling per D2) — hub + 5-stegs wizard + detaljer | `mal-sg-runde`/`detaljer` | §7 |

### Spor A — AgencyOS (`/admin`)
| Bolk | Skjermer | v10-kilde | Manifest |
|---|---|---|---|
| A1 | **Oversikt / cockpit** ★ (3-kolonne: fokus-spiller [manuell pin D3] · timeline · innboks; 4 business-KPIer) | `dashboard-innboks` | §1 |
| A2 | **Spillere** ★ + Spiller-detalj (DetailShell m/ Workbench-tab) — coach-inngang til delt kjerne | `stall-talent`, `detaljer` | §2 |
| A3 | Stall + Grupper + (Talent = bak flagg/ekskludert per konsolidert-plan) | `stall-talent` | §2 |
| A4 | **Turneringer** ★ (uke/måned/år, auto-populert) + **Fellesmelding-flyt** | `plan-booking` | §3 |
| A5 | Planlegge: Plans + Templates + Drills + Teknisk plan | `planlegge-gjennomfore` | §3 |
| A6 | Gjennomføre: Kalender + Bookinger + Anlegg/Services + **Live-coach** (brief/active/summary) | `planlegge-gjennomfore` | §4 |
| A7 | Innsikt: Analyse + Godkjenninger + Forespørsler + Finance + Rapporter | `analysere-admin`, `talent-analyse` | §5 |
| A8 | Admin: Organisasjon + Settings + Team + E-postmaler + Agents + Audit-log | `detaljer` | §6 |

---

## Fase 1 (etter lansering)
- Aktiver hybrid AI-lag i fokus-spiller (når AI-forslag er «perfeksjonert»).
- Egen statistikk-innlegging + ekstern import → vises i Analyse-hub.
- Flett parkerte branches (self-service plan, SG-overvåking, vault-kunnskap) per konsolidert-plan Del 7.

## Fase 2 — Elite (egne datamodeller, `skjerm-manifest-elite-fase2.md`)
- Dispersjon (oversikt + sikte-planlegger + game plan) → Video → Mental. Rekkefølge per D4.

---

## Koordinering (kritisk)
En **parallell Claude-sesjon** jobber på `feat/fase0-design-port` samtidig (reorganisering, MVP-audit, planlegging). For å unngå git-race og dobbeltarbeid:
- **Avtal eierskap per spor** — f.eks. én sesjon tar Spor P, en annen Spor A. Ikke to sesjoner på samme skjerm-mappe.
- Isolerte commits med eksplisitte fil-stier (bevist mønster).
- Synk via denne køen — kryss av bolker etter hvert.

## Estimat
~18 bolker for Fase 0 (W4–W5 + P1–P10 + A1–A8), ~3 skjermer hver. Nøkkel-/★-skjermer prioriteres først innen hvert spor.

## Verifikasjon per bolk
`npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build` grønt · RLS på nye tabeller i samme migrasjon · design-gate (0 reelle avvik mot v10) · navigasjon testet mot manifestets knapp→destinasjon.
