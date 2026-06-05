# AgencyOS — fresh prototype i Claude Design (slank versjon)

> Nytt prosjekt i Claude Design. **Last inn AK Golf HQ Design System som design system** (se `ak-design-system.md`).
> Fest som vedlegg: de eksisterende AgencyOS-skjermbildene (visuell fasit) + `agencyos-godkjent-2026-06-05.md`.
> Lim så inn hele blokken under.

---

## OPPDRAG

Bygg **AgencyOS** — coachens kontrolltårn i AK Golf HQ — som én sammenhengende, klikkbar prototype.
Dette er en **slank nybygging**, ikke en kopi av den gamle appen: færrest mulig skjermer, alt overflødig
slått sammen, og **Spiller-Workbench som master for all planlegging**. Følg designsystemet som er lastet inn,
og bruk de opplastede skjermbildene som fasit for utseende/datatetthet.

## HVA AGENCYOS ER

Coachens spørsmål er «hvem trenger MEG i dag?». **Data-tett, desktop-først, alltid MØRKT tema (.dark).**
Navne-kanon: spiller = **Markus Berg**, coach = **Anders Kristiansen** (alltid fulle navn).
All UI-tekst på norsk bokmål med æ, ø, å. Kun Lucide-ikoner. Ingen emoji.

## STRUKTUR (6 seksjoner — venstre sidebar)

**Oversikt (Cockpit) · Stall · Planlegge · Gjennomføre · Innsikt · Admin.**

Topbar (fast på ALLE skjermer): **spiller↔gruppe-veksler** (bytt mellom én spiller og en gruppe, med søk +
«nylig sett» + hurtigtaster) og **hurtigsøk (⌘K)**.

## KJERNEPRINSIPP — Spiller-Workbench er master

Klikk på et spillernavn HVOR SOM HELST (Stall, Cockpit-fokus, topbar-veksler, godkjenning) → **rett inn i den
spillerens Workbench**. Ingen profil-mellomside. Workbench er master for ALT: årsplan/periodisering,
treningsplan, fysplan, mål, økt-planlegging, tildele drill/test. «Ny målsetning» lages KUN her.
Plan-maler og Drill-bibliotek er byggeklosser som brukes INN i Workbench.

## SKJERMENE (og hva som slås sammen)

**Oversikt:**
- **Cockpit** — dagens timeline, innboks-teller, stall-KPI, og fokus-spiller-panel: (a) manuelt **pinnet** spiller
  øverst + (b) **3 AI-forslag** (haster=rød / ubesvart=blå / frafall-fare=gul) med kontekst-knapper inn i Workbench.
- **Min uke** — coachens oppgaver + tildelt meg.

**Stall:**
- **Spillere** (tabell, status-prikk, SG-trend) · **Grupper** · **Talent-radar** · **Sammenligning** · **WAGR-import**.
- Spiller-klikk → Workbench (master).

**Planlegge:**
- **Treningsplaner** (oversikt over aktive planer) · **Plan-maler** (bibliotek) · **Drill-bibliotek** (bibliotek).
- INGEN «Ny plan»- eller «Ny økt»-wizard — den handlingen bor i Workbench.

**Gjennomføre (drift):**
- **Kalender** · **Bookinger** (ny-booking som wizard er ok) · **Anlegg** · **Tilgjengelighet** · **Tjenester**.

**Innsikt:**
- **Stall-analyse** · **Lag-snitt** · **Tester** · **Forespørsler** · **Godkjenninger** · **Rapporter**.

**Admin:**
- **Organisasjon** · **Innstillinger** · **Audit-logg** · **Økonomi**.

**Turneringer** (under Planlegge eller egen inngang): oversikt + **Fellesmelding-flyt** (NY):
velg turnering → deltakere (alle påmeldte forhåndshuket, foreldre for juniorer auto-varsles) → skriv med
ferdigblokker (Baneinfo / Tips / Lykke til / Tee-tider / Vær) + AI-knapp → velg kanaler (push/e-post/SMS) →
send → bekreftelse («n/n levert»).

## SLÅ SAMMEN (ikke lag duplikater)

Én av hver: dashboard (ikke board/queue-varianter) · én kalender · én innboks (forespørsler) · én spiller-liste ·
én analyse-flate · én økonomi. Bruk navnet **AgencyOS** overalt — aldri «CoachHQ».

## TRE NYE FLYTER (bygg disse — finnes ikke ferdig i gammel app)

1. **Fokus-spiller: pin + 3 AI-forslag** på Cockpit.
2. **Fellesmelding** fra en turnering (hele send-flyten).
3. **Spiller↔gruppe-veksler** fast i topbar på alle skjermer.

## LEVERANSE

Én klikkbar prototype der navigasjonen faktisk fungerer (hver knapp peker riktig). Mørkt tema gjennomgående.
Mangler du noe, list det under «Åpne spørsmål» — ikke dikt opp funksjonalitet som ikke er beskrevet her.
```
