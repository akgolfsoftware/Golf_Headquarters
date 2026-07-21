# IA-fasit (versjonert) — AgencyOS + PlayerHQ

> **Hva dette er:** Den ene, gjeldende informasjonsarkitekturen (IA) for begge apper. Design (Claude Design)
> og kode bygger mot denne. **Versjonert, ikke låst** — den er ment å endres. Når Anders endrer struktur,
> oppdateres dette dokumentet, og design + kode følger den nye versjonen.
>
> **Hvorfor ett dokument:** uten én felles kilde driver design og kode fra hverandre. Dette er kilden.
> Detaljer per skjerm/funksjon: `funksjonskart-agencyos.md` + `funksjonskart-playerhq.md`.

**Versjon 1 — 2026-06-30.** Endringslogg nederst.

---

## AgencyOS (trener) — 13 huber

Mørkt tema. En **COACH** ser ~8 huber; en **ADMIN** (Anders) ser alle 13.

| # | Hub | Kort jobb | Rolle |
|---|---|---|---|
| 1 | **Cockpit** | Start dagen — hva skjer, hva haster | alle |
| 2 | **Stall** | Oversikt over alle spillere/grupper | alle |
| 3 | **Spiller 360** | Alt om én spiller | alle |
| 4 | **Workbench** | Bygg trening (bibliotek + plan) | alle |
| 5 | **Drift** | Kalender, booking, anlegg, live | alle |
| 6 | **Innsikt** | Analyse, SG, tester, runder | alle |
| 7 | **Innboks** | Alt som venter på svar | alle |
| 8 | **Turneringer** | Påmelding, resultater | alle |
| 9 | **Talent** | Toppidrett, scouting, WAGR | alle |
| 10 | **Økonomi** | MRR, fakturaer, betaling | ADMIN/finans |
| 11 | **AI-senter** | Caddie, agenter, brief, opptak | mest ADMIN |
| 12 | **Arbeidsflyt** | Oppgaver, prosjekter, Notion | mest ADMIN |
| 13 | **Oppsett** | Org, team, integrasjoner, sikkerhet | ADMIN |

### De 5 bindende reglene (avgjort 2026-06-30)
1. **Cockpit = se / Innboks = gjøre.** Cockpit viser og peker videre; alt som krever handling bor i Innboks (én kø med typefiltre: Melding · Forespørsel · Godkjenning · Varsel).
2. **Stall = én liste med briller.** Roster/risiko/kø/grupper er visnings-bytter på samme spillerliste, ikke separate skjermer.
3. **Workbench = bibliotek + plan-fra-spiller.** Maler/driller/standardøkter = stall-felles bibliotek i Workbench; spiller-planen åpnes fra Spiller 360.
4. **Rolle-filtrert IA.** COACH ser ~8 huber, ADMIN alle 13. Skjul ADMIN-huber for COACH.
5. **Mobil = 5 + Mer.** Bunnbar: Cockpit · Stall · Workbench · Innboks · Mer (resten under «Mer», matcher `/admin/mer`).

### Dev-/intern-verktøy ut av hoved-IA
`godkjenn-portal`, `tilstander`, `stats/moderering` er ikke trener-funksjoner — egen `/admin/dev`-krok, ikke i hub-navet.

---

## PlayerHQ (spiller) — 5 faner + 4 sidespor

Lyst tema. Mobil-først, 5-fane bunnbar (låst tidligere).

| Fane (bunnbar) | Kort jobb |
|---|---|
| **Hjem ★** | Hva skal JEG gjøre i dag (+ motivasjon: streak/milepæler/feiring) |
| **Planlegge ★** | Min trening — Workbench (plan/periodisering/teknisk/fys/mål) |
| **Gjennomføre ★** | Dagens økt, kalender, booking, live-økt, logg |
| **Analysere ★** | SG-Hub, runder, TrackMan, tester, statistikk (faner) |
| **Meg ★** | Profil, abonnement, helse, innstillinger, utstyrsbag |

| Sidespor (ikke i bunnbar) | Innhold |
|---|---|
| **Coach** | Meldinger + spørsmål (slått sammen) + Coach-AI |
| **Booking** | Book coach/anlegg, mine bookinger |
| **Talent** (utsatt) | Min plan/nivå/roadmap/sammenligning (Elite Fase 2) |
| **Varsler** (global bjelle) | Varslingsliste |

### Bindende regler PlayerHQ
1. **Analyse = én flate med faner** (SG · Runder · TrackMan · Tester · Statistikk) — ikke spredte adresser.
2. **All planlegging i Workbench** (zoom årsplan→dag) — ett trykkpunkt fra Planlegge.
3. **Motivasjon bor på Hjem** — streak/milepæler/feiring løftes opp, ikke gjemt i undersider.
4. **Undersider bruker global PortalShell-topbar** (hamburger + PLAYERHQ).
5. PlayerHQ er **alltid lyst** — aldri lime-på-lys flate.

---

## Dubletter som skal ryddes (utsatt til samtidig økt er ferdig)
**AgencyOS:** `calendar↔kalender`, `finance↔okonomi`, `messages↔innboks`, `approvals↔godkjenninger`, `plans/templates↔plan-templates` (sistnevnte er kryss-koblet — krever bevisst refaktor, ikke trygg redirect).
**PlayerHQ:** `analyse↔analysere`, `stats↔statistikk`, `tren/ovelser↔drills`, `tren/kalender↔kalender`, `trackman/[id]↔mal/trackman/[id]`, `statistikk/runder↔mal/runder`. «IKKE i MASTER»-ruter (baneguide, coach/sg-hub, coach/sporsmal) adopteres bevisst eller fjernes.

---

## Endringslogg
- **v1 (2026-06-30):** Første versjon. AgencyOS 13 huber + 5 regler; PlayerHQ 5 faner + 4 sidespor + 5 regler. Avledet fra `funksjonskart-*.md` + låste beslutninger i CLAUDE.md.
