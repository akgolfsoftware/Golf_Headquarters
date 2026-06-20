# KONFLIKTER.md — Design vs kode

Opprettet Phase 0. Alt her er avvik mellom det BYGGEORDRE/designet beskriver og det som
finnes i koden. **Regel:** Datastruktur/enums/rute-segmenter → koden vinner. Visuelt/layout/
tekst/flyt/knapp-destinasjon → designet vinner. Workbench → spør Anders ved kollisjon.

Kolonnene: **Alvorlighet** (Blokkerende / Høy / Lav) · **Beslutning** (Kode / Design / Anders).

---

## K-01 · PlayerHQ nav-etiketter (Lav · Design)

| | Nå | BYGGEORDRE |
|---|---|---|
| Fane 2 | «Planlegge» (`/portal/planlegge`) | «Plan» |
| Fane 3 | «Gjennomføre» (`/portal/gjennomfore`) | «Gjør» |

**Ruter/hrefs er uendret.** Kun visningsnavnet forkortes.
**Fil:** `src/components/portal/bottom-nav.tsx` linje 23–24.
**Beslutning:** Fikses i Fase 2 (skall-rigg).

---

## K-02 · To plan-templates-rutetrær (Høy · Anders)

`/admin/plans/templates/*` og `/admin/plan-templates/*` eksisterer begge med
identisk funksjonalitet (rediger, effectiveness, ny). BYGGEORDRE nevner
`/admin/plan-templates` som kanonisk rute.

**Spørsmål til Anders:** Hvilken er riktig? Den andre bør bli permanentRedirect.
**Fil:** `src/app/admin/plans/templates/` og `src/app/admin/plan-templates/`.

---

## K-03 · Tier.ELITE i Prisma (Lav · Kode)

`enum Tier { GRATIS PRO ELITE }` — ELITE er et dødt enum. Kan ikke slettes uten
migrasjon. CLAUDE.md sier «vis aldri i UI».
**Beslutning:** Koden vinner (enum beholdes teknisk), UI skjuler alltid ELITE.
Ingen konflikter med design.

---

## K-04 · NgfKategori A–L (12 nivåer) avventer grenser (Lav · Anders)

Schema har `NgfKategori A B C D E F G H I J K L` (12).
CLAUDE.md sier A–K skal bli 11 snittscore-bånd — grensene ikke låst ennå.
**Beslutning:** Ikke rør enum-definisjon. Kode-logikk for bandene implementeres
når Anders gir de 11 grensene. Ingen design-implikasjoner nå.

---

## K-05 · To live-session-systemer (Lav · Kode)

Spor A (`TrainingPlanSession`, `/portal/(fullscreen)/live/*`) er deaktivert —
alle ruter redirecter til `/portal/meg/abonnement` eller `/portal/planlegge`.
Spor B (`TrainingSessionV2`, `/admin/live/[sessionId]/*`) er aktiv og levende.

BYGGEORDRE refererer «Live-okt v2» (Fase 3.6) og «Live-okt coach» (Fase 4.6).
**Beslutning:** Spor A-sidene bygges visuelt fra «Live-okt v2»-referansen men
beholder midlertidige redirects til auth-gate er klar. Ingen strukturell endring.

---

## K-06 · Tre nav-implementasjoner, kun én aktiv (Lav · Kode)

Tre bottom-nav-komponenter:
1. `src/components/portal/bottom-nav.tsx` — **aktiv** (brukt av PortalShell)
2. `src/components/shared/mobile-bottom-nav.tsx` — ikke koblet til portalshell
3. `src/components/athletic/shell/bottom-nav.tsx` — alternativ implementasjon

**Beslutning:** Kilde 1 er kanonisk. 2 og 3 er til gjenbruk i andre kontekster
eller til sletting. Fase 2 (skall-rigg) oppdaterer kun kilde 1.

---

## K-07 · /portal/kalender vs /portal/tren/kalender (Høy · Anders)

Begge finnes som `page.tsx`. BYGGEORDRE nevner «ukekalender» under Plan-klyngen
uten å låse seg til nøyaktig rute.

**Spørsmål til Anders:** Er `/portal/kalender` kanonisk (og `/portal/tren/kalender`
en gammel rute som bør redirectes), eller omvendt?

---

## K-08 · /portal/tren/ovelser vs /portal/coach/ovelser (Lav · Anders)

Begge eksisterer. `src/app/portal/tren/ovelser/page.tsx` er permanent-redirect
(grep viser tomt mål). `src/app/portal/coach/ovelser/page.tsx` er aktiv.
**Sannsynlig beslutning:** `/portal/tren/ovelser` redirectes → `/portal/drills`
eller `/portal/coach/ovelser`. Bekreftes mot skjermkart ved design-login.

---

## K-09 · /admin/anlegg vs /admin/locations + /admin/facilities (Høy · Anders)

Tre rutetrær for lokasjoner:
- `/admin/anlegg/[id]` (page.tsx finnes)
- `/admin/locations` (page.tsx finnes)
- `/admin/facilities/[id]` (page.tsx finnes)

BYGGEORDRE nevner `locations`+`facilities`+`services` som én klynge (Fase 4.5).
**Spørsmål til Anders:** Skal `/admin/anlegg` bli permanentRedirect → `/admin/locations`?

---

## K-10 · /(internal)/demos/* (Lav · Kode)

6 demo-ruter under `/(internal)/demos/`. Disse er utvikler-verktøy, ikke produkt.
**Beslutning:** Beholder dem (ikke synlig i nav, ingen prod-lenker). Ignorer i SKJERM-STATUS.

---

## K-11 · Workbench: delt kjerne PlayerHQ + AgencyOS (Blokkerende · Anders)

CLAUDE.md: «Workbench: kun visuell skinn — spør ved kollisjon».
`WorkbenchHybrid`-komponenten (`src/components/workbench-hybrid`) deles av
`/portal/planlegge` og (sannsynligvis) `/admin/coach-workbench`.

**Regel:** Aldri endre Workbench-datastruktur eller -logikk uten Anders' godkjenning.
Fase 3.5 og 4.3 berører dette. Flagg separat konfliktsak per endring.

---

## Åpne spørsmål (send til Anders)

1. **K-02:** Hvilket plan-templates-rutetrær er kanonisk? (`/admin/plans/templates/` eller `/admin/plan-templates/`)
2. **K-07:** Hvilken kalender-rute er kanonisk for PlayerHQ? (`/portal/kalender` eller `/portal/tren/kalender`)
3. **K-09:** Skal `/admin/anlegg` bli redirect → `/admin/locations`?
